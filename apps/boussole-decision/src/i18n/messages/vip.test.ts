import { describe, expect, it } from "vitest";
import { MESSAGES } from "./index";
import { vip } from "./vip";

const TIRETS_LONGS = /[\u2013\u2014]/;
/** Indices d'un texte resté en français. */
const FRANCAIS = /[éèêàùçœ«»]|\b(le|la|les|des|du|une|est|pour|avec|vous|votre|tes|ton|ta|mon|mes|ma)\b/i;

function chaines(v: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof v === "string") return [{ chemin, texte: v }];
  if (typeof v === "function") return chaines((v as (...a: unknown[]) => unknown)("10/10/2026"), `${chemin}()`);
  if (Array.isArray(v)) return v.flatMap((x, i) => chaines(x, `${chemin}[${i}]`));
  if (typeof v === "object" && v !== null) return Object.entries(v).flatMap(([k, x]) => chaines(x, chemin ? `${chemin}.${k}` : k));
  return [];
}

function forme(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(forme);
  if (typeof v === "object" && v !== null) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forme(x)]));
  return typeof v;
}

describe("textes de l'accord, des groupes M3, de Tes données et des codes", () => {
  it("mêmes clés dans les trois langues, branchées dans les dictionnaires", () => {
    expect(forme(vip.en)).toEqual(forme(vip.fr));
    expect(forme(vip.es)).toEqual(forme(vip.fr));
    expect(MESSAGES.fr.vip).toBe(vip.fr);
    expect(MESSAGES.en.vip).toBe(vip.en);
    expect(MESSAGES.es.vip).toBe(vip.es);
  });

  it("ni tiret long, ni chaîne vide", () => {
    for (const locale of ["fr", "en", "es"] as const) {
      for (const { chemin, texte } of chaines(vip[locale])) {
        expect(TIRETS_LONGS.test(texte), `${locale}.${chemin}`).toBe(false);
        expect(texte.trim().length, `${locale}.${chemin}`).toBeGreaterThan(0);
      }
    }
  });

  it("l'anglais n'a plus de texte français", () => {
    const restes = chaines(vip.en)
      .filter(({ texte }) => FRANCAIS.test(texte))
      .map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 70)}`);
    expect(restes).toEqual([]);
  });

  it("la case d'accord dit mot pour mot ce qui est demandé", () => {
    expect(vip.fr.accord.case).toBe("J'accepte que ma fiche talent soit stockée dans mon espace");
  });

  it("dit où sont les données : Supabase, Union européenne, Irlande", () => {
    expect(vip.fr.donnees.ou.texte).toContain("Supabase");
    expect(vip.fr.donnees.ou.texte).toContain("Union européenne");
    expect(vip.fr.donnees.ou.texte).toContain("Irlande");
  });

  it("aucun numéro de téléphone dans les textes", () => {
    for (const locale of ["fr", "en", "es"] as const) {
      for (const { chemin, texte } of chaines(vip[locale])) {
        expect(/(\+33|\b0[1-9])([\s. -]?\d{2}){4}/.test(texte), `${locale}.${chemin}`).toBe(false);
      }
    }
  });
});
