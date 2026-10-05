import Link from "next/link";
import { cx } from "@/components/ui";

export type StepRoute = "tableau" | "resultats";

export const STEPS: { key: StepRoute; n: number; title: string; text: string; available: boolean }[] = [
  {
    key: "tableau",
    n: 1,
    title: "Mon tableau",
    text: "Mes critères en lignes, mes opportunités en colonnes, et le score qui se calcule en direct.",
    available: true,
  },
  {
    key: "resultats",
    n: 2,
    title: "Résultats",
    text: "Ton classement, ce qui allume ton talent ou l'éteint, le radar, et la place de ton ressenti.",
    available: true,
  },
];

/** Fil des étapes d'une version. */
export function StepsNav({ versionId, current }: { versionId: string; current?: StepRoute }) {
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
