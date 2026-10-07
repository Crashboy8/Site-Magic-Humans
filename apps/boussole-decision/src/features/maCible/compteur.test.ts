import { describe, expect, it } from "vitest";
import { compteurVisible } from "./compteur";

describe("compteur de caractères", () => {
  it("reste caché loin du plafond de 2 000", () => {
    expect(compteurVisible(0, 2000)).toBe(false);
    expect(compteurVisible(1799, 2000)).toBe(false);
  });
  it("s'affiche dans les 200 derniers caractères, y compris au plafond", () => {
    expect(compteurVisible(1800, 2000)).toBe(true);
    expect(compteurVisible(2000, 2000)).toBe(true);
  });
  it("sur un champ court, s'affiche dans les 20 % derniers", () => {
    expect(compteurVisible(95, 120)).toBe(false);
    expect(compteurVisible(96, 120)).toBe(true);
  });
});
