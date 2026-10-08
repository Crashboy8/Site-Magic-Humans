import { describe, expect, it } from "vitest";
import { LOVE_RESULTS, LOVE_TABLE, LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import { AIDE_POURCENTAGE } from "@/domain/pourcentage";
import { results } from "@/i18n/messages/results";

/** Aplatit les textes affichés (chaînes et fonctions appelées avec un exemple). */
function textes(valeur: unknown): string[] {
  if (typeof valeur === "string") return [valeur];
  if (typeof valeur === "function") return [String(valeur("56 %", "31 %"))];
  if (Array.isArray(valeur)) return valeur.flatMap(textes);
  if (valeur && typeof valeur === "object") return Object.values(valeur).flatMap(textes);
  return [];
}

describe("textes amour", () => {
  it("la synthèse d'une seule relation et l'encadré parlent de relation", () => {
    expect(LOVE_RESULTS.onlyOne("56 %")).toBe(" est la seule relation évaluée pour l'instant : 56 % d'alignement.");
    expect(LOVE_RESULTS.allFail).toBe(
      "Aucune relation ne respecte pour l'instant tous tes besoins essentiels. Prends le temps de regarder lesquels comptent vraiment pour toi, et si l'un d'eux peut s'assouplir.",
    );
  });

  it("aucun texte amour affiché ne dit opportunité", () => {
    const vus = [...textes(LOVE_RESULTS), ...textes(LOVE_TABLE), ...textes(LOVE_TEXTS)];
    expect(vus.filter((t) => /opportunit/i.test(t))).toEqual([]);
    expect(vus.some((t) => t.includes("—") || t.includes("–"))).toBe(false);
  });

  it("ajoute attirance et sexualité dans L'énergie et l'amour, en très important", () => {
    expect(LOVE_TEMPLATE.categories).toHaveLength(4);
    expect(LOVE_TEMPLATE.criteria).toHaveLength(12);
    const energie = LOVE_TEMPLATE.criteria.filter((c) => c.category === "energie");
    expect(energie.map((c) => c.key)).toEqual(["energie", "langage", "attirance", "sexualite"]);
    for (const key of ["attirance", "sexualite"] as const) {
      const critere = LOVE_TEMPLATE.criteria.find((c) => c.key === key)!;
      expect(critere.importance).toBe("tres_important");
      expect(critere.nonNegotiable).toBe(false);
      expect(critere.critical).toBe(false);
      expect(critere.guide).toContain(AIDE_POURCENTAGE);
    }
    expect(LOVE_TEXTS.energyAlert).toContain("te vide");
    expect(LOVE_TEXTS.energyAlert).not.toContain("Attirance");
    expect(LOVE_TEXTS.bands.base.text).toContain("le fond");
    expect(LOVE_TEXTS.bands.base.questions[0]).toContain("de fond ou de forme");
  });

  it("les textes pro de la synthèse restent inchangés", () => {
    expect(results.fr.onlyOne("56 %")).toBe(" est la seule opportunité évaluée pour l'instant\u00a0: 56 % d'alignement.");
    expect(results.fr.allFail).toContain("Aucune opportunité ne respecte");
    expect(results.fr.allFail).toContain("non-négociables");
  });
});
