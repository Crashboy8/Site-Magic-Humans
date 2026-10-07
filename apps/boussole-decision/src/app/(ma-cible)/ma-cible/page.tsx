import type { Metadata } from "next";
import { MaCible } from "@/features/maCible/MaCible";
import { LIBELLE_FOURNISSEUR_IA } from "@/i18n/messages/maCible";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const M = (await getI18n()).t.maCible;
  // Pas d'indexation tant que Pierre n'a pas décidé (question ouverte n° 2 du cahier des charges).
  return { title: M.meta.titre, description: M.meta.description, robots: { index: false, follow: true } };
}

// La clé du fournisseur reste sur le serveur. L'encart nomme Mistral, Gemini et Claude ensemble.
export default function MaCiblePage() {
  return <MaCible fournisseur={LIBELLE_FOURNISSEUR_IA} />;
}
