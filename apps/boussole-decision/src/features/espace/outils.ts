import type { NomIcone } from "./Icones";

export type CleOutil = "qcm" | "carte" | "cibleur" | "boussole" | "amour" | "relation";
export type SectionOutil = "pro" | "coeur";

export interface Outil {
  cle: CleOutil;
  section: SectionOutil;
  titre: string;
  phrase: string;
  bouton: string;
  lien: string;
  forte: string;
  claire: string;
  fond: string;
  /** Couleur du bouton plein. #D4532C passe à #B8441F si le blanc n'atteint pas 4,5:1. */
  couleurBouton: string;
  /** La carte dorée porte le texte encre, les autres le blanc. */
  encre: boolean;
  icone: NomIcone;
}

const BLANC = "#FFFFFF";
const SEUIL = 4.5;
const REPLI_QCM = "#B8441F";

function canal(valeur: number): number {
  const s = valeur / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative WCAG (sRGB). */
export function luminanceRelative(hex: string): number {
  const n = hex.replace("#", "");
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Rapport de contraste WCAG entre deux couleurs #RRGGBB. */
export function contrasteWcag(a: string, b: string): number {
  const l1 = luminanceRelative(a);
  const l2 = luminanceRelative(b);
  const clair = Math.max(l1, l2);
  const sombre = Math.min(l1, l2);
  return (clair + 0.05) / (sombre + 0.05);
}

function couleurBouton(cle: CleOutil, forte: string): string {
  if (cle === "qcm" && contrasteWcag(forte, BLANC) < SEUIL) return REPLI_QCM;
  return forte;
}

function outil(
  cle: CleOutil,
  section: SectionOutil,
  titre: string,
  phrase: string,
  bouton: string,
  lien: string,
  forte: string,
  claire: string,
  fond: string,
  icone: NomIcone,
): Outil {
  return {
    cle,
    section,
    titre,
    phrase,
    bouton,
    lien,
    forte,
    claire,
    fond,
    couleurBouton: couleurBouton(cle, forte),
    encre: cle === "carte",
    icone,
  };
}

/** Les 6 cartes de Mon espace, dans l'ordre d'affichage (E.4). */
export const OUTILS: readonly Outil[] = [
  outil(
    "qcm",
    "pro",
    "Quiz Talent Unique",
    "Découvre ton Talent Unique en 6 minutes.",
    "Faire le quiz",
    "/quiz/",
    "#D4532C",
    "#F6D2C6",
    "#FDE8E1",
    "qcm",
  ),
  outil(
    "carte",
    "pro",
    "Carte du Talent",
    "Dessine ton talent comme un territoire, trouve les métiers qui te vont et ta prochaine compétence.",
    "Dessiner ma carte",
    "/carte-du-talent/",
    "#C4922A",
    "#F3E2B8",
    "#FFF3D4",
    "carte",
  ),
  outil(
    "cibleur",
    "pro",
    "Le Cibleur",
    "Trouve les clients avec qui tu réussis dans le plaisir : trois cibles, ton offre et tes premiers messages.",
    "Trouver mes clients",
    "/boussole-decision/ma-cible/",
    "#1F7A6E",
    "#C9E6E1",
    "#E5F6F3",
    "cibleur",
  ),
  outil(
    "boussole",
    "pro",
    "Boussole de décision",
    "Tu hésites entre plusieurs pistes ? Compare les avec tes propres critères.",
    "Ouvrir la Boussole",
    "/boussole-decision/",
    "#0E7490",
    "#BFE3F5",
    "#E8F5FC",
    "boussole",
  ),
  outil(
    "amour",
    "coeur",
    "Quiz Amour",
    "Ton profil amoureux et où rencontrer quelqu'un qui te correspond.",
    "Faire le Quiz Amour",
    "/quiz-amour/",
    "#C8333A",
    "#F8CFCF",
    "#FDECEC",
    "amour",
  ),
  outil(
    "relation",
    "coeur",
    "Boussole Relation",
    "Fais le point sur une relation avec tes propres critères.",
    "Ouvrir la Boussole Relation",
    "/boussole-decision/importer-quiz/?theme=amour",
    "#C8333A",
    "#F8CFCF",
    "#FDECEC",
    "boussole",
  ),
];
