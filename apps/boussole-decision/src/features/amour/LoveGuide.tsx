import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";

/** Questions guides des critères. La description réelle (note du quiz comprise) remplace le guide du modèle. */
export function LoveGuide({ criteria }: { criteria: { id: string; label: string; description: string }[] }) {
  return (
    <details className="max-w-3xl rounded-xl bg-blush/70 px-5 py-3">
      <summary className="cursor-pointer text-sm font-medium text-ink">{LOVE_TEXTS.guideTitle}</summary>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed whitespace-pre-line">
        {criteria.map((criterion) => {
          const fallback = LOVE_TEMPLATE.criteria.find((item) => item.label === criterion.label)?.guide ?? "";
          const text = criterion.description.trim() ? criterion.description : fallback;
          return (
            <li key={criterion.id}>
              <strong className="font-medium">{criterion.label}</strong>
              {" : "}
              {text}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
