"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Notice, cx } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { setProfileSharing } from "@/data/repository";
import { useI18n } from "@/i18n/client";

/** Interrupteur « Partager avec mon coach », révocable à tout moment. */
export function ShareWithCoach({ profileId, initialShared }: { profileId: string; initialShared: boolean }) {
  const router = useRouter();
  const id = useId();
  const [shared, setShared] = useState(initialShared);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const p = useI18n().t.profile;

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
            {p.shareTitle}
          </p>
          <p className="text-sm font-medium" aria-live="polite">
            {shared ? p.sharedOn : p.sharedOff}
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
          <span
            className={cx(
              "inline-block h-6 w-6 rounded-full bg-white shadow transition-transform",
              shared ? "translate-x-7" : "translate-x-1",
            )}
          />
        </button>
      </div>
      <div id={`${id}-desc`} className="mt-3 space-y-1 text-sm text-ink-soft">
        <p>
          {p.shareExplainStart} <strong className="font-medium text-ink">{p.shareExplainReadOnly}</strong> {p.shareExplainMiddle}{" "}
          <strong className="font-medium text-ink">{p.shareExplainNever}</strong>.
        </p>
        <p>{p.shareExplainOthers}</p>
      </div>
      {error && (
        <div className="mt-3">
          <Notice tone="error">{p.shareFailed}</Notice>
        </div>
      )}
    </section>
  );
}
