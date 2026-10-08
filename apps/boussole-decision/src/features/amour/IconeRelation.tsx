import { cx } from "@/components/ui";
import { COULEUR_ETAT, COULEUR_RELATION, type EtatBesoin, type RelationLook } from "@/domain/relationApparence";
import type { RelationColor, RelationIcon } from "@/domain/types";

const TRACES: Record<RelationIcon, string[]> = {
  coeur: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
  etoile: [
    "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
  ],
  soleil: [
    "M12 2v2",
    "M12 20v2",
    "m4.93 4.93 1.41 1.41",
    "m17.66 17.66 1.41 1.41",
    "M2 12h2",
    "M20 12h2",
    "m6.34 17.66-1.41 1.41",
    "m19.07 4.93-1.41 1.41",
    "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0",
  ],
  lune: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
  montagne: ["m8 3 4 8 5-5 5 15H2L8 3z"],
  vague: [
    "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
    "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
  ],
  fleur: [
    "M12 12m-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0",
    "M12 5.5m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0",
    "M12 18.5m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0",
    "M5.5 12m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0",
    "M18.5 12m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0",
  ],
  feuille: ["M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z", "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"],
  flamme: [
    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  ],
  maison: ["M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
};

/** Icône SVG nette, colorée, prévue pour rester sur la même ligne que son texte. */
export function IconeRelation({ icone, couleur, taille = 20 }: { icone: RelationIcon; couleur: RelationColor; taille?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={taille} height={taille} aria-hidden className="inline-block shrink-0" style={{ color: COULEUR_RELATION[couleur] }}>
      {TRACES[icone].map((d) => (
        <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** Nom précédé de son icône, toujours sur la même ligne. */
export function NomRelation({
  nom,
  look,
  className,
  taille = 20,
}: {
  nom: string;
  look: RelationLook;
  className?: string;
  taille?: number;
}) {
  return (
    <span className={cx("inline-flex max-w-full items-center gap-1.5 align-middle", className)}>
      <IconeRelation icone={look.icon} couleur={look.color} taille={taille} />
      <span className="min-w-0 text-balance">{nom}</span>
    </span>
  );
}

const ETAT_TRACES: Record<EtatBesoin, string[]> = {
  nourri: ["M20 6 9 17l-5-5"],
  partiel: ["M5 12h14"],
  absent: ["M18 6 6 18", "m6 6 12 12"],
};

/** Petite icône d'état (vert, miel, corail), sur la même ligne que la phrase. */
export function IconeEtat({ etat }: { etat: EtatBesoin }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="mt-0.5 inline-block shrink-0" style={{ color: COULEUR_ETAT[etat] }}>
      {ETAT_TRACES[etat].map((d) => (
        <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export function IconeTelecharger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className={cx("inline-block shrink-0", className)}>
      <path d="M12 3v12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m7 11 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCalendrier() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className="inline-block shrink-0">
      <path d="M8 2v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 2v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 4h18v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 10h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
