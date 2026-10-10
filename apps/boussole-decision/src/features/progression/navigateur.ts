// Ce que le jeu a gardé dans ce navigateur (clé talent_game_progression_v1, écrite par talent-game/js/progression.js).
// Même origine que le site (www.magichumans.com), donc même stockage. Seuls lireJeu et ecrireJeu touchent à
// window.localStorage, et ne lèvent jamais d'erreur.
import { CLE_JEU, lireEnvoi, type EnregistrementJeu, type EnvoiJeu } from "@/domain/progression";

/** Le texte tel quel (envoyé au serveur, qui le revalide) et sa lecture ; null s'il est absent ou illisible. */
export function lireJeu(): { texte: string; envoi: EnvoiJeu } | null {
  if (typeof window === "undefined") return null;
  try {
    const texte = window.localStorage.getItem(CLE_JEU);
    if (!texte) return null;
    const envoi = lireEnvoi(JSON.parse(texte), new Date());
    return envoi ? { texte, envoi } : null;
  } catch {
    return null;
  }
}

export function ecrireJeu(e: EnregistrementJeu): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_JEU, JSON.stringify(e));
  } catch {
    // Stockage plein ou refusé : rien de plus à faire ici.
  }
}
