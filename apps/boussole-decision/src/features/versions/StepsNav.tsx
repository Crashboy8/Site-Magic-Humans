"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { cx } from "@/components/ui";

export type StepRoute = "tableau" | "resultats";

const STEP_KEYS: StepRoute[] = ["tableau", "resultats"];

export interface Step {
  key: StepRoute;
  n: number;
  title: string;
  text: string;
  available: boolean;
}

/** Les étapes d'une version, dans la langue choisie. */
export function useSteps(): Step[] {
  const v = useI18n().t.version;
  return STEP_KEYS.map((key, i) => ({
    key,
    n: i + 1,
    title: key === "tableau" ? v.stepTable : v.stepResults,
    text: key === "tableau" ? v.stepTableText : v.stepResultsText,
    available: true,
  }));
}

/** Fil des étapes d'une version. */
export function StepsNav({ versionId, current }: { versionId: string; current?: StepRoute }) {
  const STEPS = useSteps();
  const v = useI18n().t.version;
  return (
    <nav aria-label={v.steps} className="mb-8 overflow-x-auto">
      <ol className="flex min-w-max gap-2">
        {STEPS.map((s) => {
          const active = s.key === current;
          const content = (
            <>
              <span className={cx("font-script text-xl", active ? "text-white" : "text-accent")}>{s.n}</span>
              <span>{s.title}</span>
              {!s.available && <span className="text-xs opacity-70">{v.soon}</span>}
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
