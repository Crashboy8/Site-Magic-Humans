// Page « Tes outils » : carte « Où j'en suis ? », deux rubriques, ordre des outils, pas de jeu vidéo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

function rubrique(nom) {
  const m = html.match(new RegExp(`<section class="outils-rubrique outils-rubrique--${nom}"[\\s\\S]*?</section>`));
  assert.ok(m, `rubrique ${nom} absente`);
  return m[0];
}
const liens = (bloc) => [...bloc.matchAll(/class="outils-btn" href="([^"]+)"/g)].map((m) => m[1]);

test("deux rubriques dans l'ordre : vie professionnelle puis vie perso et amour", () => {
  const pro = html.indexOf("outils-rubrique--pro");
  const perso = html.indexOf("outils-rubrique--perso");
  assert.ok(pro > 0 && perso > pro);
  assert.match(rubrique("pro"), />Vie professionnelle</);
  assert.match(rubrique("perso"), />Vie perso et amour</);
});

test("vie professionnelle : QCM Talent, Boussole de décision pro, Cibleur, Carte du Talent en dernier", () => {
  assert.match(rubrique("pro"), />Boussole de décision pro</);
  assert.deepEqual(liens(rubrique("pro")), ["/quiz/", "/boussole-decision/", "/boussole-decision/ma-cible/", "/carte-du-talent/"]);
});

test("vie perso et amour : Quiz Amour puis Boussole de décision perso", () => {
  assert.deepEqual(liens(rubrique("perso")), ["/quiz-amour/", "/boussole-decision/importer-quiz/?theme=amour"]);
  assert.match(rubrique("perso"), />Boussole de décision perso</);
  assert.match(rubrique("perso"), />Ouvrir la Boussole perso</);
});

test("six outils en tout, chaque rubrique a son icône, pas de jeu vidéo", () => {
  assert.equal(liens(html).length, 6);
  assert.equal((html.match(/class="outils-rubrique-icone"/g) || []).length, 2);
  assert.doesNotMatch(html, /talent-game/);
});

test("carte « Où j'en suis ? » en tête de page, avant les rubriques, hors du compte des six outils", () => {
  const m = html.match(/<section class="outils-parcours"[\s\S]*?<\/section>/);
  assert.ok(m, "carte absente");
  const carte = m[0];
  assert.ok(html.indexOf('<section class="outils-parcours"') < html.indexOf('<section class="outils-rubrique outils-rubrique--pro"'));
  assert.match(carte, /<h2 class="outils-parcours-titre" id="carte-parcours" data-en="Where am I\?" data-es="¿Dónde estoy\?">Où j'en suis&nbsp;\?<\/h2>/);
  assert.match(carte, /<a class="outils-btn outils-parcours-btn" href="\/boussole-decision\/ou-j-en-suis\/" data-en="Take stock" data-es="Hacer balance">Faire le point<\/a>/);
  assert.deepEqual(liens(carte), []);
  assert.ok(existsSync(new URL("../apps/boussole-decision/src/app/(ou-j-en-suis)/ou-j-en-suis/page.tsx", import.meta.url)), "page de l'outil absente");
});

test("adresse courte /ou-j-en-suis/ vers l'outil, temporaire", () => {
  const conf = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  for (const source of ["/ou-j-en-suis", "/ou-j-en-suis/"]) {
    const r = conf.redirects.find((x) => x.source === source);
    assert.equal(r && r.destination, "/boussole-decision/ou-j-en-suis/");
    assert.equal(r && r.permanent, false);
  }
});

test("pas de tiret long ni moyen, pied de page conservé", () => {
  assert.doesNotMatch(html, /[\u2013\u2014]/);
  for (const href of ["/outils/", "/mentions-legales/", "/confidentialite/"]) assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /js-manage-cookies/);
});

test("la page ne dit nulle part que les outils sont gratuits", () => {
  assert.doesNotMatch(html, /gratuit/i);
  assert.doesNotMatch(html, /free tool|free magic|your free/i);
  assert.match(html, /<h1 data-en="Your tools" data-es="Tus herramientas">Tes outils<\/h1>/);
});

// ---------- Espagnol : data-es à côté de data-en, même glossaire que l'application ----------
import vm from "node:vm";

const FRANCAIS_ES = new RegExp(
  "[èêàùçœâîôûëï]|(?<![\\p{L}])(est|pour|avec|vous|votre|tes|ton|ta|mon|ma|dans|pas|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça)(?![\\p{L}])|(?<![\\p{L}])(l|d|j|n|qu|c|s)['’]\\p{L}",
  "iu",
);
const decoder = (s) => s.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
const balises = [...html.matchAll(/<[a-z0-9]+\b[^>]*\bdata-en="[^"]*"[^>]*>/g)].map((m) => m[0]);
const es = (tag) => (tag.match(/data-es="([^"]*)"/) || [])[1];
const en = (tag) => (tag.match(/data-en="([^"]*)"/) || [])[1];

test("espagnol : chaque texte qui a un data-en a son data-es, et le bouton ES est dans le sélecteur de langue", () => {
  assert.ok(balises.length > 35);
  assert.deepEqual(balises.filter((tag) => !es(tag)).map(en), []);
  assert.match(html, /<button type="button" data-lang="es">ES<\/button>/);
  assert.deepEqual([...html.matchAll(/data-lang="(\w+)"/g)].map((m) => m[1]), ["fr", "en", "es"]);
});

test("espagnol : les six outils portent les noms du glossaire de l'application", () => {
  const noms = {
    "Quiz Talent Unique": "Test de Talento Único",
    "Boussole de décision pro": "Brújula de decisión pro",
    "Le Cibleur": "El Buscador de Clientes",
    "Carte du Talent": "Mapa del Talento",
    "Quiz Amour": "Test del Amor",
    "Boussole de décision perso": "Brújula de decisión personal",
  };
  const glossaire = readFileSync(new URL("../apps/boussole-decision/src/i18n/messages/espaceEs.ts", import.meta.url), "utf8");
  for (const [fr, nom] of Object.entries(noms)) {
    assert.match(html, new RegExp(`<h3 data-en="[^"]*" data-es="${nom}">${fr}</h3>`), nom);
    assert.ok(glossaire.includes(`titre: "${nom}"`), "absent du glossaire de l'application : " + nom);
  }
  assert.match(html, /data-es="Hacer el test"/);
  assert.match(html, /data-es="Hacer el Test del Amor"/);
  assert.match(html, /data-es="Abrir la Brújula personal"/);
  assert.match(html, /data-es="Dibujar mi mapa"/);
  assert.match(html, /data-es="Encontrar mis clientes"/);
});

test("espagnol : pas de français, pas de tiret long, pas de « gratuit », nombres en chiffres dans les textes data-es", () => {
  const textes = balises.map((tag) => decoder(es(tag)));
  for (const texte of textes) {
    assert.doesNotMatch(texte, FRANCAIS_ES, texte);
    assert.doesNotMatch(texte, /[—–]/, texte);
    assert.doesNotMatch(texte, /gratuit|gratis/i, texte);
  }
  // Seul le nombre « seis » reste en lettres, comme « Six outils » dans le texte français et « Six tools » dans l'anglais.
  assert.ok(textes.some((texte) => /^Seis herramientas/.test(texte)));
  assert.ok(new Set(textes).size > 30);
});

/** Un mini-document pour jouer js/i18n.js : des éléments avec data-fr / data-en / data-es, un sélecteur FR · EN · ES et un localStorage. */
function jouerI18n({ avecEspagnol, memorise = null, requete = "" }) {
  const elements = [{ innerHTML: "Quiz Talent Unique", attrs: { "data-en": "Unique Talent quiz", ...(avecEspagnol ? { "data-es": "Test de Talento Único" } : {}) } }];
  const boutons = ["fr", "en", "es"].map((lang) => ({ attrs: { "data-lang": lang }, classes: new Set(), listeners: [], getAttribute(n) { return this.attrs[n]; }, classList: { toggle: (c, on) => { on ? boutons.find((b) => b.attrs["data-lang"] === lang).classes.add(c) : boutons.find((b) => b.attrs["data-lang"] === lang).classes.delete(c); } }, addEventListener(type, fn) { this.listeners.push(fn); } }));
  for (const el of elements) {
    el.hasAttribute = (n) => n in el.attrs;
    el.getAttribute = (n) => (n in el.attrs ? el.attrs[n] : null);
    el.setAttribute = (n, v) => { el.attrs[n] = v; };
  }
  const stockage = new Map(memorise ? [["mh-lang", memorise]] : []);
  const ecouteurs = {};
  const document = {
    documentElement: { lang: "fr" },
    querySelector: (sel) => (sel === "[data-es]" && avecEspagnol ? elements[0] : null),
    querySelectorAll: (sel) => (sel === "[data-en],[data-es]" ? elements : sel === ".lang-toggle [data-lang]" ? boutons : []),
    addEventListener: (type, fn) => { ecouteurs[type] = fn; },
  };
  const contexte = { document, localStorage: { getItem: (k) => (stockage.has(k) ? stockage.get(k) : null), setItem: (k, v) => stockage.set(k, v) }, location: { search: requete }, URLSearchParams };
  vm.runInNewContext(readFileSync(new URL("../js/i18n.js", import.meta.url), "utf8"), contexte);
  ecouteurs.DOMContentLoaded();
  const clic = (lang) => boutons.find((b) => b.attrs["data-lang"] === lang).listeners.forEach((fn) => fn());
  return { elements, document, stockage, clic, actif: () => boutons.filter((b) => b.classes.has("active")).map((b) => b.attrs["data-lang"]) };
}

test("espagnol : le sélecteur affiche l'espagnol, le mémorise au clic seulement, et revient au français", () => {
  const page = jouerI18n({ avecEspagnol: true });
  assert.equal(page.elements[0].innerHTML, "Quiz Talent Unique");
  assert.equal(page.stockage.has("mh-lang"), false, "arriver sur la page n'écrit rien");
  page.clic("es");
  assert.equal(page.elements[0].innerHTML, "Test de Talento Único");
  assert.equal(page.document.documentElement.lang, "es");
  assert.equal(page.stockage.get("mh-lang"), "es");
  assert.deepEqual(page.actif(), ["es"]);
  page.clic("en");
  assert.equal(page.elements[0].innerHTML, "Unique Talent quiz");
  page.clic("fr");
  assert.equal(page.elements[0].innerHTML, "Quiz Talent Unique");
  assert.equal(page.document.documentElement.lang, "fr");
});

test("espagnol : l'espagnol mémorisé s'applique à /outils/, ?lang=es aussi ; une page sans data-es reste en français sans effacer le choix", () => {
  assert.equal(jouerI18n({ avecEspagnol: true, memorise: "es" }).elements[0].innerHTML, "Test de Talento Único");
  assert.equal(jouerI18n({ avecEspagnol: true, requete: "?lang=es" }).elements[0].innerHTML, "Test de Talento Único");
  assert.equal(jouerI18n({ avecEspagnol: true, memorise: "en" }).elements[0].innerHTML, "Unique Talent quiz");
  const autrePage = jouerI18n({ avecEspagnol: false, memorise: "es" });
  assert.equal(autrePage.elements[0].innerHTML, "Quiz Talent Unique");
  assert.equal(autrePage.document.documentElement.lang, "fr");
  assert.equal(autrePage.stockage.get("mh-lang"), "es", "le choix n'est pas effacé");
  // Sans data-es sur l'élément, l'espagnol retombe sur le français (le texte source), jamais sur l'anglais.
  const sansEs = jouerI18n({ avecEspagnol: true });
  delete sansEs.elements[0].attrs["data-es"];
  sansEs.clic("es");
  assert.equal(sansEs.elements[0].innerHTML, "Quiz Talent Unique");
});
