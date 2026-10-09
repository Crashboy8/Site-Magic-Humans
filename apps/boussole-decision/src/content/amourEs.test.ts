import { describe, expect, it } from "vitest";
import { LOVE_PROFILE_MARKER, LOVE_RESULTS, LOVE_TABLE, LOVE_TEMPLATE, LOVE_TEXTS, type LoveTemplate } from "./amour";
import { LOVE_RESULTS_ES, LOVE_TABLE_ES, LOVE_TEMPLATE_ES, LOVE_TEXTS_ES } from "./amourEs";
import { LOVE_TEMPLATE_EN } from "./amourEn";
import { amourPour, cleCategorieAmour, cleCritereAmour, critereModeleAmour } from "./amourLangue";
import { DEFAULT_WEIGHTS, scoreOpportunity, type ScoringCriterion } from "@/domain/scoring";
import { loveReadingOf } from "@/domain/loveReading";
import { applyLovePrefill, estRepriseQuiz, parseLovePrefill, quizMarkLine, quizProfilFrom, QUIZ_MARK_ES } from "@/domain/lovePrefill";
import { aidePourcentage, AIDE_POURCENTAGE_ES, proposePourcentage } from "@/domain/pourcentage";
import { lienQuizAmour, retourQuizAmour } from "@/domain/editionAmour";
import { FRANCAIS_ES } from "@/test/francais";

function chaines(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (typeof v === "function") chaines((v as (...a: unknown[]) => unknown)(42, "X", "Y"), out);
  else if (Array.isArray(v)) v.forEach((x) => chaines(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => chaines(x, out));
  return out;
}
function forme(v: unknown): unknown {
  if (typeof v === "string" || typeof v === "function") return typeof v;
  if (Array.isArray(v)) return v.map(forme);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forme(x)]));
  return v;
}

describe("Boussole Relation en espagnol", () => {
  it("le modèle espagnol a les mêmes clés, catégories, poids et non-négociables que le français", () => {
    const squelette = (t: LoveTemplate) => ({
      categories: t.categories.map((c) => c.key),
      criteria: t.criteria.map((c) => [c.key, c.category, c.importance, c.nonNegotiable, c.direction, c.critical, c.alert === ""]),
    });
    expect(squelette(LOVE_TEMPLATE_ES)).toEqual(squelette(LOVE_TEMPLATE));
    expect(forme(LOVE_TEXTS_ES)).toEqual(forme(LOVE_TEXTS));
    expect(forme(LOVE_TABLE_ES)).toEqual(forme(LOVE_TABLE));
    expect(forme(LOVE_RESULTS_ES)).toEqual(forme(LOVE_RESULTS));
  });

  it("le repère technique en base ne change jamais", () => {
    expect(LOVE_TEMPLATE_ES.profileDescription).toBe(LOVE_PROFILE_MARKER);
  });

  it("espagnol propre : pas de français, pas de tiret long, pas d'« oportunidad »", () => {
    const tout = chaines([LOVE_TEMPLATE_ES, LOVE_TEXTS_ES, LOVE_TABLE_ES, LOVE_RESULTS_ES]).filter((s) => s !== LOVE_PROFILE_MARKER);
    expect(tout.length).toBeGreaterThan(60);
    for (const s of tout) {
      expect(FRANCAIS_ES.test(s), s).toBe(false);
      expect(s, s).not.toMatch(/[—–]/);
      expect(s, s).not.toMatch(/oportunidad/i);
    }
  });

  it("l'espagnol a ses propres textes", () => {
    expect(amourPour("es").template).toBe(LOVE_TEMPLATE_ES);
    expect(amourPour("es").texts).toBe(LOVE_TEXTS_ES);
    expect(amourPour("es").results).toBe(LOVE_RESULTS_ES);
  });

  it("un critère enregistré dans une langue est reconnu dans toutes les autres", () => {
    LOVE_TEMPLATE.criteria.forEach((fr, i) => {
      const es = LOVE_TEMPLATE_ES.criteria[i];
      expect(cleCritereAmour(es.label)).toBe(fr.key);
      expect(critereModeleAmour(fr.label, "es")?.label).toBe(es.label);
      expect(critereModeleAmour(es.label, "fr")?.label).toBe(fr.label);
      expect(critereModeleAmour(LOVE_TEMPLATE_EN.criteria[i].label, "es")?.label).toBe(es.label);
    });
    LOVE_TEMPLATE.categories.forEach((c, i) => {
      expect(cleCategorieAmour(LOVE_TEMPLATE_ES.categories[i].label)).toBe(c.key);
    });
  });

  it("lecture en espagnol d'une Boussole créée en français : alertes en espagnol, sécurité en premier", () => {
    const criteria: ScoringCriterion[] = LOVE_TEMPLATE.criteria.map((c) => ({
      id: c.key, categoryId: c.category, label: c.label, importance: c.importance, nonNegotiable: c.nonNegotiable, direction: c.direction,
    }));
    const evaluations = LOVE_TEMPLATE.criteria.map((c) => ({
      criterionId: c.key, opportunityId: "o", value: c.key === "respect" ? ("p25" as const) : c.key === "incompatibilite" ? ("non" as const) : ("oui" as const),
    }));
    const r = loveReadingOf(scoreOpportunity({ id: "o", name: "Mi relación" }, criteria, evaluations, DEFAULT_WEIGHTS), "es");
    expect(r.alerts[0].kind).toBe("securite");
    expect(r.alerts[0].text).toBe(LOVE_TEXTS_ES.safety);
    expect(r.alerts[0].text).toContain("016");
    const critique = r.alerts.find((a) => a.kind === "critique");
    expect(critique?.text).toBe(LOVE_TEMPLATE_ES.criteria.find((c) => c.key === "respect")?.alert);
  });

  it("préréglage du quiz en espagnol : repère espagnol, profil retrouvé, notes reprises", () => {
    expect(quizMarkLine("Espejo Sereno", "valeurs", "es")).toBe("Tomado de tu Test del Amor (tus valores, perfil «Espejo Sereno»).");
    expect(estRepriseQuiz(quizMarkLine("Espejo Sereno", "besoins", "es"))).toBe(true);
    expect(quizProfilFrom(["otro", quizMarkLine("Espejo Sereno", "eviter", "es")])).toBe("Espejo Sereno");
    const prefill = parseLovePrefill({
      v: 3,
      imp: { energie: "tres_important", frictions: "important", langage: "important", complementarite: "moyen" },
      notes: { energie: "Te recargas a solas, en calma." },
      p: "Espejo Sereno",
    });
    const rows = applyLovePrefill(prefill, "es");
    expect(rows.map((r) => r.label)).toEqual(LOVE_TEMPLATE_ES.criteria.map((c) => c.label));
    const energie = rows.find((r) => r.key === "energie")!;
    expect(energie.description.endsWith(LOVE_TEXTS_ES.quizNoteLabel + "Te recargas a solas, en calma.")).toBe(true);
    expect(QUIZ_MARK_ES).toBe("Tomado de tu Test del Amor");
  });

  it("aide au pourcentage et retour au quiz dans la langue de l'interface", () => {
    expect(aidePourcentage("es")).toBe(AIDE_POURCENTAGE_ES);
    expect(proposePourcentage(LOVE_TEMPLATE_ES.criteria.find((c) => c.key === "attirance")!.guide)).toBe(true);
    expect(proposePourcentage(LOVE_TEMPLATE_ES.criteria.find((c) => c.key === "sexualite")!.guide)).toBe(true);
    expect(lienQuizAmour("es")).toBe("/quiz-amour/?lang=es");
    expect(retourQuizAmour("es").label).toBe("← Test del Amor");
  });
});
