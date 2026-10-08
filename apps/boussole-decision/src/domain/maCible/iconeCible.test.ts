import { describe, expect, it } from "vitest";
import { iconeCanal, iconeCible, iconeLieu } from "./iconeCible";
import type { Canal } from "./types";

describe("iconeCible", () => {
  it("choisit selon les mots du nom", () => {
    expect(iconeCible("cadres de 40 ans")).toBe("mallette");
    expect(iconeCible("militaires en reconversion")).toBe("medaille");
    expect(iconeCible("une reconversion sans autre indice")).toBe("fleche");
    expect(iconeCible("futurs entrepreneurs")).toBe("fusee");
    expect(iconeCible("anciens fondateurs")).toBe("fusee");
    expect(iconeCible("repreneurs d'entreprise")).toBe("cle");
    expect(iconeCible("seniors concernés par un plan social (PSE)")).toBe("boussole");
    expect(iconeCible("cadres à haut potentiel intellectuel (HPI)")).toBe("ampoule");
    expect(iconeCible("multi-potentiels")).toBe("ampoule");
    expect(iconeCible("athlètes de haut niveau")).toBe("trophee");
    expect(iconeCible("artisans boulangers")).toBe("outil");
    expect(iconeCible("une cible sans mot connu")).toBe("cible");
  });

  it("lit aussi la description", () => {
    expect(iconeCible("Alpha", "des militaires en fin de contrat")).toBe("medaille");
  });
});

describe("iconeLieu", () => {
  it("distingue salon, club, ligne et association", () => {
    expect(iconeLieu("Salons professionnels de l'agroalimentaire")).toBe("chapiteau");
    expect(iconeLieu("Clubs RH et clubs de dirigeants")).toBe("groupe");
    expect(iconeLieu("Groupes en ligne")).toBe("ecran");
    expect(iconeLieu("Réunions des associations régionales")).toBe("poignee");
    expect(iconeLieu("Un café du quartier")).toBe("epingle");
  });
});

describe("iconeCanal", () => {
  it("donne une icône parlante et différente à chaque canal", () => {
    expect(iconeCanal("bouche_a_oreille")).toBe("bulles");
    expect(iconeCanal("linkedin")).toBe("in");
    expect(iconeCanal("evenements")).toBe("badge");
    expect(iconeCanal("email")).toBe("enveloppe");
    expect(iconeCanal("contenu")).toBe("stylo");
    expect(iconeCanal("telephone")).toBe("telephone");
    const canaux: Canal[] = [
      "linkedin",
      "email",
      "instagram",
      "facebook",
      "tiktok",
      "youtube",
      "newsletter",
      "contenu",
      "presentiel",
      "evenements",
      "partenariats",
      "bouche_a_oreille",
      "telephone",
      "autre",
    ];
    const icones = canaux.map((canal) => iconeCanal(canal));
    expect(new Set(icones).size).toBe(icones.length);
  });
});
