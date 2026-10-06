import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";

/** Questions guides des 10 critères, repliées par défaut au-dessus du tableau. */
export function LoveGuide() {
  return (
    <details className="max-w-3xl rounded-xl bg-blush/70 px-5 py-3">
      <summary className="cursor-pointer text-sm font-medium text-ink">{LOVE_TEXTS.guideTitle}</summary>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {LOVE_TEMPLATE.criteria.map((c) => (
          <li key={c.key}>
            <strong className="font-medium">{c.label}</strong> : {c.guide}
          </li>
        ))}
      </ul>
    </details>
  );
}
