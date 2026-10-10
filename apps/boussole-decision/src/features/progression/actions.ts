"use server";

import { lireEnvoi, type VueProgression } from "@/domain/progression";
import { supabaseServer } from "@/lib/supabase/server";
import { progressionDuCompte, recevoirDuJeu } from "./serveur";

const TAILLE_MAX = 2_000;

async function compte() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  // Un essai sans compte garde sa progression dans le navigateur.
  if (typeof userId !== "string" || !userId || data?.claims?.is_anonymous) return null;
  return { supabase, userId };
}

/** La progression du compte, relue après un enregistrement de « Où j'en suis ? ». null : rien à afficher. */
export async function lireProgressionAction(): Promise<VueProgression | null> {
  const c = await compte();
  if (!c) return null;
  try {
    const vue = await progressionDuCompte(c.supabase, c.userId, new Date());
    return vue === "absente" ? null : vue;
  } catch {
    return null;
  }
}

/**
 * Première connexion : Mon espace reprend ce que le jeu a gagné dans ce navigateur (clé talent_game_progression_v1).
 * Les points s'ajoutent à ceux du compte, aucun n'est perdu. Tout est revalidé ici.
 */
export async function reprendreProgressionAction(json: string): Promise<VueProgression | null> {
  if (typeof json !== "string" || json.length > TAILLE_MAX) return null;
  let brut: unknown;
  try {
    brut = JSON.parse(json);
  } catch {
    return null;
  }
  const maintenant = new Date();
  const envoi = lireEnvoi(brut, maintenant);
  if (!envoi || envoi.repartir) return null;
  const c = await compte();
  if (!c) return null;
  try {
    const vue = await recevoirDuJeu(c.supabase, c.userId, envoi, maintenant);
    return vue === "absente" ? null : vue;
  } catch {
    return null;
  }
}
