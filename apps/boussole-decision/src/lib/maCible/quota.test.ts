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
  it("limitesDepuisEnv : valeurs par défaut et surcharge", () => {
    expect(limitesDepuisEnv({})).toEqual(LIMITES_DEFAUT);
    expect(limitesDepuisEnv({ MA_CIBLE_MAX_IP_RESULTAT: "5", MA_CIBLE_MAX_GLOBAL_RESULTAT: "abc" })).toMatchObject({ ipResultat: 5, globalResultat: 200 });
  });
});

describe("quotaSupabase", () => {
  const secours = () => ({ consommer: vi.fn(async () => ({ ok: true, restant: 99 })) });

  it("réponse OK : appelle la fonction SQL avec les plafonds", async () => {
    const rpc = vi.fn(async () => ({ data: [{ ok: true, motif: null, n_ip: 1, n_global: 7 }], error: null }));
    const s = secours();
    const q = quotaSupabase({ rpc } as never, limites, s);
    expect(await q.consommer(cle("a"), "resultat")).toEqual({ ok: true, restant: 2 });
    expect(rpc).toHaveBeenCalledWith("ma_cible_consommer", { p_cle: cle("a"), p_etape: "resultat", p_max_ip: 3, p_max_global: 4 });
    expect(s.consommer).not.toHaveBeenCalled();
  });

  it("refus par IP puis global", async () => {
    const reponses = [{ ok: false, motif: "ip", n_ip: 4, n_global: 9 }, { ok: false, motif: "global", n_ip: 0, n_global: 5 }];
    const rpc = vi.fn(async () => ({ data: [reponses.shift()], error: null }));
    const q = quotaSupabase({ rpc } as never, limites, secours());
    expect(await q.consommer(cle("a"), "cadrage")).toEqual({ ok: false, motif: "ip", restant: 0 });
    expect(await q.consommer(cle("a"), "cadrage")).toEqual({ ok: false, motif: "global", restant: 0 });
  });

  it("erreur de la base ou exception : bascule sur le secours et le journalise sans contenu", async () => {
    const erreur = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const rpc of [vi.fn(async () => ({ data: null, error: { message: "boom" } })), vi.fn(async () => { throw new Error("réseau"); })]) {
      const s = secours();
      const q = quotaSupabase({ rpc } as never, limites, s);
      expect(await q.consommer(cle("a"), "cadrage")).toEqual({ ok: true, restant: 99 });
      expect(s.consommer).toHaveBeenCalledWith(cle("a"), "cadrage");
    }
    expect(erreur).toHaveBeenCalledWith("[ma-cible]", { code: "quota_secours", etape: "cadrage" });
    erreur.mockRestore();
  });
});
