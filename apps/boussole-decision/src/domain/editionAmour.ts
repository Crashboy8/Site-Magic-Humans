// Garde la Boussole Relation en mode amour quand on navigue dans l'app.
// Module pur : pas de React, pas de Supabase.
import { isLoveProfile } from "@/content/amour";
import type { Profile, Version } from "./types";

/** Le tableau à ouvrir pour un profil : le brouillon le plus récent, sinon la dernière version. */
export function versionDuProfil(profileId: string, versions: Version[]): Version | null {
  const siennes = versions.filter((v) => v.profileId === profileId);
  return [...siennes].reverse().find((v) => v.status === "brouillon") ?? siennes.at(-1) ?? null;
}

export function tableauDuProfil(profileId: string, versions: Version[]): string | null {
  const current = versionDuProfil(profileId, versions);
  return current ? `/versions/${current.id}/tableau/` : null;
}

/**
 * La Boussole Relation à reprendre (profils triés du plus récent au plus ancien), ou null.
 * C'est elle qu'on rouvre au lieu d'en créer une nouvelle à chaque « Commencer ».
 */
export function boussoleRelationExistante(profiles: Profile[], versions: Version[]): Version | null {
  for (const profile of profiles) {
    if (!isLoveProfile(profile)) continue;
    const version = versionDuProfil(profile.id, versions);
    if (version) return version;
  }
  return null;
}

/** Vrai si la personne n'a que des Boussoles Relation (et au moins une). */
export function uniquementAmour(profiles: Pick<Profile, "description">[]): boolean {
  return profiles.length > 0 && profiles.every(isLoveProfile);
}

/**
 * Lien d'en-tête des pages amour, dont /sauvegarder/ : il remplace « ← Accueil ».
 * Le mode pro ne l'affiche pas.
 */
export const RETOUR_QUIZ_AMOUR = { href: "/quiz-amour/", label: "← Quiz Amour" } as const;

/** Adresse du Quiz Amour dans la langue de l'interface : le quiz s'ouvre dans la même langue. */
export function lienQuizAmour(locale: "fr" | "en" | "es"): string {
  return `${RETOUR_QUIZ_AMOUR.href}?lang=${locale}`;
}

/** Le lien d'en-tête, traduit. */
export function retourQuizAmour(locale: "fr" | "en" | "es"): { href: string; label: string } {
  return { href: lienQuizAmour(locale), label: locale === "en" ? "← Love Quiz" : locale === "es" ? "← Test del Amor" : RETOUR_QUIZ_AMOUR.label };
}

/**
 * « Mes profils » en mode amour ouvre le tableau directement.
 * Sinon, la liste des profils (accueil pro, inchangé).
 */
export function lienMesProfils(profiles: Profile[], versions: Version[]): string {
  return accueilAmour(profiles, versions) ?? "/";
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
