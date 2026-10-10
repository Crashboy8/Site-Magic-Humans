import { describe, expect, it } from "vitest";
import type { PlanEdite } from "@/domain/maCible/planEdite";
import { CORPS_PLAN_MAX, traiterPlan, type DependancesPlan } from "./planTraitement";

const URL_API = "https://www.magichumans.com/boussole-decision/api/ma-cible/plan/";
const PLAN: PlanEdite = { v: 1, maj: "2026-10-10T10:00:00.000Z", resultatLe: "2026-10-09T08:00:00Z", blocs: [{ id: "s0", type: "titre", texte: "🎯 **Départ**" }] };

function deps(p: Partial<DependancesPlan> = {}) {
  const ecrits: (PlanEdite | null)[] = [];
  const d: DependancesPlan = {
    session: async () => ({ userId: "u1" }),
    lire: async () => PLAN,
    ecrire: async (_id, plan) => {
      ecrits.push(plan);
      return "ok";
    },
    env: {},
    maintenant: () => new Date("2026-10-10T10:00:00Z"),
    ...p,
  };
  return { d, ecrits };
}
const put = (corps: string, origin: string | null = "https://www.magichumans.com") =>
  new Request(URL_API, { method: "PUT", body: corps, headers: origin ? { origin, "content-type": "application/json" } : { "content-type": "application/json" } });

describe("route api/ma-cible/plan", () => {
  it("sans compte, répond compte: false et ne lit rien", async () => {
    let lu = false;
    const { d } = deps({ session: async () => null, lire: async () => ((lu = true), PLAN) });
    const r = await traiterPlan(new Request(URL_API), d);
    expect(await r.json()).toEqual({ compte: false });
    expect(lu).toBe(false);
    expect(r.headers.get("cache-control")).toBe("no-store");
  });
  it("connecté : lit le plan du compte", async () => {
    const r = await traiterPlan(new Request(URL_API), deps().d);
    expect(await r.json()).toEqual({ compte: true, table: true, plan: PLAN });
  });
  it("table absente : compte: true, table: false", async () => {
    expect(await (await traiterPlan(new Request(URL_API), deps({ lire: async () => "absente" }).d)).json()).toEqual({ compte: true, table: false });
    expect(await (await traiterPlan(put(JSON.stringify({ plan: PLAN })), deps({ ecrire: async () => "absente" }).d)).json()).toEqual({ compte: true, table: false });
  });
  it("enregistre un plan valide, nettoyé", async () => {
    const { d, ecrits } = deps();
    const sale = { ...PLAN, blocs: [{ id: "s0", type: "titre", texte: "## Titre\u0000" }] };
    const r = await traiterPlan(put(JSON.stringify({ plan: sale })), d);
    expect(await r.json()).toEqual({ compte: true, table: true });
    expect(ecrits[0]?.blocs[0]).toEqual({ id: "s0", type: "titre", texte: "Titre" });
  });
  it("retire le plan avec null", async () => {
    const { d, ecrits } = deps();
    await traiterPlan(put(JSON.stringify({ plan: null })), d);
    expect(ecrits).toEqual([null]);
  });
  it("refuse une origine inconnue, un JSON cassé, un plan invalide, un corps trop gros et une autre méthode", async () => {
    const { d, ecrits } = deps();
    expect((await traiterPlan(put(JSON.stringify({ plan: PLAN }), "https://evil.example"), d)).status).toBe(403);
    expect((await traiterPlan(put(JSON.stringify({ plan: PLAN }), null), d)).status).toBe(403);
    expect((await traiterPlan(put("{"), d)).status).toBe(400);
    expect((await traiterPlan(put(JSON.stringify({ plan: { v: 3 } })), d)).status).toBe(400);
    expect((await traiterPlan(put(JSON.stringify({})), d)).status).toBe(400);
    expect((await traiterPlan(put("x".repeat(CORPS_PLAN_MAX + 1)), d)).status).toBe(400);
    expect((await traiterPlan(new Request(URL_API, { method: "POST" }), d)).status).toBe(405);
    expect(ecrits).toEqual([]);
  });
  it("répond 503 si la base échoue", async () => {
    const r = await traiterPlan(new Request(URL_API), deps({ lire: async () => Promise.reject(new Error("boom")) }).d);
    expect(r.status).toBe(503);
  });
});
