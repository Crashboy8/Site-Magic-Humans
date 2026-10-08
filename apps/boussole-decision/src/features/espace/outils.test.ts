import { describe, expect, it } from "vitest";
import { OUTILS } from "./outils";

function canal(valeur: number): number {
  const s = valeur / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

/** Luminance relative WCAG, calculée ici pour ne pas dépendre de l'implémentation testée. */
function luminanceRelative(hex: string): number {
  const n = hex.replace("#", "");
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a: string, b: string): number {
  const l1 = luminanceRelative(a);
  const l2 = luminanceRelative(b);
  const clair = Math.max(l1, l2);
  const sombre = Math.min(l1, l2);
  return (clair + 0.05) / (sombre + 0.05);
}

describe("OUTILS", () => {
  it("compte 6 cartes, 4 côté pro et 2 côté cœur", () => {
    expect(OUTILS).toHaveLength(6);
    expect(OUTILS.filter((o) => o.section === "pro")).toHaveLength(4);
    expect(OUTILS.filter((o) => o.section === "coeur")).toHaveLength(2);
  });

  it("garde les liens exacts", () => {
    expect(OUTILS.map((o) => [o.cle, o.lien])).toEqual([
      ["qcm", "/quiz/"],
      ["carte", "/carte-du-talent/"],
      ["cibleur", "/boussole-decision/ma-cible/"],
      ["boussole", "/boussole-decision/"],
      ["amour", "/quiz-amour/"],
      ["relation", "/boussole-decision/importer-quiz/?theme=amour"],
    ]);
  });

  it("vérifie le contraste WCAG des boutons et le repli du quiz", () => {
    expect(contraste("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    const qcm = OUTILS.find((o) => o.cle === "qcm");
    expect(qcm?.forte).toBe("#D4532C");
    if (contraste("#D4532C", "#FFFFFF") < 4.5) {
      expect(qcm?.couleurBouton).toBe("#B8441F");
    }
    for (const outil of OUTILS) {
      const texte = outil.encre ? "#3A2F24" : "#FFFFFF";
      expect(contraste(outil.couleurBouton, texte), outil.cle).toBeGreaterThanOrEqual(4.5);
    }
  });
});
