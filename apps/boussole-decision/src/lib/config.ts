export const BASE_PATH = "/boussole-decision";

/** La Carte du Talent (site Magic Humans), ouverte dans un nouvel onglet depuis le profil et les résultats (voir next.config.ts). */
export const CARTE_DU_TALENT_URL = process.env.NEXT_PUBLIC_CARTE_DU_TALENT_URL || "https://www.magichumans.com/carte-du-talent/";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** URL publique absolue d'une page de l'outil (liens envoyés par email). */
export function absoluteUrl(path: string, fallbackOrigin?: string): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || fallbackOrigin || "http://localhost:3000").replace(/\/$/, "");
  return `${origin}${BASE_PATH}${path}`;
}

/** Pages accessibles sans être connecté. */
export const PUBLIC_PATHS = [
  "/bienvenue",
  "/exemple",
  "/importer-quiz",
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/auth/callback",
  "/auth/confirm",
  "/ma-cible",
  "/api/ma-cible",
  "/api/quiz-salle",
  "/api/fiche",
  "/depuis-cibleur",
  "/client",
  "/ou-j-en-suis",
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Page d'arrivée après une connexion (décision n° 4). */
export const ACCUEIL_CONNECTE = "/mon-espace/";

const SUITE_MAX = 200;

/**
 * Retour autorisé après la connexion.
 * Seulement une chaîne qui commence par /mon-espace, /profils/ ou /versions/,
 * sans //, sans \, sans :, et d'au plus 200 caractères.
 */
export function suiteSure(v: unknown): string | null {
  if (typeof v !== "string") return null;
  if (v.length === 0 || v.length > SUITE_MAX) return null;
  if (v.includes("//") || v.includes("\\") || v.includes(":")) return null;
  if (v.startsWith("/mon-espace") || v.startsWith("/profils/") || v.startsWith("/versions/")) return v;
  return null;
}

/**
 * Adresse de redirection vers une page de l'outil. On vise le domaine public (NEXT_PUBLIC_SITE_URL)
 * et non le domaine technique de l'app, vers lequel les requêtes sont relayées.
 * Sur une preview Vercel, on reste sur le domaine de la preview : sinon la redirection
 * renverrait vers le site en production, qui ne contient pas les changements testés.
 */
export function redirectUrl(path: string, request: { url: string }): URL {
  const origin = process.env.VERCEL_ENV === "preview" ? request.url : process.env.NEXT_PUBLIC_SITE_URL || request.url;
  return new URL(`${BASE_PATH}${path}`, origin);
}
