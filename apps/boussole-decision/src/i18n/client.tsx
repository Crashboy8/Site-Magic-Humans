"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getMethodology } from "@/domain/methodology";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { MESSAGES } from "./messages";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** Textes de l'interface (t) et de la méthode (m) dans la langue choisie. */
export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: MESSAGES[locale], m: getMethodology(locale) };
}
