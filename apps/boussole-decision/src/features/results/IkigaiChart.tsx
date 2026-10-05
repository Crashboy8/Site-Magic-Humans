"use client";

import { useId } from "react";
import { cx } from "@/components/ui";
import { IKIGAI_CIRCLES, IKIGAI_WEAK, type Ikigai, type IkigaiCircleKey } from "@/domain/results";
import { useI18n } from "@/i18n/client";
import { formatScore } from "@/domain/scoring";

// Couleurs du schéma classique de l'ikigai (validées : contraste et daltonisme, avec un libellé dans chaque cercle).
export const IKIGAI_COLORS: Record<IkigaiCircleKey, string> = {
  aime: "#eda100",
  doue: "#1baf7a",
  monde: "#e34948",
  paye: "#2a78d6",
};

const C = 200;
const R = 104;
const D = 70;
/** Position de chaque cercle : en haut ce que j'aime, à gauche le talent, à droite le monde, en bas la rémunération. */
const DIRECTION: Record<IkigaiCircleKey, [number, number]> = { aime: [0, -1], doue: [-1, 0], monde: [1, 0], paye: [0, 1] };
const OVERLAPS = [
  { key: "passion", x: C - 62, y: C - 62 },
  { key: "mission", x: C + 62, y: C - 62 },
  { key: "profession", x: C - 62, y: C + 66 },
  { key: "vocation", x: C + 62, y: C + 66 },
];

/** L'ikigai d'une opportunité : chaque cercle se remplit selon son score ; le centre se dore en approchant 100 %. */
export function IkigaiChart({ name, ikigai }: { name: string; ikigai: Ikigai }) {
  const id = useId().replace(/:/g, "");
  const total = ikigai.total;
  const t = total === null ? 0 : total / 100;
  const complete = total !== null && total >= 99.5;
  const weak = ikigai.circles.filter((c) => c.score !== null && c.score < IKIGAI_WEAK);
  const { t: tr, locale } = useI18n();
  const txt = tr.results;
  const fmt = (s: number | null) => formatScore(s, locale);

  return (
    <figure className="space-y-3">
      <svg viewBox="0 0 400 400" role="img" aria-label={txt.ikigaiAria(name, fmt(total))} className="mx-auto w-full max-w-[340px]">
        <defs>
          <radialGradient id={`or-${id}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fff6cc" />
            <stop offset="55%" stopColor="#f2c230" />
            <stop offset="100%" stopColor="#b8860b" />
          </radialGradient>
          <filter id={`halo-${id}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {IKIGAI_CIRCLES.map((circle) => {
          const score = ikigai.circles.find((c) => c.key === circle.key)?.score ?? null;
          const [dx, dy] = DIRECTION[circle.key];
          const color = IKIGAI_COLORS[circle.key];
          return (
            <circle
              key={circle.key}
              cx={C + dx * D}
              cy={C + dy * D}
              r={R}
              fill={score === null ? "transparent" : color}
              fillOpacity={score === null ? 0 : 0.06 + 0.32 * (score / 100)}
              stroke={score === null ? "rgb(58 47 36 / 0.3)" : color}
              strokeWidth={2}
              strokeDasharray={score === null ? "6 6" : undefined}
              style={{ mixBlendMode: "multiply" }}
            >
              <title>{`${txt.circles[circle.key].label} : ${fmt(score)}`}</title>
            </circle>
          );
        })}

        {IKIGAI_CIRCLES.map((circle) => {
          const score = ikigai.circles.find((c) => c.key === circle.key)?.score ?? null;
          const [dx, dy] = DIRECTION[circle.key];
          const x = C + dx * (D + 60);
          const y = C + dy * (D + 56);
          return (
            <text key={circle.key} x={x} y={y} textAnchor="middle" className="fill-ink">
              <tspan x={x} dy="-0.2em" className="text-[12px]">
                {txt.circles[circle.key].short}
              </tspan>
              <tspan x={x} dy="1.25em" className="text-[17px] font-semibold">
                {fmt(score)}
              </tspan>
            </text>
          );
        })}

        {OVERLAPS.map((o) => (
          <text
            key={o.key}
            x={o.x}
            y={o.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-soft text-[10px] font-semibold uppercase tracking-wider"
          >
            {txt.overlaps[o.key as keyof typeof txt.overlaps]}
          </text>
        ))}

        {/* Le centre : l'ikigai, d'autant plus doré qu'il est complet. */}
        {complete && (
          <circle cx={C} cy={C} r={48} fill="#f2c230" opacity={0.75} filter={`url(#halo-${id})`} className="motion-safe:animate-pulse" />
        )}
        <circle
          cx={C}
          cy={C}
          r={34}
          fill={`url(#or-${id})`}
          opacity={0.18 + 0.82 * t}
          stroke="#b8860b"
          strokeOpacity={0.3 + 0.7 * t}
          strokeWidth={complete ? 2.5 : 1.5}
        />
        <text x={C} y={C - 6} textAnchor="middle" className="fill-ink text-[12px] font-semibold">
          {txt.ikigai}
        </text>
        <text x={C} y={C + 12} textAnchor="middle" className="fill-ink text-[15px] font-bold">
          {fmt(total)}
        </text>
        {complete && (
          <text x={C + 30} y={C - 30} className="text-[18px]">
            ✨
          </text>
        )}
      </svg>

      <figcaption className="space-y-2">
        <ul className="grid grid-cols-1 gap-1 text-sm">
          {IKIGAI_CIRCLES.map((circle) => {
            const score = ikigai.circles.find((c) => c.key === circle.key)?.score ?? null;
            return (
              <li key={circle.key} className="flex items-center justify-between gap-2 rounded-lg bg-cream px-2.5 py-1.5">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: IKIGAI_COLORS[circle.key] }} />
                  {txt.circles[circle.key].label}
                </span>
                <span className={cx("tabular-nums font-medium", score === null && "text-ink-soft")}>{fmt(score)}</span>
              </li>
            );
          })}
        </ul>
        {complete && <p className="text-sm font-medium text-ink">{txt.ikigaiComplete}</p>}
        {weak.map((c) => (
          <p key={c.key} className="text-sm text-ink-soft">
            <b className="font-medium text-ink">{txt.circles[c.key].label}</b>
            {txt.ikigaiWeak}
            {txt.circles[c.key].missing}.
          </p>
        ))}
        {total === null && <p className="text-sm text-ink-soft">{txt.ikigaiIncomplete}</p>}
      </figcaption>
    </figure>
  );
}
