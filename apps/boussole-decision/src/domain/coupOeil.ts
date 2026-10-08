// « En un coup d'œil » : un radar par relation, ou une fiche.
// Le choix de vue est mémorisé. L'impression montre les fiches.
//
// Contraste des bandeaux : blanc si ça tient, sinon brun #3A2E26.
// Si aucune des deux n'atteint 4,5:1, on éclaircit ou on assombrit le fond
// juste assez, en restant dans la même teinte.
import { COULEUR_RELATION } from "./relationApparence";
import type { RelationColor } from "./types";

export type VueCoupOeil = "radars" | "fiches";

export const VUE_DEFAUT: VueCoupOeil = "radars";
export const CLE_VUE = "boussole-coup-oeil";

/** Couleur d'accent du thème, pour une opportunité sans couleur de relation. */
export const COULEUR_ACCENT = "#e2683a";

export const TEXTE_BANDEAU_SOMBRE = "#3A2E26";
export const TEXTE_BANDEAU_CLAIR = "#ffffff";
const SEUIL_CONTRASTE = 4.5;

export function normaliserVue(valeur: unknown): VueCoupOeil {
  return valeur === "fiches" ? "fiches" : VUE_DEFAUT;
}

const FIN_TITRE = " en un coup d'œil";

/**
 * Coupe le titre français après « Tes relations » ou « Tes opportunités »,
 * pour qu'à 375 px « d'œil » ne reste pas seul sur la ligne.
 * Les autres langues restent d'un seul tenant.
 */
export function coupureTitreCoupOeil(titre: string): [string, string] | null {
  if (!titre.endsWith(FIN_TITRE)) return null;
  const debut = titre.slice(0, -FIN_TITRE.length);
  if (debut !== "Tes relations" && debut !== "Tes opportunités") return null;
  return [debut, FIN_TITRE.trim()];
}

function canalLineaire(hex: string, index: number): number {
  const c = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  return 0.2126 * canalLineaire(hex, 0) + 0.7152 * canalLineaire(hex, 1) + 0.0722 * canalLineaire(hex, 2);
}

/** Rapport de contraste WCAG entre deux couleurs #rrggbb. */
export function contraste(a: string, b: string): number {
  const clair = Math.max(luminance(a), luminance(b));
  const sombre = Math.min(luminance(a), luminance(b));
  return (clair + 0.05) / (sombre + 0.05);
}

function melanger(hex: string, cible: string, t: number): string {
  const nombre = (couleur: string, index: number) => parseInt(couleur.slice(1 + index * 2, 3 + index * 2), 16);
  const canal = (index: number) => Math.round(nombre(hex, index) + (nombre(cible, index) - nombre(hex, index)) * t);
  return `#${[0, 1, 2].map((index) => canal(index).toString(16).padStart(2, "0")).join("")}`;
}

export interface HabillageBandeau {
  fond: string;
  texte: typeof TEXTE_BANDEAU_CLAIR | typeof TEXTE_BANDEAU_SOMBRE;
}

/**
 * Fond et texte d'un bandeau. Les teintes claires (miel, abricot, ciel)
 * gardent leur couleur et passent au brun #3A2E26. Les autres restent
 * lisibles à 4,5:1, quitte à bouger un peu le fond.
 */
export function habillageBandeau(hex: string): HabillageBandeau {
  const surBlanc = contraste(hex, TEXTE_BANDEAU_CLAIR);
  const surBrun = contraste(hex, TEXTE_BANDEAU_SOMBRE);
  if (surBlanc >= SEUIL_CONTRASTE && surBlanc >= surBrun) return { fond: hex, texte: TEXTE_BANDEAU_CLAIR };
  if (surBrun >= SEUIL_CONTRASTE) return { fond: hex, texte: TEXTE_BANDEAU_SOMBRE };

  const chercher = (cible: string, texte: HabillageBandeau["texte"]) => {
    for (let i = 1; i <= 200; i++) {
      const fond = melanger(hex, cible, i / 200);
      if (contraste(fond, texte) >= SEUIL_CONTRASTE) return { t: i / 200, fond, texte };
    }
    return { t: 1, fond: cible, texte };
  };
  const eclairci = chercher("#ffffff", TEXTE_BANDEAU_SOMBRE);
  const assombri = chercher("#000000", TEXTE_BANDEAU_CLAIR);
  return eclairci.t <= assombri.t ? { fond: eclairci.fond, texte: eclairci.texte } : { fond: assombri.fond, texte: assombri.texte };
}

/** Piste de jauge : la couleur de la relation, très éclaircie. */
export function teinteClaire(hex: string): string {
  return melanger(hex, "#ffffff", 0.82);
}

const FAMILLES_AMOUR: Record<string, { court: string; complet: string }> = {
  "Le fond : besoins, respect, valeurs": { court: "Fond", complet: "Le fond" },
  "La direction commune": { court: "Direction", complet: "La direction commune" },
  "Le quotidien : défauts et frictions": { court: "Quotidien", complet: "Le quotidien" },
  "L'énergie et l'amour": { court: "Énergie", complet: "L'énergie et l'amour" },
};

/**
 * Libellé court d'un axe, et libellé de famille pour les fiches.
 * Le libellé complet du tableau reste celui enregistré, sans le couper.
 */
export function libellesFamille(label: string): { court: string; complet: string } {
  const connu = FAMILLES_AMOUR[label];
  if (connu) return connu;
  const complet = label.split(" : ")[0]?.trim() || label;
  const avant = complet.split(" & ")[0]?.trim() || complet;
  return { court: avant, complet };
}

/** Les 8 teintes de relation, pour vérifier le contraste de chaque bandeau. */
export function couleursRelation(): Record<RelationColor, string> {
  return COULEUR_RELATION;
}
