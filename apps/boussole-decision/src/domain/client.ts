// Accès client : un compte ouvert ou activé avec un code de Pierre.
// Fonctions pures (testées dans client.test.ts) : code, liens, message à envoyer, page d'arrivée.

import { normalizeInvitationCode } from "./versions";

/** Même règle que la base (invitation_codes.code). */
export const CODE_CLIENT_RE = /^[A-Z0-9-]{6,40}$/;

/** Lien Notion qu'on accepte de garder avec un code (même règle que la base). */
export const LIEN_FICHE_RE = /^https:\/\/([a-z0-9-]+\.)*notion\.(so|site)\//i;

/** Code tapé ou reçu dans un lien : majuscules, sans espaces. Chaîne vide s'il ne ressemble pas à un code. */
export function codeClient(brut: unknown): string {
  if (typeof brut !== "string") return "";
  const code = normalizeInvitationCode(brut.slice(0, 60));
  return CODE_CLIENT_RE.test(code) ? code : "";
}

/** Prénom gardé pour l'accueil : 60 caractères au plus, lettres, espaces, tirets et apostrophes. */
export function prenomPropre(brut: unknown): string {
  if (typeof brut !== "string") return "";
  return brut
    .replace(/[^\p{L}\p{M} '’-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

/**
 * Page ouverte par le lien reçu par mail : elle active le code puis mène à l'import de la fiche.
 * Reste sous /mon-espace (accepté par suiteSure) et sous 200 caractères.
 */
export function suiteActivation(code: string, prenom = ""): string {
  const construire = (avecPrenom: boolean) => {
    const params = new URLSearchParams();
    if (code) params.set("code", code);
    const p = avecPrenom ? prenomPropre(prenom) : "";
    if (p) params.set("prenom", p);
    const q = params.toString();
    return `/mon-espace/activer/${q ? `?${q}` : ""}`;
  };
  const complete = construire(true);
  // Le prénom n'est qu'un plus (il est aussi gardé à la création du compte) : trop long, on s'en passe.
  return complete.length <= 200 ? complete : construire(false);
}

/**
 * Lien à envoyer au client. Sur le site en production : le lien court magichumans.com/client/CODE
 * (redirigé par vercel.json). Ailleurs (préversion, poste local) : l'adresse complète de la page.
 */
export function lienClient(code: string, siteUrl: string | undefined): string {
  const base = (siteUrl || "").replace(/\/$/, "");
  const c = encodeURIComponent(code);
  if (/^https:\/\/(www\.)?magichumans\.com$/.test(base)) return `https://www.magichumans.com/client/${c}/`;
  return `${base || "http://localhost:3000"}/boussole-decision/client/?code=${c}`;
}

/**
 * Lien reçu par mail mais refusé (expiré, ou ouvert sur un autre appareil que celui de la demande).
 * Accès client : retour sur la page du code pour redemander un lien. Sinon : la connexion, comme avant.
 */
export function pageLienEchoue(suite: string): string {
  if (!suite.startsWith("/mon-espace/activer/")) return "/connexion/?erreur=lien";
  const code = codeClient(new URLSearchParams(suite.split("?")[1] ?? "").get("code"));
  return `/client/?lien=expire${code ? `&code=${encodeURIComponent(code)}` : ""}`;
}

/** Réponse de la fonction activer_code_client (voir patches/v3/acces-client.sql). */
export type StatutActivation = "ok" | "deja" | "invalide" | "invite" | "non_connecte" | "indisponible";

export function statutActivation(data: unknown, erreur: boolean): StatutActivation {
  if (erreur) return "indisponible";
  return data === "ok" || data === "deja" || data === "invalide" || data === "invite" || data === "non_connecte" ? data : "indisponible";
}

/**
 * Où aller une fois le code activé :
 * - code refusé et compte pas client : Mon espace, avec un message ;
 * - fiche déjà déposée (ou dépôt pas encore en place) : Mon espace ;
 * - sinon : directement l'écran d'import de la fiche.
 */
export function pageApresActivation(statut: StatutActivation, estClient: boolean, fiche: "presente" | "absente" | "indisponible"): string {
  if (statut === "invalide" && !estClient) return "/mon-espace/?client=code";
  if (fiche !== "absente") return "/mon-espace/?client=bienvenue";
  return "/mon-espace/importer/?accueil=client";
}

/** Textes du message que Pierre envoie à son client (voir i18n/messages/client.ts). */
export interface TextesMessage {
  bonjour: (prenom: string) => string;
  corps: (lien: string, code: string) => string;
}

export function messageClient(T: TextesMessage, prenom: string, lien: string, code: string): string {
  return `${T.bonjour(prenom.trim())}\n\n${T.corps(lien, code)}`;
}
