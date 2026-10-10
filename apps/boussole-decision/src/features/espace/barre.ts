// La barre « Mon parcours · Mes outils » : adresses et outil ouvert, sans rien d'affiché (testé à part).
// Le site statique (Quiz, Carte du Talent) a la même barre en JavaScript simple : js/parcours-barre.js. Mêmes adresses.
import type { CleOutil } from "./outils";

/** Où en est la personne : sans compte, en essai (session invitée) ou connectée. */
export type StatutCompte = "visiteur" | "invite" | "connecte";

const BASE = "/boussole-decision";
const SUITE = "?suite=%2Fmon-espace%2F";

/** Le menu qui montre où l'on en est : Mon espace avec un compte, la page publique « Où j'en suis ? » sinon. */
export function lienParcours(statut: StatutCompte): string {
  return statut === "visiteur" ? `${BASE}/ou-j-en-suis/` : `${BASE}/mon-espace/`;
}

/** Garder son travail : créer un compte, sauvegarder l'essai, ou rouvrir Mon espace. Après l'inscription, retour à Mon espace. */
export function lienCompte(statut: StatutCompte): string {
  if (statut === "visiteur") return `${BASE}/inscription/${SUITE}`;
  return statut === "invite" ? `${BASE}/sauvegarder/` : `${BASE}/mon-espace/`;
}

export function lienConnexion(): string {
  return `${BASE}/connexion/${SUITE}`;
}

/** L'outil de l'application ouvert d'après l'adresse (le Quiz et la Carte sont sur le site statique). */
export function outilCourant(pathname: string, search = ""): CleOutil | null {
  const chemin = pathname.startsWith(BASE) ? pathname.slice(BASE.length) || "/" : pathname;
  if (chemin.startsWith("/ma-cible")) return "cibleur";
  if (chemin.startsWith("/importer-quiz") || chemin.startsWith("/exemple")) {
    return new URLSearchParams(search).get("theme") === "amour" ? "relation" : "boussole";
  }
  if (chemin.startsWith("/depuis-cibleur")) return "boussole";
  return null;
}
