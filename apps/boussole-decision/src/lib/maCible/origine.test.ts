import { describe, expect, it } from "vitest";
import { origineAcceptee } from "./origine";

const prod = { VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.magichumans.com" };
const dev = { VERCEL_ENV: "development" };

describe("origineAcceptee", () => {
  it("accepte le site, avec ou sans www", () => {
    expect(origineAcceptee("https://www.magichumans.com", prod)).toBe(true);
    expect(origineAcceptee("https://magichumans.com", prod)).toBe(true);
  });
  it("accepte l'origine de NEXT_PUBLIC_SITE_URL", () => {
    expect(origineAcceptee("https://preprod.exemple.fr", { NEXT_PUBLIC_SITE_URL: "https://preprod.exemple.fr/chemin" })).toBe(true);
  });
  it("accepte les prévisualisations Vercel", () => {
    expect(origineAcceptee("https://boussole-decision-git-ma-cible-1-magic-humans.vercel.app", prod)).toBe(true);
    expect(origineAcceptee("https://boussole-decision.vercel.app", prod)).toBe(true);
    expect(origineAcceptee("https://wwwmagichumanscom-git-ma-cible-1-magic-humans.vercel.app", prod)).toBe(true);
  });
  it("refuse les autres origines et les imitations", () => {
    for (const o of ["https://exemple.com", "https://magichumans.com.evil.fr", "https://evil.fr/https://www.magichumans.com", "http://www.magichumans.com", "https://autre.vercel.app", "https://boussole-decision.evil.app", "null", "pas une adresse"])
      expect(origineAcceptee(o, prod), o).toBe(false);
  });
  it("refuse l'absence d'origine", () => {
    expect(origineAcceptee(null, prod)).toBe(false);
    expect(origineAcceptee("", prod)).toBe(false);
  });
  it("accepte localhost hors production seulement", () => {
    expect(origineAcceptee("http://localhost:3000", dev)).toBe(true);
    expect(origineAcceptee("http://localhost:3000", prod)).toBe(false);
    expect(origineAcceptee("http://localhost:3001", dev)).toBe(false);
  });
});
