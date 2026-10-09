"use server";

import { redirect } from "next/navigation";
import { deleteFiche, upsertFiche } from "@/data/fiche";
import { validerFiche } from "@/domain/fiche/bornes";
import { METHODES_FICHE, SOURCES_FICHE, type MethodeFiche, type SourceFiche } from "@/domain/fiche/types";
import { ESPACE } from "@/content/espace";
import { supabaseServer } from "@/lib/supabase/server";

async function utilisateur() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return { supabase, userId: typeof userId === "string" ? userId : null };
}

/** Enregistre la fiche validée. On ne fait jamais confiance au navigateur : tout est revalidé ici. */
export async function enregistrerFicheAction(raw: string, source: SourceFiche, methode: MethodeFiche, consentement: boolean): Promise<{ error?: string }> {
  if (consentement !== true) return { error: ESPACE.verification.erreurEnregistrement };
  if (!SOURCES_FICHE.includes(source) || !METHODES_FICHE.includes(methode)) return { error: ESPACE.verification.erreurEnregistrement };
  let brut: unknown;
  try {
    brut = JSON.parse(raw);
  } catch {
    return { error: ESPACE.verification.erreurEnregistrement };
  }
  const v = validerFiche(brut);
  if (!v.ok) return { error: ESPACE.verification.erreurEnregistrement };
  const { supabase, userId } = await utilisateur();
  if (!userId) redirect("/connexion/?suite=%2Fmon-espace%2F");
  try {
    await upsertFiche(supabase, userId, v.fiche, source, methode);
  } catch {
    return { error: ESPACE.verification.erreurEnregistrement };
  }
  redirect("/mon-espace/?fiche=ok");
}

export async function supprimerFicheAction(): Promise<void> {
  const { supabase, userId } = await utilisateur();
  if (!userId) redirect("/connexion/?suite=%2Fmon-espace%2F");
  await deleteFiche(supabase, userId);
  redirect("/mon-espace/?fiche=supprimee");
}

export async function supprimerCompteAction(_prev: { error?: string } | undefined, fd: FormData): Promise<{ error?: string }> {
  if (fd.get("confirmation") !== "SUPPRIMER") return { error: ESPACE.compte.motAttendu };
  const { supabase, userId } = await utilisateur();
  if (!userId) redirect("/connexion/");
  const { error } = await supabase.rpc("supprimer_mon_compte");
  if (error) {
    if ((error.message ?? "").includes("COMPTE_COACH")) return { error: ESPACE.compte.compteCoach };
    return { error: ESPACE.verification.erreurEnregistrement };
  }
  await supabase.auth.signOut();
  redirect("https://www.magichumans.com/?compte=supprime");
}
