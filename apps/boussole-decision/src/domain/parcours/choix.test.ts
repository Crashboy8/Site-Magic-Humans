import { describe, expect, it } from "vitest";
import { basculer, cochesDeLaVoie, freelanceCherchePoste, voieDesCoches } from "./choix";
import type { ChoixVoie } from "./types";

const cocher = (...voies: ChoixVoie[]) => voies.reduce<ChoixVoie[]>((c, v) => basculer(c, v), []);

describe("choisir deux voies en même temps", () => {
  it("une seule case : la voie cochée, comme avant", () => {
    for (const voie of ["A", "B", "C", "D", "E", "K", "inconnue"] as const) {
      expect(voieDesCoches(cocher(voie))).toBe(voie);
    }
    expect(voieDesCoches([])).toBeNull();
  });

  it("une voie entrepreneur et une voie salarié donnent la voie E (hybride), dans l'ordre où on les coche", () => {
    for (const [a, b] of [["A", "B"], ["A", "D"], ["C", "B"], ["C", "D"]] as const) {
      expect(voieDesCoches(cocher(a, b)), `${a}+${b}`).toBe("E");
      expect(voieDesCoches(cocher(b, a)), `${b}+${a}`).toBe("E");
      expect(cocher(a, b)).toEqual(cocher(b, a));
    }
  });

  it("freelance en attendant de décrocher un poste : entrepreneur (A) et entrepreneur qui revient au salariat (D) font E", () => {
    expect(voieDesCoches(cocher("A", "D"))).toBe("E");
  });

  it("deux voies du même côté ne se cumulent pas : la dernière remplace l'autre", () => {
    expect(cocher("A", "C")).toEqual(["C"]);
    expect(cocher("B", "D")).toEqual(["D"]);
    expect(cocher("A", "B", "D")).toEqual(["A", "D"]);
  });

  it("jamais plus de deux cases cochées", () => {
    for (const suite of [["A", "B", "C", "D"], ["B", "A", "D", "C", "A"], ["A", "B", "D", "C", "B"]] as ChoixVoie[][]) {
      expect(cocher(...suite).length).toBeLessThanOrEqual(2);
    }
  });

  it("E, la connaissance de soi et « Je ne sais pas encore » se choisissent seuls et remplacent le reste", () => {
    expect(cocher("A", "B", "E")).toEqual(["E"]);
    expect(cocher("A", "K")).toEqual(["K"]);
    expect(cocher("A", "B", "inconnue")).toEqual(["inconnue"]);
    expect(cocher("E", "A")).toEqual(["A"]);
    expect(cocher("K", "B")).toEqual(["B"]);
    expect(cocher("inconnue", "A", "D")).toEqual(["A", "D"]);
  });

  it("décocher une des deux voies garde l'autre ; tout décocher ne laisse aucune voie", () => {
    expect(basculer(["A", "B"], "A")).toEqual(["B"]);
    expect(voieDesCoches(basculer(["A", "B"], "B"))).toBe("A");
    expect(voieDesCoches(basculer(["E"], "E"))).toBeNull();
  });

  it("à la reprise, la voie E s'affiche cochée seule (rien d'autre n'est enregistré)", () => {
    expect(cochesDeLaVoie("E")).toEqual(["E"]);
    expect(cochesDeLaVoie("A")).toEqual(["A"]);
    expect(cochesDeLaVoie(null)).toEqual([]);
  });
});

describe("freelance qui cherche un poste", () => {
  it("c'est « entrepreneur » (A) et « entrepreneur qui veut redevenir salarié » (D) cochés ensemble", () => {
    expect(freelanceCherchePoste(cocher("A", "D"))).toBe(true);
    expect(freelanceCherchePoste(cocher("D", "A"))).toBe(true);
  });

  it("les autres paires gardent un emploi : le point d'attention sur le contrat de travail reste", () => {
    for (const [a, b] of [["A", "B"], ["C", "B"], ["C", "D"]] as const) expect(freelanceCherchePoste(cocher(a, b)), `${a}+${b}`).toBe(false);
    expect(freelanceCherchePoste(cocher("E"))).toBe(false);
    expect(freelanceCherchePoste(cocher("D"))).toBe(false);
    expect(freelanceCherchePoste(cocher("A"))).toBe(false);
    expect(freelanceCherchePoste([])).toBe(false);
  });

  it("à la reprise, A et D sont cochés de nouveau", () => {
    expect(cochesDeLaVoie("E", true)).toEqual(["A", "D"]);
    expect(cochesDeLaVoie("E", false)).toEqual(["E"]);
    expect(cochesDeLaVoie("D", true)).toEqual(["D"]);
  });
});
