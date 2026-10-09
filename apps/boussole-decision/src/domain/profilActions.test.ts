import { describe, expect, it } from "vitest";
import { LOVE_PROFILE_MARKER } from "@/content/amour";
import { MESSAGES } from "@/i18n/messages";
import { avertissementsSuppression, descriptionModifiable, preparerModification } from "./profilActions";

const pro = { name: "Reconversion 2026", description: "Je quitte mon poste en juin" };
const amour = { name: "Boussole Relation", description: LOVE_PROFILE_MARKER };

describe("modifier un profil depuis Mes profils", () => {
  it("enregistre seulement ce qui a changé, sans espaces autour", () => {
    expect(preparerModification(pro, { name: "  Nouveau poste  ", description: pro.description })).toEqual({
      ok: true,
      patch: { name: "Nouveau poste" },
    });
    expect(preparerModification(pro, { name: pro.name, description: " Autre chose " })).toEqual({
      ok: true,
      patch: { description: "Autre chose" },
    });
    expect(preparerModification(pro, { ...pro })).toEqual({ ok: true, patch: {} });
  });

  it("refuse un nom vide ou trop long", () => {
    expect(preparerModification(pro, { name: "   ", description: "" })).toEqual({ ok: false, erreur: "nomVide" });
    expect(preparerModification(pro, { name: "a".repeat(121), description: "" })).toEqual({ ok: false, erreur: "nomTropLong" });
  });

  it("une Boussole Relation garde sa description, donc son habillage amour", () => {
    expect(descriptionModifiable(amour)).toBe(false);
    expect(descriptionModifiable(pro)).toBe(true);
    expect(preparerModification(amour, { name: "Avec Léo", description: "n'importe quoi" })).toEqual({
      ok: true,
      patch: { name: "Avec Léo" },
    });
  });

  it("la suppression prévient quand le profil est partagé avec le coach", () => {
    expect(avertissementsSuppression({ sharedWithCoach: true })).toEqual({ partage: true });
    expect(avertissementsSuppression({ sharedWithCoach: false })).toEqual({ partage: false });
  });
});

describe("textes des boutons Modifier et Supprimer", () => {
  const cles = [
    "editAction",
    "deleteAction",
    "editTitle",
    "editTitleLove",
    "save",
    "saving",
    "saveFailed",
    "deleteTitle",
    "deleteBody",
    "deleteShared",
    "deleteYes",
    "deleting",
    "deleteFailed",
    "loveNameOnly",
  ] as const;

  it("existent en français, anglais et espagnol, sans tiret long", () => {
    for (const locale of ["fr", "en", "es"] as const) {
      const p = MESSAGES[locale].profile;
      for (const cle of cles) {
        const valeur = p[cle];
        expect(typeof valeur === "string" && valeur.length > 0, `${locale}.${cle}`).toBe(true);
        expect(String(valeur)).not.toMatch(/[\u2013\u2014]/);
      }
      for (const texte of [p.editAria("Test"), p.deleteAria("Test")]) {
        expect(texte).toContain("Test");
        expect(texte).not.toMatch(/[\u2013\u2014]/);
      }
    }
  });

  it("le français reprend la phrase demandée", () => {
    expect(MESSAGES.fr.profile.deleteTitle).toBe("Supprimer ce profil et ses versions ?");
    expect(MESSAGES.fr.profile.deleteBody).toContain("C'est définitif");
  });
});
