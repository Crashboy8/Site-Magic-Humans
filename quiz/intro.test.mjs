// Page d'accueil du Quiz Talent Unique : l'intitulé ne dit pas que l'outil est gratuit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");

test("l'intitulé au-dessus du titre donne le nombre de questions et la durée, sans « gratuit » (français, anglais, espagnol)", () => {
  const intitules = [...html.matchAll(/eyebrow:"([^"]*(?:questions|preguntas)[^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(intitules, ["9 questions · 6 minutes", "9 questions · 6 minutes", "9 preguntas · 6 minutos"]);
  for (const texte of intitules) assert.doesNotMatch(texte, /gratuit|gratis|\bfree\b/i, texte);
});
