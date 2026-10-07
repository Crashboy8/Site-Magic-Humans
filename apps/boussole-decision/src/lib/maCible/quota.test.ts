import { describe, expect, it, vi } from "vitest";
import { jourParis, LIMITES_DEFAUT, limitesDepuisEnv, minuitSuivantParis, quotaMemoire, quotaSupabase, type Limites } from "./quota";

const limites: Limites = { ipCadrage: 2, ipResultat: 3, globalCadrage: 5, globalResultat: 4 };
const cle = (c: string) => c.padEnd(64, "0");

describe("quotaMemoire", () => {
  it("accepte max appels puis refuse pour l'IP", async () => {
    const q = quotaMemoire({ ...limites, globalResultat: 50 }, () => new Date("2026-10-10T10:00:00Z"));
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 2 });
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 1 });
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 0 });
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: false, motif: "ip", restant: 0 });
    expect((await q.consommer(cle("b"), "resultat")).ok).toBe(true);
  });

  it("applique le plafond global à tous les visiteurs", async () => {
    const q = quotaMemoire(limites, () => new Date("2026-10-10T10:00:00Z"));
    for (let i = 0; i < 4; i++) expect((await q.consommer(cle(`ip${i}`), "resultat")).ok).toBe(true);
    expect(await q.consommer(cle("ip9"), "resultat")).toEqual({ ok: false, motif: "global", restant: 0 });
  });

  it("sépare les étapes", async () => {
    const q = quotaMemoire(limites, () => new Date("2026-10-10T10:00:00Z"));
    await q.consommer(cle("a"), "cadrage");
    await q.consommer(cle("a"), "cadrage");
    expect((await q.consommer(cle("a"), "cadrage")).ok).toBe(false);
    expect((await q.consommer(cle("a"), "resultat")).ok).toBe(true);
  });

  it("le défaut autorise 15 résultats et 30 cadrages par adresse", async () => {
    const q = quotaMemoire(LIMITES_DEFAUT, () => new Date("2026-10-10T10:00:00Z"));
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: true, restant: 15 });
    for (let i = 0; i < 15; i++) expect((await q.consommer(cle("a"), "resultat")).ok).toBe(true);
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: false, motif: "ip", restant: 0 });
    expect((await q.consommer(cle("b"), "resultat")).ok).toBe(true);
    for (let i = 0; i < 30; i++) expect((await q.consommer(cle("a"), "cadrage")).ok).toBe(true);
    expect(await q.consommer(cle("a"), "cadrage")).toMatchObject({ ok: false, motif: "ip" });
  });

  it("un petit plafond global refuse tout le monde avant le plafond personnel", async () => {
    const q = quotaMemoire({ ...LIMITES_DEFAUT, globalResultat: 2 }, () => new Date("2026-10-10T10:00:00Z"));
    expect((await q.consommer(cle("a"), "resultat")).ok).toBe(true);
    expect((await q.consommer(cle("b"), "resultat")).ok).toBe(true);
    expect(await q.consommer(cle("c"), "resultat")).toEqual({ ok: false, motif: "global", restant: 0 });
  });

  it("un plafond personnel à 0 refuse avant l'appel", async () => {
    const q = quotaMemoire({ ...limites, ipResultat: 0, globalResultat: 50 }, () => new Date("2026-10-10T10:00:00Z"));
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: false, motif: "ip", restant: 0 });
  });

  it("autoriser lit le compteur sans l'incrémenter", async () => {
    const q = quotaMemoire({ ...limites, globalResultat: 50 }, () => new Date("2026-10-10T10:00:00Z"));
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: true, restant: 3 });
    await q.consommer(cle("a"), "resultat");
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: true, restant: 2 });
    await q.consommer(cle("a"), "resultat");
    await q.consommer(cle("a"), "resultat");
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: false, motif: "ip", restant: 0 });
    expect(await q.autoriser(cle("a"), "cadrage")).toEqual({ ok: true, restant: 2 });
  });

  it("repart de zéro à minuit, heure de Paris", async () => {
    let maintenant = new Date("2026-10-10T21:30:00Z"); // 23 h 30 à Paris (UTC+2)
    const q = quotaMemoire(limites, () => maintenant);
    await q.consommer(cle("a"), "cadrage");
    await q.consommer(cle("a"), "cadrage");
    expect((await q.consommer(cle("a"), "cadrage")).ok).toBe(false);
    maintenant = new Date("2026-10-10T22:30:00Z"); // 0 h 30 le lendemain à Paris
    expect((await q.consommer(cle("a"), "cadrage")).ok).toBe(true);
  });
});

describe("jours et limites", () => {
  it("jourParis suit la date civile à Paris", () => {
    expect(jourParis(new Date("2026-10-10T21:59:00Z"))).toBe("2026-10-10");
    expect(jourParis(new Date("2026-10-10T22:00:00Z"))).toBe("2026-10-11");
    expect(jourParis(new Date("2026-12-10T22:30:00Z"))).toBe("2026-12-10"); // hiver : UTC+1
  });
  it("minuitSuivantParis", () => {
    expect(minuitSuivantParis(new Date("2026-10-10T10:00:00Z")).toISOString()).toBe("2026-10-10T22:00:00.000Z");
    expect(minuitSuivantParis(new Date("2026-12-10T10:00:00Z")).toISOString()).toBe("2026-12-10T23:00:00.000Z");
  });
  it("limitesDepuisEnv : 15 résultats et 30 cadrages, surcharge possible", () => {
    expect(limitesDepuisEnv({})).toEqual(LIMITES_DEFAUT);
    expect(LIMITES_DEFAUT).toEqual({ ipCadrage: 30, ipResultat: 15, globalCadrage: 2000, globalResultat: 500 });
    expect(limitesDepuisEnv({ MA_CIBLE_MAX_IP_CADRAGE: "40", MA_CIBLE_MAX_IP_RESULTAT: "12", MA_CIBLE_MAX_GLOBAL_RESULTAT: "abc" })).toEqual({
      ipCadrage: 40,
      ipResultat: 12,
      globalCadrage: 2000,
      globalResultat: 500,
    });
    expect(limitesDepuisEnv({ MA_CIBLE_MAX_PAR_IP: "4", MA_CIBLE_MAX_IP_RESULTAT: "0", MA_CIBLE_MAX_IP_CADRAGE: "non" })).toEqual(LIMITES_DEFAUT);
    expect(limitesDepuisEnv({ MA_CIBLE_MAX_GLOBAL_CADRAGE: "40", MA_CIBLE_MAX_GLOBAL_RESULTAT: "120" })).toMatchObject({
      ipCadrage: 30,
      ipResultat: 15,
      globalCadrage: 40,
      globalResultat: 120,
    });
  });
});

describe("quotaSupabase", () => {
  const secours = () => ({
    autoriser: vi.fn(async () => ({ ok: true, restant: 99 })),
    consommer: vi.fn(async () => ({ ok: true, restant: 99 })),
  });

  it("réponse OK : appelle la fonction SQL avec les plafonds", async () => {
    const rpc = vi.fn(async () => ({ data: [{ ok: true, motif: null, n_ip: 1, n_global: 7 }], error: null }));
    const s = secours();
    const q = quotaSupabase({ rpc } as never, limites, s);
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 2 });
    expect(rpc).toHaveBeenCalledWith("ma_cible_consommer", { p_cle: cle("a"), p_etape: "resultat", p_max_ip: 3, p_max_global: 4 });
    expect(s.consommer).not.toHaveBeenCalled();
  });

  it("autoriser interroge la fonction de lecture, pas celle qui incrémente", async () => {
    const rpc = vi.fn(async () => ({ data: [{ ok: true, motif: null, n_ip: 1, n_global: 2 }], error: null }));
    const q = quotaSupabase({ rpc } as never, limites, secours());
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: true, restant: 2 });
    expect(rpc).toHaveBeenCalledWith("ma_cible_autoriser", { p_cle: cle("a"), p_etape: "resultat", p_max_ip: 3, p_max_global: 4 });
  });

  it("refus par IP puis global", async () => {
    const reponses = [{ ok: false, motif: "ip", n_ip: 4, n_global: 9 }, { ok: false, motif: "global", n_ip: 0, n_global: 5 }];
    const rpc = vi.fn(async () => ({ data: [reponses.shift()], error: null }));
    const q = quotaSupabase({ rpc } as never, limites, secours());
    expect(await q.consommer(cle("a"), "cadrage")).toEqual({ ok: false, motif: "ip", restant: 0 });
    expect(await q.consommer(cle("a"), "cadrage")).toEqual({ ok: false, motif: "global", restant: 0 });
  });

  it("si la fonction de lecture manque, lit la table existante", async () => {
    const rpc = vi.fn(async () => { throw new Error("function ma_cible_autoriser does not exist"); });
    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: async () => ({ data: [{ cle: "global", n: 1 }, { cle: cle("a"), n: 3 }], error: null }),
          }),
        }),
      }),
    }));
    const q = quotaSupabase({ rpc, from } as never, limites, secours());
    expect(await q.autoriser(cle("a"), "resultat")).toEqual({ ok: false, motif: "ip", restant: 0 });
  });

  it("erreur de la base ou exception : bascule sur la mémoire et le signale sans contenu", async () => {
    const avertissement = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const rpc of [vi.fn(async () => ({ data: null, error: { message: "boom" } })), vi.fn(async () => { throw new Error("réseau"); })]) {
      const s = secours();
      const q = quotaSupabase({ rpc } as never, limites, s);
      expect(await q.consommer(cle("a"), "cadrage")).toEqual({ ok: true, restant: 99 });
      expect(s.consommer).toHaveBeenCalledWith(cle("a"), "cadrage");
    }
    expect(avertissement).toHaveBeenCalledWith("[ma-cible]", { code: "quota_memoire", etape: "cadrage", motif: "boom" });
    expect(avertissement).toHaveBeenCalledWith("[ma-cible]", { code: "quota_memoire", etape: "cadrage", motif: "réseau" });
    expect(JSON.stringify(avertissement.mock.calls)).not.toContain(cle("a"));
    avertissement.mockRestore();
  });

  it("relit la table quand la fonction renvoie l'ancien compteur", async () => {
    const avertissement = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rpc = vi.fn(async () => ({ data: [{ ok: true, motif: null, n_ip: 1, n_global: 1 }], error: null }));
    const from = () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: async () => ({ data: [{ cle: "global", n: 4 }, { cle: cle("a"), n: 2 }], error: null }),
          }),
        }),
      }),
    });
    const s = secours();
    const q = quotaSupabase({ rpc, from } as never, limites, s);
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 1 });
    expect(s.consommer).not.toHaveBeenCalled();
    expect(avertissement).toHaveBeenCalledWith("[ma-cible]", { code: "quota_ecart", etape: "resultat" });
    avertissement.mockRestore();
  });

  it("si la fonction d'incrément manque, écrit dans la table au lieu de la mémoire", async () => {
    const avertissement = vi.spyOn(console, "warn").mockImplementation(() => {});
    const rpc = vi.fn(async () => { throw new Error("function ma_cible_consommer does not exist"); });
    const upsert = vi.fn(async () => ({ error: null }));
    const from = () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: async () => ({ data: [{ cle: "global", n: 1 }, { cle: cle("a"), n: 1 }], error: null }),
          }),
        }),
      }),
      upsert,
    });
    const s = secours();
    const q = quotaSupabase({ rpc, from } as never, limites, s);
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 1 });
    expect(upsert).toHaveBeenCalled();
    expect(s.consommer).not.toHaveBeenCalled();
    expect(avertissement).toHaveBeenCalledWith("[ma-cible]", expect.objectContaining({ code: "quota_table", etape: "resultat" }));
    expect(JSON.stringify(avertissement.mock.calls)).not.toContain(cle("a"));
    avertissement.mockRestore();
  });
});
