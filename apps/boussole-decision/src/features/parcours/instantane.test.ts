import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { contenuParcours } from "@/domain/parcours/contenu";
import { PROFIL_VIDE, type Profil } from "@/domain/parcours/profil";
import type { ParcoursBrut } from "@/domain/parcours/types";
import { CLE_INSTANTANE, instantane, lireInstantane, serialiserInstantane } from "./instantane";

const data = contenuParcours("fr");
const brut = JSON.parse(readFileSync(join(__dirname, "../../domain/parcours/parcours.json"), "utf8")) as ParcoursBrut;
const MAJ = "2026-10-09T10:00:00.000Z";

/** Tous les critères d'une étape à la même réponse. */
function repondre(ids: string[], r: "oui" | "en_partie" | "pas_encore") {
  return Object.fromEntries(ids.flatMap((id) => brut.etapes.find((e) => e.id === id)!.criteres.map((c) => [c.id, r])));
}
const TRONC = ["connaitre", "nommer", "cap"];

describe("l'instantané de « Où j'en suis ? » pour les autres outils", () => {
  it("n'existe pas tant qu'aucune voie n'est choisie", () => {
    expect(instantane(data, PROFIL_VIDE, MAJ)).toBeNull();
  });

  it("donne l'étape à travailler et les points : voie B, tronc commun franchi", () => {
    const profil: Profil = { ...PROFIL_VIDE, voie: "B", argent: 4, parallele: false, reponses: repondre(TRONC, "oui") };
    const i = instantane(data, profil, MAJ);
    expect(i).toMatchObject({ v: 1, maj: MAJ, etape: "S1", fin: false });
    expect(i!.points).toBeGreaterThan(0);
  });

  it("donne les deux étapes de la voie E", () => {
    const profil: Profil = { ...PROFIL_VIDE, voie: "E", argent: 4, parallele: false, reponses: repondre([...TRONC, "e_cible", "s_cible"], "oui") };
    expect(instantane(data, profil, MAJ)?.etape).toBe("E2 + S2");
  });

  it("dit Ton Ikigai quand tout est franchi", () => {
    const tout = brut.voies.find((v) => v.id === "B")!.etapes;
    const profil: Profil = { ...PROFIL_VIDE, voie: "B", argent: 5, parallele: false, reponses: repondre(tout, "oui") };
    expect(instantane(data, profil, MAJ)).toMatchObject({ fin: true, etape: "IK" });
  });

  it("n'a pas d'étape tant que la voie est à choisir (« Je ne sais pas encore », tronc commun franchi)", () => {
    const profil: Profil = { ...PROFIL_VIDE, voie: "inconnue", reponses: repondre(TRONC, "oui") };
    expect(instantane(data, profil, MAJ)).toMatchObject({ etape: "", fin: false });
  });

  it("ne porte aucune réponse ni aucun texte du parcours : seulement l'étape, les points et la date", () => {
    const profil: Profil = { ...PROFIL_VIDE, voie: "A", argent: 2, parallele: true, reponses: repondre(["connaitre"], "pas_encore") };
    const texte = serialiserInstantane(instantane(data, profil, MAJ)!);
    expect(Object.keys(JSON.parse(texte)).sort()).toEqual(["etape", "fin", "maj", "points", "v"]);
    expect(texte).not.toMatch(/connaitre|pas_encore|oui|argent/);
  });

  it("se relit à l'identique, et refuse tout ce qui n'est pas un instantané", () => {
    const profil: Profil = { ...PROFIL_VIDE, voie: "B", argent: 4, parallele: false, reponses: repondre(TRONC, "oui") };
    const i = instantane(data, profil, MAJ)!;
    expect(lireInstantane(serialiserInstantane(i))).toEqual(i);
    for (const mauvais of [null, "", "{pas du json", JSON.stringify({ ...i, v: 2 }), JSON.stringify({ ...i, points: -1 }), JSON.stringify({ ...i, points: 2.5 }), JSON.stringify({ ...i, etape: "<b>" }), JSON.stringify({ ...i, fin: 1 })]) {
      expect(lireInstantane(mauvais), String(mauvais)).toBeNull();
    }
  });
});

describe("le site statique relit l'instantané de l'application", () => {
  const script = readFileSync(join(__dirname, "../../../../../js/parcours-barre.js"), "utf8");
  const bac: { MHParcoursBarre?: { CLE: string; lireInstantane: (brut: string | null) => unknown } } = {};
  vm.runInNewContext(script, bac);
  const barre = bac.MHParcoursBarre!;
  const copie = (v: unknown) => (v === null || v === undefined ? v : JSON.parse(JSON.stringify(v)));

  it("utilise la même clé de stockage", () => {
    expect(barre.CLE).toBe(CLE_INSTANTANE);
  });

  it("accepte tout ce que l'application écrit", () => {
    const profils: Profil[] = [
      { ...PROFIL_VIDE, voie: "B", argent: 4, parallele: false, reponses: repondre(TRONC, "oui") },
      { ...PROFIL_VIDE, voie: "E", argent: 4, parallele: false, reponses: repondre([...TRONC, "e_cible", "s_cible"], "oui") },
      { ...PROFIL_VIDE, voie: "inconnue", reponses: repondre(TRONC, "oui") },
      { ...PROFIL_VIDE, voie: "B", argent: 5, parallele: false, reponses: repondre(brut.voies.find((v) => v.id === "B")!.etapes, "oui") },
    ];
    for (const profil of profils) {
      const i = instantane(data, profil, MAJ)!;
      expect(copie(barre.lireInstantane(serialiserInstantane(i)))).toEqual(i);
    }
  });

  it("refuse ce que l'application refuse", () => {
    for (const mauvais of [null, "", "{pas du json", JSON.stringify({ v: 1, maj: MAJ, etape: "S2", fin: false, points: -3 }), JSON.stringify({ v: 1, maj: MAJ, etape: "S2<script>", fin: false, points: 3 })]) {
      expect(barre.lireInstantane(mauvais as string | null), String(mauvais)).toBeNull();
    }
  });
});
