// Lecture des résultats d'une version : module pur, couvert par results.test.ts.
//
// À partir du classement (scoring.ts), il répond aux questions de la page Résultats :
// - le verdict en une phrase (en tête, coude à coude, aucune opportunité évaluée) ;
// - pour chaque opportunité, ce qui allume le talent (Contexte Déclencheur présent, autres atouts)
//   et ce qui risque de l'éteindre (Anti-Contexte présent, contexte de réussite absent) ;
// - les signaux à surveiller (un risque « à éviter » présent un peu) ;
// - les questions à poser pour les cases « ? À vérifier » ;
// - la solidité du classement si une catégorie comptait plus, ou moins.
import {
  DEFAULT_WEIGHTS,
  alignmentScore,
  rankOpportunities,
  type CriterionResult,
  type OpportunityResult,
  type ScoringCriterion,
  type ScoringOpportunity,
} from "./scoring";
import type { Category, CategoryKey, Evaluation, ImportanceWeights } from "./types";

/** Écart (en points) en dessous duquel deux opportunités sont « au coude à coude ». */
export const TIE_THRESHOLD = 5;

export type Verdict =
  | { kind: "vide" }
  | { kind: "seule"; leader: OpportunityResult }
  | { kind: "en_tete" | "coude_a_coude"; leader: OpportunityResult; runnerUp: OpportunityResult; gap: number };

/** Verdict en une phrase, à partir du classement déjà trié. */
export function verdictOf(ranking: OpportunityResult[]): Verdict {
  const scored = ranking.filter((r) => r.score !== null);
  if (scored.length === 0) return { kind: "vide" };
  const [leader, runnerUp] = scored;
  if (!runnerUp) return { kind: "seule", leader };
  const gap = (leader.score as number) - (runnerUp.score as number);
  const sameGroup = (leader.status === "non_conforme") === (runnerUp.status === "non_conforme");
  return { kind: sameGroup && Math.abs(gap) < TIE_THRESHOLD ? "coude_a_coude" : "en_tete", leader, runnerUp, gap };
}

export interface OpportunityInsight {
  result: OpportunityResult;
  /** Contexte de réussite présent : critères du Contexte Déclencheur satisfaits (« oui » ou « plutôt oui »). */
  ignites: CriterionResult[];
  /** Autres atouts : critères recherchés bien satisfaits, hors Contexte Déclencheur. */
  assets: CriterionResult[];
  /** Ce qui risque d'éteindre le talent : risques « à éviter » présents à 50 % ou plus. */
  extinguishers: CriterionResult[];
  /** Ce qui manque : critères recherchés peu ou pas satisfaits (Contexte Déclencheur d'abord). */
  missing: CriterionResult[];
  /** À surveiller : risques « à éviter » présents un peu (moins de 50 %). */
  watch: CriterionResult[];
}

const presenceOf = (d: CriterionResult) => 100 - (d.satisfaction as number);

/** Analyse d'une opportunité : contexte de réussite d'un côté, contexte d'échec de l'autre. */
export function insightOf(
  result: OpportunityResult,
  categories: Pick<Category, "id" | "key">[],
  weights: ImportanceWeights = DEFAULT_WEIGHTS,
): OpportunityInsight {
  const keyOf = new Map<string, CategoryKey | null>(categories.map((c) => [c.id, c.key]));
  const isTrigger = (d: CriterionResult) => keyOf.get(d.criterion.categoryId) === "contexte_declencheur";
  const evaluated = result.details.filter((d) => d.satisfaction !== null);
  const towards = evaluated.filter((d) => d.criterion.direction === "TOWARDS");
  const away = evaluated.filter((d) => d.criterion.direction === "AWAY_FROM");
  // Les plus importants d'abord (Bonus en dernier), puis dans l'ordre du tableau.
  const byWeight = (a: CriterionResult, b: CriterionResult) =>
    Number(b.criterion.importance !== "bonus") - Number(a.criterion.importance !== "bonus") ||
    weights[b.criterion.importance] - weights[a.criterion.importance];
  const byRisk = (a: CriterionResult, b: CriterionResult) =>
    Number(b.criterion.nonNegotiable) - Number(a.criterion.nonNegotiable) || presenceOf(b) - presenceOf(a) || byWeight(a, b);

  return {
    result,
    ignites: towards.filter((d) => isTrigger(d) && (d.satisfaction as number) >= 75).sort(byWeight),
    assets: towards.filter((d) => !isTrigger(d) && (d.satisfaction as number) >= 75).sort(byWeight),
    extinguishers: away.filter((d) => presenceOf(d) >= 50).sort(byRisk),
    missing: towards
      .filter((d) => (d.satisfaction as number) <= 25 && d.criterion.importance !== "bonus")
      .sort((a, b) => Number(isTrigger(b)) - Number(isTrigger(a)) || byWeight(a, b)),
    watch: away.filter((d) => presenceOf(d) > 0 && presenceOf(d) < 50).sort(byRisk),
  };
}

/** Question à poser (en entretien, à un futur collègue…) pour une case « ? À vérifier » ou vide. */
export function verificationQuestion(criterion: Pick<ScoringCriterion, "label" | "direction">): string {
  const label = criterion.label.trim().replace(/[.?!\s]+$/, "");
  return criterion.direction === "AWAY_FROM" ? `Y a-t-il ce risque ici : « ${label} » ?` : `Est-ce que j'aurai vraiment : « ${label} » ?`;
}

export interface StabilityFlip {
  categoryId: string;
  categoryLabel: string;
  /** « plus » : la catégorie compte deux fois plus ; « moins » : deux fois moins. */
  emphasis: "plus" | "moins";
  newLeader: ScoringOpportunity;
}

export interface Stability {
  leader: ScoringOpportunity;
  /** Catégories dont le poids, doublé ou divisé par deux, change l'opportunité en tête. Vide : classement solide. */
  flips: StabilityFlip[];
}

/**
 * Le classement tient-il ? Pour chaque catégorie, on recalcule en la faisant compter deux fois plus,
 * puis deux fois moins, et on regarde si l'opportunité en tête change. null s'il y a moins de deux
 * opportunités notées.
 */
export function rankingStability(
  opportunities: ScoringOpportunity[],
  criteria: ScoringCriterion[],
  evaluations: Evaluation[],
  categories: Pick<Category, "id" | "label">[],
  weights: ImportanceWeights = DEFAULT_WEIGHTS,
): Stability | null {
  const leaderOf = (ranking: OpportunityResult[]) => ranking.find((r) => r.score !== null)?.opportunity ?? null;
  const base = rankOpportunities(opportunities, criteria, evaluations, weights);
  const leader = leaderOf(base);
  if (!leader || base.filter((r) => r.score !== null).length < 2) return null;

  const flips: StabilityFlip[] = [];
  for (const category of categories) {
    if (!criteria.some((c) => c.categoryId === category.id)) continue;
    for (const [emphasis, coef] of [
      ["plus", 2],
      ["moins", 0.5],
    ] as const) {
      const ranking = rankOpportunities(opportunities, criteria, evaluations, weights, (c) => (c.categoryId === category.id ? coef : 1));
      const newLeader = leaderOf(ranking);
      if (newLeader && newLeader.id !== leader.id)
        flips.push({ categoryId: category.id, categoryLabel: category.label, emphasis, newLeader });
    }
  }
  return { leader, flips };
}

/**
 * Ikigai : quatre cercles qui comptent chacun pour 25 %.
 * - Ce en quoi je suis doué·e : mon talent en action (Contexte Déclencheur & Flow) ;
 * - Ce que j'aime : la vie que j'aime mener, sans ce qui m'éteint (Conditions de Vie & QVT, Anti-Contexte évité) ;
 * - Ce dont le monde a besoin : ce qui correspond à mes valeurs, à mes choix (Alignement Valeurs & Culture) ;
 * - Ce pour quoi je peux être payé·e : gagner ma vie (Rémunération & Viabilité Financière).
 * Au centre, l'ikigai : la moyenne des quatre cercles, calculée seulement quand les quatre sont évalués.
 */
export type IkigaiCircleKey = "aime" | "doue" | "monde" | "paye";

export const IKIGAI_CIRCLES: { key: IkigaiCircleKey; label: string; short: string; categories: CategoryKey[] }[] = [
  { key: "aime", label: "Ce que j'aime", short: "J'aime", categories: ["conditions_vie", "anti_contexte"] },
  { key: "doue", label: "Ce en quoi je suis doué·e", short: "Doué·e", categories: ["contexte_declencheur"] },
  { key: "monde", label: "Ce dont le monde a besoin", short: "Utile au monde", categories: ["valeurs_culture"] },
  { key: "paye", label: "Ce pour quoi je peux être payé·e", short: "Payé·e", categories: ["remuneration"] },
];

/** Ce que l'on ressent quand un cercle manque (d'après le schéma classique de l'ikigai). */
export const IKIGAI_MISSING: Record<IkigaiCircleKey, string> = {
  aime: "Confortable, mais avec un sentiment de vide",
  doue: "Enthousiasmant, mais avec un sentiment d'incertitude",
  monde: "Satisfaisant, mais avec un sentiment d'inutilité",
  paye: "Plaisir et plénitude, mais sans assez gagner sa vie",
};

/** Seuil sous lequel un cercle de l'ikigai est considéré comme manquant. */
export const IKIGAI_WEAK = 50;

export interface Ikigai {
  circles: { key: IkigaiCircleKey; label: string; score: number | null }[];
  /** Moyenne des quatre cercles (25 % chacun), ou null s'il en manque un. */
  total: number | null;
}

export function ikigaiOf(
  result: OpportunityResult,
  categories: Pick<Category, "id" | "key">[],
  weights: ImportanceWeights = DEFAULT_WEIGHTS,
): Ikigai {
  const keyOf = new Map<string, CategoryKey | null>(categories.map((c) => [c.id, c.key]));
  const circles = IKIGAI_CIRCLES.map((circle) => {
    const details = result.details.filter((d) => {
      const key = keyOf.get(d.criterion.categoryId);
      return key != null && circle.categories.includes(key);
    });
    return { key: circle.key, label: circle.label, score: alignmentScore(details, weights) };
  });
  const scores = circles.map((c) => c.score);
  const total = scores.every((s) => s !== null) ? (scores as number[]).reduce((a, b) => a + b, 0) / scores.length : null;
  return { circles, total };
}
