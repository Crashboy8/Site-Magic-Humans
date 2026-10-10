// Route api/ma-cible/plan : le Cibleur lit et enregistre le plan modifié de la personne connectée.
// Sans compte (ou en essai sans compte) : { compte: false }, et le plan reste dans le navigateur.
// Table pas encore créée : { compte: true, table: false }, même chose.
// Logique pure, ses dépendances sont passées en paramètre (testée dans planTraitement.test.ts).
import { lirePlan, type PlanEdite } from "@/domain/maCible/planEdite";
import { origineAcceptee } from "./origine";

/** Taille maximale du corps d'un envoi. */
export const CORPS_PLAN_MAX = 60_000;

export interface DependancesPlan {
  session(): Promise<{ userId: string } | null>;
  lire(userId: string): Promise<PlanEdite | null | "absente">;
  ecrire(userId: string, plan: PlanEdite | null, maintenant: Date): Promise<"ok" | "absente">;
  env: Record<string, string | undefined>;
  maintenant?: () => Date;
}

const ENTETES = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const json = (corps: unknown, status = 200) => new Response(JSON.stringify(corps), { status, headers: ENTETES });

export async function traiterPlan(request: Request, d: DependancesPlan): Promise<Response> {
  const ecriture = request.method === "PUT";
  if (!ecriture && request.method !== "GET") return json({ erreur: "methode" }, 405);
  if (ecriture && !origineAcceptee(request.headers.get("origin"), d.env)) return json({ erreur: "origine" }, 403);

  let envoi: { plan: PlanEdite | null } | null = null;
  if (ecriture) {
    const texte = await request.text();
    if (texte.length > CORPS_PLAN_MAX) return json({ erreur: "invalide" }, 400);
    let brut: unknown = null;
    try {
      brut = JSON.parse(texte);
    } catch {
      return json({ erreur: "invalide" }, 400);
    }
    const plan = typeof brut === "object" && brut !== null && "plan" in brut ? (brut as { plan: unknown }).plan : undefined;
    if (plan === null) envoi = { plan: null };
    else {
      const lu = lirePlan(plan);
      if (!lu) return json({ erreur: "invalide" }, 400);
      envoi = { plan: lu };
    }
  }

  const session = await d.session().catch(() => null);
  if (!session) return json({ compte: false });
  try {
    if (envoi) {
      const r = await d.ecrire(session.userId, envoi.plan, (d.maintenant ?? (() => new Date()))());
      return r === "absente" ? json({ compte: true, table: false }) : json({ compte: true, table: true });
    }
    const plan = await d.lire(session.userId);
    if (plan === "absente") return json({ compte: true, table: false });
    return json({ compte: true, table: true, plan });
  } catch {
    return json({ erreur: "indisponible" }, 503);
  }
}
