import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { CIBLE_PISTE_EXEMPLE, PORTRAIT_EXEMPLE } from "@/domain/maCible/exempleApprofondir";
import type { SyntheseTerrain } from "@/domain/maCible/types";
import { classerCibles } from "@/domain/maCible/scores";
import { exporterResultat, nomFichierExport } from "./export";

describe("export du résultat", () => {
  const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
  const { texte, markdown } = exporterResultat(resultat, "Camille");

  it("contient les cibles, l'offre et les actions, sans jeton ni HTML", () => {
    for (const cible of resultat.cibles) {
      expect(texte).toContain(cible.nom);
      expect(markdown).toContain(cible.nom);
    }
    expect(texte).toContain(resultat.offre.phrase);
    expect(markdown).toContain(resultat.offre.phrase);
    for (const semaine of resultat.plan30) {
      for (const action of semaine.actions) {
        expect(texte).toContain(action.texte);
        expect(markdown).toContain(action.texte);
      }
    }
    expect(texte).not.toContain("{{prenom}}");
    expect(markdown).not.toContain("{{prenom}}");
    expect(texte).toContain("Camille");
    expect(texte).not.toMatch(/<[a-z]/i);
    expect(markdown).not.toMatch(/<[a-z]/i);
    expect(texte).toContain("TON OFFRE");
    expect(markdown.startsWith("# Ton offre")).toBe(true);
  });

  it("nomme le fichier avec le jour de Paris", () => {
    expect(nomFichierExport("2026-10-07T10:00:00.000Z")).toBe("le-cibleur-2026-10-07.md");
  });

  it("écrit la section D'AUTRES PISTES avec le score pressenti", () => {
    const avecPiste = {
      ...RESULTAT_EXEMPLE,
      autresPistes: [
        {
          id: "p1" as const,
          nom: "Militaires en reconversion",
          marche: "b2c" as const,
          enUneLigne: "Ton idée, pas encore étudiée en détail par l'IA.",
          raison: "L'IA ne l'a pas commentée. Creuse-la pour en avoir le cœur net.",
          depuisIdees: ["i1" as const],
          notes: { urgence: 3 as const, paiement: 3 as const, acces: 3 as const, plaisir: 3 as const },
        },
      ],
      classement: classerCibles(RESULTAT_EXEMPLE.cibles),
    };
    const { texte, markdown } = exporterResultat(avecPiste, "Camille");
    expect(texte).toContain("D'AUTRES PISTES");
    expect(texte).toContain("Militaires en reconversion");
    expect(texte).toContain("B2C · 6/10");
    expect(markdown).toContain("D'autres pistes");
  });

  it("exporte portraits et pistes creusées, sans jamais de note brute", () => {
    const synthese: SyntheseTerrain = {
      resume: "Les directeurs parlent surtout de clans et de départs.",
      profils: ["Directeurs de site"],
      douleurs: [{ texte: "Deux clans dans l'équipe", frequence: "souvent" }],
      verbatims: [{ id: "v1", note: "n1", citation: "On ne se parle plus entre les deux ateliers", theme: "douleur" }],
      declencheurs: ["Un départ"],
      objections: ["Le prix"],
      motsCles: ["clans"],
      nbNotes: 1,
      faitLe: "2026-10-10T10:00:00Z",
    };
    const portrait = structuredClone(PORTRAIT_EXEMPLE);
    portrait.douleurs[0].verbatim = "v1";
    const extras = {
      portraits: { c1: portrait, c4: PORTRAIT_EXEMPLE },
      pistes: { p2: { cible: CIBLE_PISTE_EXEMPLE, ligne: { id: "c4" as const, score: 8.5, alertePlaisir: false } } },
    };
    const { texte, markdown } = exporterResultat(resultat, "Camille", { synthese, extras });
    expect(texte).toContain("SON PORTRAIT");
    expect(texte).toContain("Claire, 45 à 55 ans");
    expect(texte).toContain("À chercher : salon agroalimentaire Rennes");
    expect(texte).toContain("Ce qu'un client t'a vraiment dit : « On ne se parle plus entre les deux ateliers »");
    expect(texte).toContain("PISTES CREUSÉES");
    expect(texte).toContain(CIBLE_PISTE_EXEMPLE.nom);
    expect(texte).toContain("CE QUE DISENT TES NOTES");
    expect(markdown).toContain("## Pistes creusées");
    expect(markdown).toContain("### Son portrait");
    // Les notes brutes ne sont jamais dans l'état : l'export ne peut rien en contenir.
    expect(texte).not.toContain("notes_terrain");
    expect(texte).not.toMatch(/[\u2013\u2014]/);
  });
});
