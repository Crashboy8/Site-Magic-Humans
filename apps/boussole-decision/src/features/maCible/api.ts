// Appel de la route API (§3.6, §10.1). Aucune clé ici : la clé du fournisseur reste sur le serveur.
import { CLE_SESSION_NAVIGATEUR, CLE_TEST_NAVIGATEUR, ENTETE_SESSION, ENTETE_TEST, PARAM_TEST, sessionValide } from "@/domain/maCible/acces";
import type { CompteMasques } from "@/domain/maCible/masquage";
import type { Cadrage, Demande, ResultatClasse, SyntheseTerrain } from "@/domain/maCible/types";
import { BASE_PATH } from "@/lib/config";

export const URL_API = `${BASE_PATH}/api/ma-cible/`;
/**
 * Délai côté client : au-dessus du résultat (240 s), en dessous de `maxDuration` (300 s).
 * S'il se déclenche, le code est `ia_indisponible` (« L'IA ne répond pas »).
 * `reseau` (« Connexion perdue ») veut dire que le fetch a été rejeté avant ce délai :
 * la connexion a été coupée par le réseau, un proxy ou l'hôte, sans réponse JSON.
 */
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
  | {
      ok: true;
      synthese: Omit<SyntheseTerrain, "faitLe"> | null;
      statut: "ok" | "inutilisable";
      message: string;
      masques: CompteMasques;
      restant: number;
    }
  | { ok: false; code: CodeErreur; max?: number };

const CODES: readonly CodeErreur[] = ["entree_invalide", "trop_long", "origine_refusee", "quota_ip", "quota_global", "ia_invalide", "ia_indisponible", "config_manquante"];

/** Lit `?cle=` une fois, le retire de l'adresse et le garde pour les appels de cet onglet. */
export function preparerAccesTest(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const cle = url.searchParams.get(PARAM_TEST);
  if (!cle) return;
  window.sessionStorage.setItem(CLE_TEST_NAVIGATEUR, cle);
  url.searchParams.delete(PARAM_TEST);
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}

function entetesAppel(): Record<string, string> {
  const entetes: Record<string, string> = { "content-type": "application/json" };
  if (typeof window === "undefined") return entetes;
  let session = sessionValide(window.sessionStorage.getItem(CLE_SESSION_NAVIGATEUR));
  if (!session) {
    session = crypto.randomUUID();
    window.sessionStorage.setItem(CLE_SESSION_NAVIGATEUR, session);
  }
  entetes[ENTETE_SESSION] = session;
  const cle = window.sessionStorage.getItem(CLE_TEST_NAVIGATEUR);
  if (cle) entetes[ENTETE_TEST] = cle;
  return entetes;
}

/** Dernier objet JSON du corps. Les lignes vides sont les battements qui gardent la connexion ouverte. */
export function lireJsonReponse(texte: string): unknown {
  const lignes = texte
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  for (let i = lignes.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(lignes[i]);
    } catch {
      // Ligne de battement ou fragment : on remonte.
    }
  }
  throw new SyntaxError("json");
}

export async function appelerApi(demande: Demande, signal?: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<ReponseApi> {
  const controleur = new AbortController();
  const delai = setTimeout(() => controleur.abort(), DELAI_CLIENT_MS);
  const annuler = () => controleur.abort();
  signal?.addEventListener("abort", annuler);
  try {
    const r = await fetchImpl(URL_API, {
      method: "POST",
      headers: entetesAppel(),
      body: JSON.stringify(demande),
      signal: controleur.signal,
    });
    let json: unknown;
    try {
      json = lireJsonReponse(await r.text());
    } catch {
      return { ok: false, code: r.status >= 500 ? "ia_indisponible" : "inconnue" };
    }
    const o = (typeof json === "object" && json !== null ? json : {}) as Record<string, unknown>;
    if (r.ok && o.ok === true) {
      if (o.etape === "cadrage" && o.cadrage) return { ok: true, cadrage: o.cadrage as Cadrage };
      if (o.etape === "resultat" && o.resultat) return { ok: true, resultat: o.resultat as ResultatClasse };
      if (o.etape === "synthese" && (o.statut === "ok" || o.statut === "inutilisable")) {
        const m = (typeof o.masques === "object" && o.masques !== null ? o.masques : {}) as Record<string, unknown>;
        return {
          ok: true,
          synthese: (o.synthese ?? null) as Omit<SyntheseTerrain, "faitLe"> | null,
          statut: o.statut,
          message: typeof o.message === "string" ? o.message : "",
          masques: {
            mails: typeof m.mails === "number" ? m.mails : 0,
            telephones: typeof m.telephones === "number" ? m.telephones : 0,
            liens: typeof m.liens === "number" ? m.liens : 0,
          },
          restant: typeof o.restant === "number" ? o.restant : 0,
        };
      }
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
