"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Button, Notice } from "@/components/ui";
import { lireAncre, type AncreLue } from "@/domain/maCible/ancre";
import { validerEntree, type ErreurChamp } from "@/domain/maCible/entree";
import type { Corrections, Demande } from "@/domain/maCible/types";
import { useI18n } from "@/i18n/client";
import { appelerApi } from "./api";
import { Attente, type ErreurAppel } from "./Attente";
import { AvertissementIA, EncartConfidentialite } from "./Confidentialite";
import { EtapeEsquisse } from "./EtapeEsquisse";
import { EtapeQuestions } from "./EtapeQuestions";
import { EtapeTalent } from "./EtapeTalent";
import { EtapeTerrain } from "./EtapeTerrain";
import { Resultat } from "./Resultat";
import { etatInitial, langueEntree, reducteur, travailExiste, type Etape } from "./etat";
import { IndicateurEtapes } from "./IndicateurEtapes";
import { URL_OUTILS, URL_QCM } from "./liens";
import { effacer, ecrire, lire } from "./stockage";

const NUMERO: Record<Exclude<Etape, "accueil">, number> = { talent: 1, terrain: 2, questions: 3, esquisse: 4, resultat: 5 };

interface Attendre {
  type: "cadrage" | "resultat";
  demande: Demande;
  erreur: ErreurAppel | null;
}

export function MaCible({ fournisseur }: { fournisseur: string }) {
  const { locale, t, m } = useI18n();
  const M = t.maCible;
  const [etat, dispatch] = useReducer(reducteur, undefined, () => etatInitial(locale));
  const [pret, setPret] = useState(false);
  const [ancre, setAncre] = useState<AncreLue | null>(null);
  const [attente, setAttente] = useState<Attendre | null>(null);
  const [horsSujet, setHorsSujet] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<ErreurChamp[]>([]);
  const controleur = useRef<AbortController | null>(null);
  const premier = useRef(true);

  // Au chargement : reprise du travail enregistré et lecture de l'ancre (jamais envoyée au serveur), puis ancre effacée de l'adresse.
  useEffect(() => {
    const stocke = lire();
    const lue = lireAncre(window.location.hash);
    if (lue) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- lecture du stockage local, possible seulement après l'hydratation */
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

  const talentOuTerrain = (champs: "talent." | "terrain.") => {
    const v = validerEntree(etat.entree);
    return v.ok ? [] : v.erreurs.filter((e) => e.champ.startsWith(champs));
  };

  async function lancer(demande: Demande) {
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
    setAncre(null);
    setAttente(null);
    setErreurs([]);
    dispatch({ type: "recommencer", locale });
  }

  if (!pret) return <div className="mx-auto max-w-3xl" aria-busy="true" />;

  const etape = etat.etape;
  const accueilVisible = etape === "accueil" || ancre !== null;
  const largeur = etape === "resultat" && !accueilVisible ? "max-w-4xl" : "max-w-3xl";

  // Écran 5 : il porte son propre <h1>.
  if (etape === "resultat" && etat.resultat && !accueilVisible && !attente) {
    return (
      <div className={`mx-auto ${largeur}`}>
        <Resultat
          resultat={etat.resultat}
          fait={etat.resultatLe ?? etat.maj}
          tour={etat.tour}
          prenom={etat.prenom}
          coches={etat.coches}
          locale={locale}
          M={M}
          onCoche={(index) => dispatch({ type: "coche", index })}
          onModifier={() => aller("terrain")}
          onEffacer={() => toutEffacer(M.resultat.confirmEffacer)}
        />
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
          <h1 tabIndex={-1} data-titre-etape className="text-4xl italic focus:outline-none sm:text-5xl">
            {M.accueil.titre}
          </h1>
          <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{M.accueil.intro}</p>
        </header>
        <section aria-labelledby="comment-titre" className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
          <h2 id="comment-titre" className="text-[22px] italic">
            {M.accueil.etapesTitre}
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[17px] leading-relaxed">
            {M.accueil.etapes.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ol>
        </section>
        <EncartConfidentialite M={M} fournisseur={fournisseur} />
        <AvertissementIA M={M} />
        <div className="space-y-3">
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
      </div>
    );
  }

  const n = NUMERO[etape as Exclude<Etape, "accueil">];
  const titre = { talent: M.talent.titre, terrain: M.terrain.titre, questions: M.questions.titre, esquisse: M.esquisse.titre, resultat: M.resultat.titre }[etape as Exclude<Etape, "accueil">];
  const consigne = { talent: M.talent.consigne, terrain: M.terrain.consigne, questions: M.questions.consigne, esquisse: M.esquisse.consigne, resultat: "" }[etape as Exclude<Etape, "accueil">];

  return (
    <div className={`mx-auto ${largeur} space-y-6`}>
      <header className="space-y-3">
        <IndicateurEtapes n={n} tour={etat.tour} M={M} boucle={n >= 4} />
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
              m={m}
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
              M={M}
              onChange={(patch) => dispatch({ type: "terrain", patch })}
              onPrenom={(prenom) => dispatch({ type: "prenom", prenom })}
              onRetour={() => aller("talent")}
              onContinuer={continuerTerrain}
            />
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
    </div>
  );
}
