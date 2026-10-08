import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { HOTES, recupererPageNotion, type FetchNotion } from "./recuperer";

const dir = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__");
const brut = (n: string) => readFileSync(join(dir, n));
const { pageId } = JSON.parse(brut("page.json").toString()) as { pageId: string };

function reponse(corps: Buffer | string, statut = 200): Response {
  return new Response(typeof corps === "string" ? corps : new Uint8Array(corps), { status: statut, headers: { "content-type": "application/json" } });
}

/** fetch simulé : enchaîne les fixtures dans l'ordre, et note chaque appel. */
function fetchFixture(sequence: (Buffer | { statut: number })[], appels: { url: string; corps: string }[]): FetchNotion {
  let i = 0;
  return async (url, init) => {
    appels.push({ url, corps: String(init.body) });
    const etape = sequence[i++] ?? sequence[sequence.length - 1];
    if (Buffer.isBuffer(etape)) return reponse(etape);
    return reponse("{}", (etape as { statut: number }).statut);
  };
}

describe("recupererPageNotion", () => {
  it("enchaîne loadPageChunk puis deux tours de syncRecordValues", async () => {
    const appels: { url: string; corps: string }[] = [];
    const r = await recupererPageNotion(pageId, {
      fetch: fetchFixture([brut("loadPageChunk-0.json"), brut("syncRecordValues-1.json"), brut("syncRecordValues-2.json")], appels),
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.texte).toContain("L'Architecte des Liens");
    expect(appels.map((a) => a.url.replace(/.*\/api\/v3\//, ""))).toEqual(["loadPageChunk", "syncRecordValues", "syncRecordValues"]);
    expect(appels.every((a) => HOTES.some((h) => a.url.startsWith(h)))).toBe(true);
    expect(appels.every((a) => !a.corps.includes("notion.site"))).toBe(true);
  });

  it("pagine quand cursor.stack n'est pas vide", async () => {
    const appels: { url: string; corps: string }[] = [];
    const premier = JSON.parse(brut("loadPageChunk-0.json").toString());
    premier.cursor = { stack: [["suite"]] };
    const fetch: FetchNotion = async (url, init) => {
      appels.push({ url, corps: String(init.body) });
      const corps = appels.length === 1 ? JSON.stringify(premier) : brut(appels.length === 2 ? "loadPageChunk-0.json" : appels.length === 3 ? "syncRecordValues-1.json" : "syncRecordValues-2.json");
      return reponse(corps);
    };
    const r = await recupererPageNotion(pageId, { fetch });
    expect(r.ok).toBe(true);
    const corps = appels.map((a) => JSON.parse(a.corps));
    expect(corps[1].chunkNumber).toBe(1);
    expect(corps[1].cursor.stack).toEqual([["suite"]]);
  });

  it("une page non publique renvoie pas_publique", async () => {
    const r = await recupererPageNotion(pageId, { fetch: fetchFixture([brut("pas-publique.json")], []) });
    expect(r).toEqual({ ok: false, code: "pas_publique" });
  });

  it("un 500 sur www.notion.so bascule sur app.notion.com", async () => {
    const appels: { url: string; corps: string }[] = [];
    let n = 0;
    const fetch: FetchNotion = async (url, init) => {
      appels.push({ url, corps: String(init.body) });
      if (url.startsWith(HOTES[0]) && n++ === 0) return reponse("{}", 500);
      const nom = appels.length === 2 ? "loadPageChunk-0.json" : appels.length === 3 ? "syncRecordValues-1.json" : "syncRecordValues-2.json";
      return reponse(brut(nom));
    };
    const r = await recupererPageNotion(pageId, { fetch });
    expect(r.ok).toBe(true);
    expect(appels[0].url.startsWith(HOTES[0])).toBe(true);
    expect(appels[1].url.startsWith(HOTES[1])).toBe(true);
  });

  it("un 4xx sur loadPageChunk bascule sur loadCachedPageChunk", async () => {
    const appels: { url: string; corps: string }[] = [];
    let n = 0;
    const fetch: FetchNotion = async (url, init) => {
      appels.push({ url, corps: String(init.body) });
      if (url.endsWith("loadPageChunk") && n++ === 0) return reponse("{}", 400);
      const nom = url.endsWith("loadCachedPageChunk") ? "loadPageChunk-0.json" : appels.length === 3 ? "syncRecordValues-1.json" : "syncRecordValues-2.json";
      return reponse(brut(nom));
    };
    const r = await recupererPageNotion(pageId, { fetch });
    expect(r.ok).toBe(true);
    expect(appels[1].url).toContain("loadCachedPageChunk");
  });

  it("une réponse de 6 Mo renvoie page_trop_grosse", async () => {
    const gros = Buffer.from(`{"x":"${"a".repeat(6 * 1024 * 1024)}"}`);
    const r = await recupererPageNotion(pageId, { fetch: async () => reponse(gros) });
    expect(r).toEqual({ ok: false, code: "page_trop_grosse" });
  });

  it("un délai dépassé renvoie delai", async () => {
    const r = await recupererPageNotion(pageId, {
      fetch: () => new Promise(() => {}),
      maintenant: (() => {
        let n = 0;
        return () => (n++ === 0 ? 0 : 20_000);
      })(),
    });
    expect(r).toEqual({ ok: false, code: "delai" });
  });

  it("du HTML au lieu de JSON renvoie indisponible", async () => {
    const r = await recupererPageNotion(pageId, { fetch: async () => reponse("<html>non</html>") });
    expect(r).toEqual({ ok: false, code: "indisponible" });
  });

  it("s'arrête au bout de 20 appels", async () => {
    let n = 0;
    const fetch: FetchNotion = async () => {
      n++;
      return reponse(JSON.stringify({ cursor: { stack: [["encore"]] }, recordMap: { block: {} } }));
    };
    const r = await recupererPageNotion(pageId, { fetch });
    expect(n).toBeLessThanOrEqual(20);
    expect(r.ok).toBe(false);
  });

  it("ne jette jamais d'erreur", async () => {
    const r = await recupererPageNotion(pageId, { fetch: vi.fn(async () => { throw new Error("réseau"); }) });
    expect(r).toEqual({ ok: false, code: "indisponible" });
  });
});
