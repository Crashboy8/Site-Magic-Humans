// Lien « Explorer ma carte du talent » : la Carte du Talent (magichumans.com/carte-du-talent/) se crée
// à partir du Talent Unique du profil. Module pur, couvert par carteLink.test.ts.
//
// Comme pour l'import du quiz, les données voyagent dans l'ancre du lien (#b=…, JSON encodé en
// base64url) : rien ne passe par les journaux du serveur, et la carte n'a pas besoin de compte.
// Les critères ne sont pas transmis : ils servent à comparer des opportunités, pas à dessiner la carte.

import type { TalentUnique } from "./types";

export interface CarteLinkData {
  v: 1;
  mecanisme: string;
  contexte: string;
  benefice: string;
  antiContexte: string;
  success: string;
  failure: string;
}

export function carteLinkData(talent: TalentUnique): CarteLinkData | null {
  const data: CarteLinkData = {
    v: 1,
    mecanisme: talent.mecanisme.trim(),
    contexte: talent.contexteDeclencheur.trim(),
    benefice: talent.superBenefice.trim(),
    antiContexte: talent.antiContexte.trim(),
    success: talent.successSituations.trim(),
    failure: talent.failureSituations.trim(),
  };
  const filled = [data.mecanisme, data.contexte, data.benefice, data.antiContexte, data.success, data.failure].some(Boolean);
  return filled ? data : null;
}

/** JSON → UTF-8 → base64url, sans remplissage (même encodage que le quiz). */
export function encodeBase64Url(data: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Lien vers la carte : avec le Talent Unique dans l'ancre, ou le lien simple si rien n'est rempli. */
export function carteDuTalentHref(baseUrl: string, talent: TalentUnique): string {
  const data = carteLinkData(talent);
  return data ? `${baseUrl}#b=${encodeBase64Url(data)}` : baseUrl;
}
