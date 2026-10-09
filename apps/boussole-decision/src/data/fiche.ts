// Accès à la fiche Talent Unique (table talent_fiches, une ligne par compte).
// Si la migration n'est pas encore passée, Mon espace affiche « bientôt » sans erreur visible.
import type { SupabaseClient } from "@supabase/supabase-js";
import { bornerFiche } from "@/domain/fiche/bornes";
import type { FicheTalent, MethodeFiche, SourceFiche } from "@/domain/fiche/types";

export interface FicheEnregistree {
  fiche: FicheTalent;
  source: SourceFiche;
  methode: MethodeFiche;
  majLe: string;
}

export type LectureFiche = { absente: true } | { absente: false; fiche: FicheEnregistree | null };

/** Table absente : erreur Postgres 42P01 ou PostgREST PGRST205. */
export function tableAbsente(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const message = error.message ?? "";
  return /talent_fiches/.test(message) && /does not exist|schema cache/.test(message);
}

export async function getFiche(db: SupabaseClient, userId: string): Promise<LectureFiche> {
  const { data, error } = await db.from("talent_fiches").select("fiche, source, methode, updated_at").eq("user_id", userId).maybeSingle();
  if (error) {
    if (tableAbsente(error)) return { absente: true };
    throw error;
  }
  if (!data) return { absente: false, fiche: null };
  return {
    absente: false,
    fiche: { fiche: bornerFiche(data.fiche), source: data.source as SourceFiche, methode: data.methode as MethodeFiche, majLe: data.updated_at as string },
  };
}

export async function upsertFiche(db: SupabaseClient, userId: string, fiche: FicheTalent, source: SourceFiche, methode: MethodeFiche): Promise<void> {
  const { error } = await db
    .from("talent_fiches")
    .upsert({ user_id: userId, fiche, source, methode, consentement_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function deleteFiche(db: SupabaseClient, userId: string): Promise<void> {
  const { error } = await db.from("talent_fiches").delete().eq("user_id", userId);
  if (error && !tableAbsente(error)) throw error;
}
