import { describe, expect, it } from "vitest";
import { capitale, lienSortant, titreCourt, titreNumero } from "./liens";

describe("liens sortants", () => {
  it("ajoute les paramètres UTM au lien Calendly", () => {
    const lien = new URL(lienSortant("https://calendly.com/pierre-j-sarazin", "resultat"));
    expect(lien.origin + lien.pathname).toBe("https://calendly.com/pierre-j-sarazin");
    expect(Object.fromEntries(lien.searchParams)).toEqual({ utm_source: "site", utm_medium: "cta", utm_campaign: "ou-j-en-suis", utm_content: "resultat" });
  });

  it("laisse les liens des outils tels quels", () => {
    expect(lienSortant("https://www.magichumans.com/quiz/", "action")).toBe("https://www.magichumans.com/quiz/");
    expect(lienSortant("pas une adresse", "action")).toBe("pas une adresse");
  });

  it("met en forme les petits textes", () => {
    expect(capitale("offert")).toBe("Offert");
    expect(titreCourt("Niveau 2 · La prise de conscience")).toBe("La prise de conscience");
    expect(titreCourt("Sans point")).toBe("Sans point");
    expect(titreNumero("Niveau 5A · Vendre cher, devenir expert")).toBe("Niveau 5A");
  });
});
