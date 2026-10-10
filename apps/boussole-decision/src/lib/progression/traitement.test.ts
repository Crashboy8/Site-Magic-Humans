import { describe, expect, it } from "vitest";
import type { EnvoiJeu, VueProgression } from "@/domain/progression";
import { CORPS_MAX, traiterProgression, type Dependances } from "./traitement";

const URL_API = "https://www.magichumans.com/boussole-decision/api/progression/";
const VUE: VueProgression = { xp: 54, niveau: "2", badges: ["premier-pas", "en-mouvement"], serieJours: 3, prochain: { id: "sur-la-lancee", seuil: 150, manque: 96 }, misAJour: null };

function deps(p: Partial<Dependances> = {}) {
  const recus: EnvoiJeu[] = [];
  const d: Dependances = {
    session: async () => ({ userId: "u1" }),
    lire: async () => VUE,
    recevoir: async (_id, envoi) => {
      recus.push(envoi);
      return VUE;
    },
    env: {},
    maintenant: () => new Date("2026-10-10T10:00:00Z"),
    ...p,
  };
  return { d, recus };
}

const post = (corps: string, origin: string | null = "https://www.magichumans.com") =>
  new Request(URL_API, { method: "POST", body: corps, headers: origin ? { origin, "content-type": "application/json" } : { "content-type": "application/json" } });

describe("route api/progression", () => {
  it("sans compte (ou en essai), répond compte: false et ne lit rien", async () => {
    let lu = false;
    const { d } = deps({ session: async () => null, lire: async () => ((lu = true), VUE) });
    const r = await traiterProgression(new Request(URL_API), d);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ compte: false });
    expect(lu).toBe(false);
    expect(r.headers.get("cache-control")).toBe("no-store");
  });

  it("connecté : lit la progression du compte", async () => {
    const r = await traiterProgression(new Request(URL_API), deps().d);
    expect(await r.json()).toEqual({ compte: true, table: true, progression: VUE });
  });

  it("table pas encore créée : le jeu reste sur le navigateur", async () => {
    const r = await traiterProgression(new Request(URL_API), deps({ lire: async () => "absente" }).d);
    expect(await r.json()).toEqual({ compte: true, table: false });
  });

  it("envoie les points du jeu, revalidés", async () => {
    const { d, recus } = deps();
    const r = await traiterProgression(post(JSON.stringify({ ajout: 30, badges: ["premier-pas", "inconnu"], serieJours: 2, maj: "2026-10-10T09:00:00Z" })), d);
    expect(r.status).toBe(200);
    expect(recus).toEqual([{ ajout: 30, badges: ["premier-pas"], serieJours: 2, maj: "2026-10-10T09:00:00.000Z", repartir: false }]);
  });

  it("refuse un envoi d'une autre origine, sans origine, illisible ou trop gros", async () => {
    const { d, recus } = deps();
    expect((await traiterProgression(post("{}", "https://ailleurs.example"), d)).status).toBe(403);
    expect((await traiterProgression(post("{}", null), d)).status).toBe(403);
    expect((await traiterProgression(post("pas du json"), d)).status).toBe(400);
    expect((await traiterProgression(post(JSON.stringify({ ajout: -5 })), d)).status).toBe(400);
    expect((await traiterProgression(post(" ".repeat(CORPS_MAX + 1)), d)).status).toBe(400);
    expect(recus).toEqual([]);
  });

  it("une base qui ne répond pas donne 503, sans détail", async () => {
    const r = await traiterProgression(new Request(URL_API), deps({ lire: async () => Promise.reject(new Error("réseau")) }).d);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ erreur: "indisponible" });
  });

  it("n'accepte que GET et POST", async () => {
    expect((await traiterProgression(new Request(URL_API, { method: "DELETE" }), deps().d)).status).toBe(405);
  });
});
