// Terminologie officielle Magic Humans / MO2I. Toute l'interface s'appuie sur ces textes.
import type { CategoryKey, CriterionDirection, EvaluationValue, Importance, TalentUnique } from "./types";

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

/** Niveaux d'importance, du plus fort au plus faible. Leur poids dépend du barème de la version. */
export const IMPORTANCE_LEVELS: { value: Importance; label: string; hint: string }[] = [
  { value: "critique", label: "Critique", hint: "Le plus important." },
  { value: "tres_important", label: "Très important", hint: "" },
  { value: "important", label: "Important", hint: "" },
  { value: "moyen", label: "Moyennement important", hint: "" },
  { value: "bof", label: "Bof", hint: "Compte un peu." },
  { value: "bonus", label: "Bonus", hint: "Si c'est là, c'est bien ; sinon, ce n'est pas grave." },
];

export const IMPORTANCE_BY_VALUE = Object.fromEntries(IMPORTANCE_LEVELS.map((l) => [l.value, l])) as Record<
  Importance,
  (typeof IMPORTANCE_LEVELS)[number]
>;

export const NON_NEGOTIABLE_HINT =
  "Non négociable : si ce n'est pas pleinement le cas, l'opportunité est signalée et classée après les autres.";

export const DIRECTION_LABELS: Record<CriterionDirection, { label: string; hint: string; question: string }> = {
  TOWARDS: {
    label: "Pour aller vers",
    hint: "Ce que tu recherches.",
    question: "Cette opportunité t'apporte-t-elle cela ?",
  },
  AWAY_FROM: {
    label: "Pour éviter",
    hint: "Ce que tu veux fuir : on évalue sa présence ; plus il est présent, plus le score baisse.",
    question: "Ce risque est-il présent dans cette opportunité ?",
  },
};

/** Libellés d'évaluation : pour un critère « à éviter », on évalue la présence du risque. */
export const EVALUATION_LABELS: Record<CriterionDirection, Record<EvaluationValue, string>> = {
  TOWARDS: { oui: "Oui", p75: "Plutôt oui", p50: "À moitié", p25: "Plutôt non", non: "Non", inconnu: "? À vérifier" },
  AWAY_FROM: { oui: "Présent", p75: "Assez présent", p50: "En partie", p25: "Un peu", non: "Absent", inconnu: "? À vérifier" },
};

export interface CriterionTemplate {
  label: string;
  importance: Importance;
  nonNegotiable: boolean;
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

const IMP: Record<number, Importance> = { 5: "critique", 4: "tres_important", 3: "important", 2: "moyen", 1: "bof", 0: "bonus" };
const w = (label: string, level: number, direction: CriterionDirection = "TOWARDS"): CriterionTemplate => ({
  label,
  importance: IMP[level],
  nonNegotiable: false,
  direction,
});
const dealbreaker = (label: string, direction: CriterionDirection): CriterionTemplate => ({
  label,
  importance: "critique",
  nonNegotiable: true,
  direction,
});

export const CATEGORIES: CategoryDefinition[] = [
  {
    key: "contexte_declencheur",
    label: "Contexte Déclencheur & Flow",
    subtitle: "Talent Unique MO2I",
    question:
      "Dans quel environnement, quelle dynamique de groupe ou face à quel type de problème ton Talent Unique s'active-t-il instantanément ? Qu'est-ce qui te met en Flow ?",
    defaults: { importance: "critique", nonNegotiable: false, direction: "TOWARDS" },
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
    defaults: { importance: "tres_important", nonNegotiable: false, direction: "AWAY_FROM" },
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
    defaults: { importance: "tres_important", nonNegotiable: false, direction: "TOWARDS" },
    examples: [
      w("Impact environnemental positif", 5),
      w("Autonomie dans mon organisation", 4),
      w("Des collègues bienveillants et chaleureux", 4),
      w("Œuvrer pour une cause, un engagement social", 3),
      w("Pouvoir faire du bénévolat à côté", 0),
      w("Utilité sociale de l'activité", 4),
      w("Transparence des décisions", 3),
    ],
  },
  {
    key: "conditions_vie",
    label: "Conditions de Vie & QVT",
    subtitle: "Rythme, charge mentale, sérénité",
    question: "Quel rythme, quelle charge mentale et quelle organisation te permettent de rester serein·e dans la durée ?",
    defaults: { importance: "important", nonNegotiable: false, direction: "TOWARDS" },
    examples: [
      w("Télétravail au moins 2 jours / semaine", 3),
      w("Moins de 30 min de trajet", 3),
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
    defaults: { importance: "important", nonNegotiable: false, direction: "TOWARDS" },
    examples: [
      dealbreaker("Minimum 3 000 € net / mois", "TOWARDS"),
      w("Idéalement 4 000 € net / mois", 3),
      w("Perspective d'évolution salariale", 1),
      w("Revenus stables et prévisibles", 3),
      w("Avantages (mutuelle, intéressement…)", 1),
    ],
  },
];

export const CATEGORY_BY_KEY: Record<CategoryKey, CategoryDefinition> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<CategoryKey, CategoryDefinition>;
