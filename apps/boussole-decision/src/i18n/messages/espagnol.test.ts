import { describe, expect, it } from "vitest";
import { espace } from "./espace";
import { client } from "./client";
import { MESSAGES } from "./index";
import { maCible, NOM_OUTIL } from "./maCible";
import { FRANCAIS_ES } from "@/test/francais";

const TIRETS_LONGS = /[–—]/;
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

/** Textes qui citent volontairement un nom propre ou une adresse. */
const PERMIS = /^$/;

describe("dictionnaires espagnols", () => {
  for (const cle of Object.keys(MESSAGES.fr) as (keyof typeof MESSAGES.fr)[]) {
    it(`${cle} : mêmes clés que le français, aucun texte français, aucun tiret long, aucune chaîne vide`, () => {
      expect(forme(MESSAGES.es[cle])).toEqual(forme(MESSAGES.fr[cle]));
      const restes = chaines(MESSAGES.es[cle])
        .filter(({ chemin, texte }) => !PERMIS.test(chemin) && FRANCAIS_ES.test(texte))
        .map(({ chemin, texte }) => `${cle}.${chemin} : ${texte.slice(0, 70)} <${texte.match(FRANCAIS_ES)?.[0]}>`);
      expect(restes).toEqual([]);
      for (const { chemin, texte } of chaines(MESSAGES.es[cle])) {
        // « — » d'une case vide : chantier à part (petites améliorations), identique dans les trois langues.
        if (chemin !== "noneYet") expect(TIRETS_LONGS.test(texte), `${cle}.${chemin}`).toBe(false);
        expect(texte.trim().length, `${cle}.${chemin}`).toBeGreaterThan(0);
      }
    });
  }

  it("le Cibleur espagnol suit le glossaire validé", () => {
    expect(NOM_OUTIL.es).toBe("El Buscador de Clientes");
    expect(maCible.es.commun.nomOutil).toBe(NOM_OUTIL.es);
    expect(espace.es.outils.cibleur.titre).toBe(NOM_OUTIL.es);
    expect(espace.es.depuisCibleur.surtitre).toContain(NOM_OUTIL.es);
    expect(client.es.message.corps("https://x", "MH-1")).toContain(NOM_OUTIL.es);
    expect(maCible.es.commun.sousTitre).toBe("Encuentra los clientes con los que triunfas disfrutando");
    expect(maCible.es.resultat.grille.plaisir.cinq).toContain("Contexto Desencadenante");
    expect(maCible.es.resultat.grille.plaisir.un).toContain("Anti-Contexto");
  });

  it("la phrase de confirmation de suppression est en espagnol", () => {
    expect(espace.es.compte.mot).toBe("ELIMINAR");
    expect(espace.es.compte.texte).toContain(espace.es.compte.mot);
    expect(espace.es.compte.motAttendu).toContain(espace.es.compte.mot);
  });

  it("l'espagnol utilise les espaces insécables (nombre et unité, guillemets)", () => {
    expect(maCible.es.accueil.etapes[4]).toContain("30 días");
  });
});
