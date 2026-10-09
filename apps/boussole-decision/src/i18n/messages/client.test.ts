import { describe, expect, it } from "vitest";
import { client } from "./client";
import { MESSAGES } from "./index";

const TIRETS_LONGS = /[\u2013\u2014]/;
const FRANCAIS = /[éèêàùçœ«»]|\b(le|la|les|des|du|une|est|pour|avec|vous|votre|tes|ton|ta|mon|mes|ma)\b/i;

function chaines(v: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof v === "string") return [{ chemin, texte: v }];
  if (typeof v === "function") return chaines((v as (...a: unknown[]) => unknown)("Camille", "MH-CAMILLE"), `${chemin}()`);
  if (Array.isArray(v)) return v.flatMap((x, i) => chaines(x, `${chemin}[${i}]`));
  if (typeof v === "object" && v !== null) return Object.entries(v).flatMap(([k, x]) => chaines(x, chemin ? `${chemin}.${k}` : k));
  return [];
}

function forme(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(forme);
  if (typeof v === "object" && v !== null) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forme(x)]));
  return typeof v;
}

describe("textes de l'accès client", () => {
  it("mêmes clés en français, anglais et espagnol", () => {
    expect(forme(client.en)).toEqual(forme(client.fr));
    expect(forme(client.es)).toEqual(forme(client.fr));
    expect(MESSAGES.es.client).toBe(client.es);
    expect(MESSAGES.en.client).toBe(client.en);
  });

  it("ni tiret long, ni chaîne vide, ni « gratuit »", () => {
    for (const locale of ["fr", "en"] as const) {
      for (const { chemin, texte } of chaines(client[locale])) {
        expect(TIRETS_LONGS.test(texte), `${locale}.${chemin}`).toBe(false);
        expect(texte.trim().length, `${locale}.${chemin}`).toBeGreaterThan(0);
        expect(/gratuit|free\b/i.test(texte), `${locale}.${chemin}`).toBe(false);
      }
    }
  });

  it("l'anglais n'a plus de texte français", () => {
    const restes = chaines(client.en)
      .filter(({ texte }) => FRANCAIS.test(texte))
      .map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 70)}`);
    expect(restes).toEqual([]);
  });

  it("3 étapes, durées en chiffres", () => {
    expect(client.fr.etapes.liste).toHaveLength(3);
    expect(client.en.etapes.liste).toHaveLength(3);
    for (const locale of ["fr", "en"] as const) {
      const tout = chaines(client[locale]).map((c) => c.texte).join(" ");
      expect(/\b(deux|trois|two|three) (minutes|étapes|steps)\b/i.test(tout)).toBe(false);
    }
  });

  it("le mot de passe reste facultatif, jamais obligatoire", () => {
    expect(client.fr.motDePasse.titre).toMatch(/facultatif/);
    expect(client.en.motDePasse.titre).toMatch(/optional/i);
    for (const locale of ["fr", "en"] as const) {
      const tout = chaines(client[locale]).map((c) => c.texte).join(" ");
      expect(/obligatoire|required|mandatory/i.test(tout)).toBe(false);
    }
  });
});
