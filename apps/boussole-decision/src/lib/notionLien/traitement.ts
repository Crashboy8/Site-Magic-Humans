// Toute la logique de la route POST /api/fiche/notion/ (cahier D.6), testable sans réseau ni Next.
import { origineAcceptee } from "@/lib/maCible/origine";
import type { QuotaNotion } from "./quota";
import type { CodeRecuperation, ResultatRecuperation } from "./recuperer";
import { lireLienNotion } from "./url";

export type CodeLien = CodeRecuperation | "desactive" | "origine_refusee" | "non_connecte" | "lien_invalide" | "pas_notion" | "quota";

const STATUTS: Record<CodeLien, number> = {
  desactive: 503,
  origine_refusee: 403,
  non_connecte: 401,
  lien_invalide: 400,
  pas_notion: 400,
  quota: 429,
  pas_publique: 404,
  pas_une_page: 422,
  page_trop_grosse: 413,
  vide: 422,
  delai: 504,
  indisponible: 502,
};

export const CORPS_MAX = 4096;

export interface DepsLien {
  env: Record<string, string | undefined>;
  /** Identifiant de la personne connectée (invités acceptés), ou null. */
  utilisateur(): Promise<string | null>;
  quota: QuotaNotion;
  recuperer(pageId: string): Promise<ResultatRecuperation & { appels?: number }>;
  maintenant?: () => number;
  journal?: (evenement: string, donnees: { code: string; ms: number; blocs?: number }) => void;
}

function json(statut: number, corps: unknown): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

const erreur = (code: CodeLien) => json(STATUTS[code], { ok: false, code });

export async function traiterLienNotion(request: Request, deps: DepsLien): Promise<Response> {
  const maintenant = deps.maintenant ?? Date.now;
  const debut = maintenant();
  const journal = (code: string, blocs?: number) => deps.journal?.("notion_lien", { code, ms: maintenant() - debut, blocs });

  if (deps.env.NOTION_LIEN_ACTIF === "0") return erreur("desactive");
  if (!origineAcceptee(request.headers.get("origin"), deps.env)) return erreur("origine_refusee");
  const userId = await deps.utilisateur().catch(() => null);
  if (!userId) return erreur("non_connecte");

  const brut = await request.text().catch(() => "");
  if (!brut || new TextEncoder().encode(brut).length > CORPS_MAX) return erreur("lien_invalide");
  let lien: unknown;
  try {
    lien = (JSON.parse(brut) as { lien?: unknown })?.lien;
  } catch {
    return erreur("lien_invalide");
  }
  if (typeof lien !== "string") return erreur("lien_invalide");
  const lu = lireLienNotion(lien);
  if (!lu.ok) return erreur(lu.code);

  // Le quota se consomme après la validation du lien (un lien mal collé ne coûte rien), avant l'appel à Notion.
  const autorise = await deps.quota.consommer(userId).catch(() => false);
  if (!autorise) {
    journal("quota");
    return erreur("quota");
  }

  const resultat = await deps.recuperer(lu.pageId).catch(() => ({ ok: false as const, code: "indisponible" as const }));
  if (!resultat.ok) {
    journal(resultat.code);
    return erreur(resultat.code);
  }
  journal("ok", resultat.blocs);
  return json(200, { ok: true, texte: resultat.texte });
}
