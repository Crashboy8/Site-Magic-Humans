// node --test quiz/amour-profil-langues.test.mjs · Le profil obtenu ne dépend pas de la langue du quiz.
// 60 parcours (mêmes réponses, qui sont des identifiants) rejoués en français, en anglais et en espagnol :
// même profil, mêmes scores, mêmes critères envoyés à la Boussole. Seuls les textes changent.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const FR = require("./amour-data.js");
const E = require("./amour-engine.js");
const EN = E.withLanguage(FR, require("./amour-data-en.js"));
const PAYS_ES = require("./amour-pays-es.js");
const ES = E.withLanguage(E.withLanguage(FR, require("./amour-data-es.js")), PAYS_ES.pays[PAYS_ES.defaut]);

const PARCOURS = 60;

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

/** Tout ce qui décide du profil et de ce que reçoit la Boussole, sans aucun texte affiché. */
function signature(p) {
  return {
    dom: p.profil.dom,
    sec: p.profil.sec,
    margin: p.profil.margin,
    ranking: p.profil.ranking,
    scores: p.profil.scores,
    bars: p.profil.bars,
    trapId: p.profil.trapId,
    anti: p.profil.anti,
    boussoleDom: p.profil.boussoleDom,
    needs: p.needs,
    languages: p.languages,
    recharge: [p.recharge.profile, p.recharge.profile2],
    ennea: [p.ennea.type, p.ennea.alt, p.ennea.instinct, p.ennea.instinct2],
    values: p.values.order.map((v) => v.id),
    stress: p.stress,
    brakes: [p.brakes.all, p.brakes.first],
    imp: p.boussole.imp,
    crit: p.boussole.crit.map((c) => [c.id, c.g, c.c, c.i, c.n, c.a, c.s]),
  };
}

const parcours = [];
for (let seed = 1; parcours.length < PARCOURS && seed < 2000; seed++) {
  const answers = answersFor(FR, seed);
  try {
    parcours.push({ seed, answers, fr: E.computeLoveProfile(answers, FR, "Sam") });
  } catch (e) {
    /* réponses incomplètes pour cette graine : on passe à la suivante */
  }
}

test("60 parcours valides sont rejoués", () => {
  assert.equal(parcours.length, PARCOURS);
  // Les parcours ne se ressemblent pas : plusieurs familles dominantes et plusieurs profils différents.
  assert.ok(new Set(parcours.map((p) => p.fr.profil.dom)).size >= 4);
  assert.ok(new Set(parcours.map((p) => p.fr.profil.dom + "/" + p.fr.profil.sec)).size >= 15);
});

test("mêmes réponses en FR, EN et ES : même profil, mêmes scores, mêmes critères pour la Boussole", () => {
  for (const { seed, answers, fr } of parcours) {
    const en = E.computeLoveProfile(answers, EN, "Sam");
    const es = E.computeLoveProfile(answers, ES, "Sam");
    const ref = signature(fr);
    assert.deepEqual(signature(en), ref, "anglais, parcours " + seed);
    assert.deepEqual(signature(es), ref, "espagnol, parcours " + seed);
    // Même sans prénom, le profil ne bouge pas.
    assert.deepEqual(signature(E.computeLoveProfile(answers, ES, "")), ref, "espagnol sans prénom, parcours " + seed);
  }
});

test("le nom du profil est dans la langue : nom puis adjectif en français et en espagnol, adjectif puis nom en anglais", () => {
  const nameOf = (D, id) => D.profil.besoins[id];
  for (const { answers, fr } of parcours) {
    const dom = fr.profil.dom;
    const sec = fr.profil.sec;
    const en = E.computeLoveProfile(answers, EN, "Sam");
    const es = E.computeLoveProfile(answers, ES, "Sam");
    assert.equal(fr.profil.name.text, nameOf(FR, dom).noun + " " + nameOf(FR, sec).adj);
    assert.equal(en.profil.name.text, nameOf(EN, sec).adj + " " + nameOf(EN, dom).noun);
    assert.equal(es.profil.name.text, nameOf(ES, dom).noun + " " + E.agreeAdj(nameOf(ES, sec).adj, nameOf(ES, dom).noun, "es"));
    // Ce que la Boussole affiche en haut de l'encart est le nom dans la langue du quiz.
    assert.equal(fr.boussole.p, fr.profil.name.text);
    assert.equal(en.boussole.p, en.profil.name.text);
    assert.equal(es.boussole.p, es.profil.name.text);
  }
});

test("les 3 langues ont les mêmes familles, dans le même ordre", () => {
  assert.deepEqual(EN.profil.order, FR.profil.order);
  assert.deepEqual(ES.profil.order, FR.profil.order);
});
