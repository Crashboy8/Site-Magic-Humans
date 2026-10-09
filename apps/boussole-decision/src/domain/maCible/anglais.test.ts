import { describe, expect, it } from "vitest";
import { validerEntree } from "./entree";
import { ENTREE_EXEMPLE_EN, RESULTAT_EXEMPLE_EN } from "./exempleEn";
import { CIBLE_PISTE_EXEMPLE_EN, PISTES_EXEMPLE_EN, PORTRAIT_EXEMPLE_EN } from "./exempleApprofondirEn";
import { ENTREE_SALARIE_EXEMPLE_EN, RESULTAT_SALARIE_EXEMPLE_EN } from "./exempleSalarieEn";
import { alignerSignature, appliquerQualite, mauvaisRegistre, phrasesDepartage, qualiteCible, qualitePortrait, signatureDe, type ContexteQualite } from "./qualite";
import { qualiteSalarie } from "./qualiteSalarie";
import { classerCibles } from "./scores";
import { TEXTES_QUALITE } from "./textesQualite";
import type { Resultat, ResultatSalarie } from "./types";
import { validerResultat, validerResultatSalarie } from "./validation";

const copie = <T>(x: T): T => structuredClone(x);

function ctx(extra: Partial<ContexteQualite> = {}): ContexteQualite {
  const { talent, terrain } = ENTREE_EXEMPLE_EN;
  return {
    antiContexte: talent.antiContexte,
    reseau: [terrain.experience, terrain.clientsPasses, talent.reussite].join("\n"),
    idee: "",
    marche: terrain.marche,
    prixActuel: terrain.prixActuel,
    adresse: terrain.adresse,
    formats: terrain.formats,
    talent: `${talent.mecanisme}\n${talent.contexte}`,
    langue: "en",
    ...extra,
  };
}

/** Indices d'un texte resté en français : lettres accentuées ou petits mots très français. */
const FRANCAIS = /[éèêàùçœ]|\b(le|la|les|des|du|une|est|pour|avec|vous|votre|tes|ton|ta)\b/i;

function textes(x: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof x === "string") return [{ chemin, texte: x }];
  if (Array.isArray(x)) return x.flatMap((v, i) => textes(v, `${chemin}[${i}]`));
  if (x && typeof x === "object") return Object.entries(x).flatMap(([k, v]) => textes(v, chemin ? `${chemin}.${k}` : k));
  return [];
}

/** Champs qui gardent volontairement du français : noms de lieux et recherches locales en France. */
const PERMIS = /\.(recherche|motsCles|zone)$|Ille-et-Vilaine|Auvergne-Rhône-Alpes|Saint-Priest|Rhône/;

describe("exemples du Cibleur en anglais (traduits, pas régénérés)", () => {
  it("l'entrée d'exemple est valide et en anglais", () => {
    expect(validerEntree(ENTREE_EXEMPLE_EN).ok).toBe(true);
    expect(validerEntree(ENTREE_SALARIE_EXEMPLE_EN).ok).toBe(true);
    expect(ENTREE_EXEMPLE_EN.langue).toBe("en");
  });

  it("le résultat d'exemple passe la validation et les contrôles en anglais, sans réparation", () => {
    const v = validerResultat(copie(RESULTAT_EXEMPLE_EN));
    expect(v.ok).toBe(true);
    const q = appliquerQualite(copie(RESULTAT_EXEMPLE_EN) as Resultat, ctx());
    expect(q.erreurs).toEqual([]);
    expect(q.reparations).toBe(0);
    expect(q.resultat.cibles[0].messages.emailCorps.endsWith(signatureDe("vous", "en"))).toBe(true);
  });

  it("garde les mêmes notes que l'exemple français, donc le même classement", async () => {
    const { RESULTAT_EXEMPLE } = await import("./exemple");
    expect(classerCibles(RESULTAT_EXEMPLE_EN.cibles)).toEqual(classerCibles(RESULTAT_EXEMPLE.cibles));
  });

  it("le jeu d'essai salarié passe la validation et les contrôles en anglais, sans réparation", () => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE_EN), true);
    if (!v.ok) throw new Error(v.erreurs.join("\n"));
    const q = qualiteSalarie(v.valeur as ResultatSalarie, { adresse: "vous", aEviter: "", langue: "en" });
    expect(q.erreurs).toEqual([]);
    expect(q.reparations).toBe(0);
  });

  it("aucun texte des exemples anglais n'est resté en français", () => {
    const tous = [
      ...textes(RESULTAT_EXEMPLE_EN, "resultat"),
      ...textes(ENTREE_EXEMPLE_EN, "entree"),
      ...textes(PORTRAIT_EXEMPLE_EN, "portrait"),
      ...textes(PISTES_EXEMPLE_EN, "pistes"),
      ...textes(CIBLE_PISTE_EXEMPLE_EN, "piste"),
      ...textes(RESULTAT_SALARIE_EXEMPLE_EN, "salarie"),
    ].filter(({ chemin, texte }) => !PERMIS.test(chemin) && !PERMIS.test(texte) && !/^(c\d|p\d|i\d|v\d|fr|en|les_deux|vous|tu|b2b|b2c|chaleureux|direct|groupe|presentiel|individuel|salarie|reconversion|cdi|pme|asso_public|autonomie|transparence|impact|10a20|quiz|forte|moyenne|toutes|autre|telephone|linkedin|email|evenements|contenu|bouche_a_oreille|HT|TTC|entreprises|evenement|reseau|recommandation|conseil|spontanee|salon|club|en_ligne|)$/.test(texte));
    const restes = tous.filter(({ texte }) => FRANCAIS.test(texte)).map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 60)}`);
    expect(restes).toEqual([]);
  });

  it("le portrait et la piste creusée passent les contrôles en anglais", () => {
    const p = qualitePortrait(copie(PORTRAIT_EXEMPLE_EN), "", "en");
    expect(p.portrait.prenom).toBe("Claire");
    const c = qualiteCible(copie(CIBLE_PISTE_EXEMPLE_EN), ctx());
    expect(c.erreurs).toEqual([]);
  });
});

describe("contrôles qualité par langue", () => {
  it("remplace une question hypothétique par une question de secours anglaise", () => {
    const r = copie(RESULTAT_EXEMPLE_EN) as Resultat;
    r.cibles[0].testTerrain.questions[0] = "If you could wave a magic wand, what would you change?";
    r.cibles[0].testTerrain.questions[1] = "Would you pay for a programme like this?";
    const q = appliquerQualite(r, ctx());
    const questions = q.resultat.cibles[0].testTerrain.questions;
    expect(questions[0]).toBe(TEXTES_QUALITE.en.questions.vous[0]);
    expect(questions[1]).toBe(TEXTES_QUALITE.en.questions.vous[1]);
    expect(questions.join(" ")).not.toMatch(FRANCAIS);
  });

  it("répare une signature française dans un email anglais", () => {
    const corps = "Hello [First name],\n\nA short message.\n\nBien à vous,\n\n{{prenom}}";
    expect(alignerSignature(corps, "vous", 1100, "en")).toBe("Hello [First name],\n\nA short message.\n\nKind regards,\n\n{{prenom}}");
    expect(alignerSignature("Hi [First name],\n\nShort.\n\nKind regards,\n\n{{prenom}}", "tu", 1100, "en")).toBe("Hi [First name],\n\nShort.\n\nTalk soon,\n\n{{prenom}}");
  });

  it("ne cherche pas de tutoiement ou de vouvoiement en anglais", () => {
    expect(mauvaisRegistre("Would you have 15 minutes?", "tu", "en")).toBe(false);
    expect(mauvaisRegistre("Auriez-vous 15 minutes ?", "tu", "fr")).toBe(true);
  });

  it("plafonne le plaisir avec une raison anglaise", () => {
    const r = copie(RESULTAT_EXEMPLE_EN) as Resultat;
    const q = appliquerQualite(r, ctx({ antiContexte: "production teams in food plants under tension" }));
    const plafonnees = q.resultat.cibles.filter((c) => c.scores.plaisir.raison === TEXTES_QUALITE.en.plaisirPlafonne);
    expect(plafonnees.length).toBeGreaterThan(0);
    expect(TEXTES_QUALITE.en.plaisirPlafonne).not.toMatch(FRANCAIS);
  });

  it("écrit les phrases de départage dans la langue du résultat", () => {
    const cibles = RESULTAT_EXEMPLE_EN.cibles.map((c) => ({ id: c.id, nom: c.nom }));
    const egal = RESULTAT_EXEMPLE_EN.cibles.map((c) => ({ ...c, scores: RESULTAT_EXEMPLE_EN.cibles[2].scores }));
    const lignes = classerCibles(egal);
    const en = phrasesDepartage(cibles, lignes, "en");
    const fr = phrasesDepartage(cibles, lignes, "fr");
    expect(en.length).toBe(fr.length);
    for (const phrase of en) expect(phrase).not.toMatch(FRANCAIS);
  });

  it("la phrase de sortie salarié est ajoutée en anglais avant la signature anglaise", () => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE_EN), true);
    if (!v.ok) throw new Error(v.erreurs.join("\n"));
    const r = v.valeur as ResultatSalarie;
    r.patrons[0].pitchs.emailCorps = "Hello [First name],\n\nYour second site will double the orders 🚀, and I've done this twice without a missed delivery.\n\nWould you have 15 minutes to talk about it?\n\nKind regards,\n\n{{prenom}}";
    const q = qualiteSalarie(r, { adresse: "vous", aEviter: "", langue: "en" });
    const corps = q.resultat.patrons[0].pitchs.emailCorps;
    expect(corps).not.toMatch(/🚀/);
    expect(corps.endsWith(`${TEXTES_QUALITE.en.salarie.phraseSortie.vous}\n\nKind regards,\n\n{{prenom}}`)).toBe(true);
  });

  it("les questions de secours et les textes ajoutés existent dans chaque langue", () => {
    for (const langue of ["fr", "en", "es"] as const) {
      const T = TEXTES_QUALITE[langue];
      expect(T.questions.tu.length).toBeGreaterThanOrEqual(3);
      expect(T.questions.vous.length).toBe(T.questions.tu.length);
      expect(T.prenomsSecours.length).toBeGreaterThan(0);
    }
    expect(TEXTES_QUALITE.en.questions.vous.join(" ")).not.toMatch(FRANCAIS);
  });
});
