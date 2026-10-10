import { creerFournisseur } from "@/lib/ia/fournisseur";
import { reponseAvecBattements } from "@/lib/maCible/battements";
import { limitesDepuisEnv, limitesVip, quotaMemoire, quotaSupabase, type Quota } from "@/lib/maCible/quota";
import { repriseEnCascade, repriseMemoire, repriseSupabase, type Reprise } from "@/lib/maCible/reprise";
import { traiterDemande } from "@/lib/maCible/traitement";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Compteur et reprises en mémoire de l'instance : développement local, et secours si la base ne répond pas.
let memoire: Quota | undefined;
let memoireVip: Quota | undefined;
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

/** Identifiant du compte connecté s'il est VIP (est_vip), sinon null. Un essai sans compte n'est jamais VIP. */
async function vipConnecte(): Promise<string | null> {
  try {
    const supabase = await supabaseServer();
    const { data: claims } = await supabase.auth.getClaims();
    const id = claims?.claims?.sub;
    if (typeof id !== "string" || !id || claims?.claims?.is_anonymous) return null;
    const { data, error } = await supabase.rpc("est_vip");
    return !error && data === true ? id : null;
  } catch {
    return null;
  }
}

/** Un Supabase injoignable ne doit pas retenir la génération. */
function dansLeDelai<T>(travail: () => Promise<T | null>): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 2_000);
    travail().then(
      (valeur) => {
        clearTimeout(timer);
        resolve(valeur);
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
  const [email, vipId] = await Promise.all([
    env.MA_CIBLE_EMAILS_ILLIMITES?.trim() ? dansLeDelai(emailConnecte) : Promise.resolve(null),
    dansLeDelai(vipConnecte),
  ]);
  // VIP : même compteur partagé, avec le plafond de sécurité (limitesVip) à la place du quota par IP.
  const plafondVip = limitesVip(limites, env);
  memoireVip ??= quotaMemoire(plafondVip, maintenant);
  const vip = vipId ? { id: vipId, quota: admin ? quotaSupabase(admin, plafondVip, memoireVip) : memoireVip } : null;
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
        emailConnecte: email,
        vip,
        reprise,
        repriseSensible: reprises,
      },
      request,
    ),
  );
}
