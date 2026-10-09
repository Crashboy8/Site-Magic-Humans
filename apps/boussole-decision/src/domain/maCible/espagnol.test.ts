import { describe, expect, it } from "vitest";
import { validerEntree } from "./entree";
import { ENTREE_EXEMPLE_ES, RESULTAT_EXEMPLE_ES } from "./exempleEs";
import { CIBLE_PISTE_EXEMPLE_ES, PISTES_EXEMPLE_ES, PORTRAIT_EXEMPLE_ES } from "./exempleApprofondirEs";
import { ENTREE_SALARIE_EXEMPLE_ES, RESULTAT_SALARIE_EXEMPLE_ES } from "./exempleSalarieEs";
import { alignerSignature, appliquerQualite, estQuestionMom, mauvaisRegistre, phrasesDepartage, qualiteCible, qualitePortrait, recoupe, signatureDe, type ContexteQualite } from "./qualite";
import { qualiteSalarie } from "./qualiteSalarie";
import { classerCibles } from "./scores";
import { TEXTES_QUALITE } from "./textesQualite";
import type { Resultat, ResultatSalarie } from "./types";
import { validerResultat, validerResultatSalarie } from "./validation";
import { FRANCAIS_ES } from "@/test/francais";

const copie = <T>(x: T): T => structuredClone(x);

function ctx(extra: Partial<ContexteQualite> = {}): ContexteQualite {
  const { talent, terrain } = ENTREE_EXEMPLE_ES;
  return {
    antiContexte: talent.antiContexte,
    reseau: [terrain.experience, terrain.clientsPasses, talent.reussite].join("\n"),
    idee: "",
    marche: terrain.marche,
    prixActuel: terrain.prixActuel,
    adresse: terrain.adresse,
    formats: terrain.formats,
    talent: `${talent.mecanisme}\n${talent.contexte}`,
    langue: "es",
    ...extra,
  };
}

function textes(x: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof x === "string") return [{ chemin, texte: x }];
  if (Array.isArray(x)) return x.flatMap((v, i) => textes(v, `${chemin}[${i}]`));
  if (x && typeof x === "object") return Object.entries(x).flatMap(([k, v]) => textes(v, chemin ? `${chemin}.${k}` : k));
  return [];
}

/** Champs qui gardent volontairement du français : noms de lieux et recherches locales en France. */
const PERMIS = /\.(recherche|motsCles|zone)$|Ille-et-Vilaine|Auvergne-Rhône-Alpes|Saint-Priest|Rhône|Pays de la Loire/;
const CODES = /^(c\d|p\d|i\d|v\d|fr|en|es|les_deux|vous|tu|b2b|b2c|chaleureux|direct|groupe|presentiel|individuel|salarie|reconversion|cdi|pme|asso_public|autonomie|transparence|impact|10a20|quiz|forte|moyenne|toutes|autre|telephone|linkedin|email|evenements|contenu|bouche_a_oreille|HT|TTC|entreprises|evenement|reseau|recommandation|conseil|spontanee|salon|club|en_ligne|)$/;

describe("exemples du Cibleur en espagnol (traduits à la main, pas régénérés)", () => {
  it("l'entrée d'exemple est valide et en espagnol", () => {
    expect(validerEntree(ENTREE_EXEMPLE_ES).ok).toBe(true);
    expect(validerEntree(ENTREE_SALARIE_EXEMPLE_ES).ok).toBe(true);
    expect(ENTREE_EXEMPLE_ES.langue).toBe("es");
  });

  it("le résultat d'exemple passe la validation et les contrôles en espagnol, sans réparation", () => {
    const v = validerResultat(copie(RESULTAT_EXEMPLE_ES));
    expect(v.ok).toBe(true);
    const q = appliquerQualite(copie(RESULTAT_EXEMPLE_ES) as Resultat, ctx());
    expect(q.erreurs).toEqual([]);
    expect(q.reparations).toBe(0);
    expect(q.resultat.cibles[0].messages.emailCorps.endsWith(signatureDe("vous", "es"))).toBe(true);
  });

  it("garde les mêmes notes que l'exemple français, donc le même classement", async () => {
    const { RESULTAT_EXEMPLE } = await import("./exemple");
    expect(classerCibles(RESULTAT_EXEMPLE_ES.cibles)).toEqual(classerCibles(RESULTAT_EXEMPLE.cibles));
  });

  it("le jeu d'essai salarié passe la validation et les contrôles en espagnol, sans réparation", () => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE_ES), true);
    if (!v.ok) throw new Error(v.erreurs.join("\n"));
    const q = qualiteSalarie(v.valeur as ResultatSalarie, { adresse: "vous", aEviter: "", langue: "es" });
    expect(q.erreurs).toEqual([]);
    expect(q.reparations).toBe(0);
  });

  it("aucun texte des exemples espagnols n'est resté en français", () => {
    const tous = [
      ...textes(RESULTAT_EXEMPLE_ES, "resultat"),
      ...textes(ENTREE_EXEMPLE_ES, "entree"),
      ...textes(PORTRAIT_EXEMPLE_ES, "portrait"),
      ...textes(PISTES_EXEMPLE_ES, "pistes"),
      ...textes(CIBLE_PISTE_EXEMPLE_ES, "piste"),
      ...textes(RESULTAT_SALARIE_EXEMPLE_ES, "salarie"),
      ...textes(ENTREE_SALARIE_EXEMPLE_ES, "entreeSalarie"),
    ].filter(({ chemin, texte }) => !PERMIS.test(chemin) && !PERMIS.test(texte) && !CODES.test(texte));
    const restes = tous.filter(({ texte }) => FRANCAIS_ES.test(texte)).map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 60)}`);
    expect(restes).toEqual([]);
  });

  it("le portrait et la piste creusée passent les contrôles en espagnol", () => {
    const p = qualitePortrait(copie(PORTRAIT_EXEMPLE_ES), "", "es");
    expect(p.portrait.prenom).toBe("Claire");
    const c = qualiteCible(copie(CIBLE_PISTE_EXEMPLE_ES), ctx());
    expect(c.erreurs).toEqual([]);
  });

  it("pas de tiret long dans les exemples", () => {
    const tous = [RESULTAT_EXEMPLE_ES, ENTREE_EXEMPLE_ES, PORTRAIT_EXEMPLE_ES, PISTES_EXEMPLE_ES, CIBLE_PISTE_EXEMPLE_ES, RESULTAT_SALARIE_EXEMPLE_ES].flatMap((x) => textes(x));
    expect(tous.filter(({ texte }) => /[–—]/.test(texte))).toEqual([]);
  });
});

describe("contrôles qualité en espagnol", () => {
  it("remplace une question hypothétique par une question de secours espagnole", () => {
    const r = copie(RESULTAT_EXEMPLE_ES) as Resultat;
    r.cibles[0].testTerrain.questions[0] = "Si pudiera cambiar una cosa, ¿qué cambiaría?";
    r.cibles[0].testTerrain.questions[1] = "¿Comprarías un programa como este?";
    const q = appliquerQualite(r, ctx());
    const questions = q.resultat.cibles[0].testTerrain.questions;
    expect(questions[0]).toBe(TEXTES_QUALITE.es.questions.vous[0]);
    expect(questions[1]).toBe(TEXTES_QUALITE.es.questions.vous[1]);
    expect(estQuestionMom("¿Qué opina de este programa?")).toBe(true);
    expect(estQuestionMom("¿Cuál fue la última vez que lo probó?")).toBe(false);
  });

  it("répare une signature française ou anglaise dans un email espagnol", () => {
    const corps = "Hola, [Nombre]:\n\nUn mensaje breve.\n\nBien à vous,\n\n{{prenom}}";
    expect(alignerSignature(corps, "vous", 1100, "es")).toBe("Hola, [Nombre]:\n\nUn mensaje breve.\n\nAtentamente,\n\n{{prenom}}");
    expect(alignerSignature("Hola, [Nombre]:\n\nBreve.\n\nKind regards,\n\n{{prenom}}", "tu", 1100, "es")).toBe("Hola, [Nombre]:\n\nBreve.\n\nUn abrazo,\n\n{{prenom}}");
  });

  it("ne cherche pas de tutoiement ou de vouvoiement mal formé en espagnol", () => {
    expect(mauvaisRegistre("¿Tendría 15 minutos?", "tu", "es")).toBe(false);
  });

  it("des mots courants espagnols ne créent pas de faux recoupement", () => {
    expect(recoupe("cuando siempre donde también además", "siempre cuando donde también además mientras")).toBe(false);
    expect(recoupe("organizaciones jerárquicas validarse", "organizaciones jerárquicas muy grandes")).toBe(true);
  });

  it("plafonne le plaisir avec une raison espagnole", () => {
    const r = copie(RESULTAT_EXEMPLE_ES) as Resultat;
    const q = appliquerQualite(r, ctx({ antiContexte: "equipos de producción de plantas alimentarias en tensión" }));
    const plafonnees = q.resultat.cibles.filter((c) => c.scores.plaisir.raison === TEXTES_QUALITE.es.plaisirPlafonne);
    expect(plafonnees.length).toBeGreaterThan(0);
    expect(FRANCAIS_ES.test(TEXTES_QUALITE.es.plaisirPlafonne)).toBe(false);
  });

  it("écrit les phrases de départage dans la langue du résultat", () => {
    const cibles = RESULTAT_EXEMPLE_ES.cibles.map((c) => ({ id: c.id, nom: c.nom }));
    const egal = RESULTAT_EXEMPLE_ES.cibles.map((c) => ({ ...c, scores: RESULTAT_EXEMPLE_ES.cibles[2].scores }));
    const lignes = classerCibles(egal);
    const es = phrasesDepartage(cibles, lignes, "es");
    const fr = phrasesDepartage(cibles, lignes, "fr");
    expect(es.length).toBe(fr.length);
    for (const phrase of es) expect(FRANCAIS_ES.test(phrase)).toBe(false);
  });

  it("la phrase de sortie salarié est ajoutée en espagnol avant la signature espagnole", () => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE_ES), true);
    if (!v.ok) throw new Error(v.erreurs.join("\n"));
    const r = v.valeur as ResultatSalarie;
    r.patrons[0].pitchs.emailCorps = "Hola, [Nombre]:\n\nSu segunda sede duplicará los pedidos 🚀, y lo he hecho dos veces sin una entrega fallida.\n\n¿Tendría 15 minutos para hablar de ello?\n\nAtentamente,\n\n{{prenom}}";
    const q = qualiteSalarie(r, { adresse: "vous", aEviter: "", langue: "es" });
    const corps = q.resultat.patrons[0].pitchs.emailCorps;
    expect(corps).not.toMatch(/🚀/);
    expect(corps.endsWith(`${TEXTES_QUALITE.es.salarie.phraseSortie.vous}\n\nAtentamente,\n\n{{prenom}}`)).toBe(true);
  });

  it("les questions de secours espagnoles sont en espagnol", () => {
    expect(TEXTES_QUALITE.es.questions.vous.length).toBe(TEXTES_QUALITE.es.questions.tu.length);
    for (const q of [...TEXTES_QUALITE.es.questions.tu, ...TEXTES_QUALITE.es.questions.vous]) expect(FRANCAIS_ES.test(q)).toBe(false);
  });
});
