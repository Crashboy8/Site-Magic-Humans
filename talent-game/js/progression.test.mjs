// Progression du jeu (js/progression.js) : ce que garde le navigateur et ce qui part vers le compte.
// Lancement : node --test talent-game/js/progression.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const code = readFileSync(new URL("./progression.js", import.meta.url), "utf8");
const copie = (v) => (v === undefined || v === null ? v : JSON.parse(JSON.stringify(v)));

/** Le script chargé hors d'une page, avec un faux navigateur : stockage en mémoire, cookies et fetch au choix. */
function charger({ cookie = "", reponse = null } = {}) {
  const stock = new Map();
  const appels = [];
  const bac = {
    localStorage: { getItem: (k) => (stock.has(k) ? stock.get(k) : null), setItem: (k, v) => stock.set(k, String(v)) },
    document: { cookie },
    fetch: async (url, options) => {
      appels.push({ url, methode: options.method, corps: options.body ? JSON.parse(options.body) : null, credentials: options.credentials });
      return { ok: true, json: async () => reponse };
    },
  };
  vm.runInNewContext(code, bac);
  return { P: bac.MHProgression, stock, appels };
}

const MAINTENANT = new Date("2026-10-10T10:00:00Z");

test("sans compte : rien n'est envoyé, tout reste dans le navigateur", async () => {
  const { P, stock, appels } = charger();
  P.ecrire(P.gagner(P.lire(), 20, ["premier-pas"], MAINTENANT));
  assert.equal(await P.lireCompte(), null);
  assert.equal(await P.envoyer(P.lire()), null);
  assert.deepEqual(appels, []);
  assert.deepEqual(JSON.parse(stock.get(P.CLE)), { v: 1, aEnvoyer: 20, badges: ["premier-pas"], serieJours: 1, maj: MAINTENANT.toISOString() });
});

test("reconnaît le cookie de session de la Boussole, sans le lire", () => {
  const { P } = charger();
  assert.equal(P.sessionOuverte("sb-lpfivkrypbpcyczmgdds-auth-token=base64-xxx"), true);
  assert.equal(P.sessionOuverte("autre=1; sb-abc-auth-token.0=base64-xxx"), true);
  assert.equal(P.sessionOuverte("consentement=oui"), false);
  assert.equal(P.sessionOuverte(""), false);
});

test("avec un compte : envoie les points à la route, sur la même adresse, avec la session", async () => {
  const progression = { xp: 54, niveau: "2", badges: ["premier-pas", "en-mouvement"], serieJours: 3, misAJour: MAINTENANT.toISOString(), prochain: { id: "sur-la-lancee", seuil: 150, manque: 96 } };
  const { P, appels } = charger({ cookie: "sb-x-auth-token=1", reponse: { compte: true, table: true, progression } });
  const e = P.gagner(P.lire(), 30, [], MAINTENANT);
  assert.deepEqual(copie(await P.envoyer(e)), progression);
  assert.deepEqual(appels, [
    { url: "/boussole-decision/api/progression/", methode: "POST", corps: { ajout: 30, badges: [], serieJours: 1, maj: MAINTENANT.toISOString(), repartir: false }, credentials: "same-origin" },
  ]);
});

test("compte sans table, ou essai sans compte : le jeu reste sur le navigateur", async () => {
  for (const reponse of [{ compte: true, table: false }, { compte: false }, null, { compte: true, table: true, progression: { xp: -3 } }]) {
    const { P } = charger({ cookie: "sb-x-auth-token=1", reponse });
    assert.equal(await P.lireCompte(), null);
  }
});

test("série : le même jour une fois, la veille prolonge, un trou relance", () => {
  const { P } = charger();
  let e = P.gagner(P.vide(), 5, [], new Date("2026-10-08T09:00:00Z"));
  e = P.gagner(e, 5, [], new Date("2026-10-08T17:00:00Z"));
  assert.equal(e.serieJours, 1);
  e = P.gagner(e, 5, [], new Date("2026-10-09T09:00:00Z"));
  assert.equal(e.serieJours, 2);
  assert.equal(P.serieEnCours(e, new Date("2026-10-10T09:00:00Z")), 2);
  assert.equal(P.serieEnCours(e, new Date("2026-10-12T09:00:00Z")), 0);
  e = P.gagner(e, 5, [], new Date("2026-10-12T09:00:00Z"));
  assert.equal(e.serieJours, 1);
  assert.equal(e.aEnvoyer, 20);
});

test("« Repartir à zéro » : plus rien à envoyer, plus de badge, la série reste", () => {
  const { P } = charger();
  const e = { v: 1, aEnvoyer: 40, badges: ["premier-pas"], serieJours: 4, maj: MAINTENANT.toISOString() };
  assert.deepEqual(copie(P.repartir(e)), { v: 1, aEnvoyer: 0, badges: [], serieJours: 4, maj: MAINTENANT.toISOString() });
});

test("un enregistrement abîmé repart de zéro sans casser le jeu", () => {
  const { P } = charger();
  for (const brut of ["{", '{"v":2}', '{"v":1,"aEnvoyer":-1,"badges":[],"serieJours":0}', null]) {
    assert.deepEqual(copie(P.lireTexte(brut)), { v: 1, aEnvoyer: 0, badges: [], serieJours: 0, maj: null });
  }
});
