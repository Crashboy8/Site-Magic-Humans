"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Notice, cx } from "@/components/ui";
import type { CategorieLieu, Portrait, SyntheseTerrain } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BoutonCopier } from "./BoutonCopier";
import { ChargeurEnLigne } from "./ChargeurEnLigne";
import { PastilleIcone, type Teinte } from "./Habillage";
import { Icone, type NomIcone } from "./Icones";
import { LiensLieu } from "./LiensLieu";
import { textePortrait } from "./export";

const ICONE_LIEU: Record<CategorieLieu, NomIcone> = {
  salon: "chapiteau",
  evenement: "calendrier",
  club: "groupe",
  en_ligne: "ecran",
  lieu: "epingle",
  media: "journal",
};

/** État d'un approfondissement, vu depuis un bloc. */
export interface EtatAppel {
  enCours: boolean;
  /** Un autre approfondissement est en cours ailleurs. */
  bloque: boolean;
  erreur: string | null;
  /** Faux pour une limite du jour : pas de bouton « Réessayer » (§16). */
  reessai: boolean;
}

function PastilleImagine({ libelle, aide }: { libelle: string; aide: string }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <span className="relative inline-flex align-middle" onMouseEnter={() => setOuvert(true)} onMouseLeave={() => setOuvert(false)}>
      <button type="button" className="inline-flex min-h-8 items-center rounded-full bg-corail-soft px-2.5 text-xs font-medium text-corail" aria-expanded={ouvert} onClick={() => setOuvert((v) => !v)}>
        {libelle}
      </button>
      {ouvert && (
        <span role="tooltip" className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl bg-ink px-3 py-2 text-left text-sm font-normal text-white shadow-lg">
          {aide}
        </span>
      )}
    </span>
  );
}

function SousTitre({ icone, teinte, children }: { icone: NomIcone; teinte: Teinte; children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 font-serif text-[18px] italic">
      <PastilleIcone nom={icone} teinte={teinte} taille="sm" />
      <span className="min-w-0">{children}</span>
    </h4>
  );
}

function Intensite({ n, libelle }: { n: number; libelle: string }) {
  return (
    <span role="img" aria-label={libelle} className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx("size-2 rounded-full border border-framboise", i <= n ? "bg-framboise" : "bg-framboise-soft")} />
      ))}
    </span>
  );
}

/** Le portrait affiché (§4.7). `id` pose l'ancre du bloc. */
export function VuePortrait({
  portrait,
  synthese,
  M,
  nouveau = false,
}: {
  portrait: Portrait;
  synthese: SyntheseTerrain | null;
  M: MaCibleMessages;
  nouveau?: boolean;
}) {
  const A = M.approfondir;
  const titre = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!nouveau) return;
    titre.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titre.current?.focus({ preventScroll: true });
  }, [nouveau]);
  const citation = (id: string) => synthese?.verbatims.find((v) => v.id === id)?.citation;
  return (
    <div className={cx("space-y-5", nouveau && "motion-safe:animate-[apparaitre_300ms_ease-out]")}>
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-corail to-miel font-serif text-[22px] text-white">
          {portrait.prenom.trim().charAt(0).toUpperCase()}
        </span>
        <p ref={titre} tabIndex={-1} className="scroll-mt-24 font-serif text-[22px] italic focus:outline-none">
          {A.identite(portrait.prenom, portrait.age)}
        </p>
        <PastilleImagine libelle={A.imagine} aide={A.imagineAide} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <SousTitre icone="personne" teinte="corail">{A.situation}</SousTitre>
          <p className="text-[16px] leading-relaxed">{portrait.situation}</p>
        </div>
        <div className="space-y-1">
          <SousTitre icone="calendrier" teinte="corail">{A.journee}</SousTitre>
          <p className="text-[16px] leading-relaxed">{portrait.journee}</p>
        </div>
      </div>
      <div className="space-y-1">
        <SousTitre icone="eclair" teinte="miel">{A.declencheur}</SousTitre>
        <p className="text-[16px] leading-relaxed">{portrait.declencheur}</p>
      </div>
      <div className="space-y-1 rounded-xl bg-sage-soft p-3 sm:p-4">
        <SousTitre icone="etincelles" teinte="sage">{A.pourToi}</SousTitre>
        <p className="text-[16px] leading-relaxed">{portrait.pourToi}</p>
      </div>
      <div className="space-y-1">
        <SousTitre icone="gomme" teinte="sable">{A.dejaEssaye}</SousTitre>
        <ul className="list-disc space-y-1 pl-5 text-[16px]">
          {portrait.dejaEssaye.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3 rounded-xl border-l-4 border-framboise bg-framboise-soft/60 p-3 sm:p-4">
        <SousTitre icone="eclair" teinte="framboise">{A.douleurs}</SousTitre>
        <ul className="space-y-4">
          {portrait.douleurs.map((d) => {
            const vraie = d.verbatim ? citation(d.verbatim) : undefined;
            return (
              <li key={d.titre} className="space-y-1.5">
                <p className="flex flex-wrap items-center gap-2">
                  <strong className="text-[16px]">{d.titre}</strong>
                  <Intensite n={d.intensite} libelle={A.intensite(d.intensite)} />
                </p>
                <p className="text-[16px]">{d.detail}</p>
                <p className="text-[16px]">
                  <span className="text-ink-soft">{A.commeElleLeDirait}</span> <em>{d.sesMots}</em>
                </p>
                {vraie && (
                  <div className="space-y-1 rounded-lg bg-paper p-3">
                    <p className="text-[15px] text-ink-soft">{A.vraimentDit}</p>
                    <blockquote className="text-[16px] italic">« {vraie} »</blockquote>
                    <span className="inline-flex rounded-full bg-lilas-soft px-2 py-1 text-xs font-medium text-lilas">{M.notes.tire}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-2">
        <SousTitre icone="bulles" teinte="lilas">{A.objections}</SousTitre>
        <ul className="space-y-3">
          {portrait.objections.map((o) => (
            <li key={o.objection} className="space-y-1 rounded-xl border border-line bg-paper p-3">
              <p className="text-[16px] font-semibold">{o.objection}</p>
              <p className="text-[16px]">
                <span className="text-ink-soft">{A.tuPeuxRepondre}</span> {o.reponse}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <SousTitre icone="etoile" teinte="miel">{A.criteresChoix}</SousTitre>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {portrait.criteresChoix.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-1">
          <SousTitre icone="journal" teinte="lilas">{A.sInforme}</SousTitre>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {portrait.sInforme.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-eau-soft/70 p-3 sm:p-4">
        <SousTitre icone="epingle" teinte="eau">{A.lieux}</SousTitre>
        <ul className="grid gap-3 md:grid-cols-2">
          {portrait.lieux.map((l) => (
            <li key={l.type + l.recherche} className="flex flex-col gap-2 rounded-xl border border-line bg-paper p-3">
              <p className="flex items-center gap-2">
                <PastilleIcone nom={ICONE_LIEU[l.categorie]} teinte="eau" taille="sm" />
                <span className="text-xs font-semibold uppercase tracking-wide text-eau">{A.categories[l.categorie]}</span>
              </p>
              <p className="text-[16px] font-semibold">{l.type}</p>
              <p className="text-[15px] text-ink-soft">{l.pourquoi}</p>
              <p className="text-[15px]">{A.aChercher(l.recherche)}</p>
              <LiensLieu recherche={l.recherche} M={M} />
            </li>
          ))}
        </ul>
        <p className="text-sm italic text-ink-soft">{A.lieuxNote}</p>
      </div>

      <div data-ecran-seul>
        <BoutonCopier texte={textePortrait(portrait, synthese)} M={M} libelle={A.copierPortrait} />
      </div>
    </div>
  );
}

/** Bloc « Son portrait complet » d'une cible : bouton d'appel, chargeur, ou portrait (§4.7). */
export function BlocPortrait({
  id,
  portrait,
  synthese,
  M,
  appel,
  lecture,
  maxApprofondir,
  nouveau,
  onFaire,
}: {
  id: string;
  portrait: Portrait | undefined;
  synthese: SyntheseTerrain | null;
  M: MaCibleMessages;
  appel: EtatAppel;
  lecture: boolean;
  maxApprofondir: number;
  nouveau: boolean;
  onFaire: () => void;
}) {
  const A = M.approfondir;
  if (!portrait && lecture) return null;
  return (
    <section id={id} data-ancre="" className="-mx-2 scroll-mt-20 space-y-4 rounded-2xl border-l-4 border-corail bg-gradient-to-br from-corail-soft to-paper p-4 sm:mx-0 sm:p-6">
      <h3 className="flex items-center gap-3 font-serif text-[22px] italic">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-corail">
          <Icone nom="personne" className="size-5" />
        </span>
        <span className="min-w-0">{A.portraitTitre}</span>
      </h3>
      {portrait ? (
        <VuePortrait portrait={portrait} synthese={synthese} M={M} nouveau={nouveau} />
      ) : appel.enCours ? (
        <ChargeurEnLigne messages={A.chargeurPortrait} tempsEcoule={A.tempsEcoule} />
      ) : (
        <div data-ecran-seul className="space-y-3">
          <p className="text-[16px] leading-relaxed">{A.portraitTexte}</p>
          {appel.erreur && <Notice tone="error">{appel.erreur}</Notice>}
          {appel.reessai && (
            <>
              <Button type="button" className="max-sm:w-full" disabled={appel.bloque} onClick={onFaire}>
                <Icone nom="personne" className="size-4 shrink-0" />
                {appel.erreur ? M.erreurs.reessayer : A.portraitBouton}
              </Button>
              <p className="text-sm text-ink-soft">{appel.bloque ? A.dejaEnCours : A.portraitDuree(maxApprofondir)}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
