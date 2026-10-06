// node --test quiz/amour.test.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const D = require("./amour-data.js");
const E = require("./amour-engine.js");

function screen(id) {
  return D.screens.find((s) => s.id === id);
}
function group(screenId, groupId) {
  return screen(screenId).groups.find((g) => g.id === groupId);
}

function allStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => allStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => allStrings(v, out));
  return out;
}

function rnd(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function shuffle(r, list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function firstAnswers() {
  const pick = (screenId, groups) => {
    const s = screen(screenId);
    const bag = { picked: {}, other: {}, order: {} };
    for (const [groupId, ids] of Object.entries(groups)) {
      bag.picked[groupId] = ids.slice();
      bag.other[groupId] = [];
      if (s.rank) bag.order[groupId] = ids.slice();
    }
    return bag;
  };
  return {
    nourrit: pick("nourrit", { nourrit: ["ecoute", "rire", "fiable"], vide: ["justifier", "critiques"] }),
    ressource: pick("ressource", { soir: ["seul", "raconter"], weekend: ["rien", "moi"] }),
    langages: { order: screen("langages").items.map((it) => it.id) },
    ennea: pick("ennea", { types: ["t1"] }),
    valeurs: pick("valeurs", { valeurs: ["honnetete", "fidelite", "respect"] }),
    instinct: { order: screen("instinct").items.map((it) => it.id) },
    stress: pick("stress", { modere: ["D"], fort: ["fight"] }),
    freins: pick("freins", { freins: ["rejet"] }),
    demain: pick("demain", { actions: ["a5"] }),
    etape: { engagement: "Cette semaine, je dis ce dont j'ai besoin.", moment: "demain", safety: null },
  };
}

function randomAnswers(r) {
  const a = {};
  for (const s of D.screens) {
    if (s.type === "pick") {
      const bag = { picked: {}, other: {}, order: {} };
      for (const g of s.groups) {
        const n = g.min + Math.floor(r() * (g.items.length - g.min + 1));
        let ids = shuffle(r, g.items.map((it) => it.id)).slice(0, n);
        if (s.exclusive) {
          for (const pair of s.exclusive) {
            if (pair.every((id) => ids.includes(id))) ids = ids.filter((id) => id !== pair[1]);
            if (ids.length < g.min) ids.push(g.items.find((it) => !ids.includes(it.id) && !pair.includes(it.id)).id);
          }
        }
        bag.picked[g.id] = ids;
        const texts = [];
        if (g.other && r() < 0.25) texts.push("déjà vu · aimé·e <b> vraiment");
        bag.other[g.id] = texts;
        const chosen = ids.slice();
        if (texts[0] && texts[0].trim()) chosen.push("autre:0");
        bag.order[g.id] = s.rank ? shuffle(r, chosen) : chosen;
      }
      a[s.id] = bag;
    } else if (s.type === "rank") {
      const n = s.minRanked + Math.floor(r() * (s.items.length - s.minRanked + 1));
      a[s.id] = { order: shuffle(r, s.items.map((it) => it.id)).slice(0, n) };
    } else {
      const safeties = ["non", "passe", "doute", "present", null];
      a[s.id] = {
        engagement: "Cette semaine, je dis ce dont j'ai besoin.",
        moment: D.moments[Math.floor(r() * D.moments.length)].id,
        who: r() < 0.5 ? "Léa <b>" : "",
        safety: safeties[Math.floor(r() * safeties.length)],
      };
    }
  }
  return a;
}

test("10 questions, ids uniques, types pick/rank/commit, n de 1 à 10", () => {
  assert.equal(D.version, 3);
  assert.equal(D.screens.length, 10);
  assert.equal(new Set(D.screens.map((s) => s.id)).size, 10);
  D.screens.forEach((s, i) => {
    assert.equal(s.n, i + 1);
    assert.ok(["pick", "rank", "commit"].includes(s.type));
  });
});

test("aucun tiret long ni demi-cadratin, aucun TODO, jamais le mot sexuel", () => {
  for (const s of allStrings(D)) {
    assert.ok(!/[\u2014\u2013]/.test(s), "tiret interdit : " + s);
    assert.ok(!/TODO|à rédiger/i.test(s), "texte incomplet : " + s);
    assert.ok(!/sexuel/i.test(s), "mot interdit : " + s);
  }
});

test("références valides", () => {
  const nourrit = group("nourrit", "nourrit");
  const vide = group("nourrit", "vide");
  for (const it of nourrit.items) {
    assert.ok(D.needs[it.need], it.id);
    if (it.lang) assert.ok(D.languages[it.lang], it.id);
  }
  for (const it of vide.items) assert.ok(D.needs[it.need], it.id);
  for (const g of screen("ressource").groups) {
    for (const it of g.items) assert.ok(D.recharge[it.recharge], it.id);
  }
  for (const it of group("ennea", "types").items) assert.ok(D.ennea.types[it.id], it.id);
  for (const it of screen("instinct").items) assert.ok(D.instincts[it.id], it.id);
  for (const it of group("valeurs", "valeurs").items) {
    assert.ok(D.values[it.id] && D.values[it.id].short && D.values[it.id].opposite, it.id);
  }
  for (const it of group("stress", "modere").items) assert.ok(D.stress.modere[it.id], it.id);
  for (const it of group("stress", "fort").items) assert.ok(D.stress.fort[it.id], it.id);
  for (const it of group("freins", "freins").items) assert.ok(D.brakes[it.id], it.id);
  for (const it of group("demain", "actions").items) assert.ok(D.actions[it.id], it.id);
  assert.equal(Object.keys(D.instinctPairs).length, 6);
  for (const pair of screen("valeurs").exclusive) {
    for (const id of pair) assert.ok(group("valeurs", "valeurs").items.some((it) => it.id === id));
  }
});

test("minimums", () => {
  assert.throws(() => E.computeLoveProfile({}, D, "Léa"));
  const two = firstAnswers();
  two.nourrit.picked.nourrit = ["ecoute", "rire"];
  two.nourrit.order.nourrit = ["ecoute", "rire"];
  assert.throws(() => E.computeLoveProfile(two, D, "Léa"));
  const shortVide = firstAnswers();
  shortVide.nourrit.picked.vide = ["justifier"];
  shortVide.nourrit.order.vide = ["justifier"];
  assert.throws(() => E.computeLoveProfile(shortVide, D, "Léa"));
  const soir = firstAnswers();
  soir.ressource.picked.soir = ["seul"];
  assert.throws(() => E.computeLoveProfile(soir, D, "Léa"));
  const lang = firstAnswers();
  lang.langages.order = ["paroles"];
  assert.throws(() => E.computeLoveProfile(lang, D, "Léa"));
  const both = firstAnswers();
  both.valeurs.picked.valeurs = ["enfants", "sans_enfants", "honnetete"];
  both.valeurs.order.valeurs = ["enfants", "sans_enfants", "honnetete"];
  assert.throws(() => E.computeLoveProfile(both, D, "Léa"));
  const noMoment = firstAnswers();
  delete noMoment.etape.moment;
  assert.throws(() => E.computeLoveProfile(noMoment, D, "Léa"));
  const shortText = firstAnswers();
  shortText.etape.engagement = "oui";
  assert.throws(() => E.computeLoveProfile(shortText, D, "Léa"));
  const emptyOther = firstAnswers();
  emptyOther.nourrit.picked.nourrit = ["ecoute", "rire"];
  emptyOther.nourrit.other.nourrit = ["   "];
  emptyOther.nourrit.order.nourrit = ["ecoute", "rire"];
  assert.throws(() => E.computeLoveProfile(emptyOther, D, "Léa"));
  const filledOther = firstAnswers();
  filledOther.nourrit.picked.nourrit = ["ecoute", "rire"];
  filledOther.nourrit.other.nourrit = ["les silences doux"];
  filledOther.nourrit.order.nourrit = ["ecoute", "rire", "autre:0"];
  assert.doesNotThrow(() => E.computeLoveProfile(filledOther, D, "Léa"));
  const allValues = firstAnswers();
  const ids = group("valeurs", "valeurs").items.map((it) => it.id).filter((id) => id !== "sans_enfants");
  allValues.valeurs.picked.valeurs = ids;
  allValues.valeurs.order.valeurs = ids;
  assert.doesNotThrow(() => E.computeLoveProfile(allValues, D, "Léa"));
});

test("rankingState", () => {
  const start = ["a", "b", "c"];
  const up = E.rankingState(start, { type: "up", index: 0 });
  assert.deepEqual(up, ["a", "b", "c"]);
  assert.deepEqual(start, ["a", "b", "c"]);
  const down = E.rankingState(start, { type: "down", index: 2 });
  assert.deepEqual(down, ["a", "b", "c"]);
  assert.deepEqual(E.rankingState(["a", "b", "c"], { type: "move", from: 0, to: 2 }), ["b", "c", "a"]);
  assert.deepEqual(E.rankingState(["a", "b"], { type: "add", id: "a" }), ["a", "b"]);
  assert.deepEqual(E.rankingState(["a", "b", "c"], { type: "remove", id: "b" }), ["a", "c"]);
  assert.deepEqual(start, ["a", "b", "c"]);
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
    assert.equal(p1.sentences.length, 3);
    assert.ok(p1.partner.critical.length >= 1);
    assert.ok(p1.shareText.includes(p1.sentences[0]) && p1.exportText.includes(p1.sentences[2]));
  }
});

test("besoins", () => {
  const a = firstAnswers();
  a.nourrit.picked.nourrit = ["fiable", "calme", "projets"];
  a.nourrit.order.nourrit = ["fiable", "calme", "projets"];
  a.nourrit.picked.vide = ["promesses", "silences"];
  a.nourrit.order.vide = ["promesses", "silences"];
  const p = E.computeLoveProfile(a, D, "Léa");
  assert.equal(p.needs.top[0], "securite");
  assert.equal(p.needs.top[1], "harmonie");
  assert.equal(p.needs.anti, "securite");
  assert.equal(p.needs.noMore, "promesses");
});

test("ressourcement", () => {
  const a = firstAnswers();
  a.ressource.picked.soir = ["seul", "douceur"];
  a.ressource.picked.weekend = ["moi", "nature"];
  const p = E.computeLoveProfile(a, D, "Léa");
  assert.equal(p.recharge.profile, "solitaire");
  assert.equal(p.recharge.solo, 3);
});

test("phrases", () => {
  const a = firstAnswers();
  a.nourrit.picked.nourrit = ["ecoute", "rire", "fiable"];
  a.nourrit.order.nourrit = ["ecoute", "rire", "fiable"];
  a.langages.order = ["moments", "toucher"];
  a.ressource.picked.soir = ["seul", "douceur"];
  a.ressource.picked.weekend = ["moi", "rien"];
  const p = E.computeLoveProfile(a, D, "Léa");
  assert.equal(
    p.sentences[0],
    "Léa, ce qui te nourrit vraiment : être écouté·e, rire ensemble et pouvoir compter sur l'autre. Tu te sens aimé·e surtout par les moments de qualité et le toucher, et tu te recharges seul·e, au calme."
  );
  assert.ok(p.sentences[1].includes("ton frein :"));
  assert.ok(p.sentences[2].includes("sous-type") && p.sentences[2].includes("tu as tendance à"));
});

test("valeurs", () => {
  const a = firstAnswers();
  a.valeurs.picked.valeurs = ["enfants", "honnetete", "fidelite", "humour"];
  a.valeurs.order.valeurs = ["enfants", "honnetete", "fidelite", "humour"];
  const p = E.computeLoveProfile(a, D, "Léa");
  assert.deepEqual(p.values.nonNegotiables.map((v) => v.id), ["enfants", "honnetete", "fidelite"]);
  assert.deepEqual(p.values.toDiscuss.map((v) => v.id), ["humour"]);
  assert.ok(p.partner.critical.includes("Un partenaire qui ne veut pas d'enfants."));
});

test("sécurité", () => {
  for (const id of ["present", "doute"]) {
    const a = firstAnswers();
    a.etape.safety = id;
    const p = E.computeLoveProfile(a, D, "Léa");
    assert.equal(p.safety, D.safety[id]);
    assert.equal(p.pastAbuse, null);
  }
  const passe = firstAnswers();
  passe.etape.safety = "passe";
  const p = E.computeLoveProfile(passe, D, "Léa");
  assert.equal(p.safety, null);
  assert.equal(p.pastAbuse, D.pastAbuseNote);
});

test("rien de privé ne sort", () => {
  const a = firstAnswers();
  const b = firstAnswers();
  a.etape.safety = "present";
  b.etape.safety = "non";
  a.etape.who = "WaldoUnique";
  b.etape.who = "";
  a.etape.engagement = "Cette semaine, je dis ce dont j'ai besoin.";
  b.etape.engagement = "Cette semaine, je pose une limite claire.";
  a.nourrit.other.nourrit = ["déjà <b> secret"];
  a.nourrit.order.nourrit = ["ecoute", "rire", "fiable", "autre:0"];
  a.valeurs.other = { valeurs: ["la fidélité aux amis"] };
  a.valeurs.order.valeurs = ["honnetete", "fidelite", "respect", "autre:0"];
  b.valeurs.other = { valeurs: [] };
  const pa = E.computeLoveProfile(a, D, "WaldoUnique");
  const pb = E.computeLoveProfile(b, D, "Léa");
  assert.equal(JSON.stringify(pa.boussole), JSON.stringify(pb.boussole));
  const raw = JSON.stringify(pa.boussole);
  assert.ok(!raw.includes("WaldoUnique"));
  assert.ok(!raw.includes("<b>"));
  assert.ok(!raw.includes("secret"));
  assert.ok(!raw.includes("fidélité aux amis"));
  assert.ok(!pa.shareText.includes(a.etape.engagement));
  assert.ok(!pa.shareText.includes("3919"));
  assert.ok(pa.exportText.includes(a.etape.engagement));
});

test("préréglage", () => {
  const p = E.computeLoveProfile(firstAnswers(), D, "Léa");
  const imp = p.boussole.imp;
  assert.deepEqual(Object.keys(imp), ["energie", "frictions", "langage", "complementarite"]);
  const levels = Object.values(imp).sort();
  assert.deepEqual(levels, ["important", "important", "moyen", "tres_important"]);
  assert.equal(imp.energie, "tres_important");
  assert.equal(imp.frictions, "important");
  assert.equal(imp.langage, "important");
  assert.equal(imp.complementarite, "moyen");
  const alt = firstAnswers();
  alt.stress.picked.fort = ["fight", "freeze"];
  alt.nourrit.picked.vide = ["cris", "routine"];
  alt.nourrit.order.vide = ["cris", "routine"];
  alt.ressource.picked.soir = ["raconter", "bouger"];
  alt.ressource.picked.weekend = ["adeux", "sortir"];
  const p2 = E.computeLoveProfile(alt, D, "Léa");
  assert.equal(p2.boussole.imp.frictions, "tres_important");
  assert.equal(p2.boussole.imp.energie, "important");
  for (const note of Object.values(p.boussole.notes)) assert.ok(note.length <= 300);
  assert.equal(p.boussole.notes.respect, undefined);
  assert.ok(p.boussole.notes.incompatibilite.includes("l'honnêteté"));
  assert.ok(p.boussole.notes.incompatibilite.includes("la fidélité"));
  assert.ok(p.boussole.notes.incompatibilite.includes("le respect"));
  assert.ok(p.boussole.notes.incompatibilite.includes("devoir te justifier de tout"));
});

test("encodage", () => {
  const r = rnd(7);
  for (let i = 0; i < 2000; i++) {
    const p = E.computeLoveProfile(randomAnswers(r), D, "Léa");
    const encoded = E.encodePayload(p.boussole);
    assert.match(encoded, /^[A-Za-z0-9_-]+$/);
    assert.ok(encoded.length < 4000);
    const pad = encoded.length % 4 === 0 ? "" : "=".repeat(4 - (encoded.length % 4));
    const bin = Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
    assert.equal(JSON.stringify(JSON.parse(bin.toString("utf8"))), JSON.stringify(p.boussole));
  }
});
