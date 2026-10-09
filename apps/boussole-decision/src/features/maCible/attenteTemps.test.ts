import { sansInsecables as plat } from "@/i18n/typo";
import { describe, expect, it } from "vitest";
import { maCible } from "@/i18n/messages/maCible";
import { DELAI_MS } from "@/lib/maCible/traitement";
import { DELAI_CLIENT_MS } from "./api";
import { SEUIL_PATIENCE_MS, formaterDureeEcoulee, patienceVisible } from "./attenteTemps";

const M = maCible.fr;

describe("message d'attente", () => {
  it("reste caché pendant les 5 premières secondes, puis s'affiche", () => {
    expect(SEUIL_PATIENCE_MS).toBe(5000);
    expect(patienceVisible(0)).toBe(false);
    expect(patienceVisible(4999)).toBe(false);
    expect(patienceVisible(5000)).toBe(true);
    expect(patienceVisible(90_000)).toBe(true);
  });

  it("affiche une durée écoulée simple", () => {
    expect(formaterDureeEcoulee(0)).toBe("0 s");
    expect(formaterDureeEcoulee(5_000)).toBe("5 s");
    expect(formaterDureeEcoulee(59_999)).toBe("59 s");
    expect(formaterDureeEcoulee(65_000)).toBe("1 min 05 s");
    expect(plat(M.attente.ecoule(formaterDureeEcoulee(12_000)))).toBe("Temps écoulé : 12 s");
  });

  it("dit une minute max pour le cadrage, et 2 à 3 minutes (4 max) pour le résultat", () => {
    expect(M.attente.patienceCadrage).toContain("une minute max");
    expect(plat(M.attente.patienceResultat)).toBe(
      "Ta cible mûrit. Tu as le temps de prendre un café ou de répondre à un message, ça revient dans 2 à 3 minutes (4 minutes max).",
    );
    expect(M.attente.gardeOuverte).toBe("Garde cette page ouverte.");
  });

  it("laisse au navigateur plus de temps que le serveur, y compris une relance de cadrage", () => {
    expect(DELAI_CLIENT_MS).toBeGreaterThan(DELAI_MS.resultat);
    expect(DELAI_CLIENT_MS).toBeGreaterThan(DELAI_MS.cadrage * 2);
  });
});
