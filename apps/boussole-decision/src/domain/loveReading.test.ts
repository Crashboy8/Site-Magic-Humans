import { describe, expect, it } from "vitest";
import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import { DEFAULT_WEIGHTS, scoreOpportunity, type ScoringCriterion } from "./scoring";
import { bandOf, loveReadingOf } from "./loveReading";
import type { EvaluationValue } from "./types";

const criteria: ScoringCriterion[] = LOVE_TEMPLATE.criteria.map((c) => ({
  id: c.key, categoryId: c.category, label: c.label, importance: c.importance, nonNegotiable: c.nonNegotiable, direction: c.direction,
}));
type Note = EvaluationValue | { value: EvaluationValue; percent: number };
const read = (values: Partial<Record<string, Note>>) => {
  const evaluations = Object.entries(values).flatMap(([criterionId, note]) => {
    if (!note) return [];
    return [
      typeof note === "string"
        ? { criterionId, opportunityId: "o", value: note }
        : { criterionId, opportunityId: "o", value: note.value, percent: note.percent },
    ];
  });
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
  it("incompatibilité : ligne rouge douce jusqu'à 50 %, plus ferme au-delà", () => {
    const low = read({ ...all("oui"), incompatibilite: "p25" });
    expect(low.alerts[0]).toMatchObject({ kind: "ligne_rouge", text: LOVE_TEXTS.ligneRougeLow });
    const mid = read({ ...all("oui"), incompatibilite: "p50" });
    expect(mid.alerts.find((a) => a.kind === "ligne_rouge")?.text).toBe(LOVE_TEXTS.ligneRougeLow);
    const high = read({ ...all("oui"), incompatibilite: "p75" });
    expect(high.alerts.find((a) => a.kind === "ligne_rouge")?.text).toBe(LOVE_TEXTS.ligneRougeHigh);
  });
  it("lecture provisoire sous 7 critères évalués", () => {
    expect(read({ besoins: "oui", respect: "oui" }).provisional).toBe(true);
  });
  it("aucune évaluation : pas de tranche", () => {
    expect(read({}).band).toBeNull();
  });
  it("un pourcentage de 50 % sur un critère critique alerte, 55 % non", () => {
    expect(read({ ...all("oui"), defauts: { value: "p50", percent: 50 } }).alerts.map((a) => a.criterionId)).toContain("defauts");
    expect(read({ ...all("oui"), defauts: { value: "p50", percent: 55 } }).alerts.map((a) => a.criterionId)).not.toContain("defauts");
  });
  it("attirance et sexualité à 0 % ne déclenchent pas l'alerte énergie", () => {
    const r = read({ ...all("oui"), attirance: { value: "non", percent: 0 }, sexualite: { value: "non", percent: 0 } });
    expect(r.alerts.map((a) => a.kind)).not.toContain("energie");
  });
  it("incompatibilité à 50 % reste une ligne rouge douce", () => {
    const r = read({ ...all("oui"), incompatibilite: { value: "p50", percent: 50 } });
    expect(r.alerts.find((a) => a.kind === "ligne_rouge")?.text).toBe(LOVE_TEXTS.ligneRougeLow);
  });
  it("énergie à 25 % : alerte après sécurité, ligne rouge et critique ; à 50 %, pas d'alerte", () => {
    const low = read({ ...all("oui"), respect: "p25", incompatibilite: "p25", energie: "p25" });
    expect(low.alerts.map((a) => a.kind)).toEqual(["securite", "ligne_rouge", "critique", "energie"]);
    const mid = read({ ...all("oui"), energie: "p50" });
    expect(mid.alerts.map((a) => a.kind)).not.toContain("energie");
  });
});
