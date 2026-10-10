// « Demander l'avis de Pierre » sur le site statique (js/avis-pierre.js). Lancement : node --test js/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), "utf8");
const code = lire("./avis-pierre.js");
const bac = {};
vm.runInNewContext(code, bac);
const A = bac.MHAvisPierre;
const copie = (v) => JSON.parse(JSON.stringify(v));

const FRANCAIS_ES = new RegExp(
  "[èêàùçœâîôûëï]|(?<![\\p{L}])(est|pour|avec|vous|votre|tes|ton|ta|mon|ma|dans|pas|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça)(?![\\p{L}])|(?<![\\p{L}])(l|d|j|n|qu|c|s)['’]\\p{L}",
  "iu",
);
const chaines = (v) => (typeof v === "string" ? [v] : Object.values(v).flatMap(chaines));
const forme = (v) => (typeof v === "string" ? "s" : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, forme(x)])));

test("le script se charge sans page : aucune erreur, aucun effet", () => {
  assert.ok(A, "le script n'expose pas MHAvisPierre");
  assert.equal(A.API, "/boussole-decision/api/intention/");
  assert.equal(A.QUESTION_MAX, 500);
});

test("textes en français, anglais et espagnol : mêmes clés, aucun tiret long, rien de vide", () => {
  const T = copie(A.TEXTES);
  assert.deepEqual(Object.keys(T), ["fr", "en", "es"]);
  assert.deepEqual(forme(T.en), forme(T.fr));
  assert.deepEqual(forme(T.es), forme(T.fr));
  for (const l of ["fr", "en", "es"]) {
    for (const t of chaines(T[l])) {
      assert.ok(t.trim().length > 0);
      assert.doesNotMatch(t, /[\u2013\u2014]/, `${l} : ${t}`);
    }
  }
  assert.deepEqual(chaines(T.es).filter((t) => FRANCAIS_ES.test(t)), []);
  assert.equal(T.fr.bouton, "Demander l'avis de Pierre");
  assert.equal(T.fr.accord, "J'accepte que Pierre me réponde par mail");
});

test("compteur, erreurs et typographie", () => {
  assert.equal(A.compteur("fr", 12), "12 / 500 caractères");
  assert.equal(A.compteur("es", 0), "0 / 500 caracteres");
  assert.equal(A.messageErreur("en", "attendre"), A.insecables(copie(A.TEXTES).en.erreurs.attendre));
  assert.match(A.messageErreur("en", "attendre"), /10\u00a0minutes/);
  assert.equal(A.messageErreur("fr", "invalide"), A.messageErreur("fr", "question"));
  assert.equal(A.messageErreur("fr", "inconnu"), A.messageErreur("fr", "indisponible"));
  assert.equal(A.insecables("Où j'en suis ?"), "Où j'en suis ?");
  assert.equal(A.longueur("🙂🙂"), 2);
});

test("la langue suit la page, puis le choix du site, sinon le français", () => {
  const doc = (lang) => ({ documentElement: { lang } });
  const win = (v) => ({ localStorage: { getItem: () => v } });
  assert.equal(A.langue(doc("es"), win(null)), "es");
  assert.equal(A.langue(doc("en-GB"), win(null)), "en");
  assert.equal(A.langue(doc(""), win("es")), "es");
  assert.equal(A.langue(doc("de"), win("xx")), "fr");
});

test("chaque outil du site statique charge le script et pose son emplacement", () => {
  const quiz = lire("../quiz/index.html");
  assert.match(quiz, /<script src="\/js\/avis-pierre\.js" defer><\/script>/);
  assert.match(quiz, /data-avis-pierre data-outil="quiz-talent" data-etape="\$\{ctx\.locked \? "resultats-partiels" : "resultats"\}"/);
  assert.match(lire("../quiz/amour.js"), /data-avis-pierre data-outil="quiz-amour" data-etape="resultats"/);
  const carte = lire("../carte-du-talent/index.html");
  assert.match(carte, /<script src="\/js\/avis-pierre\.js" defer><\/script>/);
  assert.match(carte, /data-avis-pierre data-outil="carte-talent" data-etape="carte"/);
  assert.match(lire("../talent-game/index.html"), /<script src="\/js\/avis-pierre\.js"><\/script>/);
  const jeu = lire("../talent-game/js/app.js");
  assert.match(jeu, /data-avis-pierre data-outil="jeu" data-etape="\$\{this\.state\.activeTab\}"/);
  assert.match(jeu, /data-avis-pierre data-outil="jeu" data-etape="onboarding-\$\{step\.etape\}"/);
});

test("la question n'est jamais écrite comme du HTML, et aucun numéro de téléphone ni lien de messagerie", () => {
  assert.doesNotMatch(code, /question[^;\n]*innerHTML|innerHTML\s*=\s*[^I;\n]*(question|q\b|j\.)/);
  assert.doesNotMatch(code, /wa\.me|whatsapp|tel:/i);
  assert.doesNotMatch(code, /(\+33|\b0[1-9])([\s.-]?\d{2}){4}/);
});
