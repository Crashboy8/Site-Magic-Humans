// Lecture d'une page Notion publique par son identifiant (cahier D.6). Aucune clé, aucun cookie.
// On n'appelle jamais l'adresse donnée par la personne : seulement deux hôtes fixes.
import { blocsVersTexte, idsManquants, type Blocs } from "./blocs";

export const HOTES = ["https://www.notion.so/api/v3/", "https://app.notion.com/api/v3/"] as const;
export const DELAI_TOTAL = 12_000;
export const DELAI_APPEL = 6_000;
export const APPELS_MAX = 20;
export const OCTETS_REPONSE = 5 * 1024 * 1024;
export const OCTETS_TOTAL = 15 * 1024 * 1024;
export const MORCEAUX_MAX = 10;
export const TOURS_MAX = 5;
export const BLOCS_MAX = 3000;
export const TEXTE_MIN = 80;

export type CodeRecuperation = "pas_publique" | "pas_une_page" | "page_trop_grosse" | "vide" | "delai" | "indisponible";
export type ResultatRecuperation = { ok: true; texte: string; blocs: number } | { ok: false; code: CodeRecuperation };

export interface FetchNotion {
  (url: string, init: RequestInit): Promise<Response>;
}

interface ReponseNotion {
  cursor?: { stack?: unknown[] };
  recordMap?: { block?: Blocs };
}

const ENTETES = {
  "content-type": "application/json",
  "user-agent": "MagicHumans-MonEspace/1.0 (+https://www.magichumans.com/confidentialite/)",
};

/** Lit une réponse JSON en flux, avec un plafond d'octets. */
async function lireJson(reponse: Response, plafond: number): Promise<{ ok: true; json: ReponseNotion; octets: number } | { ok: false; raison: "gros" | "json" }> {
  const lecteur = reponse.body?.getReader();
  if (!lecteur) return { ok: false, raison: "json" };
  const morceaux: Uint8Array[] = [];
  let octets = 0;
  for (;;) {
    const { done, value } = await lecteur.read();
    if (done) break;
    octets += value.byteLength;
    if (octets > plafond) {
      await lecteur.cancel();
      return { ok: false, raison: "gros" };
    }
    morceaux.push(value);
  }
  try {
    const texte = new TextDecoder().decode(Buffer.concat(morceaux));
    return { ok: true, json: JSON.parse(texte) as ReponseNotion, octets };
  } catch {
    return { ok: false, raison: "json" };
  }
}

export interface OptionsRecuperation {
  fetch: FetchNotion;
  maintenant?: () => number;
}

/** Récupère le texte d'une page Notion publique. `pageId` est déjà validé par lireLienNotion. */
export async function recupererPageNotion(pageId: string, options: OptionsRecuperation): Promise<ResultatRecuperation> {
  const maintenant = options.maintenant ?? Date.now;
  const debut = maintenant();
  const blocs: Blocs = {};
  let appels = 0;
  let octetsTotal = 0;
  let tropGros = false;

  async function appel(chemin: string, corps: unknown): Promise<ReponseNotion | "hote" | "json" | "gros" | "delai"> {
    if (maintenant() - debut > DELAI_TOTAL) return "delai";
    if (appels >= APPELS_MAX) return "delai";
    for (let h = 0; h < HOTES.length; h++) {
      const url = HOTES[h] + chemin;
      const reste = DELAI_TOTAL - (maintenant() - debut);
      if (reste <= 0) return "delai";
      appels++;
      let reponse: Response;
      try {
        reponse = await options.fetch(url, {
          method: "POST",
          headers: ENTETES,
          body: JSON.stringify(corps),
          redirect: "error",
          cache: "no-store",
          signal: AbortSignal.timeout(Math.min(DELAI_APPEL, reste)),
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === "TimeoutError") return "delai";
        if (h === 0) continue;
        return "hote";
      }
      if (!reponse.ok) {
        if (reponse.status === 429 || reponse.status === 403 || reponse.status >= 500) {
          if (h === 0) continue;
          return "hote";
        }
        return "hote";
      }
      const lu = await lireJson(reponse, OCTETS_REPONSE);
      if (!lu.ok) {
        if (lu.raison === "json") return "json";
        tropGros = true;
        return "gros";
      }
      octetsTotal += lu.octets;
      if (octetsTotal > OCTETS_TOTAL) {
        tropGros = true;
        return "gros";
      }
      return lu.json;
    }
    return "hote";
  }

  // loadPageChunk, puis loadCachedPageChunk en secours au premier morceau si 4xx.
  let curseur: { stack: unknown[] } = { stack: [] };
  let morceau = 0;
  let chemin = "loadPageChunk";
  for (;;) {
    const corps = { pageId, limit: 100, cursor: curseur, chunkNumber: morceau, verticalColumns: false };
    const rep = await appel(chemin, corps);
    if (rep === "delai") return { ok: false, code: "delai" };
    if (rep === "gros") return { ok: false, code: "page_trop_grosse" };
    if (rep === "json") return { ok: false, code: "indisponible" };
    if (rep === "hote") {
      if (chemin === "loadPageChunk" && morceau === 0) {
        chemin = "loadCachedPageChunk";
        continue;
      }
      return { ok: false, code: "indisponible" };
    }
    Object.assign(blocs, rep.recordMap?.block ?? {});
    const pile = rep.cursor?.stack ?? [];
    morceau++;
    if (!pile.length || morceau >= MORCEAUX_MAX) break;
    curseur = { stack: pile };
  }

  if (!(pageId in blocs)) return { ok: false, code: "pas_publique" };
  const racine = (blocs[pageId] as { value?: { value?: { type?: string; alive?: boolean }; type?: string; alive?: boolean } }).value;
  const v = racine?.value && typeof racine.value === "object" ? racine.value : racine;
  if (v?.type === "collection_view_page" || v?.type === "collection_view") return { ok: false, code: "pas_une_page" };
  if (v?.alive === false) return { ok: false, code: "pas_publique" };

  for (let tour = 0; tour < TOURS_MAX; tour++) {
    const manquants = idsManquants(blocs, pageId);
    if (!manquants.length) break;
    const rep = await appel("syncRecordValues", {
      requests: manquants.slice(0, 100).map((id) => ({ pointer: { table: "block", id }, version: -1 })),
    });
    if (rep === "delai") return { ok: false, code: "delai" };
    if (rep === "gros") return { ok: false, code: "page_trop_grosse" };
    if (rep === "json" || rep === "hote") return { ok: false, code: "indisponible" };
    Object.assign(blocs, rep.recordMap?.block ?? {});
  }

  if (Object.keys(blocs).length > BLOCS_MAX) return { ok: false, code: "page_trop_grosse" };
  if (tropGros) return { ok: false, code: "page_trop_grosse" };
  const texte = blocsVersTexte(blocs, pageId);
  if (texte.trim().length < TEXTE_MIN) return { ok: false, code: "vide" };
  return { ok: true, texte, blocs: Object.keys(blocs).length };
}
