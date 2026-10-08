"use client";

import { Card } from "@/components/ui";
import { CLASSE_CARTE, TitreIcone } from "./Habillage";
import type { Resultat } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";

export function Plan30({ resultat, coches, onCoche, M, lecture = false }: { resultat: Resultat; coches: boolean[]; onCoche: (index: number) => void; M: MaCibleMessages; lecture?: boolean }) {
  const P = M.plan;
  const faites = coches.filter(Boolean).length;
  const nomCible = (id: string) => resultat.cibles.find((c) => c.id === id)?.nom ?? P.cibleToutes;
  return (
    <Card className={`${CLASSE_CARTE} space-y-5 rounded-2xl border-l-4 border-l-eau p-6 sm:p-8`}>
      <section id="plan" data-ancre aria-labelledby="plan-titre" className="scroll-mt-20 space-y-5">
        <TitreIcone as="h2" id="plan-titre" icone="calendrier" teinte="eau" className="rounded-xl bg-gradient-to-r from-eau-soft to-transparent px-3 py-2 text-[26px] italic">
          {P.titre}
        </TitreIcone>
        <p className="text-[17px] font-semibold text-ink">{P.consigne}</p>
        <div className="space-y-1.5">
          <p className="text-[15px] text-ink-soft" aria-live="polite">
            {P.progression(faites)}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(faites / 12) * 100}%` }} />
          </div>
          {faites === 12 && <p className="text-[16px] font-medium text-ink">{P.fini}</p>}
        </div>
        {resultat.plan30.map((s, si) => (
          <fieldset key={s.semaine} className="space-y-2">
            <legend className="text-[17px] font-medium">
              {P.semaine(s.semaine)} : {s.titre}
            </legend>
            {s.actions.map((a, ai) => {
              const index = si * 3 + ai;
              const id = `plan-${index}`;
              return (
                <label key={id} htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-line p-3 has-[:checked]:bg-sage-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-strong/40">
                  <input id={id} type="checkbox" checked={Boolean(coches[index])} disabled={lecture} onChange={() => onCoche(index)} className="mt-1 h-5 w-5 shrink-0 accent-accent-strong disabled:cursor-default" />
                  <span className="text-[16px]">
                    {a.texte}
                    <span className="block text-sm text-ink-soft">
                      {a.cible === "toutes" ? P.cibleToutes : nomCible(a.cible)} · {M.canaux[a.canal]} · {P.minutes(a.minutes)}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        ))}
      </section>
    </Card>
  );
}
