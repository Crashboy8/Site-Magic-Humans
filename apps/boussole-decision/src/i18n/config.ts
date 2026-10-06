// Langues de la Boussole. La langue choisie est gardée dans un cookie ; les adresses ne changent pas.
export const LOCALES = ["fr", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "boussole_lang";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Langue préférée du navigateur (en-tête Accept-Language) : la première langue reconnue (fr, en ou es). */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  const prefs = (header ?? "")
    .split(",")
    .map((part) => part.trim().slice(0, 2).toLowerCase())
    .filter(Boolean);
  const first = prefs.find((p) => isLocale(p));
  return first ?? DEFAULT_LOCALE;
}
