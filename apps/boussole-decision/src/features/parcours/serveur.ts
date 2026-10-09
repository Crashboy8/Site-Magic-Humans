// « Où j'en suis ? » côté serveur : ce que l'on sait du compte avant d'afficher l'outil.
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getFiche } from "@/data/fiche";
import { lirePosition } from "@/data/parcours";
import type { Profil } from "@/domain/parcours/profil";
import type { ParcoursPublic } from "@/domain/parcours/types";
import type { AppUser } from "@/domain/types";
import { supabaseServer } from "@/lib/supabase/server";
import type { Compte } from "./OuJenSuis";

export interface EtatDuCompte {
  initial: Profil | null;
  /** Date de la dernière modification dans le compte. */
  majCompte: string | null;
  compte: Compte;
  ficheDeposee: boolean;
}

async function ficheDuCompte(db: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const lecture = await getFiche(db, userId);
    return !lecture.absente && lecture.fiche !== null;
  } catch {
    return false;
  }
}

/** Sans compte : rien. Avec un compte : sa position (si la table existe) et sa fiche Talent Unique. Une erreur ne casse jamais la page. */
export async function etatDuCompte(user: AppUser | null, data: ParcoursPublic, ficheConnue?: boolean): Promise<EtatDuCompte> {
  if (!user) return { initial: null, majCompte: null, compte: null, ficheDeposee: false };
  const db = await supabaseServer();
  const ficheDeposee = ficheConnue ?? (await ficheDuCompte(db, user.id));
  try {
    const lecture = await lirePosition(db, user.id, data);
    if (lecture.absente) return { initial: null, majCompte: null, compte: "sans_table", ficheDeposee };
    return { initial: lecture.profil, majCompte: lecture.majLe, compte: "table", ficheDeposee };
  } catch {
    return { initial: null, majCompte: null, compte: "sans_table", ficheDeposee };
  }
}
