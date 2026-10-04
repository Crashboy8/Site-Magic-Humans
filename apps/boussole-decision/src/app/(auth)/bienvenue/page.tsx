import type { Metadata } from "next";
import { WelcomeChoices } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Bienvenue" };

export default function WelcomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl italic sm:text-4xl">Choisir avec le cœur et la tête</h1>
        <p className="text-ink-soft">
          Compare tes opportunités professionnelles à partir de ce qui compte vraiment pour toi : ton Talent Unique, tes valeurs, tes
          conditions de vie.
        </p>
      </div>
      <WelcomeChoices />
    </div>
  );
}
