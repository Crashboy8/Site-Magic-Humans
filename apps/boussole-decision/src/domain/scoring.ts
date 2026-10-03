// Moteur de calcul de la Boussole : module pur, sans dépendance, couvert par scoring.test.ts.
//
// Règles :
// - Satisfaction d'un critère (0 à 100) : TOWARDS → la valeur évaluée ; AWAY_FROM → 100 − présence du risque.
// - Score d'alignement global (%) = Σ(poids × satisfaction) / Σ(poids × 100), sur les critères WEIGHTED évalués.
// - « Je ne sais pas encore » et les cases vides sont exclus du calcul et listés « à vérifier ».
// - DEALBREAKER : respecté seulement à 100 % de satisfaction (« Oui », ou « Absent » pour un risque).
//   Un échec rend l'opportunité « non conforme » : elle garde son score mais passe après les autres.
// - Anti-Contexte : tout critère AWAY_FROM présent à 50 % ou plus déclenche une alerte ;
//   une ligne rouge (AWAY_FROM éliminatoire) franchie, même un peu, est signalée comme telle.
import type { Criterion, Evaluation, EvaluationValue, Opportunity } from "./types";

export const EVALUATION_PERCENT: Record<EvaluationValue, number | null> = {
  non: 0,
  p25: 25,
  p50: 50,
  p75: 75,
  oui: 100,
  inconnu: null,
};

/** Seuil de présence à partir duquel un Anti-Contexte pondéré déclenche une alerte. */
export const ANTI_CONTEXT_ALERT_THRESHOLD = 50;

export type ScoringCriterion = Pick<Criterion, "id" | "categoryId" | "label" | "kind" | "weight" | "direction">;
export type ScoringOpportunity = Pick<Opportunity, "id" | "name">;

export type DealbreakerStatus = "conforme" | "a_verifier" | "non_conforme";

export interface AntiContextAlert {
  criterionId: string;
  label: string;
  /** Présence du risque, de 0 à 100. */
  presence: number;
  /** ligne_rouge : critère éliminatoire franchi ; alerte : Anti-Contexte pondéré présent à 50 % ou plus. */
  severity: "ligne_rouge" | "alerte";
}

export interface CriterionResult {
  criterion: ScoringCriterion;
  /** Valeur saisie, ou null si la case est vide. */
  value: EvaluationValue | null;
  /** Satisfaction 0-100, ou null si non évalué (vide ou « Je ne sais pas encore »). */
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
  failedDealbreakers: CriterionResult[];
  antiContextAlerts: AntiContextAlert[];
  /** Critères non évalués (vides ou « Je ne sais pas encore »). */
  toVerify: CriterionResult[];
  evaluatedCount: number;
  criteriaCount: number;
  byCategory: CategoryScore[];
  strengths: CriterionResult[];
  weaknesses: CriterionResult[];
  details: CriterionResult[];
}

export function satisfactionOf(criterion: Pick<Criterion, "direction">, value: EvaluationValue | null | undefined): number | null {
  if (!value) return null;
  const pct = EVALUATION_PERCENT[value];
  if (pct === null) return null;
  return criterion.direction === "AWAY_FROM" ? 100 - pct : pct;
}

function weightedScore(results: CriterionResult[]): number | null {
  let num = 0;
  let den = 0;
  for (const r of results) {
    if (r.criterion.kind !== "WEIGHTED" || r.criterion.weight === null || r.satisfaction === null) continue;
    num += r.criterion.weight * r.satisfaction;
    den += r.criterion.weight * 100;
  }
  return den === 0 ? null : (num / den) * 100;
}

const evaluationKey = (criterionId: string, opportunityId: string) => `${criterionId}:${opportunityId}`;

export function indexEvaluations(evaluations: Evaluation[]): Map<string, EvaluationValue> {
  return new Map(evaluations.map((e) => [evaluationKey(e.criterionId, e.opportunityId), e.value]));
}

/** Teste une opportunité face à l'ensemble des critères. */
export function scoreOpportunity(
  opportunity: ScoringOpportunity,
  criteria: ScoringCriterion[],
  evaluations: Map<string, EvaluationValue> | Evaluation[],
): OpportunityResult {
  const index = evaluations instanceof Map ? evaluations : indexEvaluations(evaluations);

  const details: CriterionResult[] = criteria.map((criterion) => {
    const value = index.get(evaluationKey(criterion.id, opportunity.id)) ?? null;
    return { criterion, value, satisfaction: satisfactionOf(criterion, value) };
  });

  const dealbreakers = details.filter((d) => d.criterion.kind === "DEALBREAKER");
  const failedDealbreakers = dealbreakers.filter((d) => d.satisfaction !== null && d.satisfaction < 100);
  const unknownDealbreakers = dealbreakers.filter((d) => d.satisfaction === null);
  const status: DealbreakerStatus =
    failedDealbreakers.length > 0 ? "non_conforme" : unknownDealbreakers.length > 0 ? "a_verifier" : "conforme";

  const antiContextAlerts: AntiContextAlert[] = details
    .filter((d) => d.criterion.direction === "AWAY_FROM" && d.satisfaction !== null)
    .map((d) => ({ d, presence: 100 - (d.satisfaction as number) }))
    .filter(({ d, presence }) =>
      d.criterion.kind === "DEALBREAKER" ? presence > 0 : presence >= ANTI_CONTEXT_ALERT_THRESHOLD,
    )
    .map(({ d, presence }) => ({
      criterionId: d.criterion.id,
      label: d.criterion.label,
      presence,
      severity: d.criterion.kind === "DEALBREAKER" ? ("ligne_rouge" as const) : ("alerte" as const),
    }))
    .sort((a, b) => (a.severity === b.severity ? b.presence - a.presence : a.severity === "ligne_rouge" ? -1 : 1));

  const categoryIds = [...new Set(criteria.map((c) => c.categoryId))];
  const byCategory: CategoryScore[] = categoryIds.map((categoryId) => {
    const inCategory = details.filter((d) => d.criterion.categoryId === categoryId);
    return {
      categoryId,
      score: weightedScore(inCategory),
      evaluated: inCategory.filter((d) => d.satisfaction !== null).length,
      total: inCategory.length,
    };
  });

  const impact = (d: CriterionResult) => (d.criterion.weight ?? 0) * Math.abs((d.satisfaction ?? 50) - 50);
  const major = details.filter((d) => d.criterion.kind === "WEIGHTED" && (d.criterion.weight ?? 0) >= 3 && d.satisfaction !== null);

  return {
    opportunity,
    score: weightedScore(details),
    status,
    failedDealbreakers,
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
): OpportunityResult[] {
  const index = indexEvaluations(evaluations);
  return opportunities
    .map((o) => scoreOpportunity(o, criteria, index))
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

/** Score arrondi pour l'affichage : « 81 % », ou « — » s'il n'est pas calculable. */
export function formatScore(score: number | null): string {
  return score === null ? "—" : `${Math.round(score)} %`;
}
