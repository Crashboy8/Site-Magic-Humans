import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

// Accès VIP, accord pour la fiche et demandes de groupe M3, côté serveur.
// Tant que le SQL (20261017000000_vip_consentement.sql) n'est pas collé, tout répond « non » sans erreur visible.

/** Cookie posé quand la personne continue sans cocher la case : la carte d'accord ne revient pas à chaque visite. */
export const COOKIE_ACCORD = "mh_accord_fiche";

/** Vrai si le compte connecté a un accès VIP en cours (est_vip). */
export async function estVip(db: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await db.rpc("est_vip");
    return !error && data === true;
  } catch {
    return false;
  }
}

/** Date de sa demande pour rejoindre un groupe M3, ou null. */
export async function maDemandeM3(db: SupabaseClient, userId: string): Promise<string | null> {
  try {
    const { data, error } = await db.from("demandes_groupe_m3").select("created_at").eq("user_id", userId).maybeSingle();
    return !error && data && typeof data.created_at === "string" ? data.created_at : null;
  } catch {
    return null;
  }
}

export interface DemandeM3 {
  userId: string;
  prenom: string;
  email: string;
  niveau: string | null;
  le: string;
}

/** Les demandes reçues par le coach connecté, les plus récentes d'abord. */
export async function demandesM3Coach(db: SupabaseClient): Promise<DemandeM3[]> {
  try {
    const { data, error } = await db.rpc("demandes_groupe_m3_coach");
    if (error || !Array.isArray(data)) return [];
    return (data as Record<string, unknown>[]).map((r) => ({
      userId: String(r.user_id ?? ""),
      prenom: String(r.first_name ?? ""),
      email: String(r.email ?? ""),
      niveau: typeof r.niveau === "string" ? r.niveau : null,
      le: String(r.demande_le ?? ""),
    }));
  } catch {
    return [];
  }
}
