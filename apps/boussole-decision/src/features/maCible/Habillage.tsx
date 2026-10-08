import type { ReactNode } from "react";
import { cx } from "@/components/ui";
import { Icone, type NomIcone } from "./Icones";

/** Trois accents vifs, un par cible. Pas de bleu foncé. */
export const TEINTES_CIBLE = ["corail", "eau", "lilas"] as const;

export type Teinte = (typeof TEINTES_CIBLE)[number] | "miel" | "framboise" | "sage";

export function teinteCible(index: number): Teinte {
  return TEINTES_CIBLE[index % TEINTES_CIBLE.length];
}

export const TEINTE: Record<Teinte, { pastille: string; bord: string; barre: string; anneau: string; bandeau: string }> = {
  corail: { pastille: "bg-corail-soft text-corail", bord: "border-l-corail", barre: "bg-corail", anneau: "#a8431a", bandeau: "from-corail-soft" },
  eau: { pastille: "bg-eau-soft text-eau", bord: "border-l-eau", barre: "bg-eau", anneau: "#0e6a60", bandeau: "from-eau-soft" },
  lilas: { pastille: "bg-lilas-soft text-lilas", bord: "border-l-lilas", barre: "bg-lilas", anneau: "#5f3f8f", bandeau: "from-lilas-soft" },
  miel: { pastille: "bg-miel-soft text-miel", bord: "border-l-miel", barre: "bg-miel", anneau: "#7a5200", bandeau: "from-miel-soft" },
  framboise: { pastille: "bg-framboise-soft text-framboise", bord: "border-l-framboise", barre: "bg-framboise", anneau: "#a3304f", bandeau: "from-framboise-soft" },
  sage: { pastille: "bg-sage-soft text-sage", bord: "border-l-sage", barre: "bg-sage", anneau: "#55704f", bandeau: "from-sage-soft" },
};

export const CLASSE_CARTE = "anim-entree shadow-[0_10px_28px_rgba(58,47,36,0.07)]";

const PRIORITE: Record<1 | 2 | 3, string> = {
  1: "bg-corail-soft text-corail",
  2: "bg-eau-soft text-eau",
  3: "bg-lilas-soft text-lilas",
};

export function PastilleIcone({ nom, teinte, taille = "md" }: { nom: NomIcone; teinte: Teinte; taille?: "sm" | "md" }) {
  return (
    <span className={cx("flex shrink-0 items-center justify-center rounded-full", taille === "sm" ? "size-8" : "size-9", TEINTE[teinte].pastille)}>
      <Icone nom={nom} className={taille === "sm" ? "size-4" : "size-5"} />
    </span>
  );
}

/** Titre et icône sur la même ligne, dans une pastille teintée. */
export function TitreIcone({
  as: Tag = "h2",
  id,
  icone,
  teinte = "corail",
  taille = "md",
  children,
  className,
}: {
  as?: "h2" | "h3" | "h4";
  id?: string;
  icone: NomIcone;
  teinte?: Teinte;
  taille?: "sm" | "md";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag id={id} className={cx("flex items-center gap-3", className)}>
      <PastilleIcone nom={icone} teinte={teinte} taille={taille} />
      <span className="min-w-0">{children}</span>
    </Tag>
  );
}

/** Bandeau léger derrière un titre de section. */
export function Bandeau({ teinte, children }: { teinte: Teinte; children: ReactNode }) {
  return <div className={cx("flex items-center gap-3 rounded-xl bg-gradient-to-r to-transparent px-3 py-2", TEINTE[teinte].bandeau)}>{children}</div>;
}

/** Score dans un anneau coloré. Le texte reste lisible au centre. */
export function AnneauScore({ valeur, affiche, couleur, libelle }: { valeur: number; affiche: string; couleur: string; libelle: string }) {
  const r = 26;
  const tour = 2 * Math.PI * r;
  const part = Math.max(0, Math.min(10, valeur)) / 10;
  return (
    <div className="relative size-[72px] shrink-0" aria-label={`${libelle} ${affiche}`}>
      <svg viewBox="0 0 72 72" className="size-[72px] -rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={r} fill="none" className="stroke-sand" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={couleur} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${tour * part} ${tour}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center px-1 text-center font-serif text-[13px] leading-none text-ink" aria-hidden="true">
        {affiche}
      </span>
    </div>
  );
}

export function PastillePriorite({ niveau, libelle }: { niveau: 1 | 2 | 3; libelle: string }) {
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", PRIORITE[niveau])}>{libelle}</span>;
}

/** Petit séparateur entre les grandes parties. */
export function Separateur() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-line" />
      <Icone nom="etincelles" className="size-4 text-corail" />
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
