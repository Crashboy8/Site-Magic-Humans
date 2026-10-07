// Longueurs et nombres maximum de l'entrée (§5.3). Les textes libres tiennent au moins 2 000 caractères.
export const LIMITES = {
  nom: { max: 120 },
  mecanisme: { min: 12, max: 2_000 },
  benefice: { min: 12, max: 2_000 },
  contexte: { min: 12, max: 2_000 },
  antiContexte: { min: 8, max: 2_000 },
  reussite: { max: 2_000 },
  sousTalents: { items: 6, max: 60 },
  aDeleguer: { items: 6, max: 60 },
  pistes: { items: 5, max: 80 },
  offre: { min: 12, max: 2_000 },
  clientsPasses: { min: 12, max: 2_000 },
  experience: { min: 12, max: 2_000 },
  zone: { min: 2, max: 2_000 },
  prixActuel: { max: 2_000 },
  formats: { items: 8 },
  reponses: { items: 6, question: 200, reponse: 2_000 },
  correctionOffre: { min: 10, max: 2_000 },
  commentaire: { min: 3, max: 2_000 },
  idee: { max: 2_000 },
} as const;

/**
 * Corps de requête total, en octets (au-delà : 413).
 * Couvre les textes libres à 2 000 caractères (talent, terrain, réponses, corrections) en UTF-8,
 * plus l'esquisse renvoyée avec le résultat. Reste dans la fenêtre de contexte des modèles.
 */
export const TAILLE_MAX_CORPS = 120_000;
/** Taille maximum d'une ancre de pré-remplissage, en caractères (§12.1). */
export const TAILLE_MAX_ANCRE = 8_000;
