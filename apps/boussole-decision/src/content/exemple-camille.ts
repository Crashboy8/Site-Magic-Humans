// Exemple fictif intégré (lecture seule, duplicable comme modèle) :
// Camille, 34 ans, chargée de communication, en réflexion de carrière.
// Rédigé avec la terminologie de la méthode Talent Unique de Magic Humans.
import type { Locale } from "@/i18n/config";
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
    successSituations:
      "Quand j'anime un atelier avec des bénévoles et que je vois les gens repartir motivés. Quand je recueille des témoignages sur le terrain.",
    failureSituations:
      "Quand je passe mes journées à reformuler des communiqués validés par cinq personnes. Quand je ne vois plus personne et que je tourne en rond devant mon écran.",
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
  // Contexte Déclencheur & Flow (Talent Unique)
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
  crit("plancher", "remuneration", "Minimum 3 000 € net / mois", "critique", { nonNegotiable: true }),
  crit("ideal", "remuneration", "Idéalement 4 000 € net / mois", "important"),
].map((c, position) => ({ ...c, versionId: "exemple", position })) satisfies Criterion[];

export const CAMILLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: "A",
    versionId: "exemple",
    name: "A. Responsable com', PME écoconstruction (Nantes)",
    summary: "Salariée · PME de 80 personnes, chantiers à visiter.",
    url: "",
    notes: "Salaire proposé : 3 100 € net, peu de marge d'évolution.",
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
    name: "C. Chargée de com' senior, grand groupe bancaire (La Défense)",
    summary: "Salariée · communication institutionnelle.",
    url: "",
    notes: "4 200 € net, intéressement, belles perspectives salariales.",
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
  "Je pensais que la sécurité financière primait. En posant mes critères, je réalise que l'Anti-Contexte de la banque m'éteindrait : je serais bien payée mais vidée.";

// --- Version anglaise de l'exemple ----------------------------------------------------------

const CAMILLE_EN = {
  talent: {
    mecanisme: "tell stories that make people want to act",
    contexteDeclencheur: "a meaningful project has to bring very different people on board, close to the field",
    superBenefice: "turn buy-in into action",
    antiContexte: "Top-down, sanitised communication, far from the field, where every word has to be approved at several levels.",
    successSituations: "When I run a workshop with volunteers and see people leave motivated. When I gather testimonies in the field.",
    failureSituations:
      "When I spend my days rewording press releases approved by five people. When I no longer see anyone and go round in circles in front of my screen.",
  } satisfies TalentUnique,
  criteria: {
    histoires: "Telling stories that make people want to act",
    terrain: "Being in direct contact with people in the field",
    micromanagement: "Micromanagement, approval of every word I say",
    bienveillance: "Kind and warm colleagues",
    cause: "Working for a cause, a social commitment",
    benevolat: "Being able to volunteer on the side",
    trajet: "Less than 30 minutes' commute",
    teletravail: "Lots of remote work (2 days a week minimum)",
    plancher: "At least €3,000 net per month",
    ideal: "Ideally €4,000 net per month",
  } as Record<string, string>,
  opportunities: {
    A: {
      name: "A. Communications manager, eco-construction SME (Nantes)",
      summary: "Employee · SME of 80 people, building sites to visit.",
      notes: "Salary offered: €3,100 net, little room to grow.",
    },
    B: {
      name: "B. Freelance storytelling consultant",
      summary: "Self-employed · helping brands and charities tell their stories.",
      notes: "Income in the first months still uncertain.",
    },
    C: {
      name: "C. Senior communications officer, large banking group (La Défense)",
      summary: "Employee · corporate communications.",
      notes: "€4,200 net, profit sharing, good salary prospects.",
    },
  } as Record<string, { name: string; summary: string; notes: string }>,
  insight:
    "I thought financial security came first. Laying out my criteria, I realise the bank's Anti-Context would switch me off: I'd be well paid but drained.",
};

const CAMILLE_ES = {
  talent: {
    mecanisme: "contar historias que dan ganas de actuar",
    contexteDeclencheur: "un proyecto con sentido tiene que implicar a personas muy distintas, cerca del terreno",
    superBenefice: "transformar la adhesión en acción",
    antiContexte: "Una comunicación vertical y aséptica, lejos del terreno, en la que cada palabra debe validarse en varios niveles.",
    successSituations:
      "Cuando animo un taller con voluntarios y veo a la gente salir motivada. Cuando recojo testimonios sobre el terreno.",
    failureSituations:
      "Cuando paso el día reformulando comunicados validados por cinco personas. Cuando ya no veo a nadie y doy vueltas delante de mi pantalla.",
  } satisfies TalentUnique,
  criteria: {
    histoires: "Contar historias que dan ganas de actuar",
    terrain: "Estar en contacto directo con la gente sobre el terreno",
    micromanagement: "Microgestión, validación de cada palabra que digo",
    bienveillance: "Compañeros amables y cercanos",
    cause: "Trabajar por una causa, un compromiso social",
    benevolat: "Poder hacer voluntariado aparte",
    trajet: "Menos de 30 minutos de trayecto",
    teletravail: "Mucho teletrabajo (2 días por semana como mínimo)",
    plancher: "Al menos 3.000 € netos al mes",
    ideal: "Idealmente 4.000 € netos al mes",
  } as Record<string, string>,
  opportunities: {
    A: {
      name: "A. Responsable de comunicación, pyme de ecoconstrucción (Nantes)",
      summary: "Asalariada · pyme de 80 personas, obras que visitar.",
      notes: "Salario propuesto: 3.100 € netos, poco margen de evolución.",
    },
    B: {
      name: "B. Consultora freelance en storytelling",
      summary: "Autónoma · ayudar a marcas y asociaciones a contar su historia.",
      notes: "Ingresos de los primeros meses aún inciertos.",
    },
    C: {
      name: "C. Responsable sénior de comunicación, gran grupo bancario (La Défense)",
      summary: "Asalariada · comunicación corporativa.",
      notes: "4.200 € netos, participación en beneficios, buenas perspectivas salariales.",
    },
  } as Record<string, { name: string; summary: string; notes: string }>,
  insight:
    "Creía que la seguridad económica era lo primero. Al poner mis criterios por escrito, me doy cuenta de que el Anti-Contexto del banco me apagaría: estaría bien pagada, pero agotada.",
};

/** L'exemple de Camille dans la langue choisie (les évaluations ne changent pas). */
export function camilleFor(locale: Locale) {
  if (locale === "fr") {
    return { talent: CAMILLE.talent, criteria: CAMILLE_CRITERIA, opportunities: CAMILLE_OPPORTUNITIES, insight: CAMILLE_INSIGHT };
  }
  const tr = locale === "es" ? CAMILLE_ES : CAMILLE_EN;
  return {
    talent: tr.talent,
    criteria: CAMILLE_CRITERIA.map((c) => ({ ...c, label: tr.criteria[c.id] ?? c.label })),
    opportunities: CAMILLE_OPPORTUNITIES.map((o) => ({ ...o, ...tr.opportunities[o.id] })),
    insight: tr.insight,
  };
}
