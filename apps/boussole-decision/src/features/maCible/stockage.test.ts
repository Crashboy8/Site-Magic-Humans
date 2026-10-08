import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { classerCibles } from "@/domain/maCible/scores";
import { ecrire, effacer, deserialiser, lire, serialiser } from "./stockage";
import { etatInitial, type Etat } from "./etat";

const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
const etatComplet = (): Etat => ({
  ...etatInitial(),
  etape: "resultat",
  prenom: "Camille",
  resultat,
  resultatLe: "2026-10-07T10:00:00.000Z",
  coches: Array.from({ length: 12 }, (_, i) => i < 3),
});

describe("stockage local", () => {
  it("fait l'aller-retour serialiser / deserialiser et garde le prénom", () => {
    const e = etatComplet();
    const lu = deserialiser(serialiser(e));
    expect(lu).not.toBeNull();
    expect(lu?.prenom).toBe("Camille");
    expect(lu?.coches).toEqual(e.coches);
    expect(lu?.resultat?.classement.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
    expect(lu?.resultatLe).toBe(e.resultatLe);
  });
  it("renvoie null pour un JSON invalide, une version inconnue ou rien", () => {
    expect(deserialiser(null)).toBeNull();
    expect(deserialiser("{pas du json")).toBeNull();
    expect(deserialiser(JSON.stringify({ ...etatInitial(), v: 2 }))).toBeNull();
  });
  it("renvoie null si coches n'a pas 12 cases", () => {
    expect(deserialiser(JSON.stringify({ ...etatInitial(), coches: [true] }))).toBeNull();
    expect(deserialiser(JSON.stringify({ ...etatInitial(), coches: Array(12).fill("oui") }))).toBeNull();
  });
  it("renvoie null pour un état incohérent (résultat attendu mais absent, résultat abîmé)", () => {
    expect(deserialiser(JSON.stringify({ ...etatInitial(), etape: "resultat" }))).toBeNull();
    expect(deserialiser(JSON.stringify({ ...etatInitial(), etape: "esquisse" }))).toBeNull();
    expect(deserialiser(JSON.stringify({ ...etatInitial(), resultat: { cibles: [] } }))).toBeNull();
  });
  it("relit un état ancien sans les champs de navigation", () => {
    const brut = JSON.parse(serialiser(etatComplet())) as Record<string, unknown>;
    delete brut.plusLoin;
    delete brut.resultatPerime;
    delete brut.entreeDuResultat;
    const lu = deserialiser(JSON.stringify(brut));
    expect(lu?.plusLoin).toBe("resultat");
    expect(lu?.resultatPerime).toBe(false);
    expect(lu?.entreeDuResultat).toBeNull();
    expect(lu?.resultat?.cibles).toHaveLength(3);
  });
  it("relit un état V2a avec des idées vides, une synthèse nulle et des extras vides", () => {
    const brut = JSON.parse(serialiser(etatComplet())) as { entree: { terrain: Record<string, unknown>; synthese?: unknown }; extras?: unknown };
    delete brut.entree.terrain.ciblesEnTete;
    delete brut.entree.synthese;
    delete brut.extras;
    const lu = deserialiser(JSON.stringify(brut));
    expect(lu?.entree.terrain.ciblesEnTete).toEqual([]);
    expect(lu?.entree.synthese).toBeNull();
    expect(lu?.extras).toEqual({ portraits: {}, pistes: {} });
  });
  it("ne lève aucune erreur sans window", () => {
    expect(typeof window).toBe("undefined");
    expect(lire()).toBeNull();
    expect(() => ecrire(etatInitial())).not.toThrow();
    expect(() => effacer()).not.toThrow();
  });
});
