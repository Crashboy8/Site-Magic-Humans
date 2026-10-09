import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { classerCibles } from "@/domain/maCible/scores";
import type { Cadrage, Corrections } from "@/domain/maCible/types";
import { accesEtape, ajouterReponses, etatInitial, langueEntree, peutNouvelleEsquisse, questionsSautees, reducteur, travailExiste, type Etat } from "./etat";

const esquisse: Cadrage = {
  statut: "esquisse",
  message: "",
  questions: [],
  esquisse: {
    offre: "Je remets les équipes autour de la table.",
    cibles: [
      { id: "c1", nom: "Directeurs de site", marche: "b2b", enUneLigne: "Directeurs d'usine en Bretagne après une réorganisation.", pourquoi: "Ton réseau et ton Contexte Déclencheur.", depuisIdees: [] },
      { id: "c2", nom: "Dirigeants de PME", marche: "b2b", enUneLigne: "Fondateurs dont le comité de direction ne décide plus.", pourquoi: "Tu poses les questions que personne n'ose poser.", depuisIdees: [] },
      { id: "c3", nom: "Managers promus", marche: "b2c", enUneLigne: "Managers promus depuis moins d'un an avec une équipe divisée.", pourquoi: "Tu les aides à préparer les conversations difficiles.", depuisIdees: [] },
    ],
    antiCible: "Les grands groupes qui achètent un atelier par appel d'offres.",
    hypotheses: [],
    autresPistes: [],
  },
};
const questions: Cadrage = {
  statut: "questions",
  message: "",
  questions: [{ id: "q1", question: "Tu interviens où exactement ?", pourquoi: "Pour choisir les cibles proches.", type: "texte", options: [], exemple: "À Rennes" }],
  esquisse: { offre: "", cibles: [], antiCible: "", hypotheses: [], autresPistes: [] },
};
const avecEsquisse = (): Etat => reducteur(reducteur(etatInitial(), { type: "cadrage", tour: 1, cadrage: esquisse }), { type: "aller", etape: "esquisse" });

describe("réducteur du Cibleur", () => {
  it("modifier le terrain après l'esquisse remet le cadrage à null et le tour à 1", () => {
    let e = reducteur(etatInitial(), { type: "cadrage", tour: 2, cadrage: esquisse });
    expect(e.cadrage).not.toBeNull();
    expect(e.tour).toBe(2);
    e = reducteur(e, { type: "terrain", patch: { zone: "Rennes" } });
    expect(e.cadrage).toBeNull();
    expect(e.tour).toBe(1);
    expect(e.corrections).toBeNull();
  });
  it("modifier le talent invalide aussi l'esquisse, mais garde les réponses aux questions", () => {
    let e = reducteur(etatInitial(), { type: "reponses", tour: 1, reponses: [{ id: "q1", question: "Où ?", reponse: "Rennes" }] });
    e = reducteur(e, { type: "cadrage", tour: 2, cadrage: esquisse });
    e = reducteur(e, { type: "talent", patch: { mecanisme: "je démêle les situations bloquées" } });
    expect(e.cadrage).toBeNull();
    expect(e.entree.reponses).toHaveLength(1);
  });
  it("une valeur inchangée ne touche à rien, le prénom non plus", () => {
    const e = avecEsquisse();
    expect(reducteur(e, { type: "terrain", patch: { zone: "" } })).toBe(e);
    expect(reducteur(e, { type: "prenom", prenom: "Léa" }).cadrage).not.toBeNull();
  });
  it("n'invalide pas avant qu'il y ait un cadrage", () => {
    const e = reducteur(etatInitial(), { type: "terrain", patch: { zone: "Rennes" } });
    expect(e.entree.terrain.zone).toBe("Rennes");
  });
  it("ajoute les réponses avec l'identifiant t{tour}-{id} et remplace une réponse identique", () => {
    let e = reducteur(etatInitial(), { type: "reponses", tour: 1, reponses: [{ id: "q1", question: "A ?", reponse: "oui" }, { id: "q2", question: "B ?", reponse: "non" }] });
    expect(e.entree.reponses.map((r) => r.id)).toEqual(["t1-q1", "t1-q2"]);
    e = reducteur(e, { type: "reponses", tour: 1, reponses: [{ id: "q1", question: "A ?", reponse: "peut-être" }] });
    expect(e.entree.reponses.map((r) => `${r.id}:${r.reponse}`)).toEqual(["t1-q2:non", "t1-q1:peut-être"]);
    expect(ajouterReponses([], 2, [{ id: "q3", question: "C ?", reponse: "x" }])[0].id).toBe("t2-q3");
  });
  it("« nouvelle esquisse » n'est proposée qu'avec deux « non », et une seule fois", () => {
    const corr = (...v: ("oui" | "non" | "en_partie")[]): Corrections => ({
      offre: "Une offre assez longue",
      cibles: v.map((verdict, i) => ({ id: (["c1", "c2", "c3"] as const)[i], verdict, commentaire: "" })),
      antiCible: { verdict: "oui", commentaire: "" },
      idee: "",
    });
    let e = avecEsquisse();
    expect(peutNouvelleEsquisse(e, corr("non", "oui", "oui"))).toBe(false);
    expect(peutNouvelleEsquisse(e, corr("non", "non", "oui"))).toBe(true);
    expect(peutNouvelleEsquisse(e, null)).toBe(false);
    e = reducteur(e, { type: "cadrage", tour: 3, cadrage: esquisse });
    expect(e.nouvelleEsquisseFaite).toBe(true);
    expect(peutNouvelleEsquisse(e, corr("non", "non", "non"))).toBe(false);
  });
  it("les questions mènent à l'étape 3, l'esquisse à l'étape 4, hors sujet revient au terrain", () => {
    expect(reducteur(etatInitial(), { type: "cadrage", tour: 1, cadrage: questions }).etape).toBe("questions");
    expect(reducteur(etatInitial(), { type: "cadrage", tour: 1, cadrage: esquisse }).etape).toBe("esquisse");
    const hs = reducteur(avecEsquisse(), { type: "cadrage", tour: 1, cadrage: { ...questions, statut: "hors_sujet", message: "Hors sujet" } });
    expect(hs.etape).toBe("terrain");
    expect(hs.cadrage).toBeNull();
  });
  it("un résultat remet les coches à zéro, et chaque case se coche et se décoche", () => {
    const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
    let e = reducteur(etatInitial(), { type: "resultat", resultat, maintenant: "2026-10-07T10:00:00.000Z" });
    expect(e.etape).toBe("resultat");
    expect(e.coches.every((c) => !c)).toBe(true);
    e = reducteur(e, { type: "coche", index: 4 });
    expect(e.coches[4]).toBe(true);
    e = reducteur(e, { type: "coche", index: 4 });
    expect(e.coches[4]).toBe(false);
    expect(reducteur(e, { type: "coche", index: 12 })).toBe(e);
  });
  it("un talent venu d'une ancre ne compte pas comme du travail", () => {
    const e = reducteur(etatInitial(), { type: "ancre", ancre: { source: "quiz", talent: { mecanisme: "je démêle les situations bloquées" } } });
    expect(e.entree.source).toBe("quiz");
    expect(travailExiste(e)).toBe(false);
    expect(travailExiste(reducteur(e, { type: "terrain", patch: { zone: "Rennes" } }))).toBe(true);
  });
  it("revenir au terrain garde le résultat, et le modifier le marque périmé sans l'effacer", () => {
    const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
    let e = reducteur(etatInitial(), { type: "resultat", resultat, maintenant: "2026-10-07T10:00:00.000Z" });
    e = reducteur(e, { type: "aller", etape: "terrain" });
    expect(e.etape).toBe("terrain");
    expect(e.resultat).toBe(resultat);
    expect(e.resultatPerime).toBe(false);
    expect(e.plusLoin).toBe("resultat");
    const avant = e.entree;
    e = reducteur(e, { type: "terrain", patch: { zone: "Rennes" } });
    expect(e.resultat).toBe(resultat);
    expect(e.resultatPerime).toBe(true);
    expect(e.entreeDuResultat).toBe(avant);
    expect(e.entree.terrain.zone).toBe("Rennes");
    e = reducteur(e, { type: "aller", etape: "resultat" });
    expect(e.etape).toBe("resultat");
    expect(e.resultat).toBe(resultat);
  });
  it("marque Précisions sautée quand l'esquisse arrive sans question", () => {
    const e = reducteur(etatInitial(), { type: "cadrage", tour: 1, cadrage: esquisse });
    expect(questionsSautees(e)).toBe(true);
    expect(accesEtape(e, "questions")).toBe("sautee");
    expect(accesEtape(e, "talent")).toBe("atteinte");
    expect(accesEtape(e, "esquisse")).toBe("courante");
    expect(accesEtape(e, "resultat")).toBe("future");
  });
  it("une synthèse invalide le cadrage et marque le résultat périmé", () => {
    const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
    const synthese = {
      resume: "Les clients parlent de réunions qui n'aboutissent pas.",
      profils: [] as string[],
      douleurs: [],
      verbatims: [{ id: "v1", note: "n1" as const, citation: "Je n'en peux plus de ces réunions.", theme: "douleur" as const }],
      declencheurs: [],
      objections: [],
      motsCles: [],
      nbNotes: 1,
      faitLe: "2026-10-09T08:00:00.000Z",
    };
    let e = reducteur(etatInitial(), { type: "cadrage", tour: 1, cadrage: esquisse });
    e = reducteur(e, { type: "resultat", resultat, maintenant: "2026-10-09T08:00:00.000Z" });
    e = reducteur(e, { type: "synthese", synthese });
    expect(e.cadrage).toBeNull();
    expect(e.resultatPerime).toBe(true);
    expect(e.entree.synthese?.resume).toBe(synthese.resume);
    expect(e.resultat).toBe(resultat);
  });
  it("retirer une phrase invalide le cadrage et marque le résultat périmé", () => {
    const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
    const synthese = {
      resume: "Les clients parlent de réunions qui n'aboutissent pas.",
      profils: [] as string[],
      douleurs: [],
      verbatims: [{ id: "v1", note: "n1" as const, citation: "Je n'en peux plus de ces réunions.", theme: "douleur" as const }],
      declencheurs: [],
      objections: [],
      motsCles: [],
      nbNotes: 1,
      faitLe: "2026-10-09T08:00:00.000Z",
    };
    let e = reducteur(etatInitial(), { type: "synthese", synthese });
    e = reducteur(e, { type: "cadrage", tour: 1, cadrage: esquisse });
    e = reducteur(e, { type: "resultat", resultat, maintenant: "2026-10-09T08:00:00.000Z" });
    expect(e.resultatPerime).toBe(false);
    expect(e.cadrage).not.toBeNull();
    const retire = reducteur(e, { type: "retirerVerbatim", id: "v1" });
    expect(retire.cadrage).toBeNull();
    expect(retire.resultatPerime).toBe(true);
    expect(retire.entree.synthese?.verbatims).toEqual([]);
    expect(reducteur(retire, { type: "retirerVerbatim", id: "v1" })).toBe(retire);
  });
  it("envoie à l'IA la langue de l'interface, le français tant que le reste n'est pas traduit", () => {
    expect(langueEntree("fr")).toBe("fr");
    expect(langueEntree("en")).toBe("fr");
  });
});
