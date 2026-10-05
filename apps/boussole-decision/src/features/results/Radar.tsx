"use client";

import { useState } from "react";
import { cx } from "@/components/ui";
import { formatScore, type OpportunityResult } from "@/domain/scoring";
import { useI18n } from "@/i18n/client";
import type { Category, Opportunity } from "@/domain/types";

// Palette catégorielle validée (contraste, daltonisme) sur le fond « paper » : une couleur par opportunité,
// dans l'ordre des colonnes du tableau (la couleur suit l'opportunité, jamais son rang).
export const SERIES_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

const SIZE = 340;
const CENTER = SIZE / 2;
const RADIUS = 112;
const RINGS = [25, 50, 75, 100];

function point(index: number, count: number, value: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  const r = (RADIUS * value) / 100;
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle), angle };
}

/**
 * Radar des catégories : un axe par catégorie évaluée, une forme par opportunité.
 * Accompagné d'une légende et du tableau des chiffres (lecture sans la couleur).
 */
export function Radar({
  categories,
  opportunities,
  results,
}: {
  categories: Category[];
  opportunities: Opportunity[];
  results: OpportunityResult[];
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const { t, m, locale } = useI18n();
  const R = t.results;
  const fmt = (s: number | null) => formatScore(s, locale);
  /** Libellé court d'une catégorie pour l'axe du radar. */
  const axisLabel = (category: Category): string => {
    if (category.key === "anti_contexte") return R.antiAvoided;
    return (category.key ? m.categoryByKey[category.key].label : category.label).split(" & ")[0];
  };

  const ordered = [...opportunities].sort((a, b) => a.position - b.position).slice(0, SERIES_COLORS.length);
  const colorOf = new Map(ordered.map((o, i) => [o.id, SERIES_COLORS[i]]));
  const resultOf = new Map(results.map((r) => [r.opportunity.id, r]));
  const scoreOf = (opportunityId: string, categoryId: string) =>
    resultOf.get(opportunityId)?.byCategory.find((c) => c.categoryId === categoryId)?.score ?? null;
  const axes = categories.filter((c) => ordered.some((o) => scoreOf(o.id, c.id) !== null));
  const series = ordered.filter((o) => axes.some((a) => scoreOf(o.id, a.id) !== null));

  if (axes.length === 0 || series.length === 0) return null;

  return (
    <div className="space-y-4">
      {series.length > 1 && (
        <ul className="flex flex-wrap gap-2" aria-label={R.legend}>
          {series.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                aria-pressed={focus === o.id}
                onClick={() => setFocus((f) => (f === o.id ? null : o.id))}
                onMouseEnter={() => setFocus(o.id)}
                onMouseLeave={() => setFocus(null)}
                className={cx(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                  focus === o.id ? "border-ink/40 bg-sand" : "border-line bg-paper",
                )}
              >
                <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: colorOf.get(o.id) }} />
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {axes.length >= 3 && (
        <div className="relative mx-auto max-w-[560px]">
          <svg viewBox={`-60 -10 ${SIZE + 120} ${SIZE + 20}`} role="img" aria-label={R.radarAria} className="w-full">
            {RINGS.map((ring) => (
              <polygon
                key={ring}
                points={axes
                  .map((_, i) => point(i, axes.length, ring))
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke="rgb(58 47 36 / 0.12)"
                strokeWidth={1}
              />
            ))}
            {axes.map((axis, i) => {
              const end = point(i, axes.length, 100);
              const label = point(i, axes.length, 122);
              const anchor = Math.abs(Math.cos(label.angle)) < 0.2 ? "middle" : Math.cos(label.angle) > 0 ? "start" : "end";
              return (
                <g key={axis.id}>
                  <line x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="rgb(58 47 36 / 0.12)" strokeWidth={1} />
                  <text x={label.x} y={label.y} textAnchor={anchor} dominantBaseline="middle" className="fill-ink-soft text-[12px]">
                    {axisLabel(axis)}
                  </text>
                </g>
              );
            })}
            <text x={CENTER + 4} y={CENTER - RADIUS - 4} className="fill-ink-soft text-[10px]">
              100 %
            </text>
            {series.map((o) => {
              const color = colorOf.get(o.id);
              const dimmed = focus !== null && focus !== o.id;
              const pts = axes.map((a, i) => ({ ...point(i, axes.length, scoreOf(o.id, a.id) ?? 0), axis: a }));
              return (
                <g key={o.id} style={{ opacity: dimmed ? 0.15 : 1, transition: "opacity 150ms" }}>
                  <polygon
                    points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill={color}
                    fillOpacity={focus === o.id ? 0.22 : 0.1}
                    stroke={color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                  />
                  {pts.map((p) => {
                    const text = `${o.name} · ${axisLabel(p.axis)} : ${fmt(scoreOf(o.id, p.axis.id))}`;
                    return (
                      <g key={p.axis.id}>
                        <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="#fffdf9" strokeWidth={2} />
                        {/* Zone de survol plus grande que le point. */}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={12}
                          fill="transparent"
                          onMouseEnter={() => {
                            setFocus(o.id);
                            setTip({ x: p.x, y: p.y, text });
                          }}
                          onMouseLeave={() => {
                            setFocus(null);
                            setTip(null);
                          }}
                        >
                          <title>{text}</title>
                        </circle>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
          {tip && (
            <p
              role="tooltip"
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-cream shadow"
              style={{ left: `${((tip.x + 60) / (SIZE + 120)) * 100}%`, top: `calc(${((tip.y + 10) / (SIZE + 20)) * 100}% - 10px)` }}
            >
              {tip.text}
            </p>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-sm">
          <caption className="sr-only">{R.radarCaption}</caption>
          <thead>
            <tr className="bg-sand/60">
              <th scope="col" className="px-3 py-2 text-left font-medium">
                {R.category}
              </th>
              {series.map((o) => (
                <th key={o.id} scope="col" className="px-3 py-2 text-right font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorOf.get(o.id) }} />
                    {o.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axes.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <th scope="row" className="px-3 py-2 text-left font-normal text-ink-soft">
                  {axisLabel(a)}
                </th>
                {series.map((o) => (
                  <td key={o.id} className="px-3 py-2 text-right tabular-nums">
                    {fmt(scoreOf(o.id, a.id))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
