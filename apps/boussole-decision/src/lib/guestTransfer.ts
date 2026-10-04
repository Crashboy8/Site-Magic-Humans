import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Jeton de transfert d'un essai vers un compte existant, gardé dans un cookie de session
// le temps que la personne se connecte (mot de passe ou lien par email, sur le même appareil).
const COOKIE = "boussole_essai";

export async function rememberGuestTransfer(token: string) {
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 });
}

/** Après une connexion : rattache l'essai en attente au compte. Renvoie le nombre de profils récupérés. */
export async function claimPendingGuestTransfer(supabase: SupabaseClient): Promise<number> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return 0;
  store.delete(COOKIE);
  const { data, error } = await supabase.rpc("claim_guest_transfer", { p_token: token });
  return error ? 0 : Number(data ?? 0);
}
