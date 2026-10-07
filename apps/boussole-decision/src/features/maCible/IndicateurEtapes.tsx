import type { MaCibleMessages } from "@/i18n/messages/maCible";

export const NB_TOURS = 3;

/** Barre des 5 étapes. Aux étapes 4 et 5, la boucle et le numéro de tour sont visibles. */
export function IndicateurEtapes({ n, tour, M, boucle }: { n: number; tour: number; M: MaCibleMessages; boucle: boolean }) {
  const etiquette = boucle ? `${M.commun.etape(n)}, ${M.commun.tour(tour, NB_TOURS)}` : M.commun.etape(n);
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-soft">{etiquette}</p>
      <div role="img" aria-label={etiquette} className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-1.5 rounded-full ${i <= n ? "bg-accent-strong" : "bg-sand"}`} />
        ))}
      </div>
      {boucle && <p className="text-[17px] leading-relaxed text-ink">{M.commun.boucle(tour, NB_TOURS)}</p>}
    </div>
  );
}
