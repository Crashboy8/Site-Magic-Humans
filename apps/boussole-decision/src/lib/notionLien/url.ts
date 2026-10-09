// Lecture d'un lien de page Notion : on n'en garde que l'identifiant (cahier D.6). Module pur.

export type LienNotion = { ok: true; pageId: string } | { ok: false; code: "lien_invalide" | "pas_notion" };

const HOTES_FIXES = new Set(["notion.so", "www.notion.so", "notion.site", "notion.com", "www.notion.com", "app.notion.com"]);
const SOUS_DOMAINE = /^[a-z0-9-]{1,63}\.notion\.site$/;

/** Lien collé → identifiant de page au format 8-4-4-4-12, ou un code d'erreur. */
export function lireLienNotion(brut: string): LienNotion {
  const t = brut.trim();
  if (!t || t.length > 2048) return { ok: false, code: "lien_invalide" };
  let url: URL;
  try {
    url = new URL(t);
  } catch {
    return { ok: false, code: "lien_invalide" };
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return { ok: false, code: "pas_notion" };
  const hote = url.hostname.toLowerCase();
  if (!HOTES_FIXES.has(hote) && !SOUS_DOMAINE.test(hote)) return { ok: false, code: "pas_notion" };
  const param = (url.searchParams.get("p") ?? "").replace(/-/g, "").toLowerCase();
  // Dernier groupe de 32 caractères hexadécimaux : on prend la fin d'une suite plus longue (« Camille0f1c… »).
  const suites = url.pathname.replace(/-/g, "").toLowerCase().match(/[0-9a-f]{32,}/g);
  const derniere = suites?.[suites.length - 1];
  const h = /^[0-9a-f]{32}$/.test(param) ? param : derniere?.slice(-32);
  if (!h) return { ok: false, code: "lien_invalide" };
  return { ok: true, pageId: `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}` };
}
