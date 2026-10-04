import { describe, expect, it } from "vitest";
import { CAMILLE_CRITERIA, CAMILLE_EVALUATIONS, CAMILLE_OPPORTUNITIES } from "@/content/exemple-camille";
import { formatScore, rankOpportunities, satisfactionOf, scoreOpportunity, type ScoringCriterion } from "./scoring";
import type { Evaluation } from "./types";

const c = (id: string, over: Partial<ScoringCriterion> = {}): ScoringCriterion => ({
  id,
  categoryId: "cat",
  label: id,
  importance: "important",
  nonNegotiable: false,
  direction: "TOWARDS",
  ...over,
});
const opp = { id: "o", name: "Opportunité" };
const ev = (criterionId: string, value: Evaluation["value"], opportunityId = "o"): Evaluation => ({ criterionId, opportunityId, value });

describe("satisfaction d'un critère", () => {
  it("pour aller vers : reprend la valeur évaluée", () => {
    expect(satisfactionOf(c("x"), "p75")).toBe(75);
  });
  it("à éviter : inverse la présence du risque", () => {
    expect(satisfactionOf(c("x", { direction: "AWAY_FROM" }), "p75")).toBe(25);
    expect(satisfactionOf(c("x", { direction: "AWAY_FROM" }), "non")).toBe(100);
  });
  it("« à vérifier » et case vide ne sont pas évalués", () => {
    expect(satisfactionOf(c("x"), "inconnu")).toBeNull();
    expect(satisfactionOf(c("x"), null)).toBeNull();
  });
});

describe("score d'alignement global", () => {
  it("pondère Critique ×5 … Bof ×1", () => {
    const r = scoreOpportunity(opp, [c("a", { importance: "critique" }), c("b", { importance: "bof" })], [ev("a", "oui"), ev("b", "non")]);
    expect(r.score).toBeCloseTo((5 * 100) / 600 * 100);
  });
  it("Bonus ajoute des points sans jamais en retirer", () => {
    const base = [c("a")];
    const withBonus = [c("a"), c("bonus", { importance: "bonus" })];
    const sans = scoreOpportunity(opp, base, [ev("a", "p50")]).score!;
    expect(scoreOpportunity(opp, withBonus, [ev("a", "p50"), ev("bonus", "non")]).score).toBe(sans);
    expect(scoreOpportunity(opp, withBonus, [ev("a", "p50"), ev("bonus", "oui")]).score).toBeCloseTo(((3 * 50 + 100) / 300) * 100);
  });
  it("plafonne le score à 100 %", () => {
    const r = scoreOpportunity(opp, [c("a"), c("bonus", { importance: "bonus" })], [ev("a", "oui"), ev("bonus", "oui")]);
    expect(r.score).toBe(100);
  });
  it("exclut les critères non évalués, et liste ce qui reste à vérifier", () => {
    const r = scoreOpportunity(opp, [c("a"), c("b"), c("d", { nonNegotiable: true })], [ev("a", "p50"), ev("b", "inconnu")]);
    expect(r.score).toBe(50);
    expect(r.evaluatedCount).toBe(1);
    expect(r.criteriaCount).toBe(3);
    expect(r.toVerify.map((t) => t.criterion.id)).toEqual(["b", "d"]);
  });
  it("renvoie null (« — ») quand rien n'est évalué", () => {
    const r = scoreOpportunity(opp, [c("a")], [ev("a", "inconnu")]);
    expect(r.score).toBeNull();
    expect(formatScore(r.score)).toBe("—");
  });
});

describe("critères non négociables", () => {
  const plancher = c("plancher", { importance: "critique", nonNegotiable: true });
  const ligneRouge = c("rouge", { nonNegotiable: true, direction: "AWAY_FROM" });

  it("pour aller vers : seul « Oui » le respecte", () => {
    expect(scoreOpportunity(opp, [plancher], [ev("plancher", "oui")]).status).toBe("conforme");
    expect(scoreOpportunity(opp, [plancher], [ev("plancher", "p75")]).status).toBe("non_conforme");
  });
  it("la case est indépendante de l'importance : un critère Important peut être non négociable", () => {
    const r = scoreOpportunity(opp, [c("x", { nonNegotiable: true })], [ev("x", "p50")]);
    expect(r.status).toBe("non_conforme");
    expect(r.score).toBe(50);
  });
  it("à éviter : la ligne rouge est franchie dès que le risque est un peu présent", () => {
    const r = scoreOpportunity(opp, [ligneRouge], [ev("rouge", "p25")]);
    expect(r.status).toBe("non_conforme");
    expect(r.antiContextAlerts).toEqual([{ criterionId: "rouge", label: "rouge", presence: 25, severity: "ligne_rouge" }]);
  });
  it("« à vérifier » sur un non négociable : statut à vérifier", () => {
    expect(scoreOpportunity(opp, [plancher], [ev("plancher", "inconnu")]).status).toBe("a_verifier");
    expect(scoreOpportunity(opp, [plancher], []).status).toBe("a_verifier");
  });
});

describe("alertes Anti-Contexte", () => {
  const anti = c("anti", { direction: "AWAY_FROM", importance: "tres_important" });
  it("alerte à partir de 50 % de présence", () => {
    expect(scoreOpportunity(opp, [anti], [ev("anti", "p25")]).antiContextAlerts).toHaveLength(0);
    expect(scoreOpportunity(opp, [anti], [ev("anti", "p50")]).antiContextAlerts[0]).toMatchObject({ severity: "alerte", presence: 50 });
  });
  it("une alerte ne rend pas l'opportunité non conforme", () => {
    expect(scoreOpportunity(opp, [anti], [ev("anti", "oui")]).status).toBe("conforme");
  });
});

describe("classement", () => {
  it("place les non conformes après les autres, même avec un meilleur score", () => {
    const criteria = [c("a"), c("d", { nonNegotiable: true })];
    const evaluations = [ev("a", "oui", "x"), ev("d", "non", "x"), ev("a", "p25", "y"), ev("d", "oui", "y")];
    const ranked = rankOpportunities([{ id: "x", name: "X" }, { id: "y", name: "Y" }], criteria, evaluations);
    expect(ranked.map((r) => r.opportunity.id)).toEqual(["y", "x"]);
  });
  it("à score égal, la plus complète passe devant", () => {
    const criteria = [c("a"), c("b")];
    const evaluations = [ev("a", "p50", "x"), ev("a", "p50", "y"), ev("b", "p50", "y")];
    const ranked = rankOpportunities([{ id: "x", name: "X" }, { id: "y", name: "Y" }], criteria, evaluations);
    expect(ranked.map((r) => r.opportunity.id)).toEqual(["y", "x"]);
  });
});

describe("exemple de Camille (identique à la maquette validée)", () => {
  const ranked = rankOpportunities(CAMILLE_OPPORTUNITIES, CAMILLE_CRITERIA, CAMILLE_EVALUATIONS);
  const byId = Object.fromEntries(ranked.map((r) => [r.opportunity.id, r]));

  it("classe la PME éco-construction en tête et le grand groupe bancaire (le mieux payé) en dernier", () => {
    expect(ranked.map((r) => r.opportunity.id)).toEqual(["A", "B", "C"]);
    expect(Math.round(byId.A.score!)).toBe(83);
    expect(Math.round(byId.B.score!)).toBe(79);
    expect(Math.round(byId.C.score!)).toBe(43);
  });
  it("signale le freelance « à vérifier » : revenu et ambiance inconnus", () => {
    expect(byId.B.status).toBe("a_verifier");
    expect(byId.B.toVerify.map((t) => t.criterion.id)).toEqual(["bienveillance", "plancher"]);
  });
  it("alerte sur l'Anti-Contexte du grand groupe bancaire", () => {
    expect(byId.C.antiContextAlerts.map((a) => [a.criterionId, a.presence])).toEqual([["micromanagement", 100]]);
    expect(byId.A.antiContextAlerts).toHaveLength(0);
  });
  it("donne forces et faiblesses", () => {
    expect(byId.C.weaknesses.map((w) => w.criterion.id)).toContain("micromanagement");
    expect(byId.A.strengths.map((s) => s.criterion.id)).toContain("terrain");
  });
});
