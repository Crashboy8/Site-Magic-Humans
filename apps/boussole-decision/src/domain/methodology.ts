// Terminologie officielle Magic Humans / MO2I, en français et en anglais. Toute l'interface s'appuie sur ces textes.
import type { CategoryKey, CriterionDirection, EvaluationValue, Importance, TalentUnique } from "./types";
import type { Locale } from "@/i18n/config";

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

export interface Methodology {
  terms: {
    talentUnique: string;
    talentUniqueDefinition: string;
    contexteDeclencheur: string;
    contexteDeclencheurDefinition: string;
    mecanisme: string;
    mecanismeDefinition: string;
    superBenefice: string;
    superBeneficeDefinition: string;
    antiContexte: string;
    antiContexteDefinition: string;
    /** Autre nom de l'Anti-Contexte. */
    inhibition: string;
  };
  /** Formulation officielle du Talent Unique, ou null s'il manque une partie. */
  talentSentence: (t: Pick<TalentUnique, "mecanisme" | "contexteDeclencheur" | "superBenefice">) => string | null;
  /** Les trois parties de la phrase, pour guider la saisie. */
  sentenceParts: { mecanisme: string; contexte: string; benefice: string };
  importanceLevels: { value: Importance; label: string; hint: string }[];
  importanceByValue: Record<Importance, { value: Importance; label: string; hint: string }>;
  nonNegotiableHint: string;
  directions: Record<CriterionDirection, { label: string; hint: string; question: string }>;
  /** Libellés d'évaluation : pour un critère « à éviter », on évalue la présence du risque. */
  evaluationLabels: Record<CriterionDirection, Record<EvaluationValue, string>>;
  categories: CategoryDefinition[];
  categoryByKey: Record<CategoryKey, CategoryDefinition>;
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

const DEFAULTS: Record<CategoryKey, Omit<CriterionTemplate, "label">> = {
  contexte_declencheur: { importance: "critique", nonNegotiable: false, direction: "TOWARDS" },
  anti_contexte: { importance: "tres_important", nonNegotiable: false, direction: "AWAY_FROM" },
  valeurs_culture: { importance: "tres_important", nonNegotiable: false, direction: "TOWARDS" },
  conditions_vie: { importance: "important", nonNegotiable: false, direction: "TOWARDS" },
  remuneration: { importance: "important", nonNegotiable: false, direction: "TOWARDS" },
};

function build(m: Omit<Methodology, "importanceByValue" | "categoryByKey">): Methodology {
  return {
    ...m,
    importanceByValue: Object.fromEntries(m.importanceLevels.map((l) => [l.value, l])) as Methodology["importanceByValue"],
    categoryByKey: Object.fromEntries(m.categories.map((c) => [c.key, c])) as Methodology["categoryByKey"],
  };
}

// --- Français ------------------------------------------------------------------------------

const FR = build({
  terms: {
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
    inhibition: "ou Contexte d'Inhibition",
  },
  /** « Je [Mécanisme] dans un environnement où [Contexte Déclencheur], afin de [Super bénéfice]. » */
  talentSentence(t) {
    const m = t.mecanisme.trim().replace(/^je\s+/i, "");
    const c = t.contexteDeclencheur.trim().replace(/^(dans un environnement )?où\s+/i, "");
    const s = t.superBenefice
      .trim()
      .replace(/^afin de\s+/i, "")
      .replace(/[.\s]+$/, "");
    if (!m || !c || !s) return null;
    // Élision devant une voyelle ou un h muet : « afin d'aider ».
    const afin = /^[aeiouyhàâéèêëîïôûù]/i.test(s) ? "afin d'" : "afin de ";
    return `Je ${m} dans un environnement où ${c}, ${afin}${s}.`;
  },
  sentenceParts: { mecanisme: "Je…", contexte: "…dans un environnement où…", benefice: "…afin de…" },
  importanceLevels: [
    { value: "critique", label: "Critique", hint: "Le plus important." },
    { value: "tres_important", label: "Très important", hint: "" },
    { value: "important", label: "Important", hint: "" },
    { value: "moyen", label: "Moyennement important", hint: "" },
    { value: "bof", label: "Bof", hint: "Compte un peu." },
    { value: "bonus", label: "Bonus", hint: "Si c'est là, c'est bien ; sinon, ce n'est pas grave." },
  ],
  nonNegotiableHint: "Non négociable : si ce n'est pas pleinement le cas, l'opportunité est signalée et classée après les autres.",
  directions: {
    TOWARDS: { label: "Pour aller vers", hint: "Ce que tu recherches.", question: "Cette opportunité t'apporte-t-elle cela ?" },
    AWAY_FROM: {
      label: "Pour éviter",
      hint: "Ce que tu veux fuir : on évalue sa présence ; plus il est présent, plus le score baisse.",
      question: "Ce risque est-il présent dans cette opportunité ?",
    },
  },
  evaluationLabels: {
    TOWARDS: { oui: "Oui", p75: "Plutôt oui", p50: "À moitié", p25: "Plutôt non", non: "Non", inconnu: "? À vérifier" },
    AWAY_FROM: { oui: "Présent", p75: "Assez présent", p50: "En partie", p25: "Un peu", non: "Absent", inconnu: "? À vérifier" },
  },
  categories: [
    {
      key: "contexte_declencheur",
      label: "Contexte Déclencheur & Flow",
      subtitle: "Talent Unique MO2I",
      question:
        "Dans quel environnement, quelle dynamique de groupe ou face à quel type de problème ton Talent Unique s'active-t-il instantanément ? Qu'est-ce qui te met en Flow ?",
      defaults: DEFAULTS.contexte_declencheur,
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
      defaults: DEFAULTS.anti_contexte,
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
      defaults: DEFAULTS.valeurs_culture,
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
      defaults: DEFAULTS.conditions_vie,
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
      defaults: DEFAULTS.remuneration,
      examples: [
        dealbreaker("Minimum 3 000 € net / mois", "TOWARDS"),
        w("Idéalement 4 000 € net / mois", 3),
        w("Perspective d'évolution salariale", 1),
        w("Revenus stables et prévisibles", 3),
        w("Avantages (mutuelle, intéressement…)", 1),
      ],
    },
  ],
});

// --- English -------------------------------------------------------------------------------

const EN = build({
  terms: {
    talentUnique: "Unique Talent",
    talentUniqueDefinition: "A person's natural aptitude and spontaneous way of acting.",
    contexteDeclencheur: "Trigger Context",
    contexteDeclencheurDefinition:
      "The environment, group dynamic or specific type of problem that instantly activates the talent and the state of Flow.",
    mecanisme: "Mechanism",
    mecanismeDefinition: "The specific way the talent expresses itself and transforms reality.",
    superBenefice: "Super Benefit",
    superBeneficeDefinition: "The outsized added value and deep impact it naturally creates, with no perceived effort.",
    antiContexte: "Anti-Context",
    antiContexteDefinition: "The toxic or unsuitable environment that switches the talent off, creating friction, fatigue or suffering.",
    inhibition: "or Inhibition Context",
  },
  /** “I [Mechanism] in an environment where [Trigger Context], in order to [Super Benefit].” */
  talentSentence(t) {
    const m = t.mecanisme.trim().replace(/^i\s+/i, "");
    const c = t.contexteDeclencheur.trim().replace(/^(in an environment )?where\s+/i, "");
    const s = t.superBenefice
      .trim()
      .replace(/^(in order )?to\s+/i, "")
      .replace(/[.\s]+$/, "");
    if (!m || !c || !s) return null;
    return `I ${m} in an environment where ${c}, in order to ${s}.`;
  },
  sentenceParts: { mecanisme: "I…", contexte: "…in an environment where…", benefice: "…in order to…" },
  importanceLevels: [
    { value: "critique", label: "Critical", hint: "The most important." },
    { value: "tres_important", label: "Very important", hint: "" },
    { value: "important", label: "Important", hint: "" },
    { value: "moyen", label: "Moderately important", hint: "" },
    { value: "bof", label: "Minor", hint: "Counts a little." },
    { value: "bonus", label: "Bonus", hint: "Nice if it's there; no big deal if it isn't." },
  ],
  nonNegotiableHint: "Non-negotiable: if it isn't fully met, the opportunity is flagged and ranked after the others.",
  directions: {
    TOWARDS: { label: "To move towards", hint: "What you are looking for.", question: "Does this opportunity give you this?" },
    AWAY_FROM: {
      label: "To avoid",
      hint: "What you want to stay away from: we rate how present it is; the more present, the lower the score.",
      question: "Is this risk present in this opportunity?",
    },
  },
  evaluationLabels: {
    TOWARDS: { oui: "Yes", p75: "Mostly yes", p50: "Halfway", p25: "Mostly no", non: "No", inconnu: "? To check" },
    AWAY_FROM: { oui: "Present", p75: "Fairly present", p50: "Partly", p25: "A little", non: "Absent", inconnu: "? To check" },
  },
  categories: [
    {
      key: "contexte_declencheur",
      label: "Trigger Context & Flow",
      subtitle: "MO2I Unique Talent",
      question:
        "In what environment, what group dynamic or facing what type of problem does your Unique Talent switch on instantly? What puts you in Flow?",
      defaults: DEFAULTS.contexte_declencheur,
      examples: [
        w("My Mechanism is at the heart of the role, not on the side", 5),
        w("The role brings me the kind of problem that activates my talent", 5),
        w("I find the group dynamic that puts me in Flow", 4),
        w("My Super Benefit is expected and recognised", 4),
        w("I can use my talent from the very first weeks", 3),
      ],
    },
    {
      key: "anti_contexte",
      label: "Anti-Context & Red Lines",
      subtitle: "Preventing suffering",
      question:
        "What environment switches your talent off, creates friction, fatigue or suffering? What are your red lines, never to be crossed?",
      defaults: DEFAULTS.anti_contexte,
      examples: [
        w("Micromanagement and constant control", 4, "AWAY_FROM"),
        w("Repetitive tasks with no room for initiative", 3, "AWAY_FROM"),
        w("Every decision cascading up for approval", 3, "AWAY_FROM"),
        dealbreaker("Management through fear or humiliation", "AWAY_FROM"),
        dealbreaker("Work that goes against my core values", "AWAY_FROM"),
      ],
    },
    {
      key: "valeurs_culture",
      label: "Values & Culture Alignment",
      subtitle: "What matters to you",
      question: "Which values must the organisation share with you? In what culture do you feel you belong?",
      defaults: DEFAULTS.valeurs_culture,
      examples: [
        w("Positive environmental impact", 5),
        w("Autonomy in how I organise my work", 4),
        w("Kind and warm colleagues", 4),
        w("Working for a cause, a social commitment", 3),
        w("Being able to volunteer on the side", 0),
        w("Social usefulness of the work", 4),
        w("Transparent decisions", 3),
      ],
    },
    {
      key: "conditions_vie",
      label: "Living Conditions & Wellbeing at Work",
      subtitle: "Pace, mental load, peace of mind",
      question: "What pace, mental load and organisation let you stay calm and steady in the long run?",
      defaults: DEFAULTS.conditions_vie,
      examples: [
        w("Remote work at least 2 days a week", 3),
        w("Less than 30 minutes' commute", 3),
        w("Hours compatible with my family life", 4),
        w("Sustainable mental load, no constant emergencies", 4),
        w("Frequent travel", 2, "AWAY_FROM"),
      ],
    },
    {
      key: "remuneration",
      label: "Pay & Financial Viability",
      subtitle: "Non-negotiable floor + potential",
      question: "Below what income is it not viable for you? What financial potential are you looking for beyond that?",
      defaults: DEFAULTS.remuneration,
      examples: [
        dealbreaker("At least €3,000 net per month", "TOWARDS"),
        w("Ideally €4,000 net per month", 3),
        w("Prospects for salary growth", 1),
        w("Stable, predictable income", 3),
        w("Benefits (health insurance, profit sharing…)", 1),
      ],
    },
  ],
});

const BY_LOCALE: Record<Locale, Methodology> = { fr: FR, en: EN };

export function getMethodology(locale: Locale): Methodology {
  return BY_LOCALE[locale];
}

// Raccourcis en français (exemple de Camille, tests).
export const TALENT_TERMS = FR.terms;
export const talentSentence = FR.talentSentence;
export const IMPORTANCE_LEVELS = FR.importanceLevels;
export const CATEGORY_BY_KEY = FR.categoryByKey;
export const EVALUATION_LABELS = FR.evaluationLabels;
