import { describe, expect, it } from "vitest";
import { mapEvaluation } from "@/data/mappers";
import { setEvaluation } from "@/data/repository";
import { appliquerPourcentageLocal, auPas, pourcentageValide, valeurProche } from "./pourcentage";

describe("pourcentage", () => {
  it("accepte un entier de 0 à 100, par pas de 5", () => {
    expect(pourcentageValide(0)).toBe(true);
    expect(pourcentageValide(65)).toBe(true);
    expect(pourcentageValide(100)).toBe(true);
    expect(pourcentageValide(63)).toBe(false);
    expect(pourcentageValide(null)).toBe(false);
    expect(auPas(63)).toBe(65);
    expect(auPas(-3)).toBe(0);
    expect(auPas(104)).toBe(100);
    expect(valeurProche(65)).toBe("p75");
    expect(valeurProche(50)).toBe("p50");
    expect(valeurProche(0)).toBe("non");
  });

  it("lit la colonne si elle est là, et l'ignore si elle manque", () => {
    const ligne = (extra: Record<string, unknown> = {}) =>
      mapEvaluation({ criterion_id: "c", opportunity_id: "o", value: "p75", ...extra });
    expect(ligne().percent).toBeUndefined();
    expect(ligne({ percent: null }).percent).toBeNull();
    expect(ligne({ percent: 65 }).percent).toBe(65);
    expect(ligne({ percent: 63 }).percent).toBeNull();
  });

  it("reprend le cache seulement sans colonne, et seulement s'il colle à la note en mots", () => {
    const base = { criterionId: "c", opportunityId: "o", value: "p75" as const };
    expect(appliquerPourcentageLocal(base, 65).percent).toBe(65);
    expect(appliquerPourcentageLocal(base, 40).percent).toBeUndefined();
    expect(appliquerPourcentageLocal({ ...base, percent: null }, 65).percent).toBeUndefined();
    expect(appliquerPourcentageLocal({ ...base, percent: 80 }, 65).percent).toBe(80);
  });

  it("retombe sur la note en mots la plus proche si la colonne percent manque", async () => {
    const upserts: Record<string, unknown>[] = [];
    const db = {
      from: () => ({
        upsert: async (patch: Record<string, unknown>) => {
          upserts.push(patch);
          if ("percent" in patch) {
            return { error: { code: "PGRST204", message: "Could not find the 'percent' column of 'evaluations' in the schema cache" } };
          }
          return { data: null, error: null };
        },
      }),
    };
    await setEvaluation(db as never, "v", "c", "o", { value: "oui", percent: 65 });
    expect(upserts[0]).toMatchObject({ value: "p75", percent: 65 });
    expect(upserts[1]).toMatchObject({ value: "p75" });
    expect(upserts[1]).not.toHaveProperty("percent");
  });
});
