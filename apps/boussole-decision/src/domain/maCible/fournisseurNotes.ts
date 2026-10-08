// Nom du fournisseur annoncé au-dessus des notes. Aucune clé, seulement ce nom (§17.2).

export const FOURNISSEURS_NOTES = ["gemini", "mistral", "anthropic", "openai"] as const;
export type FournisseurNotes = (typeof FOURNISSEURS_NOTES)[number];

/** Défaut `anthropic`, comme `creerFournisseur`. Valeur inconnue : `anthropic`. */
export function fournisseurNotesDepuis(valeur: string | undefined): FournisseurNotes {
  const v = (valeur ?? "anthropic").trim().toLowerCase();
  return (FOURNISSEURS_NOTES as readonly string[]).includes(v) ? (v as FournisseurNotes) : "anthropic";
}

export function fournisseurGratuit(nom: FournisseurNotes): boolean {
  return nom === "gemini" || nom === "mistral";
}
