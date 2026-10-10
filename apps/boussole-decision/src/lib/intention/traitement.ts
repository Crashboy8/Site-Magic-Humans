// Route api/intention : « Demander l'avis de Pierre », depuis l'application et depuis le site statique (même adresse).
// GET : le formulaire s'ouvre. La route dit si un compte est connecté (pas de champ mail alors) et donne un jeton signé
// qui porte l'heure d'ouverture. POST : la demande. Anti-spam, dans l'ordre : origine connue, champ pot de miel (rempli,
// on répond comme si tout allait bien et rien n'est gardé), délai minimal de 3 s depuis l'ouverture, puis la base :
// une demande par mail ou par compte toutes les 10 minutes, et un plafond global par minute (deposer_intention).
// La question n'est que stockée : aucune IA ne la lit ici.
// Logique pure, ses dépendances sont passées en paramètre (testée dans traitement.test.ts).
import { createHmac, timingSafeEqual } from "node:crypto";
import { DELAI_MIN_MS, JETON_MAX_MS, lireDemande, type DemandeIntention } from "@/domain/intention";
import { origineAcceptee } from "@/lib/maCible/origine";

/** Taille maximale du corps d'un envoi (une question de 500 caractères, même tout en emoji, y tient). */
export const CORPS_MAX = 4_000;

export type ResultatDepot = "ok" | "attendre" | "plafond" | "invalide";

export interface Dependances {
  /** Le compte connecté, ou null (aucune session, ou essai sans compte). */
  session(): Promise<{ userId: string } | null>;
  /** Écrit la demande (deposer_intention, clé secrète), ou null si la clé secrète manque. */
  deposer: ((userId: string | null, d: DemandeIntention) => Promise<ResultatDepot>) | null;
  /** Clé qui signe le jeton du formulaire. */
  secret: string | undefined;
  env: Record<string, string | undefined>;
  maintenant?: () => number;
}

const ENTETES = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), { status, headers: ENTETES });
}

function signature(secret: string, heure: number): string {
  return createHmac("sha256", `intention:${secret}`).update(String(heure)).digest("base64url");
}

export function creerJeton(secret: string, heure: number): string {
  return `${heure}.${signature(secret, heure)}`;
}

/** "ok", "trop_tot" (moins de 3 s après l'ouverture) ou "invalide" (signature fausse ou jeton trop vieux). */
export function verifierJeton(secret: string, jeton: string, maintenant: number): "ok" | "trop_tot" | "invalide" {
  const m = /^(\d{10,16})\.([A-Za-z0-9_-]{43})$/.exec(jeton);
  if (!m) return "invalide";
  const heure = Number(m[1]);
  const attendu = Buffer.from(signature(secret, heure));
  const recu = Buffer.from(m[2]);
  if (attendu.length !== recu.length || !timingSafeEqual(attendu, recu)) return "invalide";
  const ecart = maintenant - heure;
  if (ecart < 0 || ecart > JETON_MAX_MS) return "invalide";
  if (ecart < DELAI_MIN_MS) return "trop_tot";
  return "ok";
}

async function lireCorps(request: Request): Promise<unknown> {
  const texte = await request.text();
  if (texte.length > CORPS_MAX) return null;
  try {
    return JSON.parse(texte);
  } catch {
    return null;
  }
}

/** GET accepte la même origine (sans en-tête Origin) et refuse un site tiers ; POST exige une origine connue. */
function accesAutorise(request: Request, env: Record<string, string | undefined>): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origineAcceptee(origin, env);
  if (request.method !== "GET") return false;
  return request.headers.get("sec-fetch-site") !== "cross-site";
}

export async function traiterIntention(request: Request, d: Dependances): Promise<Response> {
  const maintenant = (d.maintenant ?? Date.now)();
  if (request.method !== "GET" && request.method !== "POST") return json({ erreur: "methode" }, 405);
  if (!accesAutorise(request, d.env)) return json({ erreur: "origine" }, 403);
  if (!d.secret || !d.deposer) return json({ erreur: "indisponible" }, 503);

  const session = await d.session().catch(() => null);
  if (request.method === "GET") return json({ compte: Boolean(session), jeton: creerJeton(d.secret, maintenant) });

  const lecture = lireDemande(await lireCorps(request));
  if (!lecture.ok) return json({ erreur: lecture.erreur }, 400);
  const demande = lecture.demande;
  // Pot de miel : un robot qui remplit tout croit que c'est parti. Rien n'est gardé.
  if (demande.piege) return json({ ok: true });
  const jeton = verifierJeton(d.secret, demande.jeton, maintenant);
  if (jeton === "trop_tot") return json({ erreur: "trop_tot" }, 400);
  if (jeton === "invalide") return json({ erreur: "jeton" }, 400);
  if (!session && !demande.mail) return json({ erreur: "mail" }, 400);

  try {
    const resultat = await d.deposer(session?.userId ?? null, demande);
    if (resultat === "ok") return json({ ok: true });
    if (resultat === "attendre" || resultat === "plafond") return json({ erreur: resultat }, 429);
    return json({ erreur: "invalide" }, 400);
  } catch {
    return json({ erreur: "indisponible" }, 503);
  }
}
