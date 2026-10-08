import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
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
});
