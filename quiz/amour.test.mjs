// node --test quiz/   (aucune dépendance)
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const D = require("./amour-data.js");
const E = require("./amour-engine.js");

const firstAnswers = () => {
  const a = {};
  for (const q of D.questions) {
    if (q.type === "single") a[q.id] = q.options[0].id;
    if (q.type === "value") a[q.id] = { pos: q.options[0].id, firm: "souple" };
    if (q.type === "grid") a[q.id] = Object.fromEntries(q.axes.map((x) => [x.id, 0]));
  }
  return a;
};
const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const randomAnswers = (r) => {
  const a = {};
  for (const q of D.questions) {
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    if (q.type === "single") a[q.id] = pick(q.options).id;
    if (q.type === "value") a[q.id] = { pos: pick(q.options).id, firm: pick(D.firmness).id };
    if (q.type === "grid") a[q.id] = Object.fromEntries(q.axes.map((x) => [x.id, pick([-2, -1, 0, 1, 2])]));
  }
  return a;
};
const allStrings = (o, out = []) => {
  if (typeof o === "string") out.push(o);
  else if (o && typeof o === "object") Object.values(o).forEach((v) => allStrings(v, out));
  return out;
};

test("28 questions, ids uniques", () => {
  assert.equal(D.questions.length, 28);
  assert.equal(new Set(D.questions.map((q) => q.id)).size, 28);
});

test("aucun tiret long ni demi-cadratin, aucun TODO", () => {
  for (const s of allStrings(D)) {
    assert.ok(!/[\u2014\u2013]/.test(s), "tiret interdit : " + s);
    assert.ok(!/TODO|à rédiger/i.test(s), "texte incomplet : " + s);
  }
});

test("chaque clé de score pointe vers un contenu existant", () => {
  const groups = { recv: D.languages, give: D.languages, pat: D.patterns, need: D.needs, mask: D.masks };
  for (const q of D.questions.filter((q) => q.type === "single"))
    for (const o of q.options)
      for (const k of Object.keys(o.add)) {
        const [g, id] = k.split(".");
        assert.ok(groups[g] && groups[g][id], q.id + " " + k);
      }
  for (const q of D.questions.filter((q) => q.type === "value"))
    for (const o of q.options) assert.ok(o.neutral || (o.mine && o.opposite), q.id + " " + o.id);
});

test("réponses manquantes refusées", () => {
  assert.throws(() => E.computeLoveProfile({}, D, "Léa"));
});

test("profil déterministe et complet sur 2000 réponses aléatoires", () => {
  const r = rnd(42);
  for (let i = 0; i < 2000; i++) {
    const a = randomAnswers(r);
    const p1 = E.computeLoveProfile(a, D, "Léa"), p2 = E.computeLoveProfile(a, D, "Léa");
    assert.deepEqual(p1, p2);
    const txt = allStrings(p1).join("\n");
    assert.ok(!/undefined|null|NaN|\{\w+\}/.test(txt), "texte cassé : " + txt.slice(0, 300));
    assert.ok(!/[\u2014\u2013]/.test(txt));
    assert.ok(p1.partner.critical.length >= 1);
  }
});

test("départage : la question q04 (blessure) l'emporte pour le langage reçu", () => {
  const a = firstAnswers();
  a.q02 = "moments"; a.q03 = "toucher"; a.q04 = "paroles";
  assert.equal(E.computeLoveProfile(a, D, "A").languages.recv, "paroles");
  a.q02 = "toucher"; a.q03 = "toucher"; a.q04 = "paroles";
  assert.equal(E.computeLoveProfile(a, D, "A").languages.recv, "toucher");
});

test("scénario : seuils net / probable / léger / aucun", () => {
  const a = firstAnswers();
  for (const q of ["q08", "q09", "q10", "q11"]) a[q] = "aucun";
  assert.equal(E.computeLoveProfile(a, D, "A").pattern.level, "aucun");
  a.q08 = "sauveur";
  assert.equal(E.computeLoveProfile(a, D, "A").pattern.level, "leger");
  a.q10 = "sauveur";
  assert.equal(E.computeLoveProfile(a, D, "A").pattern.level, "probable");
  a.q11 = "sauveur";
  const p = E.computeLoveProfile(a, D, "A");
  assert.equal(p.pattern.level, "net");
  assert.equal(p.pattern.id, "sauveur");
});

test("grille de risque : enfants important = Critique, lieu important = Fort, neutre = Faible", () => {
  const a = firstAnswers();
  a.q18 = { pos: "oui", firm: "important" };
  a.q19 = { pos: "ville", firm: "important" };
  a.q20 = { pos: "egal" };
  const p = E.computeLoveProfile(a, D, "A");
  const lv = Object.fromEntries(p.values.map((v) => [v.topic, v.level]));
  assert.equal(lv.enfants, "Critique");
  assert.equal(lv.lieu, "Fort");
  assert.equal(lv.argent, "Faible");
  assert.ok(p.partner.critical.includes("Un partenaire qui ne veut pas d'enfants."));
});

test("sécurité : encadré affiché pour « present » et « doute » seulement", () => {
  const a = firstAnswers();
  for (const [v, shown] of [["non", false], ["passe", false], ["doute", true], ["present", true]]) {
    a.q28 = v;
    assert.equal(Boolean(E.computeLoveProfile(a, D, "A").safety), shown, v);
  }
});
