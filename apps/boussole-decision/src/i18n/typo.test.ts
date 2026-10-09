import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { exporterResultat } from "@/features/maCible/export";
import { RESULTAT_EXEMPLE_EN } from "@/domain/maCible/exempleEn";
import { classerCibles } from "@/domain/maCible/scores";
import { espace } from "./messages/espace";
import { maCible } from "./messages/maCible";
import { insecables, sansInsecables } from "./typo";

const NB = "\u00a0";

/** Toutes les chaînes d'un dictionnaire (les fonctions sont vérifiées par le balayage des sources). */
function chaines(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(chaines);
  if (typeof v === "object" && v !== null && !(v instanceof RegExp)) return Object.values(v).flatMap(chaines);
  return [];
}

const NOMBRES = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|ninety|hundred";
const UNITES =
  "seconds?|minutes?|mins?|hours?|days?|weeks?|months?|years?|times|sessions?|workshops?|steps?|questions?|targets?|clients?|results?|fields?|actions?|ideas?|values?|situations?|people|leaders?|calls?|meetings?|sites?|tries";
const MOTIF = new RegExp(`\\b(${NOMBRES})(\\s|-)(${UNITES})\\b`, "i");
/** Tournures où « one » n'est pas un compte : on les garde en lettres. */
const IDIOMES = /\b(one day…|nice one day|one idea per line|one-to-one)/gi;
const EN_TOUTES_LETTRES = { test: (t: string) => MOTIF.test(t.replace(IDIOMES, "")) };

const SOURCES_EN = [
  "i18n/messages/maCibleEn.ts",
  "i18n/messages/espace.ts",
  "domain/maCible/exempleEn.ts",
  "domain/maCible/exempleApprofondirEn.ts",
  "domain/maCible/exempleSalarieEn.ts",
];
const racine = join(__dirname, "..");

describe("anglais : les nombres en chiffres", () => {
  it.each(SOURCES_EN)("%s n'écrit aucune durée ni aucun compteur en toutes lettres", (fichier) => {
    const lignes = readFileSync(join(racine, fichier), "utf8").split("\n");
    const fautes = lignes.map((l, i) => `${i + 1}: ${l.trim()}`).filter((l) => EN_TOUTES_LETTRES.test(l));
    expect(fautes).toEqual([]);
  });

  it("le dictionnaire anglais affiche « 2 minutes », pas « two minutes »", () => {
    const tout = [...chaines(maCible.en), ...chaines(espace.en)];
    expect(tout.filter((t) => EN_TOUTES_LETTRES.test(t))).toEqual([]);
    expect(tout.some((t) => /\b2\u00a0minutes\b/.test(t))).toBe(true);
  });

  it("le motif attrape bien les formes à éviter", () => {
    for (const faute of ["two minutes", "Three targets", "one hour", "ten-minute", "six months"]) expect(EN_TOUTES_LETTRES.test(faute), faute).toBe(true);
    for (const bon of ["2 minutes", "One day…", "One-to-one meetings", "one sentence", "at least one of the two"]) expect(EN_TOUTES_LETTRES.test(bon), bon).toBe(false);
  });
});

describe("espaces insécables", () => {
  it("colle le nombre à son unité, et la ponctuation haute au mot", () => {
    expect(insecables("en 2 minutes")).toBe(`en 2${NB}minutes`);
    expect(insecables("de 600 € à 1 200 €")).toBe(`de 600${NB}€ à 1 200${NB}€`);
    expect(insecables("Prix : €3,500")).toBe(`Prix${NB}: €3,500`);
    expect(insecables("« Bonjour » ?")).toBe(`«${NB}Bonjour${NB}»${NB}?`);
    expect(insecables("Ready in 2 minutes")).toBe(`Ready in 2${NB}minutes`);
  });

  it("aucun nombre suivi d'une espace simple dans les textes affichés (français et anglais)", () => {
    for (const dico of [maCible.fr, maCible.en, espace.fr, espace.en]) {
      const fautes = chaines(dico).filter((t) => /\d [\p{L}€%]/u.test(t) || / [:;?!»]/.test(t));
      expect(fautes).toEqual([]);
    }
  });

  it("l'export copié garde des espaces simples", () => {
    const { texte, markdown } = exporterResultat({ ...RESULTAT_EXEMPLE_EN, classement: classerCibles(RESULTAT_EXEMPLE_EN.cibles) }, "Camille", { M: maCible.en });
    expect(texte).not.toMatch(/[\u00a0\u202f]/);
    expect(markdown).not.toMatch(/[\u00a0\u202f]/);
    expect(sansInsecables(`2${NB}minutes`)).toBe("2 minutes");
  });
});
