/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "./exemple";
import { SCHEMA_CADRAGE, SCHEMA_RESULTAT } from "./schemas";

const INTERDITS = ["minLength", "maxLength", "minimum", "maximum", "minItems", "maxItems", "pattern"];

function parcourir(s: any, visite: (n: any, chemin: string) => void, chemin = "$") {
  visite(s, chemin);
  if (s?.properties) for (const [k, v] of Object.entries(s.properties)) parcourir(v, visite, `${chemin}.${k}`);
  if (s?.items) parcourir(s.items, visite, `${chemin}[]`);
}

/** Petit vérificateur récursif de la forme d'une valeur par rapport à un schéma. */
function forme(s: any, v: any, chemin = "$"): string[] {
  if (s.enum) return s.enum.includes(v) ? [] : [`${chemin} : valeur hors enum`];
  switch (s.type) {
    case "string":
      return typeof v === "string" ? [] : [`${chemin} : texte attendu`];
    case "integer":
      return Number.isInteger(v) ? [] : [`${chemin} : entier attendu`];
    case "array":
      return Array.isArray(v) ? v.flatMap((x, i) => forme(s.items, x, `${chemin}[${i}]`)) : [`${chemin} : tableau attendu`];
    case "object": {
      if (typeof v !== "object" || v === null) return [`${chemin} : objet attendu`];
      const cles = Object.keys(v).sort().join();
      if (cles !== [...s.required].sort().join()) return [`${chemin} : clés ${cles}`];
      return Object.entries(s.properties).flatMap(([k, sub]) => forme(sub, v[k], `${chemin}.${k}`));
    }
  }
  return [`${chemin} : type inconnu`];
}

describe.each([
  ["SCHEMA_CADRAGE", SCHEMA_CADRAGE],
  ["SCHEMA_RESULTAT", SCHEMA_RESULTAT],
])("%s", (_nom, schema) => {
  it("chaque objet est fermé et exige toutes ses propriétés", () => {
    let objets = 0;
    parcourir(schema, (n, chemin) => {
      if (n.type !== "object") return;
      objets++;
      expect(n.additionalProperties, chemin).toBe(false);
      expect([...n.required].sort(), chemin).toEqual(Object.keys(n.properties).sort());
    });
    expect(objets).toBeGreaterThan(1);
  });

  it("n'utilise aucun mot-clé de borne", () => {
    const json = JSON.stringify(schema);
    for (const mot of INTERDITS) expect(json).not.toContain(`"${mot}"`);
  });
});

describe("forme de RESULTAT_EXEMPLE", () => {
  it("respecte SCHEMA_RESULTAT", () => expect(forme(SCHEMA_RESULTAT, RESULTAT_EXEMPLE)).toEqual([]));
  it("le vérificateur détecte une clé en trop", () => expect(forme(SCHEMA_RESULTAT, { ...RESULTAT_EXEMPLE, en_trop: 1 }).length).toBeGreaterThan(0));
});
