"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/components/ui";
import { BADGES, aDuNeuf, apresEnvoi, type VueProgression } from "@/domain/progression";
import { Icone, type NomIcone } from "@/features/espace/Icones";
import { useI18n } from "@/i18n/client";
import { lireProgressionAction, reprendreProgressionAction } from "./actions";
import { ecrireJeu, lireJeu } from "./navigateur";
import { EVENEMENT_PROGRESSION } from "./signal";

/** L'adresse du jeu sur le site (même domaine que Mon espace). */
const LIEN_JEU = "/talent-game/";

/** Une info : son icône sur la même ligne que son nom, puis la valeur. Pas de fond ni de pastille (ce n'est pas un bouton). */
function Info({ icone, couleur, nom, children }: { icone: NomIcone; couleur: string; nom: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-2 text-[15px] font-semibold leading-snug" style={{ color: couleur }}>
        <Icone nom={icone} className="h-5 w-5 shrink-0" />
        {nom}
      </dt>
      <dd className="mt-1 text-[19px] font-semibold leading-snug text-ink">{children}</dd>
    </div>
  );
}

function BoutonJeu({ texte, className }: { texte: string; className: string }) {
  return (
    <a
      href={LIEN_JEU}
      className={cx(
        "min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-accent-strong px-6 text-base font-semibold text-white shadow-[0_3px_0_rgba(143,56,16,0.6)] transition hover:bg-accent-deep active:translate-y-px active:shadow-none",
        className,
      )}
    >
      {texte}
      <Icone nom="fleche" className="h-5 w-5 shrink-0" />
    </a>
  );
}

/** Part du chemin vers le prochain badge, de 0 à 100. */
function avancee(vue: VueProgression): number {
  if (!vue.prochain) return 100;
  const precedent = Math.max(0, ...BADGES.filter((b) => b.seuil <= vue.xp).map((b) => b.seuil));
  const etendue = vue.prochain.seuil - precedent;
  return etendue > 0 ? Math.min(100, Math.max(0, Math.round(((vue.xp - precedent) / etendue) * 100))) : 0;
}

/**
 * Le bloc « Ton aventure » de Mon espace : niveau Réussir dans le Plaisir, XP, prochain badge et série de jours.
 * À la première connexion, il reprend ce que le jeu a gagné dans ce navigateur (aucun point perdu), puis il se met à jour
 * après chaque enregistrement de « Où j'en suis ? ». Personne d'autre ne voit ces données.
 */
export function TonAventure({ initiale, titres }: { initiale: VueProgression; titres: Record<string, string> | null }) {
  const A = useI18n().t.espace.aventure;
  const [vue, setVue] = useState(initiale);
  const repris = useRef(false);

  useEffect(() => {
    if (!repris.current) {
      repris.current = true;
      const jeu = lireJeu();
      if (jeu && aDuNeuf(jeu.envoi, initiale)) {
        void reprendreProgressionAction(jeu.texte).then((v) => {
          if (!v) return;
          setVue(v);
          // Relu au retour : des points gagnés entre-temps dans le jeu restent à envoyer.
          const maintenant = lireJeu();
          if (maintenant) ecrireJeu(apresEnvoi(maintenant.envoi, jeu.envoi.ajout, v));
        });
      }
    }
    const relire = () => void lireProgressionAction().then((v) => v && setVue(v));
    window.addEventListener(EVENEMENT_PROGRESSION, relire);
    return () => window.removeEventListener(EVENEMENT_PROGRESSION, relire);
  }, [initiale]);

  const niveau = vue.niveau ? (titres?.[vue.niveau] ?? A.niveauCode(vue.niveau)) : A.depart;
  const pct = avancee(vue);

  return (
    <section aria-labelledby="aventure-titre" className="relative overflow-hidden rounded-[22px] border border-line bg-white px-5 pb-5 pt-6 sm:px-6">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#1F9E8C_0%,#E0A526_30%,#E2683A_55%,#C2416B_78%,#8B5FBF_100%)]" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="aventure-titre" className="flex items-center gap-2 font-serif text-[28px] italic leading-tight">
            <Icone nom="etincelle" className="h-7 w-7 shrink-0 text-[#C98A12]" />
            {A.titre}
          </h2>
          <p className="mt-1 max-w-xl text-[15px] leading-snug text-ink-soft">{A.intro}</p>
        </div>
        <BoutonJeu texte={A.jouer} className="hidden sm:inline-flex" />
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1.15fr_0.9fr]">
        <Info icone="trophee" couleur="#7A5200" nom={A.niveau}>
          {niveau}
        </Info>
        <Info icone="eclair" couleur="#A8431A" nom={A.xp}>
          {A.xpValeur(vue.xp)}
        </Info>
        <div className="min-w-0">
          <dt className="flex items-center gap-2 text-[15px] font-semibold leading-snug text-lilas">
            <Icone nom="medaille" className="h-5 w-5 shrink-0" />
            {A.prochain}
          </dt>
          <dd className="mt-1 text-[19px] font-semibold leading-snug text-ink">{vue.prochain ? A.manque(A.badges[vue.prochain.id], vue.prochain.manque) : A.tous}</dd>
          <dd aria-hidden="true" className="mt-2 h-2 w-full overflow-hidden rounded-full bg-lilas-soft">
            <span className="block h-full rounded-full bg-[linear-gradient(90deg,#E0A526,#C2416B,#7B5BAF)]" style={{ width: `${pct}%` }} />
          </dd>
        </div>
        <Info icone="flamme" couleur="#A3304F" nom={A.serie}>
          {A.jours(vue.serieJours)}
        </Info>
      </dl>

      {vue.badges.length > 0 && (
        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[15px] text-ink">
          <span className="font-semibold">{A.gagnes}</span>
          {vue.badges.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5">
              <Icone nom="medaille" className="h-[18px] w-[18px] shrink-0 text-[#B7791F]" />
              {A.badges[id]}
            </span>
          ))}
        </p>
      )}

      {/* Sur téléphone, le bouton vient après les infos plutôt qu'entre le titre et elles. */}
      <BoutonJeu texte={A.jouer} className="mt-5 flex w-full sm:hidden" />
    </section>
  );
}
