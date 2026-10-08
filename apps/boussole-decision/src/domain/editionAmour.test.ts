import { describe, expect, it } from "vitest";
import { LOVE_PROFILE_MARKER } from "@/content/amour";
import { accueilAmour, lienMesProfils, RETOUR_QUIZ_AMOUR, tableauDuProfil, uniquementAmour } from "./editionAmour";
import type { Profile, Version } from "./types";

const profil = (id: string, description: string) => ({ id, description }) as Profile;
const version = (id: string, profileId: string, status: string) => ({ id, profileId, status }) as Version;

describe("édition amour", () => {
  it("ouvre le brouillon le plus récent, sinon la dernière version", () => {
    const vs = [version("a", "p", "brouillon"), version("b", "p", "brouillon"), version("c", "p", "finalisee")];
    expect(tableauDuProfil("p", vs)).toBe("/versions/b/tableau/");
    expect(tableauDuProfil("p", [version("c", "p", "finalisee")])).toBe("/versions/c/tableau/");
    expect(tableauDuProfil("x", vs)).toBeNull();
  });

  it("ne vaut que pour une personne qui n'a que des Boussoles Relation", () => {
    expect(uniquementAmour([])).toBe(false);
    expect(uniquementAmour([profil("p", LOVE_PROFILE_MARKER)])).toBe(true);
    expect(uniquementAmour([profil("p", LOVE_PROFILE_MARKER), profil("q", "")])).toBe(false);
  });

  it("renvoie le tableau de la Boussole Relation la plus récente", () => {
    const profiles = [profil("recent", LOVE_PROFILE_MARKER), profil("ancien", LOVE_PROFILE_MARKER)];
    const vs = [version("v1", "ancien", "brouillon"), version("v2", "recent", "brouillon")];
    expect(accueilAmour(profiles, vs)).toBe("/versions/v2/tableau/");
    expect(accueilAmour([profil("pro", ""), ...profiles], vs)).toBeNull();
  });

  it("en mode amour, la page sauvegarder propose « ← Quiz Amour » et Mes profils ouvre le tableau", () => {
    const profiles = [profil("p", LOVE_PROFILE_MARKER)];
    const vs = [version("v", "p", "brouillon")];
    expect(uniquementAmour(profiles)).toBe(true);
    expect(RETOUR_QUIZ_AMOUR).toEqual({ href: "/quiz-amour/", label: "← Quiz Amour" });
    expect(RETOUR_QUIZ_AMOUR.label.includes("—") || RETOUR_QUIZ_AMOUR.label.includes("–")).toBe(false);
    expect(lienMesProfils(profiles, vs)).toBe("/versions/v/tableau/");
    expect(lienMesProfils([profil("pro", "carrière")], vs)).toBe("/");
  });
});
