// Stockage local de « Où j'en suis ? » : clé ou_j_en_suis_v1, sur l'appareil de la personne.
// Seuls lire, ecrire et effacer touchent à window.localStorage, et ne lèvent jamais d'erreur.
import { lireProfil, type Profil } from "@/domain/parcours/profil";
import type { ParcoursPublic } from "@/domain/parcours/types";

export const CLE_STOCKAGE = "ou_j_en_suis_v1";

export interface Enregistrement {
  profil: Profil;
  /** Date de la dernière modification (ISO). */
  maj: string;
}

export function serialiser(profil: Profil, maj = new Date().toISOString()): string {
  return JSON.stringify({ v: 1, maj, ...profil });
}

/** null si le texte est absent, illisible, d'une autre version ou n'est pas un profil. */
export function deserialiser(brut: string | null, data: ParcoursPublic): Enregistrement | null {
  if (!brut) return null;
  try {
    const o = JSON.parse(brut) as { v?: unknown; maj?: unknown } | null;
    if (!o || o.v !== 1) return null;
    const profil = lireProfil(o, data);
    return profil ? { profil, maj: typeof o.maj === "string" ? o.maj : "" } : null;
  } catch {
    return null;
  }
}

export function lire(data: ParcoursPublic): Enregistrement | null {
  if (typeof window === "undefined") return null;
  try {
    return deserialiser(window.localStorage.getItem(CLE_STOCKAGE), data);
  } catch {
    return null;
  }
}

export function ecrire(profil: Profil): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_STOCKAGE, serialiser(profil));
  } catch {
    // Stockage plein ou refusé (navigation privée) : l'outil marche quand même, sans mémoire.
  }
}

export function effacer(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE_STOCKAGE);
  } catch {
    // Rien à faire.
  }
}
