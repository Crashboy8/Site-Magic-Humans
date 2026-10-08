import { describe, expect, it } from "vitest";
import { contraste, coupureTitreCoupOeil, habillageBandeau, libellesFamille, normaliserVue, COULEUR_ACCENT, TEXTE_BANDEAU_SOMBRE } from "./coupOeil";
import { COULEUR_RELATION } from "./relationApparence";

describe("coup d'œil", () => {
  it("garde Fiches et ramène le reste aux Radars", () => {
    expect(normaliserVue("fiches")).toBe("fiches");
    expect(normaliserVue("radars")).toBe("radars");
    expect(normaliserVue("autre")).toBe("radars");
    expect(normaliserVue(null)).toBe("radars");
  });

  it("chaque bandeau atteint 4,5:1, et miel, abricot, ciel restent bruns", () => {
    const claires = new Set([COULEUR_RELATION.miel, COULEUR_RELATION.abricot, COULEUR_RELATION.ciel]);
    for (const hex of [...Object.values(COULEUR_RELATION), COULEUR_ACCENT]) {
      const habillage = habillageBandeau(hex);
      expect(contraste(habillage.fond, habillage.texte)).toBeGreaterThanOrEqual(4.5);
      if (claires.has(hex)) {
        expect(habillage.texte).toBe(TEXTE_BANDEAU_SOMBRE);
        expect(habillage.fond).toBe(hex);
      }
    }
  });

  it("coupe les titres français pour le mobile", () => {
    expect(coupureTitreCoupOeil("Tes relations en un coup d'œil")).toEqual(["Tes relations", "en un coup d'œil"]);
    expect(coupureTitreCoupOeil("Tes opportunités en un coup d'œil")).toEqual(["Tes opportunités", "en un coup d'œil"]);
    expect(coupureTitreCoupOeil("Your opportunities at a glance")).toBeNull();
    expect(coupureTitreCoupOeil("Tus oportunidades de un vistazo")).toBeNull();
  });

  it("nomme les quatre familles amour, dont L'énergie et l'amour", () => {
    expect(libellesFamille("Le fond : besoins, respect, valeurs")).toEqual({ court: "Fond", complet: "Le fond" });
    expect(libellesFamille("La direction commune")).toEqual({ court: "Direction", complet: "La direction commune" });
    expect(libellesFamille("Le quotidien : défauts et frictions")).toEqual({ court: "Quotidien", complet: "Le quotidien" });
    expect(libellesFamille("L'énergie et l'amour")).toEqual({ court: "Énergie", complet: "L'énergie et l'amour" });
  });
});
