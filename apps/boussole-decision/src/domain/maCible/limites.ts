// Longueurs et nombres maximum de l'entrée (§5.3).
export const LIMITES = {
  nom: { max: 120 },
  mecanisme: { min: 12, max: 400 },
  benefice: { min: 12, max: 400 },
  contexte: { min: 12, max: 600 },
  antiContexte: { min: 8, max: 1000 },
  reussite: { max: 1000 },
  sousTalents: { items: 6, max: 60 },
  aDeleguer: { items: 6, max: 60 },
  pistes: { items: 5, max: 80 },
  offre: { min: 12, max: 600 },
  clientsPasses: { min: 12, max: 600 },
  experience: { min: 12, max: 600 },
  zone: { min: 2, max: 120 },
  prixActuel: { max: 120 },
  formats: { items: 8 },
  reponses: { items: 6, question: 200, reponse: 300 },
  correctionOffre: { min: 10, max: 300 },
  commentaire: { min: 3, max: 300 },
  idee: { max: 200 },
} as const;

/** Corps de requête total, en octets (au-delà : 413). */
export const TAILLE_MAX_CORPS = 16_000;
/** Taille maximum d'une ancre de pré-remplissage, en caractères (§12.1). */
export const TAILLE_MAX_ANCRE = 8_000;
