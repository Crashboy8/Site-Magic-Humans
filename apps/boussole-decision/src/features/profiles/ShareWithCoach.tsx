"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Notice, cx } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { setProfileSharing } from "@/data/repository";

/** Interrupteur « Partager avec mon coach », révocable à tout moment. */
export function ShareWithCoach({ profileId, initialShared }: { profileId: string; initialShared: boolean }) {
  const router = useRouter();
  const id = useId();
  const [shared, setShared] = useState(initialShared);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function toggle() {
    const next = !shared;
    setPending(true);
    setError(false);
    setShared(next);
    try {
      await setProfileSharing(supabaseBrowser(), profileId, next);
      router.refresh();
    } catch {
      setShared(!next);
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby={`${id}-label`}
      className={cx("rounded-2xl border p-5 transition-colors", shared ? "border-sage/40 bg-sage-soft/60" : "border-line bg-paper")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p id={`${id}-label`} className="font-medium">
            Partager avec mon coach
          </p>
          <p className="text-sm font-medium" aria-live="polite">
            {shared ? "✓ Ce profil est partagé avec ton coach." : "🔒 Ce profil est privé : ton coach ne le voit pas."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={shared}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-desc`}
          disabled={pending}
          onClick={toggle}
          className={cx(
            "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors disabled:opacity-60",
            shared ? "bg-sage" : "bg-ink/25",
          )}
        >
          <span className={cx("inline-block h-6 w-6 rounded-full bg-white shadow transition-transform", shared ? "translate-x-7" : "translate-x-1")} />
        </button>
      </div>
      <div id={`${id}-desc`} className="mt-3 space-y-1 text-sm text-ink-soft">
        <p>
          Si tu l&apos;actives, ton coach pourra <strong className="font-medium text-ink">consulter en lecture seule</strong> : ton Talent
          Unique et toutes les versions de ce profil (critères, opportunités, évaluations, résultats et ressenti). Il pourra y laisser des
          commentaires, mais <strong className="font-medium text-ink">ne pourra jamais rien modifier</strong>.
        </p>
        <p>Tes autres profils restent privés. Tu peux retirer le partage à tout moment : ton coach n&apos;aura alors plus accès à rien.</p>
      </div>
      {error && (
        <div className="mt-3">
          <Notice tone="error">Le réglage n&apos;a pas pu être enregistré. Réessaie dans un instant.</Notice>
        </div>
      )}
    </section>
  );
}
