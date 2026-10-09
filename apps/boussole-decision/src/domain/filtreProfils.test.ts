import { describe, expect, it } from "vitest";
import { LOVE_PROFILE_MARKER } from "@/content/amour";
import { MESSAGES } from "@/i18n/messages";
import { categorieProfil, derniereModification, filtreActif, filtreUtile, filtreValide, rangerProfils } from "./filtreProfils";

const profil = (id: string, amour: boolean, updatedAt: string) => ({ id, description: amour ? LOVE_PROFILE_MARKER : "pro", updatedAt });
const version = (profileId: string, updatedAt: string) => ({ profileId, updatedAt });

describe("filtre de Mes profils", () => {
  it("reconnaît une Boussole Relation à sa description", () => {
    expect(categorieProfil({ description: LOVE_PROFILE_MARKER })).toBe("amour");
    expect(categorieProfil({ description: "" })).toBe("pro");
  });

  it("prend la plus récente des modifications du profil et de ses versions", () => {
    const vs = [version("a", "2026-10-05T10:00:00Z"), version("a", "2026-10-09T10:00:00Z"), version("b", "2026-10-10T10:00:00Z")];
    expect(derniereModification({ id: "a", updatedAt: "2026-10-01T10:00:00Z" }, vs)).toBe("2026-10-09T10:00:00Z");
    expect(derniereModification({ id: "c", updatedAt: "2026-10-01T10:00:00Z" }, vs)).toBe("2026-10-01T10:00:00Z");
  });

  it("range pro puis amour, du plus récent au plus ancien", () => {
    const ps = [
      profil("p1", false, "2026-10-01T00:00:00Z"),
      profil("a1", true, "2026-10-03T00:00:00Z"),
      profil("p2", false, "2026-10-02T00:00:00Z"),
      profil("a2", true, "2026-10-01T00:00:00Z"),
      profil("p3", false, "2026-09-01T00:00:00Z"),
    ];
    const r = rangerProfils(ps, [version("p3", "2026-10-08T00:00:00Z"), version("a2", "2026-10-07T00:00:00Z")]);
    expect(r.pro.map((p) => p.id)).toEqual(["p3", "p2", "p1"]);
    expect(r.amour.map((p) => p.id)).toEqual(["a2", "a1"]);
  });

  it("n'affiche le filtre que si les deux catégories existent", () => {
    expect(filtreUtile({ pro: 3, amour: 2 })).toBe(true);
    expect(filtreUtile({ pro: 3, amour: 0 })).toBe(false);
    expect(filtreUtile({ pro: 0, amour: 2 })).toBe(false);
    expect(filtreActif("amour", null, { pro: 3, amour: 0 })).toBe("tous");
  });

  it("l'adresse passe avant le choix mémorisé, « tous » par défaut", () => {
    const comptes = { pro: 5, amour: 4 };
    expect(filtreActif(null, null, comptes)).toBe("tous");
    expect(filtreActif(null, "amour", comptes)).toBe("amour");
    expect(filtreActif("pro", "amour", comptes)).toBe("pro");
  });

  it("refuse un filtre inconnu dans l'adresse", () => {
    expect(filtreValide("pro")).toBe("pro");
    expect(filtreValide(["amour"])).toBe("amour");
    expect(filtreValide("perso")).toBeNull();
    expect(filtreValide(undefined)).toBeNull();
  });

  it("textes en français, anglais et espagnol, sans tiret long", () => {
    for (const locale of ["fr", "en", "es"] as const) {
      const p = MESSAGES[locale].profile;
      for (const t of [p.filterLabel, p.filterAll, p.filterPro, p.filterLove, p.sectionPro, p.sectionLove, p.newLoveCompass, p.newLoveCompassPending, p.newLoveCompassFailed]) {
        expect(t.length, locale).toBeGreaterThan(0);
        expect(t).not.toMatch(/[\u2013\u2014]/);
      }
      expect(p.newLoveCompass.startsWith("+ ")).toBe(true);
    }
  });
});
