import { describe, expect, it } from "vitest";
import { maCible } from "./maCible";

const TIRETS_LONGS = /[\u2013\u2014]/;

/** Toutes les chaînes d'un dictionnaire, y compris le résultat des fonctions appelées avec des valeurs d'exemple. */
function chaines(v: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof v === "string") return [{ chemin, texte: v }];
  if (typeof v === "function") return chaines((v as (...a: unknown[]) => unknown)(3, 3, 3, 3), `${chemin}()`);
  if (Array.isArray(v)) return v.flatMap((x, i) => chaines(x, `${chemin}[${i}]`));
  if (typeof v === "object" && v !== null) return Object.entries(v).flatMap(([k, x]) => chaines(x, chemin ? `${chemin}.${k}` : k));
  return [];
}

/** Forme du dictionnaire : clés, types et tailles de tableaux. */
function forme(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(forme);
  if (typeof v === "object" && v !== null) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forme(x)]));
  return typeof v;
}

describe("textes de Ma Cible", () => {
  it("ne contiennent ni tiret cadratin ni demi-cadratin", () => {
    for (const locale of ["fr", "en", "es"] as const) {
      for (const { chemin, texte } of chaines(maCible[locale])) {
        expect(TIRETS_LONGS.test(texte), `${locale}.${chemin}`).toBe(false);
      }
    }
  });
  it("ont les mêmes clés en anglais et en espagnol qu'en français", () => {
    expect(forme(maCible.en)).toEqual(forme(maCible.fr));
    expect(forme(maCible.es)).toEqual(forme(maCible.fr));
  });
  it("n'ont aucune chaîne vide", () => {
    for (const locale of ["fr", "en", "es"] as const) {
      for (const { chemin, texte } of chaines(maCible[locale])) {
        expect(texte.trim().length, `${locale}.${chemin}`).toBeGreaterThan(0);
      }
    }
  });
  it("sont écrits au tutoiement", () => {
    const tout = chaines(maCible.fr).map((c) => c.texte).join(" ");
    expect(tout).not.toMatch(/\b(vous avez|votre|vos)\b/i);
  });
});
