import type { Metadata } from "next";
import { MaCible } from "@/features/maCible/MaCible";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const M = (await getI18n()).t.maCible;
  // Pas d'indexation tant que Pierre n'a pas décidé (question ouverte n° 2 du cahier des charges).
  return { title: M.meta.titre, description: M.meta.description, robots: { index: false, follow: true } };
}

const FOURNISSEURS = { anthropic: "Anthropic Claude", openai: "OpenAI", gemini: "Google Gemini" } as const;

// Lu côté serveur : la clé reste sur le serveur. L'encart nomme Gemini et Claude ensemble, sans ce libellé.
export default function MaCiblePage() {
  const brut = process.env.MA_CIBLE_FOURNISSEUR?.trim().toLowerCase();
  const choix = brut === "openai" || brut === "gemini" ? brut : "anthropic";
  return <MaCible fournisseur={FOURNISSEURS[choix]} />;
}
