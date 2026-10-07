"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import type { ErreurChamp } from "@/domain/maCible/entree";
import { LIMITES } from "@/domain/maCible/limites";
import type { Talent } from "@/domain/maCible/types";
import type { Methodology } from "@/domain/methodology";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { AlerteSoumission, BarreBoutons, ChampTexte, ResumeErreurs } from "./Champs";
import { defilerVersChamp } from "./defilement";
import { idChamp, messagePresBouton } from "./erreurs";

type Cle = "mecanisme" | "contexte" | "benefice" | "antiContexte";

export function EtapeTalent({
  talent,
  erreurs,
  M,
  m,
  onChange,
  onContinuer,
}: {
  talent: Talent;
  erreurs: ErreurChamp[];
  M: MaCibleMessages;
  m: Methodology;
  onChange: (patch: Partial<Talent>) => void;
  onContinuer: () => void;
}) {
  const [reussiteOuverte, setReussiteOuverte] = useState(() => Boolean(talent.reussite));
  const libelles: Record<Cle, string> = {
    mecanisme: m.terms.mecanisme,
    contexte: m.terms.contexteDeclencheur,
    benefice: m.terms.superBenefice,
    antiContexte: m.terms.antiContexte,
  };
  const phrase = m.talentSentence({ mecanisme: talent.mecanisme, contexteDeclencheur: talent.contexte, superBenefice: talent.benefice });
  const depuisCarte = [...talent.sousTalents, ...talent.pistes].join(", ");
  const erreurDe = (c: Cle) => erreurs.find((e) => e.champ === `talent.${c}`);
  const champ = (c: Cle, flou?: string) => (
    <ChampTexte
      key={c}
      champ={`talent.${c}`}
      label={libelles[c]}
      aide={M.talent.champs[c].aide}
      exemple={M.talent.champs[c].exemple}
      placeholder={M.talent.champs[c].placeholder}
      value={talent[c]}
      onChange={(v) => onChange({ [c]: v })}
      erreur={erreurDe(c)}
      flou={flou}
      maxLength={LIMITES[c].max}
      M={M}
    />
  );
  const libellesErreurs: Record<string, string> = {
    ...Object.fromEntries((Object.keys(libelles) as Cle[]).map((c) => [`talent.${c}`, libelles[c]])),
    "talent.reussite": M.talent.reussite.label,
  };
  const premiere = erreurs[0];
  const messageBouton = premiere ? messagePresBouton(premiere, libellesErreurs[premiere.champ] ?? premiere.champ, M) : null;
  useEffect(() => {
    if (erreurs.length === 0) return;
    defilerVersChamp(idChamp(erreurs[0].champ));
  }, [erreurs]);

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onContinuer();
      }}
    >
      <ResumeErreurs erreurs={erreurs} M={M} libelles={libellesErreurs} />
      <Card className="space-y-6 rounded-2xl p-6 sm:p-8">
        {champ("mecanisme")}
        {champ("contexte")}
        {champ("benefice", "benefice")}
        <div className="rounded-xl border border-sky-line bg-sky-soft p-4">
          <p className="text-[15px] font-medium text-ink">{M.talent.phraseTitre}</p>
          <p className="mt-1 font-serif text-[20px] italic leading-snug text-ink" aria-live="polite">
            {phrase ?? <span className="font-sans text-[15px] not-italic text-ink-soft">{M.talent.phraseVide}</span>}
          </p>
          {depuisCarte && <p className="mt-2 text-sm text-ink-soft">{M.talent.depuisCarte(depuisCarte)}</p>}
        </div>
        {champ("antiContexte")}
        <details open={reussiteOuverte} onToggle={(e) => setReussiteOuverte(e.currentTarget.open)} className="rounded-xl border border-line p-4">
          <summary className="min-h-11 cursor-pointer py-2 text-[15px] font-medium text-ink">
            {M.talent.reussite.label} <span className="font-normal text-ink-soft">{M.commun.facultatif}</span>
          </summary>
          <div className="mt-3">
            <ChampTexte
              champ="talent.reussite"
              label={M.talent.reussite.label}
              aide={M.talent.reussite.aide}
              exemple={M.talent.reussite.exemple}
              value={talent.reussite}
              onChange={(v) => onChange({ reussite: v })}
              erreur={erreurs.find((e) => e.champ === "talent.reussite")}
              rows={4}
              maxLength={LIMITES.reussite.max}
              M={M}
            />
          </div>
        </details>
      </Card>
      <BarreBoutons>
        <span className="hidden text-sm text-ink-soft sm:block">{M.commun.enregistre}</span>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <AlerteSoumission message={messageBouton} />
          <Button type="submit" className="max-sm:w-full">
            {M.commun.continuer}
          </Button>
        </div>
      </BarreBoutons>
    </form>
  );
}

