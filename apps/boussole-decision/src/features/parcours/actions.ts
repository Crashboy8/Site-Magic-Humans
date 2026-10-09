"use server";

import { effacerPosition, enregistrerPosition } from "@/data/parcours";
import { contenuParcours } from "@/domain/parcours/contenu";
import { lireProfil } from "@/domain/parcours/profil";
import { supabaseServer } from "@/lib/supabase/server";

/** absente : la table n'existe pas encore, on reste sur le navigateur sans rien afficher. */
export type IssueEnregistrement = "ok" | "absente" | "non_connecte" | "invalide" | "erreur";

const TAILLE_MAX = 20_000;

async function utilisateur() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return { supabase, userId: typeof userId === "string" ? userId : null };
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
  const profil = lireProfil(brut, contenuParcours());
  if (!profil) return "invalide";
  const { supabase, userId } = await utilisateur();
  if (!userId) return "non_connecte";
  try {
    return await enregistrerPosition(supabase, userId, profil);
  } catch {
    return "erreur";
  }
}

export async function effacerPositionAction(): Promise<IssueEnregistrement> {
  const { supabase, userId } = await utilisateur();
  if (!userId) return "non_connecte";
  try {
    await effacerPosition(supabase, userId);
    return "ok";
  } catch {
    return "erreur";
  }
}
