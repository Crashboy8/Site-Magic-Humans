// Réponse de api/intention → message à afficher (formulaire.erreurs du dictionnaire intention).

export const CLES_ERREUR = ["question", "mail", "trop_tot", "jeton", "attendre", "plafond", "indisponible"] as const;
export type CleErreur = (typeof CLES_ERREUR)[number];

export function cleErreur(v: unknown): CleErreur {
  if (v === "invalide") return "question";
  return typeof v === "string" && (CLES_ERREUR as readonly string[]).includes(v) ? (v as CleErreur) : "indisponible";
}
