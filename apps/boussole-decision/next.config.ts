import type { NextConfig } from "next";

// L'outil est servi sous www.magichumans.com/boussole-decision/ :
// le site statique relaie ce chemin vers ce projet (voir vercel.json à la racine du dépôt).
const siteHost = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host : null;

const nextConfig: NextConfig = {
  basePath: "/boussole-decision",
  // Le site principal force le slash final : on fait de même pour éviter les redirections en boucle.
  trailingSlash: true,
  experimental: {
    serverActions: {
      // Les formulaires sont envoyés depuis le domaine du site principal, via le relais.
      allowedOrigins: ["www.magichumans.com", "magichumans.com", ...(siteHost ? [siteHost] : [])],
    },
  },
};

export default nextConfig;
