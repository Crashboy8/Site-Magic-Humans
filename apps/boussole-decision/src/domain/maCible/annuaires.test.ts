import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { maCible } from "@/i18n/messages/maCible";
import { ANNUAIRES_SALONS, urlRechercheGoogle } from "./annuaires";

describe("annuaires de salons", () => {
  it("garde les deux adresses dans une seule constante", () => {
    expect(ANNUAIRES_SALONS.france).toBe("https://salonsenfrance.fr/");
    expect(ANNUAIRES_SALONS.international).toBe("https://www.eventseye.com/fairs/c1_trade-shows_france.html");
    expect(urlRechercheGoogle("salon RH Rennes")).toBe("https://www.google.com/search?q=salon%20RH%20Rennes");
  });

  it("les liens de l'interface importent la constante sans recopier les adresses", () => {
    const src = readFileSync(new URL("../../features/maCible/LiensLieu.tsx", import.meta.url), "utf8");
    expect(src).toContain("ANNUAIRES_SALONS");
    expect(src).toContain('target="_blank"');
    expect(src).toContain('rel="noopener noreferrer"');
    expect(src).not.toContain("salonsenfrance");
    expect(src).not.toContain("eventseye.com");
    expect(maCible.fr.resultat.annuairesIntro).toBe("Pour voir tous les salons à venir :");
    expect(maCible.fr.resultat.annuaireSalons).toBe("Voir l'annuaire des salons");
    expect(maCible.fr.esquisse.pourquoiPas).toBe("Pourquoi pas dans tes 3 cibles :");
    expect(maCible.fr.resultat.salonsInternational).toBe("Salons à l'international");
    expect(maCible.fr.resultat.chercherGoogle).toBe("Chercher sur Google");
  });
});
