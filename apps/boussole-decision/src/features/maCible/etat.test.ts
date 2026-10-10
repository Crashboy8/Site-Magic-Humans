import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { classerCibles } from "@/domain/maCible/scores";
import type { Cadrage, Corrections } from "@/domain/maCible/types";
import { CIBLE_PISTE_EXEMPLE, PORTRAIT_EXEMPLE } from "@/domain/maCible/exempleApprofondir";
import { basculerFait, planDepuisResultat } from "@/domain/maCible/planEdite";
import { accesEtape, ajouterReponses, etatInitial, prochainIdPiste, langueEntree, peutNouvelleEsquisse, questionsSautees, reducteur, travailExiste, type Etat } from "./etat";

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
  it("envoie à l'IA la langue de l'interface : français, anglais ou espagnol", () => {
    expect(langueEntree("fr")).toBe("fr");
    expect(langueEntree("en")).toBe("en");
    expect(langueEntree("es")).toBe("es");
  });
});

describe("portraits et pistes creusées (§6.2)", () => {
  const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
  const avecResultat = () => reducteur(etatInitial(), { type: "resultat", resultat, maintenant: "2026-10-10T10:00:00Z" });
  const ligne = (id: "c4" | "c5" | "c6") => ({ id, score: 8.4, alertePlaisir: false });
  const piste = (e: Etat, pisteId: "p1" | "p2" | "p3" | "p4", id: "c4" | "c5" | "c6") =>
    reducteur(e, { type: "piste", pisteId, cible: { ...CIBLE_PISTE_EXEMPLE, id }, ligne: ligne(id), portrait: PORTRAIT_EXEMPLE });

  it("portrait : rangé dans extras.portraits", () => {
    const e = reducteur(avecResultat(), { type: "portrait", id: "c2", portrait: PORTRAIT_EXEMPLE });
    expect(e.extras.portraits.c2?.prenom).toBe("Claire");
  });

  it("prochainIdPiste donne c4, c5, c6 puis null", () => {
    let e = avecResultat();
    expect(prochainIdPiste(e.extras)).toBe("c4");
    e = piste(e, "p1", "c4");
    expect(prochainIdPiste(e.extras)).toBe("c5");
    e = piste(e, "p2", "c5");
    e = piste(e, "p3", "c6");
    expect(prochainIdPiste(e.extras)).toBeNull();
  });

  it("piste : refusée à la 4e et si la piste est déjà creusée", () => {
    let e = piste(avecResultat(), "p1", "c4");
    expect(e.extras.portraits.c4).toBeDefined();
    expect(piste(e, "p1", "c5")).toBe(e);
    e = piste(piste(e, "p2", "c5"), "p3", "c6");
    expect(Object.keys(e.extras.pistes)).toHaveLength(3);
    expect(piste(e, "p4", "c6")).toBe(e);
  });

  it("un nouveau résultat remet extras à vide ; reprendre restaure extras", () => {
    const e = piste(avecResultat(), "p1", "c4");
    const extras = e.extras;
    const nouveau = reducteur(e, { type: "resultat", resultat, maintenant: "2026-10-11T10:00:00Z" });
    expect(nouveau.extras).toEqual({ portraits: {}, pistes: {} });
    const repris = reducteur(nouveau, { type: "reprendre", entree: nouveau.entree, resultat, faitLe: "2026-10-10T10:00:00Z", coches: nouveau.coches, extras });
    expect(repris.extras).toEqual(extras);
    const sansExtras = reducteur(nouveau, { type: "reprendre", entree: nouveau.entree, resultat, faitLe: "2026-10-10T10:00:00Z", coches: nouveau.coches });
    expect(sansExtras.extras).toEqual({ portraits: {}, pistes: {} });
  });
});

describe("plan modifié", () => {
  const avecResultat = () => reducteur(etatInitial(), { type: "resultat", resultat: { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) }, maintenant: "2026-10-10T10:00:00Z" });
  const plan = (resultatLe = "2026-10-10T10:00:00Z") => planDepuisResultat(RESULTAT_EXEMPLE, [], { titreSemaine: (n, t) => `Semaine ${n} : ${t}` }, resultatLe, new Date("2026-10-10T11:00:00Z"));

  it("enregistre un plan seulement quand il y a un résultat", () => {
    expect(reducteur(etatInitial(), { type: "plan", plan: plan() }).plan).toBeNull();
    expect(reducteur(avecResultat(), { type: "plan", plan: plan() }).plan).not.toBeNull();
  });
  it("revient à la proposition de l'IA en gardant les actions d'origine cochées", () => {
    let e = reducteur(avecResultat(), { type: "plan", plan: basculerFait(plan(), "a2", new Date()) });
    e = reducteur(e, { type: "planOrigine" });
    expect(e.plan).toBeNull();
    expect(e.coches[2]).toBe(true);
    expect(e.coches.filter(Boolean)).toHaveLength(1);
  });
  it("un nouveau résultat repart du plan de l'IA", () => {
    const e = reducteur(avecResultat(), { type: "plan", plan: plan() });
    const suivant = reducteur(e, { type: "resultat", resultat: { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) }, maintenant: "2026-10-11T10:00:00Z" });
    expect(suivant.plan).toBeNull();
  });
  it("reprendre un résultat de l'historique ramène son plan", () => {
    const resultat = { ...RESULTAT_EXEMPLE, classement: classerCibles(RESULTAT_EXEMPLE.cibles) };
    const e = reducteur(etatInitial(), { type: "reprendre", entree: etatInitial().entree, resultat, faitLe: "2026-10-09T08:00:00Z", coches: Array(12).fill(false), plan: plan("2026-10-09T08:00:00Z") });
    expect(e.plan?.blocs).toHaveLength(16);
  });
});
