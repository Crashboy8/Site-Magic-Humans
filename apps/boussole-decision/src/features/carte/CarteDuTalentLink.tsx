"use client";

import { useSyncExternalStore } from "react";
import { buttonClass, cx } from "@/components/ui";
import { carteDuTalentHref } from "@/domain/carteLink";
import type { TalentUnique } from "@/domain/types";
import { CARTE_DU_TALENT_URL } from "@/lib/config";
import { useI18n } from "@/i18n/client";

/**
 * Bouton « Explorer ma carte du talent » : ouvre la Carte du Talent dans un nouvel onglet,
 * avec le Talent Unique dans l'ancre du lien pour pré-remplir la création de la carte.
 */
// Adresse de la page en cours (sans ancre), lue côté navigateur seulement : la carte s'en sert pour
// proposer « Revenir à ma Boussole ». Rendu serveur : pas d'adresse, le lien reste valable.
const pasDAbonnement = () => () => {};
const adresseClient = () => window.location.origin + window.location.pathname + window.location.search;
const adresseServeur = () => "";

export function CarteDuTalentLink({ talent, className }: { talent: TalentUnique; className?: string }) {
  const { t, locale } = useI18n();
  const c = t.common;
  const retour = useSyncExternalStore(pasDAbonnement, adresseClient, adresseServeur);
  return (
    <div className={cx("flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4", className)}>
      <a href={carteDuTalentHref(CARTE_DU_TALENT_URL, talent, locale, retour || undefined)} target="_blank" rel="noopener" className={buttonClass("secondary", "w-full sm:w-auto")}>
        {c.carteDuTalent}
        <span className="sr-only"> {c.newTab}</span>
      </a>
      <p className="text-[15px] text-ink-soft">{c.carteDuTalentHint}</p>
    </div>
  );
}
