"use client";

import { useActionState } from "react";
import { formatDate } from "@/components/ui";
import { Icone } from "@/features/espace/Icones";
import { useI18n } from "@/i18n/client";
import { demanderGroupeM3Action } from "./actions";

/** Mon espace, comptes VIP : « Rejoins un groupe M3 ». Un clic envoie la demande à Pierre ; la date reste affichée. */
export function CarteGroupeM3({ demandeLe }: { demandeLe: string | null }) {
  const [etat, action, envoi] = useActionState(demanderGroupeM3Action, demandeLe ? { le: demandeLe } : {});
  const { t, locale } = useI18n();
  const G = t.vip.groupeM3;
  return (
    <section aria-labelledby="groupe-m3" className="rounded-[14px] border border-[#E6D3A3] bg-[#FBF5E6] p-5 sm:p-6" style={{ borderLeft: "4px solid #C4922A" }}>
      <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-[#8A6516]">
        <Icone nom="etoile" className="h-4 w-4 shrink-0" />
        {G.surtitre}
      </p>
      <h2 id="groupe-m3" className="mt-1 flex items-center gap-2.5 font-serif text-[24px] italic leading-tight sm:text-[26px]">
        <Icone nom="reseau" className="h-6 w-6 shrink-0 text-[#8A6516]" />
        {G.titre}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">{G.texte}</p>
      {etat.le ? (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-base text-ink">
          <Icone nom="coche" className="h-5 w-5 shrink-0 text-sage" />
          {G.envoye(formatDate(etat.le, false, locale))}
        </p>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          {etat.erreur && (
            <p role="alert" className="text-sm text-danger">
              {etat.erreur}
            </p>
          )}
          <button
            type="submit"
            disabled={envoi}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#8A6516] px-6 text-base font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            <Icone nom="enveloppe" className="h-5 w-5 shrink-0" />
            {envoi ? G.envoi : G.bouton}
          </button>
        </form>
      )}
    </section>
  );
}
