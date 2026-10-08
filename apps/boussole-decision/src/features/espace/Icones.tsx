import type { ReactNode } from "react";

/** Icônes au trait, 24 × 24. Celles des outils viennent de outils/index.html (branche des outils). */
export type NomIcone =
  | "qcm"
  | "carte"
  | "cibleur"
  | "boussole"
  | "amour"
  | "mallette"
  | "coeur"
  | "document"
  | "pressePapiers"
  | "dossier"
  | "crayon";

const DESSINS: Record<NomIcone, ReactNode> = {
  qcm: (
    <>
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path d="M9 3.5h6v2.2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <path d="M9.5 11h5M9.5 14.5h3.5" />
    </>
  ),
  carte: (
    <>
      <path d="M9 4.5 4 6.5v13l5-2 6 2 5-2v-13l-5 2-6-2z" />
      <path d="M9 4.5v13M15 6.5v13" />
    </>
  ),
  cibleur: (
    <>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  boussole: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.1 3.4-3.4 1.1 1.1-3.4z" />
    </>
  ),
  amour: <path d="M12 19.2s-6.2-3.8-6.2-7.6a3.4 3.4 0 0 1 6.2-1.9 3.4 3.4 0 0 1 6.2 1.9c0 3.8-6.2 7.6-6.2 7.6z" />,
  coeur: <path d="M12 19.2s-6.2-3.8-6.2-7.6a3.4 3.4 0 0 1 6.2-1.9 3.4 3.4 0 0 1 6.2 1.9c0 3.8-6.2 7.6-6.2 7.6z" />,
  mallette: (
    <>
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M2.5 12.5h19" />
    </>
  ),
  document: (
    <>
      <path d="M7 3.5h6.5L18 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
      <path d="M13.5 3.5V8H18" />
      <path d="M9 12.5h6M9 16h4" />
    </>
  ),
  pressePapiers: (
    <>
      <rect x="6" y="5" width="12" height="15.5" rx="2" />
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 15.5h4" />
    </>
  ),
  dossier: <path d="M3.5 8.5V18a1.5 1.5 0 0 0 1.5 1.5h14A1.5 1.5 0 0 0 20.5 18V9.5a1 1 0 0 0-1-1h-7.2L10.5 6.2H4.5a1 1 0 0 0-1 1z" />,
  crayon: (
    <>
      <path d="M13.2 5.2 18.8 10.8 8.5 21H3v-5.5z" />
      <path d="m12 6.4 5.6 5.6" />
    </>
  ),
};

export function Icone({ nom, className }: { nom: NomIcone; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {DESSINS[nom]}
    </svg>
  );
}
