/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENTREE_EXEMPLE, RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { TAILLE_MAX_CORPS } from "@/domain/maCible/limites";
import { ErreurFournisseur, type Fournisseur } from "@/lib/ia/fournisseur";
import { limitesDepuisEnv, quotaMemoire } from "./quota";
import { repriseMemoire } from "./reprise";
import { cleCompteur, extraireJson, reinitialiserGenerations, traiterDemande, type Dependances } from "./traitement";

const ORIGINE = "https://www.magichumans.com";
const ESQUISSE = {
  offre: "Je remets les équipes qui ne se parlent plus autour de la table.",
  cibles: [
    { id: "c1", nom: "Directeurs de sites", marche: "b2b", enUneLigne: "Directeurs de site après une réorganisation tendue", pourquoi: "Ton Contexte Déclencheur est leur situation.", depuisIdees: [] },
    { id: "c2", nom: "Dirigeants de PME", marche: "b2b", enUneLigne: "Fondateurs dont le comité de direction ne décide plus", pourquoi: "Tu poses les questions que personne n'ose poser.", depuisIdees: [] },
    { id: "c3", nom: "Managers promus", marche: "b2c", enUneLigne: "Managers promus qui héritent d'une équipe divisée", pourquoi: "Tu aides à préparer les conversations difficiles.", depuisIdees: [] },
  ],
  antiCible: "Les grands groupes qui achètent un atelier comme une case à cocher.",
  hypotheses: [],
  autresPistes: [],
};
const CADRAGE_ESQUISSE = { statut: "esquisse", message: "", questions: [], esquisse: ESQUISSE };
const CADRAGE_QUESTIONS = {
  statut: "questions",
  message: "",
  questions: [{ id: "q1", question: "Interviens-tu surtout en groupe ?", pourquoi: "Cela change les cibles proposées.", type: "choix", options: ["En groupe", "En individuel"], exemple: "" }],
  esquisse: { offre: "", cibles: [], antiCible: "", hypotheses: [], autresPistes: [] },
};
const CORRECTIONS = {
  offre: "J'accompagne des dirigeants et des équipes.",
  cibles: [
    { id: "c1", verdict: "oui", commentaire: "" },
    { id: "c2", verdict: "non", commentaire: "Pas mon réseau" },
    { id: "c3", verdict: "oui", commentaire: "" },
  ],
  antiCible: { verdict: "oui", commentaire: "" },
  idee: "",
};

const demandeCadrage = (extra: object = {}) => ({ etape: "cadrage", tour: 1, entree: ENTREE_EXEMPLE, ...extra });
const demandeResultat = (extra: object = {}) => ({ etape: "resultat", entree: ENTREE_EXEMPLE, esquisse: ESQUISSE, corrections: CORRECTIONS, ...extra });

function requete(corps: unknown, entetes: Record<string, string | null> = {}): Request {
  const h: Record<string, string> = { "content-type": "application/json", origin: ORIGINE, "x-forwarded-for": "203.0.113.7, 10.0.0.1" };
  for (const [k, v] of Object.entries(entetes)) {
    if (v === null) delete h[k];
    else h[k] = v;
  }
  return new Request("https://www.magichumans.com/boussole-decision/api/ma-cible/", { method: "POST", headers: h, body: typeof corps === "string" ? corps : JSON.stringify(corps) });
}

function fournisseurSimule(reponses: (string | Error)[]) {
  const appeler = vi.fn(async (a: unknown) => {
    void a;
    const r = reponses.shift();
    if (r === undefined) throw new Error("plus de réponse simulée");
    if (r instanceof Error) throw r;
    return r;
  });
  return { nom: "anthropic", appeler } as Fournisseur & { appeler: typeof appeler };
}

let fournisseur: ReturnType<typeof fournisseurSimule>;
let deps: Dependances;
const MAINTENANT = new Date("2026-10-10T10:00:00Z");
const ENV = { VERCEL_ENV: "production", MA_CIBLE_SEL: "un-sel-d-au-moins-trente-deux-caracteres" };

const LIMITES_TEST = { ipCadrage: 8, ipResultat: 3, ipSynthese: 5, ipApprofondir: 20, globalCadrage: 600, globalResultat: 200, globalSynthese: 100, globalApprofondir: 300 };

function preparer(reponses: (string | Error)[], surcharge: Partial<Dependances> = {}) {
  fournisseur = fournisseurSimule(reponses);
  deps = { fournisseur, quota: quotaMemoire(LIMITES_TEST, () => MAINTENANT), maintenant: () => MAINTENANT, env: ENV, ...surcharge };
}
const corpsDe = async (r: Response) => (await r.json()) as any;

let erreurConsole: ReturnType<typeof vi.spyOn>;
const SESSION = "11111111-1111-4111-8111-111111111111";

function quotaEspion(restant = 1) {
  return {
    autoriser: vi.fn(async () => ({ ok: true, restant })),
    consommer: vi.fn(async () => ({ ok: true, restant })),
  };
}

beforeEach(() => {
  reinitialiserGenerations();
  erreurConsole = vi.spyOn(console, "error").mockImplementation(() => {});
  preparer([]);
});
afterEach(() => erreurConsole.mockRestore());

describe("origine, taille et corps", () => {
  it("403 sans Origin", async () => {
    const r = await traiterDemande(deps, requete(demandeCadrage(), { origin: null }));
    expect(r.status).toBe(403);
    expect(await corpsDe(r)).toEqual({ ok: false, code: "origine_refusee" });
    expect(fournisseur.appeler).not.toHaveBeenCalled();
  });
  it("403 avec une origine inconnue", async () => {
    expect((await traiterDemande(deps, requete(demandeCadrage(), { origin: "https://evil.example" }))).status).toBe(403);
  });
  it("413 quand content-length dépasse la taille maximum", async () => {
    const r = await traiterDemande(deps, requete(demandeCadrage(), { "content-length": String(TAILLE_MAX_CORPS + 1) }));
    expect(r.status).toBe(413);
    expect((await corpsDe(r)).code).toBe("trop_long");
  });
  it("413 quand le corps réel dépasse la taille maximum", async () => {
    const e = structuredClone(ENTREE_EXEMPLE);
    e.talent.reussite = "é".repeat(70_000);
    expect((await traiterDemande(deps, requete({ ...demandeCadrage(), entree: e }))).status).toBe(413);
  });
  it("400 quand le JSON du corps est illisible", async () => {
    const r = await traiterDemande(deps, requete("{pas du json"));
    expect(r.status).toBe(400);
    expect(await corpsDe(r)).toMatchObject({ ok: false, code: "entree_invalide" });
  });
  it("400 quand l'entrée est invalide, avec les champs en cause", async () => {
    const e = structuredClone(ENTREE_EXEMPLE);
    e.talent.mecanisme = "";
    const r = await traiterDemande(deps, requete({ ...demandeCadrage(), entree: e }));
    expect(r.status).toBe(400);
    expect((await corpsDe(r)).champs).toContainEqual({ champ: "talent.mecanisme", code: "requis" });
  });
  it("400 pour une étape ou un tour invalide", async () => {
    expect((await traiterDemande(deps, requete({ ...demandeCadrage(), etape: "autre" }))).status).toBe(400);
    expect((await traiterDemande(deps, requete(demandeCadrage({ tour: 4 })))).status).toBe(400);
  });
  it("400 au tour 3 sans corrections ni esquisse précédente", async () => {
    const r = await traiterDemande(deps, requete(demandeCadrage({ tour: 3 })));
    expect(r.status).toBe(400);
    const champs = (await corpsDe(r)).champs;
    expect(champs).toContainEqual({ champ: "esquissePrecedente", code: "requis" });
    expect(champs).toContainEqual({ champ: "corrections", code: "requis" });
  });
  it("400 pour un résultat avec une esquisse ou des corrections invalides", async () => {
    expect((await traiterDemande(deps, requete(demandeResultat({ esquisse: { offre: "x" } })))).status).toBe(400);
    const sansCommentaire = structuredClone(CORRECTIONS);
    sansCommentaire.cibles[1].commentaire = "";
    expect((await traiterDemande(deps, requete(demandeResultat({ corrections: sansCommentaire })))).status).toBe(400);
    expect(fournisseur.appeler).not.toHaveBeenCalled();
  });
});

describe("configuration et quota", () => {
  it("503 config_manquante sans fournisseur", async () => {
    preparer([], { fournisseur: null });
    const r = await traiterDemande(deps, requete(demandeCadrage()));
    expect(r.status).toBe(503);
    expect((await corpsDe(r)).code).toBe("config_manquante");
  });
  it("503 config_manquante en production sans MA_CIBLE_SEL, mais pas en développement", async () => {
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { env: { VERCEL_ENV: "production" } });
    expect((await traiterDemande(deps, requete(demandeCadrage()))).status).toBe(503);
    expect(fournisseur.appeler).not.toHaveBeenCalled();
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { env: { VERCEL_ENV: "development" } });
    expect((await traiterDemande(deps, requete(demandeCadrage()))).status).toBe(200);
  });
  it("429 avec Retry-After quand la limite par IP est atteinte", async () => {
    preparer(Array(4).fill(JSON.stringify(RESULTAT_EXEMPLE)), { env: { ...ENV, MA_CIBLE_MAX_IP_RESULTAT: "3" } });
    for (let i = 0; i < 3; i++) expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeResultat()));
    expect(r.status).toBe(429);
    expect(await corpsDe(r)).toEqual({ ok: false, code: "quota_ip", etape: "resultat", max: 3, reessayerApres: "2026-10-10T22:00:00.000Z" });
    expect(r.headers.get("Retry-After")).toBe(String(12 * 3600));
    expect(fournisseur.appeler).toHaveBeenCalledTimes(3);
  });
  it("le défaut autorise 15 résultats par adresse puis refuse", async () => {
    preparer(Array(16).fill(JSON.stringify(RESULTAT_EXEMPLE)), {
      quota: quotaMemoire(limitesDepuisEnv({}), () => MAINTENANT),
    });
    for (let i = 0; i < 15; i++) expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeResultat()));
    expect(r.status).toBe(429);
    expect(await corpsDe(r)).toMatchObject({ code: "quota_ip", etape: "resultat", max: 15 });
    expect(fournisseur.appeler).toHaveBeenCalledTimes(15);
  });
  it("un petit plafond global refuse avant le plafond personnel", async () => {
    const env = { ...ENV, MA_CIBLE_MAX_GLOBAL_RESULTAT: "2" };
    preparer(Array(3).fill(JSON.stringify(RESULTAT_EXEMPLE)), {
      env,
      quota: quotaMemoire(limitesDepuisEnv(env), () => MAINTENANT),
    });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    expect((await traiterDemande(deps, requete(demandeResultat(), { "x-forwarded-for": "198.51.100.8" }))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeResultat(), { "x-forwarded-for": "198.51.100.9" }));
    expect(r.status).toBe(429);
    expect(await corpsDe(r)).toMatchObject({ code: "quota_global", max: 2 });
    expect(fournisseur.appeler).toHaveBeenCalledTimes(2);
  });
  it("429 quota_global quand le plafond du jour est atteint", async () => {
    preparer([JSON.stringify(RESULTAT_EXEMPLE)], {
      env: { ...ENV, MA_CIBLE_MAX_GLOBAL_RESULTAT: "1" },
      quota: quotaMemoire({ ...LIMITES_TEST, globalResultat: 1 }, () => MAINTENANT),
    });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeResultat(), { "x-forwarded-for": "198.51.100.4" }));
    expect(r.status).toBe(429);
    expect(await corpsDe(r)).toMatchObject({ code: "quota_global", max: 1 });
  });
  it("la clé du compteur est une empreinte sha256, jamais l'IP", async () => {
    const quota = quotaEspion();
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { quota });
    await traiterDemande(deps, requete(demandeCadrage()));
    const [cle, etape] = quota.consommer.mock.calls[0] as unknown as [string, string];
    expect(cle).toMatch(/^[0-9a-f]{64}$/);
    expect(cle).toBe(cleCompteur(ENV.MA_CIBLE_SEL, "2026-10-10", "203.0.113.7"));
    expect(cle).not.toContain("203");
    expect(etape).toBe("cadrage");
  });
  it("IP inconnue sans en-tête", async () => {
    expect(cleCompteur("s", "2026-10-10", "inconnue")).toMatch(/^[0-9a-f]{64}$/);
    const quota = quotaEspion();
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { quota });
    await traiterDemande(deps, requete(demandeCadrage(), { "x-forwarded-for": null }));
    expect((quota.consommer.mock.calls[0] as unknown as [string])[0]).toBe(cleCompteur(ENV.MA_CIBLE_SEL, "2026-10-10", "inconnue"));
  });
});

describe("réponses réussies", () => {
  it("200 cadrage : questions", async () => {
    preparer([JSON.stringify(CADRAGE_QUESTIONS)]);
    const r = await traiterDemande(deps, requete(demandeCadrage()));
    expect(r.status).toBe(200);
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    const c = await corpsDe(r);
    expect(c).toMatchObject({ ok: true, etape: "cadrage", restant: 7 });
    expect(c.cadrage.statut).toBe("questions");
  });
  it("200 cadrage : esquisse, avec le prompt et le schéma de l'étape", async () => {
    preparer([JSON.stringify(CADRAGE_ESQUISSE)]);
    const r = await traiterDemande(deps, requete(demandeCadrage({ tour: 2 })));
    expect((await corpsDe(r)).cadrage.statut).toBe("esquisse");
    const appel = fournisseur.appeler.mock.calls[0][0] as any;
    expect(appel.systeme).toContain("tour 2");
    expect(appel.systeme).toContain("il est interdit de poser des questions");
    expect(appel.maxTokens).toBe(2500);
    expect(appel.delaiMs).toBe(90000);
    expect(appel.nomSchema).toBe("cadrage");
    expect(appel.utilisateur).toContain("<donnees>");
  });
  it("200 résultat avec classement calculé", async () => {
    preparer([JSON.stringify(RESULTAT_EXEMPLE)]);
    const r = await traiterDemande(deps, requete(demandeResultat()));
    expect(r.status).toBe(200);
    const c = await corpsDe(r);
    expect(c).toMatchObject({ ok: true, etape: "resultat", restant: 2 });
    expect(c.resultat.classement.map((x: any) => [x.id, x.score, x.rang])).toEqual([
      ["c1", 8.9, "prioritaire"],
      ["c2", 7.6, "secondaire"],
      ["c3", 5.5, "tertiaire"],
    ]);
    const appel = fournisseur.appeler.mock.calls[0][0] as any;
    expect(appel.maxTokens).toBe(10000);
    expect(appel.delaiMs).toBeLessThanOrEqual(240000);
    expect(appel.nomSchema).toBe("resultat");
  });
  it("200 au tour 3 avec esquisse précédente et corrections", async () => {
    preparer([JSON.stringify(CADRAGE_ESQUISSE)]);
    const r = await traiterDemande(deps, requete(demandeCadrage({ tour: 3, esquissePrecedente: ESQUISSE, corrections: CORRECTIONS })));
    expect(r.status).toBe(200);
    expect((fournisseur.appeler.mock.calls[0][0] as any).utilisateur).toContain("esquisse_precedente");
  });
  it("nettoie les tirets longs et accepte une clôture de bloc de code", async () => {
    const avecTiret = structuredClone(CADRAGE_ESQUISSE);
    avecTiret.esquisse.offre = "Je remets les équipes autour de la table \u2014 pour qu'elles décident.";
    preparer(["```json\n" + JSON.stringify(avecTiret) + "\n```"]);
    const r = await traiterDemande(deps, requete(demandeCadrage()));
    expect((await corpsDe(r)).cadrage.esquisse.offre).toBe("Je remets les équipes autour de la table, pour qu'elles décident.");
  });
});

describe("relance et erreurs du modèle", () => {
  it("JSON invalide puis valide : 200 et 2 appels, avec les erreurs dans la relance", async () => {
    preparer(["ceci n'est pas du json", JSON.stringify(CADRAGE_ESQUISSE)]);
    const r = await traiterDemande(deps, requete(demandeCadrage()));
    expect(r.status).toBe(200);
    expect(fournisseur.appeler).toHaveBeenCalledTimes(2);
    expect((fournisseur.appeler.mock.calls[1][0] as any).utilisateur).toContain("Ta réponse précédente n'a pas pu être utilisée");
  });
  it("un champ manquant déclenche la relance, un texte trop long est réparé sans second appel", async () => {
    const manque = structuredClone(RESULTAT_EXEMPLE) as any;
    delete manque.cibles[0].nom;
    preparer([JSON.stringify(manque), JSON.stringify(RESULTAT_EXEMPLE)]);
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    expect(fournisseur.appeler).toHaveBeenCalledTimes(2);

    const long = structuredClone(RESULTAT_EXEMPLE) as any;
    long.offre.phrase = `${"Je précise l'offre. ".repeat(20)}`.slice(0, 260);
    preparer([JSON.stringify(long)]);
    const r = await traiterDemande(deps, requete(demandeResultat()));
    expect(r.status).toBe(200);
    expect(fournisseur.appeler).toHaveBeenCalledTimes(1);
    const corps = await corpsDe(r);
    expect(corps.resultat.offre.phrase.length).toBeLessThanOrEqual(240);
    expect(corps.resultat.offre.phrase.endsWith("…")).toBe(true);
    const journal = JSON.stringify(erreurConsole.mock.calls);
    expect(journal).toContain("reparations");
    expect(journal).not.toContain(long.offre.phrase);
  });
  it("validation en échec puis valide : 200, et le quota n'est consommé qu'une fois", async () => {
    const mauvais = structuredClone(RESULTAT_EXEMPLE) as any;
    mauvais.cibles[0].messages.linkedin = "trop court";
    const quota = quotaEspion(2);
    preparer([JSON.stringify(mauvais), JSON.stringify(RESULTAT_EXEMPLE)], { quota });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    expect(quota.consommer).toHaveBeenCalledTimes(1);
    expect((fournisseur.appeler.mock.calls[1][0] as any).utilisateur).toContain("cibles[0].messages.linkedin");
  });
  it("des questions au tour 2 déclenchent la relance", async () => {
    preparer([JSON.stringify(CADRAGE_QUESTIONS), JSON.stringify(CADRAGE_ESQUISSE)]);
    expect((await traiterDemande(deps, requete(demandeCadrage({ tour: 2 })))).status).toBe(200);
    expect((fournisseur.appeler.mock.calls[1][0] as any).utilisateur).toContain("questions interdites au tour 2");
  });
  it("invalide deux fois : 502 et 2 appels", async () => {
    preparer(["non", "toujours non"]);
    const r = await traiterDemande(deps, requete(demandeCadrage()));
    expect(r.status).toBe(502);
    expect((await corpsDe(r)).code).toBe("ia_invalide");
    expect(fournisseur.appeler).toHaveBeenCalledTimes(2);
  });
  it("réponse vide : traitée comme illisible, puis 502", async () => {
    preparer([new ErreurFournisseur("vide"), new ErreurFournisseur("vide")]);
    expect((await traiterDemande(deps, requete(demandeCadrage()))).status).toBe(502);
  });
  it.each([
    ["réseau", new ErreurFournisseur("reseau")],
    ["délai", new ErreurFournisseur("delai")],
    ["statut 429", new ErreurFournisseur("statut", 429)],
    ["statut 529", new ErreurFournisseur("statut", 529)],
    ["tronqué", new ErreurFournisseur("tronque")],
    ["inattendue", new Error("boum")],
  ])("503 ia_indisponible sur erreur du fournisseur : %s, sans relance", async (_nom, erreur) => {
    preparer([erreur]);
    const r = await traiterDemande(deps, requete(demandeCadrage()));
    expect(r.status).toBe(503);
    expect((await corpsDe(r)).code).toBe("ia_indisponible");
    expect(fournisseur.appeler).toHaveBeenCalledTimes(1);
  });
});

describe("quota seulement en cas de succès, et reprise", () => {
  it("une erreur du fournisseur ou un délai ne consomme pas le quota", async () => {
    const quota = quotaEspion();
    preparer([new ErreurFournisseur("delai")], { quota });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(503);
    expect(quota.autoriser).toHaveBeenCalledTimes(1);
    expect(quota.consommer).not.toHaveBeenCalled();
  });
  it("une réponse invalide deux fois ne consomme pas le quota", async () => {
    const quota = quotaEspion();
    preparer(["non", "toujours non"], { quota });
    expect((await traiterDemande(deps, requete(demandeCadrage()))).status).toBe(502);
    expect(quota.consommer).not.toHaveBeenCalled();
  });
  it("un second essai avec la même session rend le résultat déjà prêt, sans nouvel appel ni quota", async () => {
    const quota = quotaEspion(2);
    const reprise = repriseMemoire(() => MAINTENANT);
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { quota, reprise });
    const entetes = { "x-ma-cible-session": SESSION };
    expect((await traiterDemande(deps, requete(demandeCadrage(), entetes))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeCadrage(), entetes));
    expect(r.status).toBe(200);
    expect((await corpsDe(r)).cadrage.statut).toBe("esquisse");
    expect(fournisseur.appeler).toHaveBeenCalledTimes(1);
    expect(quota.consommer).toHaveBeenCalledTimes(1);
  });
  it("un Réessayer pendant la génération rejoint le même appel", async () => {
    let resoudre: (v: string) => void = () => {};
    const pendant = new Promise<string>((r) => {
      resoudre = r;
    });
    preparer([]);
    fournisseur.appeler.mockImplementation(() => pendant);
    const entetes = { "x-ma-cible-session": "22222222-2222-4222-8222-222222222222" };
    const p1 = traiterDemande(deps, requete(demandeCadrage(), entetes));
    const p2 = traiterDemande(deps, requete(demandeCadrage(), entetes));
    await vi.waitFor(() => expect(fournisseur.appeler).toHaveBeenCalledTimes(1));
    await new Promise((r) => setTimeout(r, 20));
    expect(fournisseur.appeler).toHaveBeenCalledTimes(1);
    resoudre(JSON.stringify(CADRAGE_ESQUISSE));
    const [a, b] = await Promise.all([p1, p2]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect((await corpsDe(a)).ok).toBe(true);
    expect((await corpsDe(b)).ok).toBe(true);
  });
  it("MA_CIBLE_CLE_TEST et l'email illimité passent outre le plafond", async () => {
    preparer(Array(5).fill(JSON.stringify(RESULTAT_EXEMPLE)), { env: { ...ENV, MA_CIBLE_CLE_TEST: "secret-de-test-assez-long" } });
    for (let i = 0; i < 3; i++) expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    expect((await traiterDemande(deps, requete(demandeResultat(), { "x-ma-cible-test": "mauvais" }))).status).toBe(429);
    expect((await traiterDemande(deps, requete(demandeResultat(), { "x-ma-cible-test": "secret-de-test-assez-long" }))).status).toBe(200);
    expect(fournisseur.appeler).toHaveBeenCalledTimes(4);

    preparer(Array(4).fill(JSON.stringify(RESULTAT_EXEMPLE)), {
      env: { ...ENV, MA_CIBLE_EMAILS_ILLIMITES: "Pierre@Example.com, autre@exemple.fr" },
      emailConnecte: "pierre@example.com",
    });
    for (let i = 0; i < 4; i++) expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    preparer([JSON.stringify(RESULTAT_EXEMPLE)], {
      env: { ...ENV, MA_CIBLE_EMAILS_ILLIMITES: "pierre@example.com" },
      emailConnecte: "quelquun@exemple.fr",
      quota: quotaMemoire({ ...LIMITES_TEST, ipResultat: 0 }, () => MAINTENANT),
    });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(429);
    expect(fournisseur.appeler).not.toHaveBeenCalled();
  });
});

describe("confidentialité des journaux", () => {
  it("console.error ne reçoit jamais de texte saisi ni de réponse du modèle", async () => {
    const SECRET = "SECRET-SAISIE-4242";
    const REPONSE = "REPONSE-DU-MODELE-9191";
    const e = structuredClone(ENTREE_EXEMPLE);
    e.talent.mecanisme = `démêle les situations ${SECRET}`;
    for (const reponses of [[REPONSE, REPONSE], [new ErreurFournisseur("statut", 529)], []] as (string | Error)[][]) {
      preparer(reponses, reponses.length ? {} : { fournisseur: null });
      await traiterDemande(deps, requete({ ...demandeCadrage(), entree: e }));
    }
    expect(erreurConsole).toHaveBeenCalled();
    const journal = JSON.stringify(erreurConsole.mock.calls);
    expect(journal).not.toContain(SECRET);
    expect(journal).not.toContain(REPONSE);
    expect(journal).not.toContain("203.0.113");
    expect(journal).toContain("ia_invalide");
    expect(journal).toContain("ia_indisponible");
    expect(journal).toContain("config_manquante");
  });

  it("journalise messageFournisseur, pas le texte saisi", async () => {
    const SECRET = "SECRET-SAISIE-7777";
    const e = structuredClone(ENTREE_EXEMPLE);
    e.talent.mecanisme = `démêle les situations ${SECRET}`;
    preparer([new ErreurFournisseur("statut", 400, "Unknown name responseFormat")]);
    await traiterDemande(deps, requete({ ...demandeCadrage(), entree: e }));
    const journal = JSON.stringify(erreurConsole.mock.calls);
    expect(journal).toContain("messageFournisseur");
    expect(journal).toContain("Unknown name responseFormat");
    expect(journal).not.toContain(SECRET);
  });

  it("ne journalise rien en cas de succès", async () => {
    preparer([JSON.stringify(CADRAGE_ESQUISSE)]);
    await traiterDemande(deps, requete(demandeCadrage()));
    expect(erreurConsole).not.toHaveBeenCalled();
  });
});

describe("synthèse des notes", () => {
  const phrase = "Je n'en peux plus de ces réunions qui n'aboutissent jamais.";
  const note = `${phrase} ${"x".repeat(160)}`;
  const demande = {
    etape: "synthese",
    langue: "fr",
    contexte: { mecanisme: "j'écoute", contexte: "un tournant", benefice: "une voie claire", offre: "un accompagnement" },
    notes: [{ id: "n1", titre: "Entretien", texte: note }],
  };
  const reponseOk = {
    statut: "ok",
    message: "",
    resume: "Ces personnes n'en peuvent plus des réunions qui tournent en rond, et elles cherchent enfin une sortie.",
    profils: ["Cadres en réunion"],
    douleurs: [{ texte: "Des réunions qui n'aboutissent jamais.", frequence: "souvent" }],
    verbatims: [{ id: "v3", note: "n1", citation: phrase, theme: "douleur" }],
    declencheurs: [],
    objections: [],
    motsCles: ["réunions"],
  };

  it("réussit, décrémente le quota synthese et n'écrit rien dans la reprise distante", async () => {
    const distante = { lire: vi.fn(async () => null), garder: vi.fn(async () => {}) };
    const memoire = { lire: vi.fn(async () => null), garder: vi.fn(async () => {}) };
    const quota = quotaEspion(4);
    preparer([JSON.stringify(reponseOk)], { quota, reprise: distante, repriseSensible: memoire });
    const r = await traiterDemande(deps, requete(demande, { "x-ma-cible-session": SESSION }));
    expect(r.status).toBe(200);
    const corps = await corpsDe(r);
    expect(corps.statut).toBe("ok");
    expect(corps.synthese.nbNotes).toBe(1);
    expect(corps.synthese.verbatims[0].id).toBe("v1");
    expect(corps.synthese.faitLe).toBeUndefined();
    expect(corps.restant).toBe(4);
    expect(quota.consommer).toHaveBeenCalledWith(expect.any(String), "synthese");
    expect(distante.garder).not.toHaveBeenCalled();
    expect(distante.lire).not.toHaveBeenCalled();
    expect(memoire.garder).toHaveBeenCalled();
  });

  it("inutilisable répond 200 et compte", async () => {
    const quota = quotaEspion(3);
    preparer(
      [JSON.stringify({ statut: "inutilisable", message: "Colle un entretien.", resume: "", profils: [], douleurs: [], verbatims: [], declencheurs: [], objections: [], motsCles: [] })],
      { quota, repriseSensible: repriseMemoire(() => MAINTENANT) },
    );
    const r = await traiterDemande(deps, requete(demande, { "x-ma-cible-session": SESSION }));
    expect(r.status).toBe(200);
    expect(await corpsDe(r)).toMatchObject({ ok: true, statut: "inutilisable", synthese: null });
    expect(quota.consommer).toHaveBeenCalledWith(expect.any(String), "synthese");
  });

  it("un échec IA répond 503 et ne compte pas", async () => {
    const quota = quotaEspion();
    preparer([new ErreurFournisseur("reseau")], { quota, repriseSensible: repriseMemoire(() => MAINTENANT) });
    const r = await traiterDemande(deps, requete(demande, { "x-ma-cible-session": SESSION }));
    expect(r.status).toBe(503);
    expect(quota.consommer).not.toHaveBeenCalled();
  });

  it("compte dans masques ce que le serveur masque encore", async () => {
    const avecTelephone = `${phrase} Appelle le 06 12 34 56 78. ${"y".repeat(120)}`;
    preparer([JSON.stringify(reponseOk)], { repriseSensible: repriseMemoire(() => MAINTENANT) });
    const r = await traiterDemande(deps, requete({ ...demande, notes: [{ id: "n1", titre: "Entretien", texte: avecTelephone }] }, { "x-ma-cible-session": SESSION }));
    const corps = await corpsDe(r);
    expect(r.status).toBe(200);
    expect(corps.masques).toEqual({ mails: 0, telephones: 1, liens: 0 });
    const appel = fournisseur.appeler.mock.calls[0][0] as { utilisateur: string };
    expect(appel.utilisateur).toContain("[téléphone]");
    expect(appel.utilisateur).not.toContain("06 12 34 56 78");
  });
});

describe("extraireJson", () => {
  it("garde le texte entre la première { et la dernière }", () => {
    expect(extraireJson('Voici :\n```json\n{"a":{"b":1}}\n```')).toBe('{"a":{"b":1}}');
    expect(extraireJson("rien")).toBe("rien");
  });
});
