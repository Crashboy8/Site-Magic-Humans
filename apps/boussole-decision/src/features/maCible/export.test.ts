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
});
