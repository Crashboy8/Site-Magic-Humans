// Fiches préparées par Pierre (table fiches_preparees, une par code pour une seule personne).
// Lues et écrites depuis la page coach/codes, avec la session du coach : la base n'ouvre la table qu'au coach du code.
// La copie dans l'espace de la personne se fait en base, après son accord (recevoir_fiche_preparee).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FicheTalent, MethodeFiche } from "@/domain/fiche/types";

export interface FichePrepareeResume {
  titre: string;
  majLe: string;
  /** Date de la copie dans l'espace de la personne, null tant qu'elle attend son accord. */
  copieeLe: string | null;
}

/** Résumé par code. null : table absente (SQL pas encore collé). */
export async function listFichesPreparees(db: SupabaseClient): Promise<Record<string, FichePrepareeResume> | null> {
  const { data, error } = await db.from("fiches_preparees").select("code, titre:fiche->>titre, updated_at, copiee_at");
  if (error) return null;
  const parCode: Record<string, FichePrepareeResume> = {};
  for (const r of (data ?? []) as Record<string, unknown>[]) {
    parCode[String(r.code)] = {
      titre: typeof r.titre === "string" ? r.titre : "",
      majLe: String(r.updated_at ?? ""),
      copieeLe: typeof r.copiee_at === "string" ? r.copiee_at : null,
    };
  }
  return parCode;
}

/** Dépose (ou remplace) la fiche d'un code. Une fiche déjà copiée chez la personne n'y est pas remplacée. */
export async function deposerFichePreparee(db: SupabaseClient, input: { code: string; coachId: string; fiche: FicheTalent; methode: MethodeFiche }): Promise<void> {
  const { error } = await db
    .from("fiches_preparees")
    .upsert({ code: input.code, coach_id: input.coachId, fiche: input.fiche, methode: input.methode }, { onConflict: "code" });
  if (error) throw new Error(error.message);
}

export async function retirerFichePreparee(db: SupabaseClient, code: string): Promise<void> {
  const { error } = await db.from("fiches_preparees").delete().eq("code", code);
  if (error) throw new Error(error.message);
}
