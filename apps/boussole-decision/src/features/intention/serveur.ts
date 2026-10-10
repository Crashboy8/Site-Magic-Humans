import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { estOutil, type DemandeIntention, type OutilIntention } from "@/domain/intention";
import type { ResultatDepot } from "@/lib/intention/traitement";

// « Demander l'avis de Pierre », côté serveur. Tant que le SQL (20261019000000_intentions.sql) n'est pas collé,
// l'envoi répond « indisponible » et la page coach/intentions est vide, sans erreur visible.

/** Écrit la demande avec la clé secrète : la base applique les deux plafonds (deposer_intention). */
export async function deposerIntention(admin: SupabaseClient, userId: string | null, d: DemandeIntention): Promise<ResultatDepot> {
  const { data, error } = await admin.rpc("deposer_intention", {
    p_user_id: userId,
    p_outil: d.outil,
    p_etape: d.etape,
    p_question: d.question,
    p_mail: userId ? null : d.mail,
    p_accord: d.accord,
  });
  if (error) throw new Error(error.message);
  return data === "ok" || data === "attendre" || data === "plafond" ? data : "invalide";
}

export interface Intention {
  id: string;
  outil: OutilIntention;
  etape: string;
  question: string;
  mail: string;
  accord: boolean;
  userId: string | null;
  prenom: string;
  le: string;
  traiteeLe: string | null;
}

/** Les demandes, les plus récentes d'abord (coach seulement, vérifié par la base), filtrées par outil si demandé. */
export async function intentionsCoach(db: SupabaseClient, outil: OutilIntention | null): Promise<Intention[]> {
  try {
    const { data, error } = await db.rpc("intentions_coach", { p_outil: outil });
    if (error || !Array.isArray(data)) return [];
    return (data as Record<string, unknown>[])
      .filter((r) => estOutil(r.outil))
      .map((r) => ({
        id: String(r.id ?? ""),
        outil: r.outil as OutilIntention,
        etape: String(r.etape ?? ""),
        question: String(r.question ?? ""),
        mail: String(r.mail ?? ""),
        accord: r.accord_reponse_mail === true,
        userId: typeof r.user_id === "string" ? r.user_id : null,
        prenom: String(r.prenom ?? ""),
        le: String(r.created_at ?? ""),
        traiteeLe: typeof r.traitee_le === "string" ? r.traitee_le : null,
      }));
  } catch {
    return [];
  }
}
