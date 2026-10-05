"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cx } from "@/components/ui";
import { setLocaleAction } from "./actions";
import { useI18n } from "./client";
import { LOCALES } from "./config";

/** Sélecteur FR · EN : enregistre le choix et réaffiche la page dans la nouvelle langue. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cx("flex items-center rounded-full border border-line bg-paper p-0.5 text-xs", className)}
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setLocaleAction(l);
              router.refresh();
            })
          }
          className={cx(
            "min-h-8 min-w-9 rounded-full px-2 font-semibold uppercase",
            locale === l ? "bg-ink text-cream" : "text-ink-soft hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
