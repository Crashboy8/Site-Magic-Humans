"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { totalQuetes, vueDeReprise, vuePrecedente, vueSuivante, type Vue } from "@/domain/parcours/flux";
import { bilanEtape, calculerPosition, construireResultat, etatsPrincipaux, pointsGagnes, questionnaire, raccourciPossible } from "@/domain/parcours/position";
import { PROFIL_VIDE, profilCommence, type Profil } from "@/domain/parcours/profil";
import type { ChoixVoie, ParcoursPublic, Reponse } from "@/domain/parcours/types";
import type { StatutCompte } from "@/features/espace/barre";
import { Icone } from "@/features/espace/Icones";
import { outilsPour } from "@/features/espace/outils";
import { signalerProgression } from "@/features/progression/signal";
import { useI18n } from "@/i18n/client";
import { textesParcours, type ParcoursMessages } from "@/i18n/messages/parcours";
import { effacerPositionAction, enregistrerPositionAction } from "./actions";
import { EcranFete, EcranQuete, pointsEcran } from "./EcranQuete";
import { EcranArgent, EcranParallele } from "./EcransQuestions";
import { EcranVoie } from "./EcranVoie";
import { DecorParcours } from "./Habillage";
import { Resultat, type Resume } from "./Resultat";
import { instantane } from "./instantane";
import { effacer, ecrire, ecrireInstantane, lire, serialiser } from "./stockage";

type VueApp = Vue | { type: "accueil" } | { type: "fete"; index: number; etapes: string[]; gain: number };

/** Où l'on garde les réponses : le navigateur toujours, le compte quand la table existe. */
export type Compte = "table" | "sans_table" | null;

function franchiesDe(data: ParcoursPublic, profil: Profil | null): Set<string> {
  const position = profil ? calculerPosition(data, profil) : null;
  if (!position) return new Set();
  const etats = [...etatsPrincipaux(position), ...(position.parallele?.etapes ?? [])];
  return new Set(etats.filter((e) => e.statut === "franchie").map((e) => e.id));
}

function resumeDe(data: ParcoursPublic, profil: Profil): Resume | null {
  const position = calculerPosition(data, profil);
  if (!position) return null;
  return { points: pointsGagnes(position), franchies: etatsPrincipaux(position).filter((e) => e.statut === "franchie").length };
}

function vueInitiale(data: ParcoursPublic, profil: Profil | null, variante: "page" | "panneau"): VueApp {
  if (!profil || !profilCommence(profil)) return variante === "panneau" ? { type: "accueil" } : { type: "voie" };
  const reprise = vueDeReprise(data, profil);
  // Dans Mon espace, un point pas terminé attend qu'on le reprenne : on n'ouvre pas une question d'office.
  return variante === "panneau" && reprise.type !== "resultat" ? { type: "accueil" } : reprise;
}

function AccueilPanneau({ T, enCours, onCommencer }: { T: ParcoursMessages; enCours: boolean; onCommencer: () => void }) {
  return (
    <section aria-labelledby="panneau-titre" className="oj-ciel relative overflow-hidden rounded-[28px] border border-line px-5 py-8 text-center sm:px-8">
      <h2 id="panneau-titre" data-titre-vue tabIndex={-1} className="font-serif text-[32px] italic leading-tight outline-none sm:text-[38px]">
        {T.espace.titre}
      </h2>
      <DecorParcours className="oj-flotte mx-auto mt-4 w-full max-w-md" />
      <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-ink">{T.espace.invitation}</p>
      <button
        type="button"
        onClick={onCommencer}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-8 text-[17px] font-semibold text-white shadow-[0_12px_28px_-14px_rgba(179,71,22,0.9)] transition hover:bg-accent-deep active:scale-[0.98] sm:w-auto"
      >
        {enCours ? T.espace.reprendre : T.espace.commencer}
        <Icone nom="fleche" className="h-5 w-5" />
      </button>
    </section>
  );
}

/**
 * « Où j'en suis ? » : même moteur pour la page publique (variante page) et pour Mon espace (variante panneau).
 * Les réponses sont gardées dans le navigateur ; avec un compte, aussi dans la table parcours_positions.
 */
export function OuJenSuis({
  data,
  variante,
  initial,
  majCompte,
  compte,
  statut,
  ficheDeposee,
}: {
  data: ParcoursPublic;
  variante: "page" | "panneau";
  /** La position lue dans le compte, ou null. */
  initial: Profil | null;
  /** Sa date de dernière modification : si cet appareil a plus récent, on garde celui de l'appareil. */
  majCompte: string | null;
  compte: Compte;
  /** Sans compte, en essai (session invitée) ou connecté : l'appel à garder son travail s'adapte. */
  statut: StatutCompte;
  /** Fiche Talent Unique déposée dans Mon espace : on propose le raccourci « ancien accompagné ». */
  ficheDeposee: boolean;
}) {
  const { locale, t } = useI18n();
  const T = textesParcours(locale);
  // Page publique : les outils sous le résultat, pour passer de l'un à l'autre. Dans Mon espace, ils sont à côté.
  const menu = useMemo(() => (variante === "page" ? { outils: outilsPour(t.espace.outils, locale), sections: t.espace.sections } : null), [variante, t.espace, locale]);
  const [profil, setProfil] = useState<Profil>(() => initial ?? { ...PROFIL_VIDE, raccourci: ficheDeposee });
  const [vue, setVue] = useState<VueApp>(() => vueInitiale(data, initial, variante));
  const [charge, setCharge] = useState(false);
  const [avant, setAvant] = useState<Resume | null>(null);
  const [dejaFranchies, setDejaFranchies] = useState<Set<string>>(() => franchiesDe(data, initial));
  const tableOk = useRef(compte === "table");
  const dernierEnvoi = useRef(JSON.stringify(initial ?? null));
  const conteneur = useRef<HTMLDivElement>(null);
  /** Vrai quand la personne vient de changer d'écran : on remonte et on donne le focus au titre (pas au chargement). */
  const focaliser = useRef(false);
  const hydrate = useRef(false);

  // Au chargement, une seule fois : sans position dans le compte, ou avec une position plus ancienne que celle
  // de cet appareil, on reprend celle de l'appareil (et l'enregistrement la range dans le compte).
  useEffect(() => {
    if (hydrate.current) return;
    hydrate.current = true;
    const local = lire(data);
    const plusRecent = local !== null && (!initial || (majCompte !== null && Date.parse(local.maj) > Date.parse(majCompte)));
    /* eslint-disable react-hooks/set-state-in-effect -- lecture du stockage local, possible seulement après l'hydratation */
    if (local && plusRecent && profilCommence(local.profil)) {
      setProfil(local.profil);
      setVue(vueInitiale(data, local.profil, variante));
      setDejaFranchies(franchiesDe(data, local.profil));
    }
    setCharge(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [data, initial, majCompte, variante]);

  // Enregistrement : tout de suite sur l'appareil, un peu après dans le compte.
  useEffect(() => {
    if (!charge) return;
    ecrire(profil);
    ecrireInstantane(instantane(data, profil));
    const json = JSON.stringify(profil);
    if (!tableOk.current || !profilCommence(profil) || json === dernierEnvoi.current) return;
    const minuterie = window.setTimeout(() => {
      dernierEnvoi.current = json;
      void enregistrerPositionAction(serialiser(profil)).then((issue) => {
        // Table pas encore créée : on reste sur le navigateur, sans rien afficher.
        if (issue === "absente") tableOk.current = false;
        if (issue === "erreur") dernierEnvoi.current = "";
        // Les points ont pu changer : le bloc « Ton aventure » de Mon espace relit la progression du compte.
        if (issue === "ok") signalerProgression();
      });
    }, 700);
    return () => window.clearTimeout(minuterie);
  }, [profil, charge, data]);

  // Changement d'écran demandé par la personne : haut du parcours et focus sur son titre.
  useEffect(() => {
    if (!focaliser.current) return;
    focaliser.current = false;
    const el = conteneur.current;
    if (!el) return;
    const reduit = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const haut = el.getBoundingClientRect().top + window.scrollY - 12;
    if (window.scrollY > haut) window.scrollTo({ top: Math.max(0, haut), behavior: reduit ? "auto" : "smooth" });
    el.querySelector<HTMLElement>("[data-titre-vue]")?.focus({ preventScroll: true });
  }, [vue]);

  const q = useMemo(() => questionnaire(data, profil), [data, profil]);
  const points = useMemo(() => {
    const position = calculerPosition(data, profil);
    return position ? pointsGagnes(position) : 0;
  }, [data, profil]);
  const resultat = useMemo(() => (vue.type === "resultat" ? construireResultat(data, profil) : null), [data, profil, vue.type]);

  const aller = (v: VueApp) => {
    focaliser.current = true;
    setVue(v);
  };
  const accueilOuVoie: VueApp = variante === "panneau" ? { type: "accueil" } : { type: "voie" };
  const retour = (depuis: Vue) => aller(vuePrecedente(data, profil, depuis) ?? accueilOuVoie);

  const choisirVoie = (voie: ChoixVoie | null, freelance: boolean) => setProfil((p) => ({ ...p, voie, freelance }));
  const repondre = (ids: string[], r: Reponse) => setProfil((p) => ({ ...p, reponses: { ...p.reponses, ...Object.fromEntries(ids.map((id) => [id, r])) } }));

  const validerEcran = (index: number) => {
    const ecran = q.ecrans[index];
    if (!ecran) return aller(vueDeReprise(data, profil));
    const nouvelles = ecran.etapes.filter((id) => !dejaFranchies.has(id) && bilanEtape(data, data.etapes[id], profil.reponses).atteinte);
    if (nouvelles.length === 0) return aller(vueSuivante(data, profil, { type: "ecran", index }));
    setDejaFranchies((s) => new Set([...s, ...nouvelles]));
    aller({ type: "fete", index, etapes: nouvelles, gain: pointsEcran(data, ecran, profil.reponses) });
  };

  const refaire = () => {
    setAvant(resumeDe(data, profil));
    setDejaFranchies(franchiesDe(data, profil));
    aller({ type: "voie" });
  };

  const toutEffacer = () => {
    if (!window.confirm(T.resultat.effacerConfirmer)) return;
    const vide = { ...PROFIL_VIDE, raccourci: ficheDeposee };
    effacer();
    setProfil(vide);
    setAvant(null);
    setDejaFranchies(new Set());
    if (tableOk.current) {
      dernierEnvoi.current = JSON.stringify(vide);
      void effacerPositionAction().then((issue) => issue === "ok" && signalerProgression());
    }
    aller(accueilOuVoie);
  };

  const fondPage = variante === "page" ? "#FBF7F0" : "#FFFFFF";
  const reposer = profil.voie === "inconnue" && calculerPosition(data, profil)?.etat === "voie_a_choisir";

  return (
    <div ref={conteneur} className="scroll-mt-4" style={{ "--oj-page": fondPage } as CSSProperties}>
      {vue.type === "accueil" && (
        <AccueilPanneau T={T} enCours={profilCommence(profil)} onCommencer={() => aller(profilCommence(profil) ? vueDeReprise(data, profil) : { type: "voie" })} />
      )}

      {vue.type === "voie" && (
        <EcranVoie
          data={data}
          T={T}
          profil={profil}
          accueil={variante === "page" && !profilCommence(profil)}
          connecte={compte !== null}
          ficheDeposee={ficheDeposee}
          reposer={reposer}
          onVoie={choisirVoie}
          onRaccourci={(oui) => setProfil((p) => ({ ...p, raccourci: oui }))}
          onContinuer={() => {
            const p = profil.voie !== null && !raccourciPossible(data, profil.voie) ? { ...profil, raccourci: false } : profil;
            if (p !== profil) setProfil(p);
            aller(vueSuivante(data, p, { type: "voie" }));
          }}
          onRetour={variante === "panneau" ? () => aller(vueInitiale(data, profil, variante)) : null}
        />
      )}

      {vue.type === "argent" && (
        <EcranArgent
          data={data}
          T={T}
          profil={profil}
          onNote={(n) => setProfil((p) => ({ ...p, argent: n }))}
          onContinuer={() => aller(vueSuivante(data, profil, vue))}
          onRetour={() => retour(vue)}
        />
      )}

      {vue.type === "parallele" && (
        <EcranParallele
          data={data}
          T={T}
          profil={profil}
          onChoix={(oui) => {
            const p = { ...profil, parallele: oui };
            setProfil(p);
            aller(vueSuivante(data, p, { type: "parallele" }));
          }}
          onRetour={() => retour(vue)}
        />
      )}

      {vue.type === "ecran" && q.ecrans[vue.index] && (
        <EcranQuete
          key={q.ecrans[vue.index].cle}
          data={data}
          T={T}
          profil={profil}
          ecran={q.ecrans[vue.index]}
          numero={vue.index + 1}
          total={Math.max(totalQuetes(data, profil), q.ecrans.length)}
          points={points}
          onRepondre={repondre}
          onValider={() => validerEcran(vue.index)}
          onRetour={() => retour(vue)}
        />
      )}

      {vue.type === "fete" && (
        <EcranFete
          data={data}
          T={T}
          etapes={vue.etapes}
          gain={vue.gain}
          total={points}
          derniere={vueSuivante(data, profil, { type: "ecran", index: vue.index }).type === "resultat"}
          statut={statut}
          onSuivant={() => aller(vueSuivante(data, profil, { type: "ecran", index: vue.index }))}
        />
      )}

      {vue.type === "resultat" && resultat && (
        <Resultat
          data={data}
          T={T}
          resultat={resultat}
          variante={variante}
          avant={avant}
          statut={statut}
          compte={compte}
          menu={menu}
          onRefaire={refaire}
          onEffacer={toutEffacer}
          onChoisirVoie={() => aller({ type: "voie" })}
        />
      )}
    </div>
  );
}
