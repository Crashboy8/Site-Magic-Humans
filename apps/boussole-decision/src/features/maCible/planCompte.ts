// Plan modifié gardé dans le compte (route api/ma-cible/plan). Sans compte, ou sans réseau : rien ne se passe, le navigateur garde tout.
import { lirePlan, type PlanEdite } from "@/domain/maCible/planEdite";
import { BASE_PATH } from "@/lib/config";

export const URL_PLAN = `${BASE_PATH}/api/ma-cible/plan/`;

export type LecturePlanCompte = { compte: false } | { compte: true; plan: PlanEdite | null };

/** `compte: false` sans compte, sans table ou en cas d'échec : le plan du navigateur fait foi. */
export async function lirePlanCompte(): Promise<LecturePlanCompte> {
  try {
    const r = await fetch(URL_PLAN, { cache: "no-store" });
    if (!r.ok) return { compte: false };
    const corps = (await r.json()) as { compte?: boolean; table?: boolean; plan?: unknown };
    if (!corps.compte || !corps.table) return { compte: false };
    return { compte: true, plan: lirePlan(corps.plan) };
  } catch {
    return { compte: false };
  }
}

/** Enregistre le plan (ou le retire avec `null`). N'échoue jamais : un échec laisse le plan dans le navigateur. */
export async function envoyerPlanCompte(plan: PlanEdite | null): Promise<void> {
  try {
    await fetch(URL_PLAN, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }), keepalive: true });
  } catch {
    // réseau coupé : on réessaiera au prochain changement
  }
}

/** Le plus récent des deux plans pour le même résultat ; le plan du compte ne s'applique jamais à un autre résultat. */
export function planAGarder(local: PlanEdite | null, compte: PlanEdite | null, resultatLe: string | null): PlanEdite | null {
  const valide = compte && compte.resultatLe === resultatLe ? compte : null;
  if (!valide) return local;
  if (!local) return valide;
  return Date.parse(valide.maj) > Date.parse(local.maj) ? valide : local;
}
