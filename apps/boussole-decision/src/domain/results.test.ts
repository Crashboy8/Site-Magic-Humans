import { describe, expect, it } from "vitest";
import { CAMILLE_CATEGORIES, CAMILLE_CRITERIA, CAMILLE_EVALUATIONS, CAMILLE_OPPORTUNITIES } from "@/content/exemple-camille";
import { ikigaiOf, insightOf, rankingStability, verdictOf, verificationQuestion } from "./results";
import { rankOpportunities, type ScoringCriterion } from "./scoring";
import type { Evaluation } from "./types";

const c = (id: string, over: Partial<ScoringCriterion> = {}): ScoringCriterion => ({
  id,
  categoryId: "cat-contexte",
  label: id,
  importance: "important",
  nonNegotiable: false,
  direction: "TOWARDS",
  ...over,
});
const ev = (criterionId: string, value: Evaluation["value"], opportunityId = "x"): Evaluation => ({ criterionId, opportunityId, value });
const X = { id: "x", name: "X" };
const Y = { id: "y", name: "Y" };
const categories = [
  { id: "cat-contexte", key: "contexte_declencheur" as const, label: "Contexte Déclencheur & Flow" },
  { id: "cat-anti", key: "anti_contexte" as const, label: "Anti-Contexte & Lignes Rouges" },
  { id: "cat-argent", key: "remuneration" as const, label: "Rémunération" },
];

describe("verdict", () => {
  it("rien d'évalué : pas de verdict", () => {
    expect(verdictOf(rankOpportunities([X], [c("a")], [])).kind).toBe("vide");
  });
  it("une seule opportunité notée", () => {
    expect(verdictOf(rankOpportunities([X, Y], [c("a")], [ev("a", "oui")])).kind).toBe("seule");
  });
  it("au coude à coude sous 5 points d'écart, en tête au-delà", () => {
    const criteria = [c("a"), c("b")];
    const close = rankOpportunities([X, Y], criteria, [ev("a", "oui"), ev("b", "p75"), ev("a", "oui", "y"), ev("b", "p75", "y")]);
    expect(verdictOf(close).kind).toBe("coude_a_coude");
    const far = rankOpportunities([X, Y], criteria, [ev("a", "oui"), ev("b", "oui"), ev("a", "p50", "y"), ev("b", "p50", "y")]);
    expect(verdictOf(far)).toMatchObject({ kind: "en_tete", gap: 50 });
  });
});

describe("contexte de réussite et contexte d'échec", () => {
  const criteria = [
    c("humains", { importance: "critique" }),
    c("cadre", { importance: "bof" }),
    c("ecran", { categoryId: "cat-anti", direction: "AWAY_FROM", importance: "tres_important" }),
    c("isole", { categoryId: "cat-anti", direction: "AWAY_FROM" }),
    c("salaire", { categoryId: "cat-argent" }),
  ];
  const [result] = rankOpportunities([X], criteria, [
    ev("humains", "oui"),
    ev("cadre", "non"),
    ev("ecran", "p75"),
    ev("isole", "p25"),
    ev("salaire", "oui"),
  ]);
  const insight = insightOf(result, categories);
  const ids = (list: { criterion: { id: string } }[]) => list.map((d) => d.criterion.id);

  it("ce qui allume le talent : le Contexte Déclencheur présent", () => {
    expect(ids(insight.ignites)).toEqual(["humains"]);
    expect(ids(insight.assets)).toEqual(["salaire"]);
  });
  it("ce qui risque de l'éteindre : l'Anti-Contexte présent à moitié ou plus", () => {
    expect(ids(insight.extinguishers)).toEqual(["ecran"]);
  });
  it("ce qui manque : le contexte de réussite absent", () => {
    expect(ids(insight.missing)).toEqual(["cadre"]);
  });
  it("à surveiller : un risque présent un peu", () => {
    expect(ids(insight.watch)).toEqual(["isole"]);
  });
});

describe("questions à poser", () => {
  it("formule une question selon le sens du critère", () => {
    expect(verificationQuestion({ label: "Télétravail 2 jours.", direction: "TOWARDS" })).toBe(
      "Est-ce que j'aurai vraiment : « Télétravail 2 jours » ?",
    );
    expect(verificationQuestion({ label: "Micro-management", direction: "AWAY_FROM" })).toBe(
      "Y a-t-il ce risque ici : « Micro-management » ?",
    );
  });
});

describe("solidité du classement", () => {
  it("signale la catégorie qui fait basculer la tête du classement", () => {
    const criteria = [c("sens", { importance: "critique" }), c("salaire", { categoryId: "cat-argent", importance: "tres_important" })];
    const evaluations = [ev("sens", "oui"), ev("salaire", "non"), ev("sens", "non", "y"), ev("salaire", "oui", "y")];
    const stability = rankingStability([X, Y], criteria, evaluations, categories);
    expect(stability?.leader.id).toBe("x");
    expect(stability?.flips).toContainEqual(expect.objectContaining({ categoryId: "cat-argent", emphasis: "plus", newLeader: Y }));
  });
  it("classement solide : aucune bascule", () => {
    const criteria = [c("sens"), c("salaire", { categoryId: "cat-argent" })];
    const evaluations = [ev("sens", "oui"), ev("salaire", "oui"), ev("sens", "non", "y"), ev("salaire", "non", "y")];
    expect(rankingStability([X, Y], criteria, evaluations, categories)?.flips).toEqual([]);
  });
  it("pas d'analyse avec une seule opportunité notée", () => {
    expect(rankingStability([X], [c("a")], [ev("a", "oui")], categories)).toBeNull();
  });
  it("exemple de Camille : la PME en tête, l'Anti-Contexte de la banque ressort", () => {
    const ranking = rankOpportunities(CAMILLE_OPPORTUNITIES, CAMILLE_CRITERIA, CAMILLE_EVALUATIONS);
    expect(verdictOf(ranking)).toMatchObject({ leader: { opportunity: { id: "A" } } });
    const banque = insightOf(ranking.find((r) => r.opportunity.id === "C")!, CAMILLE_CATEGORIES);
    expect(banque.extinguishers.map((d) => d.criterion.id)).toContain("micromanagement");
  });
});

describe("ikigai", () => {
  const cats = [
    ...categories,
    { id: "cat-valeurs", key: "valeurs_culture" as const, label: "Valeurs" },
    { id: "cat-vie", key: "conditions_vie" as const, label: "Vie" },
  ];
  const criteria = [
    c("humains"),
    c("ecran", { categoryId: "cat-anti", direction: "AWAY_FROM" }),
    c("sens", { categoryId: "cat-valeurs" }),
    c("trajet", { categoryId: "cat-vie" }),
    c("salaire", { categoryId: "cat-argent" }),
  ];
  it("quatre cercles à 25 % chacun ; « ce que j'aime » réunit qualité de vie et Anti-Contexte évité", () => {
    const [r] = rankOpportunities([X], criteria, [
      ev("humains", "oui"),
      ev("ecran", "oui"),
      ev("sens", "oui"),
      ev("trajet", "oui"),
      ev("salaire", "p50"),
    ]);
    const ikigai = ikigaiOf(r, cats);
    expect(ikigai.circles.map((x) => [x.key, x.score])).toEqual([
      ["aime", 50],
      ["doue", 100],
      ["monde", 100],
      ["paye", 50],
    ]);
    expect(ikigai.total).toBe(75);
  });
  it("100 % partout : ikigai complet", () => {
    const [r] = rankOpportunities([X], criteria, [
      ev("humains", "oui"),
      ev("ecran", "non"),
      ev("sens", "oui"),
      ev("trajet", "oui"),
      ev("salaire", "oui"),
    ]);
    expect(ikigaiOf(r, cats).total).toBe(100);
  });
  it("un cercle non évalué : pas de total", () => {
    const [r] = rankOpportunities([X], criteria, [ev("humains", "oui")]);
    expect(ikigaiOf(r, cats).total).toBeNull();
  });
});
