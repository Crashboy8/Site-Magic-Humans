import { getMethodology, type Methodology } from "@/domain/methodology";
import { maCible, type MaCibleMessages } from "@/i18n/messages/maCible";

/**
 * Les textes de Ma Cible sont encore le français dans toutes les langues.
 * Les termes de la méthode suivent, sinon l'anglais affiche « Mechanism » au milieu de phrases françaises.
 * Quand l'interface sera traduite, les termes de la langue choisie reprennent leur place.
 */
export function methodeAlignee(messages: MaCibleMessages, methodeLocale: Methodology): Methodology {
  const encoreEnFrancais = messages.talent.titre === maCible.fr.talent.titre && messages.accueil.commencer === maCible.fr.accueil.commencer;
  return encoreEnFrancais ? getMethodology("fr") : methodeLocale;
}
