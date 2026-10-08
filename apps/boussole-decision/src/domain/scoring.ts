// Moteur de calcul de la Boussole : module pur, sans dépendance, couvert par scoring.test.ts.
//
// Règles :
// - Satisfaction d'un critère (0 à 100) : « pour aller vers » → la valeur évaluée ;
//   « à éviter » → 100 − présence du risque.
// - Poids : le barème de la version, par défaut Critique 5, Très important 4, Important 3,
//   Moyennement important 2, Bof 1 (un niveau à 0 ne compte pas).
// - Score d'alignement global (%) = (Σ poids × satisfaction + bonus) / Σ (poids × 100),
//   sur les critères évalués. Un critère Bonus n'entre pas au dénominateur : il ajoute
//   jusqu'à son poids (1 par défaut) s'il est satisfait, et n'en retire jamais. Le score est plafonné à 100.
// - « ? À vérifier » et les cases vides sont exclus du calcul et listés « à vérifier ».
// - Un pourcentage libre (0 à 100, pas de 5) devient directement la valeur de la note, de 0 à 1.
//   Les notes en mots ne changent pas. Un pourcentage ≤ 50 compte comme « À moitié ou moins »
//   pour les alertes Critique et non négociable : même seuil qu'aujourd'hui (voir pourcentage.ts).
// - Non négociable : respecté seulement à 100 % de satisfaction (« Oui », ou « Absent » pour un risque,
//   ou un pourcentage de 100). Un échec rend l'opportunité « non conforme » : elle garde son score
//   mais passe après les autres.
// - Anti-Contexte : un critère « à éviter » présent à 50 % ou plus déclenche une alerte ;
//   un « à éviter » non négociable franchi, même un peu, est une ligne rouge.
import { pourcentageValide } from "./pourcentage";
import type { Criterion, Evaluation, EvaluationValue, Importance, ImportanceWeights, Opportunity } from "./types";

export const EVALUATION_PERCENT: Record<EvaluationValue, number | null> = {
  non: 0,
  p25: 25,
  p50: 50,
  p75: 75,
  oui: 100,
  inconnu: null,
};

/** Barème par défaut. Pour « bonus » : poids maximal qu'un critère Bonus satisfait ajoute au numérateur. */
export const DEFAULT_WEIGHTS: ImportanceWeights = {
  critique: 5,
  tres_important: 4,
  important: 3,
  moyen: 2,
  bof: 1,
  bonus: 1,
};

/** Poids maximal d'un niveau dans le barème. */
export const MAX_WEIGHT = 10;

/** Barème lu en base, ramené à des entiers de 0 à MAX_WEIGHT (valeur par défaut si absente ou invalide). */
export function normalizeWeights(raw: unknown): ImportanceWeights {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = { ...DEFAULT_WEIGHTS };
  for (const level of Object.keys(DEFAULT_WEIGHTS) as Importance[]) {
    const v = Number(source[level]);
    if (Number.isFinite(v)) out[level] = Math.min(MAX_WEIGHT, Math.max(0, Math.round(v)));
  }
  return out;
}

/** Niveaux retenus pour les points forts et points faibles. */
const MAJOR_LEVELS: Importance[] = ["critique", "tres_important", "important"];

/** Seuil de présence à partir duquel un Anti-Contexte déclenche une alerte. */
export const ANTI_CONTEXT_ALERT_THRESHOLD = 50;

export type ScoringCriterion = Pick<Criterion, "id" | "categoryId" | "label" | "importance" | "nonNegotiable" | "direction">;
export type ScoringOpportunity = Pick<Opportunity, "id" | "name">;

export type DealbreakerStatus = "conforme" | "a_verifier" | "non_conforme";

export interface AntiContextAlert {
  criterionId: string;
  label: string;
  /** Présence du risque, de 0 à 100. */
  presence: number;
  /** ligne_rouge : « à éviter » non négociable franchi ; alerte : Anti-Contexte présent à 50 % ou plus. */
  severity: "ligne_rouge" | "alerte";
}

export interface CriterionResult {
  criterion: ScoringCriterion;
  /** Valeur saisie, ou null si la case est vide. */
  value: EvaluationValue | null;
  /** Pourcentage libre, s'il a été saisi. Il prime sur la note en mots. */
  percent?: number;
  /** Satisfaction 0-100, ou null si non évalué (vide ou « à vérifier »). */
  satisfaction: number | null;
}

export interface CategoryScore {
  categoryId: string;
  score: number | null;
  evaluated: number;
  total: number;
}

export interface OpportunityResult {
  opportunity: ScoringOpportunity;
  /** Score d'alignement global, de 0 à 100, ou null si aucun critère pondéré n'est évalué. */
  score: number | null;
  status: DealbreakerStatus;
  failedNonNegotiables: CriterionResult[];
  antiContextAlerts: AntiContextAlert[];
  /** Critères non évalués (vides ou « à vérifier »). */
  toVerify: CriterionResult[];
  evaluatedCount: number;
  criteriaCount: number;
  byCategory: CategoryScore[];
  strengths: CriterionResult[];
  weaknesses: CriterionResult[];
  details: CriterionResult[];
}

/**
 * Présence saisie, de 0 à 100 (0 à 1 dans le score).
 * Un pourcentage libre est pris tel quel. Sans lui, la note en mots garde son barème.
 */
export function presenceDe(note: EvaluationValue | Pick<Evaluation, "value" | "percent"> | null | undefined): number | null {
  if (!note) return null;
  if (typeof note !== "string" && pourcentageValide(note.percent)) return note.percent;
  const value = typeof note === "string" ? note : note.value;
  return EVALUATION_PERCENT[value];
}

export function satisfactionOf(
  criterion: Pick<Criterion, "direction">,
  value: EvaluationValue | Pick<Evaluation, "value" | "percent"> | null | undefined,
): number | null {
  const pct = presenceDe(value);
  if (pct === null) return null;
  return criterion.direction === "AWAY_FROM" ? 100 - pct : pct;
}

/** Coefficient appliqué au poids d'un critère (sert à tester la solidité du classement). */
export type WeightFactor = (criterion: ScoringCriterion) => number;

/** Score d'alignement (0 à 100) d'un ensemble de critères évalués, ou null si aucun critère pondéré n'est évalué. */
export function alignmentScore(results: CriterionResult[], weights: ImportanceWeights, factor?: WeightFactor): number | null {
  let num = 0;
  let den = 0;
  for (const r of results) {
    if (r.satisfaction === null) continue;
    const weight = weights[r.criterion.importance] * (factor ? factor(r.criterion) : 1);
    if (r.criterion.importance === "bonus") {
      num += weight * r.satisfaction;
      continue;
    }
    num += weight * r.satisfaction;
    den += weight * 100;
  }
  return den === 0 ? null : Math.min(100, (num / den) * 100);
}

const evaluationKey = (criterionId: string, opportunityId: string) => `${criterionId}:${opportunityId}`;

export function indexEvaluations(evaluations: Evaluation[]): Map<string, Pick<Evaluation, "value" | "percent">> {
  return new Map(evaluations.map((e) => [evaluationKey(e.criterionId, e.opportunityId), { value: e.value, percent: e.percent }]));
}

/** Teste une opportunité face à l'ensemble des critères. */
export function scoreOpportunity(
  opportunity: ScoringOpportunity,
  criteria: ScoringCriterion[],
  evaluations: Map<string, Pick<Evaluation, "value" | "percent">> | Evaluation[],
  weights: ImportanceWeights = DEFAULT_WEIGHTS,
  factor?: WeightFactor,
): OpportunityResult {
  const index = evaluations instanceof Map ? evaluations : indexEvaluations(evaluations);

  const details: CriterionResult[] = criteria.map((criterion) => {
    const note = index.get(evaluationKey(criterion.id, opportunity.id)) ?? null;
    const value = note?.value ?? null;
    const percent = note && pourcentageValide(note.percent) ? note.percent : undefined;
    return { criterion, value, ...(percent !== undefined ? { percent } : {}), satisfaction: satisfactionOf(criterion, note) };
  });

  const nonNegotiables = details.filter((d) => d.criterion.nonNegotiable);
  const failedNonNegotiables = nonNegotiables.filter((d) => d.satisfaction !== null && d.satisfaction < 100);
  const unknownNonNegotiables = nonNegotiables.filter((d) => d.satisfaction === null);
  const status: DealbreakerStatus =
    failedNonNegotiables.length > 0 ? "non_conforme" : unknownNonNegotiables.length > 0 ? "a_verifier" : "conforme";

  const antiContextAlerts: AntiContextAlert[] = details
    .filter((d) => d.criterion.direction === "AWAY_FROM" && d.satisfaction !== null)
    .map((d) => ({ d, presence: 100 - (d.satisfaction as number) }))
    .filter(({ d, presence }) => (d.criterion.nonNegotiable ? presence > 0 : presence >= ANTI_CONTEXT_ALERT_THRESHOLD))
    .map(({ d, presence }) => ({
      criterionId: d.criterion.id,
      label: d.criterion.label,
      presence,
      severity: d.criterion.nonNegotiable ? ("ligne_rouge" as const) : ("alerte" as const),
    }))
    .sort((a, b) => (a.severity === b.severity ? b.presence - a.presence : a.severity === "ligne_rouge" ? -1 : 1));

  const categoryIds = [...new Set(criteria.map((c) => c.categoryId))];
  const byCategory: CategoryScore[] = categoryIds.map((categoryId) => {
    const inCategory = details.filter((d) => d.criterion.categoryId === categoryId);
    return {
      categoryId,
      score: alignmentScore(inCategory, weights, factor),
      evaluated: inCategory.filter((d) => d.satisfaction !== null).length,
      total: inCategory.length,
    };
  });

  const impact = (d: CriterionResult) => weights[d.criterion.importance] * Math.abs((d.satisfaction ?? 50) - 50);
  const major = details.filter((d) => MAJOR_LEVELS.includes(d.criterion.importance) && d.satisfaction !== null);

  return {
    opportunity,
    score: alignmentScore(details, weights, factor),
    status,
    failedNonNegotiables,
    antiContextAlerts,
    toVerify: details.filter((d) => d.satisfaction === null),
    evaluatedCount: details.filter((d) => d.satisfaction !== null).length,
    criteriaCount: details.length,
    byCategory,
    strengths: major.filter((d) => (d.satisfaction as number) >= 75).sort((a, b) => impact(b) - impact(a)),
    weaknesses: major.filter((d) => (d.satisfaction as number) <= 25).sort((a, b) => impact(b) - impact(a)),
    details,
  };
}

/**
 * Classement final : les opportunités conformes ou « à vérifier » d'abord, les non conformes ensuite ;
 * dans chaque groupe, du meilleur au moins bon score (score non calculable en dernier),
 * puis la plus complète, puis par nom.
 */
export function rankOpportunities(
  opportunities: ScoringOpportunity[],
  criteria: ScoringCriterion[],
  evaluations: Evaluation[],
  weights: ImportanceWeights = DEFAULT_WEIGHTS,
  factor?: WeightFactor,
): OpportunityResult[] {
  const index = indexEvaluations(evaluations);
  return opportunities
    .map((o) => scoreOpportunity(o, criteria, index, weights, factor))
    .sort((a, b) => {
      const ga = a.status === "non_conforme" ? 1 : 0;
      const gb = b.status === "non_conforme" ? 1 : 0;
      if (ga !== gb) return ga - gb;
      if (a.score !== b.score) return (b.score ?? -1) - (a.score ?? -1);
      const ca = a.criteriaCount ? a.evaluatedCount / a.criteriaCount : 0;
      const cb = b.criteriaCount ? b.evaluatedCount / b.criteriaCount : 0;
      if (ca !== cb) return cb - ca;
      return a.opportunity.name.localeCompare(b.opportunity.name, "fr");
    });
}

/** Score arrondi pour l'affichage : « 81 % » (français, espagnol) ou « 81% » (anglais), ou « — » s'il n'est pas calculable. */
export function formatScore(score: number | null, locale: "fr" | "en" | "es" = "fr"): string {
  if (score === null) return "—";
  return locale === "en" ? `${Math.round(score)}%` : `${Math.round(score)} %`;
}
