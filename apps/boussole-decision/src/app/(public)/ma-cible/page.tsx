import type { Metadata } from "next";
import { MaCible } from "@/features/maCible/MaCible";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const M = (await getI18n()).t.maCible;
  // Pas d'indexation tant que Pierre n'a pas décidé (question ouverte n° 2 du cahier des charges).
  return { title: M.meta.titre, description: M.meta.description, robots: { index: false, follow: true } };
}

const FOURNISSEURS = { anthropic: "Anthropic, modèle Claude", openai: "OpenAI" } as const;

// Lu côté serveur : le nom du fournisseur est affiché dans l'encart de confidentialité, la clé reste sur le serveur.
export default function MaCiblePage() {
  const choix = process.env.MA_CIBLE_FOURNISSEUR === "openai" ? "openai" : "anthropic";
  return <MaCible fournisseur={FOURNISSEURS[choix]} />;
}
