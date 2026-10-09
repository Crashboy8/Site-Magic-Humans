import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getFiche } from "@/data/fiche";
import { LIEN_FICHE_RE, codeClient, pageApresActivation, prenomPropre, statutActivation, type StatutActivation } from "@/domain/client";

// Accès client côté serveur. Si le SQL de l'accès client n'est pas encore collé dans Supabase :
// - un nouveau compte ouvert avec un code est quand même client (le code est gardé à l'inscription) ;
// - un compte qui existait déjà ne peut pas encore activer de code (on le mène à son espace, sans erreur) ;
// - pas de lien de fiche prérempli, et le prénom du coach est « Pierre ».

export interface AccesClient {
  code: string;
  coachPrenom: string;
  lienFiche: string | null;
}

const COACH_PAR_DEFAUT = "Pierre";

/** Accès client du compte connecté, ou null s'il n'est pas client. */
export async function lireAccesClient(db: SupabaseClient, codeDuCompte: string | null): Promise<AccesClient | null> {
  const { data, error } = await db.rpc("mon_acces_client");
  const ligne = !error && Array.isArray(data) ? (data[0] as { code?: unknown; coach_prenom?: unknown; lien_fiche?: unknown } | undefined) : undefined;
  if (ligne && typeof ligne.code === "string") {
    const lien = typeof ligne.lien_fiche === "string" && LIEN_FICHE_RE.test(ligne.lien_fiche) ? ligne.lien_fiche : null;
    const coach = typeof ligne.coach_prenom === "string" ? ligne.coach_prenom.trim() : "";
    return { code: ligne.code, coachPrenom: coach || COACH_PAR_DEFAUT, lienFiche: lien };
  }
  if (!error) return null;
  // Fonction absente : on s'appuie sur le code gardé sur le compte.
  return codeDuCompte ? { code: codeDuCompte, coachPrenom: COACH_PAR_DEFAUT, lienFiche: null } : null;
}

/** Active un code sur le compte connecté. */
export async function activerCode(db: SupabaseClient, code: string): Promise<StatutActivation> {
  if (!codeClient(code)) return "invalide";
  const { data, error } = await db.rpc("activer_code_client", { p_code: code });
  return statutActivation(data, Boolean(error));
}

/**
 * Après le lien reçu par mail, ou le bouton « Activer mon accès client » : active le code,
 * complète le prénom s'il manque, et renvoie la page suivante (import de la fiche ou Mon espace).
 */
export async function activerEtOrienter(db: SupabaseClient, userId: string, code: string, prenom: string): Promise<string> {
  const { data: compte } = await db.from("app_users").select("first_name, invitation_code").eq("id", userId).maybeSingle();
  let statut: StatutActivation = "deja";
  if (code && compte?.invitation_code !== code) statut = await activerCode(db, code);
  const p = prenomPropre(prenom);
  if (p && compte && !String(compte.first_name ?? "").trim()) {
    await db.from("app_users").update({ first_name: p }).eq("id", userId);
  }
  const estClient = statut === "ok" || statut === "deja" || Boolean(compte?.invitation_code);
  let fiche: "presente" | "absente" | "indisponible" = "indisponible";
  try {
    const lecture = await getFiche(db, userId);
    fiche = lecture.absente ? "indisponible" : lecture.fiche ? "presente" : "absente";
  } catch {
    fiche = "indisponible";
  }
  // Un compte déjà existant sans le SQL : on ne peut pas activer, on le mène quand même à son espace.
  if (statut === "indisponible" && !estClient) return "/mon-espace/";
  return pageApresActivation(statut, estClient, fiche);
}
