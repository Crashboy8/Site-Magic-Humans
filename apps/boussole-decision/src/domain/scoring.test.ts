import { describe, expect, it } from "vitest";
import { CAMILLE_CRITERIA, CAMILLE_EVALUATIONS, CAMILLE_OPPORTUNITIES } from "@/content/exemple-camille";
import { formatScore, rankOpportunities, satisfactionOf, scoreOpportunity, type ScoringCriterion } from "./scoring";
import type { Evaluation } from "./types";

const c = (id: string, over: Partial<ScoringCriterion> = {}): ScoringCriterion => ({
  id,
  categoryId: "cat",
  label: id,
  kind: "WEIGHTED",
  weight: 3,
  direction: "TOWARDS",
  ...over,
});
const opp = { id: "o", name: "Opportunité" };
const ev = (criterionId: string, value: Evaluation["value"], opportunityId = "o"): Evaluation => ({ criterionId, opportunityId, value });

describe("satisfaction d'un critère", () => {
  it("TOWARDS : reprend la valeur évaluée", () => {
    expect(satisfactionOf(c("x"), "p75")).toBe(75);
  });
  it("AWAY_FROM : inverse la présence du risque", () => {
    expect(satisfactionOf(c("x", { direction: "AWAY_FROM" }), "p75")).toBe(25);
    expect(satisfactionOf(c("x", { direction: "AWAY_FROM" }), "non")).toBe(100);
  });
  it("« Je ne sais pas encore » et case vide ne sont pas évalués", () => {
    expect(satisfactionOf(c("x"), "inconnu")).toBeNull();
    expect(satisfactionOf(c("x"), null)).toBeNull();
  });
});

describe("score d'alignement global", () => {
  it("applique Σ(poids × satisfaction) / Σ(poids × 100)", () => {
    const r = scoreOpportunity(opp, [c("a", { weight: 5 }), c("b", { weight: 1 })], [ev("a", "oui"), ev("b", "non")]);
    expect(r.score).toBeCloseTo((5 * 100 + 1 * 0) / 600 * 100);
  });
  it("exclut les critères non évalués, et liste ce qui reste à vérifier", () => {
    const r = scoreOpportunity(opp, [c("a"), c("b"), c("d", { kind: "DEALBREAKER", weight: null })], [ev("a", "p50"), ev("b", "inconnu")]);
    expect(r.score).toBe(50);
    expect(r.evaluatedCount).toBe(1);
    expect(r.criteriaCount).toBe(3);
    expect(r.toVerify.map((t) => t.criterion.id)).toEqual(["b", "d"]);
  });
  it("ne compte pas les critères éliminatoires dans le score", () => {
    const r = scoreOpportunity(opp, [c("a"), c("d", { kind: "DEALBREAKER", weight: null })], [ev("a", "p75"), ev("d", "oui")]);
    expect(r.score).toBe(75);
  });
  it("renvoie null (« — ») quand aucun critère pondéré n'est évalué", () => {
    const r = scoreOpportunity(opp, [c("a")], [ev("a", "inconnu")]);
    expect(r.score).toBeNull();
    expect(formatScore(r.score)).toBe("—");
  });
});

describe("critères éliminatoires (DEALBREAKER)", () => {
  const plancher = c("plancher", { kind: "DEALBREAKER", weight: null });
  const ligneRouge = c("rouge", { kind: "DEALBREAKER", weight: null, direction: "AWAY_FROM" });

  it("TOWARDS : seul « Oui » respecte le critère", () => {
    expect(scoreOpportunity(opp, [plancher], [ev("plancher", "oui")]).status).toBe("conforme");
    expect(scoreOpportunity(opp, [plancher], [ev("plancher", "p75")]).status).toBe("non_conforme");
  });
  it("AWAY_FROM : la ligne rouge est franchie dès que le risque est un peu présent", () => {
    const r = scoreOpportunity(opp, [ligneRouge], [ev("rouge", "p25")]);
    expect(r.status).toBe("non_conforme");
    expect(r.antiContextAlerts).toEqual([{ criterionId: "rouge", label: "rouge", presence: 25, severity: "ligne_rouge" }]);
    expect(scoreOpportunity(opp, [ligneRouge], [ev("rouge", "non")]).status).toBe("conforme");
  });
  it("« Je ne sais pas encore » sur un éliminatoire : à vérifier", () => {
    expect(scoreOpportunity(opp, [plancher], [ev("plancher", "inconnu")]).status).toBe("a_verifier");
    expect(scoreOpportunity(opp, [plancher], []).status).toBe("a_verifier");
  });
});

describe("alertes Anti-Contexte", () => {
  const anti = c("anti", { direction: "AWAY_FROM", weight: 4 });
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
    const criteria = [c("a"), c("d", { kind: "DEALBREAKER", weight: null })];
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

describe("exemple de Camille", () => {
  const ranked = rankOpportunities(CAMILLE_OPPORTUNITIES, CAMILLE_CRITERIA, CAMILLE_EVALUATIONS);
  const byId = Object.fromEntries(ranked.map((r) => [r.opportunity.id, r]));

  it("classe la PME éco-construction en tête et le grand groupe bancaire (le mieux payé) en dernier", () => {
    expect(ranked.map((r) => r.opportunity.id)).toEqual(["A", "B", "C"]);
    expect(Math.round(byId.A.score!)).toBe(80);
    expect(Math.round(byId.B.score!)).toBe(78);
    expect(Math.round(byId.C.score!)).toBe(32);
  });
  it("signale le freelance « à vérifier » : revenu inconnu", () => {
    expect(byId.B.status).toBe("a_verifier");
    expect(byId.B.toVerify.map((t) => t.criterion.id)).toEqual(["ambiance", "plancher", "evolution"]);
    expect(byId.B.evaluatedCount).toBe(8);
  });
  it("alerte sur les Anti-Contextes du grand groupe bancaire", () => {
    expect(byId.C.antiContextAlerts.map((a) => [a.criterionId, a.presence])).toEqual([
      ["validation", 100],
      ["descendante", 75],
    ]);
    expect(byId.A.antiContextAlerts).toHaveLength(0);
  });
  it("donne les forces et faiblesses de chaque opportunité", () => {
    expect(byId.C.weaknesses.map((w) => w.criterion.id)).toEqual(["terrain", "validation", "histoires", "environnement", "descendante"]);
    expect(byId.A.strengths[0].criterion.id).toBe("environnement");
  });
  it("calcule un score par catégorie", () => {
    const anti = byId.C.byCategory.find((s) => s.categoryId === "cat-anti_contexte")!;
    expect(anti.score).toBeCloseTo(((4 * 25 + 3 * 0) / 700) * 100);
  });
});
