/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ENTREE_EXEMPLE, RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { ErreurFournisseur, type Fournisseur } from "@/lib/ia/fournisseur";
import { quotaMemoire, type Quota } from "./quota";
import { cleCompteur, extraireJson, traiterDemande, type Dependances } from "./traitement";

const ORIGINE = "https://www.magichumans.com";
const ESQUISSE = {
  offre: "Je remets les équipes qui ne se parlent plus autour de la table.",
  cibles: [
    { id: "c1", nom: "Directeurs de sites", marche: "b2b", enUneLigne: "Directeurs de site après une réorganisation tendue", pourquoi: "Ton Contexte Déclencheur est leur situation." },
    { id: "c2", nom: "Dirigeants de PME", marche: "b2b", enUneLigne: "Fondateurs dont le comité de direction ne décide plus", pourquoi: "Tu poses les questions que personne n'ose poser." },
    { id: "c3", nom: "Managers promus", marche: "b2c", enUneLigne: "Managers promus qui héritent d'une équipe divisée", pourquoi: "Tu aides à préparer les conversations difficiles." },
  ],
  antiCible: "Les grands groupes qui achètent un atelier comme une case à cocher.",
  hypotheses: [],
};
const CADRAGE_ESQUISSE = { statut: "esquisse", message: "", questions: [], esquisse: ESQUISSE };
const CADRAGE_QUESTIONS = {
  statut: "questions",
  message: "",
  questions: [{ id: "q1", question: "Interviens-tu surtout en groupe ?", pourquoi: "Cela change les cibles proposées.", type: "choix", options: ["En groupe", "En individuel"], exemple: "" }],
  esquisse: { offre: "", cibles: [], antiCible: "", hypotheses: [] },
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

function preparer(reponses: (string | Error)[], surcharge: Partial<Dependances> = {}) {
  fournisseur = fournisseurSimule(reponses);
  deps = { fournisseur, quota: quotaMemoire({ ipCadrage: 8, ipResultat: 3, globalCadrage: 600, globalResultat: 200 }, () => MAINTENANT), maintenant: () => MAINTENANT, env: ENV, ...surcharge };
}
const corpsDe = async (r: Response) => (await r.json()) as any;

let erreurConsole: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
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
  it("413 quand content-length dépasse 16 000 octets", async () => {
    const r = await traiterDemande(deps, requete(demandeCadrage(), { "content-length": "16001" }));
    expect(r.status).toBe(413);
    expect((await corpsDe(r)).code).toBe("trop_long");
  });
  it("413 quand le corps réel dépasse 16 000 octets", async () => {
    const e = structuredClone(ENTREE_EXEMPLE);
    e.talent.reussite = "é".repeat(9000); // 18 000 octets en UTF-8, 9 000 caractères
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
    preparer(Array(4).fill(JSON.stringify(RESULTAT_EXEMPLE)));
    for (let i = 0; i < 3; i++) expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeResultat()));
    expect(r.status).toBe(429);
    expect(await corpsDe(r)).toEqual({ ok: false, code: "quota_ip", etape: "resultat", max: 3, reessayerApres: "2026-10-10T22:00:00.000Z" });
    expect(r.headers.get("Retry-After")).toBe(String(12 * 3600));
    expect(fournisseur.appeler).toHaveBeenCalledTimes(3);
  });
  it("429 quota_global quand le plafond du jour est atteint", async () => {
    preparer([JSON.stringify(RESULTAT_EXEMPLE)], {
      env: { ...ENV, MA_CIBLE_MAX_GLOBAL_RESULTAT: "1" },
      quota: quotaMemoire({ ipCadrage: 8, ipResultat: 3, globalCadrage: 600, globalResultat: 1 }, () => MAINTENANT),
    });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    const r = await traiterDemande(deps, requete(demandeResultat(), { "x-forwarded-for": "198.51.100.4" }));
    expect(r.status).toBe(429);
    expect(await corpsDe(r)).toMatchObject({ code: "quota_global", max: 1 });
  });
  it("la clé du compteur est une empreinte sha256, jamais l'IP", async () => {
    const consommer = vi.fn(async () => ({ ok: true, restant: 1 }));
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { quota: { consommer } satisfies Quota });
    await traiterDemande(deps, requete(demandeCadrage()));
    const [cle, etape] = consommer.mock.calls[0] as unknown as [string, string];
    expect(cle).toMatch(/^[0-9a-f]{64}$/);
    expect(cle).toBe(cleCompteur(ENV.MA_CIBLE_SEL, "2026-10-10", "203.0.113.7"));
    expect(cle).not.toContain("203");
    expect(etape).toBe("cadrage");
  });
  it("IP inconnue sans en-tête", async () => {
    expect(cleCompteur("s", "2026-10-10", "inconnue")).toMatch(/^[0-9a-f]{64}$/);
    const consommer = vi.fn(async () => ({ ok: true, restant: 1 }));
    preparer([JSON.stringify(CADRAGE_ESQUISSE)], { quota: { consommer } });
    await traiterDemande(deps, requete(demandeCadrage(), { "x-forwarded-for": null }));
    expect((consommer.mock.calls[0] as unknown as [string])[0]).toBe(cleCompteur(ENV.MA_CIBLE_SEL, "2026-10-10", "inconnue"));
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
    expect(appel.maxTokens).toBe(1500);
    expect(appel.delaiMs).toBe(30000);
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
    expect(appel.maxTokens).toBe(9000);
    expect(appel.delaiMs).toBeLessThanOrEqual(105000);
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
  it("validation en échec puis valide : 200, et le quota n'est consommé qu'une fois", async () => {
    const mauvais = structuredClone(RESULTAT_EXEMPLE) as any;
    mauvais.cibles[0].messages.linkedin = "trop court";
    const consommer = vi.fn(async () => ({ ok: true, restant: 2 }));
    preparer([JSON.stringify(mauvais), JSON.stringify(RESULTAT_EXEMPLE)], { quota: { consommer } });
    expect((await traiterDemande(deps, requete(demandeResultat()))).status).toBe(200);
    expect(consommer).toHaveBeenCalledTimes(1);
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

describe("extraireJson", () => {
  it("garde le texte entre la première { et la dernière }", () => {
    expect(extraireJson('Voici :\n```json\n{"a":{"b":1}}\n```')).toBe('{"a":{"b":1}}');
    expect(extraireJson("rien")).toBe("rien");
  });
});
