"use server";

import { effacerPosition, enregistrerPosition } from "@/data/parcours";
import { contenuParcours } from "@/domain/parcours/contenu";
import { lireProfil } from "@/domain/parcours/profil";
import { positionAvant, suivreParcours } from "@/features/progression/serveur";
import { supabaseServer } from "@/lib/supabase/server";

/** absente : la table n'existe pas encore, on reste sur le navigateur sans rien afficher. */
export type IssueEnregistrement = "ok" | "absente" | "non_connecte" | "invalide" | "erreur";

const TAILLE_MAX = 20_000;

/** invite : session d'essai ; sa progression reste dans le navigateur jusqu'à ce qu'il garde son travail dans un compte. */
async function utilisateur() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return { supabase, userId: typeof userId === "string" ? userId : null, invite: Boolean(data?.claims?.is_anonymous) };
}

/** Enregistre la position dans le compte. Tout est revalidé ici : on ne fait jamais confiance au navigateur. */
export async function enregistrerPositionAction(json: string): Promise<IssueEnregistrement> {
  if (typeof json !== "string" || json.length > TAILLE_MAX) return "invalide";
  let brut: unknown;
  try {
    brut = JSON.parse(json);
  } catch {
    return "invalide";
  }
  const data = contenuParcours();
  const profil = lireProfil(brut, data);
  if (!profil) return "invalide";
  const { supabase, userId, invite } = await utilisateur();
  if (!userId) return "non_connecte";
  try {
    // La position d'avant donne l'écart de points pour la progression (le jeu et « Où j'en suis ? » ensemble).
    const avant = invite ? undefined : await positionAvant(supabase, userId, data);
    const issue = await enregistrerPosition(supabase, userId, profil);
    if (issue === "ok" && avant !== undefined) await suivreParcours(supabase, userId, data, avant, profil, new Date(), true);
    return issue;
  } catch {
    return "erreur";
  }
}

export async function effacerPositionAction(): Promise<IssueEnregistrement> {
  const { supabase, userId, invite } = await utilisateur();
  if (!userId) return "non_connecte";
  try {
    const data = contenuParcours();
    const avant = invite ? undefined : await positionAvant(supabase, userId, data);
    await effacerPosition(supabase, userId);
    if (avant) await suivreParcours(supabase, userId, data, avant, null, new Date(), false);
    return "ok";
  } catch {
    return "erreur";
  }
}
