import type { Metadata } from "next";
import { fournisseurNotesDepuis } from "@/domain/maCible/fournisseurNotes";
import { MaCible } from "@/features/maCible/MaCible";
import { LIBELLE_FOURNISSEUR_IA, titreOutil } from "@/i18n/messages/maCible";
import { getI18n } from "@/i18n/server";
import { limitesDepuisEnv } from "@/lib/maCible/quota";

export async function generateMetadata(): Promise<Metadata> {
  const M = (await getI18n()).t.maCible;
  // Pas d'indexation tant que Pierre n'a pas décidé (question ouverte n° 2 du cahier des charges).
  return {
    title: { absolute: titreOutil(M.commun.nomOutil, M.commun.sousTitre) },
    description: M.meta.description,
    robots: { index: false, follow: true },
  };
}

// La clé du fournisseur reste sur le serveur. L'encart nomme Mistral, Gemini et Claude ensemble.
export default function MaCiblePage() {
  const limites = limitesDepuisEnv(process.env);
  return (
    <MaCible
      fournisseur={LIBELLE_FOURNISSEUR_IA}
      fournisseurNotes={fournisseurNotesDepuis(process.env.MA_CIBLE_FOURNISSEUR)}
      maxSynthese={limites.ipSynthese}
      maxApprofondir={limites.ipApprofondir}
    />
  );
}
