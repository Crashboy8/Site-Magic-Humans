import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "./exemple";
import { classerCibles, GRILLE, POIDS, scoreSur10 } from "./scores";
import type { Cible, IdCible } from "./types";

const note = (n: number) => ({ note: n as 1 | 2 | 3 | 4 | 5, raison: "raison" });
const scores = (u: number, p: number, a: number, pl: number): Cible["scores"] => ({ urgence: note(u), paiement: note(p), acces: note(a), plaisir: note(pl) });
const cible = (id: IdCible, u: number, p: number, a: number, pl: number) => ({ id, scores: scores(u, p, a, pl) });

describe("scoreSur10", () => {
  it.each([
    [5, 5, 5, 5, 10],
    [1, 1, 1, 1, 2],
    [3, 3, 3, 3, 6],
    [4, 4, 5, 5, 8.9],
    [4, 4, 3, 4, 7.6],
    [3, 2, 3, 3, 5.5],
    [5, 5, 5, 2, 8.5],
  ])("%i %i %i %i : %f", (u, p, a, pl, attendu) => expect(scoreSur10(scores(u, p, a, pl))).toBe(attendu));

  it("les poids de la grille valent 100 %", () => {
    expect(GRILLE.reduce((s, g) => s + g.poids, 0)).toBe(100);
    expect(Object.values(POIDS).reduce((s, p) => s + p, 0)).toBeCloseTo(1);
    for (const g of GRILLE) expect(POIDS[g.cle] * 100).toBeCloseTo(g.poids);
  });
});

describe("classerCibles", () => {
  it("ordonne RESULTAT_EXEMPLE : c1, c2, c3", () => {
    const c = classerCibles(RESULTAT_EXEMPLE.cibles);
    expect(c.map((x) => [x.id, x.score, x.rang])).toEqual([
      ["c1", 8.9, "prioritaire"],
      ["c2", 7.6, "secondaire"],
      ["c3", 5.5, "tertiaire"],
    ]);
  });

  it("classe l'alerte plaisir en dernier, même avec le meilleur score", () => {
    const c = classerCibles([cible("c1", 5, 5, 5, 2), cible("c2", 3, 2, 3, 3), cible("c3", 3, 3, 3, 3)]);
    expect(c.map((x) => x.id)).toEqual(["c3", "c2", "c1"]);
    expect(c[2]).toMatchObject({ id: "c1", score: 8.5, alertePlaisir: true, rang: "tertiaire" });
    expect(c[0].alertePlaisir).toBe(false);
  });

  it("départage les égalités par plaisir, puis urgence, puis id", () => {
    // Même score 6 : plaisir 5 (c2) devant plaisir 3 (c1).
    expect(classerCibles([cible("c1", 3, 3, 3, 3), cible("c2", 2, 3, 4, 5), cible("c3", 1, 1, 1, 1)]).map((x) => x.id)).toEqual(["c2", "c1", "c3"]);
    // Même score (5,5) et même plaisir : urgence décroissante.
    const urgente = cible("c2", 3, 3, 3, 3);
    const moins = cible("c1", 2, 5, 2, 3);
    expect(scoreSur10(urgente.scores)).toBe(scoreSur10(moins.scores));
    expect(classerCibles([moins, urgente]).map((x) => x.id)).toEqual(["c2", "c1"]);
    // Tout égal : id croissant.
    expect(classerCibles([cible("c3", 3, 3, 3, 3), cible("c1", 3, 3, 3, 3), cible("c2", 3, 3, 3, 3)]).map((x) => x.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("est déterministe", () => {
    const entree = [cible("c2", 3, 3, 3, 3), cible("c1", 3, 3, 3, 3), cible("c3", 4, 4, 4, 4)];
    expect(classerCibles(entree)).toEqual(classerCibles([...entree].reverse()));
  });
});
