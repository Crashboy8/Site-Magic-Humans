/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE } from "./exemple";
import { validerCadrage, validerResultat } from "./validation";

const copie = () => structuredClone(RESULTAT_EXEMPLE) as any;
const erreurs = (v: unknown) => {
  const r = validerResultat(v);
  return r.ok ? [] : r.erreurs;
};
const contient = (liste: string[], fragment: string) => expect(liste.some((e) => e.includes(fragment)), `${fragment} dans ${JSON.stringify(liste)}`).toBe(true);

const esquisse = () => ({
  offre: "Je remets les équipes qui ne se parlent plus autour de la table.",
  cibles: [
    { id: "c1", nom: "Directeurs de sites", marche: "b2b", enUneLigne: "Directeurs de site après une réorganisation tendue", pourquoi: "Ton Contexte Déclencheur est leur situation." },
    { id: "c2", nom: "Dirigeants de PME", marche: "b2b", enUneLigne: "Fondateurs dont le comité de direction ne décide plus", pourquoi: "Tu poses les questions que personne n'ose poser." },
    { id: "c3", nom: "Managers promus", marche: "b2c", enUneLigne: "Managers promus qui héritent d'une équipe divisée", pourquoi: "Tu aides à préparer les conversations difficiles." },
  ],
  antiCible: "Les grands groupes qui achètent un atelier comme une case à cocher.",
  hypotheses: ["J'ai supposé que tu peux te déplacer."],
});
const cadrage = (statut: string, extra: object = {}) => ({ statut, message: "", questions: [], esquisse: { offre: "", cibles: [], antiCible: "", hypotheses: [] }, ...extra });
const questions = () => [
  { id: "q1", question: "Interviens-tu surtout en groupe ?", pourquoi: "Cela change les cibles proposées.", type: "choix", options: ["En groupe", "En individuel"], exemple: "" },
  { id: "q2", question: "Dans quelle zone peux-tu te déplacer ?", pourquoi: "Pour proposer des lieux réalistes.", type: "texte", options: [], exemple: "Rennes et la Bretagne" },
];

describe("validerResultat", () => {
  it("accepte RESULTAT_EXEMPLE", () => expect(validerResultat(RESULTAT_EXEMPLE).ok).toBe(true));

  it("renvoie le chemin des erreurs", () => {
    const r = copie();
    r.cibles[0].messages.linkedin = "Bonjour [Prénom], regardez https://exemple.fr/mon-offre pour en savoir plus sur ce que je propose.";
    r.cibles[1].prix.base = "TTC";
    r.cibles[2].prix.base = "HT";
    r.plan30[2].actions.pop();
    r.cibles[0].pitch = "trop court";
    const e = erreurs(r);
    contient(e, "cibles[0].messages.linkedin : aucun lien");
    contient(e, "cibles[1].prix.base : HT attendu");
    contient(e, "cibles[2].prix.base : TTC attendu");
    contient(e, "plan30[2].actions : exactement 3");
    contient(e, "cibles[0].pitch : trop court (120 au moins)");
  });

  it("renvoie toutes les erreurs d'un coup, dans l'ordre du document", () => {
    const r = copie();
    r.offre.phrase = "court";
    r.cibles[0].nom = "x";
    r.motPourToi = "x";
    const e = erreurs(r);
    expect(e).toHaveLength(3);
    expect(e[0]).toContain("offre.phrase");
    expect(e[1]).toContain("cibles[0].nom");
    expect(e[2]).toContain("motPourToi");
  });

  it("exige c1, c2 et c3 chacun une fois", () => {
    const r = copie();
    r.cibles[1].id = "c1";
    contient(erreurs(r), "cibles : les identifiants");
    const peu = copie();
    peu.cibles.pop();
    contient(erreurs(peu), "cibles : exactement 3");
  });

  it("contrôle les prix", () => {
    const r = copie();
    r.cibles[0].prix = { ...r.cibles[0].prix, min: 0, max: 200000 };
    contient(erreurs(r), "cibles[0].prix.min");
    contient(erreurs(r), "cibles[0].prix.max");
    const r2 = copie();
    r2.cibles[0].prix.min = 7000;
    contient(erreurs(r2), "cibles[0].prix.max : doit être supérieur ou égal");
    const r3 = copie();
    r3.cibles[0].prix.min = 10.5;
    contient(erreurs(r3), "cibles[0].prix.min : entier attendu");
  });

  it("exige un canal de priorité 1", () => {
    const r = copie();
    r.cibles[0].canaux.forEach((c: any) => (c.priorite = 2));
    contient(erreurs(r), "cibles[0].canaux : au moins un canal de priorité 1");
  });

  it("exige {{prenom}} dans l'email et un point d'interrogation à chaque question", () => {
    const r = copie();
    r.cibles[0].messages.emailCorps = r.cibles[0].messages.emailCorps.replace("{{prenom}}", "Pierre");
    r.cibles[1].testTerrain.questions[2] = "Dites-moi comment vous faites";
    r.cibles[2].testTerrain.questions.pop();
    const e = erreurs(r);
    contient(e, "cibles[0].messages.emailCorps : doit contenir {{prenom}}");
    contient(e, "cibles[1].testTerrain.questions[2] : doit se terminer par ?");
    contient(e, "cibles[2].testTerrain.questions : exactement 5");
  });

  it("contrôle le plan : semaines dans l'ordre, minutes, notes", () => {
    const r = copie();
    r.plan30[0].semaine = 2;
    r.plan30[1].actions[0].minutes = 5;
    r.cibles[0].scores.urgence.note = 6;
    r.cibles[0].scores.plaisir.note = 3.5;
    const e = erreurs(r);
    contient(e, "plan30[0].semaine");
    contient(e, "plan30[1].actions[0].minutes");
    contient(e, "cibles[0].scores.urgence.note");
    contient(e, "cibles[0].scores.plaisir.note : entier attendu");
  });

  it("refuse un type inattendu", () => {
    expect(validerResultat(null).ok).toBe(false);
    expect(validerResultat({}).ok).toBe(false);
  });
});

describe("validerCadrage", () => {
  it("accepte une esquisse", () => expect(validerCadrage(cadrage("esquisse", { esquisse: esquisse() }), 1).ok).toBe(true));
  it("accepte des questions au tour 1", () => expect(validerCadrage(cadrage("questions", { questions: questions() }), 1).ok).toBe(true));

  it("refuse des questions aux tours 2 et 3", () => {
    for (const tour of [2, 3] as const) {
      const r = validerCadrage(cadrage("questions", { questions: questions() }), tour);
      expect(!r.ok && r.erreurs.join()).toContain(`questions interdites au tour ${tour}`);
    }
  });

  it("contrôle les questions", () => {
    const qs = questions();
    qs[1].id = "q1";
    qs[0].options = ["seule"];
    (qs[1] as any).options = ["ne devrait pas"];
    const r = validerCadrage(cadrage("questions", { questions: qs }), 1);
    const e = !r.ok ? r.erreurs : [];
    contient(e, "questions[1].id : identifiant en double");
    contient(e, "questions[0].options : 2 à 5");
    contient(e, "questions[1].options : exactement 0");
    const quatre = Array.from({ length: 4 }, (_, i) => ({ ...questions()[0], id: `q${(i % 3) + 1}` }));
    contient(!validerCadrage(cadrage("questions", { questions: quatre }), 1).ok ? (validerCadrage(cadrage("questions", { questions: quatre }), 1) as any).erreurs : [], "questions : 1 à 3");
  });

  it("contrôle l'esquisse", () => {
    const e = esquisse();
    e.cibles[1].id = "c1";
    e.cibles[0].nom = "x";
    e.hypotheses = ["a", "b", "c", "d", "e"];
    const r = validerCadrage(cadrage("esquisse", { esquisse: e }), 1);
    const erreursEsquisse = !r.ok ? r.erreurs : [];
    contient(erreursEsquisse, "esquisse.cibles : les identifiants");
    contient(erreursEsquisse, "esquisse.cibles[0].nom : trop court (5 au moins)");
    contient(erreursEsquisse, "esquisse.hypotheses : 0 à 4");
  });

  it("hors_sujet exige un message de 10 à 300 caractères", () => {
    expect(validerCadrage(cadrage("hors_sujet", { message: "Cette demande ne relève pas d'une activité professionnelle." }), 1).ok).toBe(true);
    expect(validerCadrage(cadrage("hors_sujet", { message: "non" }), 1).ok).toBe(false);
  });

  it("refuse un statut inconnu", () => expect(validerCadrage(cadrage("peut-etre"), 1).ok).toBe(false));
});
