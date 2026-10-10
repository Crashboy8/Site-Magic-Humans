"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";
import { COOKIE_ACCORD } from "./serveur";

/** Pages qui affichent la case d'accord : on y revient après l'envoi. */
const RETOURS = { espace: "/mon-espace/", donnees: "/tes-donnees/" } as const;

/**
 * La case « J'accepte que ma fiche talent soit stockée dans mon espace ».
 * Cochée : la date est gardée (accepter_stockage_fiche), puis la fiche préparée par Pierre arrive s'il y en a une.
 * Pas cochée : rien n'est gardé ni copié ; un cookie évite de reposer la question à chaque visite.
 */
export async function accordFicheAction(_prev: { erreur?: string }, fd: FormData): Promise<{ erreur?: string }> {
  const A = (await getI18n()).t.vip.accord;
  const page = fd.get("retour") === "donnees" ? RETOURS.donnees : RETOURS.espace;
  if (fd.get("accord") !== "oui") {
    (await cookies()).set(COOKIE_ACCORD, "plus_tard", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    redirect(`${page}?accord=plus_tard`);
  }
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("accepter_stockage_fiche");
  if (error || data === "non_connecte" || data === "invite") return { erreur: A.erreur };
  redirect(`${page}?accord=${data === "copiee" ? "copiee" : "ok"}`);
}

/** « Je veux rejoindre un groupe » : la demande part chez Pierre (réservé aux comptes VIP, vérifié par la base). */
export async function demanderGroupeM3Action(): Promise<{ le?: string; erreur?: string }> {
  const G = (await getI18n()).t.vip.groupeM3;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("demander_groupe_m3");
  if (error || typeof data !== "string") return { erreur: G.erreur };
  return { le: data };
}
