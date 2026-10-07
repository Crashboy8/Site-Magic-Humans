// Appel de la route API (§3.6, §10.1). Aucune clé ici : la clé du fournisseur reste sur le serveur.
import { BASE_PATH } from "@/lib/config";
import type { Cadrage, Demande, ResultatClasse } from "@/domain/maCible/types";

export const URL_API = `${BASE_PATH}/api/ma-cible/`;
/** Délai côté client : au-dessus du résultat (240 s), en dessous de `maxDuration` (300 s). */
export const DELAI_CLIENT_MS = 270_000;

export type CodeErreur =
  | "reseau"
  | "entree_invalide"
  | "trop_long"
  | "origine_refusee"
  | "quota_ip"
  | "quota_global"
  | "ia_invalide"
  | "ia_indisponible"
  | "config_manquante"
  | "inconnue";

export type ReponseApi =
  | { ok: true; cadrage: Cadrage }
  | { ok: true; resultat: ResultatClasse }
  | { ok: false; code: CodeErreur; max?: number };

const CODES: readonly CodeErreur[] = ["entree_invalide", "trop_long", "origine_refusee", "quota_ip", "quota_global", "ia_invalide", "ia_indisponible", "config_manquante"];

export async function appelerApi(demande: Demande, signal?: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<ReponseApi> {
  const controleur = new AbortController();
  const delai = setTimeout(() => controleur.abort(), DELAI_CLIENT_MS);
  const annuler = () => controleur.abort();
  signal?.addEventListener("abort", annuler);
  try {
    const r = await fetchImpl(URL_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(demande),
      signal: controleur.signal,
    });
    let json: unknown;
    try {
      json = await r.json();
    } catch {
      return { ok: false, code: r.status >= 500 ? "ia_indisponible" : "inconnue" };
    }
    const o = (typeof json === "object" && json !== null ? json : {}) as Record<string, unknown>;
    if (r.ok && o.ok === true) {
      if (o.etape === "cadrage" && o.cadrage) return { ok: true, cadrage: o.cadrage as Cadrage };
      if (o.etape === "resultat" && o.resultat) return { ok: true, resultat: o.resultat as ResultatClasse };
      return { ok: false, code: "inconnue" };
    }
    const code = (CODES as readonly unknown[]).includes(o.code) ? (o.code as CodeErreur) : "inconnue";
    return { ok: false, code, max: typeof o.max === "number" ? o.max : undefined };
  } catch {
    // Délai dépassé (ou annulation) : `ia_indisponible` ; sinon la connexion est perdue.
    return { ok: false, code: controleur.signal.aborted && !signal?.aborted ? "ia_indisponible" : "reseau" };
  } finally {
    clearTimeout(delai);
    signal?.removeEventListener("abort", annuler);
  }
}
