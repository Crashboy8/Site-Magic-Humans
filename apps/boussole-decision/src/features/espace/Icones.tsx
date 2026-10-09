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
  | "crayon"
  | "lien"
  | "etoile"
  | "poubelle"
  | "fleche"
  | "enveloppe"
  | "coche"
  | "pdf"
  | "word"
  | "horloge"
  | "cle"
  // « Où j'en suis ? » : étapes, voies et jeu.
  | "ampoule"
  | "etiquette"
  | "pont"
  | "trophee"
  | "cadeau"
  | "reseau"
  | "megaphone"
  | "plante"
  | "drapeau"
  | "balance"
  | "soleil"
  | "loupe"
  | "fusee"
  | "retour"
  | "bifurcation"
  | "interrogation"
  | "cadenas"
  | "pieces"
  | "diamant"
  | "etincelle"
  | "pin"
  | "eclair"
  | "refaire"
  | "demi";

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
  lien: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </>
  ),
  etoile: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />,
  poubelle: (
    <>
      <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
      <path d="M6.5 7l1 12.5a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9l1-12.5" />
    </>
  ),
  fleche: <path d="m9.5 6 6 6-6 6" />,
  enveloppe: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="m4 6.5 8 6 8-6" />
    </>
  ),
  coche: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  pdf: (
    <>
      <path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z" />
      <path d="M14 3.5V8h4.5M8.5 16.5v-4h1.3a1.2 1.2 0 0 1 0 2.4H8.5M13 16.5v-4h.8a2 2 0 0 1 0 4z" />
    </>
  ),
  word: (
    <>
      <path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z" />
      <path d="M14 3.5V8h4.5M8.5 12.5l1.2 4 1.3-3 1.3 3 1.2-4" />
    </>
  ),
  horloge: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  cle: (
    <>
      <circle cx="8" cy="12" r="3.5" />
      <path d="M11.5 12h9M17.5 12v3M20.5 12v2.5" />
    </>
  ),
  crayon: (
    <>
      <path d="M13.2 5.2 18.8 10.8 8.5 21H3v-5.5z" />
      <path d="m12 6.4 5.6 5.6" />
    </>
  ),
  ampoule: (
    <>
      <path d="M12 3.2a6 6 0 0 0-3.7 10.7c.7.6 1.1 1.4 1.1 2.3v.3h5.2v-.3c0-.9.4-1.7 1.1-2.3A6 6 0 0 0 12 3.2z" />
      <path d="M9.6 19.2h4.8M10.6 21.5h2.8" />
    </>
  ),
  etiquette: (
    <>
      <path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.3 6.3a1.4 1.4 0 0 1-2 0z" />
      <circle cx="8.2" cy="8.2" r="1.5" />
    </>
  ),
  pont: (
    <>
      <path d="M2.5 8.5h19" />
      <path d="M4 19.5c0-5 3.6-8.6 8-8.6s8 3.6 8 8.6" />
      <path d="M12 8.5v2.4M7.6 8.5v4.4M16.4 8.5v4.4" />
    </>
  ),
  trophee: (
    <>
      <path d="M8 4h8v5.5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5.3a2.6 2.6 0 0 0 3 4M16 6h2.7a2.6 2.6 0 0 1-3 4" />
      <path d="M12 13.5v3.2M8.5 20.5h7l-.9-3.8H9.4z" />
    </>
  ),
  cadeau: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12M12 8v12.5" />
      <path d="M12 8C10.6 4.6 6.8 4.4 6.8 6.4 6.8 7.6 9 8 12 8zM12 8c1.4-3.4 5.2-3.6 5.2-1.6C17.2 7.6 15 8 12 8z" />
    </>
  ),
  reseau: (
    <>
      <circle cx="12" cy="5.5" r="2.3" />
      <circle cx="5.5" cy="17.5" r="2.3" />
      <circle cx="18.5" cy="17.5" r="2.3" />
      <path d="M10.9 7.5 6.6 15.5M13.1 7.5l4.3 8M7.8 17.5h8.4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h2.2l5.8 4V5L7.2 9H5a1 1 0 0 0-1 1z" />
      <path d="M16.3 9.2a4 4 0 0 1 0 5.6M18.8 6.6a7.6 7.6 0 0 1 0 10.8" />
    </>
  ),
  plante: (
    <>
      <path d="M12 20.5V11.2M8.2 20.5h7.6" />
      <path d="M12 11.2c0-3.7 2.5-6.2 6.6-6.2 0 3.9-2.6 6.2-6.6 6.2z" />
      <path d="M12 14.2c0-3.1-2.1-5.2-5.6-5.2 0 3.3 2.2 5.2 5.6 5.2z" />
    </>
  ),
  drapeau: (
    <>
      <path d="M5.5 21V3.8" />
      <path d="M5.5 4.5h11.3L14.2 8.5l2.6 4H5.5" />
    </>
  ),
  balance: (
    <>
      <path d="M12 5.3v14.7M8 20h8M5.2 7.2h13.6" />
      <circle cx="12" cy="4.2" r="1.1" />
      <path d="M5.2 7.2 2.6 13.2h5.2zM18.8 7.2l-2.6 6h5.2z" />
      <path d="M2.6 13.2a2.6 2.6 0 0 0 5.2 0M16.2 13.2a2.6 2.6 0 0 0 5.2 0" />
    </>
  ),
  soleil: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    </>
  ),
  loupe: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5.5 5.5" />
    </>
  ),
  fusee: (
    <>
      <path d="M12 3.2c3 1.9 4.8 5.1 4.8 8.7v3.6H7.2v-3.6c0-3.6 1.8-6.8 4.8-8.7z" />
      <path d="M7.2 12.4 4.6 14.9v3.6l2.6-1.4M16.8 12.4l2.6 2.5v3.6l-2.6-1.4" />
      <path d="M10.2 18.6c0 1.1.7 2 1.8 2.7 1.1-.7 1.8-1.6 1.8-2.7" />
      <circle cx="12" cy="10" r="1.6" />
    </>
  ),
  retour: (
    <>
      <path d="M9.5 14.5 4.5 9.5l5-5" />
      <path d="M4.5 9.5H15a4.5 4.5 0 0 1 0 9h-4.5" />
    </>
  ),
  bifurcation: (
    <>
      <path d="M12 21v-7.8L5.5 6.7M12 13.2l6.5-6.5" />
      <path d="M5 11V6.2h4.8M19 11V6.2h-4.8" />
    </>
  ),
  interrogation: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7" />
      <circle cx="12" cy="17.1" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  cadenas: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  pieces: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 8.8a3.9 3.9 0 1 0 0 6.4M7.8 11h5.7M7.8 13.4h5.7" />
    </>
  ),
  diamant: (
    <>
      <path d="M6.5 4.5h11l3 4.5L12 20 3.5 9z" />
      <path d="M3.5 9h17M9.6 4.5 8.2 9 12 20l3.8-11-1.4-4.5" />
    </>
  ),
  etincelle: (
    <>
      <path d="M11 3.5c.6 3.8 2.6 5.8 6.4 6.4-3.8.6-5.8 2.6-6.4 6.4-.6-3.8-2.6-5.8-6.4-6.4 3.8-.6 5.8-2.6 6.4-6.4z" />
      <path d="M18.5 15v4.6M16.2 17.3h4.6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  eclair: <path d="M13.2 3 5.5 13.5h6.2L10.8 21l7.7-10.5h-6.2z" />,
  refaire: (
    <>
      <path d="M4.6 12a7.4 7.4 0 1 0 2.2-5.3" />
      <path d="M4.6 3.8v4.7h4.7" />
    </>
  ),
  demi: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
    </>
  ),
};

/** Les seuls tracés d'une icône, pour la poser dans un dessin plus grand (un <svg> imbriqué avec sa viewBox 0 0 24 24). */
export function Traces({ nom }: { nom: NomIcone }) {
  return <>{DESSINS[nom]}</>;
}

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
