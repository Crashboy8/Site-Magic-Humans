// La progression du compte côté serveur : le jeu, « Où j'en suis ? » et le bloc « Ton aventure » de Mon espace.
// Chaque lecture et chaque écriture passent par les règles de la base (RLS) : la personne ne touche que sa ligne.
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { lirePosition } from "@/data/parcours";
import { lireProgression, modifierProgression } from "@/data/progression";
import { contenuParcours } from "@/domain/parcours/contenu";
import type { Profil } from "@/domain/parcours/profil";
import { resumeParcours } from "@/domain/parcours/resume";
import type { ParcoursPublic } from "@/domain/parcours/types";
import {
  apresParcours,
  progressionDepart,
  recevoirJeu,
  vueProgression,
  type EnvoiJeu,
  type Progression,
  type ResumeParcours,
  type VueProgression,
} from "@/domain/progression";

/** Les points et le niveau de la position gardée dans le compte (rien si la table du parcours n'existe pas). */
async function parcoursDuCompte(db: SupabaseClient, userId: string, data: ParcoursPublic): Promise<ResumeParcours> {
  const lecture = await lirePosition(db, userId, data);
  return lecture.absente ? { points: 0, niveau: null } : resumeParcours(data, lecture.profil);
}

const pareil = (a: Progression, b: Progression) => JSON.stringify(a) === JSON.stringify(b);

/** Ce que voit le bloc « Ton aventure » : la ligne du compte, ou, sans ligne, ce que donnent déjà les points de « Où j'en suis ? ». */
export async function progressionDuCompte(db: SupabaseClient, userId: string, maintenant: Date): Promise<VueProgression | "absente"> {
  const lecture = await lireProgression(db, userId);
  if (lecture.absente) return "absente";
  const p = lecture.progression ?? progressionDepart(await parcoursDuCompte(db, userId, contenuParcours()));
  return vueProgression(p, maintenant);
}

/** Le jeu envoie ses points (ou Mon espace, avec ce que le jeu a laissé dans le navigateur avant la première connexion). */
export async function recevoirDuJeu(db: SupabaseClient, userId: string, envoi: EnvoiJeu, maintenant: Date): Promise<VueProgression | "absente"> {
  const parcours = await parcoursDuCompte(db, userId, contenuParcours());
  const resultat = await modifierProgression(
    db,
    userId,
    (actuelle) => {
      const avant = actuelle ?? progressionDepart(parcours);
      const valeur = recevoirJeu(avant, envoi, parcours);
      return { valeur, ecrire: !pareil(avant, valeur) };
    },
    maintenant,
  );
  return resultat.absente ? "absente" : vueProgression(resultat.valeur, maintenant);
}

/** La position avant l'enregistrement, pour connaître l'écart de points ; undefined si elle est illisible. */
export async function positionAvant(db: SupabaseClient, userId: string, data: ParcoursPublic): Promise<Profil | null | undefined> {
  try {
    const lecture = await lirePosition(db, userId, data);
    return lecture.absente ? undefined : lecture.profil;
  } catch {
    return undefined;
  }
}

/**
 * « Où j'en suis ? » vient d'être enregistré (actif) ou effacé : l'XP suit l'écart de points, le niveau suit la position.
 * Ne lève jamais d'erreur : la position est déjà gardée, la progression suivra au prochain enregistrement.
 */
export async function suivreParcours(
  db: SupabaseClient,
  userId: string,
  data: ParcoursPublic,
  avant: Profil | null,
  apres: Profil | null,
  maintenant: Date,
  actif: boolean,
): Promise<void> {
  try {
    const pointsAvant = resumeParcours(data, avant);
    const pointsApres = resumeParcours(data, apres);
    await modifierProgression(
      db,
      userId,
      (actuelle) => {
        const valeur = apresParcours(actuelle, pointsAvant, pointsApres, maintenant, actif);
        return { valeur, ecrire: !actuelle || !pareil(actuelle, valeur) };
      },
      maintenant,
    );
  } catch {
    // Rien à afficher : « Où j'en suis ? » marche comme avant.
  }
}
