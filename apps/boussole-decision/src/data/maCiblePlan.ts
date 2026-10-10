// Accès au plan du Cibleur gardé dans le compte (table ma_cible_plan, une ligne par compte, lisible par la personne seule).
// Si la migration n'est pas encore passée, le plan reste dans le navigateur, sans erreur visible.
import type { SupabaseClient } from "@supabase/supabase-js";
import { lirePlan, type PlanEdite } from "@/domain/maCible/planEdite";

/** Table absente : erreur Postgres 42P01 ou PostgREST PGRST205. */
export function tablePlanAbsente(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  return /ma_cible_plan/.test(error.message ?? "") && /does not exist|schema cache/.test(error.message ?? "");
}

export async function lirePlanDuCompte(db: SupabaseClient, userId: string): Promise<PlanEdite | null | "absente"> {
  const { data, error } = await db.from("ma_cible_plan").select("plan").eq("user_id", userId).maybeSingle();
  if (error) {
    if (tablePlanAbsente(error)) return "absente";
    throw error;
  }
  return data ? lirePlan(data.plan) : null;
}

/** Remplace le plan du compte, ou le retire quand `plan` est null (retour à la proposition de l'IA). */
export async function ecrirePlanDuCompte(db: SupabaseClient, userId: string, plan: PlanEdite | null, maintenant: Date): Promise<"ok" | "absente"> {
  const { error } = plan
    ? await db.from("ma_cible_plan").upsert({ user_id: userId, resultat_le: plan.resultatLe, plan, mis_a_jour: maintenant.toISOString() }, { onConflict: "user_id" })
    : await db.from("ma_cible_plan").delete().eq("user_id", userId);
  if (error) {
    if (tablePlanAbsente(error)) return "absente";
    throw error;
  }
  return "ok";
}
