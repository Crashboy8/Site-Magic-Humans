import { describe, expect, it } from "vitest";
import { colonneFreelanceAbsente, tableParcoursAbsente } from "@/data/parcours";
import { contenuParcours } from "@/domain/parcours/contenu";
import type { Profil } from "@/domain/parcours/profil";
import { deserialiser, ecrire, effacer, lire, serialiser } from "./stockage";

const data = contenuParcours("fr");
const profil: Profil = { voie: "B", argent: 3, parallele: true, raccourci: false, freelance: false, reponses: { "connaitre.quiz": "oui", "connaitre.flow": "en_partie" } };

describe("stockage local de « Où j'en suis ? »", () => {
  it("fait l'aller-retour serialiser / deserialiser", () => {
    const lu = deserialiser(serialiser(profil, "2026-10-09T10:00:00.000Z"), data);
    expect(lu).toEqual({ profil, maj: "2026-10-09T10:00:00.000Z" });
  });

  it("renvoie null pour rien, un JSON invalide ou une autre version", () => {
    expect(deserialiser(null, data)).toBeNull();
    expect(deserialiser("{pas du json", data)).toBeNull();
    expect(deserialiser(JSON.stringify({ ...profil, v: 2 }), data)).toBeNull();
    expect(deserialiser(JSON.stringify({ v: 1, voie: "Z" }), data)).toBeNull();
  });

  it("ne lève aucune erreur sans navigateur", () => {
    expect(typeof window).toBe("undefined");
    expect(lire(data)).toBeNull();
    expect(() => ecrire(profil)).not.toThrow();
    expect(() => effacer()).not.toThrow();
  });
});

describe("table parcours_positions absente : repli sur le navigateur", () => {
  it("reconnaît les erreurs de table manquante", () => {
    expect(tableParcoursAbsente({ code: "42P01" })).toBe(true);
    expect(tableParcoursAbsente({ code: "PGRST205" })).toBe(true);
    expect(tableParcoursAbsente({ message: 'relation "public.parcours_positions" does not exist' })).toBe(true);
    expect(tableParcoursAbsente({ code: "23505", message: "duplicate key" })).toBe(false);
    expect(tableParcoursAbsente(null)).toBe(false);
  });

  it("reconnaît la colonne freelance manquante (migration pas encore passée)", () => {
    expect(colonneFreelanceAbsente({ code: "42703", message: 'column "freelance" of relation "parcours_positions" does not exist' })).toBe(true);
    expect(colonneFreelanceAbsente({ code: "PGRST204", message: "Could not find the 'freelance' column of 'parcours_positions' in the schema cache" })).toBe(true);
    expect(colonneFreelanceAbsente({ message: "column parcours_positions.freelance does not exist" })).toBe(true);
    expect(colonneFreelanceAbsente({ code: "42703", message: 'column "voie" does not exist' })).toBe(false);
    expect(colonneFreelanceAbsente({ code: "42P01" })).toBe(false);
    expect(colonneFreelanceAbsente(null)).toBe(false);
  });
});
