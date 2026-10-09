import { amourPour, critereModeleAmour } from "@/content/amourLangue";
import type { Locale } from "@/i18n/config";

/** Questions guides des critères. La description réelle (note du quiz comprise) remplace le guide du modèle. */
export function LoveGuide({ criteria, locale }: { criteria: { id: string; label: string; description: string }[]; locale: Locale }) {
  const dp = locale === "fr" ? " : " : ": ";
  return (
    <details className="max-w-3xl rounded-xl bg-blush/70 px-5 py-3">
      <summary className="cursor-pointer text-sm font-medium text-ink">{amourPour(locale).texts.guideTitle}</summary>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed whitespace-pre-line">
        {criteria.map((criterion) => {
          const fallback = critereModeleAmour(criterion.label, locale)?.guide ?? "";
          const text = criterion.description.trim() ? criterion.description : fallback;
          return (
            <li key={criterion.id}>
              <strong className="font-medium">{criterion.label}</strong>
              {dp}
              {text}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
