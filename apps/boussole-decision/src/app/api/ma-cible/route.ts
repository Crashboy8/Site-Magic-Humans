import { creerFournisseur } from "@/lib/ia/fournisseur";
import { reponseAvecBattements } from "@/lib/maCible/battements";
import { limitesDepuisEnv, quotaMemoire, quotaSupabase, type Quota } from "@/lib/maCible/quota";
import { repriseEnCascade, repriseMemoire, repriseSupabase, type Reprise } from "@/lib/maCible/reprise";
import { traiterDemande } from "@/lib/maCible/traitement";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Compteur et reprises en mémoire de l'instance : développement local, et secours si la base ne répond pas.
let memoire: Quota | undefined;
let reprises: Reprise | undefined;

async function emailConnecte(): Promise<string | null> {
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email?.trim().toLowerCase() ?? "";
    return email.includes("@") ? email : null;
  } catch {
    return null;
  }
}

/** Un Supabase injoignable ne doit pas retenir la génération. */
function emailDansLeDelai(): Promise<string | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 2_000);
    emailConnecte().then(
      (email) => {
        clearTimeout(timer);
        resolve(email);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  const env = process.env;
  const limites = limitesDepuisEnv(env);
  const maintenant = () => new Date();
  memoire ??= quotaMemoire(limites, maintenant);
  reprises ??= repriseMemoire(maintenant);
  const admin = supabaseAdmin();
  const reprise = admin ? repriseEnCascade(reprises, repriseSupabase(admin, maintenant)) : reprises;
  // Battements : sans eux, un proxy coupe la requête silencieuse (souvent vers 100 s) et le navigateur
  // affiche « Connexion perdue », alors que son propre délai est de 270 s et maxDuration de 300 s.
  // Le travail n'est pas annulé si le navigateur part : le résultat réussi reste en reprise.
  return reponseAvecBattements(
    traiterDemande(
      {
        fournisseur: creerFournisseur(env),
        quota: admin ? quotaSupabase(admin, limites, memoire) : memoire,
        maintenant,
        env,
        emailConnecte: env.MA_CIBLE_EMAILS_ILLIMITES?.trim() ? await emailDansLeDelai() : null,
        reprise,
        repriseSensible: reprises,
      },
      request,
    ),
  );
}
