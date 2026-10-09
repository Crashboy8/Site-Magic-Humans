import { describe, expect, it } from "vitest";
import { ficheVide } from "@/domain/fiche/bornes";
import { depuisFormulaire, GROUPES, rempli, versFormulaire } from "./champs";

describe("formulaire de fiche", () => {
  it("aller-retour sans perte, listes une idée par ligne", () => {
    const f = { ...ficheVide(), prenom: "Camille", titre: "L'Architecte des Liens", valeurs: ["Liberté", "Justesse"], archetypes: ["sage"], avatars: [{ profil: "DRH", besoins: "du lien", apport: "de la clarté" }] };
    const form = versFormulaire(f);
    expect(form.textes.valeurs).toBe("Liberté\nJustesse");
    form.textes.valeurs = "Liberté\n\n  Justesse \nCourage";
    const g = depuisFormulaire(f, form);
    expect(g.valeurs).toEqual(["Liberté", "Justesse", "Courage"]);
    expect(g.prenom).toBe("Camille");
    expect(g.archetypes).toEqual(["sage"]);
    expect(g.avatars).toEqual([{ profil: "DRH", besoins: "du lien", apport: "de la clarté" }]);
  });

  it("avatars vides retirés, ennéagramme gardé", () => {
    const form = versFormulaire(ficheVide());
    form.enneagramme.base = "Type 2";
    const g = depuisFormulaire(ficheVide(), form);
    expect(g.avatars).toEqual([]);
    expect(rempli(g, "enneagramme")).toBe(true);
    expect(rempli(g, "valeurs")).toBe(false);
  });

  it("chaque champ affiché une seule fois, l'essentiel ouvert", () => {
    const tous = GROUPES.flatMap((g) => g.champs);
    expect(new Set(tous).size).toBe(tous.length);
    expect(GROUPES[0]).toMatchObject({ cle: "essentiel", ouvert: true });
    expect(GROUPES[2].ouvert).toBe(false);
  });
});
