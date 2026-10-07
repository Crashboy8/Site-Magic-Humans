import { describe, expect, it } from "vitest";
import { ENTREE_EXEMPLE, RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { classerCibles } from "@/domain/maCible/scores";
import { ajouterEntree, archiverCourant, normaliser, persister, type EntreeHistorique } from "./historique";

function fabrique(id: string): EntreeHistorique {
  return {
    id,
    faitLe: "2026-10-07T10:00:00.000Z",
    entree: structuredClone(ENTREE_EXEMPLE),
    resultat: { ...structuredClone(RESULTAT_EXEMPLE), classement: classerCibles(RESULTAT_EXEMPLE.cibles) },
    coches: Array<boolean>(12).fill(false),
  };
}

describe("historique", () => {
  it("ajoute en tête et ne garde que 10 résultats", () => {
    let liste: EntreeHistorique[] = [];
    for (let i = 0; i < 12; i++) liste = ajouterEntree(liste, fabrique(String(i)));
    expect(liste).toHaveLength(10);
    expect(liste[0].id).toBe("11");
    expect(liste[9].id).toBe("2");
    liste = ajouterEntree(liste, fabrique("5"));
    expect(liste[0].id).toBe("5");
    expect(liste.filter((e) => e.id === "5")).toHaveLength(1);
  });

  it("ignore un JSON invalide et les entrées abîmées", () => {
    expect(normaliser(null)).toEqual([]);
    expect(normaliser("{pas du json")).toEqual([]);
    expect(normaliser("null")).toEqual([]);
    expect(normaliser(JSON.stringify([{ id: 1 }, fabrique("ok")]))).toHaveLength(1);
    expect(normaliser(JSON.stringify([fabrique("ok")]))[0].resultat.cibles[0].nom).toBe(RESULTAT_EXEMPLE.cibles[0].nom);
  });

  it("range l'ancien résultat quand le nouveau arrive, et réessaie sans le plus ancien si le stockage est plein", () => {
    const ancien = fabrique("ancien");
    const liste = archiverCourant([], ancien);
    expect(liste.map((e) => e.id)).toEqual(["ancien"]);

    const gros = Array.from({ length: 10 }, (_, i) => fabrique(String(i)));
    const recus: string[] = [];
    persister(gros, (json) => {
      recus.push(json);
      if (recus.length === 1) throw new Error("plein");
    });
    expect(recus).toHaveLength(2);
    expect(JSON.parse(recus[1])).toHaveLength(9);
    expect(() => persister(gros, () => {
      throw new Error("plein");
    })).not.toThrow();
  });
});
