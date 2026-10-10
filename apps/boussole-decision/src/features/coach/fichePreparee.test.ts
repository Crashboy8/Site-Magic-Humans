import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lireFichePreparee } from "./fichePreparee";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../../domain/fiche/__fixtures__");
const fixture = (nom: string) => readFileSync(join(dir, nom), "utf8");

describe("fiche préparée par Pierre", () => {
  it("lit une fiche au modèle et la garde telle quelle", () => {
    const lue = lireFichePreparee(fixture("fiche-modele-2026.md"));
    expect(lue.ok).toBe(true);
    if (!lue.ok) return;
    expect(lue.methode).toBe("modele");
    expect(lue.fiche.mecanisme.length).toBeGreaterThan(12);
    expect(lue.fiche.v).toBe(1);
  });

  it("refuse une fiche vide en disant ce qui manque", () => {
    const lue = lireFichePreparee(fixture("fiche-vierge.md"));
    expect(lue.ok).toBe(false);
    if (lue.ok) return;
    expect(lue.manquants.length).toBeGreaterThan(0);
    expect(lue.manquants.every((c) => ["mecanisme", "contexte", "benefice", "antiContexte"].includes(c))).toBe(true);
  });
});
