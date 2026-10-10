// Barre « Mon parcours · Mes outils » du site statique (js/parcours-barre.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const lire = (chemin) => readFileSync(new URL(chemin, import.meta.url), "utf8");
const code = lire("./parcours-barre.js");

/** Le script chargé hors d'une page : il expose ses fonctions pures et ne touche à rien. */
function charger() {
  const bac = {};
  vm.runInNewContext(code, bac);
  assert.ok(bac.MHParcoursBarre, "le script n'expose pas MHParcoursBarre");
  return bac.MHParcoursBarre;
}
/* Ce que renvoie le script vient d'un autre « monde » JavaScript : on le recopie pour que deepEqual compare des objets de ce monde-ci. */
const copie = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const brut = charger();
const B = Object.fromEntries(Object.entries(brut).map(([cle, v]) => [cle, typeof v === "function" ? (...a) => copie(v(...a)) : copie(v)]));

const FRANCAIS_ES = new RegExp(
  "[èêàùçœâîôûëï]|(?<![\\p{L}])(est|pour|avec|vous|votre|tes|ton|ta|mon|ma|dans|pas|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça)(?![\\p{L}])|(?<![\\p{L}])(l|d|j|n|qu|c|s)['’]\\p{L}",
  "iu",
);

test("le script se charge sans page : aucune erreur, aucun effet", () => {
  assert.equal(typeof B.contenu, "function");
  assert.equal(B.CLE, "ou_j_en_suis_resume_v1");
});

test("les six outils : mêmes adresses, même ordre, mêmes noms et mêmes couleurs que la page Tes outils", () => {
  const page = lire("../outils/index.html");
  const cartes = [...page.matchAll(/<li class="outils-carte[^"]*" style="--accent:(#[0-9A-Fa-f]{6});--accent-fond:(#[0-9A-Fa-f]{6})[^"]*">([\s\S]*?)<\/li>/g)].map((m) => ({
    forte: m[1].toUpperCase(),
    fond: m[2].toUpperCase(),
    lien: /class="outils-btn" href="([^"]+)"/.exec(m[3])[1],
    nom: /<h3 data-en="([^"]*)" data-es="([^"]*)">([^<]*)<\/h3>/.exec(m[3]).slice(1),
  }));
  assert.equal(cartes.length, 6);
  // La page range : Quiz, Boussole pro, Cibleur, Carte, puis Quiz Amour et Boussole perso. La barre suit cet ordre.
  assert.deepEqual(B.OUTILS.map((o) => o.cle), ["qcm", "boussole", "cibleur", "carte", "amour", "relation"]);
  B.OUTILS.forEach((o, i) => {
    assert.equal(o.chemin, cartes[i].lien, o.cle);
    assert.equal(o.forte.toUpperCase(), cartes[i].forte, o.cle);
    assert.equal(o.fond.toUpperCase(), cartes[i].fond, o.cle);
    assert.equal(o.noms.fr, cartes[i].nom[2], o.cle);
    assert.equal(o.noms.en, cartes[i].nom[0], o.cle);
    assert.equal(o.noms.es, cartes[i].nom[1], o.cle);
  });
});

test("les rubriques portent les noms de la page Tes outils", () => {
  const page = lire("../outils/index.html");
  for (const [cle, lg] of [["pro", 0], ["coeur", 1]]) {
    const m = [...page.matchAll(/<span data-en="([^"]*)" data-es="([^"]*)">(Vie [^<]*)<\/span><\/h2>/g)][lg];
    assert.equal(B.TEXTES.fr[cle], m[3]);
    assert.equal(B.TEXTES.en[cle], m[1]);
    assert.equal(B.TEXTES.es[cle], m[2]);
  }
});

test("textes : mêmes clés en français, anglais et espagnol, sans tiret long, sans français dans l'espagnol, rien de « gratuit »", () => {
  const cles = Object.keys(B.TEXTES.fr).sort();
  for (const lg of ["en", "es"]) assert.deepEqual(Object.keys(B.TEXTES[lg]).sort(), cles, lg);
  for (const lg of ["fr", "en", "es"]) {
    for (const [cle, texte] of Object.entries(B.TEXTES[lg])) {
      assert.ok(texte.trim().length > 0, `${lg}.${cle}`);
      assert.doesNotMatch(texte, /[\u2013\u2014]/, `${lg}.${cle}`);
      assert.doesNotMatch(texte, /gratuit|gratis|\bfree\b/i, `${lg}.${cle}`);
    }
  }
  for (const [cle, texte] of Object.entries(B.TEXTES.es)) assert.doesNotMatch(texte, FRANCAIS_ES, `es.${cle} : ${texte}`);
  assert.doesNotMatch(code, /[\u2013\u2014]/, "tiret long dans le script");
});

test("les textes sont ceux de l'application (Mon parcours, Mes outils, créer mon compte, …)", () => {
  const app = lire("../apps/boussole-decision/src/i18n/messages/espace.ts");
  const bloc = /barre: \{([\s\S]*?)\n  \},/.exec(app)[1];
  for (const cle of ["parcours", "aucun", "outils", "ici", "compteTitre", "compteTexte", "creer", "connecter", "espace", "compteOk"]) {
    const m = new RegExp(`${cle}: "([^"]*)"`).exec(bloc);
    assert.ok(m, `espace.ts n'a pas ${cle}`);
    assert.equal(B.TEXTES.fr[cle], m[1], cle);
  }
});

test("l'instantané : accepte celui de l'application, refuse le reste", () => {
  const bon = JSON.stringify({ v: 1, maj: "2026-10-09T10:00:00.000Z", etape: "E2 + S2", fin: false, points: 34 });
  assert.deepEqual(B.lireInstantane(bon), { v: 1, maj: "2026-10-09T10:00:00.000Z", etape: "E2 + S2", fin: false, points: 34 });
  assert.deepEqual(B.lireInstantane(JSON.stringify({ v: 1, maj: "x", etape: "", fin: false, points: 0 })).etape, "");
  for (const mauvais of [
    null,
    "",
    "pas du json",
    "null",
    JSON.stringify({ v: 2, maj: "x", etape: "S2", fin: false, points: 1 }),
    JSON.stringify({ v: 1, maj: "x", etape: "S2", fin: false, points: -1 }),
    JSON.stringify({ v: 1, maj: "x", etape: "S2", fin: false, points: 1.5 }),
    JSON.stringify({ v: 1, maj: "x", etape: "S2", fin: false, points: 100001 }),
    JSON.stringify({ v: 1, maj: "x", etape: "<img src=x onerror=alert(1)>", fin: false, points: 1 }),
    JSON.stringify({ v: 1, maj: "x", etape: "S2", fin: "non", points: 1 }),
    JSON.stringify({ v: 1, maj: 5, etape: "S2", fin: false, points: 1 }),
  ]) {
    assert.equal(B.lireInstantane(mauvais), null, String(mauvais));
  }
});

test("la session : le cookie Supabase se reconnaît, un cookie voisin non", () => {
  assert.equal(B.aSession("a=1; sb-lpfivkrypbpcyczmgdds-auth-token=base64-xyz; b=2"), true);
  assert.equal(B.aSession("sb-lpfivkrypbpcyczmgdds-auth-token.0=abc; sb-lpfivkrypbpcyczmgdds-auth-token.1=def"), true);
  assert.equal(B.aSession("sb-lpfivkrypbpcyczmgdds-auth-token-code-verifier=abc"), false);
  assert.equal(B.aSession("mh-lang=fr; _ga=GA1"), false);
  assert.equal(B.aSession(""), false);
  assert.equal(B.aSession(undefined), false);
});

test("l'outil ouvert se déduit de l'adresse", () => {
  assert.equal(B.outilCourant("/quiz/", ""), "qcm");
  assert.equal(B.outilCourant("/quiz/", "?lang=en"), "qcm");
  assert.equal(B.outilCourant("/quiz/", "?theme=amour"), "amour");
  assert.equal(B.outilCourant("/quiz/", "?lang=es&theme=amour"), "amour");
  assert.equal(B.outilCourant("/quiz-amour/", ""), "amour");
  assert.equal(B.outilCourant("/carte-du-talent/", "#q=abc"), "carte");
  assert.equal(B.outilCourant("/outils/", ""), null);
});

test("adresses : le parcours public sans compte, Mon espace avec un compte ; l'inscription revient dans Mon espace", () => {
  assert.equal(B.lienParcours(false), "/boussole-decision/ou-j-en-suis/");
  assert.equal(B.lienParcours(true), "/boussole-decision/mon-espace/");
  assert.equal(B.lienCompte(false), "/boussole-decision/inscription/?suite=%2Fmon-espace%2F");
  assert.equal(B.lienCompte(true), "/boussole-decision/mon-espace/");
  assert.equal(B.lienConnexion(), "/boussole-decision/connexion/?suite=%2Fmon-espace%2F");
  const quiz = B.OUTILS.find((o) => o.cle === "qcm");
  assert.equal(B.lienOutil(quiz, "fr"), "/quiz/");
  assert.equal(B.lienOutil(quiz, "es"), "/quiz/?lang=es");
  const carte = B.OUTILS.find((o) => o.cle === "carte");
  assert.equal(B.lienOutil(carte, "en"), "/carte-du-talent/");
});

test("l'état affiché : étape et points, deux étapes en voie E, Ton Ikigai à la fin, une invitation sans instantané", () => {
  const T = B.TEXTES.fr;
  assert.equal(B.etat(T, null), "Fais le point en 2 minutes");
  assert.equal(B.etat(T, { etape: "S2", fin: false, points: 34 }), "Étape S2 · 34 points");
  assert.equal(B.etat(T, { etape: "E2 + S2", fin: false, points: 1 }), "Étape E2 + S2 · 1 point");
  assert.equal(B.etat(T, { etape: "IK", fin: true, points: 120 }), "Ton Ikigai · 120 points");
  assert.equal(B.etat(T, { etape: "", fin: false, points: 6 }), "6 points");
  assert.equal(B.etat(B.TEXTES.es, { etape: "S2", fin: false, points: 34 }), "Etapa S2 · 34 puntos");
  assert.equal(B.etat(B.TEXTES.en, { etape: "S2", fin: false, points: 34 }), "Step S2 · 34 points");
});

test("le contenu : l'outil ouvert est marqué « Tu es ici », les autres sont des liens, quiz dans la langue", () => {
  const v = B.contenu("es", "amour", false, null).barre;
  assert.match(v, /href="\/boussole-decision\/ou-j-en-suis\/"/);
  assert.match(v, /href="\/quiz\/\?lang=es"/);
  assert.match(v, /href="\/quiz-amour\/\?lang=es" aria-current="page"/);
  assert.equal((v.match(/aria-current="page"/g) || []).length, 1);
  assert.match(v, /Estás aquí/);
  assert.match(v, /Crear mi cuenta/);
  assert.match(v, /href="\/boussole-decision\/inscription\/\?suite=%2Fmon-espace%2F"/);
  assert.match(v, /Haz balance en 2 minutos/);
  assert.equal((v.match(/class="mhp-lien"/g) || []).length, 6, "un lien par outil");
});

test("le contenu avec un compte : Mon espace partout, plus d'appel à créer un compte", () => {
  const v = B.contenu("fr", "carte", true, { etape: "S2", fin: false, points: 34 }).barre;
  assert.match(v, /href="\/boussole-decision\/mon-espace\/"/);
  assert.doesNotMatch(v, /inscription/);
  assert.doesNotMatch(v, /Créer mon compte/);
  assert.match(v, /Ton travail est gardé dans ton compte/);
  assert.match(v, /Étape S2 · 34 points/);
});

test("le script est branché sur le Quiz et sur la Carte du Talent, qui garde ses fenêtres sous la barre", () => {
  assert.match(lire("../quiz/index.html"), /<script src="\/js\/parcours-barre\.js" defer><\/script>/);
  assert.match(lire("../carte-du-talent/index.html"), /<script src="\/js\/parcours-barre\.js" data-outil="carte" defer><\/script>/);
  const css = lire("../carte-du-talent/css/ui.css");
  assert.match(css, /body \.flow,\s*body \.progres,\s*body \.creation,\s*body \.panneau \{ top: var\(--mhp-h, 0px\); \}/);
  assert.match(css, /@media \(max-width: 640px\) \{ body \.panneau \{ top: auto; \} \}/);
});

test("la barre ne s'imprime pas et s'adapte au thème sombre du Quiz", () => {
  assert.match(B.CSS, /@media print\{\.mhp\{display:none!important\}\}/);
  assert.match(B.CSS, /prefers-color-scheme:dark/);
  assert.match(B.CSS, /:root\[data-theme=dark\] \.mhp/);
});
