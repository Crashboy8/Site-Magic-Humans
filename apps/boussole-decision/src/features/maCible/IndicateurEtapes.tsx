"use client";

import { cx } from "@/components/ui";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { ETAPES_BARRE, accesEtape, type EtapeBarre, type Etat } from "./etat";

export const NB_TOURS = 3;

const NUMERO: Record<EtapeBarre, number> = { talent: 1, terrain: 2, questions: 3, esquisse: 4, resultat: 5 };

/** Barre des 5 étapes, cliquable. Aux étapes 4 et 5, la boucle et le numéro de tour restent visibles. */
export function IndicateurEtapes({ etat, M, onAller }: { etat: Etat; M: MaCibleMessages; onAller: (etape: EtapeBarre) => void }) {
  const courante = ETAPES_BARRE.find((id) => accesEtape(etat, id) === "courante");
  const n = courante ? NUMERO[courante] : 1;
  const boucle = n >= 4;
  const etiquette = boucle ? `${M.commun.etape(n)}, ${M.commun.tour(etat.tour, NB_TOURS)}` : M.commun.etape(n);
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-soft">{etiquette}</p>
      <nav aria-label="Étapes">
        <ol className="grid grid-cols-5 gap-1.5">
          {ETAPES_BARRE.map((id) => {
            const acces = accesEtape(etat, id);
            const label = M.commun.etapesNav[id];
            const actif = acces === "courante" || acces === "atteinte";
            return (
              <li key={id}>
                <button
                  type="button"
                  disabled={acces === "future" || acces === "sautee"}
                  aria-current={acces === "courante" ? "step" : undefined}
                  aria-label={acces === "sautee" ? `${label}, ${M.commun.sautee}` : label}
                  onClick={() => onAller(id)}
                  className="flex min-h-11 w-full min-w-11 flex-col items-center justify-center gap-1 rounded-xl px-1 disabled:cursor-not-allowed"
                >
                  <span className={cx("h-1.5 w-full rounded-full", actif ? "bg-accent-strong" : "bg-sand")} />
                  <span className="hidden text-center text-xs leading-tight sm:block">{label}</span>
                  {acces === "sautee" && <span className="text-center text-xs leading-tight text-ink-soft">{M.commun.sautee}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      {courante && <p className="text-sm text-ink-soft sm:hidden">{M.commun.etapesNav[courante]}</p>}
      {boucle && <p className="text-[17px] leading-relaxed text-ink">{M.commun.boucle(etat.tour, NB_TOURS)}</p>}
    </div>
  );
}
