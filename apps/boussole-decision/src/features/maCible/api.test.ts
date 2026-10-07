import { describe, expect, it, vi } from "vitest";
import { ENTREE_EXEMPLE } from "@/domain/maCible/exemple";
import { URL_API, appelerApi } from "./api";

const demande = { etape: "cadrage", tour: 1, entree: ENTREE_EXEMPLE } as const;
const reponse = (corps: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(corps), { status, headers: { "content-type": "application/json" } }));

describe("appelerApi", () => {
  it("envoie un POST JSON vers la route sous le basePath", async () => {
    const f = vi.fn(() => reponse({ ok: true, etape: "cadrage", cadrage: { statut: "esquisse" }, restant: 7 }));
    const r = await appelerApi(demande, undefined, f as unknown as typeof fetch);
    expect(r).toEqual({ ok: true, cadrage: { statut: "esquisse" } });
    expect(URL_API).toBe("/boussole-decision/api/ma-cible/");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(URL_API);
    expect(init.method).toBe("POST");
  });
  it("traduit les codes d'erreur du serveur, dont le plafond par IP", async () => {
    const f = () => reponse({ ok: false, code: "quota_ip", etape: "resultat", max: 3 }, 429);
    expect(await appelerApi(demande, undefined, f as unknown as typeof fetch)).toEqual({ ok: false, code: "quota_ip", max: 3 });
    const g = () => reponse({ ok: false, code: "n_importe_quoi" }, 400);
    expect(await appelerApi(demande, undefined, g as unknown as typeof fetch)).toEqual({ ok: false, code: "inconnue", max: undefined });
  });
  it("renvoie « reseau » si le réseau est coupé", async () => {
    const f = () => Promise.reject(new TypeError("Failed to fetch"));
    expect(await appelerApi(demande, undefined, f as unknown as typeof fetch)).toEqual({ ok: false, code: "reseau" });
  });
  it("ne contient jamais de prénom : le corps envoyé est la demande telle quelle", async () => {
    const f = vi.fn(() => reponse({ ok: false, code: "ia_invalide" }, 502));
    await appelerApi(demande, undefined, f as unknown as typeof fetch);
    const init = (f.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(JSON.parse(init.body as string)).toEqual(demande);
  });
});
