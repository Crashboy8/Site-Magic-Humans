// node --test quiz/   (aucune dépendance)
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const D = require("./amour-data.js");
const E = require("./amour-engine.js");

const screen = (id) => D.screens.find((s) => s.id === id);
const block = (screenId, blockId) => screen(screenId).blocks.find((b) => b.id === blockId);

const firstAnswers = () => {
  const a = {};
  for (const s of D.screens) {
    if (s.type === "plusminus") {
      a[s.id] = { plus: s.items.slice(0, 3).map((it) => it.id), minus: s.items.slice(3, 5).map((it) => it.id) };
    } else if (s.type === "single") {
      a[s.id] = s.options[0].id;
    } else if (s.type === "sort") {
      a[s.id] = Object.fromEntries(s.items.map((id) => [id, "ok"]));
    } else if (s.type === "values") {
      a[s.id] = {};
      for (const topicId of s.topics) {
        const topic = D.valueTopics.find((t) => t.id === topicId);
        const opt = topic.options[0];
        a[s.id][topicId] = opt.neutral ? { pos: opt.id } : { pos: opt.id, firm: "souple" };
      }
    } else if (s.type === "blocks") {
      a[s.id] = {};
      for (const b of s.blocks) {
        if (b.kind === "single") a[s.id][b.id] = b.options[0].id;
        if (b.kind === "self") a[s.id][b.id] = "milieu";
        if (b.kind === "second") a[s.id][b.id] = null;
        if (b.kind === "multi") a[s.id][b.id] = [b.options[0].id];
      }
    }
  }
  return a;
};

const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const pickN = (arr, n, r) => {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
};
const randomAnswers = (r) => {
  const a = {};
  for (const s of D.screens) {
    if (s.type === "plusminus") {
      const ids = pickN(s.items.map((it) => it.id), s.plusCount + s.minusCount, r);
      a[s.id] = { plus: ids.slice(0, s.plusCount), minus: ids.slice(s.plusCount) };
    } else if (s.type === "single") {
      a[s.id] = pick(s.options, r).id;
    } else if (s.type === "sort") {
      const cols = D.flawColumns.map((c) => c.id);
      a[s.id] = Object.fromEntries(s.items.map((id) => [id, pick(cols, r)]));
    } else if (s.type === "values") {
      a[s.id] = {};
      for (const topicId of s.topics) {
        const topic = D.valueTopics.find((t) => t.id === topicId);
        const opt = pick(topic.options, r);
        a[s.id][topicId] = opt.neutral ? { pos: opt.id } : { pos: opt.id, firm: pick(D.firmness, r).id };
      }
    } else if (s.type === "blocks") {
      a[s.id] = {};
      for (const b of s.blocks) {
        if (b.kind === "single" || b.kind === "self") a[s.id][b.id] = pick(b.options, r).id;
        if (b.kind === "second") {
          const opts = b.options.filter((o) => o.id !== a[s.id][b.of]);
          a[s.id][b.id] = r() < 0.5 ? null : pick(opts, r).id;
        }
        if (b.kind === "multi") a[s.id][b.id] = pickN(b.options.map((o) => o.id), r() < 0.5 ? 1 : 2, r);
      }
    }
  }
  return a;
};

const allStrings = (o, out = []) => {
  if (typeof o === "string") out.push(o);
  else if (o && typeof o === "object") Object.values(o).forEach((v) => allStrings(v, out));
  return out;
};

const decodePayload = (token) => {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
};

const WEIGHTS = { critique: 5, tres_important: 4, important: 3, moyen: 2 };
const weightSum = (imp) => 6 * WEIGHTS.critique + Object.values(imp).reduce((sum, level) => sum + WEIGHTS[level], 0);

test("11 écrans, ids uniques, le dernier est securite et il est privé", () => {
  assert.equal(D.screens.length, 11);
  assert.equal(new Set(D.screens.map((s) => s.id)).size, 11);
  assert.equal(D.screens.at(-1).id, "securite");
  assert.equal(D.screens.at(-1).private, true);
});

test("aucun tiret long ni demi-cadratin, aucun TODO", () => {
  for (const s of allStrings(D)) {
    assert.ok(!/[\u2014\u2013]/.test(s), "tiret interdit : " + s);
    assert.ok(!/TODO|à rédiger/i.test(s), "texte incomplet : " + s);
  }
});

test("l'adresse partagée du Quiz Amour est /quiz-amour/", () => {
  assert.equal(D.config.quizUrl, "https://www.magichumans.com/quiz-amour/");
  const p = E.computeLoveProfile(firstAnswers(), D, "Léa");
  assert.ok(p.shareText.includes("https://www.magichumans.com/quiz-amour/"));
  assert.ok(p.exportText.includes("https://www.magichumans.com/quiz-amour/"));
  assert.ok(!p.shareText.includes("/quiz/?theme=amour"));
  assert.ok(!p.exportText.includes("/quiz/?theme=amour"));
});

test("chaque référence pointe vers un contenu existant", () => {
  const pm = screen("plusmoins");
  for (const item of pm.items) {
    for (const key of Object.keys(item.plus)) assert.ok(D.needs[key], item.id + " +" + key);
    for (const key of Object.keys(item.minus)) assert.ok(D.needs[key], item.id + " -" + key);
  }
  for (const id of ["soir", "weekend"]) {
    for (const o of block("ressource", id).options) assert.ok(D.recharge[o.id], id + " " + o.id);
  }
  for (const o of block("ressource", "vide").options) assert.ok(D.drains[o.id], o.id);
  for (const id of ["recv", "give", "recv2", "give2"]) {
    for (const o of block("langages", id).options) assert.ok(D.languages[o.id], id + " " + o.id);
  }
  for (const [sid, bid] of [["enneaBase", "first"], ["enneaBase", "second"], ["enneaStress", "stress"]]) {
    for (const o of block(sid, bid).options) assert.ok(D.ennea.types[o.id], bid + " " + o.id);
  }
  for (const id of ["samedi", "souci"]) {
    for (const o of block("instinct", id).options) assert.ok(D.instincts[o.id], id + " " + o.id);
  }
  for (const id of ["ordre", "argent", "vacances"]) assert.ok(D.scenarios[id], id);
  for (const id of screen("defauts").items) assert.ok(D.flaws[id], id);
  for (const id of ["scene", "attirance"]) {
    for (const o of block("histoires", id).options) assert.ok(o.id === "aucun" || D.patterns[o.id], id + " " + o.id);
  }
  assert.equal(Object.keys(D.instinctPairs).length, 6);
  for (const key of ["sp-sp", "so-so", "sx-sx", "sp-so", "sp-sx", "so-sx"]) assert.ok(D.instinctPairs[key], key);
  for (const topic of D.valueTopics) {
    for (const o of topic.options) {
      if (!o.neutral) assert.ok(o.mine && o.opposite, topic.id + " " + o.id);
    }
  }
});

test("réponses manquantes refusées", () => {
  assert.throws(() => E.computeLoveProfile({}, D, "Léa"));
  const twoPlus = firstAnswers();
  twoPlus.plusmoins.plus = twoPlus.plusmoins.plus.slice(0, 2);
  assert.throws(() => E.computeLoveProfile(twoPlus, D, "Léa"));
  const both = firstAnswers();
  both.plusmoins.minus = [both.plusmoins.plus[0], both.plusmoins.minus[1]];
  assert.throws(() => E.computeLoveProfile(both, D, "Léa"));
  const sameSecond = firstAnswers();
  sameSecond.langages.recv2 = sameSecond.langages.recv;
  assert.throws(() => E.computeLoveProfile(sameSecond, D, "Léa"));
  const emptyMulti = firstAnswers();
  emptyMulti.ressource.vide = [];
  assert.throws(() => E.computeLoveProfile(emptyMulti, D, "Léa"));
  const threeMulti = firstAnswers();
  threeMulti.ressource.vide = ["pas_seul", "sorties", "casanier"];
  assert.throws(() => E.computeLoveProfile(threeMulti, D, "Léa"));
  const missingFlaw = firstAnswers();
  delete missingFlaw.defauts.jaloux;
  assert.throws(() => E.computeLoveProfile(missingFlaw, D, "Léa"));
  const noFirm = firstAnswers();
  delete noFirm.valeurs.enfants.firm;
  assert.throws(() => E.computeLoveProfile(noFirm, D, "Léa"));
});

test("profil déterministe et complet sur 2000 réponses aléatoires", () => {
  const r = rnd(42);
  for (let i = 0; i < 2000; i++) {
    const a = randomAnswers(r);
    const p1 = E.computeLoveProfile(a, D, "Léa");
    const p2 = E.computeLoveProfile(a, D, "Léa");
    assert.deepEqual(p1, p2);
    const txt = allStrings(p1).join("\n");
    assert.ok(!/undefined|null|NaN|\{\w+\}/.test(txt), "texte cassé : " + txt.slice(0, 400));
    assert.ok(!/[\u2014\u2013]/.test(txt));
    assert.equal(p1.sentences.length, 3);
    assert.ok(p1.partner.critical.length >= 1);
    assert.ok(p1.exportText.includes(p1.sentences[0]) && p1.shareText.includes(p1.sentences[2]));
  }
});

test("ennéagramme", () => {
  const base = firstAnswers();
  const run = (first, stress, second) => {
    const a = structuredClone(base);
    a.enneaBase.first = first;
    a.enneaBase.second = second;
    a.enneaStress.stress = stress;
    return E.computeLoveProfile(a, D, "Léa").ennea;
  };
  const a = run("t6", "t6", null);
  assert.equal(a.type, "t6");
  assert.equal(a.confidence, "forte");
  assert.equal(a.alt, null);
  const b = run("t1", "t2", null);
  assert.equal(b.type, "t1");
  assert.equal(b.confidence, "a_verifier");
  assert.equal(b.alt, "t2");
  const c = run("t1", "t2", "t2");
  assert.equal(c.type, "t2");
  assert.equal(c.confidence, "forte");
  assert.equal(c.alt, "t1");
  const d = run("t1", "t5", "t3");
  assert.equal(d.type, "t1");
  assert.equal(d.alt, "t5");
  assert.equal(d.confidence, "a_verifier");
});

test("sous-type", () => {
  const net = firstAnswers();
  net.instinct.samedi = "sx";
  net.instinct.souci = "sx";
  const n = E.computeLoveProfile(net, D, "Léa").ennea;
  assert.equal(n.instinct2, null);
  const mix = firstAnswers();
  mix.instinct.samedi = "sp";
  mix.instinct.souci = "so";
  const m = E.computeLoveProfile(mix, D, "Léa").ennea;
  assert.equal(m.instinct, "sp");
  assert.equal(m.instinct2, "so");
  assert.deepEqual(m.pairs.map((p) => p.partner), ["sp", "so", "sx"]);
  assert.ok(m.pairs.every((p) => p.text && p.text.length > 10));
});

test("scénario répété", () => {
  const run = (sceneId, attirance) => {
    const a = firstAnswers();
    a.histoires.scene = sceneId;
    a.histoires.attirance = attirance;
    return E.computeLoveProfile(a, D, "Léa").pattern;
  };
  const net = run("sauveur", "sauveur");
  assert.equal(net.level, "net");
  assert.equal(net.id, "sauveur");
  assert.equal(run("sauveur", "aucun").level, "leger");
  const none = run("aucun", "aucun");
  assert.equal(none.level, "aucun");
  assert.equal(none.id, null);
  const tie = run("attente", "sauveur");
  assert.equal(tie.id, "attente");
  assert.equal(tie.level, "leger");
});

test("besoins", () => {
  const a = firstAnswers();
  a.plusmoins = { plus: ["rituels", "projets", "calme"], minus: ["imprevu", "taquiner"] };
  const needs = E.computeLoveProfile(a, D, "Léa").needs;
  assert.equal(needs.top[0], "securite");
  assert.equal(needs.top[1], "harmonie");
  assert.equal(needs.anti, "securite");
});

test("phrases", () => {
  const a = firstAnswers();
  a.plusmoins = { plus: ["rituels", "projets", "calme"], minus: ["imprevu", "taquiner"] };
  a.defauts.jaloux = "nn";
  a.defauts.colere = "nn";
  const p = E.computeLoveProfile(a, D, "Léa");
  assert.ok(p.sentences[0].startsWith("Léa, ce dont tu as vraiment besoin : sécurité et fiabilité, puis douceur et harmonie"));
  assert.ok(p.sentences[1].includes("un ou une partenaire jaloux·se ou qui s'emporte vite"));
  assert.ok(p.sentences[2].includes("sous-type"));
});

test("quotidien", () => {
  const run = (id, tolerance, self) => {
    const a = firstAnswers();
    a.quotidien[id] = tolerance;
    a.quotidien[id + "Self"] = self;
    return E.computeLoveProfile(a, D, "Léa").quotidien.items.find((it) => it.id === id);
  };
  const conflit = run("ordre", "conflit", "milieu");
  assert.equal(conflit.level, "Fort");
  assert.ok(conflit.friction);
  assert.equal(run("argent", "tait", "milieu").level, "Fort");
  const accord = run("vacances", "accord", "droite");
  assert.equal(accord.complement, D.scenarios.vacances.completeRight);
  assert.equal(run("ordre", "ouvert", "milieu").complement, null);
});

test("grille de risque", () => {
  const a = firstAnswers();
  a.valeurs.enfants = { pos: "oui", firm: "important" };
  a.valeurs.lieu = { pos: "ville", firm: "important" };
  a.valeurs.argent = { pos: "egal" };
  const p = E.computeLoveProfile(a, D, "Léa");
  const level = (topic) => p.values.find((v) => v.topic === topic).level;
  assert.equal(level("enfants"), "Critique");
  assert.equal(level("lieu"), "Fort");
  assert.equal(level("argent"), "Faible");
  assert.ok(p.partner.critical.includes("Un partenaire qui ne veut pas d'enfants."));
});

test("sécurité", () => {
  for (const id of ["present", "doute"]) {
    const a = firstAnswers();
    a.securite = id;
    const p = E.computeLoveProfile(a, D, "Léa");
    assert.equal(p.safety.title, D.safety[id].title);
    assert.equal(p.pastAbuse, null);
  }
  const non = firstAnswers();
  non.securite = "non";
  assert.equal(E.computeLoveProfile(non, D, "Léa").safety, null);
  const passe = firstAnswers();
  passe.securite = "passe";
  const pp = E.computeLoveProfile(passe, D, "Léa");
  assert.equal(pp.safety, null);
  assert.equal(pp.pastAbuse, D.pastAbuseNote);
});

test("la réponse de sécurité ne sort jamais", () => {
  const calm = firstAnswers();
  calm.securite = "non";
  const alert = firstAnswers();
  alert.securite = "present";
  const a = E.computeLoveProfile(calm, D, "Léa");
  const b = E.computeLoveProfile(alert, D, "Léa");
  assert.deepEqual(a.boussole, b.boussole);
  assert.equal(a.shareText, b.shareText);
  assert.equal(a.exportText, b.exportText);
  assert.equal(a.safety, null);
  assert.ok(b.safety);
});

test("préréglage Boussole", () => {
  const count = (imp, level) => Object.values(imp).filter((v) => v === level).length;
  const checkImp = (imp) => {
    assert.deepEqual(Object.keys(imp).sort(), ["complementarite", "energie", "frictions", "langage"]);
    assert.equal(count(imp, "tres_important"), 1);
    assert.equal(count(imp, "important"), 2);
    assert.equal(count(imp, "moyen"), 1);
    assert.equal(weightSum(imp), 42);
  };
  const base = E.computeLoveProfile(firstAnswers(), D, "WaldoUnique");
  checkImp(base.boussole.imp);
  assert.equal(base.boussole.imp.energie, "tres_important");
  assert.equal(base.boussole.imp.frictions, "important");
  assert.equal(base.boussole.imp.langage, "important");
  assert.equal(base.boussole.imp.complementarite, "moyen");
  assert.equal(base.boussole.notes.respect, undefined);
  assert.ok(!JSON.stringify(base.boussole).includes("WaldoUnique"));
  for (const note of Object.values(base.boussole.notes)) assert.ok(note.length <= 300);

  const hot = firstAnswers();
  hot.quotidien.ordre = "conflit";
  hot.quotidien.argent = "conflit";
  hot.quotidien.vacances = "conflit";
  const hotP = E.computeLoveProfile(hot, D, "WaldoUnique");
  assert.equal(hotP.boussole.imp.frictions, "tres_important");
  checkImp(hotP.boussole.imp);

  const r = rnd(7);
  for (let i = 0; i < 200; i++) {
    const p = E.computeLoveProfile(randomAnswers(r), D, "WaldoUnique");
    checkImp(p.boussole.imp);
    assert.equal(p.boussole.notes.respect, undefined);
    assert.ok(!JSON.stringify(p.boussole).includes("WaldoUnique"));
    for (const note of Object.values(p.boussole.notes)) assert.ok(note.length <= 300, note);
  }
});

test("encodage", () => {
  const r = rnd(42);
  for (let i = 0; i < 2000; i++) {
    const p = E.computeLoveProfile(randomAnswers(r), D, "Léa");
    const token = E.encodePayload(p.boussole);
    assert.match(token, /^[A-Za-z0-9_-]+$/);
    assert.ok(token.length < 4000);
    assert.deepEqual(decodePayload(token), p.boussole);
  }
});
