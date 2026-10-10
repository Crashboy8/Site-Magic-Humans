import { deposerIntention } from "@/features/intention/serveur";
import { traiterIntention, type Dependances } from "@/lib/intention/traitement";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// « Demander l'avis de Pierre », depuis chaque outil (voir src/lib/intention/traitement.ts).
function gerer(request: Request): Promise<Response> {
  const admin = supabaseAdmin();
  const d: Dependances = {
    async session() {
      const { data } = await (await supabaseServer()).auth.getClaims();
      const userId = data?.claims?.sub;
      // Un essai sans compte donne son mail, comme une personne sans compte.
      if (typeof userId !== "string" || !userId || data?.claims?.is_anonymous) return null;
      return { userId };
    },
    deposer: admin ? (userId, demande) => deposerIntention(admin, userId, demande) : null,
    secret: process.env.SUPABASE_SECRET_KEY,
    env: process.env,
  };
  return traiterIntention(request, d);
}

export function GET(request: Request): Promise<Response> {
  return gerer(request);
}

export function POST(request: Request): Promise<Response> {
  return gerer(request);
}
