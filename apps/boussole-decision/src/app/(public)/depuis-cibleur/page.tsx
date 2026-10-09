import type { Metadata } from "next";
import { CiblesStart } from "@/features/cibles/CiblesStart";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.espace.depuisCibleur.titre, robots: { index: false, follow: false } };
}

// Arrivée depuis le bouton « Comparer dans la Boussole » du Cibleur : les cibles sont dans l'ancre (#cibles=…).
export default function DepuisCibleurPage() {
  return <CiblesStart />;
}
