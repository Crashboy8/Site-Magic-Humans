import { describe, expect, it } from "vitest";
import { contenuParcours } from "./contenu";
import { deroule, totalQuetes, vueDeReprise, vuePrecedente, vueSuivante } from "./flux";
import { lireProfil, PROFIL_VIDE, profilCommence, type Profil } from "./profil";

const data = contenuParcours("fr");

describe("lireProfil", () => {
  it("garde un profil valide tel quel", () => {
    const p: Profil = { voie: "E", argent: 2, parallele: true, raccourci: true, freelance: false, reponses: { "connaitre.quiz": "oui", "cap.valeurs": "en_partie" } };
    expect(lireProfil(JSON.parse(JSON.stringify(p)), data)).toEqual(p);
  });

  it("garde « freelance qui cherche un poste » pour la voie E seulement", () => {
    expect(lireProfil({ voie: "E", freelance: true }, data)?.freelance).toBe(true);
    expect(lireProfil({ voie: "E", freelance: "oui" }, data)?.freelance).toBe(false);
    expect(lireProfil({ voie: "D", freelance: true }, data)?.freelance).toBe(false);
    expect(lireProfil({ voie: "A", freelance: true }, data)?.freelance).toBe(false);
    expect(lireProfil({ voie: "E" }, data)?.freelance).toBe(false);
  });

  it("refuse ce qui n'est pas un profil", () => {
    for (const x of [null, undefined, "voie A", 3, [], { voie: "Z" }, { voie: 1 }]) expect(lireProfil(x, data)).toBeNull();
  });

  it("ignore les critères inconnus, les réponses invalides et un autodiagnostic hors de 1 à 5", () => {
    const lu = lireProfil(
      { voie: "A", argent: 9, parallele: "oui", raccourci: "oui", reponses: { "connaitre.quiz": "oui", "pirate.x": "oui", "nommer.phrase": 2, "cap.choix": "peut-être" } },
      data,
    );
    expect(lu).toEqual({ voie: "A", argent: null, parallele: null, raccourci: false, freelance: false, reponses: { "connaitre.quiz": "oui" } });
    expect(lireProfil({ voie: "A", argent: 2.5 }, data)?.argent).toBeNull();
  });

  it("accepte « Je ne sais pas encore » et une voie pas encore choisie", () => {
    expect(lireProfil({ voie: "inconnue" }, data)?.voie).toBe("inconnue");
    expect(lireProfil({ voie: null, reponses: {} }, data)).toEqual(PROFIL_VIDE);
  });

  it("sait si un profil a commencé", () => {
    expect(profilCommence(PROFIL_VIDE)).toBe(false);
    expect(profilCommence({ ...PROFIL_VIDE, voie: "K" })).toBe(true);
  });
});

describe("le déroulé", () => {
  const types = (p: Profil) => deroule(data, p).map((v) => (v.type === "ecran" ? `ecran${v.index}` : v.type));

  it("voies A à E : voie, argent, parallèle, étapes, résultat", () => {
    expect(types({ ...PROFIL_VIDE, voie: "A" })).toEqual(["voie", "argent", "parallele", "ecran0", "resultat"]);
    expect(types({ ...PROFIL_VIDE, voie: "E" })).toEqual(["voie", "argent", "parallele", "ecran0", "resultat"]);
  });

  it("voie K et « Je ne sais pas encore » : ni argent ni parallèle", () => {
    expect(types({ ...PROFIL_VIDE, voie: "K" })).toEqual(["voie", "ecran0", "resultat"]);
    expect(types({ ...PROFIL_VIDE, voie: "inconnue" })).toEqual(["voie", "ecran0", "resultat"]);
  });

  it("reprend à la première question sans réponse", () => {
    expect(vueDeReprise(data, PROFIL_VIDE)).toEqual({ type: "voie" });
    expect(vueDeReprise(data, { ...PROFIL_VIDE, voie: "B" })).toEqual({ type: "argent" });
    expect(vueDeReprise(data, { ...PROFIL_VIDE, voie: "B", argent: 4 })).toEqual({ type: "parallele" });
    expect(vueDeReprise(data, { ...PROFIL_VIDE, voie: "B", argent: 4, parallele: false })).toEqual({ type: "ecran", index: 0 });
    const fini = { ...PROFIL_VIDE, voie: "K" as const, reponses: { "k_connaitre.profils": "pas_encore" as const, "k_connaitre.ressource": "oui" as const, "k_connaitre.besoins": "oui" as const, "k_connaitre.motivation": "oui" as const } };
    expect(vueDeReprise(data, fini)).toEqual({ type: "resultat" });
  });

  it("compte les quêtes d'une voie, raccourci et parallèle compris", () => {
    expect(totalQuetes(data, { ...PROFIL_VIDE, voie: "A" })).toBe(10);
    expect(totalQuetes(data, { ...PROFIL_VIDE, voie: "A", raccourci: true })).toBe(8);
    expect(totalQuetes(data, { ...PROFIL_VIDE, voie: "C", parallele: true })).toBe(15);
    // Voie E : 3 + 6 + 6 + Ikigai, moins les deux écrans partagés (E2 avec S2, E4 avec S3).
    expect(totalQuetes(data, { ...PROFIL_VIDE, voie: "E" })).toBe(14);
    expect(totalQuetes(data, { ...PROFIL_VIDE, voie: "K" })).toBe(5);
    expect(totalQuetes(data, { ...PROFIL_VIDE, voie: "inconnue" })).toBe(3);
  });

  it("avance et recule d'un écran, en tenant compte des réponses données", () => {
    const p: Profil = { ...PROFIL_VIDE, voie: "A", argent: 3, parallele: false };
    expect(vueSuivante(data, p, { type: "voie" })).toEqual({ type: "argent" });
    expect(vueSuivante(data, p, { type: "parallele" })).toEqual({ type: "ecran", index: 0 });
    expect(vuePrecedente(data, p, { type: "ecran", index: 0 })).toEqual({ type: "parallele" });
    expect(vuePrecedente(data, p, { type: "voie" })).toBeNull();
    // Étape 1 non atteinte : après son écran, le résultat.
    const arret = { ...p, reponses: { "connaitre.quiz": "pas_encore", "connaitre.dominante": "oui", "connaitre.flow": "oui", "connaitre.eteint": "oui" } } as Profil;
    expect(vueSuivante(data, arret, { type: "ecran", index: 0 })).toEqual({ type: "resultat" });
    // Un écran qui n'existe plus : on reprend où il faut.
    expect(vueSuivante(data, arret, { type: "ecran", index: 5 })).toEqual({ type: "resultat" });
  });
});
