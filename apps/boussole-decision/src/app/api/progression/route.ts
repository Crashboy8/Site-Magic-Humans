import { progressionDuCompte, recevoirDuJeu } from "@/features/progression/serveur";
import { traiterProgression, type Dependances } from "@/lib/progression/traitement";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Le jeu talent-game lit et envoie sa progression ici (voir src/lib/progression/traitement.ts).
function gerer(request: Request): Promise<Response> {
  const client = supabaseServer();
  const d: Dependances = {
    async session() {
      const { data } = await (await client).auth.getClaims();
      const userId = data?.claims?.sub;
      // Un essai sans compte garde sa progression dans le navigateur, comme une personne sans compte.
      if (typeof userId !== "string" || !userId || data?.claims?.is_anonymous) return null;
      return { userId };
    },
    lire: async (userId, maintenant) => progressionDuCompte(await client, userId, maintenant),
    recevoir: async (userId, envoi, maintenant) => recevoirDuJeu(await client, userId, envoi, maintenant),
    env: process.env,
  };
  return traiterProgression(request, d);
}

export function GET(request: Request): Promise<Response> {
  return gerer(request);
}

export function POST(request: Request): Promise<Response> {
  return gerer(request);
}
