import { describe, expect, it } from "vitest";
import { mapOpportunity } from "@/data/mappers";
import { saveOpportunityAppearance } from "@/data/repository";
import { LOVE_RESULTS } from "@/content/amour";
import type { CriterionResult } from "./scoring";
import {
  COULEUR_JAUGE,
  COULEUR_RELATION,
  apparenceParDefaut,
  apparencesResolues,
  colonneAbsente,
  couleurJauge,
  ecrireApparenceNotes,
  espacesFins,
  etatBesoinEssentiel,
  etatRisque,
  lignesBesoins,
  lireApparenceNotes,
  notesSansMarqueur,
  phraseBesoin,
  phraseRisque,
  tonJauge,
} from "./relationApparence";
import type { RelationColor, RelationIcon } from "./types";

describe("apparence par défaut", () => {
  it("donne une icône et une couleur différentes à chaque relation", () => {
    const huit = apparencesResolues(Array.from({ length: 8 }, (_, i) => ({ id: String(i), position: i })));
    expect(huit.map((r) => r.icon)).toEqual(["coeur", "etoile", "soleil", "lune", "montagne", "vague", "fleur", "feuille"]);
    expect(huit.map((r) => r.color)).toEqual(["corail", "framboise", "miel", "abricot", "eau", "sauge", "lilas", "ciel"]);
    expect(new Set(huit.map((r) => r.icon)).size).toBe(8);
    expect(new Set(huit.map((r) => r.color)).size).toBe(8);
  });

  it("garde un choix déjà enregistré et évite de le redonner", () => {
    const look = { icon: "lune" as RelationIcon, color: "lilas" as RelationColor };
    const suite = apparencesResolues([
      { id: "a", position: 0, ...look },
      { id: "b", position: 1 },
    ]);
    expect(suite[0]).toMatchObject(look);
    expect(suite[1].icon).not.toBe("lune");
    expect(suite[1].color).not.toBe("lilas");
    expect(suite[1]).toMatchObject(apparenceParDefaut([look]));
  });

  it("suit l'ordre des colonnes, pas l'ordre du tableau reçu", () => {
    const suite = apparencesResolues([
      { id: "b", position: 1 },
      { id: "a", position: 0 },
    ]);
    expect(suite.find((r) => r.id === "a")?.icon).toBe("coeur");
    expect(suite.find((r) => r.id === "b")?.icon).toBe("etoile");
  });

  it("n'utilise aucun bleu foncé", () => {
    for (const hex of Object.values(COULEUR_RELATION)) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const bleuFonce = b > r + 40 && b > g + 20 && r < 80 && g < 100;
      expect(bleuFonce).toBe(false);
    }
    expect(COULEUR_RELATION.ciel).toBe("#3aa0d8");
  });
});

describe("jauge", () => {
  it("colore selon le pourcentage affiché", () => {
    expect(tonJauge(70)).toBe("sauge");
    expect(tonJauge(69.5)).toBe("sauge");
    expect(tonJauge(69.4)).toBe("miel");
    expect(tonJauge(45)).toBe("miel");
    expect(tonJauge(44.5)).toBe("miel");
    expect(tonJauge(44.4)).toBe("corail");
    expect(tonJauge(0)).toBe("corail");
    expect(couleurJauge(72)).toBe(COULEUR_JAUGE.sauge);
    expect(couleurJauge(50)).toBe(COULEUR_JAUGE.miel);
    expect(couleurJauge(30)).toBe(COULEUR_JAUGE.corail);
  });
});

describe("phrases par besoin essentiel", () => {
  it("formule les trois états", () => {
    expect(phraseBesoin("nourri", "Camille", "Mes besoins essentiels sont respectés")).toBe(
      "Avec Camille, ton besoin « Mes besoins essentiels sont respectés » est bien nourri.",
    );
    expect(phraseBesoin("partiel", "Sam", "Je me sens respecté·e et en sécurité émotionnelle")).toBe(
      "Avec Sam, ton besoin « Je me sens respecté·e et en sécurité émotionnelle » l'est en partie, ça vaut une vraie conversation.",
    );
    expect(phraseBesoin("absent", "Lina", "Je me sens respecté·e et en sécurité émotionnelle")).toBe(
      "Avec Lina, ton besoin « Je me sens respecté·e et en sécurité émotionnelle » n'est pas nourri pour l'instant. Regarde ce que ça te coûte.",
    );
    expect(etatBesoinEssentiel(100)).toBe("nourri");
    expect(etatBesoinEssentiel(75)).toBe("partiel");
    expect(etatBesoinEssentiel(1)).toBe("partiel");
    expect(etatBesoinEssentiel(0)).toBe("absent");
  });

  it("ignore les critères négociables et les cases vides", () => {
    const detail = (id: string, label: string, nonNegotiable: boolean, satisfaction: number | null): CriterionResult => ({
      criterion: { id, categoryId: "c", label, importance: "critique", nonNegotiable, direction: "TOWARDS" },
      value: satisfaction === null ? null : "oui",
      satisfaction,
    });
    const lignes = lignesBesoins({
      opportunity: { id: "o", name: "Camille" },
      details: [
        detail("besoins", "Mes besoins essentiels sont respectés", true, 100),
        detail("respect", "Je me sens respecté·e", false, 0),
        detail("valeurs", "Valeurs", true, null),
      ],
    });
    expect(lignes.map((l) => l.phrase)).toEqual([LOVE_RESULTS.needNourri("Camille", "Mes besoins essentiels sont respectés")]);
    expect(lignes.every((l) => l.genre === "besoin")).toBe(true);
  });

  it("formule un risque à éviter à part, et jamais comme un besoin", () => {
    const detail = (
      id: string,
      label: string,
      direction: "TOWARDS" | "AWAY_FROM",
      nonNegotiable: boolean,
      satisfaction: number | null,
    ): CriterionResult => ({
      criterion: { id, categoryId: "c", label, importance: "critique", nonNegotiable, direction },
      value: satisfaction === null ? null : "oui",
      satisfaction,
    });
    const risque = "Une incompatibilité critique existe entre nous";
    const lignes = lignesBesoins({
      opportunity: { id: "o", name: "Camille" },
      details: [
        detail("besoins", "Mes besoins essentiels sont respectés", "TOWARDS", true, 100),
        detail("incompatibilite", risque, "AWAY_FROM", true, 100),
        detail("partiel", risque, "AWAY_FROM", true, 50),
        detail("present", risque, "AWAY_FROM", true, 0),
        detail("friction", "Frictions", "AWAY_FROM", false, 0),
      ],
    });
    expect(lignes.map((l) => l.genre)).toEqual(["besoin", "risque", "risque", "risque"]);
    expect(lignes.map((l) => l.phrase)).toEqual([
      "Avec Camille, ton besoin « Mes besoins essentiels sont respectés » est bien nourri.",
      "Avec Camille, le risque « Une incompatibilité critique existe entre nous » ne se présente pas.",
      "Avec Camille, le risque « Une incompatibilité critique existe entre nous » se présente un peu, ça mérite d'en parler.",
      "Avec Camille, le risque « Une incompatibilité critique existe entre nous » est bien là. Prends le temps de regarder ce qu'il te coûte.",
    ]);
    expect(lignes.some((l) => l.phrase.includes("ton besoin « Une incompatibilité"))).toBe(false);
    expect(etatRisque(100)).toBe("absent");
    expect(etatRisque(40)).toBe("partiel");
    expect(etatRisque(0)).toBe("present");
    expect(phraseRisque("present", "Lina", risque)).toContain("est bien là");
  });

  it("colle la ponctuation au mot qui précède", () => {
    expect(espacesFins("pour l'instant : 56 % d'alignement.")).toBe("pour l'instant\u00a0: 56\u00a0% d'alignement.");
    expect(espacesFins("en amour ? On en parle.")).toBe("en amour\u00a0? On en parle.");
  });
});

describe("stockage dans la même ligne que le nom", () => {
  const ligne = (notes: string, extra: Record<string, unknown> = {}) =>
    mapOpportunity({ id: "1", version_id: "v", name: "Camille", summary: "", url: "", notes, position: 0, ...extra });

  it("relit l'apparence dans les notes et n'affiche pas le marqueur", () => {
    const brut = ecrireApparenceNotes("une note personnelle", { icon: "lune", color: "lilas" });
    const lu = lireApparenceNotes(brut);
    expect(lu.look).toEqual({ icon: "lune", color: "lilas" });
    expect(lu.notes).toBe("une note personnelle");
    expect(lu.notes.includes("lune")).toBe(false);
    const o = ligne(brut);
    expect(o.icon).toBe("lune");
    expect(o.color).toBe("lilas");
    expect(o.notes).toBe("une note personnelle");
  });

  it("laisse intactes les notes du mode pro", () => {
    const note = "Salaire proposé : 3 100 € net, peu de marge.";
    expect(lireApparenceNotes(note)).toEqual({ look: null, notes: note });
    const o = ligne(note);
    expect(o.notes).toBe(note);
    expect(o.icon).toBeUndefined();
    expect(o.color).toBeUndefined();
  });

  it("préfère les colonnes quand elles existent", () => {
    const o = ligne(ecrireApparenceNotes("", { icon: "lune", color: "lilas" }), { icon: "soleil", color: "ciel" });
    expect(o.icon).toBe("soleil");
    expect(o.color).toBe("ciel");
    expect(o.notes).toBe("");
  });

  it("n'affiche jamais le marqueur, même au milieu, en double, à l'export ou en mode pro", () => {
    const visible = "une note personnelle";
    const brut = ecrireApparenceNotes(visible, { icon: "coeur", color: "corail" });
    const doublé = `${brut} suite ${brut}`;
    const auMilieu = `avant ${brut} après`;
    for (const notes of [brut, doublé, auMilieu]) {
      const affiche = mapOpportunity({ id: "1", version_id: "v", name: "Camille", summary: "", url: "", notes, position: 0 }).notes;
      expect(affiche).not.toMatch(/BR1/);
      expect(affiche).not.toContain("\u2060");
      const exportEtPdf = [`Nom : Camille`, `Notes : ${affiche}`, `Résumé : ${notesSansMarqueur(notes)}`].join("\n");
      expect(exportEtPdf).not.toMatch(/BR1|\u2060/);
    }
    expect(lireApparenceNotes(brut).notes).toBe(visible);
    expect(lireApparenceNotes(auMilieu).notes).toBe(`avant ${visible} après`);
    const pro = "Référence interne BR1, sans teinte.";
    expect(notesSansMarqueur(pro)).toBe(pro);
    expect(mapOpportunity({ id: "1", version_id: "v", name: "Poste", summary: pro, url: "", notes: pro, position: 0 }).notes).toBe(pro);
  });

  it("reconnaît une colonne absente", () => {
    expect(colonneAbsente({ code: "PGRST204", message: "Could not find the 'icon' column" })).toBe(true);
    expect(colonneAbsente({ message: "permission denied" })).toBe(false);
    expect(colonneAbsente(null)).toBe(false);
  });

  it("écrit les notes si la colonne icon n'existe pas", async () => {
    const updates: Record<string, unknown>[] = [];
    const db = {
      from: () => ({
        update: (patch: Record<string, unknown>) => ({
          eq: async () => {
            updates.push(patch);
            if ("icon" in patch) {
              return { error: { code: "PGRST204", message: "Could not find the 'icon' column of 'opportunities' in the schema cache" } };
            }
            return { error: null };
          },
        }),
      }),
    };
    const voie = await saveOpportunityAppearance(db as never, { id: "1", notes: "note" }, { icon: "flamme", color: "abricot" });
    expect(voie).toBe("notes");
    expect(updates[0]).toEqual({ icon: "flamme", color: "abricot" });
    expect(lireApparenceNotes(String(updates[1].notes))).toEqual({
      look: { icon: "flamme", color: "abricot" },
      notes: "note",
    });
  });
});
