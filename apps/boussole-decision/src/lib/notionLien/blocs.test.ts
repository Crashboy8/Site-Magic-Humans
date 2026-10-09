import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { lireFiche } from "@/domain/fiche/extraire";
import { blocsVersTexte, idsManquants, texteRiche, valeurBloc, type Blocs } from "./blocs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__");
const json = (n: string) => JSON.parse(readFileSync(join(dir, n), "utf8"));
const { pageId } = json("page.json") as { pageId: string };
const blocsDe = (...noms: string[]): Blocs => Object.assign({}, ...noms.map((n) => json(n).recordMap.block ?? {}));
const tous = () => blocsDe("loadPageChunk-0.json", "syncRecordValues-1.json", "syncRecordValues-2.json");
const attendu = readFileSync(join(dir, "attendu.md"), "utf8").replace(/\n$/, "");

describe("blocsVersTexte", () => {
  it("redonne attendu.md à l'identique", () => {
    expect(blocsVersTexte(tous(), pageId)).toBe(attendu);
  });
  it("jette mentions et adresses, et ne lit pas la sous-page", () => {
    const t = blocsVersTexte(tous(), pageId);
    expect(t).not.toContain("http");
    expect(t).not.toContain("\u2023");
    expect(t.toLowerCase()).not.toContain("sous-page");
  });
  it("la fiche lue depuis le texte est complète et propre", () => {
    const { fiche: f, rapport } = lireFiche(attendu);
    expect(f.titre).toBe("L'Architecte des Liens");
    expect(f.prenom).toBe("Camille");
    expect(f.mecanisme.startsWith("Relier des personnes")).toBe(true);
    expect(f.contexte).toBeTruthy();
    expect(f.benefice).toBeTruthy();
    expect(f.reussite).toHaveLength(3);
    expect(f.echec).toHaveLength(3);
    expect(f.valeurs).toHaveLength(5);
    expect(f.valeurs[0]).toBe("Liberté");
    expect(f.antiValeurs).toHaveLength(3);
    expect(f.enneagramme.base).toBe("Type 2");
    expect(f.avatars).toHaveLength(3);
    expect(rapport.methode).toBe("modele");
    const plat = JSON.stringify(f);
    expect(plat).not.toContain("Martinot");
    expect(plat).not.toContain("http");
    expect(plat.toLowerCase()).not.toContain("sous-page");
  });
});

describe("valeurBloc, texteRiche, idsManquants", () => {
  it("lit les deux formes d'enveloppe", () => {
    expect(valeurBloc({ value: { value: { id: "a" } } })).toEqual({ id: "a" });
    expect(valeurBloc({ value: { id: "b" } })).toEqual({ id: "b" });
    expect(valeurBloc(null)).toEqual({});
  });
  it("garde le texte d'un lien et jette les mentions", () => {
    expect(texteRiche([["Voir "], ["ici", [["a", "https://exemple.com"]]], ["\u2023", [["d", { start_date: "2026-01-01" }]]], ["\u2023", [["u", "x"]]]])).toBe("Voir ici");
  });
  it("sur le premier morceau seul, demande les enfants du titre repliable, pas la sous-page", () => {
    const manque = idsManquants(blocsDe("loadPageChunk-0.json"), pageId);
    expect(manque.length).toBeGreaterThan(0);
    const sync1 = Object.keys(blocsDe("syncRecordValues-1.json"));
    expect(manque.every((id) => sync1.includes(id))).toBe(true);
  });
});
