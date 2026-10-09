import { describe, expect, it } from "vitest";
import { contenuParcours } from "./contenu";
import {
  bilanEtape,
  calculerPosition,
  construireResultat,
  moduleArgent,
  niveauAffiche,
  offresDeLaVoie,
  pointsValeurs,
  prochainesActions,
  questionnaire,
  questionsEcran,
  type Position,
  type Resultat,
} from "./position";
import { PROFIL_VIDE, type Profil } from "./profil";
import type { Reponse } from "./types";

const data = contenuParcours("fr");

/** Toutes les réponses d'une liste d'étapes, à la même valeur. */
function rep(etapes: string[], r: Reponse = "oui"): Record<string, Reponse> {
  return Object.fromEntries(etapes.flatMap((id) => data.etapes[id].criteres.map((c) => [c.id, r])));
}
const profil = (p: Partial<Profil>): Profil => ({ ...PROFIL_VIDE, argent: 5, parallele: false, ...p });
const position = (p: Partial<Profil>): Position => {
  const pos = calculerPosition(data, profil(p));
  if (!pos) throw new Error("position attendue");
  return pos;
};
const resultat = (p: Partial<Profil>): Resultat => {
  const r = construireResultat(data, profil(p));
  if (!r) throw new Error("résultat attendu");
  return r;
};
const TRONC = ["connaitre", "nommer", "cap"];
const E = ["e_cible", "e_terrain", "e_offre", "e_reseau", "e_vendre", "e_vivre"];
const S = ["s_cible", "s_terrain", "s_reseau", "s_supports", "s_strategie", "s_epanouir"];

describe("bilan d'une étape : Oui 2, En partie 1, Pas encore 0, seuil 75 %", () => {
  const connaitre = data.etapes.connaitre;

  it("compte les points et les essentiels", () => {
    const b = bilanEtape(data, connaitre, rep(["connaitre"]));
    expect(b).toMatchObject({ points: 8, max: 8, requis: 6, complete: true, essentiels: 3, essentielsOui: 3, atteinte: true });
  });

  it("atteinte pile au seuil : essentiels à Oui, le reste à Pas encore (6 sur 8)", () => {
    const b = bilanEtape(data, connaitre, { ...rep(["connaitre"]), "connaitre.eteint": "pas_encore" });
    expect(b.points).toBe(6);
    expect(b.atteinte).toBe(true);
  });

  it("pas atteinte si un essentiel n'est pas à Oui, même au-dessus du seuil", () => {
    const b = bilanEtape(data, connaitre, { ...rep(["connaitre"]), "connaitre.flow": "en_partie" });
    expect(b.points).toBe(7);
    expect(b.atteinte).toBe(false);
  });

  it("pas atteinte sous le seuil, même avec tous les essentiels à Oui", () => {
    // E6 : 2 essentiels sur 5 critères. 4 + 1 + 1 + 0 = 6 sur 10 (60 %).
    const vivre = data.etapes.e_vivre;
    const base = rep(["e_vivre"]);
    const sous = { ...base, "e_vivre.delegue": "en_partie", "e_vivre.revenu": "en_partie", "e_vivre.flow": "pas_encore" } as const;
    expect(bilanEtape(data, vivre, sous)).toMatchObject({ points: 6, requis: 8, atteinte: false });
    const pile = { ...sous, "e_vivre.flow": "oui" } as const;
    expect(bilanEtape(data, vivre, pile)).toMatchObject({ points: 8, atteinte: true });
  });

  it("pas atteinte tant qu'une question n'a pas de réponse", () => {
    const { "connaitre.eteint": _retire, ...sans } = rep(["connaitre"]);
    void _retire;
    expect(bilanEtape(data, connaitre, sans)).toMatchObject({ complete: false, atteinte: false, repondues: 3 });
  });
});

describe("voie A : entrepreneur qui lance son offre", () => {
  it("sans réponse, l'étape actuelle est la première", () => {
    const p = position({ voie: "A" });
    expect(p.actuelles).toEqual(["connaitre"]);
    expect(p.etat).toBe("en_cours");
  });

  it("s'arrête à la première étape non atteinte, sans regarder les suivantes", () => {
    const p = position({ voie: "A", reponses: { ...rep(["connaitre"], "en_partie"), ...rep(["nommer", "cap", "e_cible"]) } });
    expect(p.actuelles).toEqual(["connaitre"]);
    expect(p.principale.etapes.map((e) => e.statut)).toEqual(["actuelle", ...Array(9).fill("a_venir")]);
    expect(p.principale.etapes.slice(1).every((e) => e.bilan === null)).toBe(true);
    expect(resultat({ voie: "A", reponses: { ...rep(["connaitre"], "en_partie"), ...rep(["nommer"]) } }).points.gagnes).toBe(4);
  });

  it("après le tronc commun, l'étape actuelle est E1 et il reste 6 étapes avant Ton Ikigai", () => {
    const r = resultat({ voie: "A", reponses: rep(TRONC) });
    expect(r.position.actuelles).toEqual(["e_cible"]);
    expect(r.restantes.total).toBe(6);
    expect(r.franchies).toEqual({ nombre: 3, total: 10 });
  });

  it("tout franchi : parcours terminé, niveau 5B, les actions de Ton Ikigai gardent le réglage", () => {
    const r = resultat({ voie: "A", reponses: rep([...TRONC, ...E, "ikigai"]) });
    expect(r.position.etat).toBe("termine");
    expect(r.position.actuelles).toEqual([]);
    expect(r.restantes.total).toBe(0);
    expect(r.niveau.actuel?.code).toBe("5B");
    expect(r.actions.map((a) => a.etape)).toEqual(["ikigai", "ikigai", "ikigai"]);
  });

  it("pose une étape par écran, jusqu'à la première sans réponse", () => {
    const q = questionnaire(data, profil({ voie: "A", reponses: rep(["connaitre", "nommer"]) }));
    expect(q.ecrans.map((e) => e.cle)).toEqual(["connaitre", "nommer", "cap"]);
    expect(q.enAttente).toBe(2);
  });

  it("le questionnaire s'arrête à l'étape non atteinte : plus rien à poser", () => {
    const q = questionnaire(data, profil({ voie: "A", reponses: { ...rep(["connaitre"]), ...rep(["nommer"], "pas_encore") } }));
    expect(q.ecrans.map((e) => e.cle)).toEqual(["connaitre", "nommer"]);
    expect(q.enAttente).toBeNull();
  });
});

describe("voies B, C et D", () => {
  it("B : la branche Salarié après le tronc commun", () => {
    expect(position({ voie: "B", reponses: rep(TRONC) }).actuelles).toEqual(["s_cible"]);
    expect(position({ voie: "B", reponses: rep([...TRONC, "s_cible"]) }).actuelles).toEqual(["s_terrain"]);
  });

  it("C : la passerelle « sécuriser ta transition » avant la branche Entrepreneur", () => {
    expect(position({ voie: "C", reponses: rep(TRONC) }).actuelles).toEqual(["transition"]);
    expect(position({ voie: "C", reponses: rep([...TRONC, "transition"]) }).actuelles).toEqual(["e_cible"]);
  });

  it("D : la passerelle « valoriser ton expérience » avant la branche Salarié", () => {
    expect(position({ voie: "D", reponses: rep(TRONC) }).actuelles).toEqual(["valoriser"]);
    expect(position({ voie: "D", reponses: rep([...TRONC, "valoriser"]) }).actuelles).toEqual(["s_cible"]);
  });

  it("une passerelle change de terrain, pas de niveau", () => {
    const n = niveauAffiche(data, position({ voie: "C", reponses: rep(TRONC) }));
    expect(n.actuel?.code).toBe("2");
    expect(n.prepares[0]).toMatchObject({ etape: "transition", effet: "garde", niveau: null });
    expect(n.prepares[0].note).toMatch(/pas de niveau/);
  });
});

describe("voie E : hybride, salarié et entrepreneur en parallèle", () => {
  it("tant que le tronc commun n'est pas franchi, une seule étape actuelle", () => {
    const p = position({ voie: "E", reponses: rep(["connaitre"]) });
    expect(p.actuelles).toEqual(["nommer"]);
    expect(p.hybride?.entrepreneur.etapes.every((e) => e.statut === "a_venir")).toBe(true);
  });

  it("deux étapes actuelles après le tronc commun, une par branche", () => {
    const p = position({ voie: "E", reponses: rep([...TRONC, "e_cible", "e_terrain"]) });
    expect(p.actuelles).toEqual(["e_offre", "s_cible"]);
    expect(resultat({ voie: "E", reponses: rep([...TRONC, "e_cible", "e_terrain"]) }).restantes).toEqual({ total: 10, entrepreneur: 4, salarie: 6 });
  });

  it("pose E2 et S2 sur le même écran, puis E4 et S3, en dédoublonnant la question commune", () => {
    const q1 = questionnaire(data, profil({ voie: "E", reponses: rep([...TRONC, "e_cible", "s_cible"]) }));
    const terrain = q1.ecrans[q1.ecrans.length - 1];
    expect(terrain.etapes).toEqual(["e_terrain", "s_terrain"]);
    expect(terrain.paire?.nom).toBe("Le terrain");
    expect(q1.ecrans.map((e) => e.cle)).toEqual([...TRONC, "e_cible", "s_cible", "e_terrain+s_terrain"]);

    const q2 = questionnaire(data, profil({ voie: "E", reponses: rep([...TRONC, "e_cible", "s_cible", "e_terrain", "s_terrain", "e_offre"]) }));
    const reseau = q2.ecrans[q2.ecrans.length - 1];
    expect(reseau.etapes).toEqual(["e_reseau", "s_reseau"]);
    expect(reseau.paire?.nom).toBe("Le réseau");
    const questions = questionsEcran(data, reseau);
    expect(questions).toHaveLength(7);
    const commune = questions.find((x) => x.criteres.length === 2);
    expect(commune?.criteres.map((c) => c.id)).toEqual(["e_reseau.nouvelles", "s_reseau.nouvelles"]);
  });

  it("une branche arrêtée n'empêche pas l'autre d'avancer", () => {
    const reponses = { ...rep([...TRONC, "e_cible", "s_cible", "s_terrain"]), ...rep(["e_terrain"], "pas_encore") };
    const p = position({ voie: "E", reponses });
    expect(p.actuelles).toEqual(["e_terrain", "s_reseau"]);
    const q = questionnaire(data, profil({ voie: "E", reponses }));
    expect(q.ecrans[q.ecrans.length - 1].cle).toBe("s_reseau");
  });

  it("E6 et S6 atteintes : l'étape actuelle devient Ton Ikigai", () => {
    expect(position({ voie: "E", reponses: rep([...TRONC, ...E, ...S]) }).actuelles).toEqual(["ikigai"]);
    expect(position({ voie: "E", reponses: rep([...TRONC, ...E, ...S, "ikigai"]) }).etat).toBe("termine");
  });

  it("actions communes d'abord, puis les deux branches mélangées", () => {
    const terrain = resultat({ voie: "E", reponses: { ...rep([...TRONC, "e_cible", "s_cible"]), ...rep(["e_terrain", "s_terrain"], "pas_encore") } });
    expect(terrain.actions.map((a) => a.etape)).toEqual(["e_terrain", "s_terrain", "e_terrain"]);
    expect(terrain.actions.every((a) => a.commune)).toBe(true);
    expect(terrain.communes.map((m) => m.nom)).toEqual(["Le terrain"]);

    // S3 est dans une paire (Le réseau), E3 non : S3 passe d'abord.
    const reponses = { ...rep([...TRONC, "e_cible", "s_cible", "e_terrain", "s_terrain"]), ...rep(["e_offre"], "pas_encore") };
    const r = resultat({ voie: "E", reponses: { ...reponses, ...rep(["s_reseau"], "pas_encore") } });
    expect(r.position.actuelles).toEqual(["e_offre", "s_reseau"]);
    expect(r.actions.map((a) => [a.etape, a.commune])).toEqual([
      ["s_reseau", true],
      ["e_offre", false],
      ["s_reseau", true],
    ]);
  });

  it("rappelle les 4 points d'attention, contrat compris (pas un avis juridique)", () => {
    const r = resultat({ voie: "E", reponses: rep(TRONC) });
    expect(r.attention.map((p) => p.id)).toEqual(["temps", "energie", "positionnement", "contrat"]);
    expect(r.attention[3].texte).toMatch(/clause d'exclusivité/);
    expect(r.attention[3].texte).toMatch(/pas un avis juridique/);
  });
});

describe("voie K : connaissance de soi", () => {
  it("seule : de K1 à Ton Ikigai, sans autodiagnostic argent", () => {
    const r = resultat({ voie: "K", argent: null, reponses: rep(["k_connaitre"]) });
    expect(r.position.actuelles).toEqual(["k_defauts"]);
    expect(r.restantes.total).toBe(3);
    expect(r.argent).toBeNull();
  });

  it("K2 franchie : niveau 4 (maîtriser ses défauts)", () => {
    expect(resultat({ voie: "K", reponses: rep(["k_connaitre", "k_defauts"]) }).niveau.actuel?.code).toBe("4");
  });

  it("en parallèle d'une voie pro : 2e position calculée à part, sans Ton Ikigai", () => {
    const p = profil({ voie: "B", parallele: true, reponses: { ...rep(["connaitre"]), ...rep(["nommer"], "pas_encore"), ...rep(["k_connaitre"]) } });
    const pos = calculerPosition(data, p);
    expect(pos?.actuelles).toEqual(["nommer"]);
    expect(pos?.parallele?.actuelle).toBe("k_defauts");
    expect(pos?.parallele?.etapes.map((e) => e.id)).toEqual(["k_connaitre", "k_defauts", "k_qualites", "k_explorer"]);
    // La voie pro d'abord (jusqu'à son étape non atteinte), puis la piste parallèle.
    const q = questionnaire(data, p);
    expect(q.ecrans.map((e) => `${e.piste}:${e.cle}`)).toEqual(["principale:connaitre", "principale:nommer", "parallele:k_connaitre", "parallele:k_defauts"]);
    expect(q.enAttente).toBe(3);
    // Tant que l'étape de la voie pro attend des réponses, la piste parallèle attend aussi.
    const enCours = questionnaire(data, profil({ voie: "B", parallele: true, reponses: rep(["connaitre", "k_connaitre"]) }));
    expect(enCours.ecrans.map((e) => e.cle)).toEqual(["connaitre", "nommer"]);
    expect(enCours.enAttente).toBe(1);
  });

  it("propose deux actions pour la piste parallèle, celles qui débloquent un essentiel d'abord", () => {
    const r = resultat({ voie: "A", parallele: true, reponses: { ...rep(["connaitre"], "pas_encore"), ...rep(["k_connaitre"]), "k_connaitre.besoins": "pas_encore" } });
    expect(r.queteParallele?.etape.id).toBe("k_connaitre");
    expect(r.actionsParallele.map((a) => a.action.id)).toEqual(["k_connaitre.a3", "k_connaitre.a1"]);
  });

  it("sans le parallèle, la piste K n'existe pas", () => {
    expect(position({ voie: "A", parallele: false }).parallele).toBeNull();
  });
});

describe("« Je ne sais pas encore »", () => {
  it("ne pose que le tronc commun", () => {
    const p = position({ voie: "inconnue", reponses: rep(["connaitre"]) });
    expect(p.actuelles).toEqual(["nommer"]);
    expect(p.principale.etapes.map((e) => e.id)).toEqual(TRONC);
    expect(questionnaire(data, profil({ voie: "inconnue", reponses: rep(TRONC) })).ecrans).toHaveLength(3);
  });

  it("étape 3 non atteinte : c'est l'étape actuelle", () => {
    expect(position({ voie: "inconnue", reponses: { ...rep(["connaitre", "nommer"]), ...rep(["cap"], "en_partie") } }).actuelles).toEqual(["cap"]);
  });

  it("étape 3 atteinte : on repose la question de voie", () => {
    const r = resultat({ voie: "inconnue", reponses: rep(TRONC) });
    expect(r.position.etat).toBe("voie_a_choisir");
    expect(r.actions).toEqual([]);
    expect(r.offres.voie).toBeNull();
  });

  it("les réponses du tronc commun servent ensuite à la voie choisie", () => {
    expect(position({ voie: "B", reponses: rep(TRONC) }).actuelles).toEqual(["s_cible"]);
  });
});

describe("raccourci « ancien accompagné »", () => {
  it("démarre à l'étape 3, avec le niveau 2 déjà atteint", () => {
    const r = resultat({ voie: "A", raccourci: true });
    expect(r.position.actuelles).toEqual(["cap"]);
    expect(r.position.principale.etapes.slice(0, 2).map((e) => [e.id, e.statut, e.auto])).toEqual([
      ["connaitre", "franchie", true],
      ["nommer", "franchie", true],
    ]);
    expect(r.niveau.actuel?.code).toBe("2");
    expect(questionnaire(data, profil({ voie: "A", raccourci: true })).ecrans.map((e) => e.cle)).toEqual(["cap"]);
  });

  it("vaut aussi pour « Je ne sais pas encore » et la voie E, pas pour la voie K", () => {
    expect(position({ voie: "inconnue", raccourci: true }).actuelles).toEqual(["cap"]);
    expect(position({ voie: "E", raccourci: true }).actuelles).toEqual(["cap"]);
    expect(position({ voie: "K", raccourci: true }).actuelles).toEqual(["k_connaitre"]);
  });
});

describe("module Argent : en séance avec Pierre, sans lien d'outil", () => {
  const auE3 = rep([...TRONC, "e_cible", "e_terrain"]);

  it("proposé si l'autodiagnostic vaut 3 ou moins", () => {
    expect(moduleArgent(data, profil({ voie: "A", argent: 3 }), position({ voie: "A", argent: 3 }))?.propose).toBe(true);
    expect(moduleArgent(data, profil({ voie: "A", argent: 4 }), position({ voie: "A", argent: 4 }))?.propose).toBe(false);
  });

  it("proposé si un critère d'argent posé est à Pas encore (E3, E5, S1, S5)", () => {
    const reponses = { ...auE3, ...rep(["e_offre"]), "e_offre.prix": "pas_encore" } as const;
    const a = moduleArgent(data, profil({ voie: "A", reponses }), position({ voie: "A", reponses }));
    expect(a?.propose).toBe(true);
    expect(a?.criteres.map((c) => c.id)).toEqual(["e_offre.prix"]);
    const salarie = { ...rep([...TRONC, "s_cible"]), "s_cible.salaire": "pas_encore" } as const;
    expect(moduleArgent(data, profil({ voie: "B", reponses: salarie }), position({ voie: "B", reponses: salarie }))?.criteres.map((c) => c.id)).toEqual(["s_cible.salaire"]);
  });

  it("ignore un critère d'argent d'une étape pas encore posée", () => {
    const reponses = { ...rep(["connaitre"], "pas_encore"), "e_offre.prix": "pas_encore" } as const;
    expect(moduleArgent(data, profil({ voie: "A", reponses }), position({ voie: "A", reponses }))).toMatchObject({ propose: false, criteres: [] });
  });

  it("prioritaire en E4, E5, S4, S5 : la séance avec Pierre passe en premier, sans bouton", () => {
    const enE4 = rep([...TRONC, "e_cible", "e_terrain", "e_offre"]);
    const r = resultat({ voie: "A", argent: 2, reponses: enE4 });
    expect(r.position.actuelles).toEqual(["e_reseau"]);
    expect(r.argent).toMatchObject({ propose: true, prioritaire: true, note: 2 });
    expect(r.actions[0]).toMatchObject({ etape: "argent", branche: "module" });
    expect(r.actions[0].action.lien).toBeNull();
    expect(r.actions).toHaveLength(3);
    for (const [voie, reponses, etape] of [
      ["A", rep([...TRONC, "e_cible", "e_terrain", "e_offre", "e_reseau"]), "e_vendre"],
      ["B", rep([...TRONC, "s_cible", "s_terrain", "s_reseau"]), "s_supports"],
      ["B", rep([...TRONC, "s_cible", "s_terrain", "s_reseau", "s_supports"]), "s_strategie"],
    ] as const) {
      const x = resultat({ voie, argent: 1, reponses });
      expect(x.position.actuelles, etape).toEqual([etape]);
      expect(x.argent?.prioritaire, etape).toBe(true);
    }
  });

  it("pas prioritaire ailleurs, et rien pour la voie K ni « Je ne sais pas encore »", () => {
    expect(resultat({ voie: "A", argent: 1, reponses: auE3 }).argent).toMatchObject({ propose: true, prioritaire: false });
    expect(resultat({ voie: "A", argent: 1, reponses: auE3 }).actions[0].etape).toBe("e_offre");
    expect(resultat({ voie: "K", argent: 1 }).argent).toBeNull();
    expect(resultat({ voie: "inconnue", argent: 1 }).argent).toBeNull();
  });
});

describe("valeurs : un critère valeurs à Pas encore ou En partie est mis en avant, avec la Boussole", () => {
  const boussole = data.outils.boussole.url;

  it("étape 3 (cap)", () => {
    const reponses = { ...rep(TRONC), "cap.valeurs": "en_partie" } as const;
    const v = pointsValeurs(data, profil({ voie: "A", reponses }), position({ voie: "A", reponses }));
    expect(v?.criteres.map((c) => [c.critere.id, c.reponse])).toEqual([["cap.valeurs", "en_partie"]]);
    expect(v?.outil?.url).toBe(boussole);
  });

  it("E1, E3, S1 et S6", () => {
    const cas: [Profil["voie"], Record<string, Reponse>, string][] = [
      ["A", { ...rep([...TRONC, "e_cible"]), "e_cible.valeurs": "pas_encore" }, "e_cible.valeurs"],
      ["A", { ...rep([...TRONC, "e_cible", "e_terrain", "e_offre"]), "e_offre.valeurs": "en_partie" }, "e_offre.valeurs"],
      ["B", { ...rep([...TRONC, "s_cible"]), "s_cible.valeurs": "pas_encore" }, "s_cible.valeurs"],
      ["B", { ...rep([...TRONC, ...S]), "s_epanouir.valeurs": "en_partie" }, "s_epanouir.valeurs"],
    ];
    for (const [voie, reponses, id] of cas) {
      const v = pointsValeurs(data, profil({ voie, reponses }), position({ voie, reponses }));
      expect(v?.criteres.map((c) => c.critere.id), id).toEqual([id]);
      expect(v?.outil?.url, id).toBe(boussole);
    }
  });

  it("rien quand les valeurs sont à Oui", () => {
    expect(pointsValeurs(data, profil({ voie: "A", reponses: rep(TRONC) }), position({ voie: "A", reponses: rep(TRONC) }))).toBeNull();
  });

  it("côté Connaissance de soi, la Boussole Relation", () => {
    const reponses = { ...rep(["k_connaitre", "k_defauts", "k_qualites"]), ...rep(["k_explorer"]), "k_explorer.valeurs": "en_partie" } as const;
    const v = pointsValeurs(data, profil({ voie: "K", reponses }), position({ voie: "K", reponses }));
    expect(v?.outil?.url).toBe(data.outils.boussole_relation.url);
  });
});

describe("les 3 prochaines actions", () => {
  it("d'abord celles qui débloquent un critère essentiel à Pas encore", () => {
    const reponses = { ...rep(["connaitre"]), "connaitre.flow": "pas_encore" } as const;
    const actions = prochainesActions(data, profil({ voie: "A", reponses }), position({ voie: "A", reponses }), null);
    expect(actions.map((a) => a.action.id)).toEqual(["connaitre.a2", "connaitre.a1", "connaitre.a3"]);
    expect(actions[0].cle).toBe(true);
  });

  it("les actions de l'étape actuelle, avec le bouton vers l'outil quand il existe", () => {
    const reponses = { ...rep(TRONC), ...rep(["e_cible"], "pas_encore") };
    const r = resultat({ voie: "A", reponses });
    expect(r.actions).toHaveLength(3);
    expect(r.actions.every((a) => a.etape === "e_cible")).toBe(true);
    expect(r.actions[0].action.lien).toEqual({ id: "cibleur", nom: "Le Cibleur", url: "https://www.magichumans.com/boussole-decision/ma-cible/" });
  });

  it("une étape à 5 actions n'en montre que 3, les plus utiles d'abord", () => {
    const reponses = { ...rep([...TRONC, "e_cible", "e_terrain"]), ...rep(["e_offre"]), "e_offre.gagner": "pas_encore", "e_offre.valeurs": "en_partie" } as const;
    const r = resultat({ voie: "A", reponses });
    expect(r.actions.map((a) => a.action.id)).toEqual(["e_offre.a4", "e_offre.a5", "e_offre.a1"]);
  });
});

describe("niveau Réussir dans le Plaisir", () => {
  it("au départ : niveau 0 ou 1, et l'étape actuelle prépare le niveau 2", () => {
    const n = niveauAffiche(data, position({ voie: "A" }));
    expect(n.actuel).toBeNull();
    expect(n.depart.map((x) => x.code)).toEqual(["0", "1"]);
    expect(n.prepares[0]).toMatchObject({ etape: "connaitre", effet: "vers" });
    expect(n.prepares[0].niveau?.code).toBe("2");
    expect(n.echelle.map((x) => x.etat)).toEqual(["depart", "depart", "vise", "a_venir", "a_venir", "a_venir", "a_venir", "a_venir", "a_venir"]);
  });

  it("le niveau « atteint » de la dernière étape franchie", () => {
    expect(niveauAffiche(data, position({ voie: "A", reponses: rep(["connaitre", "nommer"]) })).actuel?.code).toBe("2");
    expect(niveauAffiche(data, position({ voie: "A", reponses: rep([...TRONC, ...E]) })).actuel?.code).toBe("3");
    expect(niveauAffiche(data, position({ voie: "B", reponses: rep([...TRONC, ...S]) })).actuel?.code).toBe("3");
  });

  it("5B atteint ne vaut pas 5A", () => {
    const n = niveauAffiche(data, position({ voie: "K", reponses: rep(["k_connaitre", "k_defauts", "k_qualites", "k_explorer", "ikigai"]) }));
    expect(n.actuel?.code).toBe("5B");
    expect(n.echelle.find((x) => x.niveau.code === "5A")?.etat).toBe("a_venir");
    expect(n.echelle.find((x) => x.niveau.code === "4")?.etat).toBe("atteint");
  });
});

describe("Envie d'avancer plus vite ? : l'Appel Découverte et l'offre de la voie", () => {
  it("donne l'offre propre à chaque voie, rien pour D et E", () => {
    expect(offresDeLaVoie(data, "A").voie?.id).toBe("rebond");
    expect(offresDeLaVoie(data, "B").voie?.id).toBe("pivot");
    expect(offresDeLaVoie(data, "C").voie?.id).toBe("pivot");
    expect(offresDeLaVoie(data, "D").voie).toBeNull();
    expect(offresDeLaVoie(data, "E").voie).toBeNull();
    expect(offresDeLaVoie(data, "K").voie?.id).toBe("diagnostic_amour");
    expect(offresDeLaVoie(data, "inconnue").voie).toBeNull();
    expect(offresDeLaVoie(data, "D").appel).toMatchObject({ prix: "offert", url: "https://calendly.com/pierre-j-sarazin" });
  });
});
