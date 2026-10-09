import type { Metadata } from "next";
import { DEPUIS_CIBLEUR } from "@/content/depuisCibleur";
import { CiblesStart } from "@/features/cibles/CiblesStart";

export const metadata: Metadata = { title: DEPUIS_CIBLEUR.titre, robots: { index: false, follow: false } };

// Arrivée depuis le bouton « Comparer mes cibles dans la Boussole » du Cibleur : les cibles sont dans l'ancre (#cibles=…).
export default function DepuisCibleurPage() {
  return <CiblesStart />;
}
