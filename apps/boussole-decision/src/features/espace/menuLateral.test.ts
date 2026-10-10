import { describe, expect, it } from "vitest";
import { rubriqueActive, versionOuverte } from "./menuLateral";

describe("rubrique active du menu latéral", () => {
  it.each([
    ["/", "profils"],
    ["/profils/abc/", "profils"],
    ["/versions/v1/tableau/", "profils"],
    ["/mon-espace/", "espace"],
    ["/mon-espace/fiche", "espace"],
    ["/commentaires/", "commentaires"],
    ["/coach/u1/", "coach"],
    ["/compte/mot-de-passe", "compte"],
    ["/sauvegarder/", "sauvegarder"],
    ["/ma-cible/", null],
  ])("%s", (chemin, attendu) => {
    expect(rubriqueActive(chemin)).toBe(attendu);
  });
  it("repère la version et son étape", () => {
    expect(versionOuverte("/versions/v1/tableau/")).toEqual({ id: "v1", etape: "tableau" });
    expect(versionOuverte("/versions/v1/criteres/")).toEqual({ id: "v1", etape: "tableau" });
    expect(versionOuverte("/versions/v1/resultats")).toEqual({ id: "v1", etape: "resultats" });
    expect(versionOuverte("/versions/v1/")).toEqual({ id: "v1", etape: null });
    expect(versionOuverte("/profils/p1/")).toBeNull();
  });
});
