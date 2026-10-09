import { describe, expect, it } from "vitest";
import { decrireMasques, masquerDonnees } from "./masquage";

describe("masquerDonnees", () => {
  it.each(["06 12 34 56 78", "0612345678", "+33 6 12 34 56 78", "0033 1 23 45 67 89", "01.23.45.67.89", "+33 (0)6 12 34 56 78"])(
    "masque le téléphone %s",
    (numero) => {
      const r = masquerDonnees(`Joindre ${numero} demain.`);
      expect(r.texte).toBe("Joindre [téléphone] demain.");
      expect(r.telephones).toBe(1);
      expect(r.mails).toBe(0);
      expect(r.liens).toBe(0);
    },
  );

  it.each(["2026", "75011", "15 000 €", "3 x 45 minutes"])("laisse %s tel quel", (morceau) => {
    const r = masquerDonnees(`Repère ${morceau} dans la note.`);
    expect(r.texte).toBe(`Repère ${morceau} dans la note.`);
    expect(r.telephones).toBe(0);
    expect(r.mails).toBe(0);
    expect(r.liens).toBe(0);
  });

  it("masque d'abord les liens, puis les adresses mail", () => {
    const r = masquerDonnees("Voir https://exemple.fr/a et www.exemple.fr ou jean.dupont@exemple.fr.");
    expect(r.texte).toBe("Voir [lien] et [lien] ou [adresse mail].");
    expect(r.liens).toBe(2);
    expect(r.mails).toBe(1);
    expect(r.telephones).toBe(0);
  });
});

describe("decrireMasques", () => {
  it("accorde et omet les zéros", () => {
    expect(decrireMasques({ mails: 2, telephones: 1, liens: 1 })).toBe("On a masqué 2 adresses mail, 1 numéro de téléphone et 1 lien.");
    expect(decrireMasques({ mails: 1, telephones: 0, liens: 0 })).toBe("On a masqué 1 adresse mail.");
    expect(decrireMasques({ mails: 0, telephones: 2, liens: 0 })).toBe("On a masqué 2 numéros de téléphone.");
    expect(decrireMasques({ mails: 0, telephones: 0, liens: 0 })).toBeNull();
  });
});
