import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Les mots sont coupés en deux pour que ce fichier ne se signale pas lui-même.
const INTERDITS = [["mo", "2i"], ["Jo", "ël Guillon"], ["Hugues ", "Blanchet"]].map((p) => p.join(""));
const IGNORES = new Set([".git", "node_modules", ".next", ".vercel", "coverage"]);

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function fichiers(dossier: string): string[] {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    if (IGNORES.has(e.name)) return [];
    const chemin = join(dossier, e.name);
    return e.isDirectory() ? fichiers(chemin) : [chemin];
  });
}

describe("méthode Talent Unique de Magic Humans", () => {
  const tous = fichiers(RACINE);

  it("ne nomme aucune autre méthode ni auteur, dans aucun fichier du dépôt (casse ignorée)", () => {
    const trouves: string[] = [];
    for (const chemin of tous) {
      const octets = readFileSync(chemin);
      const texte = octets.includes(0) ? octets.toString("latin1") : octets.toString("utf8");
      for (const mot of INTERDITS) {
        if (texte.toLowerCase().includes(mot.toLowerCase())) trouves.push(`${relative(RACINE, chemin)} : ${mot}`);
      }
    }
    expect(trouves).toEqual([]);
  });

  it("ne le nomme pas non plus dans un nom de fichier", () => {
    const trouves = tous.map((c) => relative(RACINE, c)).filter((c) => INTERDITS.some((m) => c.toLowerCase().includes(m.toLowerCase())));
    expect(trouves).toEqual([]);
  });

  it("parcourt bien le dépôt entier", () => {
    const relatifs = tous.map((c) => relative(RACINE, c));
    expect(relatifs).toContain("index.html");
    expect(relatifs).toContain("apps/boussole-decision/package.json");
  });
});
