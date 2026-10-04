"use client";

import { signOutAction } from "./actions";

/** Déconnexion ; pour un essai non sauvegardé, on prévient que le travail sera perdu. */
export function SignOutButton({ isGuest }: { isGuest: boolean }) {
  return (
    <form
      action={signOutAction}
      onSubmit={(e) => {
        if (isGuest && !confirm("Ton essai n'est pas sauvegardé : en quittant, tu ne pourras plus le retrouver. Quitter quand même ?")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="min-h-10 rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
        {isGuest ? "Quitter l'essai" : "Déconnexion"}
      </button>
    </form>
  );
}
