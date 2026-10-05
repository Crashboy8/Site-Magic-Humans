import "server-only";
import { cookies, headers } from "next/headers";
import { getMethodology } from "@/domain/methodology";
import { LOCALE_COOKIE, isLocale, localeFromAcceptLanguage, type Locale } from "./config";
import { MESSAGES } from "./messages";

/** Langue de la requête : le choix enregistré, sinon celle du navigateur, sinon le français. */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}

/** Textes de l'interface (t) et de la méthode (m) dans la langue de la requête. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: MESSAGES[locale], m: getMethodology(locale) };
}
