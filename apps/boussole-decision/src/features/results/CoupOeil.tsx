"use client";

import { useSyncExternalStore } from "react";
import { CLE_VUE, COULEUR_ACCENT, VUE_DEFAUT, habillageBandeau, libellesFamille, normaliserVue, teinteClaire, type VueCoupOeil } from "@/domain/coupOeil";
import { COULEUR_RELATION, espacesFins } from "@/domain/relationApparence";
import { formatScore, type OpportunityResult } from "@/domain/scoring";
import { IconeRelation } from "@/features/amour/IconeRelation";
import { useI18n } from "@/i18n/client";
import type { Category, Opportunity } from "@/domain/types";

const auditeurs = new Set<() => void>();
let vueMemoire: VueCoupOeil = VUE_DEFAUT;
let vueLue = false;

function lireVue(): VueCoupOeil {
  if (typeof window === "undefined") return VUE_DEFAUT;
  if (!vueLue) {
    vueMemoire = normaliserVue(window.localStorage.getItem(CLE_VUE));
    vueLue = true;
  }
  return vueMemoire;
}

function suivreVue(ecoute: () => void) {
  auditeurs.add(ecoute);
  return () => auditeurs.delete(ecoute);
}

function choisirVue(vue: VueCoupOeil) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLE_VUE, vue);
  vueMemoire = vue;
  vueLue = true;
  auditeurs.forEach((ecoute) => ecoute());
}

function useVue(): VueCoupOeil {
  return useSyncExternalStore(suivreVue, lireVue, () => VUE_DEFAUT);
}

interface Axe {
  id: string;
  court: string;
  complet: string;
  /** Libellé entier, jamais coupé. */
  plein: string;
  score: number | null;
  affiche: string;
}

export function CoupOeil({
  categories,
  opportunities,
  results,
  love,
  labels,
}: {
  categories: Category[];
  opportunities: Opportunity[];
  results: OpportunityResult[];
  love: boolean;
  labels: { radars: string; fiches: string; caption: string; category: string; global: string };
}) {
  const vue = useVue();
  const { m, locale } = useI18n();
  const langue = love ? "fr" : locale;
  const fmt = (score: number | null) => {
    const texte = formatScore(score, langue);
    return love ? espacesFins(texte) : texte;
  };
  const nomCategorie = (category: Category) => (category.key ? m.categoryByKey[category.key].label : category.label);

  const ordered = [...opportunities].sort((a, b) => a.position - b.position);
  const resultOf = new Map(results.map((r) => [r.opportunity.id, r]));
  const scoreDe = (opportunityId: string, categoryId: string) =>
    resultOf.get(opportunityId)?.byCategory.find((c) => c.categoryId === categoryId)?.score ?? null;

  const familles = [...categories]
    .sort((a, b) => a.position - b.position)
    .filter((c) => ordered.some((o) => scoreDe(o.id, c.id) !== null));
  const series = ordered.filter((o) => familles.some((c) => scoreDe(o.id, c.id) !== null));
  if (familles.length === 0 || series.length === 0) return null;

  const axesDe = (opportunityId: string): Axe[] =>
    familles.map((c) => {
      const libelles = libellesFamille(nomCategorie(c));
      const score = scoreDe(opportunityId, c.id);
      return { id: c.id, ...libelles, plein: nomCategorie(c), score, affiche: fmt(score) };
    });

  return (
    <div className="space-y-4">
      <div className="coup-oeil-bascule flex justify-center" role="tablist" aria-label={labels.caption}>
        <div className="flex rounded-full bg-sand p-1">
          {(["radars", "fiches"] as const).map((choix) => (
            <button
              key={choix}
              type="button"
              role="tab"
              aria-selected={vue === choix}
              onClick={() => choisirVue(choix)}
              className={
                vue === choix
                  ? "min-h-11 rounded-full bg-paper px-5 text-[15px] font-semibold text-ink shadow-sm"
                  : "min-h-11 rounded-full px-5 text-[15px] font-medium text-ink-soft"
              }
            >
              {choix === "radars" ? labels.radars : labels.fiches}
            </button>
          ))}
        </div>
      </div>

      <div className="coup-oeil-radars grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3" data-actif={vue === "radars" ? "oui" : "non"}>
        {series.map((o) => (
          <RadarCarte key={o.id} opportunite={o} axes={axesDe(o.id)} global={fmt(resultOf.get(o.id)?.score ?? null)} labels={labels} />
        ))}
      </div>

      <div className="coup-oeil-fiches grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3" data-actif={vue === "fiches" ? "oui" : "non"}>
        {series.map((o) => (
          <FicheCarte key={o.id} opportunite={o} axes={axesDe(o.id)} global={fmt(resultOf.get(o.id)?.score ?? null)} labels={labels} />
        ))}
      </div>

      <TableauChiffres series={series} familles={familles} axesDe={axesDe} fmt={fmt} love={love} caption={labels.caption} category={labels.category} />
    </div>
  );
}

function couleurDe(o: Opportunity): string {
  return o.color ? COULEUR_RELATION[o.color] : COULEUR_ACCENT;
}

function RadarCarte({
  opportunite,
  axes,
  global,
  labels,
}: {
  opportunite: Opportunity;
  axes: Axe[];
  global: string;
  labels: { global: string };
}) {
  const couleur = couleurDe(opportunite);
  const icone = opportunite.icon && opportunite.color ? <IconeRelation icone={opportunite.icon} couleur={opportunite.color} taille={24} /> : null;
  return (
    <article
      className="rounded-[18px] bg-paper px-3 pb-2 pt-4 text-center shadow-[0_2px_10px_rgba(58,46,38,0.07)]"
      style={{ borderTop: `6px solid ${couleur}` }}
    >
      <p className="flex items-center justify-center gap-2 text-xl font-semibold leading-tight">
        {icone}
        <span className="min-w-0 text-balance">{opportunite.name}</span>
      </p>
      <p className="mt-0.5 text-sm text-ink-soft">
        {labels.global}{" "}
        <b className="text-lg font-semibold" style={{ color: couleur }}>
          {global}
        </b>
      </p>
      <PetitRadar axes={axes} couleur={couleur} nom={opportunite.name} />
    </article>
  );
}

function FicheCarte({
  opportunite,
  axes,
  global,
  labels,
}: {
  opportunite: Opportunity;
  axes: Axe[];
  global: string;
  labels: { global: string };
}) {
  const couleur = couleurDe(opportunite);
  const bandeau = habillageBandeau(couleur);
  const piste = teinteClaire(couleur);
  const icone = opportunite.icon && opportunite.color ? <IconeRelation icone={opportunite.icon} couleur={opportunite.color} taille={22} /> : null;
  return (
    <article className="eviter-coupure overflow-hidden rounded-[18px] bg-paper shadow-[0_2px_10px_rgba(58,46,38,0.07)]">
      <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ background: bandeau.fond, color: bandeau.texte }}>
        {icone && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">{icone}</span>}
        <span className="min-w-0 flex-1 text-[21px] font-semibold leading-tight">{opportunite.name}</span>
        <span className="shrink-0 text-right text-[13px] leading-none">
          {labels.global}
          <b className="mt-0.5 block text-2xl font-semibold leading-none">{global}</b>
        </span>
      </div>
      <div className="px-4 pb-4 pt-1.5">
        {axes.map((axe) => (
          <div key={axe.id} className="mt-2.5">
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[15px]">
              <span className="min-w-0 leading-snug">{axe.complet}</span>
              <b className="shrink-0 tabular-nums">{axe.affiche}</b>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: piste }}>
              <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, axe.score ?? 0))}%`, background: couleur }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function PetitRadar({ axes, couleur, nom }: { axes: Axe[]; couleur: string; nom: string }) {
  if (axes.length < 3) return null;
  const n = axes.length;
  const cx = 160;
  const cy = 128;
  const rayon = 70;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, t: number) => {
    const a = angle(i);
    return { x: cx + rayon * t * Math.cos(a), y: cy + rayon * t * Math.sin(a), a };
  };
  const connus = axes.flatMap((axe, i) => (axe.score === null ? [] : [{ i, t: Math.max(0, Math.min(100, axe.score)) / 100 }]));
  const aria = `${nom}. ${axes.map((a) => `${a.court} ${a.affiche}`).join(", ")}`;

  return (
    <svg viewBox="-36 -8 392 292" role="img" aria-label={aria} className="mx-auto mt-1 block w-full max-w-[320px]">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon key={t} points={axes.map((_, i) => point(i, t)).map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#E7DDD2" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const bout = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={bout.x} y2={bout.y} stroke="#E7DDD2" />;
      })}
      {connus.length >= 3 && (
        <polygon
          points={connus.map(({ i, t }) => point(i, t)).map((p) => `${p.x},${p.y}`).join(" ")}
          fill={couleur}
          fillOpacity={0.28}
          stroke={couleur}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      )}
      {connus.map(({ i, t }) => {
        const p = point(i, t);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={couleur} />;
      })}
      {axes.map((axe, i) => {
        const p = point(i, 1.46);
        const ancre = Math.abs(Math.cos(p.a)) < 0.25 ? "middle" : Math.cos(p.a) > 0 ? "start" : "end";
        return (
          <text key={axe.id} x={p.x} y={p.y} textAnchor={ancre} fontSize={13}>
            <tspan x={p.x} dy={-7} fill="#5A4A3E">
              {axe.court}
            </tspan>
            <tspan x={p.x} dy={16} fontWeight={600} fill="#3A2E26">
              {axe.affiche}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

function TableauChiffres({
  series,
  familles,
  axesDe,
  fmt,
  love,
  caption,
  category,
}: {
  series: Opportunity[];
  familles: Category[];
  axesDe: (id: string) => Axe[];
  fmt: (score: number | null) => string;
  love: boolean;
  caption: string;
  category: string;
}) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {familles.map((c) => {
          const plein = axesDe(series[0].id).find((a) => a.id === c.id)?.plein ?? c.label;
          return (
            <li key={c.id} className="rounded-xl border border-line bg-paper p-3">
              <p className="font-medium leading-snug">{plein}</p>
              <ul className="mt-2 space-y-1.5">
                {series.map((o) => {
                  const score = axesDe(o.id).find((a) => a.id === c.id)?.score ?? null;
                  return (
                    <li key={o.id} className="flex items-baseline justify-between gap-3 text-[15px]">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        {love && o.icon && o.color ? <IconeRelation icone={o.icon} couleur={o.color} taille={16} /> : null}
                        <span className="min-w-0">{o.name}</span>
                      </span>
                      <span className="shrink-0 tabular-nums font-semibold">{fmt(score)}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-x-auto rounded-xl border border-line md:block" tabIndex={0} role="region" aria-label={caption}>
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-sand/60">
              <th scope="col" className="px-3 py-2 text-left font-medium">
                {category}
              </th>
              {series.map((o) => (
                <th key={o.id} scope="col" className="px-3 py-2 text-right font-semibold">
                  <span className="inline-flex items-center justify-end gap-1.5 whitespace-normal">
                    {love && o.icon && o.color ? <IconeRelation icone={o.icon} couleur={o.color} taille={14} /> : (
                      <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: couleurDe(o) }} />
                    )}
                    {o.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {familles.map((c) => {
              const plein = axesDe(series[0].id).find((a) => a.id === c.id)?.plein ?? c.label;
              return (
                <tr key={c.id} className="border-t border-line">
                  <th scope="row" className="whitespace-normal px-3 py-2 text-left font-normal leading-snug text-ink-soft">
                    {plein}
                  </th>
                  {series.map((o) => (
                    <td key={o.id} className="px-3 py-2 text-right tabular-nums">
                      {fmt(axesDe(o.id).find((a) => a.id === c.id)?.score ?? null)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
