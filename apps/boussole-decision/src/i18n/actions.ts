"use server";

import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { LOCALE_COOKIE, isLocale } from "./config";

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  // Connecté·e : la langue suit aussi le compte, pour les emails envoyés par Supabase (supabase/templates/).
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user && data.user.user_metadata?.lang !== locale) await supabase.auth.updateUser({ data: { lang: locale } });
}
