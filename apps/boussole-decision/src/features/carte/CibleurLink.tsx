"use client";

import { buttonClass, cx } from "@/components/ui";
import { cibleurHref } from "@/domain/cibleurLink";
import type { TalentUnique } from "@/domain/types";
import { useI18n } from "@/i18n/client";

/** Bouton vers Le Cibleur : le Talent Unique part dans l'ancre, le lien s'ouvre dans le même onglet. */
export function CibleurLink({ talent, className }: { talent: TalentUnique; className?: string }) {
  const { t } = useI18n();
  const c = t.common;
  return (
    <div className={cx("flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4", className)}>
      <a href={cibleurHref(talent)} className={buttonClass("secondary", "w-full sm:w-auto")}>
        {c.cibleur}
      </a>
      <p className="text-[15px] text-ink-soft">{c.cibleurHint}</p>
    </div>
  );
}
