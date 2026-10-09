import { describe, expect, it, vi } from "vitest";
import type { QuotaNotion } from "./quota";
import { traiterLienNotion, type DepsLien } from "./traitement";

const LIEN = "https://camille-exemple.notion.site/Talent-Camille-0f1c2a3b4d5e4f608a7192b3c4d5e6f7?pvs=4";
const env = { NEXT_PUBLIC_SITE_URL: "http://localhost:3000", VERCEL_ENV: "development" };

function requete(corps: string | null, options: { origin?: string; taille?: number } = {}): Request {
  const init: RequestInit = { method: "POST", headers: { origin: options.origin ?? "http://localhost:3000" } };
  if (options.taille) init.body = "a".repeat(options.taille);
  else if (corps !== null) init.body = corps;
  return new Request("http://localhost:3000/boussole-decision/api/fiche/notion/", init);
}

function deps(parDessus: Partial<DepsLien> = {}): DepsLien & { quotaAppel: { n: number }; journalAppel: unknown[] } {
  const quotaAppel = { n: 0 };
  const journalAppel: unknown[] = [];
  const quota: QuotaNotion = { async consommer() { quotaAppel.n++; return true; } };
  return {
    env,
    async utilisateur() { return "11111111-1111-1111-1111-111111111111"; },
    quota,
    async recuperer() { return { ok: true, texte: "texte de la page", blocs: 4 }; },
    journal: (e, d) => journalAppel.push({ e, d }),
    quotaAppel,
    journalAppel,
    ...parDessus,
  };
}

const code = async (r: Response) => ((await r.json()) as { code?: string; ok: boolean }).code ?? "ok";

describe("traiterLienNotion", () => {
  it("désactivée", async () => {
    const d = deps({ env: { ...env, NOTION_LIEN_ACTIF: "0" } });
    expect(await code(await traiterLienNotion(requete(JSON.stringify({ lien: LIEN })), d))).toBe("desactive");
    expect((await traiterLienNotion(requete(JSON.stringify({ lien: LIEN })), d)).status).toBe(503);
  });
  it("origine refusée", async () => {
    const r = await traiterLienNotion(requete(JSON.stringify({ lien: LIEN }), { origin: "https://pirate.example" }), deps());
    expect(r.status).toBe(403);
  });
  it("sans session", async () => {
    const r = await traiterLienNotion(requete(JSON.stringify({ lien: LIEN })), deps({ async utilisateur() { return null; } }));
    expect(r.status).toBe(401);
  });
  it("corps trop gros", async () => {
    const d = deps();
    const r = await traiterLienNotion(requete(null, { taille: 5000 }), d);
    expect(r.status).toBe(400);
    expect(d.quotaAppel.n).toBe(0);
  });
  it("lien refusé : le quota n'est pas consommé", async () => {
    const d = deps();
    const r = await traiterLienNotion(requete(JSON.stringify({ lien: "https://exemple.com/page" })), d);
    expect(await code(r)).toBe("pas_notion");
    expect(d.quotaAppel.n).toBe(0);
  });
  it("quota épuisé", async () => {
    const d = deps({ quota: { async consommer() { return false; } } });
    const r = await traiterLienNotion(requete(JSON.stringify({ lien: LIEN })), d);
    expect(r.status).toBe(429);
  });
  it("succès : renvoie le texte, et le journal ne reçoit ni le lien ni le texte", async () => {
    const d = deps();
    const r = await traiterLienNotion(requete(JSON.stringify({ lien: LIEN })), d);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, texte: "texte de la page" });
    expect(JSON.stringify(d.journalAppel)).not.toContain("notion.site");
    expect(JSON.stringify(d.journalAppel)).not.toContain("texte de la page");
    expect(d.quotaAppel.n).toBe(1);
  });
  it("un lien mal formé ne touche ni au quota ni à la base", async () => {
    const d = deps();
    await traiterLienNotion(requete("{pas du json"), d);
    expect(d.quotaAppel.n).toBe(0);
    expect(vi.fn()).not.toHaveBeenCalled();
  });
});
