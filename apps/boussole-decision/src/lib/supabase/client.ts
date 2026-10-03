import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/config";

let browserClient: SupabaseClient | undefined;

/** Client Supabase côté navigateur (une seule instance). */
export function supabaseBrowser(): SupabaseClient {
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}
