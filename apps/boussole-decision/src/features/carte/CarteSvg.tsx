"use client";

import { contours } from "d3-contour";
import { useId, useMemo } from "react";
import {
  CARTE_HAUTEUR,
  CARTE_LARGEUR,
  COURBES,
  altitude,
  calculerRelief,
  placerLieux,
  scoreLieu,
  type Carte,
  type LieuStatut,
} from "@/domain/carte";
import { TEXTES } from "./textes";

// Teintes hypsométriques : du sable du rivage aux neiges des sommets.
const TEINTES = ["#ece6c8", "#dbe5b9", "#c4d8a0", "#aecb8a", "#d8c792", "#c9ab7b", "#b38d68", "#9d7b5c", "#f5f1ea"];
const EAU = "#cfe3e8";
const EAU_PROFONDE = "#b7d3da";

const STATUT_STYLE: Record<LieuStatut, { fill: string; stroke: string }> = {
  a_explorer: { fill: "#fffdf9", stroke: "#3a2f24" },
  en_cours: { fill: "#2a78d6", stroke: "#fffdf9" },
  conquis: { fill: "#b8860b", stroke: "#fffdf9" },
  ecarte: { fill: "#9b9187", stroke: "#fffdf9" },
};

/** Chemin SVG d'un contour (MultiPolygon en mailles de la grille). */
function chemin(coordinates: number[][][][], pas: number): string {
  let d = "";
  for (const polygon of coordinates)
    for (const ring of polygon) {
      ring.forEach(([x, y], i) => {
        d += `${i === 0 ? "M" : "L"}${(x * pas).toFixed(1)},${(y * pas).toFixed(1)}`;
      });
      d += "Z";
    }
  return d;
}

/** Coupe un nom en deux lignes au plus, pour l'étiquette. */
function lignes(nom: string, max = 24): string[] {
  if (nom.length <= max) return [nom];
  const mots = nom.split(" ");
  let a = "";
  let i = 0;
  while (i < mots.length && (a + " " + mots[i]).trim().length <= max) a = (a + " " + mots[i++]).trim();
  const b = mots.slice(i).join(" ");
  return [a || nom.slice(0, max), b.length > max ? `${b.slice(0, max - 1)}…` : b].filter(Boolean);
}

/** Rendu statique de la carte : relief, rivages, courbes de niveau et lieux. */
export function CarteSvg({ carte }: { carte: Carte }) {
  const id = useId().replace(/:/g, "");
  const { bandes, hautsFonds, lieux } = useMemo(() => {
    const positions = placerLieux(carte);
    const relief = calculerRelief(carte, positions);
    const generateur = contours().size([relief.colonnes, relief.lignes]);
    const valeurs = Array.from(relief.valeurs);
    const bandes = generateur
      .thresholds(COURBES)(valeurs)
      .map((c, i) => ({ d: chemin(c.coordinates, relief.pas), i }));
    const [hautsFonds] = generateur
      .thresholds([0.055])(valeurs)
      .map((c) => chemin(c.coordinates, relief.pas));
    const lieux = carte.lieux.map((lieu) => {
      const p = positions.get(lieu.id)!;
      return { lieu, ...p, score: scoreLieu(lieu, carte.criteres), haut: altitude(relief, p.x, p.y) };
    });
    return { bandes, hautsFonds, lieux };
  }, [carte]);

  return (
    <svg
      viewBox={`0 0 ${CARTE_LARGEUR} ${CARTE_HAUTEUR}`}
      role="img"
      aria-label={TEXTES.carteAria(carte.nom)}
      className="block h-auto w-full"
    >
      <defs>
        <filter id={`terrasse-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="1.6" dy="2.4" stdDeviation="1.6" floodColor="#5a4630" floodOpacity="0.28" />
        </filter>
        <filter id={`papier-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  0 0 0 0.08 0" />
        </filter>
        <radialGradient id={`eau-${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor={EAU} />
          <stop offset="100%" stopColor={EAU_PROFONDE} />
        </radialGradient>
      </defs>

      {/* La mer, puis les hauts-fonds autour des terres. */}
      <rect width={CARTE_LARGEUR} height={CARTE_HAUTEUR} fill={`url(#eau-${id})`} />
      {hautsFonds && <path d={hautsFonds} fill="none" stroke="#9fc3cc" strokeWidth={1} strokeDasharray="3 5" />}

      {/* Le relief : une bande par courbe de niveau, ombrée pour donner du volume. */}
      {bandes.map((b) => (
        <path
          key={b.i}
          d={b.d}
          fill={TEINTES[b.i]}
          stroke={b.i === 0 ? "#6f98a1" : "rgb(90 70 45 / 0.35)"}
          strokeWidth={b.i === 0 ? 1.4 : b.i % 2 === 0 ? 0.9 : 0.6}
          strokeLinejoin="round"
          filter={`url(#terrasse-${id})`}
        />
      ))}

      {/* Grain de papier. */}
      <rect
        width={CARTE_LARGEUR}
        height={CARTE_HAUTEUR}
        filter={`url(#papier-${id})`}
        style={{ mixBlendMode: "multiply" }}
        pointerEvents="none"
      />

      {/* Les lieux. */}
      {lieux.map(({ lieu, x, y, score }) => {
        const style = STATUT_STYLE[lieu.statut];
        const r = 6 + (score ?? 0) / 25;
        const texte = lignes(lieu.nom);
        return (
          <g key={lieu.id}>
            <title>{`${lieu.nom} · ${TEXTES.statuts[lieu.statut]} · ${score === null ? TEXTES.nonEvalue : `${Math.round(score)} %`}`}</title>
            {(score ?? 0) >= 80 && (
              <path d={`M${x - 9},${y - r - 4} L${x},${y - r - 18} L${x + 9},${y - r - 4} Z`} fill="#3a2f24" opacity={0.75} />
            )}
            <circle cx={x} cy={y} r={r} fill={style.fill} stroke={style.stroke} strokeWidth={2.5} />
            {lieu.statut === "ecarte" && (
              <path
                d={`M${x - r * 0.5},${y - r * 0.5} L${x + r * 0.5},${y + r * 0.5} M${x + r * 0.5},${y - r * 0.5} L${x - r * 0.5},${y + r * 0.5}`}
                stroke="#fffdf9"
                strokeWidth={2}
              />
            )}
            <text
              x={x}
              y={y + r + 16}
              textAnchor="middle"
              className="fill-ink text-[13px] font-semibold"
              style={{ paintOrder: "stroke", stroke: "rgb(255 253 249 / 0.85)", strokeWidth: 4, strokeLinejoin: "round" }}
            >
              {texte.map((t, i) => (
                <tspan key={i} x={x} dy={i === 0 ? 0 : "1.15em"}>
                  {t}
                </tspan>
              ))}
              <tspan x={x} dy="1.2em" className="text-[12px] font-normal">
                {score === null ? TEXTES.nonEvalue : `${Math.round(score)} %`}
              </tspan>
            </text>
          </g>
        );
      })}

      {/* Rose des vents. */}
      <g transform={`translate(${CARTE_LARGEUR - 52} ${CARTE_HAUTEUR - 56})`} opacity={0.7}>
        <circle r={26} fill="none" stroke="#3a2f24" strokeWidth={0.8} />
        <path d="M0,-30 L5,0 L0,30 L-5,0 Z" fill="#3a2f24" />
        <path d="M-30,0 L0,-4 L30,0 L0,4 Z" fill="#3a2f24" opacity={0.5} />
        <text y={-34} textAnchor="middle" className="fill-ink text-[12px] font-semibold">
          N
        </text>
      </g>

      {/* Cartouche. */}
      <g transform="translate(24 24)">
        <rect
          width={Math.max(220, carte.nom.length * 10 + 40)}
          height={44}
          rx={6}
          fill="#fffdf9"
          fillOpacity={0.85}
          stroke="#3a2f24"
          strokeOpacity={0.3}
        />
        <text x={20} y={29} className="fill-ink font-serif text-[22px] italic">
          {carte.nom}
        </text>
      </g>
    </svg>
  );
}
