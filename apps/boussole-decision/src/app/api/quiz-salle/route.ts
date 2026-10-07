import type { SupabaseClient } from "@supabase/supabase-js";
import { limiteurMemoire, traiterQuizSalle, type CompteurSalle, type LimiteurSalle } from "@/lib/quizSalle/traitement";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let limiteur: LimiteurSalle | undefined;

function compteurAdmin(admin: SupabaseClient): CompteurSalle {
  return {
    async increment(session, profil) {
      const { error } = await admin.rpc("quiz_salle_increment", { p_session: session, p_profil: profil });
      return !error;
    },
    async lire(session) {
      const { data, error } = await admin.from("quiz_salle").select("profil, n").eq("session", session);
      if (error || !Array.isArray(data)) return null;
      return data.map((row: { profil: string; n: number }) => ({ id: String(row.profil), n: Number(row.n) }));
    },
  };
}

function gerer(request: Request): Promise<Response> {
  limiteur ??= limiteurMemoire();
  const admin = supabaseAdmin();
  return traiterQuizSalle({ compteur: admin ? compteurAdmin(admin) : null, limiteur, env: process.env }, request);
}

export function POST(request: Request): Promise<Response> {
  return gerer(request);
}

export function GET(request: Request): Promise<Response> {
  return gerer(request);
}
