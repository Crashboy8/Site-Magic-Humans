import type { Metadata } from "next";
import { CarteDuTalent } from "@/features/carte/CarteDuTalent";
import { TEXTES } from "@/features/carte/textes";

// Page en préparation : non indexée par les moteurs de recherche.
export const metadata: Metadata = { title: "Carte du talent", robots: { index: false, follow: false } };

export default function CarteDuTalentPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">Nouveau · en préparation</p>
        <h1 className="text-4xl italic sm:text-5xl">{TEXTES.titre}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{TEXTES.intro}</p>
      </header>
      <CarteDuTalent />
    </div>
  );
}
