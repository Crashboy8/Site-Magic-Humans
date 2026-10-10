// Accès à la progression (table progression, une ligne par compte, lisible par la personne seule).
// Si la migration n'est pas encore passée, le jeu et « Où j'en suis ? » gardent tout dans le navigateur, sans erreur visible.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ligneDeProgression, progressionDeLigne, type Progression } from "@/domain/progression";

const COLONNES = "xp, niveau, badges, serie_jours, mis_a_jour";

export type LectureProgression = { absente: true } | { absente: false; progression: Progression | null };

/** Table absente : erreur Postgres 42P01 ou PostgREST PGRST205. */
export function tableProgressionAbsente(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  const message = error.message ?? "";
  return /progression/.test(message) && /does not exist|schema cache/.test(message);
}

export async function lireProgression(db: SupabaseClient, userId: string): Promise<LectureProgression> {
  const { data, error } = await db.from("progression").select(COLONNES).eq("user_id", userId).maybeSingle();
  if (error) {
    if (tableProgressionAbsente(error)) return { absente: true };
    throw error;
  }
  return { absente: false, progression: data ? progressionDeLigne(data) : null };
}

/** Ce que calcule l'appelant à partir de la ligne actuelle (null sans ligne) : la nouvelle valeur, et s'il faut l'écrire. */
export type Calcul = (actuelle: Progression | null) => { valeur: Progression; ecrire: boolean };

/** Essais avant d'abandonner quand d'autres écritures passent sans cesse entre la lecture et l'écriture. */
export const ESSAIS = 4;

/**
 * Lit, calcule et écrit sans jamais écraser une écriture faite entre-temps (un autre onglet, un autre appareil) :
 * l'écriture ne passe que si la ligne n'a pas bougé depuis la lecture, sinon on relit et on recalcule.
 * Ainsi des points envoyés en même temps par le jeu et par « Où j'en suis ? » s'additionnent.
 */
export async function modifierProgression(
  db: SupabaseClient,
  userId: string,
  calcul: Calcul,
  maintenant: Date,
): Promise<{ absente: true } | { absente: false; valeur: Progression }> {
  for (let essai = 0; essai < ESSAIS; essai += 1) {
    const { data: brut, error } = await db.from("progression").select(COLONNES).eq("user_id", userId).maybeSingle();
    if (error) {
      if (tableProgressionAbsente(error)) return { absente: true };
      throw error;
    }
    const { valeur, ecrire } = calcul(brut ? progressionDeLigne(brut) : null);
    if (!ecrire) return { absente: false, valeur };
    const ligne = ligneDeProgression(valeur, userId, maintenant);
    if (!brut) {
      const { error: erreur } = await db.from("progression").insert(ligne);
      if (!erreur) return { absente: false, valeur };
      if (erreur.code === "23505") continue; // la ligne vient d'être créée ailleurs : on recommence avec elle
      if (tableProgressionAbsente(erreur)) return { absente: true };
      throw erreur;
    }
    const { data: faites, error: erreur } = await db
      .from("progression")
      .update(ligne)
      .eq("user_id", userId)
      .eq("xp", brut.xp)
      .eq("serie_jours", brut.serie_jours)
      .eq("mis_a_jour", brut.mis_a_jour)
      .select("user_id");
    if (erreur) throw erreur;
    if (Array.isArray(faites) && faites.length > 0) return { absente: false, valeur };
  }
  throw new Error("progression : trop d'écritures en même temps");
}
