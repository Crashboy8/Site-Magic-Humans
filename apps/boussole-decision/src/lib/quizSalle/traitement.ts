// Compteur anonyme « Photo de la salle ». Aucune réponse n'entre ici : session et id de profil seulement.
import { origineAcceptee } from "@/lib/maCible/origine";

export const PROFILS_SALLE = ["securite", "profondeur", "admiration", "liberte", "harmonie", "complicite", "intensite"] as const;
export const SESSION_SALLE = /^webinaire-[a-z0-9][a-z0-9-]{0,40}$/;
const TAILLE_MAX = 400;
const FENETRE_MS = 60_000;
const MAX_PAR_FENETRE = 240;

export interface LigneSalle {
  id: string;
  n: number;
}

export interface CompteurSalle {
  increment(session: string, profil: string): Promise<boolean>;
  lire(session: string): Promise<LigneSalle[] | null>;
}

export interface LimiteurSalle {
  autorise(cle: string): boolean;
}

export interface DependancesSalle {
  compteur: CompteurSalle | null;
  limiteur: LimiteurSalle;
  env: Record<string, string | undefined>;
}

export function sessionSalleOk(value: string): boolean {
  return SESSION_SALLE.test(value);
}

export function profilSalleOk(value: string): boolean {
  return (PROFILS_SALLE as readonly string[]).includes(value);
}

export function limiteurMemoire(maintenant: () => number = () => Date.now()): LimiteurSalle {
  const hits = new Map<string, number[]>();
  return {
    autorise(cle: string): boolean {
      const now = maintenant();
      const frais = (hits.get(cle) ?? []).filter((t) => now - t < FENETRE_MS);
      if (frais.length >= MAX_PAR_FENETRE) {
        hits.set(cle, frais);
        return false;
      }
      frais.push(now);
      hits.set(cle, frais);
      if (hits.size > 4000) {
        const premier = hits.keys().next().value;
        if (premier) hits.delete(premier);
      }
      return true;
    },
  };
}

function reponse(corps: unknown, status = 200): Response {
  return Response.json(corps, { status, headers: { "Cache-Control": "no-store" } });
}

function adresse(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "inconnue";
}

/** POST exige une origine connue. GET accepte la même origine (sans en-tête Origin) et refuse un site tiers. */
export function accesSalle(request: Request, env: Record<string, string | undefined>): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origineAcceptee(origin, env);
  if (request.method !== "GET") return false;
  return request.headers.get("sec-fetch-site") !== "cross-site";
}

function lignesPropres(rows: LigneSalle[]): LigneSalle[] {
  return rows.filter((row) => profilSalleOk(row.id) && Number.isInteger(row.n) && row.n >= 0 && row.n < 1_000_000);
}

export async function traiterQuizSalle(deps: DependancesSalle, request: Request): Promise<Response> {
  if (!accesSalle(request, deps.env)) return reponse({ ok: false }, 403);
  if (!deps.limiteur.autorise(adresse(request.headers))) return reponse({ ok: false }, 429);
  if (!deps.compteur) return reponse({ ok: false }, 503);

  if (request.method === "GET") {
    const session = new URL(request.url).searchParams.get("session") ?? "";
    if (!sessionSalleOk(session)) return reponse({ ok: false }, 400);
    const rows = await deps.compteur.lire(session);
    if (!rows) return reponse({ ok: false }, 503);
    const profils = lignesPropres(rows);
    const total = profils.reduce((sum, row) => sum + row.n, 0);
    return reponse({ ok: true, total, profils });
  }

  if (request.method !== "POST") return reponse({ ok: false }, 405);
  let texte: string;
  try {
    texte = await request.text();
  } catch {
    return reponse({ ok: false }, 400);
  }
  if (texte.length > TAILLE_MAX) return reponse({ ok: false }, 400);
  let corps: unknown;
  try {
    corps = JSON.parse(texte);
  } catch {
    return reponse({ ok: false }, 400);
  }
  if (!corps || typeof corps !== "object" || Array.isArray(corps)) return reponse({ ok: false }, 400);
  const rec = corps as Record<string, unknown>;
  const session = rec.session;
  const profil = rec.profil;
  if (typeof session !== "string" || typeof profil !== "string") return reponse({ ok: false }, 400);
  if (!sessionSalleOk(session) || !profilSalleOk(profil)) return reponse({ ok: false }, 400);
  const ok = await deps.compteur.increment(session, profil);
  if (!ok) return reponse({ ok: false }, 503);
  return reponse({ ok: true });
}
