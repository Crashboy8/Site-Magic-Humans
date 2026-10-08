// Lecture « mode amour » d'une opportunité (ici : une relation). Module pur, couvert par loveReading.test.ts.
// Règles :
// - Tranche selon le score d'alignement arrondi : 80+ solide, 65-79 base, 50-64 tension, moins de 50 désalignement.
// - Alerte critique : tout critère « pour aller vers » d'importance Critique noté 50 % ou moins
//   (À moitié, Plutôt non, Non, ou un pourcentage libre ≤ 50). 55 % ne déclenche pas l'alerte.
//   Un non négociable « pour aller vers » n'est respecté qu'à 100 % : un pourcentage ≤ 50 le manque,
//   comme « À moitié ». Voir pourcentage.ts.
// - Ligne rouge : critère « à éviter » non négociable présent (déjà calculé par scoring.ts, severity « ligne_rouge »).
//   Texte : présence ≤ 50 % → ligneRougeLow ; au-dessus → ligneRougeHigh.
// - Sécurité : critère « respect » (libellé du modèle) noté 25 % ou moins : texte d'aide affiché en premier.
// - Énergie : critère « energie » noté 25 % ou moins, après les alertes critiques.
// - Lecture provisoire si moins de 7 critères évalués, ou s'il reste au moins un critère critique non évalué.
import { LOVE_TEMPLATE, LOVE_TEXTS, type LoveBandKey } from "@/content/amour";
import type { OpportunityResult } from "./scoring";

export const LOVE_CRITICAL_THRESHOLD = 50;
export const LOVE_SAFETY_THRESHOLD = 25;
export const LOVE_ENERGY_THRESHOLD = 25;
export const LOVE_MIN_EVALUATED = 7;

export interface LoveAlert {
  kind: "securite" | "ligne_rouge" | "critique" | "energie";
  criterionId: string;
  text: string;
}

export interface LoveReading {
  score: number | null;
  band: LoveBandKey | null;
  alerts: LoveAlert[];
  provisional: boolean;
  missing: number;
}

export function bandOf(score: number): LoveBandKey {
  const s = Math.round(score);
  if (s >= 80) return "solide";
  if (s >= 65) return "base";
  if (s >= 50) return "tension";
  return "desalignement";
}

const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
const templateByLabel = new Map<string, (typeof LOVE_TEMPLATE.criteria)[number]>(LOVE_TEMPLATE.criteria.map((c) => [c.label, c]));
const RESPECT_LABEL = LOVE_TEMPLATE.criteria.find((c) => c.key === "respect")!.label;
const ENERGY_LABEL = LOVE_TEMPLATE.criteria.find((c) => c.key === "energie")!.label;

export function loveReadingOf(result: OpportunityResult): LoveReading {
  const alerts: LoveAlert[] = [];
  for (const d of result.details) {
    if (d.satisfaction === null) continue;
    if (d.criterion.label === RESPECT_LABEL && d.satisfaction <= LOVE_SAFETY_THRESHOLD)
      alerts.push({ kind: "securite", criterionId: d.criterion.id, text: LOVE_TEXTS.safety });
  }
  for (const a of result.antiContextAlerts) {
    if (a.severity !== "ligne_rouge") continue;
    alerts.push({ kind: "ligne_rouge", criterionId: a.criterionId, text: a.presence > 50 ? LOVE_TEXTS.ligneRougeHigh : LOVE_TEXTS.ligneRougeLow });
  }
  for (const d of result.details) {
    const c = d.criterion;
    if (d.satisfaction === null || c.direction !== "TOWARDS" || c.importance !== "critique") continue;
    if (d.satisfaction > LOVE_CRITICAL_THRESHOLD) continue;
    const tpl = templateByLabel.get(c.label);
    alerts.push({ kind: "critique", criterionId: c.id, text: tpl?.alert || fill(LOVE_TEXTS.genericAlert, { label: c.label }) });
  }
  for (const d of result.details) {
    if (d.satisfaction === null || d.criterion.label !== ENERGY_LABEL) continue;
    if (d.satisfaction > LOVE_ENERGY_THRESHOLD) continue;
    alerts.push({ kind: "energie", criterionId: d.criterion.id, text: LOVE_TEXTS.energyAlert });
  }
  const missing = result.toVerify.length;
  const criticalUnknown = result.toVerify.some((d) => d.criterion.importance === "critique");
  return {
    score: result.score,
    band: result.score === null ? null : bandOf(result.score),
    alerts,
    provisional: result.evaluatedCount < LOVE_MIN_EVALUATED || criticalUnknown,
    missing,
  };
}
