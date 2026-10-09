// Lien « Trouver mes clients avec Le Cibleur » : le Talent Unique du profil voyage dans l'ancre
// (#b=, même charge que vers la Carte). Module pur, couvert par cibleurLink.test.ts.
// Lien simple, même onglet, chemin complet avec /boussole-decision.

import { carteLinkData, encodeBase64Url } from "./carteLink";
import type { TalentUnique } from "./types";

const CIBLEUR_PATH = "/boussole-decision/ma-cible/";

export function cibleurHref(talent: TalentUnique): string {
  const data = carteLinkData(talent);
  if (!data) return CIBLEUR_PATH;
  return CIBLEUR_PATH + "#b=" + encodeBase64Url(data);
}
