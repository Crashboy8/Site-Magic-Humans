// Page « Tes outils » : deux rubriques, ordre des outils, pas de jeu vidéo.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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

test("vie professionnelle : QCM Talent, Boussole, Cibleur, Carte du Talent en dernier", () => {
  assert.deepEqual(liens(rubrique("pro")), ["/quiz/", "/boussole-decision/", "/boussole-decision/ma-cible/", "/carte-du-talent/"]);
});

test("vie perso et amour : Quiz Amour puis Boussole Relation", () => {
  assert.deepEqual(liens(rubrique("perso")), ["/quiz-amour/", "/boussole-decision/importer-quiz/?theme=amour"]);
  assert.match(rubrique("perso"), />Boussole Relation</);
});

test("six outils en tout, chaque rubrique a son icône, pas de jeu vidéo", () => {
  assert.equal(liens(html).length, 6);
  assert.equal((html.match(/class="outils-rubrique-icone"/g) || []).length, 2);
  assert.doesNotMatch(html, /talent-game/);
});

test("pas de tiret long ni moyen, pied de page conservé", () => {
  assert.doesNotMatch(html, /[\u2013\u2014]/);
  for (const href of ["/outils/", "/mentions-legales/", "/confidentialite/"]) assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /js-manage-cookies/);
});
