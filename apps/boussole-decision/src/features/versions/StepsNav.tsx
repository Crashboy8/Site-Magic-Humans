import Link from "next/link";
import type { StepKey } from "@/domain/types";
import { cx } from "@/components/ui";

export const STEPS: { key: StepKey; n: number; title: string; text: string; available: boolean }[] = [
  { key: "criteres", n: 1, title: "Mes critères", text: "Ce qui compte pour toi, catégorie par catégorie.", available: true },
  { key: "opportunites", n: 2, title: "Mes opportunités", text: "Les pistes que tu veux comparer.", available: false },
  { key: "evaluation", n: 3, title: "Évaluation", text: "Chaque opportunité face à chaque critère.", available: false },
  { key: "resultats", n: 4, title: "Résultats", text: "Score d'alignement, alertes, radar.", available: false },
];

/** Fil des 4 étapes d'une version. */
export function StepsNav({ versionId, current }: { versionId: string; current?: StepKey }) {
  return (
    <nav aria-label="Étapes" className="mb-8 overflow-x-auto">
      <ol className="flex min-w-max gap-2">
        {STEPS.map((s) => {
          const active = s.key === current;
          const content = (
            <>
              <span className={cx("font-script text-xl", active ? "text-white" : "text-accent")}>{s.n}</span>
              <span>{s.title}</span>
              {!s.available && <span className="text-xs opacity-70">(bientôt)</span>}
            </>
          );
          const cls = cx(
            "flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px]",
            active ? "bg-ink text-cream" : s.available ? "bg-paper text-ink hover:bg-sand" : "bg-sand/60 text-ink-soft",
          );
          return (
            <li key={s.key}>
              {s.available && !active ? (
                <Link href={`/versions/${versionId}/${s.key}/`} className={cls}>
                  {content}
                </Link>
              ) : (
                <span className={cls} aria-current={active ? "step" : undefined}>
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
