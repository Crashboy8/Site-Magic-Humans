export const BASE_PATH = "/boussole-decision";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** URL publique absolue d'une page de l'outil (liens envoyés par email). */
export function absoluteUrl(path: string, fallbackOrigin?: string): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || fallbackOrigin || "http://localhost:3000").replace(/\/$/, "");
  return `${origin}${BASE_PATH}${path}`;
}

/** Pages accessibles sans être connecté. */
export const PUBLIC_PATHS = [
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/auth/callback",
  "/auth/confirm",
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Adresse de redirection vers une page de l'outil. On vise le domaine public (NEXT_PUBLIC_SITE_URL)
 * et non le domaine technique de l'app, vers lequel les requêtes sont relayées.
 */
export function redirectUrl(path: string, request: { url: string }): URL {
  return new URL(`${BASE_PATH}${path}`, process.env.NEXT_PUBLIC_SITE_URL || request.url);
}
