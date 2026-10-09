// node --test quiz/amour-es.test.mjs · Quiz Amour en espagnol (lot ES 2)
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import test from "node:test";

const require = createRequire(import.meta.url);
const FR = require("./amour-data.js");
const ES_LANGUE = require("./amour-data-es.js");
const PAYS = require("./amour-pays-es.js");
const E = require("./amour-engine.js");
const ES_SANS_PAYS = E.withLanguage(FR, ES_LANGUE);
const ES = E.withLanguage(ES_SANS_PAYS, PAYS.pays[PAYS.defaut]);

const lire = (chemin) => fs.readFileSync(new URL(chemin, import.meta.url), "utf8");

/** Mêmes règles que le test anglais : un texte affiché, pas un identifiant ni une icône. */
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

/** Même regex que apps/boussole-decision/src/test/francais.ts : lettres accentuées que l'espagnol n'a pas, mots français qui n'existent pas en espagnol. */
const FRANCAIS_ES = new RegExp(
  "[èêàùçœâîôûëï]|(?<![\\p{L}])(est|pour|avec|vous|votre|tes|ton|ta|mon|ma|dans|pas|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça)(?![\\p{L}])|(?<![\\p{L}])(l|d|j|n|qu|c|s)['’]\\p{L}",
  "iu",
);
// Mots identiques en français et en espagnol : noms propres ou mots transparents.
const SAME_OK = new Set(["Oasis", "Libre", "social", "Dominante"]);

const frTexts = texts(FR);
const esTexts = texts(ES);

test("le test garde la même regex que celle de l'application", () => {
  const source = lire("../apps/boussole-decision/src/test/francais.ts");
  for (const mot of ["[èêàùçœâîôûëï]", "est|pour|avec|vous|votre|tes|ton|ta|mon|ma|dans|pas|cette|ces|aux|et|ou|où|qui|du|il|elle|je|nous|quand|mais|comme|chez|aussi|tout|tous|ça", "(l|d|j|n|qu|c|s)['’]"]) {
    assert.ok(source.includes(mot), "regex de référence changée : " + mot);
  }
});

test("couverture : chaque texte français affiché a sa version espagnole", () => {
  const missing = [];
  for (const [path, fr] of frTexts) {
    const es = at(ES, path);
    if (typeof es !== "string" || (es === fr && !SAME_OK.has(fr))) missing.push(path + " : " + fr);
  }
  assert.deepEqual(missing, []);
  assert.ok(frTexts.size > 1300, "l'extraction couvre tout le quiz");
});

test("la traduction garde la structure, les identifiants, les scores et les mêmes {variables}", () => {
  assert.deepEqual(structure(ES), structure(FR));
  assert.equal(ES.lang, "es");
  assert.equal(FR.lang, "fr");
  assert.deepEqual(ES.config, FR.config);
  assert.deepEqual(ES.profil.order, FR.profil.order);
  assert.deepEqual(ES.screens.map((s) => s.groups ? s.groups.map((g) => g.items.map((it) => [it.id, it.need, it.w])) : s.items.map((it) => it.id)),
    FR.screens.map((s) => s.groups ? s.groups.map((g) => g.items.map((it) => [it.id, it.need, it.w])) : s.items.map((it) => it.id)));
  const wrong = [];
  for (const [path, fr] of frTexts) if (placeholders(fr) !== placeholders(at(ES, path))) wrong.push(path);
  assert.deepEqual(wrong, []);
  // Les fichiers espagnols ne contiennent que des textes : aucune clé inconnue de la base.
  for (const [nom, overlay] of [["amour-data-es.js", ES_LANGUE], ["amour-pays-es.js (es-ES)", PAYS.pays[PAYS.defaut]]]) {
    (function walk(o, b, path) {
      if (o === null || typeof o !== "object") return;
      for (const k of Object.keys(o)) {
        assert.ok(b && Object.prototype.hasOwnProperty.call(b, k), nom + " : clé inconnue : " + path + k);
        walk(o[k], b[k], path + k + ".");
      }
    })(overlay, FR, "");
  }
});

test("aucun français dans les textes espagnols : ni lettres françaises, ni mots français, ni apostrophes d'élision", () => {
  const bad = [];
  for (const [path, es] of esTexts) {
    if (FRANCAIS_ES.test(es)) bad.push(path + " : " + es);
  }
  assert.deepEqual(bad, []);
  // La regex attrape bien du français : garde-fou contre une regex devenue trop large ou vide.
  for (const exemple of ["Découvre ton profil", "Ton cœur est ici", "C'est pour toi", "Une pareja avec du cœur"]) {
    assert.match(exemple, FRANCAIS_ES, exemple);
  }
  for (const exemple of ["Descubre tu perfil amoroso", "Una pareja que te escucha", "¿Qué te frena en el amor?"]) {
    assert.doesNotMatch(exemple, FRANCAIS_ES, exemple);
  }
});

test("espagnol propre : pas de tiret long, nombres en chiffres, espace insécable après un nombre, tutoiement sans « vosotros »", () => {
  const bad = [];
  for (const [path, es] of esTexts) {
    if (/[—–]/.test(es)) bad.push(path + " (tiret long) " + es);
    if (/(^|[^\p{L}])(dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|veinte|treinta)(?![\p{L}])/iu.test(es)) bad.push(path + " (nombre en lettres) " + es);
    if (/\d (?=[\p{L}%])/u.test(es)) bad.push(path + " (espace sécable après un nombre) " + es);
    // Texte valable pour l'Espagne comme pour l'Amérique latine : « tú » et l'impersonnel, jamais « vosotros ».
    if (/(^|[^\p{L}])(vosotros|vosotras|vuestr[oa]s?|os)(?![\p{L}])|\p{L}(áis|éis)(?![\p{L}])/iu.test(es)) bad.push(path + " (vosotros) " + es);
    if (/\.\.\. |  /.test(es)) bad.push(path + " (ponctuation) " + es);
  }
  assert.deepEqual(bad, []);
});

test("les mots du quiz suivent le glossaire de l'application : Test del Amor, Brújula, noms des 7 besoins", () => {
  assert.match(ES.ui.brand, /Test del Amor/);
  assert.equal(ES.ui.pageTitle, "Descubre tu perfil amoroso");
  const B = ES.profil.besoins;
  assert.deepEqual(ES.profil.order.map((id) => B[id].name), ["Seguridad", "Profundidad", "Admiración", "Libertad", "Armonía", "Complicidad", "Intensidad"]);
  assert.deepEqual(ES.profil.order.map((id) => B[id].noun), ["Ancla", "Espejo", "Estrella", "Pájaro", "Oasis", "Equipo", "Volcán"]);
  assert.deepEqual(ES.profil.order.map((id) => B[id].adj), ["Fiel", "Profundo", "Brillante", "Libre", "Sereno", "Cómplice", "Apasionado"]);
  assert.equal(ES.engine.nameOrder, "noun-adj");
  // La Boussole Relation s'appelle « Brújula de relación » dans l'application, et le repère du préréglage cite le Test del Amor.
  assert.match(ES.ui.results.boussoleLab, /^La Brújula de relación$/);
  assert.doesNotMatch(JSON.stringify(ES), /Quiz Amor|Brújula Relación|Quiz del Amor/);
  const app = lire("../apps/boussole-decision/src/domain/lovePrefill.ts");
  assert.ok(app.includes('QUIZ_MARK_ES = "Tomado de tu Test del Amor"'));
  const contenu = lire("../apps/boussole-decision/src/content/amourEs.ts");
  assert.ok(contenu.includes('profileName: "Brújula de relación"'));
});

test("les 42 noms de profil : nom puis adjectif accordé avec le nom (Ancla Serena, Espejo Sereno…)", () => {
  const B = ES.profil.besoins;
  const noms = [];
  for (const dom of ES.profil.order) {
    for (const sec of ES.profil.order) {
      if (sec !== dom) noms.push(B[dom].noun + " " + E.agreeAdj(B[sec].adj, B[dom].noun, "es"));
    }
  }
  assert.equal(noms.length, 42);
  assert.equal(new Set(noms).size, 42);
  assert.equal(noms[0], "Ancla Profunda");
  assert.ok(noms.includes("Espejo Sereno") && noms.includes("Ancla Serena") && noms.includes("Estrella Apasionada"));
  assert.ok(noms.includes("Equipo Cómplice") === false, "un profil ne se nomme jamais avec sa propre famille");
  assert.ok(noms.includes("Pájaro Cómplice") && noms.includes("Oasis Libre") && noms.includes("Volcán Fiel"));
  // Les nuances de l'encyclopédie commencent par l'adjectif, accordé avec le nom de la fiche, pour que le libellé en gras se détache.
  for (const id of ES.profil.order) {
    for (const [other, line] of Object.entries(ES.profil.encyclo.cards[id].nuances)) {
      const adj = E.agreeAdj(B[other].adj, B[id].noun, "es");
      assert.ok(line.startsWith(adj + ": "), id + "/" + other + " : " + line);
    }
    const guide = E.familyGuide(ES, id);
    assert.deepEqual(guide.nuances.map((n) => n.line.startsWith(n.adj + ": ")), guide.nuances.map(() => true));
  }
});

test("accord de l'adjectif : seul l'espagnol accorde, avec le genre du nom", () => {
  assert.equal(E.agreeAdj("Sereno", "Ancla", "es"), "Serena");
  assert.equal(E.agreeAdj("Sereno", "Espejo", "es"), "Sereno");
  assert.equal(E.agreeAdj("Apasionado", "Estrella", "es"), "Apasionada");
  assert.equal(E.agreeAdj("Fiel", "Estrella", "es"), "Fiel");
  assert.equal(E.agreeAdj("Cómplice", "Ancla", "es"), "Cómplice");
  assert.equal(E.agreeAdj("Profond·e", "Étoile", "fr"), "Profond·e");
  assert.equal(E.agreeAdj("Peaceful", "Anchor", "en"), "Peaceful");
});

test("firstPerson en espagnol : tú devient yo, tu devient mi, contigo devient conmigo", () => {
  assert.equal(E.firstPerson("Una pareja que te dice lo que le gusta de ti", "es"), "Una pareja que me dice lo que le gusta de mí");
  assert.equal(E.firstPerson("Una pareja que tiene su vida y no vive tu tiempo a solas como un abandono", "es"), "Una pareja que tiene su vida y no vive mi tiempo a solas como un abandono");
  assert.equal(E.firstPerson("Con ganas de hacer cosas contigo, y de ver a tus amigos", "es"), "Con ganas de hacer cosas conmigo, y de ver a mis amigos");
  assert.equal(E.firstPerson("Tú decides y tu pareja respeta tus tiempos", "es"), "Yo decides y mi pareja respeta mis tiempos");
  assert.equal(E.firstPerson("La atención de tu pareja", "es"), "La atención de mi pareja");
  assert.equal(E.firstPerson("Un partenaire qui te laisse ton espace", "fr"), "Un partenaire qui me laisse mon espace");
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

function decodeAncre(payload) {
  const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(b64 + "=".repeat((4 - (b64.length % 4)) % 4), "base64").toString("utf8"));
}

test("le résultat calculé en espagnol est propre : phrases, critères, notes et ancre de la Boussole", () => {
  let calcules = 0;
  for (let seed = 1; seed <= 60; seed++) {
    const answers = answersFor(FR, seed);
    let profil;
    try { profil = E.computeLoveProfile(answers, ES, "Sam"); } catch (e) { continue; }
    calcules++;
    const fr = E.computeLoveProfile(answers, FR, "Sam");
    for (const line of profil.profil.sentences) assert.doesNotMatch(line, FRANCAIS_ES, line);
    for (const note of Object.values(profil.boussole.notes)) assert.doesNotMatch(note, FRANCAIS_ES, note);
    assert.doesNotMatch(profil.shareText + "\n" + profil.exportText, FRANCAIS_ES);
    assert.match(profil.profil.sentences[0], /^Sam, tu perfil amoroso es /);
    // Les critères proposés à la Boussole se lisent à la première personne, comme ceux du modèle espagnol (« Mis necesidades… »).
    assert.equal(profil.boussole.crit.length, fr.boussole.crit.length, "aucun critère perdu en espagnol (120 caractères au plus)");
    for (const c of profil.boussole.crit) {
      assert.doesNotMatch(c.l, /(^|[^\p{L}])(tú|tu|tus|ti|te|contigo|tuyo|tuya|tuyos|tuyas)(?![\p{L}])/iu, "critère à la 2e personne : " + c.l);
      assert.doesNotMatch(c.l, FRANCAIS_ES, c.l);
      assert.ok(c.l.length <= 120);
    }
    // L'ancre envoyée à la Boussole est lisible telle quelle : version 3, nom du profil en espagnol, critères en espagnol.
    const ancre = decodeAncre(E.encodePayload(profil.boussole));
    assert.equal(ancre.v, 3);
    assert.equal(ancre.p, profil.profil.name.text);
    assert.ok(ancre.p.length <= 60);
    assert.deepEqual(ancre.crit.map((c) => c.l), profil.boussole.crit.map((c) => c.l));
    assert.deepEqual(ancre.imp, fr.boussole.imp);
    for (const c of ancre.crit) assert.ok(/^[a-z0-9_-]{1,40}$/.test(c.id), c.id);
  }
  assert.ok(calcules >= 30);
});

test("sans prénom : « Tu perfil amoroso es… » en espagnol", () => {
  let answers;
  for (let seed = 1; seed < 50; seed++) {
    answers = answersFor(FR, seed);
    try { E.computeLoveProfile(answers, ES, ""); break; } catch (e) { /* réponses incomplètes */ }
  }
  const sans = E.computeLoveProfile(answers, ES, "");
  assert.match(sans.profil.sentences[0], /^Tu perfil amoroso es /);
  assert.equal(sans.profil.header.eyebrow, ES.profil.ui.eyebrowAnon);
  const avec = E.computeLoveProfile(answers, ES, "Sam");
  assert.match(avec.profil.header.eyebrow, /^Sam, tu perfil amoroso/);
});

/** Les chemins que le bloc d'un pays a le droit de contenir : numéros d'aide, lieux de rencontre, heures du rappel. */
const CHEMINS_PAYS = [
  /^safety\.(present|doute)\.text$/,
  /^ui\.results\.ethicsP$/,
  /^profil\.besoins\.[a-z]+\.rencontre\.(lieux|activites)\[\d+\]\.texte$/,
  /^times\[\d+\]\.label$/,
];

test("ce qui dépend du pays est regroupé dans amour-pays-es.js, et nulle part ailleurs", () => {
  const pays = PAYS.pays[PAYS.defaut];
  assert.equal(PAYS.defaut, "es-ES");
  assert.deepEqual(Object.keys(PAYS.pays), ["es-ES"]);
  // 1. Le bloc du pays ne contient que des chemins autorisés.
  const dansPays = texts(pays);
  assert.ok(dansPays.size > 40);
  const interdits = [...dansPays.keys()].filter((p) => !CHEMINS_PAYS.some((re) => re.test(p)));
  assert.deepEqual(interdits, []);
  // 2. Le fichier de langue n'en contient aucun : un seul endroit à remplacer pour un autre pays.
  const dansLangue = [...texts(ES_LANGUE).keys()].filter((p) => CHEMINS_PAYS.some((re) => re.test(p)));
  assert.deepEqual(dansLangue, []);
  assert.deepEqual(Object.keys(ES_LANGUE.safety.present), ["title"]);
  assert.deepEqual(Object.keys(ES_LANGUE.safety.doute), ["title"]);
  assert.equal(ES_LANGUE.times, undefined);
  // 3. Les lieux et activités : 7 besoins, 3 lieux et 3 activités chacun, en espagnol et sans « apéro » ou autre usage importé de France.
  for (const id of FR.profil.order) {
    const r = pays.profil.besoins[id].rencontre;
    assert.equal(r.lieux.length, 3, id);
    assert.equal(r.activites.length, 3, id);
  }
  assert.doesNotMatch(JSON.stringify(pays), /apéro|café-théâtre|MJC|Pôle emploi/i);
  // 4. Numéros d'aide de l'Espagne, comme dans la Boussole Relation : 016 et 112, jamais ceux de la France.
  const aide = [ES.safety.present.text, ES.safety.doute.text, ES.ui.results.ethicsP].join("\n");
  assert.match(aide, /016/);
  assert.match(aide, /112/);
  assert.match(ES.safety.present.text.replace(/\u00a0/g, " "), /En España: 016 \(violencia de género, gratuito y confidencial, 24 horas\), 112 en caso de peligro inmediato\./);
  assert.doesNotMatch(aide, /3919|\b17\b|\b114\b|Francia|France/);
  const boussole = lire("../apps/boussole-decision/src/content/amourEs.ts");
  assert.ok(boussole.includes("En España: 016 (violencia de género, gratuito y confidencial, 24 horas), 112 en caso de peligro inmediato."));
  // 5. Heures du rappel au format 24 h de l'Espagne ; les identifiants du rappel (08:00…) ne changent pas.
  assert.deepEqual(ES.times.map((t) => t.label), ["8:00", "12:30", "18:00", "21:00"]);
  assert.deepEqual(ES.times.map((t) => t.id), FR.times.map((t) => t.id));
  // 6. Le texte de la langue ne cite ni numéro, ni pays, ni monnaie, ni date : rien d'autre à remplacer.
  const langueSeule = JSON.stringify(ES_SANS_PAYS.profil.besoins) + JSON.stringify(ES_LANGUE.ui) + JSON.stringify(ES_LANGUE.screens);
  assert.doesNotMatch(JSON.stringify(ES_LANGUE), /\b(016|112|3919|España|Francia)\b|€|euros?\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/);
  assert.ok(langueSeule.length > 1000);
});

test("le quiz charge l'espagnol : fichiers dans l'ordre, pays appliqué après la langue, mémoire de langue partagée avec le site", () => {
  const html = lire("./index.html");
  const donnees = html.indexOf('"/quiz/amour-data.js"');
  const es = html.indexOf('"/quiz/amour-data-es.js"');
  const pays = html.indexOf('"/quiz/amour-pays-es.js"');
  const moteur = html.indexOf('"/quiz/amour-engine.js"');
  assert.ok(donnees >= 0 && donnees < es && es < pays && pays < moteur);
  const js = lire("./amour.js");
  assert.match(js, /if \(l === "es" && window\.AMOUR_DATA_ES\) \{/);
  assert.match(js, /E\.withLanguage\(DATA_FR, window\.AMOUR_DATA_ES\)/);
  assert.match(js, /E\.withLanguage\(es, pays\.pays\[pays\.defaut\]\)/);
  assert.doesNotMatch(js, /l'espagnol reste en français/);
  // La Boussole s'ouvre en espagnol : ?lang=es dans le lien, avant l'ancre #amour= (y compris pour « sauvegarder »).
  assert.match(js, /return D\.config\.boussoleUrl \+ "&lang=" \+ lang;/);
  assert.match(js, /boussoleBase\(\) \+ "#amour=" \+ E\.encodePayload\(profile\.boussole\)/);
  assert.match(js, /boussoleBase\(\) \+ "&sauver=1#amour=" \+ E\.encodePayload\(resultProfile\.boussole\)/);
  assert.equal(ES.config.boussoleUrl + "&lang=es", "/boussole-decision/importer-quiz/?theme=amour&lang=es");
  assert.match(js, /localStorage\.getItem\("mh-lang"\); if \(v === "en" \|\| v === "fr" \|\| v === "es"\)/);
  assert.match(js, /localStorage\.setItem\("mh-lang", lang\);/);
  assert.match(js, /document\.documentElement\.lang = D\.lang \|\| "fr";/);
});

test("le PDF et l'impression sont aussi en espagnol : bouton, titre de page, contenu", () => {
  assert.equal(ES.ui.results.nowPdf, "Descargar mi perfil (PDF)");
  assert.match(ES.ui.pageTitle, /perfil amoroso/);
  // Le PDF est l'impression de la page de résultat : il n'a aucun texte propre, tout vient des données.
  const js = lire("./amour.js");
  assert.match(js, /document\.title = U\.pageTitle \+ " \| Magic Humans";/);
  assert.match(js, /window\.print\(\)/);
});

test("« où rencontrer » : 3 lieux, 3 activités, un cadre où briller et un à éviter, pour chacun des 7 besoins", () => {
  for (const id of ES.profil.order) {
    const r = ES.profil.besoins[id].rencontre;
    assert.equal(r.lieux.length, 3);
    assert.equal(r.activites.length, 3);
    assert.ok(r.brilles.texte && r.eviter.texte && r.talent);
    assert.match(r.talent, /Talento Único/);
  }
  assert.equal(ES.ui.results.meetH, "Dónde conocer a alguien que te convenga");
});

test("la fiche de la Boussole garde le sens : « Contexto Desencadenante » et « Anti-Contexto » comme dans l'application", () => {
  for (const id of ES.profil.order) {
    const talent = ES.ui.results.talent[id];
    assert.match(talent, /Contexto Desencadenante/);
    assert.match(talent, /Anti-Contexto/);
  }
});
