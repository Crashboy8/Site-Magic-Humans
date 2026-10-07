// node --test quiz/amour.test.mjs
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
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
    etape: {
      engagement: "Cette semaine, je dis ce dont j'ai besoin.",
      moment: "demain",
      safety: null,
      time: null,
      picked: { actions: ["a5"] },
      other: { actions: [] },
      order: { actions: ["a5"] },
    },
  };
}

function randomAnswers(r) {
  const a = {};
  for (const s of D.screens) {
    if (s.type === "pick") {
      const bag = { picked: {}, other: {}, order: {} };
      for (const g of s.groups) {
        const cap = g.max ? Math.min(g.max, g.items.length) : g.items.length;
        const n = g.min + Math.floor(r() * (Math.max(0, cap - g.min) + 1));
        let ids = shuffle(r, g.items.map((it) => it.id)).slice(0, n);
        if (s.exclusive) {
          for (const pair of s.exclusive) {
            if (pair.every((id) => ids.includes(id))) ids = ids.filter((id) => id !== pair[1]);
            if (ids.length < g.min) ids.push(g.items.find((it) => !ids.includes(it.id) && !pair.includes(it.id)).id);
          }
        }
        bag.picked[g.id] = ids;
        const texts = [];
        if (g.other && r() < 0.25 && (!g.max || ids.length < g.max)) texts.push("déjà vu · aimé·e <b> vraiment");
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
      const bag = {
        engagement: "Cette semaine, je dis ce dont j'ai besoin.",
        moment: D.moments[Math.floor(r() * D.moments.length)].id,
        who: r() < 0.5 ? "Léa <b>" : "",
        safety: safeties[Math.floor(r() * safeties.length)],
        time: null,
        picked: {},
        other: {},
        order: {},
      };
      for (const g of s.groups || []) {
        const n = g.min + Math.floor(r() * (g.items.length - g.min + 1));
        const ids = shuffle(r, g.items.map((it) => it.id)).slice(0, n);
        bag.picked[g.id] = ids;
        bag.other[g.id] = [];
        bag.order[g.id] = ids.slice();
        if (ids.includes("rappel")) bag.time = "18:00";
      }
      a[s.id] = bag;
    }
  }
  return a;
}

test("résultat : bloc Et maintenant, une phrase par stress fort", () => {
  const n = D.ui.results;
  assert.equal(n.nowH, "Et maintenant ?");
  assert.equal(n.nowStep, "Ta prochaine étape");
  assert.equal(n.nowStepEmpty, "Choisis un petit pas pour ta relation cette semaine.");
  assert.equal(n.nowTest, "Teste ta relation");
  assert.match(n.nowTestP, /critère par critère/);
  assert.equal(n.nowBoussole, "Ouvrir ma Boussole Relation");
  assert.equal(n.nowPierre, "Fais le point avec Pierre");
  assert.equal(n.nowCall, "Réserver mon Appel Découverte offert");
  assert.equal(n.nowPdf, "Télécharger mon profil (PDF)");
  assert.match(n.nowStress.freeze, /te figer sous stress fort/);
  assert.equal(Object.keys(n.nowStress).sort().join(","), "fawn,fight,flight,freeze");
  assert.equal(n.ctaP, "Ton profil amoureux dit beaucoup de ton Talent Unique. On en parle 1 h, offert, pour que tu choisisses mieux, en amour comme dans ta vie pro.");
  assert.equal(n.nowGeneric, "En 1 h, offert, on relie ton profil amoureux à ton Talent Unique.");
  assert.equal(n.stickyCta, "Parler avec Pierre");
  const ctaCopy = [n.ctaP, n.nowGeneric, n.ctaH, n.ctaBtn, n.nowCall, n.nowPierre].concat(Object.values(n.nowStress)).join("\n");
  assert.equal(/30|45/.test(ctaCopy), false);
  assert.equal(/[\u2014\u2013]/.test(ctaCopy), false);
  assert.match(ctaCopy, /Talent Unique/);
  assert.match(ctaCopy, /1 h/);
});

test("question 1 en deux sous-écrans, même numéro", () => {
  const s = screen("nourrit");
  assert.equal(s.splitGroups, true);
  assert.equal(s.n, 1);
  assert.equal(s.groups[0].id, "nourrit");
  assert.equal(s.groups[0].min, 3);
  assert.equal(s.groups[0].stepTitle, "Coche au moins 3 choses qui te nourrissent.");
  assert.equal(s.groups[1].id, "vide");
  assert.equal(s.groups[1].min, 2);
  assert.equal(s.groups[1].stepTitle, "Coche au moins 2 choses qui te vident.");
  assert.match(D.ui.quiz.moreDown, /plus bas/);
  assert.equal(screen("ressource").splitGroups, undefined);
  assert.equal(screen("stress").splitGroups, undefined);
});

test("9 questions, ids uniques, types pick/rank/commit, n de 1 à 9", () => {
  assert.equal(D.version, 4);
  assert.equal(D.screens.length, 9);
  assert.equal(new Set(D.screens.map((s) => s.id)).size, 9);
  assert.equal(screen("demain"), undefined);
  assert.equal(screen("ennea").optional, true);
  assert.equal(group("ennea", "types").min, 0);
  assert.equal(group("valeurs", "valeurs").items.length, 15);
  assert.equal(screen("etape").groups[0].id, "actions");
  assert.equal(screen("etape").n, 9);
  D.screens.forEach((s, i) => {
    assert.equal(s.n, i + 1);
    assert.ok(["pick", "rank", "commit"].includes(s.type));
  });
});

test("questions : titres et aides en français naturel", () => {
  assert.equal(screen("instinct").title, "Quelle façon de vivre le couple te ressemble le plus ?");
  assert.equal(screen("instinct").help, "Touche les cartes dans l'ordre. La première devient ton n° 1. Touche encore pour retirer.");
  assert.equal(screen("instinct").cardRank, true);
  assert.equal(screen("instinct").autoCompleteLast, false);
  assert.equal(screen("instinct").minRanked, 3);
  assert.equal(D.ui.quiz.rankReset, "Recommencer");
  const social = screen("instinct").items.find((it) => it.id === "so");
  assert.equal(social.label, "Social · je vois du monde");
  for (const it of screen("instinct").items) assert.ok(it.hint && it.hint.length > 20, it.id);
  assert.equal(screen("ennea").rank.title, "Mets en premier la phrase qui te ressemble le plus.");
  assert.equal(screen("nourrit").rank.title, "Mets en premier ce qui compte le plus pour toi.");
  assert.equal(screen("nourrit").rank.divider.text, "En premier : ce que tu ne veux plus vivre.");
  assert.equal(screen("langages").title, "Pour te sentir aimé·e, qu'est-ce qui compte le plus ?");
  assert.equal(screen("langages").help, "Mets en premier ce qui te parle le plus. Deux suffisent. Tu peux toucher les cartes dans l'ordre, ou les faire glisser.");
  assert.equal(screen("freins").title, "Qu'est-ce qui te freine ou te met mal à l'aise en amour ?");
  assert.equal(screen("freins").help, "Ce qui te bloque, ce qui te met dans des situations inconfortables, ou ce qui te donne moins envie d'avancer avec quelqu'un. Coche ce qui te parle.");
  assert.equal(group("freins", "freins").items.length, 12);
  assert.equal(screen("etape").groups[0].stepTitle, "Comment veux-tu t'y prendre dès demain ? Coche au moins une chose.");
  assert.equal(screen("etape").help, "Touche un exemple pour t'inspirer : il s'inscrit dans ta phrase.");
  assert.equal(D.ui.quiz.topCounter, "Tes 3 premières : {x}/{n}");
  const blob = allStrings(D).join("\n");
  assert.equal(/plus toi|top 3|Top 3|je connecte|en haut/i.test(blob), false);
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
  for (const it of group("etape", "actions").items) assert.ok(D.actions[it.id], it.id);
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
  assert.doesNotThrow(() => E.computeLoveProfile(shortText, D, "Léa"));
  const emptyEng = firstAnswers();
  emptyEng.etape.engagement = "   ";
  const emptyProfile = E.computeLoveProfile(emptyEng, D, "Léa");
  assert.equal(emptyProfile.etape.engagement, "");
  assert.match(emptyProfile.exportText, /Choisis un petit pas/);
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
  assert.throws(() => E.computeLoveProfile(allValues, D, "Léa"));
  const five = firstAnswers();
  five.valeurs.picked.valeurs = ["honnetete", "fidelite", "respect", "humour", "aventure"];
  five.valeurs.order.valeurs = ["honnetete", "fidelite", "respect"];
  assert.doesNotThrow(() => E.computeLoveProfile(five, D, "Léa"));
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
  assert.match(p.sentences[0], /^Léa, ton profil amoureux est /);
  assert.match(p.sentences[1], /^Tu t'épanouis quand /);
  assert.match(p.sentences[2], /^Sous stress fort, ton piège/);
  assert.equal(p.profil.name.text, p.profil.name.noun + " " + p.profil.name.adj);
});

test("valeurs : 3 à 5, top 3 à 3 points, la suite à 1", () => {
  const g = group("valeurs", "valeurs");
  assert.equal(g.items.length, 15);
  assert.equal(g.min, 3);
  assert.equal(g.max, 5);
  assert.equal(screen("valeurs").rank.mode, "tap");
  assert.equal(screen("valeurs").rank.top, 3);
  assert.equal(screen("valeurs").title, "Choisis 3 à 5 valeurs qui comptent le plus pour toi.");
  assert.equal(screen("valeurs").rank.title, "Quelles sont tes 3 valeurs les plus importantes ?");
  assert.deepEqual(D.profil.points.valeurs, [3, 3, 3, 1, 1, 1, 1, 1, 0]);
  const a = firstAnswers();
  a.valeurs.picked.valeurs = ["enfants", "honnetete", "fidelite", "humour"];
  a.valeurs.order.valeurs = ["enfants", "honnetete", "fidelite", "humour"];
  const p = E.computeLoveProfile(a, D, "Léa");
  assert.deepEqual(p.values.nonNegotiables.map((v) => v.id), ["enfants", "honnetete", "fidelite"]);
  assert.deepEqual(p.values.toDiscuss.map((v) => v.id), ["humour"]);
  assert.ok(p.partner.critical.includes("Un partenaire qui ne veut pas d'enfants."));
  const top = firstAnswers();
  const ids = ["honnetete", "fidelite", "respect", "humour", "aventure"];
  top.valeurs.picked.valeurs = ids.slice();
  top.valeurs.order.valeurs = ids.slice();
  const swappedTop = firstAnswers();
  swappedTop.valeurs.picked.valeurs = ids.slice();
  swappedTop.valeurs.order.valeurs = ["fidelite", "honnetete", "respect", "humour", "aventure"];
  const ranked = E.computeLoveProfile(top, D, "Léa");
  const swapped = E.computeLoveProfile(swappedTop, D, "Léa");
  assert.deepEqual(swapped.profil.raw, ranked.profil.raw);
  assert.deepEqual(swapped.values.nonNegotiables.map((v) => v.id), ["fidelite", "honnetete", "respect"]);
  const tailUp = firstAnswers();
  tailUp.valeurs.picked.valeurs = ids.slice();
  tailUp.valeurs.order.valeurs = ["honnetete", "fidelite", "humour", "respect", "aventure"];
  const moved = E.computeLoveProfile(tailUp, D, "Léa");
  assert.equal(moved.profil.raw.complicite - ranked.profil.raw.complicite, 2);
  assert.equal(moved.profil.raw.harmonie - ranked.profil.raw.harmonie, -2);
  const onlyTop = firstAnswers();
  onlyTop.valeurs.picked.valeurs = ids.slice();
  onlyTop.valeurs.order.valeurs = ["aventure", "humour", "respect"];
  const fromTaps = E.computeLoveProfile(onlyTop, D, "Léa");
  assert.deepEqual(fromTaps.values.order.map((v) => v.id), ["aventure", "humour", "respect", "honnetete", "fidelite"]);
  assert.equal(fromTaps.profil.raw.intensite - ranked.profil.raw.intensite, 2);
  assert.equal(fromTaps.profil.raw.profondeur - ranked.profil.raw.profondeur, -2);
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

const P = D.profil;

function camilleAnswers() {
  const pick = (groups) => {
    const bag = { picked: {}, other: {}, order: {} };
    for (const [groupId, ids] of Object.entries(groups)) {
      bag.picked[groupId] = ids.slice();
      bag.other[groupId] = [];
      bag.order[groupId] = ids.slice();
    }
    return bag;
  };
  return {
    nourrit: pick({ nourrit: ["profondeur", "fiable", "desir", "ecoute"], vide: ["silences", "promesses", "routine"] }),
    ressource: pick({ soir: ["raconter", "evader"], weekend: ["adeux", "decouvrir", "nature"] }),
    langages: { order: ["moments", "toucher", "paroles"] },
    ennea: pick({ types: ["t4", "t6"] }),
    valeurs: pick({ valeurs: ["honnetete", "fidelite", "enfants", "culture", "aventure"] }),
    instinct: { order: ["sx", "sp", "so"] },
    stress: pick({ modere: ["C"], fort: ["freeze", "fawn"] }),
    freins: pick({ freins: ["moment"] }),
    etape: {
      engagement: "Cette semaine, je propose une soirée rien qu'à deux.",
      moment: "weekend",
      safety: null,
      time: null,
      picked: { actions: ["a5"] },
      other: { actions: [] },
      order: { actions: ["a5"] },
    },
  };
}

test("v1.4 · 7 besoins complets, couleurs et icônes", () => {
  assert.equal(P.order.length, 7);
  const fields = ["name", "key", "noun", "adj", "lower", "de", "color", "ink", "tint", "icon", "who", "s1", "secNeed", "bloomShort", "fadeShort", "bloom", "secBloom", "fade", "alarm", "secFade", "secCond", "partnerFond", "trigger", "calm"];
  const nouns = {
    securite: "Ancre", profondeur: "Miroir", admiration: "Étoile", liberte: "Oiseau",
    harmonie: "Oasis", complicite: "Équipe", intensite: "Volcan",
  };
  const adjs = {
    securite: "Fidèle", profondeur: "Profond·e", admiration: "Brillant·e", liberte: "Libre",
    harmonie: "Paisible", complicite: "Joueur·se", intensite: "Passionné·e",
  };
  for (const id of P.order) {
    const b = P.besoins[id];
    for (const f of fields) assert.ok(typeof b[f] === "string" && b[f].trim(), id + "." + f);
    assert.equal(b.noun, nouns[id]);
    assert.equal(b.adj, adjs[id]);
    assert.equal(b.bloomList.length, 3);
    assert.equal(b.fadeList.length, 3);
    assert.equal(b.sayPartner.length, 3);
    assert.equal(b.sayDate.length, 2);
    for (const k of ["rythme", "proximite", "independance", "conflits"]) assert.ok(b.rel[k]);
    assert.ok(P.icons[b.icon], "icône " + b.icon);
    assert.match(b.color, /^#[0-9A-F]{6}$/);
    assert.match(b.ink, /^#[0-9A-F]{6}$/);
  }
  assert.equal(new Set(P.order.map((id) => P.besoins[id].noun)).size, 7);
  assert.equal(new Set(P.order.map((id) => P.besoins[id].adj)).size, 7);
});

test("v1.4 · contraste : ink >= 4.5:1 et color >= 3:1 sur blanc", () => {
  const L = (h) => {
    const v = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((x) => x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const cr = (a) => 1.05 / (L(a) + 0.05);
  for (const id of P.order) {
    assert.ok(cr(P.besoins[id].ink) >= 4.5, id + " ink");
    assert.ok(cr(P.besoins[id].color) >= 3, id + " color");
  }
});

test("v1.4 · 42 combinaisons ordonnées : un nom unique, un alliage, des couples", () => {
  const names = new Set();
  for (const a of P.order) for (const b of P.order) {
    if (a === b) {
      assert.equal(P.couples[E.pairKey(P, a, b)].type, "miroir");
      continue;
    }
    names.add(P.besoins[a].noun + " " + P.besoins[b].adj);
    assert.ok(P.alliages[E.pairKey(P, a, b)], "alliage " + a + "+" + b);
    assert.ok(P.couples[E.pairKey(P, a, b)], "couple " + a + "+" + b);
  }
  assert.equal(names.size, 42);
  assert.ok(names.has("Miroir Passionné·e"));
  assert.equal(Object.keys(P.alliages).length, 21);
  assert.equal(Object.keys(P.couples).length, 28);
  for (const a of P.order) {
    const t = (type) => P.order.filter((o) => o !== a && P.couples[E.pairKey(P, a, o)].type === type).length;
    assert.equal(t("nourrit"), 2, a);
    assert.equal(t("proche"), 2, a);
    assert.equal(t("frotte"), 2, a);
  }
});

test("v1.4 · table de pondération : chaque option de Q1 à Q7 est connue", () => {
  const ids = (sid, gid) => (gid ? screen(sid).groups.find((g) => g.id === gid).items : screen(sid).items).map((it) => it.id);
  const check = (tbl, list) => {
    assert.deepEqual(Object.keys(tbl).sort(), list.slice().sort());
    for (const v of Object.values(tbl)) {
      const w = typeof v === "string" ? { p: v } : v;
      assert.ok(P.order.includes(w.p));
      if (w.s) assert.ok(P.order.includes(w.s));
    }
  };
  check(P.weights.nourrit, ids("nourrit", "nourrit"));
  check(P.weights.vide, ids("nourrit", "vide"));
  check(P.weights.ressource, ids("ressource", "soir").concat(ids("ressource", "weekend")).filter((v, i, a) => a.indexOf(v) === i));
  check(P.weights.langages, ids("langages"));
  check(P.weights.ennea, ids("ennea", "types"));
  check(P.weights.valeurs, ids("valeurs", "valeurs"));
  check(P.weights.instinct, ids("instinct"));
  check(P.weights.stress, ids("stress", "modere"));
  for (const id of ids("stress", "fort")) assert.equal(P.weights.stress[id], undefined, id);
});

test("v1.4 · aucun tiret long, jamais « sexuel », aucun TODO dans le profil", () => {
  for (const t of allStrings(P)) {
    assert.ok(!/[\u2013\u2014]/.test(t), t);
    assert.ok(!/sexuel/i.test(t), t);
    assert.ok(!/TODO/.test(t), t);
  }
});

test("v1.4 · déterministe et complet sur 3000 réponses, sans l'ennéagramme dans le score", () => {
  const r = rnd(42);
  const seen = new Set();
  for (let i = 0; i < 3000; i++) {
    const a = randomAnswers(r);
    const love = E.computeLoveProfile(a, D, i % 2 ? "Léa" : "");
    const p1 = love.profil;
    const flipped = JSON.parse(JSON.stringify(a));
    flipped.ennea = { picked: { types: ["t" + (1 + (i % 9))] }, other: { types: [] }, order: { types: ["t" + (1 + (i % 9))] } };
    const love2 = E.computeLoveProfile(flipped, D, i % 2 ? "Léa" : "");
    assert.deepEqual(p1.scores, love2.profil.scores);
    assert.equal(p1.name.text, love2.profil.name.text);
    assert.equal(p1.boussoleDom, love2.profil.boussoleDom);
    assert.equal(E.encodePayload(love.boussole), E.encodePayload(love2.boussole));
    assert.equal(p1.dom, p1.boussoleDom);
    assert.notEqual(p1.dom, p1.sec);
    assert.equal(p1.sentences.length, 3);
    assert.equal(p1.sections.length, 6);
    for (const s of p1.sections) assert.ok(s.title && (s.lead || s.rows || s.fond || s.partner));
    assert.equal(p1.sections[3].nourrit.length, 2);
    assert.equal(p1.sections[3].frotte.length, 2);
    assert.ok(p1.sections[3].critical.length >= 1);
    assert.equal(p1.sections[4].partner.length, 4);
    assert.equal(p1.sections[4].date.length, 3);
    assert.equal(p1.sections[5].exits.length, 3);
    assert.ok(p1.why.length >= 1);
    for (const t of allStrings({ h: p1.header, s: p1.sentences, sec: p1.sections, n: p1.name, w: p1.why })) {
      assert.ok(t.trim().length > 0);
      assert.ok(!/undefined|null|NaN|\{\w+\}/.test(t), t);
      assert.ok(!/[\u2013\u2014]/.test(t), t);
      assert.ok(!/sexuel/i.test(t), t);
    }
    seen.add(p1.name.text);
  }
  assert.ok(seen.size >= 30, "variété : " + seen.size);
});

test("v1.4 · calcul de référence (firstAnswers), sans Q4", () => {
  const p = E.computeLoveProfile(firstAnswers(), D, "Léa").profil;
  assert.deepEqual(p.scores, {
    securite: 20, profondeur: 33.3, admiration: 19.4, liberte: 20, harmonie: 25, complicite: 13.2, intensite: 0,
  });
  assert.equal(p.name.text, "Miroir Paisible");
});

test("v1.4 · égalités : ratio, puis nourrit, puis vide, puis ordre fixe", () => {
  const r = E.rank(P, [
    { need: "securite", pts: 45, src: "valeurs" },
    { need: "complicite", pts: 53, src: "nourrit" },
    { need: "liberte", pts: 30, src: "vide" },
    { need: "intensite", pts: 30, src: "valeurs" },
  ]);
  assert.deepEqual(r.ranking.slice(0, 4), ["complicite", "liberte", "securite", "intensite"]);
  assert.deepEqual(E.rank(P, []).ranking, P.order);
});

test("v1.4 · exposition sans l'ennéagramme", () => {
  assert.deepEqual(E.exposure(P), {
    securite: 45, profondeur: 36, admiration: 36, liberte: 30, harmonie: 44, complicite: 53, intensite: 30,
  });
});

test("v1.4 · exemple Camille : Miroir Fidèle, Q4 sans effet, piège gelé", () => {
  const a = camilleAnswers();
  const love = E.computeLoveProfile(a, D, "Camille");
  const p = love.profil;
  assert.equal(p.name.text, "Miroir Fidèle");
  assert.equal(p.margin, "net");
  assert.equal(p.trapId, "freeze");
  assert.equal(p.boussoleDom, "profondeur");
  assert.equal(love.boussole.imp.langage, "tres_important");
  assert.deepEqual(p.scores, {
    securite: 33.3, profondeur: 66.7, admiration: 2.8, liberte: 3.3, harmonie: 13.6, complicite: 7.5, intensite: 33.3,
  });
  assert.match(p.sentences[0], /^Camille, ton profil amoureux est Miroir Fidèle : /);
  assert.equal(love.boussole.v, 2);
  assert.deepEqual(Object.keys(love.boussole).sort(), ["imp", "notes", "v"]);
  const other = camilleAnswers();
  other.ennea = { picked: { types: ["t8"] }, other: { types: [] }, order: { types: ["t8"] } };
  const love2 = E.computeLoveProfile(other, D, "Camille");
  assert.equal(E.encodePayload(love.boussole), E.encodePayload(love2.boussole));
  assert.equal(love2.profil.name.text, "Miroir Fidèle");
});

function memoryStore() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test("persistance : réponses, étape, résultat, jamais la sécurité", () => {
  assert.equal(E.progressKey(), "quiz_amour_v16_progress");
  const store = memoryStore();
  const answers = firstAnswers();
  answers.etape.safety = "passe";
  const profile = E.computeLoveProfile(answers, D, "Léa");
  assert.ok(profile.pastAbuse);
  const stack = [
    { view: "intro", qi: 0, phase: "ask", groupStep: 0 },
    { view: "question", qi: 8, phase: "ask", groupStep: 1 },
    { view: "results", qi: 8, phase: "ask", groupStep: 1 },
  ];
  assert.equal(E.writeProgress(store, {
    prenom: "Léa",
    qi: 8,
    phase: "ask",
    groupStep: 0,
    view: "results",
    answers,
    lastPrefix: "Cette semaine",
    profile,
    stack,
  }), true);
  const back = E.readProgress(store);
  assert.equal(back.v, 16);
  assert.equal(back.prenom, "Léa");
  assert.equal(back.qi, 8);
  assert.equal(back.view, "results");
  assert.equal(back.answers.etape.safety, null);
  assert.equal(back.answers.etape.engagement, answers.etape.engagement);
  assert.equal(back.answers.nourrit.picked.nourrit[0], "ecoute");
  assert.equal(back.profile.safety, null);
  assert.equal(back.profile.pastAbuse, null);
  assert.equal(back.profile.sentences.length, 3);
  assert.equal(back.profile.profil.name.text, profile.profil.name.text);
  assert.equal(back.stack.length, 3);
  assert.equal(back.lastPrefix, "Cette semaine");
  assert.equal(E.readProgress({ getItem() { throw new Error("privé"); } }), null);
  assert.equal(E.writeProgress({ setItem() { throw new Error("plein"); } }, { view: "intro", answers: {} }), false);
  assert.equal(E.clearProgress({ removeItem() { throw new Error("bloqué"); } }), false);
  assert.equal(E.clearProgress(store), true);
  assert.equal(E.readProgress(store), null);
  assert.equal(E.parseProgress("{"), null);
  assert.equal(E.parseProgress({ v: 13, view: "intro", answers: {} }), null);
  assert.equal(E.parseProgress({ v: 14, view: "intro", answers: {} }), null);
  assert.equal(E.parseProgress({ v: 15, view: "intro", answers: {} }), null);
});

test("ce qui vide : jusqu'à 5 lignes perso, hors score, visibles, jamais autre:0", () => {
  const other = group("nourrit", "vide").other;
  assert.equal(other.multi, true);
  assert.equal(other.max, 5);
  assert.equal(other.addLabel, "+ Ajouter une autre ligne");
  assert.equal(D.ui.quiz.removeLine, "Retirer");
  assert.equal(group("nourrit", "nourrit").other.max, 1);
  const plain = E.computeLoveProfile(firstAnswers(), D, "Léa");
  const mixed = firstAnswers();
  mixed.nourrit.other.vide = ["Les mensonges répétés", "Le mépris en public", "   ", "Les comptes séparés imposés"];
  mixed.nourrit.order.vide = ["autre:0", "justifier", "autre:1", "critiques", "autre:3"];
  const love = E.computeLoveProfile(mixed, D, "Léa");
  assert.deepEqual(love.profil.scores, plain.profil.scores);
  assert.equal(love.profil.dom, plain.profil.dom);
  assert.deepEqual(love.boussole.imp, plain.boussole.imp);
  assert.deepEqual(love.profil.sections[1].ownDrains, [
    "les mensonges répétés",
    "le mépris en public",
    "les comptes séparés imposés",
  ]);
  assert.equal(love.vide.some((c) => !String(c.short).trim() || /^autre:\d+$/.test(c.short)), false);
  assert.match(love.exportText, /les mensonges répétés/);
  assert.match(love.exportText, /le mépris en public/);
  assert.match(love.exportText, /les comptes séparés imposés/);
  assert.equal(love.exportText.includes("autre:"), false);
  assert.equal(JSON.stringify(love.boussole).includes("mensonges répétés"), false);
  assert.ok(E.salleIds(D).includes(love.profil.dom));
  const alone = firstAnswers();
  alone.nourrit.picked.vide = [];
  alone.nourrit.other.vide = ["Le silence punitif", "Les critiques devant les amis", "Les promesses vagues"];
  alone.nourrit.order.vide = ["autre:0", "autre:1", "autre:2"];
  const solo = E.computeLoveProfile(alone, D, "Léa");
  assert.deepEqual(solo.profil.sections[1].ownDrains, [
    "le silence punitif",
    "les critiques devant les amis",
    "les promesses vagues",
  ]);
  assert.equal(solo.vide.length, 3);
  assert.equal(solo.exportText.includes("autre:"), false);
  assert.ok(E.salleIds(D).includes(solo.profil.dom));
  const tooFew = firstAnswers();
  tooFew.nourrit.picked.vide = [];
  tooFew.nourrit.other.vide = ["Une seule ligne"];
  tooFew.nourrit.order.vide = ["autre:0"];
  assert.throws(() => E.computeLoveProfile(tooFew, D, "Léa"));
  const store = {
    data: new Map(),
    getItem(key) { return this.data.has(key) ? this.data.get(key) : null; },
    setItem(key, value) { this.data.set(key, String(value)); },
    removeItem(key) { this.data.delete(key); },
  };
  assert.equal(E.writeProgress(store, {
    prenom: "Léa",
    qi: 0,
    phase: "ask",
    groupStep: 1,
    view: "question",
    answers: mixed,
    stack: [{ view: "question", qi: 0, phase: "ask", groupStep: 1 }],
  }), true);
  const back = E.readProgress(store);
  assert.deepEqual(back.answers.nourrit.other.vide, mixed.nourrit.other.vide);
  assert.equal(back.groupStep, 1);
  const restored = E.computeLoveProfile(back.answers, D, "Léa");
  assert.deepEqual(restored.profil.sections[1].ownDrains, love.profil.sections[1].ownDrains);
  assert.deepEqual(restored.profil.scores, love.profil.scores);
});

test("frein personnalisé : le texte saisi est le titre, pas autre:0", () => {
  const answers = firstAnswers();
  answers.freins.picked.freins = [];
  answers.freins.other.freins = ["La peur de trop m'attacher"];
  answers.freins.order.freins = ["autre:0"];
  const profile = E.computeLoveProfile(answers, D, "Léa");
  assert.equal(profile.brakes.first, "autre:0");
  const title = E.answerLabel(answers, D, "freins", "freins", profile.brakes.first);
  assert.equal(title, "La peur de trop m'attacher");
  assert.equal(title.includes("autre:"), false);
  assert.equal(profile.exportText.includes("autre:0"), false);
  assert.match(profile.exportText, /peur de trop m'attacher/);
  assert.equal(E.answerLabel(answers, D, "freins", "freins", "rejet"), "La peur d'être rejeté·e");
});

test("Calendly : utm d'arrivée dans utm_content, UTM du lien inchangés", () => {
  const base = D.config.calendly;
  assert.match(base, /utm_source=sommet-love-connexion/);
  assert.match(base, /utm_campaign=sommet-amour/);
  assert.equal(base.includes("amoureux-mais-malheureux"), false);
  const incoming = "?utm_source=webinaire-8oct&utm_campaign=sommet-live&theme=amour";
  for (const place of ["resultat-apres-profil", "resultat-sticky", "resultat-fin"]) {
    const url = new URL(E.calendlyLink(base, place, incoming));
    assert.equal(url.searchParams.get("utm_source"), "sommet-love-connexion");
    assert.equal(url.searchParams.get("utm_medium"), "quiz-amour");
    assert.equal(url.searchParams.get("utm_campaign"), "sommet-amour");
    assert.equal(url.searchParams.get("utm_content"), place + "|webinaire-8oct|sommet-live");
  }
  const plain = new URL(E.calendlyLink(base, "resultat-fin", ""));
  assert.equal(plain.searchParams.get("utm_content"), "resultat-fin");
  assert.equal(plain.searchParams.get("utm_source"), "sommet-love-connexion");
  const messy = new URL(E.calendlyLink(base, "resultat-sticky", "?utm_source=<script>&utm_campaign=a b"));
  assert.equal(messy.searchParams.get("utm_content"), "resultat-sticky|script|ab");
});

test("accueil : une icône ligne par carré, dans sa couleur, décorative", () => {
  const src = fs.readFileSync(new URL("./amour.js", import.meta.url), "utf8");
  assert.match(src, /const introIcons = \["heart", "sun", "hearts", "spark"\]/);
  assert.match(src, /ico\(introIcons\[i\] \|\| "heart", tone\)/);
  assert.match(src, /class="rule am-benefit"/);
  assert.match(src, /width:40px;height:40px/);
  assert.match(src, /width:64px;height:64px/);
  assert.match(src, /border-radius:22px/);
  assert.match(src, /border-radius:50%/);
  assert.match(src, /aria-hidden="true"/);
  const hearts = src.slice(src.indexOf("\n    hearts:"), src.indexOf("\n    anchor:"));
  assert.match(hearts, /vector-effect="non-scaling-stroke"/);
  assert.equal(/[\u2014\u2013]/.test(hearts), false);
});

test("textes du webinaire et page de partage", () => {
  assert.match(D.ui.intro.eyebrow, /Sommet de l'Amour/);
  assert.match(D.ui.intro.eyebrow, /9 questions/);
  assert.match(D.ui.intro.eyebrow, /environ 9 minutes/);
  assert.match(D.ui.intro.lead, /En 9 minutes/);
  assert.equal(D.ui.intro.eyebrow.includes("Love & Connexion"), false);
  assert.equal(D.ui.intro.lead.includes("6 minutes"), false);
  assert.equal(D.ui.quiz.engagementCounter, "Écris ton engagement et choisis un moment");
  assert.equal(D.ui.quiz.resumeNotice, "On reprend où tu en étais");
  assert.equal(D.ui.results.shareBtn, "Partager");
  assert.equal(D.ui.results.stickyCta, "Parler avec Pierre");
  const html = fs.readFileSync(new URL("../quiz-amour/index.html", import.meta.url), "utf8");
  assert.equal(D.ui.pageTitle, "Découvre ton profil amoureux");
  assert.equal(D.ui.intro.h1.includes("malheureux"), false);
  assert.match(D.ui.intro.h1, /Découvre ton <em>profil amoureux<\/em>/);
  assert.match(html, /property="og:title" content="Découvre ton profil amoureux"/);
  assert.match(html, /property="og:description" content="9 minutes pour mettre des mots sur ce dont tu as besoin en amour\. Quiz offert du Sommet de l'Amour\."/);
  assert.equal(html.includes("Amoureux, mais malheureux"), false);
  assert.match(html, /Sommet de l'Amour/);
  assert.match(html, /og:image" content="https:\/\/www\.magichumans\.com\/assets\/img\/og-image\.png"/);
  assert.match(html, /rel="canonical" href="https:\/\/www\.magichumans\.com\/quiz-amour\/"/);
  assert.match(html, /location\.replace/);
  assert.match(html, /http-equiv="refresh"/);
  assert.equal(html.includes("Love & Connexion"), false);
  assert.equal(html.includes("Talent Unique"), false);
  assert.equal(/[\u2014\u2013]/.test(html), false);
  const vercel = fs.readFileSync(new URL("../vercel.json", import.meta.url), "utf8");
  assert.equal(vercel.includes("/quiz-amour"), false);
});

test("stress fort hors du score, toujours dans le piège", () => {
  const fight = firstAnswers();
  const freeze = firstAnswers();
  freeze.stress.picked.fort = ["freeze"];
  freeze.stress.order.fort = ["freeze"];
  const a = E.computeLoveProfile(fight, D, "Léa");
  const b = E.computeLoveProfile(freeze, D, "Léa");
  assert.deepEqual(a.profil.scores, b.profil.scores);
  assert.equal(a.profil.name.text, b.profil.name.text);
  assert.equal(a.profil.trapId, "fight");
  assert.equal(b.profil.trapId, "freeze");
  assert.match(a.profil.sentences[2], /l'escalade/);
  assert.match(b.profil.sentences[2], /le blanc/);
});

test("Q4 vide : profil calculé, sans piste ennéagramme", () => {
  const a = firstAnswers();
  a.ennea = { picked: { types: [] }, other: { types: [] }, order: { types: [] } };
  const love = E.computeLoveProfile(a, D, "Léa");
  assert.equal(love.ennea.type, undefined);
  assert.equal(love.ennea.confidenceText, "");
  assert.equal(love.profil.name.text, "Miroir Paisible");
});

test("Talent Unique : un texte par besoin, 40 à 60 mots, piste et pas diagnostic", () => {
  const talent = D.ui.results.talent;
  assert.equal(D.ui.results.talentH, "Ce que ton profil dit de ton Talent Unique");
  assert.deepEqual(Object.keys(talent).sort(), D.profil.order.slice().sort());
  for (const id of D.profil.order) {
    const text = talent[id];
    const words = text.trim().split(/\s+/).length;
    assert.ok(words >= 40 && words <= 60, id + " " + words);
    assert.match(text, /Talent Unique/);
    assert.match(text, /Contexte Déclencheur/);
    assert.match(text, /Anti-Contexte/);
    assert.match(text, /réussir dans le plaisir/);
    assert.equal(/[\u2013\u2014]/.test(text), false, id);
    assert.equal(/[•✅➔]/.test(text), false, id);
  }
});

test("photo de la salle : session, profil anonyme, compatibilité déjà dans le moteur", () => {
  assert.equal(E.salleSession(""), "");
  assert.equal(E.salleSession("?theme=amour"), "");
  assert.equal(E.salleSession("?utm_source=newsletter"), "");
  assert.equal(E.salleSession("?utm_source=webinaire-8oct"), "webinaire-8oct");
  assert.equal(E.salleSession("?salle=webinaire-8oct&utm_source=site"), "webinaire-8oct");
  assert.equal(E.salleSession("?salle=webinaire-live&utm_source=webinaire-8oct"), "webinaire-live");
  assert.equal(E.salleSession("?utm_source=webinaire-"), "");
  assert.equal(E.salleSession("?utm_source=webinaire-8oct<script>"), "");
  assert.deepEqual(E.salleIds(D), ["securite", "profondeur", "admiration", "liberte", "harmonie", "complicite", "intensite"]);
  const nourrit = E.salleNourrit("securite", D);
  assert.ok(nourrit.includes("complicite"));
  assert.ok(nourrit.includes("profondeur"));
  assert.equal(nourrit.includes("liberte"), false);
  for (const id of nourrit) assert.equal(D.profil.couples[E.pairKey(D.profil, "securite", id)].type, "nourrit");
  const photo = E.sallePhoto("securite", [
    { id: "profondeur", n: 8 },
    { id: "complicite", n: 2 },
    { id: "intrus", n: 100 },
    { id: "securite", n: 5 },
  ], D);
  assert.equal(photo.total, 15);
  assert.equal(photo.bars.length, 7);
  assert.equal(photo.compat.id, "profondeur");
  assert.equal(photo.compat.name, "Profondeur");
  assert.equal(photo.compat.pct, Math.round((8 / 15) * 100));
  assert.equal(E.sallePhoto("securite", [], D).compat, null);
  assert.equal(D.ui.footer.includes("Rien n'est envoyé"), true);
  assert.equal(D.ui.footerSalle.includes("Rien n'est envoyé"), false);
  assert.match(D.ui.footerSalle, /Seul ton profil anonyme est compté pour la photo de la salle/);
  assert.equal(D.ui.results.salleH, "Photo de la salle ce soir");
  assert.equal(D.ui.results.salleWait, "La photo s'affiche dès 5 participants.");
  assert.equal(D.ui.results.salleRefresh, "Actualiser");
  assert.equal(D.ui.results.salleTotal, "{n} participants");
  assert.equal(D.ui.results.salleCompat, "Le profil le plus compatible avec toi, {name}, représente {pct} % de la salle.");
  const textes = [D.ui.footerSalle, D.ui.results.salleH, D.ui.results.salleWait, D.ui.results.salleCompat].join("\n");
  assert.equal(/[\u2014\u2013]/.test(textes), false);
  const src = fs.readFileSync(new URL("./amour.js", import.meta.url), "utf8");
  assert.match(src, /JSON\.stringify\(\{ session: session, profil: profil \}\)/);
  const html = fs.readFileSync(new URL("../quiz-amour/salle/index.html", import.meta.url), "utf8");
  assert.match(html, /noindex/);
  assert.match(html, /setInterval\(charger, 10000\)/);
  assert.match(html, /Photo de la salle/);
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
