import { describe, expect, it } from "vitest";
import { nettoyerTextes } from "./nettoyage";

describe("nettoyerTextes", () => {
  it("remplace les intervalles par « à »", () => expect(nettoyerTextes("80\u2013120 €")).toBe("80 à 120 €"));
  it("remplace les tirets longs par des virgules", () => {
    expect(nettoyerTextes("oui \u2014 vraiment")).toBe("oui, vraiment");
    expect(nettoyerTextes("\u2014 début")).toBe("début");
  });
  it("retire le gras", () => expect(nettoyerTextes("**gras** et __aussi__")).toBe("gras et aussi"));
  it("réduit les espaces", () => expect(nettoyerTextes("  un   deux  ")).toBe("un deux"));

  it("retire les années et les guillemets des lieux seulement", () => {
    const sortie = nettoyerTextes({
      cibles: [
        {
          pitch: "Depuis 2019, je travaille.",
          lieux: [{ type: "Salon RH 2026", pourquoi: "Édition 2025 utile", recherche: "« salon RH Rennes 2026 »" }],
        },
      ],
    });
    expect(sortie.cibles[0].pitch).toBe("Depuis 2019, je travaille.");
    expect(sortie.cibles[0].lieux[0]).toEqual({ type: "Salon RH", pourquoi: "Édition utile", recherche: "salon RH Rennes" });
  });

  it("garde les sauts de ligne", () => {
    const corps = "Bonjour [Prénom],\n\nPremier \u2014 paragraphe.\n\n{{prenom}}";
    expect(nettoyerTextes({ emailCorps: corps }).emailCorps).toBe("Bonjour [Prénom],\n\nPremier, paragraphe.\n\n{{prenom}}");
  });

  it("ne change ni la structure ni les nombres", () => {
    const entree = { a: 1, b: [2, true, null, { c: "x" }], d: { e: [] as string[] } };
    expect(nettoyerTextes(entree)).toEqual(entree);
  });
});
