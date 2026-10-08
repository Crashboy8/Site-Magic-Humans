// Garde la Boussole Relation en mode amour quand on navigue dans l'app.
// Module pur : pas de React, pas de Supabase.
import { isLoveProfile } from "@/content/amour";
import type { Profile, Version } from "./types";

/** Le tableau à ouvrir pour un profil : le brouillon le plus récent, sinon la dernière version. */
export function tableauDuProfil(profileId: string, versions: Version[]): string | null {
  const siennes = versions.filter((v) => v.profileId === profileId);
  const current = [...siennes].reverse().find((v) => v.status === "brouillon") ?? siennes.at(-1);
  return current ? `/versions/${current.id}/tableau/` : null;
}

/** Vrai si la personne n'a que des Boussoles Relation (et au moins une). */
export function uniquementAmour(profiles: Pick<Profile, "description">[]): boolean {
  return profiles.length > 0 && profiles.every(isLoveProfile);
}

/**
 * Accueil de l'app pour une personne qui n'a que des Boussoles Relation :
 * le tableau de la plus récente, plutôt que la liste des profils pro. Null sinon.
 */
export function accueilAmour(profiles: Profile[], versions: Version[]): string | null {
  if (!uniquementAmour(profiles)) return null;
  for (const profile of profiles) {
    const href = tableauDuProfil(profile.id, versions);
    if (href) return href;
  }
  return null;
}
