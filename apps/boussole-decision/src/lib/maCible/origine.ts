// Origines autorisées à appeler la route (§10.4). Fonction pure.

export function origineAcceptee(origin: string | null | undefined, env: Record<string, string | undefined>): boolean {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  const o = url.origin;
  if (o === "https://www.magichumans.com" || o === "https://magichumans.com") return true;
  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      if (o === new URL(env.NEXT_PUBLIC_SITE_URL).origin) return true;
    } catch {
      // adresse du site mal formée : on l'ignore
    }
  }
  if (url.protocol === "https:" && (/^boussole-decision[a-z0-9-]*\.vercel\.app$/.test(url.hostname) || /^wwwmagichumanscom-git-[a-z0-9-]+-magic-humans\.vercel\.app$/.test(url.hostname))) return true;
  if (o === "http://localhost:3000" && env.VERCEL_ENV !== "production") return true;
  return false;
}
