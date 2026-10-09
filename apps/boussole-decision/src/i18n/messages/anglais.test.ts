import { describe, expect, it } from "vitest";
import { outilsPour, OUTILS } from "@/features/espace/outils";
import { espace } from "./espace";
import { MESSAGES } from "./index";
import { maCible } from "./maCible";

const TIRETS_LONGS = /[\u2013\u2014]/;
/** Indices d'un texte resté en français. */
const FRANCAIS = /[éèêàùçœ«»]|\b(le|la|les|des|du|une|est|pour|avec|vous|votre|tes|ton|ta|mon|mes|ma)\b/i;

function chaines(v: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof v === "string") return [{ chemin, texte: v }];
  if (typeof v === "function") return chaines((v as (...a: unknown[]) => unknown)(3, 3, "HT", "x"), `${chemin}()`);
  if (Array.isArray(v)) return v.flatMap((x, i) => chaines(x, `${chemin}[${i}]`));
  if (typeof v === "object" && v !== null) return Object.entries(v).flatMap(([k, x]) => chaines(x, chemin ? `${chemin}.${k}` : k));
  return [];
}

function forme(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(forme);
  if (typeof v === "object" && v !== null) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forme(x)]));
  return typeof v;
}

/** Ce qui reste volontairement en français : la locale de formatage et les mentions qui citent un nom propre. */
const PERMIS = /^commun\.locale$/;

describe("dictionnaires anglais du Cibleur et de Mon espace", () => {
  it("le Cibleur anglais n'a plus de texte français", () => {
    const restes = chaines(maCible.en)
      .filter(({ chemin, texte }) => !PERMIS.test(chemin) && FRANCAIS.test(texte))
      .map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 70)}`);
    expect(restes).toEqual([]);
  });

  it("Mon espace anglais n'a plus de texte français", () => {
    const restes = chaines(espace.en)
      .filter(({ texte }) => FRANCAIS.test(texte))
      .map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 70)}`);
    expect(restes).toEqual([]);
  });

  it("Mon espace a les mêmes clés dans les trois langues, sans tiret long ni chaîne vide", () => {
    expect(forme(espace.en)).toEqual(forme(espace.fr));
    expect(forme(espace.es)).toEqual(forme(espace.fr));
    for (const locale of ["fr", "en", "es"] as const) {
      for (const { chemin, texte } of chaines(espace[locale])) {
        expect(TIRETS_LONGS.test(texte), `${locale}.${chemin}`).toBe(false);
        expect(texte.trim().length, `${locale}.${chemin}`).toBeGreaterThan(0);
      }
    }
  });

  it("l'espagnol de Mon espace est pour l'instant la copie du français", () => {
    expect(espace.es).toBe(espace.fr);
    expect(MESSAGES.es.espace).toBe(espace.fr);
    expect(MESSAGES.en.espace).toBe(espace.en);
  });

  it("le mot de confirmation de suppression change avec la langue", () => {
    expect(espace.fr.compte.mot).toBe("SUPPRIMER");
    expect(espace.en.compte.mot).toBe("DELETE");
    expect(espace.en.compte.texte).toContain(espace.en.compte.mot);
    expect(espace.en.compte.motAttendu).toContain(espace.en.compte.mot);
  });

  it("les cartes de Mon espace suivent la langue, avec les mêmes liens et couleurs", () => {
    const en = outilsPour(espace.en.outils);
    expect(en.map((o) => o.lien)).toEqual(OUTILS.map((o) => o.lien));
    expect(en.map((o) => o.couleurBouton)).toEqual(OUTILS.map((o) => o.couleurBouton));
    expect(en.find((o) => o.cle === "cibleur")?.titre).toBe("The Targeter");
    expect(en.find((o) => o.cle === "qcm")?.bouton).toBe("Take the quiz");
    expect(OUTILS.find((o) => o.cle === "cibleur")?.titre).toBe("Le Cibleur");
  });

  it("le nom du Cibleur est le même partout en anglais", () => {
    const nom = maCible.en.commun.nomOutil;
    expect(espace.en.outils.cibleur.titre).toBe(nom);
    expect(espace.en.depuisCibleur.surtitre).toContain(nom);
  });
});
