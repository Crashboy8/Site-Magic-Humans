// Exemple fictif intégré (lecture seule, duplicable comme modèle) :
// Camille, 34 ans, chargée de communication, en réflexion de carrière.
// Rédigé avec la terminologie Magic Humans / MO2I.
import type { CategoryKey, Criterion, CriterionDirection, Evaluation, EvaluationValue, Opportunity, TalentUnique, Weight } from "@/domain/types";
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

export const CAMILLE_CATEGORIES: { id: string; key: CategoryKey; label: string; position: number }[] = (
  ["contexte_declencheur", "anti_contexte", "valeurs_culture", "conditions_vie", "remuneration"] as const
).map((key, position) => ({ id: `cat-${key}`, key, label: CATEGORY_BY_KEY[key].label, position }));

const crit = (
  id: string,
  key: CategoryKey,
  label: string,
  weight: Weight | null,
  direction: CriterionDirection = "TOWARDS",
  description = "",
): Omit<Criterion, "versionId" | "position"> => ({
  id,
  categoryId: `cat-${key}`,
  label,
  description,
  kind: weight === null ? "DEALBREAKER" : "WEIGHTED",
  weight,
  direction,
});

export const CAMILLE_CRITERIA = [
  // Contexte Déclencheur & Flow (Talent Unique MO2I)
  crit("histoires", "contexte_declencheur", "Mon Mécanisme est au cœur du poste : raconter des histoires qui donnent envie d'agir", 5),
  crit("terrain", "contexte_declencheur", "Mon Contexte Déclencheur est présent : contact direct avec les gens sur le terrain", 4),
  // Anti-Contexte & Lignes Rouges
  crit("descendante", "anti_contexte", "Anti-Contexte : communication descendante et aseptisée, sans place pour le récit", 4, "AWAY_FROM"),
  crit("validation", "anti_contexte", "Anti-Contexte : validation hiérarchique en cascade de chaque prise de parole", 3, "AWAY_FROM"),
  // Alignement Valeurs & Culture
  crit("environnement", "valeurs_culture", "Impact environnemental positif", 5),
  crit("autonomie", "valeurs_culture", "Autonomie dans mon organisation", 4),
  crit("ambiance", "valeurs_culture", "Ambiance bienveillante", 3),
  // Conditions de Vie & QVT
  crit("teletravail", "conditions_vie", "Télétravail au moins 2 jours / semaine", 3),
  crit("trajet", "conditions_vie", "Moins de 45 min de trajet", 2),
  // Rémunération & Viabilité Financière
  crit("plancher", "remuneration", "Seuil plancher : pas moins de 3 000 € net / mois", null, "TOWARDS", "Non négociable."),
  crit("evolution", "remuneration", "Perspective d'évolution salariale", 1),
].map((c, position) => ({ ...c, versionId: "exemple", position })) satisfies Criterion[];

export const CAMILLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: "A",
    versionId: "exemple",
    name: "A. Responsable communication — PME éco-construction (Nantes)",
    summary: "PME de 80 personnes, chantiers à visiter, tout est à construire côté communication.",
    url: "",
    notes: "Salaire proposé : 3 100 € net, peu de marge d'évolution.",
    position: 0,
  },
  {
    id: "B",
    versionId: "exemple",
    name: "B. Consultante freelance en storytelling",
    summary: "Accompagner des marques et des associations dans leurs récits.",
    url: "",
    notes: "Revenus des premiers mois encore incertains.",
    position: 1,
  },
  {
    id: "C",
    versionId: "exemple",
    name: "C. Chargée de com' senior — grand groupe bancaire (La Défense)",
    summary: "Communication institutionnelle au sein d'une direction de 40 personnes.",
    url: "",
    notes: "4 200 € net, intéressement, belles perspectives salariales.",
    position: 2,
  },
];

// Pour un critère AWAY_FROM, la valeur indique la présence du risque (« oui » = présent).
const CAMILLE_GRID: Record<string, Record<"A" | "B" | "C", EvaluationValue>> = {
  histoires: { A: "p75", B: "oui", C: "p25" },
  terrain: { A: "oui", B: "p25", C: "non" },
  descendante: { A: "p25", B: "non", C: "p75" },
  validation: { A: "p25", B: "non", C: "oui" },
  environnement: { A: "oui", B: "p25", C: "p25" },
  autonomie: { A: "p75", B: "oui", C: "p50" },
  ambiance: { A: "oui", B: "inconnu", C: "p50" },
  teletravail: { A: "p50", B: "oui", C: "p75" },
  trajet: { A: "p75", B: "oui", C: "p25" },
  plancher: { A: "oui", B: "inconnu", C: "oui" },
  evolution: { A: "p25", B: "inconnu", C: "oui" },
};

export const CAMILLE_EVALUATIONS: Evaluation[] = Object.entries(CAMILLE_GRID).flatMap(([criterionId, row]) =>
  (Object.entries(row) as ["A" | "B" | "C", EvaluationValue][]).map(([opportunityId, value]) => ({ criterionId, opportunityId, value })),
);

export const CAMILLE_INSIGHT =
  "Je pensais que la sécurité financière primait. En posant mes critères, je réalise que l'Anti-Contexte de la banque m'éteindrait : je serais bien payée mais vidée.";
