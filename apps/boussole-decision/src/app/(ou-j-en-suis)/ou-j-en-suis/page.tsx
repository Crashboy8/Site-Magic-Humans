import type { Metadata } from "next";
import { contenuParcours } from "@/domain/parcours/contenu";
import { OuJenSuis } from "@/features/parcours/OuJenSuis";
import { etatDuCompte } from "@/features/parcours/serveur";
import { textesParcours } from "@/i18n/messages/parcours";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const T = textesParcours((await getI18n()).locale);
  // Pas d'indexation, comme Le Cibleur, tant que Pierre n'a pas décidé.
  return { title: { absolute: `${T.meta.titre} · Magic Humans` }, description: T.meta.description, robots: { index: false, follow: true } };
}

// Sans compte : les réponses restent dans le navigateur. Connecté : elles vont aussi dans le compte (même moteur que Mon espace).
export default async function OuJenSuisPage() {
  const { locale } = await getI18n();
  const data = contenuParcours(locale);
  const etat = await etatDuCompte(await getCurrentUser(), data);
  return <OuJenSuis data={data} variante="page" initial={etat.initial} majCompte={etat.majCompte} compte={etat.compte} ficheDeposee={etat.ficheDeposee} />;
}
