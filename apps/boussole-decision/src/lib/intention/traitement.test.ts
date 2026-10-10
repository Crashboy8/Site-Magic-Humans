import { describe, expect, it } from "vitest";
import type { DemandeIntention } from "@/domain/intention";
import { CORPS_MAX, creerJeton, traiterIntention, verifierJeton, type Dependances, type ResultatDepot } from "./traitement";

const URL_API = "https://www.magichumans.com/boussole-decision/api/intention/";
const SECRET = "cle-de-test";
const T0 = 1_791_000_000_000;

function deps(p: Partial<Dependances> = {}, resultat: ResultatDepot = "ok") {
  const depots: { userId: string | null; d: DemandeIntention }[] = [];
  const d: Dependances = {
    session: async () => null,
    deposer: async (userId, demande) => {
      depots.push({ userId, d: demande });
      return resultat;
    },
    secret: SECRET,
    env: {},
    maintenant: () => T0 + 5_000,
    ...p,
  };
  return { d, depots };
}

const corps = (p: Record<string, unknown> = {}) =>
  JSON.stringify({ outil: "jeu", etape: "tableau-de-bord", question: "Par où commencer ?", mail: "zoe@test.fr", accord: false, site: "", jeton: creerJeton(SECRET, T0), ...p });

const post = (texte: string, origin: string | null = "https://www.magichumans.com") =>
  new Request(URL_API, { method: "POST", body: texte, headers: origin ? { origin, "content-type": "application/json" } : { "content-type": "application/json" } });

describe("jeton du formulaire", () => {
  it("signé, valable après 3 s, refusé avant, et trop vieux au bout de 2 h", () => {
    const j = creerJeton(SECRET, T0);
    expect(verifierJeton(SECRET, j, T0 + 2_999)).toBe("trop_tot");
    expect(verifierJeton(SECRET, j, T0 + 3_000)).toBe("ok");
    expect(verifierJeton(SECRET, j, T0 + 2 * 3600_000 + 1)).toBe("invalide");
    expect(verifierJeton(SECRET, j, T0 - 1)).toBe("invalide");
  });

  it("une heure modifiée ou une autre clé ne passe pas", () => {
    const [, sig] = creerJeton(SECRET, T0).split(".");
    expect(verifierJeton(SECRET, `${T0 - 60_000}.${sig}`, T0 + 5_000)).toBe("invalide");
    expect(verifierJeton("autre", creerJeton(SECRET, T0), T0 + 5_000)).toBe("invalide");
    expect(verifierJeton(SECRET, "n'importe quoi", T0 + 5_000)).toBe("invalide");
  });
});

describe("route api/intention", () => {
  it("GET sans compte : demande le mail et donne un jeton", async () => {
    const r = await traiterIntention(new Request(URL_API), deps().d);
    expect(r.status).toBe(200);
    expect(r.headers.get("cache-control")).toBe("no-store");
    const j = await r.json();
    expect(j.compte).toBe(false);
    expect(verifierJeton(SECRET, j.jeton, T0 + 9_000)).toBe("ok");
  });

  it("GET connecté : pas besoin de mail", async () => {
    const r = await traiterIntention(new Request(URL_API), deps({ session: async () => ({ userId: "u1" }) }).d);
    expect((await r.json()).compte).toBe(true);
  });

  it("GET depuis un autre site : refusé", async () => {
    const r = await traiterIntention(new Request(URL_API, { headers: { "sec-fetch-site": "cross-site" } }), deps().d);
    expect(r.status).toBe(403);
  });

  it("sans clé secrète : indisponible, rien n'est écrit", async () => {
    expect((await traiterIntention(new Request(URL_API), deps({ secret: undefined }).d)).status).toBe(503);
    expect((await traiterIntention(post(corps()), deps({ deposer: null }).d)).status).toBe(503);
  });

  it("POST sans compte : écrit la demande avec le mail", async () => {
    const { d, depots } = deps();
    const r = await traiterIntention(post(corps({ accord: true })), d);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
    expect(depots).toEqual([{ userId: null, d: expect.objectContaining({ outil: "jeu", etape: "tableau-de-bord", question: "Par où commencer ?", mail: "zoe@test.fr", accord: true }) }]);
  });

  it("POST connecté : écrit la demande avec le compte, sans mail", async () => {
    const { d, depots } = deps({ session: async () => ({ userId: "u1" }) });
    const r = await traiterIntention(post(corps({ mail: "" })), d);
    expect(r.status).toBe(200);
    expect(depots[0].userId).toBe("u1");
  });

  it("sans compte et sans mail : refusé", async () => {
    const { d, depots } = deps();
    const r = await traiterIntention(post(corps({ mail: "" })), d);
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({ erreur: "mail" });
    expect(depots).toEqual([]);
  });

  it("pot de miel rempli : répond ok, rien n'est écrit", async () => {
    const { d, depots } = deps();
    const r = await traiterIntention(post(corps({ site: "https://spam.example" })), d);
    expect(r.status).toBe(200);
    expect(depots).toEqual([]);
  });

  it("moins de 3 s après l'ouverture : refusé", async () => {
    const { d, depots } = deps({ maintenant: () => T0 + 1_000 });
    const r = await traiterIntention(post(corps()), d);
    expect(await r.json()).toEqual({ erreur: "trop_tot" });
    expect(depots).toEqual([]);
  });

  it("jeton absent ou faux : refusé", async () => {
    const r = await traiterIntention(post(corps({ jeton: "" })), deps().d);
    expect(await r.json()).toEqual({ erreur: "jeton" });
  });

  it("une demande par mail toutes les 10 minutes, et plafond global : 429", async () => {
    for (const res of ["attendre", "plafond"] as const) {
      const r = await traiterIntention(post(corps()), deps({}, res).d);
      expect(r.status).toBe(429);
      expect(await r.json()).toEqual({ erreur: res });
    }
  });

  it("origine inconnue ou absente en POST : refusé", async () => {
    expect((await traiterIntention(post(corps(), "https://autre.example"), deps().d)).status).toBe(403);
    expect((await traiterIntention(post(corps(), null), deps().d)).status).toBe(403);
  });

  it("corps trop long, illisible ou question trop longue : refusé", async () => {
    expect((await traiterIntention(post("x".repeat(CORPS_MAX + 1)), deps().d)).status).toBe(400);
    expect((await traiterIntention(post("{pas du json"), deps().d)).status).toBe(400);
    const r = await traiterIntention(post(corps({ question: "a".repeat(501) })), deps().d);
    expect(await r.json()).toEqual({ erreur: "question" });
  });

  it("base en panne : indisponible", async () => {
    const r = await traiterIntention(post(corps()), deps({ deposer: async () => Promise.reject(new Error("panne")) }).d);
    expect(r.status).toBe(503);
  });

  it("autre méthode : 405", async () => {
    expect((await traiterIntention(new Request(URL_API, { method: "DELETE" }), deps().d)).status).toBe(405);
  });
});
