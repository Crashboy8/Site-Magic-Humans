import { describe, expect, it } from "vitest";
import { normaliserPourComparer, verifierVerbatims, type SyntheseBrute } from "./terrain";
import type { NoteTerrain } from "./types";

const note = (id: NoteTerrain["id"], texte: string): NoteTerrain => ({ id, titre: "", texte });

function synthese(verbatims: SyntheseBrute["verbatims"], motsCles: string[] = []): SyntheseBrute {
  return { resume: "Résumé.", profils: [], douleurs: [], verbatims, declencheurs: [], objections: [], motsCles };
}

describe("verifierVerbatims", () => {
  const texte = "C'est l'heure de partir vraiment, je n'en peux plus de ces réunions.";

  it("garde une phrase identique et une apostrophe courbe", () => {
    const notes = [note("n1", texte)];
    const r = verifierVerbatims(
      synthese([{ id: "v4", note: "n1", citation: "C’est l'heure de partir vraiment", theme: "douleur" }]),
      notes,
    );
    expect(r.retires).toBe(0);
    expect(r.synthese.verbatims).toEqual([{ id: "v1", note: "n1", citation: "C’est l'heure de partir vraiment", theme: "douleur" }]);
    expect(normaliserPourComparer("C’est")).toBe(normaliserPourComparer("C'est"));
  });

  it("retire une phrase reformulée", () => {
    const r = verifierVerbatims(synthese([{ id: "v1", note: "n1", citation: "Il est temps de s'en aller pour de bon", theme: "autre" }]), [note("n1", texte)]);
    expect(r.synthese.verbatims).toEqual([]);
    expect(r.retires).toBe(1);
  });

  it("garde une phrase coupée par des points de suspension si chaque morceau est là, dans l'ordre", () => {
    const long = "Le debut de la phrase est bien là et ensuite la fin de la phrase arrive.";
    const r = verifierVerbatims(
      synthese([{ id: "v2", note: "n1", citation: "Le debut de la phrase ... la fin de la phrase", theme: "resultat" }]),
      [note("n1", long)],
    );
    expect(r.synthese.verbatims).toHaveLength(1);
    expect(r.synthese.verbatims[0].id).toBe("v1");
  });

  it("retire une phrase qui contient un téléphone masqué, et les mots-clés absents", () => {
    const r = verifierVerbatims(
      synthese(
        [
          { id: "v1", note: "n1", citation: "Appelle le [téléphone] demain matin", theme: "autre" },
          { id: "v8", note: "n1", citation: "je n'en peux plus de ces réunions", theme: "douleur" },
        ],
        ["réunions", "budget secret"],
      ),
      [note("n1", texte)],
    );
    expect(r.synthese.verbatims.map((v) => v.id)).toEqual(["v1"]);
    expect(r.synthese.verbatims[0].citation).toBe("je n'en peux plus de ces réunions");
    expect(r.synthese.motsCles).toEqual(["réunions"]);
    expect(r.retires).toBe(2);
  });

  it("renumérote v1…vN dans l'ordre restant", () => {
    const a = "premiere phrase assez longue";
    const b = "deuxieme phrase assez longue";
    const r = verifierVerbatims(
      synthese([
        { id: "v9", note: "n1", citation: a, theme: "douleur" },
        { id: "v2", note: "n2", citation: "phrase inventée qui n'est pas dans les notes", theme: "autre" },
        { id: "v12", note: "n2", citation: b, theme: "objection" },
      ]),
      [note("n1", a), note("n2", b)],
    );
    expect(r.synthese.verbatims.map((v) => v.id)).toEqual(["v1", "v2"]);
    expect(r.synthese.verbatims.map((v) => v.note)).toEqual(["n1", "n2"]);
  });
});
