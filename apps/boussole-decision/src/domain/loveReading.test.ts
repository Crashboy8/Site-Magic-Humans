import { describe, expect, it } from "vitest";
import { LOVE_TEMPLATE } from "@/content/amour";
import { DEFAULT_WEIGHTS, scoreOpportunity, type ScoringCriterion } from "./scoring";
import { bandOf, loveReadingOf } from "./loveReading";
import type { EvaluationValue } from "./types";

const criteria: ScoringCriterion[] = LOVE_TEMPLATE.criteria.map((c) => ({
  id: c.key, categoryId: c.category, label: c.label, importance: c.importance, nonNegotiable: c.nonNegotiable, direction: c.direction,
}));
const read = (values: Partial<Record<string, EvaluationValue>>) => {
  const evaluations = Object.entries(values).map(([criterionId, value]) => ({ criterionId, opportunityId: "o", value: value as EvaluationValue }));
  return loveReadingOf(scoreOpportunity({ id: "o", name: "Ma relation" }, criteria, evaluations, DEFAULT_WEIGHTS));
};
const all = (v: EvaluationValue) => ({
  besoins: v, respect: v, valeurs: v, direction: v, defauts: v, frictions: v, energie: v, langage: v, complementarite: v,
  incompatibilite: "non" as EvaluationValue,
});

describe("loveReading", () => {
  it("tranches", () => {
    expect([bandOf(80), bandOf(79.4), bandOf(65), bandOf(64.4), bandOf(50), bandOf(49.4)]).toEqual(["solide", "base", "base", "tension", "tension", "desalignement"]);
  });
  it("tout à « Oui » et aucune incompatibilité : 100 %, solide, sans alerte", () => {
    const r = read(all("oui"));
    expect(Math.round(r.score!)).toBe(100);
    expect(r.band).toBe("solide");
    expect(r.alerts).toEqual([]);
    expect(r.provisional).toBe(false);
  });
  it("un critère critique à « À moitié » déclenche une alerte même avec un bon score", () => {
    const r = read({ ...all("oui"), defauts: "p50" });
    expect(r.band).toBe("solide");
    expect(r.alerts.map((a) => a.criterionId)).toEqual(["defauts"]);
  });
  it("respect noté « Plutôt non » : alerte sécurité en premier, puis alerte critique", () => {
    const r = read({ ...all("oui"), respect: "p25" });
    expect(Math.round(r.score!)).toBe(91);
    expect(r.band).toBe("solide");
    expect(r.alerts.map((a) => a.kind)).toEqual(["securite", "critique"]);
  });
  it("incompatibilité un peu présente : ligne rouge", () => {
    const r = read({ ...all("oui"), incompatibilite: "p25" });
    expect(r.alerts[0].kind).toBe("ligne_rouge");
  });
  it("lecture provisoire sous 7 critères évalués", () => {
    expect(read({ besoins: "oui", respect: "oui" }).provisional).toBe(true);
  });
  it("aucune évaluation : pas de tranche", () => {
    expect(read({}).band).toBeNull();
  });
  it("énergie à 25 % : alerte après sécurité, ligne rouge et critique ; à 50 %, pas d'alerte", () => {
    const low = read({ ...all("oui"), respect: "p25", incompatibilite: "p25", energie: "p25" });
    expect(low.alerts.map((a) => a.kind)).toEqual(["securite", "ligne_rouge", "critique", "energie"]);
    const mid = read({ ...all("oui"), energie: "p50" });
    expect(mid.alerts.map((a) => a.kind)).not.toContain("energie");
  });
});
