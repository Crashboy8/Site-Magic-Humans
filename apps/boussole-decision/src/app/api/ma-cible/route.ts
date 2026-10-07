import { creerFournisseur } from "@/lib/ia/fournisseur";
import { limitesDepuisEnv, quotaMemoire, quotaSupabase, type Quota } from "@/lib/maCible/quota";
import { traiterDemande } from "@/lib/maCible/traitement";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Compteur en mémoire de l'instance : développement local, et secours si la base ne répond pas.
let memoire: Quota | undefined;

export async function POST(request: Request): Promise<Response> {
  const env = process.env;
  const limites = limitesDepuisEnv(env);
  memoire ??= quotaMemoire(limites, () => new Date());
  const admin = supabaseAdmin();
  return traiterDemande(
    { fournisseur: creerFournisseur(env), quota: admin ? quotaSupabase(admin, limites, memoire) : memoire, maintenant: () => new Date(), env },
    request,
  );
}
