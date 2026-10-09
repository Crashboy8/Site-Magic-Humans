import { describe, expect, it } from "vitest";
import { LOVE_PROFILE_MARKER, LOVE_RESULTS, LOVE_TABLE, LOVE_TEMPLATE, LOVE_TEXTS, type LoveTemplate } from "./amour";
import { LOVE_RESULTS_EN, LOVE_TABLE_EN, LOVE_TEMPLATE_EN, LOVE_TEXTS_EN } from "./amourEn";
import { amourPour, cleCategorieAmour, cleCritereAmour, critereModeleAmour } from "./amourLangue";
import { DEFAULT_WEIGHTS, scoreOpportunity, type ScoringCriterion } from "@/domain/scoring";
import { loveReadingOf } from "@/domain/loveReading";
import { applyLovePrefill, estRepriseQuiz, parseLovePrefill, quizMarkLine, quizProfilFrom, QUIZ_MARK_EN } from "@/domain/lovePrefill";
import { aidePourcentage, AIDE_POURCENTAGE, AIDE_POURCENTAGE_EN, proposePourcentage } from "@/domain/pourcentage";
import { lienQuizAmour, retourQuizAmour, uniquementAmour } from "@/domain/editionAmour";
import { outilsPour } from "@/features/espace/outils";
import { espace } from "@/i18n/messages/espace";
import { sansInsecables } from "@/i18n/typo";

/** Toutes les chaînes d'un objet, y compris celles produites par ses fonctions (appelées avec des valeurs neutres). */
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

describe("Boussole Relation en anglais (lot EN 2)", () => {
  it("le modèle anglais a les mêmes clés, catégories, poids et non-négociables que le français", () => {
    const squelette = (t: LoveTemplate) => ({
      categories: t.categories.map((c) => c.key),
      criteria: t.criteria.map((c) => [c.key, c.category, c.importance, c.nonNegotiable, c.direction]),
    });
    expect(squelette(LOVE_TEMPLATE_EN)).toEqual(squelette(LOVE_TEMPLATE));
    expect(forme(LOVE_TEXTS_EN)).toEqual(forme(LOVE_TEXTS));
    expect(forme(LOVE_TABLE_EN)).toEqual(forme(LOVE_TABLE));
    expect(forme(LOVE_RESULTS_EN)).toEqual(forme(LOVE_RESULTS));
  });

  it("le repère technique en base ne change jamais, quelle que soit la langue", () => {
    expect(LOVE_PROFILE_MARKER).toBe("Boussole Relation (mode amour)");
    expect(LOVE_TEMPLATE_EN.profileDescription).toBe(LOVE_PROFILE_MARKER);
    expect(LOVE_TEMPLATE.profileDescription).toBe(LOVE_PROFILE_MARKER);
    expect(LOVE_TEMPLATE_EN.profileName).toBe("Relationship Compass");
    expect(uniquementAmour([{ description: LOVE_TEMPLATE_EN.profileDescription }])).toBe(true);
  });

  it("anglais propre : pas de français, pas de tiret long, pas d'« opportunity », nombres en chiffres", () => {
    const tout = chaines([LOVE_TEMPLATE_EN, LOVE_TEXTS_EN, LOVE_TABLE_EN, LOVE_RESULTS_EN]).filter((s) => s !== LOVE_PROFILE_MARKER);
    expect(tout.length).toBeGreaterThan(60);
    for (const s of tout) {
      expect(s, s).not.toMatch(/[àâçéèêëîïôûùœ«»]|\b(tu|ton|ta|tes|le|la|les|des|et|avec)\b/);
      expect(s, s).not.toMatch(/[—–]/);
      expect(s, s).not.toMatch(/opportunit/i);
      expect(s, s).not.toMatch(/\b(two|three|four|five|six|seven|eight|nine|ten)\b/i);
    }
  });

  it("l'anglais a ses propres textes", () => {
    expect(amourPour("en").template).toBe(LOVE_TEMPLATE_EN);
    expect(amourPour("fr").texts).toBe(LOVE_TEXTS);
  });

  it("un critère enregistré dans une langue est reconnu dans l'autre", () => {
    LOVE_TEMPLATE.criteria.forEach((fr, i) => {
      const en = LOVE_TEMPLATE_EN.criteria[i];
      expect(cleCritereAmour(fr.label)).toBe(fr.key);
      expect(cleCritereAmour(en.label)).toBe(fr.key);
      expect(critereModeleAmour(fr.label, "en")?.label).toBe(en.label);
      expect(critereModeleAmour(en.label, "fr")?.label).toBe(fr.label);
    });
    LOVE_TEMPLATE.categories.forEach((c, i) => {
      expect(cleCategorieAmour(c.label)).toBe(c.key);
      expect(cleCategorieAmour(LOVE_TEMPLATE_EN.categories[i].label)).toBe(c.key);
    });
    expect(cleCritereAmour("Un critère à moi")).toBeNull();
  });

  it("lecture en anglais d'une Boussole créée en français : alertes en anglais, sécurité en premier", () => {
    const criteria: ScoringCriterion[] = LOVE_TEMPLATE.criteria.map((c) => ({
      id: c.key, categoryId: c.category, label: c.label, importance: c.importance, nonNegotiable: c.nonNegotiable, direction: c.direction,
    }));
    const evaluations = LOVE_TEMPLATE.criteria.map((c) => ({
      criterionId: c.key, opportunityId: "o", value: c.key === "respect" ? ("p25" as const) : c.key === "incompatibilite" ? ("non" as const) : ("oui" as const),
    }));
    const r = loveReadingOf(scoreOpportunity({ id: "o", name: "My relationship" }, criteria, evaluations, DEFAULT_WEIGHTS), "en");
    expect(r.alerts[0].kind).toBe("securite");
    expect(r.alerts[0].text).toBe(LOVE_TEXTS_EN.safety);
    expect(r.alerts[0].text).toContain("3919");
    const critique = r.alerts.find((a) => a.kind === "critique");
    expect(critique?.text).toBe(LOVE_TEMPLATE_EN.criteria.find((c) => c.key === "respect")?.alert);
  });

  it("préréglage du quiz en anglais : repère anglais, profil retrouvé, notes reprises", () => {
    expect(quizMarkLine("Peaceful Mirror", "valeurs", "en")).toBe("From your Love Quiz (your values, profile “Peaceful Mirror”).");
    expect(estRepriseQuiz(quizMarkLine("Peaceful Mirror", "besoins", "en"))).toBe(true);
    expect(estRepriseQuiz(quizMarkLine("Ancre Paisible", "besoins", "fr"))).toBe(true);
    expect(quizProfilFrom(["autre", quizMarkLine("Peaceful Mirror", "eviter", "en")])).toBe("Peaceful Mirror");
    expect(quizProfilFrom([quizMarkLine("Ancre Paisible", "eviter", "fr")])).toBe("Ancre Paisible");
    const prefill = parseLovePrefill({
      v: 3,
      imp: { energie: "tres_important", frictions: "important", langage: "important", complementarite: "moyen" },
      notes: { energie: "You recharge alone, in peace and quiet." },
      p: "Peaceful Mirror",
    });
    const rows = applyLovePrefill(prefill, "en");
    expect(rows.map((r) => r.label)).toEqual(LOVE_TEMPLATE_EN.criteria.map((c) => c.label));
    const energie = rows.find((r) => r.key === "energie")!;
    expect(energie.importance).toBe("tres_important");
    expect(energie.description.endsWith(LOVE_TEXTS_EN.quizNoteLabel + "You recharge alone, in peace and quiet.")).toBe(true);
    expect(QUIZ_MARK_EN).toBe("From your Love Quiz");
  });

  it("aide au pourcentage, retour au quiz et liens des cartes dans la langue de l'interface", () => {
    expect(aidePourcentage("en")).toBe(AIDE_POURCENTAGE_EN);
    expect(aidePourcentage("fr")).toBe(AIDE_POURCENTAGE);
    const attirance = LOVE_TEMPLATE_EN.criteria.find((c) => c.key === "attirance");
    expect(proposePourcentage(attirance!.guide)).toBe(true);
    expect(lienQuizAmour("en")).toBe("/quiz-amour/?lang=en");
    expect(retourQuizAmour("en").label).toBe("← Love Quiz");
    expect(retourQuizAmour("fr").label).toBe("← Quiz Amour");
    const en = outilsPour(espace.en.outils, "en");
    expect(en.find((o) => o.cle === "amour")?.lien).toMatch(/\?lang=en$/);
    expect(en.find((o) => o.cle === "qcm")?.lien).toMatch(/\?lang=en$/);
    expect(outilsPour(espace.fr.outils, "fr").find((o) => o.cle === "amour")?.lien).not.toContain("lang=");
    expect(sansInsecables(espace.en.outils.relation.titre)).toBe("Decision Compass: personal");
  });
});
