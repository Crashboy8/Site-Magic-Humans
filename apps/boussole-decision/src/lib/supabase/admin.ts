import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/config";

let client: SupabaseClient | null | undefined;

/** Client Supabase serveur avec la clé secrète (compteur de Ma Cible seulement), ou `null` si la clé manque. */
export function supabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const cle = process.env.SUPABASE_SECRET_KEY;
  client = cle && SUPABASE_URL ? createClient(SUPABASE_URL, cle, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}
