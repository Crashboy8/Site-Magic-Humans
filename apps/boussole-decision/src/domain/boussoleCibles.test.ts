import { describe, expect, it } from "vitest";
import {
  CRITERES_CIBLES,
  TAILLE_MAX_LIEN,
  chargeCibles,
  chargeReduite,
  decoderLienCibles,
  encoderLienCibles,
  evaluationPour,
  lienBoussoleCibles,
  noteScoreCibleur,
  type LienCibles,
} from "./boussoleCibles";
import { ENTREE_EXEMPLE, RESULTAT_EXEMPLE } from "./maCible/exemple";
import { CIBLE_PISTE_EXEMPLE } from "./maCible/exempleApprofondir";
import { classerCibles, scoreSur10 } from "./maCible/scores";

const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
const notes = { urgence: 4, paiement: 3, acces: 5, plaisir: 1 };
const charge: LienCibles = {
  v: 1,
  talent: { mecanisme: "démêle les situations", contexte: "équipe sous tension", benefice: "élan retrouvé", antiContexte: "hiérarchie lourde", reussite: "réconciliation" },
  offre: "Je remets les équipes autour de la table.",
  cibles: [
    { nom: "Directrices d'école à Besançon", resume: "Une équipe pédagogique qui se reparle", score: 7.4, notes },
    { nom: "Élus de petites communes", resume: "Un conseil municipal qui décide à nouveau", score: 6.1, notes },
  ],
};

describe("lien Cibleur vers Boussole (§13)", () => {
  it("aller-retour d'encodage avec accents, avec ou sans « #cibles= »", () => {
    const code = encoderLienCibles(charge);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decoderLienCibles(`#cibles=${code}`)).toEqual(charge);
    expect(decoderLienCibles(code)).toEqual(charge);
  });

  it("charge illisible, invalide ou de plus de 8 000 caractères : null", () => {
    expect(decoderLienCibles("")).toBeNull();
    expect(decoderLienCibles("#cibles=@@@")).toBeNull();
    expect(decoderLienCibles(encoderLienCibles({ ...charge, cibles: [charge.cibles[0]] }))).toBeNull();
    expect(decoderLienCibles(encoderLienCibles({ ...charge, cibles: [{ ...charge.cibles[0], notes: { ...notes, urgence: 6 } }, charge.cibles[1]] }))).toBeNull();
    expect(decoderLienCibles("A".repeat(TAILLE_MAX_LIEN + 1))).toBeNull();
  });

  it("réduit la charge sous 8 000 caractères à l'encodage", () => {
    const long = "é".repeat(600);
    const lourde: LienCibles = {
      ...charge,
      talent: { mecanisme: long, contexte: long, benefice: long, antiContexte: long, reussite: long },
      cibles: Array.from({ length: 6 }, (_, i) => ({ nom: `Cible ${i + 1} ${"x".repeat(70)}`, resume: "à".repeat(180), score: 7, notes })),
    };
    expect(encoderLienCibles(lourde).length).toBeGreaterThan(TAILLE_MAX_LIEN);
    const reduite = chargeReduite(lourde);
    expect(reduite.length).toBeLessThanOrEqual(TAILLE_MAX_LIEN);
    const relue = decoderLienCibles(reduite);
    expect(relue?.cibles).toHaveLength(6);
    expect(relue?.cibles[5].resume).toBe("");
  });

  it("transmet les 3 cibles classées puis les pistes creusées, sans prénom", () => {
    const extras = { portraits: {}, pistes: { p2: { cible: CIBLE_PISTE_EXEMPLE, ligne: { id: "c4" as const, score: 1, alertePlaisir: false } } } };
    const d = chargeCibles(resultat, extras, ENTREE_EXEMPLE);
    expect(d.cibles.map((c) => c.nom)).toEqual([...resultat.classement.map((l) => resultat.cibles.find((c) => c.id === l.id)!.nom), CIBLE_PISTE_EXEMPLE.nom]);
    expect(d.cibles[3].score).toBe(scoreSur10(CIBLE_PISTE_EXEMPLE.scores));
    expect(d.talent.mecanisme).toBe(ENTREE_EXEMPLE.talent.mecanisme);
    const lien = lienBoussoleCibles(resultat, extras, ENTREE_EXEMPLE);
    expect(lien.startsWith("/boussole-decision/depuis-cibleur/#cibles=")).toBe(true);
    expect(JSON.stringify(decoderLienCibles(lien.split("#")[1]))).not.toContain("prenom");
  });

  it("correspondance des notes : 5 → oui, plaisir 1 → Anti-Contexte oui", () => {
    expect(evaluationPour("urgence", { ...notes, urgence: 5 })).toBe("oui");
    expect(evaluationPour("paiement", notes)).toBe("p50");
    expect(evaluationPour("acces", { ...notes, acces: 2 })).toBe("p25");
    expect(evaluationPour("plaisir", notes)).toBe("non");
    expect(evaluationPour("plaisirInverse", notes)).toBe("oui");
    expect(evaluationPour("plaisirInverse", { ...notes, plaisir: 4 })).toBe("p25");
    expect(evaluationPour(null, notes)).toBeNull();
  });

  it("critères et importances exacts du §13.2", () => {
    expect(CRITERES_CIBLES.map((c) => [c.categorie, c.libelle, c.importance, c.direction, c.source])).toEqual([
      ["contexte_declencheur", "Cette cible allume mon talent", "critique", "TOWARDS", "plaisir"],
      ["anti_contexte", "Cette cible me plonge dans mon Anti-Contexte", "tres_important", "AWAY_FROM", "plaisirInverse"],
      ["valeurs_culture", "J'aime ce milieu et ses valeurs", "important", "TOWARDS", null],
      ["conditions_vie", "Je peux la joindre facilement", "important", "TOWARDS", "acces"],
      ["conditions_vie", "Le rythme et les déplacements me conviennent", "moyen", "TOWARDS", null],
      ["remuneration", "Son problème est urgent pour elle", "tres_important", "TOWARDS", "urgence"],
      ["remuneration", "Elle peut payer mon prix", "tres_important", "TOWARDS", "paiement"],
    ]);
    expect(CRITERES_CIBLES.every((c) => c.nonNegociable === false)).toBe(true);
    expect(CRITERES_CIBLES[0].description(charge.talent)).toBe("Mon Contexte Déclencheur : équipe sous tension");
    expect(CRITERES_CIBLES[1].description({ ...charge.talent, antiContexte: "x".repeat(400) }).length).toBe(280);
    expect(noteScoreCibleur(7.4)).toBe("Score du Cibleur : 7,4/10");
  });
});
