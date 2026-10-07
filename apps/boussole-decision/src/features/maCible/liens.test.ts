import { describe, expect, it } from "vitest";
import { APPEL_DECOUVERTE, remplacerPrenom, urlAppel, urlBoussole, type ContenuAppel } from "./liens";

describe("urlAppel", () => {
  it.each<ContenuAppel>(["accueil", "esquisse", "resultat", "quota"])("ajoute utm_content=%s au lien Calendly", (contenu) => {
    const url = urlAppel(contenu);
    expect(url.startsWith(APPEL_DECOUVERTE)).toBe(true);
    expect(url).toBe(`https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=ma-cible&utm_campaign=ma-cible&utm_content=${contenu}`);
  });
  it("renvoie la Boussole", () => {
    expect(urlBoussole()).toBe("/boussole-decision/");
  });
});

describe("remplacerPrenom", () => {
  const mail = "Bonjour [Prénom],\n\nBien à vous,\n\n{{prenom}}";
  it("remplace {{prenom}} par le prénom et garde [Prénom]", () => {
    expect(remplacerPrenom(mail, "Camille")).toBe("Bonjour [Prénom],\n\nBien à vous,\n\nCamille");
  });
  it("sans prénom, supprime {{prenom}} et la ligne vide qui le précède", () => {
    expect(remplacerPrenom(mail, "")).toBe("Bonjour [Prénom],\n\nBien à vous,");
    expect(remplacerPrenom(mail, "   ")).toBe("Bonjour [Prénom],\n\nBien à vous,");
  });
  it("borne le prénom à 40 caractères", () => {
    const long = "A".repeat(60);
    expect(remplacerPrenom("{{prenom}}", long)).toBe("A".repeat(40));
  });
  it("remplace toutes les occurrences", () => {
    expect(remplacerPrenom("{{prenom}} et {{prenom}}", "Léa")).toBe("Léa et Léa");
  });
});
