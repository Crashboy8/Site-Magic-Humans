"use client";

import { useI18n } from "@/i18n/client";
import { signOutAction } from "./actions";

/** Déconnexion ; pour un essai non sauvegardé, on prévient que le travail sera perdu. */
export function SignOutButton({ isGuest }: { isGuest: boolean }) {
  const { t } = useI18n();
  return (
    <form
      action={signOutAction}
      onSubmit={(e) => {
        if (isGuest && !confirm(t.common.quitTrialConfirm)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="min-h-10 rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
        {isGuest ? t.common.quitTrial : t.common.signOut}
      </button>
    </form>
  );
}
