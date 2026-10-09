// Filtre de « Mes profils » : Tous, Pro, Amour. Module pur : pas de React, pas de Supabase.
import { isLoveProfile } from "@/content/amour";
import type { Profile, Version } from "./types";

export const FILTRES = ["tous", "pro", "amour"] as const;
export type Filtre = (typeof FILTRES)[number];
export type Categorie = Exclude<Filtre, "tous">;

/** Clé du choix mémorisé dans le navigateur. */
export const CLE_FILTRE = "mh_mes_profils_filtre";

export function filtreValide(valeur: unknown): Filtre | null {
  const v = Array.isArray(valeur) ? valeur[0] : valeur;
  return typeof v === "string" && (FILTRES as readonly string[]).includes(v) ? (v as Filtre) : null;
}

export function categorieProfil(profile: Pick<Profile, "description">): Categorie {
  return isLoveProfile(profile) ? "amour" : "pro";
}

/** Dernière modification d'un profil : le profil lui-même ou la plus récente de ses versions. */
export function derniereModification(profile: Pick<Profile, "id" | "updatedAt">, versions: Pick<Version, "profileId" | "updatedAt">[]): string {
  return versions
    .filter((v) => v.profileId === profile.id)
    .reduce((max, v) => (v.updatedAt > max ? v.updatedAt : max), profile.updatedAt ?? "");
}

/** Profils pro puis amour, chacun du plus récemment modifié au plus ancien. */
export function rangerProfils<P extends Pick<Profile, "id" | "description" | "updatedAt">>(
  profiles: P[],
  versions: Pick<Version, "profileId" | "updatedAt">[],
): Record<Categorie, P[]> {
  const tries = [...profiles].sort((a, b) => derniereModification(b, versions).localeCompare(derniereModification(a, versions)));
  return { pro: tries.filter((p) => categorieProfil(p) === "pro"), amour: tries.filter((p) => categorieProfil(p) === "amour") };
}

/** Le filtre n'a de sens que si les deux catégories existent. */
export function filtreUtile(comptes: Record<Categorie, number>): boolean {
  return comptes.pro > 0 && comptes.amour > 0;
}

/**
 * Le filtre affiché : celui de l'adresse, sinon celui mémorisé, sinon « tous ».
 * Une catégorie vide, ou un filtre inutile, retombe sur « tous ».
 */
export function filtreActif(depuisAdresse: Filtre | null, memorise: Filtre | null, comptes: Record<Categorie, number>): Filtre {
  if (!filtreUtile(comptes)) return "tous";
  const choix = depuisAdresse ?? memorise ?? "tous";
  return choix !== "tous" && comptes[choix] === 0 ? "tous" : choix;
}
