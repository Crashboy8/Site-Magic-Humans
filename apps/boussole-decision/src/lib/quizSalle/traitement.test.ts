import { describe, expect, it } from "vitest";
import { limiteurMemoire, traiterQuizSalle, type CompteurSalle, type LigneSalle } from "./traitement";

const env = { VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://www.magichumans.com" };
const ORIGINE = "https://www.magichumans.com";

function memoire(): CompteurSalle & { appels: { session: string; profil: string }[] } {
  const table = new Map<string, number>();
  const appels: { session: string; profil: string }[] = [];
  return {
    appels,
    async increment(session, profil) {
      appels.push({ session, profil });
      const cle = session + "\0" + profil;
      table.set(cle, (table.get(cle) ?? 0) + 1);
      return true;
    },
    async lire(session) {
      const rows: LigneSalle[] = [];
      for (const [cle, n] of table) {
        const [s, profil] = cle.split("\0");
        if (s === session) rows.push({ id: profil, n });
      }
      return rows;
    },
  };
}

function requete(method: string, url: string, body?: unknown, headers: Record<string, string | null> = {}): Request {
  const h = new Headers({ origin: ORIGINE, "x-forwarded-for": "203.0.113.9" });
  for (const [k, v] of Object.entries(headers)) {
    if (v === null) h.delete(k);
    else h.set(k, v);
  }
  return new Request(url, { method, headers: h, body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body) });
}

describe("quiz salle", () => {
  it("refuse une origine inconnue et un POST sans origine", async () => {
    const compteur = memoire();
    const deps = { compteur, limiteur: limiteurMemoire(), env };
    expect((await traiterQuizSalle(deps, requete("POST", "https://www.magichumans.com/boussole-decision/api/quiz-salle/", { session: "webinaire-8oct", profil: "securite" }, { origin: "https://evil.example" }))).status).toBe(403);
    expect((await traiterQuizSalle(deps, requete("POST", "https://www.magichumans.com/boussole-decision/api/quiz-salle/", { session: "webinaire-8oct", profil: "securite" }, { origin: null }))).status).toBe(403);
    expect(compteur.appels).toEqual([]);
  });

  it("n'accepte qu'une session webinaire et un profil de la liste", async () => {
    const compteur = memoire();
    const deps = { compteur, limiteur: limiteurMemoire(), env };
    const url = "https://www.magichumans.com/boussole-decision/api/quiz-salle/";
    expect((await traiterQuizSalle(deps, requete("POST", url, { session: "site", profil: "securite" }))).status).toBe(400);
    expect((await traiterQuizSalle(deps, requete("POST", url, { session: "webinaire-8oct", profil: "amour-libre" }))).status).toBe(400);
    expect((await traiterQuizSalle(deps, requete("POST", url, { session: "webinaire-8oct", profil: "securite", prenom: "Léa", email: "a@b.c" }))).status).toBe(200);
    expect(compteur.appels).toEqual([{ session: "webinaire-8oct", profil: "securite" }]);
  });

  it("compte une fois côté base et relit les parts", async () => {
    const compteur = memoire();
    const deps = { compteur, limiteur: limiteurMemoire(), env };
    const url = "https://www.magichumans.com/boussole-decision/api/quiz-salle/";
    expect((await traiterQuizSalle(deps, requete("POST", url, { session: "webinaire-8oct", profil: "harmonie" }))).status).toBe(200);
    expect((await traiterQuizSalle(deps, requete("POST", url, { session: "webinaire-8oct", profil: "harmonie" }))).status).toBe(200);
    const lecture = await traiterQuizSalle(deps, requete("GET", url + "?session=webinaire-8oct"));
    expect(lecture.status).toBe(200);
    expect(await lecture.json()).toEqual({ ok: true, total: 2, profils: [{ id: "harmonie", n: 2 }] });
  });

  it("laisse passer un GET de la même origine sans en-tête Origin, et refuse un site tiers", async () => {
    const compteur = memoire();
    const deps = { compteur, limiteur: limiteurMemoire(), env };
    const url = "https://www.magichumans.com/boussole-decision/api/quiz-salle/?session=webinaire-8oct";
    const meme = await traiterQuizSalle(deps, requete("GET", url, undefined, { origin: null, "sec-fetch-site": "same-origin" }));
    expect(meme.status).toBe(200);
    const tiers = await traiterQuizSalle(deps, requete("GET", url, undefined, { origin: null, "sec-fetch-site": "cross-site" }));
    expect(tiers.status).toBe(403);
  });

  it("limite le débit par adresse, sans la renvoyer", async () => {
    const compteur = memoire();
    let maintenant = 1_000;
    const deps = { compteur, limiteur: limiteurMemoire(() => maintenant), env };
    const url = "https://www.magichumans.com/boussole-decision/api/quiz-salle/?session=webinaire-8oct";
    for (let i = 0; i < 240; i++) expect((await traiterQuizSalle(deps, requete("GET", url))).status).toBe(200);
    expect((await traiterQuizSalle(deps, requete("GET", url))).status).toBe(429);
    const corps = await (await traiterQuizSalle(deps, requete("GET", url))).json();
    expect(JSON.stringify(corps).includes("203.0.113.9")).toBe(false);
    maintenant += 61_000;
    expect((await traiterQuizSalle(deps, requete("GET", url))).status).toBe(200);
  });

  it("répond 503 si la table ne répond pas, sans détail", async () => {
    const compteur: CompteurSalle = {
      async increment() { return false; },
      async lire() { return null; },
    };
    const deps = { compteur, limiteur: limiteurMemoire(), env };
    const lecture = await traiterQuizSalle(deps, requete("GET", "https://www.magichumans.com/boussole-decision/api/quiz-salle/?session=webinaire-8oct"));
    expect(lecture.status).toBe(503);
    expect(await lecture.json()).toEqual({ ok: false });
  });
});
