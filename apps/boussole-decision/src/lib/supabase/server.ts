import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/config";
import type { AppUser } from "@/domain/types";
import { mapAppUser } from "@/data/mappers";

/** Client Supabase pour les composants serveur, actions et routes (un par requête). */
export async function supabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un composant serveur : le proxy rafraîchit déjà la session.
        }
      },
    },
  });
}

/** Utilisateur connecté et sa fiche, ou null. Mis en cache pour la durée d'un rendu. */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return null;
  const { data } = await supabase.from("app_users").select("*").eq("id", userId).maybeSingle();
  return data ? mapAppUser(data) : null;
});

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion/");
  return user;
}
