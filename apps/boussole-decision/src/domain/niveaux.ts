// Niveaux VIP portés par un code de Pierre (invitation_codes.niveau) et durée de l'accès (acces_jusqu_au).
// Fonctions pures, testées dans niveaux.test.ts.
import type { NiveauAcces } from "./types";

export const NIVEAUX: readonly NiveauAcces[] = ["pionnier", "vip12", "membre"];

export function estNiveau(v: unknown): v is NiveauAcces {
  return typeof v === "string" && (NIVEAUX as readonly string[]).includes(v);
}

/** Durée choisie sur la page coach/codes : 1 an, à vie, ou jusqu'à une date précise. */
export type DureeAcces = "1an" | "vie" | "date";

/** Durée proposée d'office : à vie pour un pionnier, 1 an pour vip12 et membre. */
export function dureeParDefaut(niveau: NiveauAcces): DureeAcces {
  return niveau === "pionnier" ? "vie" : "1an";
}

/**
 * Fin de l'accès à enregistrer : null pour « à vie ». Une date précise (AAAA-MM-JJ) compte jusqu'au soir,
 * heure de l'appareil de Pierre, comme la date d'expiration des codes. Refusée si elle est déjà passée.
 */
export function finAcces(duree: DureeAcces, date: string, maintenant: Date): { ok: true; fin: string | null } | { ok: false } {
  if (duree === "vie") return { ok: true, fin: null };
  if (duree === "1an") {
    const fin = new Date(maintenant.getTime());
    fin.setFullYear(fin.getFullYear() + 1);
    return { ok: true, fin: fin.toISOString() };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false };
  const fin = new Date(`${date}T23:59:59`);
  if (Number.isNaN(fin.getTime()) || fin <= maintenant) return { ok: false };
  return { ok: true, fin: fin.toISOString() };
}

/** Même règle que est_vip() en base : un niveau, et un accès sans fin ou pas encore échu. */
export function accesActif(code: { niveau: NiveauAcces | null; accesJusquAu: string | null }, maintenant: Date): boolean {
  if (!code.niveau) return false;
  return code.accesJusquAu === null || new Date(code.accesJusquAu) > maintenant;
}
