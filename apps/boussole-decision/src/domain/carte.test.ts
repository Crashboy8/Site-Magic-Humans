import { describe, expect, it } from "vitest";
import { carteDemo } from "@/content/carte-demo";
import {
  CARTE_HAUTEUR,
  CARTE_LARGEUR,
  CarteInvalide,
  altitude,
  calculerRelief,
  exportCarte,
  parseCarte,
  placerLieux,
  scoreLieu,
} from "./carte";

const criteres = [
  { id: "a", label: "A", poids: 5 },
  { id: "b", label: "B", poids: 1 },
];

describe("score d'un lieu", () => {
  it("moyenne pondérée par le poids des critères", () => {
    expect(scoreLieu({ scores: { a: 100, b: 40 } }, criteres)).toBe(90);
  });
  it("ignore les critères non évalués ; null si rien n'est évalué", () => {
    expect(scoreLieu({ scores: { a: null, b: 40 } }, criteres)).toBe(40);
    expect(scoreLieu({ scores: {} }, criteres)).toBeNull();
  });
});

describe("import / export", () => {
  it("un export se réimporte à l'identique", () => {
    const demo = carteDemo();
    expect(parseCarte(JSON.parse(exportCarte(demo)))).toEqual(demo);
  });
  it("refuse un fichier qui n'est pas une carte", () => {
    expect(() => parseCarte({ hello: "world" })).toThrow(CarteInvalide);
    expect(() => parseCarte({ schemaVersion: 99, criteres: [], lieux: [] })).toThrow(/version/);
  });
  it("borne les valeurs et ignore ce qui est invalide", () => {
    const carte = parseCarte({
      schemaVersion: 1,
      nom: "",
      criteres: [{ id: "a", label: "A", poids: 12 }, { id: "a", label: "doublon", poids: 1 }, { label: "sans id" }],
      lieux: [
        { id: "x", nom: "X", scores: { a: 140, zzz: 5 }, statut: "inconnu", position: { x: -50, y: 9999 } },
        { id: "y", nom: "", scores: {} },
      ],
    });
    expect(carte.nom).toBe("Ma carte du talent");
    expect(carte.criteres).toEqual([{ id: "a", label: "A", poids: 5 }]);
    expect(carte.lieux).toEqual([
      { id: "x", nom: "X", notes: "", scores: { a: 100 }, statut: "a_explorer", position: { x: 0, y: CARTE_HAUTEUR } },
    ]);
  });
});

describe("placement", () => {
  const demo = carteDemo();
  const positions = placerLieux(demo);
  const distanceAuCentre = (id: string) => {
    const p = positions.get(id)!;
    return Math.hypot((p.x - CARTE_LARGEUR / 2) / CARTE_LARGEUR, (p.y - CARTE_HAUTEUR / 2) / CARTE_HAUTEUR);
  };

  it("place tous les lieux sur la carte, sans chevauchement", () => {
    expect(positions.size).toBe(demo.lieux.length);
    const pts = [...positions.values()];
    for (const p of pts) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(CARTE_LARGEUR);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(CARTE_HAUTEUR);
    }
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)).toBeGreaterThan(80);
  });
  it("les meilleurs lieux sont au cœur du territoire, les moins alignés au bord", () => {
    expect(distanceAuCentre("seminaires")).toBeLessThan(distanceAuCentre("video"));
    expect(distanceAuCentre("coach")).toBeLessThan(distanceAuCentre("digital"));
  });
  it("est déterministe et respecte une position enregistrée", () => {
    expect(placerLieux(demo)).toEqual(positions);
    const fixe = { ...demo, lieux: demo.lieux.map((l) => (l.id === "video" ? { ...l, position: { x: 100, y: 100 } } : l)) };
    expect(placerLieux(fixe).get("video")).toEqual({ x: 100, y: 100 });
  });
});

describe("relief", () => {
  it("les meilleurs lieux sont des sommets, les moins alignés restent bas", () => {
    const demo = carteDemo();
    const positions = placerLieux(demo);
    const relief = calculerRelief(demo, positions);
    const h = (id: string) => altitude(relief, positions.get(id)!.x, positions.get(id)!.y);
    expect(h("seminaires")).toBeGreaterThan(h("video") + 0.3);
    expect(h("video")).toBeGreaterThan(0.1); // même un lieu faible reste une île
    expect(altitude(relief, 0, 0)).toBeLessThan(0.1); // les coins sont dans l'eau
  });
});
