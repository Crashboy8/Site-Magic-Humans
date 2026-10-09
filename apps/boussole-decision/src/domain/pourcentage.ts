// Pourcentage libre d'une case (0 à 100, pas de 5).
//
// Il devient directement la valeur de la note, de 0 à 1. Le moteur la manipule
// de 0 à 100, comme les notes en mots. Celles-ci ne changent pas :
// Oui 100, Plutôt oui 75, À moitié 50, Plutôt non 25, Non 0.
// « ? À vérifier » reste exclu du score.
//
// Alertes Critique et non négociable : un pourcentage ≤ 50 compte comme
// « À moitié ou moins », le même seuil qu'aujourd'hui.
// - Critère Critique « pour aller vers » : alerte si la satisfaction est ≤ 50.
//   50 % alerte, 55 % n'alerte pas.
// - Non négociable « pour aller vers » : respecté seulement à 100 %, comme « Oui ».
//   50 % ne le respecte donc pas, au même titre qu'« À moitié ». 100 % le respecte.
// - Non négociable « à éviter » : franchi dès que la présence dépasse 0.
// - Anti-Contexte : alerte dès 50 % de présence.
//
// Stockage : colonne optionnelle `percent`. Si elle manque, le pourcentage
// reste dans le navigateur (localStorage) et la colonne `value` garde la note
// en mots la plus proche, pour que les données déjà enregistrées restent lisibles.
import type { Evaluation, EvaluationValue } from "./types";

/** Pas du curseur. */
export const PAS_POURCENTAGE = 5;

/** Aide affichée sous les critères pour lesquels un pourcentage est le plus parlant. */
export const AIDE_POURCENTAGE = "Tu peux mettre un pourcentage, de 0 à 100.";
/** La même aide en anglais (critères créés en anglais). */
export const AIDE_POURCENTAGE_EN = "You can enter a percentage, from 0 to 100.";

/** Et en espagnol. */
export const AIDE_POURCENTAGE_ES = "Puedes poner un porcentaje, de 0 a 100.";

/** L'aide dans la langue de l'interface. */
export function aidePourcentage(locale: "fr" | "en" | "es"): string {
  return locale === "en" ? AIDE_POURCENTAGE_EN : locale === "es" ? AIDE_POURCENTAGE_ES : AIDE_POURCENTAGE;
}

/** Vrai si la description du critère propose un pourcentage, quelle que soit sa langue. */
export function proposePourcentage(description: string): boolean {
  return description.includes(AIDE_POURCENTAGE) || description.includes(AIDE_POURCENTAGE_EN) || description.includes(AIDE_POURCENTAGE_ES);
}

const PALIERS: readonly [number, EvaluationValue][] = [
  [0, "non"],
  [25, "p25"],
  [50, "p50"],
  [75, "p75"],
  [100, "oui"],
];

/** Vrai pour un entier de 0 à 100, multiple de 5. 0 est un pourcentage valide. */
export function pourcentageValide(valeur: unknown): valeur is number {
  return typeof valeur === "number" && Number.isInteger(valeur) && valeur >= 0 && valeur <= 100 && valeur % PAS_POURCENTAGE === 0;
}

/** Ramène une saisie clavier au pas de 5, entre 0 et 100. */
export function auPas(valeur: number): number {
  if (!Number.isFinite(valeur)) return 0;
  const arrondi = Math.round(valeur / PAS_POURCENTAGE) * PAS_POURCENTAGE;
  return Math.min(100, Math.max(0, arrondi));
}

/** Note en mots la plus proche. Sert de repli dans la colonne enum, sans remplacer le pourcentage. */
export function valeurProche(pourcent: number): EvaluationValue {
  let meilleur: EvaluationValue = "non";
  let ecart = Number.POSITIVE_INFINITY;
  for (const [palier, valeur] of PALIERS) {
    const d = Math.abs(palier - pourcent);
    if (d < ecart) {
      ecart = d;
      meilleur = valeur;
    }
  }
  return meilleur;
}

/**
 * Complète une évaluation lue en base avec le cache du navigateur.
 * - `percent` nombre : la colonne a parlé, on la garde.
 * - `percent` null : la colonne existe et la case est une note en mots. Le cache ne la recouvre pas.
 * - `percent` absent : pas de colonne. On reprend le cache seulement s'il correspond à la note en mots stockée.
 */
export function appliquerPourcentageLocal(evaluation: Evaluation, local: number | undefined): Evaluation {
  if (pourcentageValide(evaluation.percent)) {
    return { criterionId: evaluation.criterionId, opportunityId: evaluation.opportunityId, value: evaluation.value, percent: evaluation.percent };
  }
  if (evaluation.percent === null) {
    return { criterionId: evaluation.criterionId, opportunityId: evaluation.opportunityId, value: evaluation.value };
  }
  if (pourcentageValide(local) && valeurProche(local) === evaluation.value) {
    return { ...evaluation, percent: local };
  }
  return { criterionId: evaluation.criterionId, opportunityId: evaluation.opportunityId, value: evaluation.value };
}

export function clePourcentage(criterionId: string, opportunityId: string): string {
  return `${criterionId}:${opportunityId}`;
}
