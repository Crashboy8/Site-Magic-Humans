// Exemple fictif intégré (lecture seule, duplicable comme modèle) :
// Camille, 34 ans, chargée de communication, en réflexion de carrière.
// Rédigé avec la terminologie Magic Humans / MO2I.
import type {
  Category,
  CategoryKey,
  Criterion,
  CriterionDirection,
  Evaluation,
  EvaluationValue,
  Importance,
  Opportunity,
  TalentUnique,
} from "@/domain/types";
import { CATEGORY_BY_KEY } from "@/domain/methodology";

export const CAMILLE = {
  profileName: "Camille, 34 ans, chargée de communication, en réflexion de carrière",
  talent: {
    mecanisme: "raconte des histoires qui donnent envie d'agir",
    contexteDeclencheur: "un projet porteur de sens doit embarquer des personnes très différentes, au contact du terrain",
    superBenefice: "transformer l'adhésion en passage à l'action",
    antiContexte:
      "Une communication descendante et aseptisée, loin du terrain, où chaque prise de parole doit être validée à plusieurs niveaux.",
  } satisfies TalentUnique,
};

export const CAMILLE_CATEGORIES: Category[] = (
  ["contexte_declencheur", "anti_contexte", "valeurs_culture", "conditions_vie", "remuneration"] as const
).map((key, position) => ({ id: `cat-${key}`, versionId: "exemple", key, label: CATEGORY_BY_KEY[key].label, position }));

const crit = (
  id: string,
  key: CategoryKey,
  label: string,
  importance: Importance,
  options: { nonNegotiable?: boolean; direction?: CriterionDirection } = {},
): Omit<Criterion, "versionId" | "position"> => ({
  id,
  categoryId: `cat-${key}`,
  label,
  description: "",
  importance,
  nonNegotiable: options.nonNegotiable ?? false,
  direction: options.direction ?? "TOWARDS",
});

export const CAMILLE_CRITERIA = [
  // Contexte Déclencheur & Flow (Talent Unique MO2I)
  crit("histoires", "contexte_declencheur", "Raconter des histoires qui donnent envie d'agir", "critique"),
  crit("terrain", "contexte_declencheur", "Être en contact direct avec les gens sur le terrain", "tres_important"),
  // Anti-Contexte & Lignes Rouges
  crit("micromanagement", "anti_contexte", "Micro-management, validation de chaque prise de parole", "tres_important", {
    direction: "AWAY_FROM",
  }),
  // Alignement Valeurs & Culture
  crit("bienveillance", "valeurs_culture", "Des collègues bienveillants et chaleureux", "tres_important"),
  crit("cause", "valeurs_culture", "Œuvrer pour une cause, un engagement social", "important"),
  crit("benevolat", "valeurs_culture", "Pouvoir faire du bénévolat à côté", "bonus"),
  // Conditions de Vie & QVT
  crit("trajet", "conditions_vie", "Moins de 30 min de trajet", "important"),
  crit("teletravail", "conditions_vie", "Beaucoup de télétravail (2 j / semaine minimum)", "moyen"),
  // Rémunération & Viabilité Financière
  crit("plancher", "remuneration", "Minimum 3 000 € net / mois", "critique", { nonNegotiable: true }),
  crit("ideal", "remuneration", "Idéalement 4 000 € net / mois", "important"),
].map((c, position) => ({ ...c, versionId: "exemple", position })) satisfies Criterion[];

export const CAMILLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: "A",
    versionId: "exemple",
    name: "A. Responsable com' — PME éco-construction (Nantes)",
    summary: "Salariée · PME de 80 personnes, chantiers à visiter.",
    url: "",
    notes: "Salaire proposé : 3 100 € net, peu de marge d'évolution.",
    position: 0,
  },
  {
    id: "B",
    versionId: "exemple",
    name: "B. Consultante freelance en storytelling",
    summary: "Indépendante · accompagner marques et associations dans leurs récits.",
    url: "",
    notes: "Revenus des premiers mois encore incertains.",
    position: 1,
  },
  {
    id: "C",
    versionId: "exemple",
    name: "C. Chargée de com' senior — grand groupe bancaire (La Défense)",
    summary: "Salariée · communication institutionnelle.",
    url: "",
    notes: "4 200 € net, intéressement, belles perspectives salariales.",
    position: 2,
  },
];

// Pour un critère « à éviter », la valeur indique la présence du risque (« oui » = présent).
const CAMILLE_GRID: Record<string, Record<"A" | "B" | "C", EvaluationValue>> = {
  histoires: { A: "p75", B: "oui", C: "p25" },
  terrain: { A: "oui", B: "p25", C: "non" },
  micromanagement: { A: "p25", B: "non", C: "oui" },
  bienveillance: { A: "oui", B: "inconnu", C: "p50" },
  cause: { A: "oui", B: "p50", C: "p25" },
  benevolat: { A: "p50", B: "oui", C: "non" },
  trajet: { A: "p75", B: "oui", C: "p25" },
  teletravail: { A: "p50", B: "oui", C: "p75" },
  plancher: { A: "oui", B: "inconnu", C: "oui" },
  ideal: { A: "p25", B: "p50", C: "oui" },
};

export const CAMILLE_EVALUATIONS: Evaluation[] = Object.entries(CAMILLE_GRID).flatMap(([criterionId, row]) =>
  (Object.entries(row) as ["A" | "B" | "C", EvaluationValue][]).map(([opportunityId, value]) => ({ criterionId, opportunityId, value })),
);

export const CAMILLE_INSIGHT =
  "Je pensais que la sécurité financière primait. En posant mes critères, je réalise que l'Anti-Contexte de la banque m'éteindrait : je serais bien payée mais vidée.";
