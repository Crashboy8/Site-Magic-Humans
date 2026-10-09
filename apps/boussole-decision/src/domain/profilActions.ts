// Modifier ou supprimer un profil depuis « Mes profils ».
// Module pur : pas de React, pas de Supabase.
import { isLoveProfile } from "@/content/amour";

/** Longueur maximale d'un nom de profil (contrainte de la base). */
export const NOM_PROFIL_MAX = 120;

export type ResultatModification =
  | { ok: true; patch: { name?: string; description?: string } }
  | { ok: false; erreur: "nomVide" | "nomTropLong" };

/**
 * Une Boussole Relation se reconnaît à sa description : on ne la laisse pas changer,
 * sinon le profil perdrait son habillage amour.
 */
export function descriptionModifiable(profile: { description: string }): boolean {
  return !isLoveProfile(profile);
}

/** Ce qu'il faut enregistrer après la fenêtre « Modifier ». Patch vide si rien n'a changé. */
export function preparerModification(
  profile: { name: string; description: string },
  saisie: { name: string; description: string },
): ResultatModification {
  const name = saisie.name.trim();
  if (!name) return { ok: false, erreur: "nomVide" };
  if (name.length > NOM_PROFIL_MAX) return { ok: false, erreur: "nomTropLong" };
  const patch: { name?: string; description?: string } = {};
  if (name !== profile.name) patch.name = name;
  if (descriptionModifiable(profile)) {
    const description = saisie.description.trim();
    if (description !== profile.description) patch.description = description;
  }
  return { ok: true, patch };
}

/** Ce que la fenêtre de suppression doit signaler en plus. */
export function avertissementsSuppression(profile: { sharedWithCoach: boolean }): { partage: boolean } {
  return { partage: profile.sharedWithCoach };
}
