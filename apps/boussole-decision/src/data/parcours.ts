// Accès à la position « Où j'en suis ? » (table parcours_positions, une ligne par compte).
// Si la migration n'est pas encore passée, l'outil garde les réponses dans le navigateur, sans erreur visible.
import type { SupabaseClient } from "@supabase/supabase-js";
import { lireProfil, type Profil } from "@/domain/parcours/profil";
import type { ParcoursPublic } from "@/domain/parcours/types";

/** majLe : date de la dernière modification dans le compte (ISO), pour garder la version la plus récente. */
export type LecturePosition = { absente: true } | { absente: false; profil: Profil | null; majLe: string | null };

/** Table absente : erreur Postgres 42P01 ou PostgREST PGRST205. */
export function tableParcoursAbsente(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const message = error.message ?? "";
  return /parcours_positions/.test(message) && /does not exist|schema cache/.test(message);
}

export async function lirePosition(db: SupabaseClient, userId: string, data: ParcoursPublic): Promise<LecturePosition> {
  const { data: ligne, error } = await db
    .from("parcours_positions")
    .select("voie, argent, parallele, raccourci, reponses, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    if (tableParcoursAbsente(error)) return { absente: true };
    throw error;
  }
  if (!ligne) return { absente: false, profil: null, majLe: null };
  return { absente: false, profil: lireProfil(ligne, data), majLe: typeof ligne.updated_at === "string" ? ligne.updated_at : null };
}

export async function enregistrerPosition(db: SupabaseClient, userId: string, profil: Profil): Promise<"ok" | "absente"> {
  const { error } = await db.from("parcours_positions").upsert(
    {
      user_id: userId,
      voie: profil.voie,
      argent: profil.argent,
      parallele: profil.parallele,
      raccourci: profil.raccourci,
      reponses: profil.reponses,
    },
    { onConflict: "user_id" },
  );
  if (!error) return "ok";
  if (tableParcoursAbsente(error)) return "absente";
  throw error;
}

export async function effacerPosition(db: SupabaseClient, userId: string): Promise<void> {
  const { error } = await db.from("parcours_positions").delete().eq("user_id", userId);
  if (error && !tableParcoursAbsente(error)) throw error;
}
