// Textes de la Boussole Relation dans la langue de l'interface. L'espagnol reste le français (lot ES).
// Les critères sont enregistrés dans la langue du jour de leur création : on les reconnaît dans toutes les langues.
import type { Locale } from "@/i18n/config";
import { LOVE_RESULTS, LOVE_TABLE, LOVE_TEMPLATE, LOVE_TEXTS, type LoveResults, type LoveTable, type LoveTemplate, type LoveTexts } from "./amour";
import { LOVE_RESULTS_EN, LOVE_TABLE_EN, LOVE_TEMPLATE_EN, LOVE_TEXTS_EN } from "./amourEn";

export interface LoveContent {
  template: LoveTemplate;
  texts: LoveTexts;
  table: LoveTable;
  results: LoveResults;
}

const FR: LoveContent = { template: LOVE_TEMPLATE, texts: LOVE_TEXTS, table: LOVE_TABLE, results: LOVE_RESULTS };
const EN: LoveContent = { template: LOVE_TEMPLATE_EN, texts: LOVE_TEXTS_EN, table: LOVE_TABLE_EN, results: LOVE_RESULTS_EN };

/** Textes amour de la langue demandée (l'espagnol reçoit le français). */
export function amourPour(locale: Locale): LoveContent {
  return locale === "en" ? EN : FR;
}

/** Tous les modèles, pour reconnaître un critère ou une catégorie quelle que soit sa langue de création. */
export const MODELES_AMOUR: readonly LoveTemplate[] = [LOVE_TEMPLATE, LOVE_TEMPLATE_EN];

/** Clé du critère du modèle (« respect », « energie »…) d'après son libellé, en français comme en anglais. */
export function cleCritereAmour(label: string): string | null {
  for (const modele of MODELES_AMOUR) {
    const trouve = modele.criteria.find((c) => c.label === label);
    if (trouve) return trouve.key;
  }
  return null;
}

/** Clé de la catégorie du modèle (« fond », « energie »…) d'après son libellé, dans n'importe quelle langue. */
export function cleCategorieAmour(label: string): string | null {
  for (const modele of MODELES_AMOUR) {
    const trouve = modele.categories.find((c) => c.label === label);
    if (trouve) return trouve.key;
  }
  return null;
}

/** Le critère du modèle dans la langue demandée, retrouvé d'après un libellé enregistré dans n'importe quelle langue. */
export function critereModeleAmour(label: string, locale: Locale) {
  const cle = cleCritereAmour(label);
  return cle ? (amourPour(locale).template.criteria.find((c) => c.key === cle) ?? null) : null;
}
