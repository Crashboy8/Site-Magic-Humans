import { describe, expect, it } from "vitest";
import { lienCompte, lienConnexion, lienParcours, outilCourant } from "./barre";
import { OUTILS } from "./outils";

describe("la barre « Mon parcours · Mes outils »", () => {
  it("mène au menu qui montre où l'on en est : Mon espace avec un compte ou un essai, la page publique sinon", () => {
    expect(lienParcours("visiteur")).toBe("/boussole-decision/ou-j-en-suis/");
    expect(lienParcours("invite")).toBe("/boussole-decision/mon-espace/");
    expect(lienParcours("connecte")).toBe("/boussole-decision/mon-espace/");
  });

  it("propose de garder son travail selon l'état : créer le compte, sauvegarder l'essai, rouvrir Mon espace", () => {
    expect(lienCompte("visiteur")).toBe("/boussole-decision/inscription/?suite=%2Fmon-espace%2F");
    expect(lienCompte("invite")).toBe("/boussole-decision/sauvegarder/");
    expect(lienCompte("connecte")).toBe("/boussole-decision/mon-espace/");
    expect(lienConnexion()).toBe("/boussole-decision/connexion/?suite=%2Fmon-espace%2F");
  });

  it("reconnaît l'outil de l'application ouvert", () => {
    expect(outilCourant("/ma-cible/")).toBe("cibleur");
    expect(outilCourant("/boussole-decision/ma-cible/", "")).toBe("cibleur");
    expect(outilCourant("/importer-quiz/", "")).toBe("boussole");
    expect(outilCourant("/importer-quiz/", "?theme=amour")).toBe("relation");
    expect(outilCourant("/exemple/", "?theme=amour")).toBe("relation");
    expect(outilCourant("/depuis-cibleur/", "")).toBe("boussole");
    expect(outilCourant("/mon-espace/", "")).toBeNull();
  });

  it("ne propose, pour les outils, que les six de Mon espace", () => {
    expect(OUTILS.map((o) => o.cle).sort()).toEqual(["amour", "boussole", "carte", "cibleur", "qcm", "relation"]);
  });
});
