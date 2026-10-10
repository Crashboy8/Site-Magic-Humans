import { ecrirePlanDuCompte, lirePlanDuCompte } from "@/data/maCiblePlan";
import { traiterPlan, type DependancesPlan } from "@/lib/maCible/planTraitement";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function gerer(request: Request): Promise<Response> {
  const client = supabaseServer();
  const d: DependancesPlan = {
    async session() {
      const { data } = await (await client).auth.getClaims();
      const userId = data?.claims?.sub;
      // Un essai sans compte garde son plan dans le navigateur, comme une personne sans compte.
      if (typeof userId !== "string" || !userId || data?.claims?.is_anonymous) return null;
      return { userId };
    },
    lire: async (userId) => lirePlanDuCompte(await client, userId),
    ecrire: async (userId, plan, maintenant) => ecrirePlanDuCompte(await client, userId, plan, maintenant),
    env: process.env,
  };
  return traiterPlan(request, d);
}

export function GET(request: Request): Promise<Response> {
  return gerer(request);
}

export function PUT(request: Request): Promise<Response> {
  return gerer(request);
}
