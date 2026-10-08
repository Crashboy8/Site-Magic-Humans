"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { setLocaleAction } from "@/i18n/actions";
import { useI18n } from "@/i18n/client";

/**
 * Pages de la Boussole Relation : le français reste, et la marque retire le sélecteur de langue.
 * Le mode pro ne rend pas ce composant.
 */
export function LoveChrome() {
  const { locale } = useI18n();
  const router = useRouter();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    if (locale !== "fr") void setLocaleAction("fr").then(() => router.refresh());
  }, [locale, router]);

  return <span data-amour-langue hidden />;
}
