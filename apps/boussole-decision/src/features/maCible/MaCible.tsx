"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";
import { lireAncre, type AncreLue } from "@/domain/maCible/ancre";
import { validerEntree, type ErreurChamp } from "@/domain/maCible/entree";
import type { FournisseurNotes } from "@/domain/maCible/fournisseurNotes";
import type { AutrePiste, Cible, Corrections, Demande, NoteTerrain, SyntheseTerrain } from "@/domain/maCible/types";
import { useI18n } from "@/i18n/client";
import { appelerApi, preparerAccesTest } from "./api";
import type { LectureNotes } from "./NotesTerrain";
import { Attente, type ErreurAppel } from "./Attente";
import { AvertissementIA, EncartConfidentialiteReplie } from "./Confidentialite";
import { PastilleIcone, type Teinte } from "./Habillage";
import type { NomIcone } from "./Icones";
import { EtapeEsquisse } from "./EtapeEsquisse";
import { EtapeQuestions } from "./EtapeQuestions";
import { EtapeTalent } from "./EtapeTalent";
import { EtapeTerrain } from "./EtapeTerrain";
import { Resultat, type AppelApprofondi, type Approfondir } from "./Resultat";
import { etatInitial, langueEntree, prochainIdPiste, reducteur, travailExiste, type Etape, type EtapeBarre } from "./etat";
import { SANS_REESSAI, messageApi } from "./erreurs";
import { IndicateurEtapes } from "./IndicateurEtapes";
import { DemanderAvis } from "@/features/intention/DemanderAvis";
import { archiverCourant, ecrireHistorique, effacerHistorique, identifiantHistorique, lireHistorique, reprendreDansHistorique, type EntreeHistorique } from "./historique";
import { methodeAlignee } from "./methode";
import { URL_OUTILS, URL_QCM } from "./liens";
import { effacer, ecrire, lire } from "./stockage";

type DemandeParcours = Extract<Demande, { etape: "cadrage" | "resultat" }>;

interface Attendre {
  type: "cadrage" | "resultat";
  demande: DemandeParcours;
  erreur: ErreurAppel | null;
}

export function MaCible({
  fournisseur,
  fournisseurNotes,
  maxSynthese,
  maxApprofondir,
}: {
  fournisseur: string;
  fournisseurNotes: FournisseurNotes;
  maxSynthese: number;
  maxApprofondir: number;
}) {
  const { locale, t, m } = useI18n();
  const M = t.maCible;
  const methode = methodeAlignee(M, m);
  const [etat, dispatch] = useReducer(reducteur, undefined, () => etatInitial(locale));
  const [pret, setPret] = useState(false);
  const [ancre, setAncre] = useState<AncreLue | null>(null);
  const [attente, setAttente] = useState<Attendre | null>(null);
  const [horsSujet, setHorsSujet] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<ErreurChamp[]>([]);
  const [historique, setHistorique] = useState<EntreeHistorique[]>([]);
  const [vue, setVue] = useState<null | { type: "liste" } | { type: "lecture"; entree: EntreeHistorique }>(null);
  const [appelEnCours, setAppelEnCours] = useState<null | "synthese" | AppelApprofondi>(null);
  const [erreurApprofondir, setErreurApprofondir] = useState<{ cle: string; message: string; reessai: boolean } | null>(null);
  const [nouveau, setNouveau] = useState<string | null>(null);
  const controleur = useRef<AbortController | null>(null);
  const premier = useRef(true);

  // Au chargement : reprise du travail enregistré et lecture de l'ancre (jamais envoyée au serveur), puis ancre effacée de l'adresse.
  useEffect(() => {
    preparerAccesTest();
    const stocke = lire();
    const lue = lireAncre(window.location.hash);
    if (lue) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- lecture du stockage local, possible seulement après l'hydratation */
    setHistorique(lireHistorique());
    if (stocke && travailExiste(stocke)) {
      dispatch({ type: "charger", etat: stocke });
      if (lue) setAncre(lue);
    } else {
      if (stocke) dispatch({ type: "charger", etat: stocke });
      if (lue) dispatch({ type: "ancre", ancre: lue });
    }
    setPret(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => controleur.current?.abort();
  }, []);

  // Enregistrement à chaque changement.
  useEffect(() => {
    if (pret) ecrire({ ...etat, maj: new Date().toISOString() });
  }, [etat, pret]);

  // Changement d'étape : haut de page et focus sur le <h1>.
  useEffect(() => {
    if (!pret) return;
    if (premier.current) {
      premier.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.querySelector<HTMLElement>("[data-titre-etape]")?.focus();
  }, [etat.etape, pret]);

  async function lireNotes(notes: NoteTerrain[]): Promise<LectureNotes> {
    if (appelEnCours) return { ok: false, code: "inconnue" };
    setAppelEnCours("synthese");
    try {
      const r = await appelerApi({
        etape: "synthese",
        langue: langueEntree(locale),
        contexte: {
          mecanisme: etat.entree.talent.mecanisme,
          contexte: etat.entree.talent.contexte,
          benefice: etat.entree.talent.benefice,
          offre: etat.entree.terrain.offre,
        },
        notes,
      });
      if (!r.ok) return { ok: false, code: r.code, max: r.max };
      if (!("statut" in r)) return { ok: false, code: "inconnue" };
      if (r.statut === "ok" && r.synthese) {
        const synthese: SyntheseTerrain = { ...r.synthese, faitLe: new Date().toISOString() };
        dispatch({ type: "synthese", synthese });
        return { ok: true, statut: "ok", masques: r.masques };
      }
      return { ok: true, statut: "inutilisable", message: r.message, masques: r.masques };
    } finally {
      setAppelEnCours(null);
    }
  }

  const talentOuTerrain = (champs: "talent." | "terrain.") => {
    const v = validerEntree(etat.entree);
    return v.ok ? [] : v.erreurs.filter((e) => e.champ.startsWith(champs));
  };

  /** Message d'un échec d'approfondissement, affiché dans le bloc concerné (§16). */
  const erreurDe = (cle: string, code: Parameters<typeof messageApi>[0], max?: number) => ({
    cle,
    message: code === "quota_ip" ? M.notes.quotaApprofondir(max ?? maxApprofondir) : messageApi(code, M, max),
    reessai: !SANS_REESSAI.includes(code),
  });

  /** Entrée qui a produit le résultat affiché : c'est elle que l'IA approfondit. */
  const entreeResultat = () => ({ ...(etat.entreeDuResultat ?? etat.entree), langue: langueEntree(locale) });

  async function faireportrait(cible: Cible) {
    if (appelEnCours || !etat.resultat) return;
    const appel: AppelApprofondi = { mode: "portrait", id: cible.id };
    const cle = `portrait-${cible.id}`;
    setAppelEnCours(appel);
    setErreurApprofondir(null);
    try {
      const r = await appelerApi({
        etape: "approfondir",
        mode: "portrait",
        entree: entreeResultat(),
        offre: etat.resultat.offre.phrase.slice(0, 240),
        cible: {
          id: cible.id,
          nom: cible.nom,
          marche: cible.marche,
          portrait: cible.portrait,
          douleur: cible.douleur,
          ancrage: cible.ancrage,
          promesse: cible.promesse,
          lieux: cible.lieux.slice(0, 4).map((l) => l.type),
        },
      });
      if (!r.ok) return setErreurApprofondir(erreurDe(cle, r.code, r.max));
      if (!("portrait" in r) || "cible" in r) return setErreurApprofondir(erreurDe(cle, "inconnue"));
      dispatch({ type: "portrait", id: cible.id, portrait: r.portrait });
      setNouveau(cle);
    } finally {
      setAppelEnCours(null);
    }
  }

  async function creuserPiste(piste: AutrePiste) {
    if (appelEnCours || !etat.resultat) return;
    const idCible = prochainIdPiste(etat.extras);
    if (!idCible || etat.extras.pistes[piste.id]) return;
    const cle = `piste-${piste.id}`;
    setAppelEnCours({ mode: "piste", id: piste.id });
    setErreurApprofondir(null);
    try {
      const existantes = [
        ...etat.resultat.cibles.map((c) => c.nom),
        ...Object.values(etat.extras.pistes).flatMap((p) => (p ? [p.cible.nom] : [])),
      ].slice(0, 6);
      const r = await appelerApi({
        etape: "approfondir",
        mode: "piste",
        entree: entreeResultat(),
        offre: etat.resultat.offre.phrase.slice(0, 240),
        piste,
        idCible,
        ciblesExistantes: existantes,
      });
      if (!r.ok) return setErreurApprofondir(erreurDe(cle, r.code, r.max));
      if (!("cible" in r)) return setErreurApprofondir(erreurDe(cle, "inconnue"));
      // Le navigateur garde l'identifiant de la piste et le recolle à la réponse (§7.7).
      dispatch({ type: "piste", pisteId: piste.id, cible: r.cible, ligne: r.ligne, portrait: r.portrait });
      setNouveau(cle);
    } finally {
      setAppelEnCours(null);
    }
  }

  const approfondir: Approfondir = {
    appel: appelEnCours && appelEnCours !== "synthese" ? appelEnCours : null,
    occupe: appelEnCours !== null,
    erreur: erreurApprofondir,
    nouveau,
    max: maxApprofondir,
    onPortrait: faireportrait,
    onCreuser: creuserPiste,
  };

  async function lancer(demande: DemandeParcours) {
    const type = demande.etape;
    setHorsSujet(null);
    setAttente({ type, demande, erreur: null });
    controleur.current?.abort();
    const c = new AbortController();
    controleur.current = c;
    const r = await appelerApi(demande, c.signal);
    if (c.signal.aborted) return;
    if (!r.ok) {
      setAttente({ type, demande, erreur: { code: r.code, max: r.max } });
      return;
    }
    if ("cadrage" in r && demande.etape === "cadrage") {
      if (r.cadrage.statut === "hors_sujet") setHorsSujet(r.cadrage.message);
      dispatch({ type: "cadrage", tour: demande.tour, cadrage: r.cadrage });
    } else if ("resultat" in r) {
      if (etat.resultat) {
        const liste = archiverCourant(lireHistorique(), {
          id: identifiantHistorique(),
          faitLe: etat.resultatLe ?? new Date().toISOString(),
          entree: etat.entreeDuResultat ?? etat.entree,
          resultat: etat.resultat,
          coches: etat.coches,
          extras: etat.extras,
        });
        ecrireHistorique(liste);
        setHistorique(liste);
      }
      dispatch({ type: "resultat", resultat: r.resultat, maintenant: new Date().toISOString() });
    }
    setAttente(null);
  }

  const entreeEnvoyee = () => ({ ...etat.entree, langue: langueEntree(locale) });

  function continuerTalent() {
    const e = talentOuTerrain("talent.");
    setErreurs(e);
    if (e.length === 0) dispatch({ type: "aller", etape: "terrain" });
  }
  function continuerTerrain() {
    const e = talentOuTerrain("terrain.");
    setErreurs(e);
    if (e.length > 0) return;
    // Les erreurs du talent bloquent aussi : on renvoie la personne à l'étape 1.
    if (talentOuTerrain("talent.").length > 0) {
      setErreurs(talentOuTerrain("talent."));
      dispatch({ type: "aller", etape: "talent" });
      return;
    }
    lancer({ etape: "cadrage", tour: 1, entree: entreeEnvoyee() });
  }
  function continuerQuestions(reponses: { id: string; question: string; reponse: string }[]) {
    const tour = etat.tour;
    dispatch({ type: "reponses", tour, reponses });
    const entree = entreeEnvoyee();
    const ajoutees = reponses.map((r) => ({ id: `t${tour}-${r.id}`, question: r.question, reponse: r.reponse }));
    const ids = new Set(ajoutees.map((r) => r.id));
    lancer({ etape: "cadrage", tour: 2, entree: { ...entree, reponses: [...entree.reponses.filter((r) => !ids.has(r.id)), ...ajoutees] } });
  }
  function continuerEsquisse(corrections: Corrections) {
    if (!etat.cadrage) return;
    dispatch({ type: "corrections", corrections });
    lancer({ etape: "resultat", entree: entreeEnvoyee(), esquisse: etat.cadrage.esquisse, corrections });
  }
  function nouvelleEsquisse(corrections: Corrections) {
    if (!etat.cadrage) return;
    dispatch({ type: "corrections", corrections });
    lancer({ etape: "cadrage", tour: 3, entree: entreeEnvoyee(), esquissePrecedente: etat.cadrage.esquisse, corrections });
  }
  function aller(etape: Etape) {
    setErreurs([]);
    dispatch({ type: "aller", etape });
  }
  function toutEffacer(confirmation: string) {
    if (!window.confirm(confirmation)) return;
    effacer();
    effacerHistorique();
    setHistorique([]);
    setVue(null);
    setAncre(null);
    setAttente(null);
    setErreurs([]);
    dispatch({ type: "recommencer", locale });
  }
  function reprendre(choisi: EntreeHistorique) {
    const courant = etat.resultat
      ? {
          id: identifiantHistorique(),
          faitLe: etat.resultatLe ?? new Date().toISOString(),
          entree: etat.entreeDuResultat ?? etat.entree,
          resultat: etat.resultat,
          coches: etat.coches,
          extras: etat.extras,
        }
      : null;
    const liste = reprendreDansHistorique(lireHistorique(), choisi.id, courant);
    ecrireHistorique(liste);
    setHistorique(liste);
    dispatch({ type: "reprendre", entree: choisi.entree, resultat: choisi.resultat, faitLe: choisi.faitLe, coches: choisi.coches, extras: choisi.extras });
    setVue(null);
  }
  function supprimerHistorique(id: string) {
    const liste = lireHistorique().filter((e) => e.id !== id);
    ecrireHistorique(liste);
    setHistorique(liste);
    setVue({ type: "liste" });
  }
  const dateHistorique = (faitLe: string) =>
    new Date(faitLe).toLocaleDateString(M.commun.locale, { day: "numeric", month: "long", year: "numeric" });

  if (!pret) return <div className="mx-auto max-w-3xl" aria-busy="true" />;

  const etape = etat.etape;
  const accueilVisible = etape === "accueil" || ancre !== null;
  const ecranResultat = (etape === "resultat" && etat.resultat && !accueilVisible && !attente) || vue?.type === "lecture";
  const largeur = ecranResultat || vue?.type === "liste" ? "max-w-6xl" : "max-w-3xl";
  const avis = (ecran: string) => (
    <div className="pt-6 print:hidden">
      <DemanderAvis outil="cibleur" etape={ecran} />
    </div>
  );

  if (vue?.type === "liste") {
    return (
      <div className={`mx-auto ${largeur} space-y-6`}>
        <header className="space-y-3">
          <h1 tabIndex={-1} data-titre-etape className="text-4xl italic focus:outline-none sm:text-5xl">
            {M.resultat.historiqueTitre}
          </h1>
        </header>
        {historique.length === 0 ? (
          <p className="text-[17px] text-ink-soft">{M.resultat.historiqueVide}</p>
        ) : (
          <ul className="space-y-3">
            {historique.map((entree) => {
              const ligne = entree.resultat.classement.find((c) => c.rang === "prioritaire") ?? entree.resultat.classement[0];
              const cible = entree.resultat.cibles.find((c) => c.id === ligne?.id);
              return (
                <li key={entree.id}>
                  <button type="button" className="w-full rounded-2xl border border-line bg-paper p-4 text-left hover:bg-sand" onClick={() => setVue({ type: "lecture", entree })}>
                    <span className="block text-sm text-ink-soft">{dateHistorique(entree.faitLe)}</span>
                    <span className="mt-1 block text-[17px]">{entree.resultat.offre.phrase}</span>
                    {cible && ligne && (
                      <span className="mt-1 block text-[15px] text-ink-soft">
                        {M.resultat.ciblePrioritaire}{M.commun.dp}{cible.nom} · {M.resultat.score(ligne.score)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <Button type="button" variant="secondary" onClick={() => setVue(null)}>
          {M.commun.retour}
        </Button>
        {avis("historique")}
      </div>
    );
  }

  if (vue?.type === "lecture") {
    return (
      <div className={`mx-auto ${largeur}`}>
        <Resultat
          resultat={vue.entree.resultat}
          fait={vue.entree.faitLe}
          etat={etat}
          prenom={etat.prenom}
          coches={vue.entree.coches}
          locale={locale}
          M={M}
          nbHistorique={historique.length}
          synthese={vue.entree.entree.synthese}
          entree={vue.entree.entree}
          extras={vue.entree.extras}
          lecture
          bandeauLecture={M.resultat.bandeauDate(dateHistorique(vue.entree.faitLe))}
          onCoche={() => {}}
          onModifier={() => {}}
          onEffacer={() => {}}
          onAller={() => {}}
          onHistorique={() => setVue({ type: "liste" })}
          onReprendre={() => reprendre(vue.entree)}
          onSupprimer={() => supprimerHistorique(vue.entree.id)}
        />
        {avis("historique-resultat")}
      </div>
    );
  }

  // Écran 5 : il porte son propre <h1>.
  if (etape === "resultat" && etat.resultat && !accueilVisible && !attente) {
    return (
      <div className={`mx-auto ${largeur}`}>
        <Resultat
          resultat={etat.resultat}
          fait={etat.resultatLe ?? etat.maj}
          etat={etat}
          prenom={etat.prenom}
          coches={etat.coches}
          locale={locale}
          M={M}
          nbHistorique={historique.length}
          synthese={etat.entree.synthese}
          entree={etat.entreeDuResultat ?? etat.entree}
          extras={etat.extras}
          approfondir={approfondir}
          onCoche={(index) => dispatch({ type: "coche", index })}
          onModifier={() => aller("terrain")}
          onEffacer={() => toutEffacer(M.resultat.confirmEffacer)}
          onAller={(etapeSuivante) => aller(etapeSuivante)}
          onHistorique={() => setVue({ type: "liste" })}
        />
        {avis("resultat")}
      </div>
    );
  }

  if (accueilVisible) {
    const source = ancre?.source ?? etat.entree.source;
    const avecTravail = travailExiste(etat);
    return (
      <div className={`mx-auto ${largeur} space-y-6`}>
        {source && <Notice tone="success">{M.accueil.prerempli[source]}</Notice>}
        <header className="space-y-3">
          <p className="text-sm">
            <a className="text-link underline" href={URL_OUTILS}>
              {M.commun.tousLesOutils}
            </a>
          </p>
          <p className="font-script text-2xl text-accent-strong">{M.accueil.surtitre}</p>
          <p className="font-serif text-3xl italic text-ink sm:text-4xl">{M.commun.nomOutil}</p>
          <h1 tabIndex={-1} data-titre-etape className="text-4xl italic focus:outline-none sm:text-5xl">
            {M.commun.sousTitre}
          </h1>
          <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{M.accueil.intro}</p>
        </header>
        <section aria-labelledby="comment-titre" className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
          <h2 id="comment-titre" className="text-[22px] italic">
            {M.accueil.etapesTitre}
          </h2>
          <ol className="mt-4 space-y-3 text-[17px] leading-relaxed">
            {M.accueil.etapes.map((e, i) => {
              const pas = ETAPES_ACCUEIL[i % ETAPES_ACCUEIL.length];
              return (
                <li key={e} className="flex items-start gap-3">
                  <PastilleIcone nom={pas.icone} teinte={pas.teinte} taille="sm" />
                  <span className="pt-0.5">
                    <span className="sr-only">{i + 1}. </span>
                    {e}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="space-y-3">
          <p>
            <button type="button" className="min-h-11 text-link underline" onClick={() => setVue({ type: "liste" })}>
              {M.resultat.historiqueLien(historique.length)}
            </button>
          </p>
          {avecTravail ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => {
                  setAncre(null);
                  if (etat.etape === "accueil") aller("talent");
                }}
              >
                {M.accueil.reprendre}
              </Button>
              {ancre && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    dispatch({ type: "ancre", ancre });
                    setAncre(null);
                    aller("talent");
                  }}
                >
                  {M.accueil.remplacerParAncre}
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={() => toutEffacer(M.accueil.confirmRecommencer)}>
                {M.accueil.recommencer}
              </Button>
            </div>
          ) : (
            <Button type="button" className="max-sm:w-full" onClick={() => aller("talent")}>
              {M.accueil.commencer}
            </Button>
          )}
          {!source && !avecTravail && (
            <p className="text-[15px] text-ink-soft">
              {M.accueil.sansQcm}{" "}
              <a className="text-link underline" href={URL_QCM}>
                {M.accueil.lienQcm}
              </a>
            </p>
          )}
        </div>
        <EncartConfidentialiteReplie M={M} fournisseur={fournisseur} />
        <AvertissementIA M={M} />
        {avis("accueil")}
      </div>
    );
  }

  const titre = { talent: M.talent.titre, terrain: M.terrain.titre, questions: M.questions.titre, esquisse: M.esquisse.titre, resultat: M.resultat.titre }[etape as Exclude<Etape, "accueil">];
  const consigne = { talent: M.talent.consigne, terrain: M.terrain.consigne, questions: M.questions.consigne, esquisse: M.esquisse.consigne, resultat: "" }[etape as Exclude<Etape, "accueil">];

  return (
    <div className={`mx-auto ${largeur} space-y-6`}>
      {etat.resultat && (
        <div role="status" className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-blush p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[16px]">{etat.resultatPerime ? M.commun.change : M.commun.relis}</p>
          <Button type="button" variant="secondary" onClick={() => aller("resultat")}>
            {M.commun.revenirResultat}
          </Button>
        </div>
      )}
      <header className="space-y-3">
        <IndicateurEtapes etat={etat} M={M} onAller={(etapeSuivante: EtapeBarre) => aller(etapeSuivante)} />
        <h1 tabIndex={-1} data-titre-etape className="text-4xl italic focus:outline-none sm:text-5xl">
          {titre}
        </h1>
        {consigne && <p className="text-[17px] font-semibold text-ink">{consigne}</p>}
      </header>

      {attente ? (
        <Attente
          type={attente.type}
          erreur={attente.erreur}
          M={M}
          onReessayer={() => lancer(attente.demande)}
          onRetour={() => {
            controleur.current?.abort();
            setAttente(null);
          }}
        />
      ) : (
        <>
          {etape === "talent" && (
            <EtapeTalent
              talent={etat.entree.talent}
              erreurs={erreurs}
              M={M}
              m={methode}
              onChange={(patch) => dispatch({ type: "talent", patch })}
              onContinuer={continuerTalent}
            />
          )}
          {etape === "terrain" && (
            <EtapeTerrain
              terrain={etat.entree.terrain}
              prenom={etat.prenom}
              erreurs={erreurs}
              horsSujet={horsSujet}
              fournisseur={fournisseur}
              synthese={etat.entree.synthese}
              fournisseurNotes={fournisseurNotes}
              maxSynthese={maxSynthese}
              appelEnCours={appelEnCours !== null}
              M={M}
              onChange={(patch) => dispatch({ type: "terrain", patch })}
              onPrenom={(prenom) => dispatch({ type: "prenom", prenom })}
              onRetour={() => aller("talent")}
              onContinuer={continuerTerrain}
              onLireNotes={lireNotes}
              onRetirerVerbatim={(id) => dispatch({ type: "retirerVerbatim", id })}
              onEffacerSynthese={() => dispatch({ type: "synthese", synthese: null })}
            />
          )}
          {etape === "questions" && etat.cadrage?.statut !== "questions" && (
            <ul className="space-y-3">
              {etat.entree.reponses.map((r) => (
                <li key={r.id} className="rounded-xl border border-line bg-paper p-4">
                  <p className="font-medium">{r.question}</p>
                  <p className="mt-1 text-ink-soft">{r.reponse}</p>
                </li>
              ))}
            </ul>
          )}
          {etape === "questions" && etat.cadrage?.statut === "questions" && (
            <EtapeQuestions
              key={`questions-${etat.tour}`}
              questions={etat.cadrage.questions}
              tour={etat.tour}
              fournisseur={fournisseur}
              M={M}
              onRetour={() => aller("terrain")}
              onContinuer={continuerQuestions}
            />
          )}
          {etape === "esquisse" && etat.cadrage?.statut === "esquisse" && (
            <EtapeEsquisse
              key={`esquisse-${etat.tour}-${etat.cadrage.esquisse.offre}`}
              esquisse={etat.cadrage.esquisse}
              corrections={etat.corrections}
              nouvelleEsquisseFaite={etat.nouvelleEsquisseFaite}
              fournisseur={fournisseur}
              M={M}
              onRetour={() => aller("terrain")}
              onContinuer={continuerEsquisse}
              onNouvelleEsquisse={nouvelleEsquisse}
            />
          )}
        </>
      )}
      {avis(etape)}
    </div>
  );
}

/** Une icône et une couleur par étape de « Comment ça se passe » : talent, terrain, questions, esquisse, résultat. */
const ETAPES_ACCUEIL: readonly { icone: NomIcone; teinte: Teinte }[] = [
  { icone: "etoile", teinte: "lilas" },
  { icone: "epingle", teinte: "corail" },
  { icone: "bulle", teinte: "eau" },
  { icone: "stylo", teinte: "miel" },
  { icone: "cible", teinte: "framboise" },
];
