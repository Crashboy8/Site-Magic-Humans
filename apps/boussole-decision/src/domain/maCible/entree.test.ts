/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { detecterFlou, validerCorrections, validerEntree } from "./entree";
import { ENTREE_EXEMPLE } from "./exemple";

const clone = () => structuredClone(ENTREE_EXEMPLE) as unknown as Record<string, any>;
const erreursDe = (brut: unknown) => {
  const r = validerEntree(brut);
  return r.ok ? [] : r.erreurs;
};

describe("validerEntree", () => {
  it("accepte ENTREE_EXEMPLE", () => {
    const r = validerEntree(ENTREE_EXEMPLE);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.entree.terrain.zone).toBe(ENTREE_EXEMPLE.terrain.zone);
  });

  it.each(["talent.mecanisme", "talent.contexte", "talent.benefice", "talent.antiContexte", "terrain.experience", "terrain.zone"])("%s vide : requis", (champ) => {
    const e = clone();
    const [a, b] = champ.split(".");
    e[a][b] = "";
    expect(erreursDe(e)).toContainEqual({ champ, code: "requis" });
  });

  it("marche vide : requis", () => {
    const e = clone();
    e.terrain.marche = "";
    expect(erreursDe(e)).toContainEqual({ champ: "terrain.marche", code: "requis" });
  });

  it("trop court et trop long avec min et max", () => {
    const e = clone();
    e.talent.mecanisme = "court";
    e.talent.contexte = "x".repeat(601);
    e.talent.antiContexte = "bref";
    const erreurs = erreursDe(e);
    expect(erreurs).toContainEqual({ champ: "talent.mecanisme", code: "trop_court", min: 12 });
    expect(erreurs).toContainEqual({ champ: "talent.contexte", code: "trop_long", max: 600 });
    expect(erreurs).toContainEqual({ champ: "talent.antiContexte", code: "trop_court", min: 8 });
  });

  it("offre et clientsPasses vides : requis sur offre", () => {
    const e = clone();
    e.terrain.offre = "";
    e.terrain.clientsPasses = "";
    expect(erreursDe(e)).toContainEqual({ champ: "terrain.offre", code: "requis" });
  });

  it("l'un des deux suffit", () => {
    const a = clone();
    a.terrain.offre = "";
    expect(validerEntree(a).ok).toBe(true);
    const b = clone();
    b.terrain.clientsPasses = "";
    expect(validerEntree(b).ok).toBe(true);
  });

  it("enums invalides", () => {
    const e = clone();
    e.terrain.marche = "partout";
    e.terrain.adresse = "toi";
    e.terrain.style = "rigolo";
    e.terrain.formats = ["groupe", "magie"];
    e.langue = "de";
    const erreurs = erreursDe(e);
    for (const champ of ["terrain.marche", "terrain.adresse", "terrain.style", "terrain.formats", "langue"]) expect(erreurs).toContainEqual({ champ, code: "invalide" });
  });

  it("applique les défauts de langue, adresse et style", () => {
    const e = clone();
    delete e.langue;
    delete e.terrain.adresse;
    delete e.terrain.style;
    const r = validerEntree(e);
    expect(r.ok && [r.entree.langue, r.entree.terrain.adresse, r.entree.terrain.style]).toEqual(["fr", "vous", "chaleureux"]);
  });

  it("normalise les espaces et les caractères de contrôle", () => {
    const e = clone();
    e.talent.mecanisme = "  démêle   les\u0000 situations\t humaines  bloquées  ";
    e.talent.reussite = "ligne un\n\n  ligne  deux";
    const r = validerEntree(e);
    expect(r.ok && r.entree.talent.mecanisme).toBe("démêle les situations humaines bloquées");
    expect(r.ok && r.entree.talent.reussite).toBe("ligne un\n\nligne deux");
  });

  it("nettoie les listes : vides, doublons insensibles à la casse, troncature", () => {
    const e = clone();
    e.talent.sousTalents = ["Écoute", " écoute ", "", "Humour", "Médiation", "A", "B", "C", "D", "x".repeat(100)];
    e.talent.pistes = ["a", "b", "c", "d", "e", "f"];
    const r = validerEntree(e);
    expect(r.ok && r.entree.talent.sousTalents).toEqual(["Écoute", "Humour", "Médiation", "A", "B", "C"]);
    expect(r.ok && r.entree.talent.pistes).toHaveLength(5);
    e.talent.sousTalents = ["x".repeat(100)];
    const r2 = validerEntree(e);
    expect(r2.ok && r2.entree.talent.sousTalents[0]).toHaveLength(60);
  });

  it("ignore les clés inconnues", () => {
    const e = clone();
    e.pirate = "oui";
    e.talent.secret = "x";
    const r = validerEntree(e);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.entree).not.toHaveProperty("pirate");
      expect(r.entree.talent).not.toHaveProperty("secret");
    }
  });

  it("contrôle les réponses aux questions", () => {
    const e = clone();
    e.reponses = [{ id: "t1-q1", question: "Quelle zone ?", reponse: "Rennes" }];
    expect(validerEntree(e).ok).toBe(true);
    e.reponses = [{ id: "n'importe quoi", question: "Q", reponse: "x".repeat(301) }];
    const erreurs = erreursDe(e);
    expect(erreurs).toContainEqual({ champ: "reponses[0].id", code: "invalide" });
    expect(erreurs).toContainEqual({ champ: "reponses[0].reponse", code: "trop_long", max: 300 });
  });

  it("refuse ce qui n'est pas un objet", () => {
    expect(validerEntree(null).ok).toBe(false);
    expect(validerEntree("texte").ok).toBe(false);
  });
});

describe("validerCorrections", () => {
  const base = () => ({
    offre: "J'accompagne des dirigeants.",
    cibles: [
      { id: "c1", verdict: "oui", commentaire: "" },
      { id: "c2", verdict: "non", commentaire: "Trop éloigné de mon réseau" },
      { id: "c3", verdict: "en_partie", commentaire: "Plutôt les managers" },
    ],
    antiCible: { verdict: "oui", commentaire: "" },
    idee: "",
  });
  it("accepte des corrections complètes", () => expect(validerCorrections(base()).ok).toBe(true));
  it("exige un commentaire pour non et en_partie", () => {
    const c = base();
    c.cibles[1].commentaire = "";
    const r = validerCorrections(c);
    expect(!r.ok && r.erreurs).toContainEqual({ champ: "corrections.cibles[1].commentaire", code: "requis" });
  });
  it("refuse une offre trop courte et des identifiants en double", () => {
    const c = base();
    c.offre = "court";
    c.cibles[1].id = "c1";
    const r = validerCorrections(c);
    expect(!r.ok && r.erreurs).toContainEqual({ champ: "corrections.offre", code: "trop_court", min: 10 });
    expect(!r.ok && r.erreurs).toContainEqual({ champ: "corrections.cibles[1].id", code: "invalide" });
  });
});

describe("detecterFlou", () => {
  it.each([
    ["benefice", "aider les gens"],
    ["benefice", "Accompagner les personnes"],
    ["offre", "du coaching"],
    ["offre", "Accompagnement."],
    ["clientsPasses", "tout le monde"],
    ["offre", "des gens qui vont mal"],
  ])("vrai : %s, « %s »", (champ, texte) => expect(detecterFlou(champ, texte)).toBe(true));

  it.each([
    ["benefice", "les équipes retrouvent confiance et élan, et leurs décisions se débloquent."],
    ["offre", "j'anime des ateliers de cohésion d'équipe, et j'aimerais accompagner des dirigeants en individuel."],
    ["clientsPasses", "un directeur d'usine m'a remerciée d'avoir désamorcé un conflit entre deux chefs d'équipe."],
    ["benefice", "aider les gens à retrouver le sommeil grâce à une méthode de respiration que je pratique depuis dix ans"],
    ["zone", "tout le monde"],
  ])("faux : %s, « %s »", (champ, texte) => expect(detecterFlou(champ, texte)).toBe(false));
});
