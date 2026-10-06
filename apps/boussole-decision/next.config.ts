import type { NextConfig } from "next";

// L'outil est servi sous www.magichumans.com/boussole-decision/ :
// le site statique relaie ce chemin vers ce projet (voir vercel.json à la racine du dépôt).
const siteHost = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : null;

// Carte du Talent : en production, celle du site. Sur une preview Vercel, celle de la même branche
// (projet « www.magichumans.com »), pour tester les deux côtés ensemble. Vercel tronque les adresses
// trop longues (plus de 63 caractères) : dans ce cas, on garde la carte en production.
function carteDuTalentUrl(): string {
  const prod = "https://www.magichumans.com/carte-du-talent/";
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  if (process.env.VERCEL_ENV !== "preview" || !branch) return prod;
  const host = `wwwmagichumanscom-git-${branch.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-magic-humans`;
  return host.length <= 63 ? `https://${host}.vercel.app/carte-du-talent/` : prod;
}

const nextConfig: NextConfig = {
  basePath: "/boussole-decision",
  // Le site principal force le slash final : on fait de même pour éviter les redirections en boucle.
  trailingSlash: true,
  env: { NEXT_PUBLIC_CARTE_DU_TALENT_URL: carteDuTalentUrl() },
  experimental: {
    serverActions: {
      // Les formulaires sont envoyés depuis le domaine du site principal, via le relais.
      allowedOrigins: ["www.magichumans.com", "magichumans.com", ...(siteHost ? [siteHost] : [])],
    },
  },
};

export default nextConfig;
