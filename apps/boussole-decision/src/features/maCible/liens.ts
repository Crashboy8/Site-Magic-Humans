// Liens sortants de Ma Cible (§12.4). Fonctions pures.

/** Lien Calendly du site (même convention que la Carte). Une seule source : ne jamais écrire cette adresse ailleurs. */
export const APPEL_DECOUVERTE = "https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=ma-cible&utm_campaign=ma-cible";

export type ContenuAppel = "accueil" | "esquisse" | "resultat" | "quota" | "resultat-apres-cible" | "resultat-sommaire" | "resultat-fin";

export const urlAppel = (contenu: ContenuAppel): string => `${APPEL_DECOUVERTE}&utm_content=${contenu}`;
export const urlBoussole = (): string => "/boussole-decision/";
export const URL_QCM = "/quiz/";
export const URL_OUTILS = "/outils/";

const PRENOM_MAX = 40;

const JETON_PRENOM = /\{\{\s*pr[eé]nom\s*\}\}|\{(?!\{)\s*pr[eé]nom\s*\}/gi;

/** Remplace `{{prenom}}` par le prénom. Sans prénom : supprime `{{prenom}}` et la ligne vide qui le précède. `[Prénom]` reste tel quel. */
export function remplacerPrenom(texte: string, prenom: string): string {
  const normalise = texte.replace(JETON_PRENOM, "{{prenom}}");
  const p = prenom.replace(/\s+/g, " ").trim().slice(0, PRENOM_MAX);
  if (p) return normalise.split("{{prenom}}").join(p);
  return normalise.replace(/\n[ \t]*\n[ \t]*\{\{prenom\}\}/g, "").replace(/\{\{prenom\}\}/g, "").replace(/\s+$/, "");
}
