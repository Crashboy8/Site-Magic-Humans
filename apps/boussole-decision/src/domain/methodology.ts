// Terminologie officielle Magic Humans / MO2I. Toute l'interface s'appuie sur ces textes.
import type { CategoryKey, CriterionDirection, CriterionKind, EvaluationValue, TalentUnique, Weight } from "./types";

export const TALENT_TERMS = {
  talentUnique: "Talent Unique",
  talentUniqueDefinition: "L'aptitude naturelle et le mode d'action spontané de la personne.",
  contexteDeclencheur: "Contexte Déclencheur",
  contexteDeclencheurDefinition:
    "L'environnement, la dynamique de groupe ou le type de problème spécifique qui active instantanément le talent et l'état de Flow.",
  mecanisme: "Mécanisme",
  mecanismeDefinition: "La manière spécifique dont le talent s'exprime et transforme le réel.",
  superBenefice: "Super bénéfice",
  superBeneficeDefinition: "La valeur ajoutée démesurée et l'impact profond générés naturellement, sans effort perçu.",
  antiContexte: "Anti-Contexte",
  antiContexteDefinition:
    "L'environnement toxique ou inadapté qui éteint le talent, génère de la friction, de la fatigue ou de la souffrance.",
} as const;

/** Formulation officielle : « Je [Mécanisme] dans un environnement où [Contexte Déclencheur], afin de [Super bénéfice]. » */
export function talentSentence(t: Pick<TalentUnique, "mecanisme" | "contexteDeclencheur" | "superBenefice">): string | null {
  const m = t.mecanisme.trim().replace(/^je\s+/i, "");
  const c = t.contexteDeclencheur.trim().replace(/^(dans un environnement )?où\s+/i, "");
  const s = t.superBenefice.trim().replace(/^afin de\s+/i, "").replace(/[.\s]+$/, "");
  if (!m || !c || !s) return null;
  return `Je ${m} dans un environnement où ${c}, afin de ${s}.`;
}

export const WEIGHT_LABELS: Record<Weight, string> = {
  5: "Crucial",
  4: "Très important",
  3: "Important",
  2: "Souhaitable",
  1: "Bonus",
};

export const KIND_LABELS: Record<CriterionKind, { label: string; hint: string }> = {
  WEIGHTED: { label: "Pondéré", hint: "Compte dans le score selon son poids, de 1 (Bonus) à 5 (Crucial)." },
  DEALBREAKER: {
    label: "Éliminatoire",
    hint: "Non négociable : s'il n'est pas respecté, l'opportunité est signalée et classée après les autres.",
  },
};

export const DIRECTION_LABELS: Record<CriterionDirection, { label: string; hint: string; question: string }> = {
  TOWARDS: {
    label: "Pour aller vers",
    hint: "Ce que tu recherches.",
    question: "Cette opportunité t'apporte-t-elle cela ?",
  },
  AWAY_FROM: {
    label: "Pour éviter",
    hint: "Ce que tu veux fuir : on évalue sa présence, et plus il est présent, plus le score baisse.",
    question: "Ce risque est-il présent dans cette opportunité ?",
  },
};

/** Libellés d'évaluation : pour un critère AWAY_FROM, on évalue la présence du risque. */
export const EVALUATION_LABELS: Record<CriterionDirection, Record<EvaluationValue, string>> = {
  TOWARDS: { non: "Non", p25: "25 %", p50: "50 %", p75: "75 %", oui: "Oui", inconnu: "Je ne sais pas encore" },
  AWAY_FROM: {
    non: "Absent",
    p25: "Un peu",
    p50: "En partie",
    p75: "Beaucoup",
    oui: "Présent",
    inconnu: "Je ne sais pas encore",
  },
};

export interface CriterionTemplate {
  label: string;
  kind: CriterionKind;
  weight: Weight | null;
  direction: CriterionDirection;
}

export interface CategoryDefinition {
  key: CategoryKey;
  label: string;
  subtitle: string;
  question: string;
  /** Réglages proposés pour un nouveau critère de cette catégorie. */
  defaults: Omit<CriterionTemplate, "label">;
  examples: CriterionTemplate[];
}

const w = (label: string, weight: Weight, direction: CriterionDirection = "TOWARDS"): CriterionTemplate => ({
  label,
  kind: "WEIGHTED",
  weight,
  direction,
});
const dealbreaker = (label: string, direction: CriterionDirection): CriterionTemplate => ({
  label,
  kind: "DEALBREAKER",
  weight: null,
  direction,
});

export const CATEGORIES: CategoryDefinition[] = [
  {
    key: "contexte_declencheur",
    label: "Contexte Déclencheur & Flow",
    subtitle: "Talent Unique MO2I",
    question:
      "Dans quel environnement, quelle dynamique de groupe ou face à quel type de problème ton Talent Unique s'active-t-il instantanément ? Qu'est-ce qui te met en Flow ?",
    defaults: { kind: "WEIGHTED", weight: 5, direction: "TOWARDS" },
    examples: [
      w("Mon Mécanisme est au cœur du poste, pas à la marge", 5),
      w("Le poste me confronte au type de problème qui active mon talent", 5),
      w("Je retrouve la dynamique de groupe qui me met en Flow", 4),
      w("Mon Super bénéfice est attendu et reconnu", 4),
      w("Je peux exercer mon talent dès les premières semaines", 3),
    ],
  },
  {
    key: "anti_contexte",
    label: "Anti-Contexte & Lignes Rouges",
    subtitle: "Prévention de la souffrance",
    question:
      "Quel environnement éteint ton talent, génère de la friction, de la fatigue ou de la souffrance ? Quelles sont tes lignes rouges, à ne jamais franchir ?",
    defaults: { kind: "WEIGHTED", weight: 4, direction: "AWAY_FROM" },
    examples: [
      w("Micro-management et contrôle permanent", 4, "AWAY_FROM"),
      w("Tâches répétitives sans marge d'initiative", 3, "AWAY_FROM"),
      w("Validation hiérarchique en cascade de chaque décision", 3, "AWAY_FROM"),
      dealbreaker("Management par la peur ou l'humiliation", "AWAY_FROM"),
      dealbreaker("Activité contraire à mes valeurs profondes", "AWAY_FROM"),
    ],
  },
  {
    key: "valeurs_culture",
    label: "Alignement Valeurs & Culture",
    subtitle: "Ce qui compte pour toi",
    question: "Quelles valeurs l'organisation doit-elle partager avec toi ? Dans quelle culture te sens-tu à ta place ?",
    defaults: { kind: "WEIGHTED", weight: 4, direction: "TOWARDS" },
    examples: [
      w("Impact environnemental positif", 5),
      w("Autonomie dans mon organisation", 4),
      w("Ambiance bienveillante", 3),
      w("Utilité sociale de l'activité", 4),
      w("Transparence des décisions", 3),
    ],
  },
  {
    key: "conditions_vie",
    label: "Conditions de Vie & QVT",
    subtitle: "Rythme, charge mentale, sérénité",
    question: "Quel rythme, quelle charge mentale et quelle organisation te permettent de rester serein·e dans la durée ?",
    defaults: { kind: "WEIGHTED", weight: 3, direction: "TOWARDS" },
    examples: [
      w("Télétravail au moins 2 jours / semaine", 3),
      w("Moins de 45 min de trajet", 2),
      w("Horaires compatibles avec ma vie de famille", 4),
      w("Charge mentale soutenable, sans urgences permanentes", 4),
      w("Déplacements fréquents", 2, "AWAY_FROM"),
    ],
  },
  {
    key: "remuneration",
    label: "Rémunération & Viabilité Financière",
    subtitle: "Seuil plancher éliminatoire + potentiel",
    question: "En dessous de quel revenu ce n'est pas viable pour toi ? Quel potentiel financier recherches-tu au-delà ?",
    defaults: { kind: "WEIGHTED", weight: 2, direction: "TOWARDS" },
    examples: [
      dealbreaker("Pas moins de 3 000 € net / mois", "TOWARDS"),
      w("Perspective d'évolution salariale", 1),
      w("Revenus stables et prévisibles", 3),
      w("Avantages (mutuelle, intéressement…)", 1),
    ],
  },
];

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryDefinition> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<CategoryKey, CategoryDefinition>;
