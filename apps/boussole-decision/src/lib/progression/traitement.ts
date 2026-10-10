// Route api/progression : le jeu (site statique, même adresse www.magichumans.com) lit et envoie sa progression.
// GET lit, POST envoie les points du jeu. Sans compte, ou en essai sans compte : { compte: false }, et le jeu garde tout
// dans le navigateur. Table pas encore créée : { compte: true, table: false }, même chose.
// Logique pure, ses dépendances sont passées en paramètre (testée dans traitement.test.ts).
import { lireEnvoi, type EnvoiJeu, type VueProgression } from "@/domain/progression";
import { origineAcceptee } from "@/lib/maCible/origine";

/** Taille maximale du corps d'un envoi. */
export const CORPS_MAX = 2_000;

export interface Dependances {
  /** Le compte connecté, ou null (aucune session, ou essai sans compte). */
  session(): Promise<{ userId: string } | null>;
  lire(userId: string, maintenant: Date): Promise<VueProgression | "absente">;
  recevoir(userId: string, envoi: EnvoiJeu, maintenant: Date): Promise<VueProgression | "absente">;
  env: Record<string, string | undefined>;
  maintenant?: () => Date;
}

const ENTETES = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

function json(corps: unknown, status = 200): Response {
  return new Response(JSON.stringify(corps), { status, headers: ENTETES });
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

export async function traiterProgression(request: Request, d: Dependances): Promise<Response> {
  const maintenant = (d.maintenant ?? (() => new Date()))();
  const ecriture = request.method === "POST";
  if (!ecriture && request.method !== "GET") return json({ erreur: "methode" }, 405);
  if (ecriture && !origineAcceptee(request.headers.get("origin"), d.env)) return json({ erreur: "origine" }, 403);

  let envoi: EnvoiJeu | null = null;
  if (ecriture) {
    envoi = lireEnvoi(await lireCorps(request), maintenant);
    if (!envoi) return json({ erreur: "invalide" }, 400);
  }

  const session = await d.session().catch(() => null);
  if (!session) return json({ compte: false });
  try {
    const vue = envoi ? await d.recevoir(session.userId, envoi, maintenant) : await d.lire(session.userId, maintenant);
    if (vue === "absente") return json({ compte: true, table: false });
    return json({ compte: true, table: true, progression: vue });
  } catch {
    return json({ erreur: "indisponible" }, 503);
  }
}
