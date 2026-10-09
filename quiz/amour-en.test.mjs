// node --test quiz/amour-en.test.mjs · Quiz Amour en anglais (lot EN 2)
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import test from "node:test";

const require = createRequire(import.meta.url);
const FR = require("./amour-data.js");
const EN_OVERLAY = require("./amour-data-en.js");
const E = require("./amour-engine.js");
const EN = E.withLanguage(FR, EN_OVERLAY);

/** Mêmes règles que l'extraction des textes à traduire : un texte affiché, pas un identifiant ni une icône. */
function translatable(key, v) {
  if (typeof v !== "string" || key === "id") return false;
  if (/^#[0-9a-f]{3,8}$/i.test(v) || v.trim().startsWith("<svg") || /^(https?:|\/|mailto:)/.test(v)) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(v.replace(/\{[a-zA-Z0-9_]+\}/g, ""))) return false;
  if (key === "short" || key === "name") return true;
  return !/^[a-z0-9_:+.-]+$/.test(v);
}
function texts(data) {
  const out = new Map();
  (function walk(v, path, key) {
    if (path === "config" || path === "profil.icons" || path === "lang") return;
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, path + "[" + i + "]", key));
    else if (v && typeof v === "object") for (const k of Object.keys(v)) walk(v[k], path ? path + "." + k : k, k);
    else if (translatable(key, v)) out.set(path, v);
  })(data, "", "");
  return out;
}
function at(data, path) {
  return path.match(/[^.[\]]+|\[\d+\]/g).reduce((o, part) => (o == null ? o : o[part.startsWith("[") ? Number(part.slice(1, -1)) : part]), data);
}
function structure(v) {
  if (typeof v === "string") return "s";
  if (Array.isArray(v)) return v.map(structure);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).map((k) => [k, structure(v[k])]));
  return v;
}
const placeholders = (s) => (String(s).match(/\{[a-zA-Z0-9_]+\}/g) || []).sort().join(",");
const FRENCH = /[àâçéèêëîïôûùœÀÂÇÉÈÊÎÔÛ«»]|\b(tu|ton|ta|tes|toi|le|la|les|des|et|avec|pour|une|est|pas)\b/;
// Mots identiques dans les 2 langues : noms propres ou mots transparents.
const SAME_OK = new Set(["Respect", "respect", "Ambition", "ambition", "Admiration", "admiration", "Oasis", "social", "Humour", "{x}/{min} minimum", "{n} participants"]);

const frTexts = texts(FR);
const enTexts = texts(EN);

test("couverture : chaque texte français affiché a sa version anglaise", () => {
  const missing = [];
  for (const [path, fr] of frTexts) {
    const en = at(EN, path);
    if (typeof en !== "string" || (en === fr && !SAME_OK.has(fr))) missing.push(path);
  }
  assert.deepEqual(missing, []);
  assert.ok(frTexts.size > 1300, "l'extraction couvre tout le quiz");
});

test("la traduction garde la structure, les identifiants, les scores et les mêmes {variables}", () => {
  assert.deepEqual(structure(EN), structure(FR));
  assert.equal(EN.lang, "en");
  assert.equal(FR.lang, "fr");
  assert.deepEqual(EN.config, FR.config);
  assert.deepEqual(EN.profil.order, FR.profil.order);
  assert.deepEqual(EN.screens.map((s) => s.groups ? s.groups.map((g) => g.items.map((it) => [it.id, it.need, it.w])) : s.items.map((it) => it.id)),
    FR.screens.map((s) => s.groups ? s.groups.map((g) => g.items.map((it) => [it.id, it.need, it.w])) : s.items.map((it) => it.id)));
  const wrong = [];
  for (const [path, fr] of frTexts) if (placeholders(fr) !== placeholders(at(EN, path))) wrong.push(path);
  assert.deepEqual(wrong, []);
  // Le fichier anglais ne contient que des textes : aucune clé inconnue de la base.
  (function walk(o, b, path) {
    if (o === null || typeof o !== "object") return;
    for (const k of Object.keys(o)) {
      assert.ok(b && Object.prototype.hasOwnProperty.call(b, k), "clé inconnue : " + path + k);
      walk(o[k], b[k], path + k + ".");
    }
  })(EN_OVERLAY, FR, "");
});

test("anglais propre : pas de français, pas de tiret long, nombres en chiffres", () => {
  const bad = [];
  for (const [path, en] of enTexts) {
    if (path === "profil.encyclo.regle") continue; // note interne, jamais affichée
    if (FRENCH.test(en)) bad.push(path + " (français) " + en);
    if (/[—–]/.test(en)) bad.push(path + " (tiret long) " + en);
    if (/\b(two|three|four|five|six|seven|eight|nine|ten|twenty|thirty)\b/i.test(en)) bad.push(path + " (nombre en lettres) " + en);
    if (/\b\d+ (?=[A-Za-z])/.test(en)) bad.push(path + " (espace sécable après un nombre) " + en);
  }
  assert.deepEqual(bad, []);
});

test("les noms des 7 familles et des 42 profils : adjectif puis nom en anglais", () => {
  const B = EN.profil.besoins;
  assert.deepEqual(EN.profil.order.map((id) => B[id].name), ["Security", "Depth", "Admiration", "Freedom", "Harmony", "Closeness", "Intensity"]);
  assert.deepEqual(EN.profil.order.map((id) => B[id].noun), ["Anchor", "Mirror", "Star", "Bird", "Oasis", "Team", "Volcano"]);
  assert.deepEqual(EN.profil.order.map((id) => B[id].adj), ["Loyal", "Deep", "Radiant", "Free", "Peaceful", "Playful", "Passionate"]);
  assert.equal(EN.engine.nameOrder, "adj-noun");
  assert.equal(FR.engine.nameOrder, "noun-adj");
  // Les nuances de l'encyclopédie commencent par l'adjectif anglais, pour que le libellé en gras se détache.
  for (const id of EN.profil.order) {
    for (const [other, line] of Object.entries(EN.profil.encyclo.cards[id].nuances)) {
      assert.ok(line.startsWith(B[other].adj + ": "), id + "/" + other + " : " + line);
    }
  }
});

function answersFor(D, seed) {
  let s = seed >>> 0;
  const r = () => ((s = (Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296);
  const shuffle = (list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const a = {};
  for (const sc of D.screens) {
    if (sc.type === "pick") {
      const bag = { picked: {}, other: {}, order: {} };
      for (const g of sc.groups) {
        const cap = g.max ? Math.min(g.max, g.items.length) : g.items.length;
        let ids = shuffle(g.items.map((it) => it.id)).slice(0, g.min + Math.floor(r() * (Math.max(0, cap - g.min) + 1)));
        if (sc.exclusive) for (const pair of sc.exclusive) if (pair.every((id) => ids.includes(id))) ids = ids.filter((id) => id !== pair[1]);
        bag.picked[g.id] = ids;
        bag.other[g.id] = [];
        if (sc.rank) bag.order[g.id] = shuffle(ids);
      }
      a[sc.id] = bag;
    } else {
      a[sc.id] = { order: shuffle(sc.items.map((it) => it.id)) };
    }
  }
  return a;
}

test("le profil calculé en anglais a les mêmes scores et les mêmes critères qu'en français", () => {
  for (let seed = 1; seed <= 60; seed++) {
    const answers = answersFor(FR, seed);
    let fr;
    try { fr = E.computeLoveProfile(answers, FR, "Sam"); } catch (e) { continue; }
    const en = E.computeLoveProfile(answers, EN, "Sam");
    assert.deepEqual(en.boussole.imp, fr.boussole.imp);
    assert.deepEqual(en.boussole.crit.map((c) => [c.id, c.g, c.c, c.i, c.n, c.a]), fr.boussole.crit.map((c) => [c.id, c.g, c.c, c.i, c.n, c.a]));
    assert.equal(en.profil.dom, fr.profil.dom);
    assert.equal(en.profil.sec, fr.profil.sec);
    const B = EN.profil.besoins;
    assert.equal(en.profil.name.text, B[en.profil.sec].adj + " " + B[en.profil.dom].noun);
    for (const c of en.boussole.crit) {
      assert.doesNotMatch(c.l, /\b(you|your|yours|yourself)\b/i, "critère à la 1re personne : " + c.l);
      assert.doesNotMatch(c.l, FRENCH, c.l);
    }
    for (const note of Object.values(en.boussole.notes)) assert.doesNotMatch(note, FRENCH, note);
    for (const line of en.profil.sentences) assert.doesNotMatch(line, FRENCH, line);
  }
});

test("firstPerson en anglais : you devient I, your devient my", () => {
  assert.equal(E.firstPerson("A partner who tells you what they love about you", "en"), "A partner who tells me what they love about me");
  assert.equal(E.firstPerson("You're free to keep your own space", "en"), "I'm free to keep my own space");
  assert.equal(E.firstPerson("Un partenaire qui te laisse ton espace", "fr"), "Un partenaire qui me laisse mon espace");
});

test("withLanguage : un texte absent garde le français, les nombres et booléens restent ceux de la base", () => {
  const base = { a: "Bonjour", n: 3, b: true, list: ["un", "deux"], o: { x: "oui" }, lang: "fr" };
  const merged = E.withLanguage(base, { a: "Hello", n: 9, list: [null, "two"], lang: "en" });
  assert.deepEqual(merged, { a: "Hello", n: 3, b: true, list: ["un", "two"], o: { x: "oui" }, lang: "en" });
  assert.equal(E.withLanguage(base, undefined), base);
});

test("le mode amour garde le sélecteur de langue et charge la version anglaise", () => {
  const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /\.qlang\{display:none/);
  const load = html.indexOf('"/quiz/amour-data-en.js"');
  assert.ok(load > html.indexOf('"/quiz/amour-data.js"') && load < html.indexOf('"/quiz/amour-engine.js"'));
  const js = fs.readFileSync(new URL("./amour.js", import.meta.url), "utf8");
  assert.doesNotMatch(js, /documentElement\.lang = "fr"/);
  assert.match(js, /document\.documentElement\.lang = D\.lang \|\| "fr";/);
  assert.match(js, /langSwitch\.hidden = false/);
  // Le choix de langue est intercepté avant le gestionnaire du quiz Talent Unique, et le profil est recalculé.
  assert.match(js, /document\.addEventListener\("click", function \(ev\) \{[\s\S]{0,300}ev\.stopImmediatePropagation\(\);\s*setLang\(btn\.getAttribute\("data-setlang"\)\);\s*\}, true\);/);
  const setLang = js.slice(js.indexOf("function setLang"), js.indexOf("function boot"));
  assert.match(setLang, /localStorage\.setItem\("mh-quiz-lang", lang\)/);
  assert.match(setLang, /resultProfile = E\.computeLoveProfile\(answers, D, prenom\)/);
  assert.match(setLang, /applySnap\(currentSnap\(\)\)/);
  // Un profil gardé dans une autre langue est recalculé à la reprise.
  assert.match(js, /if \(view === "results"\) \{[\s\S]{0,200}resultProfile = E\.computeLoveProfile\(answers, D, prenom\)/);
  // Nuances de l'encyclopédie en anglais (« Loyal: you… ») : l'espace après les deux-points est gardé.
  assert.match(js, /rest\.charAt\(0\) === ":"\) \{ label = name \+ D\.engine\.colon; rest = rest\.slice\(1\); \}/);
  // Pastilles « Dominant / Secondary » traduites.
  assert.match(js, /esc\(U\.pillDom\)/);
  assert.match(js, /esc\(U\.pillSec\)/);
  // L'espagnol n'a pas de traduction : il reste en français.
  assert.match(js, /return l === "en" && window\.AMOUR_DATA_EN \? E\.withLanguage\(DATA_FR, window\.AMOUR_DATA_EN\) : DATA_FR;/);
});

test("sans prénom : « Your love profile is… » en anglais, « Toi, ton profil amoureux… » en français", () => {
  let seed = 1;
  let answers;
  for (; seed < 50; seed++) {
    answers = answersFor(FR, seed);
    try { E.computeLoveProfile(answers, FR, ""); break; } catch (e) { /* réponses incomplètes */ }
  }
  const en = E.computeLoveProfile(answers, EN, "");
  const fr = E.computeLoveProfile(answers, FR, "");
  assert.match(en.profil.sentences[0], /^Your love profile is /);
  assert.match(fr.profil.sentences[0], /^Toi, ton profil amoureux est /);
  assert.equal(en.profil.header.eyebrow, EN.profil.ui.eyebrowAnon);
  const named = E.computeLoveProfile(answers, EN, "Sam");
  assert.match(named.profil.sentences[0], /^Sam, your love profile is /);
  assert.match(named.profil.header.eyebrow, /^Sam, your love profile/);
});
