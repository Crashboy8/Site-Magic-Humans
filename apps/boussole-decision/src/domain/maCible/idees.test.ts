import { describe, expect, it } from "vitest";
import { ENTREE_PIERRE } from "./exemple";
import { TEXTE_PISTE_LIGNE, TEXTE_PISTE_RAISON, couvrirIdees } from "./idees";
import type { AutrePiste, IdIdee, IdPiste, PisteEsquisse } from "./types";

const idees = ENTREE_PIERRE.terrain.ciblesEnTete;
const IDS: IdPiste[] = ["p1", "p2", "p3", "p4", "p5", "p6"];

function cible(ids: IdIdee[]) {
  return { depuisIdees: ids };
}

function piste(id: IdPiste, ids: IdIdee[] = [], nom = `Piste ${id}`): PisteEsquisse {
  return {
    id,
    nom,
    marche: "b2b",
    enUneLigne: "Une piste assez longue pour être gardée.",
    raison: "Elle passe après les trois pour l'instant.",
    depuisIdees: ids,
  };
}

describe("couvrirIdees", () => {
  it("utilise les 8 idées de Pierre", () => {
    expect(idees).toHaveLength(8);
    expect(idees[0]).toBe("cadres de 35 à 55 ans en reconversion, multi-potentiels");
    expect(idees[7]).toBe("athlètes de haut niveau en reconversion");
  });

  it("ajoute les deux idées absentes des cibles et des pistes", () => {
    const r = couvrirIdees(
      {
        cibles: [cible(["i1"]), cible(["i2"]), cible(["i3"])],
        autresPistes: [piste("p1", ["i4"]), piste("p2", ["i5"]), piste("p3", ["i6"])],
        hypotheses: [],
      },
      idees,
      "les_deux",
      false,
    );
    expect(r.ajoutees).toBe(2);
    expect(r.sortie.autresPistes).toHaveLength(5);
    const ajoutees = r.sortie.autresPistes.slice(3);
    expect(ajoutees.map((p) => p.id)).toEqual(["p4", "p5"]);
    expect(ajoutees.map((p) => p.depuisIdees)).toEqual([["i7"], ["i8"]]);
    expect(ajoutees[0].nom).toBe(idees[6]);
    expect(ajoutees[1].nom).toBe(idees[7]);
    expect(ajoutees[0].enUneLigne).toBe(TEXTE_PISTE_LIGNE);
    expect(ajoutees[0].raison).toBe(TEXTE_PISTE_RAISON);
    expect(ajoutees[0].marche).toBe("b2b");
    expect("notes" in ajoutees[0]).toBe(false);
  });

  it("remplace la dernière piste sans idée quand les six places sont prises", () => {
    const r = couvrirIdees(
      { cibles: [cible([]), cible([]), cible([])], autresPistes: IDS.map((id) => piste(id)), hypotheses: [] },
      ["militaires en reconversion"],
      "b2c",
      true,
    );
    expect(r.sortie.autresPistes[5].id).toBe("p6");
    expect(r.sortie.autresPistes[5].nom).toBe("militaires en reconversion");
    expect(r.sortie.autresPistes[5].depuisIdees).toEqual(["i1"]);
    expect(r.sortie.autresPistes[5].marche).toBe("b2c");
    expect((r.sortie.autresPistes[5] as AutrePiste).notes).toEqual({ urgence: 3, paiement: 3, acces: 3, plaisir: 3 });
    expect(r.sortie.autresPistes[4].nom).toBe("Piste p5");
  });

  it("ajoute une hypothèse quand les six pistes viennent déjà d'idées", () => {
    const sept = [...idees.slice(0, 6), "une septième idée vraiment différente"];
    const r = couvrirIdees(
      {
        cibles: [cible([]), cible([]), cible([])],
        autresPistes: IDS.map((id, i) => piste(id, [`i${i + 1}` as IdIdee])),
        hypotheses: [],
      },
      sept,
      "b2b",
      false,
    );
    expect(r.sortie.autresPistes[5].depuisIdees).toEqual(["i6"]);
    expect(r.sortie.hypotheses).toEqual([
      "Ton idée « une septième idée vraiment différente » n'a pas pu être étudiée cette fois. Propose-la dans l'esquisse pour la creuser.",
    ]);
  });

  it("retire i9 et un identifiant au-delà du nombre d'idées", () => {
    const r = couvrirIdees(
      {
        cibles: [{ depuisIdees: ["i1", "i9"] as IdIdee[] }, cible([]), cible([])],
        autresPistes: [piste("p1", ["i3"])],
        hypotheses: [],
      },
      ["une seule idée"],
      "b2b",
      false,
    );
    expect(r.sortie.cibles[0].depuisIdees).toEqual(["i1"]);
    expect(r.sortie.autresPistes[0].depuisIdees).toEqual([]);
    expect(r.ajoutees).toBe(2);
  });
});
