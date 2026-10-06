"use client";

import { buttonClass, cx } from "@/components/ui";
import { carteDuTalentHref } from "@/domain/carteLink";
import type { TalentUnique } from "@/domain/types";
import { CARTE_DU_TALENT_URL } from "@/lib/config";
import { useI18n } from "@/i18n/client";

/**
 * Bouton « Explorer ma carte du talent » : ouvre la Carte du Talent dans un nouvel onglet,
 * avec le Talent Unique dans l'ancre du lien pour pré-remplir la création de la carte.
 */
export function CarteDuTalentLink({ talent, className }: { talent: TalentUnique; className?: string }) {
  const c = useI18n().t.common;
  return (
    <div className={cx("flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4", className)}>
      <a href={carteDuTalentHref(CARTE_DU_TALENT_URL, talent)} target="_blank" rel="noopener" className={buttonClass("secondary", "w-full sm:w-auto")}>
        {c.carteDuTalent}
        <span className="sr-only"> {c.newTab}</span>
      </a>
      <p className="text-[15px] text-ink-soft">{c.carteDuTalentHint}</p>
    </div>
  );
}
