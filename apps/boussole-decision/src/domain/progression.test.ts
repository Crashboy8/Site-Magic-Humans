import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import {
  AJOUT_MAX,
  BADGES,
  CLE_JEU,
  XP_MAX,
  aDuNeuf,
  apresEnvoi,
  apresParcours,
  badgesAtteints,
  jourParis,
  ligneDeProgression,
  lireEnvoi,
  prochainBadge,
  progressionDeLigne,
  progressionDepart,
  rangerBadges,
  recevoirJeu,
  serieApres,
  serieEnCours,
  veille,
  vueProgression,
  type EnvoiJeu,
  type Progression,
} from "./progression";

const MAINTENANT = new Date("2026-10-10T10:00:00Z"); // midi à Paris
const HIER = "2026-10-09T18:00:00.000Z";
const AVANT_HIER = "2026-10-08T18:00:00.000Z";

const compte = (p: Partial<Progression> = {}): Progression => ({ xp: 0, niveau: null, badges: [], serieJours: 0, misAJour: null, ...p });
const envoi = (e: Partial<EnvoiJeu> = {}): EnvoiJeu => ({ ajout: 0, badges: [], serieJours: 0, maj: null, repartir: false, ...e });

describe("jours et série", () => {
  it("compte le jour à l'heure de Paris", () => {
    expect(jourParis(new Date("2026-10-09T22:30:00Z"))).toBe("2026-10-10");
    expect(jourParis("2026-10-09T21:30:00Z")).toBe("2026-10-09");
    expect(veille("2026-10-01")).toBe("2026-09-30");
    expect(veille("2026-03-29")).toBe("2026-03-28");
  });

  it("prolonge la série la veille, la garde le même jour, la relance après un trou", () => {
    expect(serieApres(3, "2026-10-09", "2026-10-10")).toBe(4);
    expect(serieApres(3, "2026-10-10", "2026-10-10")).toBe(3);
    expect(serieApres(0, "2026-10-10", "2026-10-10")).toBe(1);
    expect(serieApres(3, "2026-10-07", "2026-10-10")).toBe(1);
    expect(serieApres(0, null, "2026-10-10")).toBe(1);
  });

  it("affiche la série tant que la personne a joué aujourd'hui ou hier", () => {
    expect(serieEnCours({ serieJours: 4, misAJour: HIER }, MAINTENANT)).toBe(4);
    expect(serieEnCours({ serieJours: 4, misAJour: AVANT_HIER }, MAINTENANT)).toBe(0);
    expect(serieEnCours({ serieJours: 4, misAJour: null }, MAINTENANT)).toBe(0);
  });
});

describe("badges", () => {
  it("gagne chaque badge à son seuil et donne le prochain", () => {
    expect(badgesAtteints(0)).toEqual([]);
    expect(badgesAtteints(50)).toEqual(["premier-pas", "en-mouvement"]);
    expect(prochainBadge(42, ["premier-pas"])).toEqual({ id: "en-mouvement", seuil: 50, manque: 8 });
    expect(prochainBadge(400, ["premier-pas", "en-mouvement", "sur-la-lancee", "ancre"])).toBeNull();
  });

  it("ignore les badges inconnus et range dans l'ordre des seuils", () => {
    expect(rangerBadges(["ancre", "premier-pas", "or", "ancre"])).toEqual(["premier-pas", "ancre"]);
  });
});

describe("lecture d'une ligne et d'un envoi", () => {
  it("relit une ligne de la table et refuse ce qui sort des bornes", () => {
    const ligne = { xp: 60, niveau: "5A", badges: ["premier-pas", "en-mouvement"], serie_jours: 2, mis_a_jour: HIER };
    expect(progressionDeLigne(ligne)).toEqual({ xp: 60, niveau: "5A", badges: ["premier-pas", "en-mouvement"], serieJours: 2, misAJour: HIER });
    expect(progressionDeLigne({ ...ligne, xp: -1 })).toBeNull();
    expect(progressionDeLigne({ ...ligne, niveau: "Expert" })?.niveau).toBeNull();
    expect(progressionDeLigne(null)).toBeNull();
  });

  it("écrit une ligne bornée, datée de maintenant si elle n'a jamais bougé", () => {
    const l = ligneDeProgression(compte({ xp: XP_MAX + 5 }), "u1", MAINTENANT);
    expect(l).toEqual({ user_id: "u1", xp: XP_MAX, niveau: null, badges: [], serie_jours: 0, mis_a_jour: MAINTENANT.toISOString() });
  });

  it("lit l'envoi du jeu comme l'enregistrement du navigateur", () => {
    expect(lireEnvoi({ ajout: 10, badges: ["premier-pas", "x"], serieJours: 2, maj: HIER }, MAINTENANT)).toEqual(
      envoi({ ajout: 10, badges: ["premier-pas"], serieJours: 2, maj: HIER }),
    );
    expect(lireEnvoi({ v: 1, aEnvoyer: 30, badges: [], serieJours: 1, maj: null }, MAINTENANT)).toEqual(envoi({ ajout: 30, serieJours: 1 }));
    expect(lireEnvoi({ repartir: true }, MAINTENANT)?.repartir).toBe(true);
  });

  it("refuse un envoi hors des bornes et ramène une date future à maintenant", () => {
    expect(lireEnvoi({ ajout: -1 }, MAINTENANT)).toBeNull();
    expect(lireEnvoi({ ajout: AJOUT_MAX + 1 }, MAINTENANT)).toBeNull();
    expect(lireEnvoi({ ajout: 1.5 }, MAINTENANT)).toBeNull();
    expect(lireEnvoi({ badges: "premier-pas" }, MAINTENANT)).toBeNull();
    expect(lireEnvoi({ maj: "pas une date" }, MAINTENANT)).toBeNull();
    expect(lireEnvoi({ v: 2 }, MAINTENANT)).toBeNull();
    expect(lireEnvoi("{}", MAINTENANT)).toBeNull();
    expect(lireEnvoi({ maj: "2030-01-01T00:00:00Z" }, MAINTENANT)?.maj).toBe(MAINTENANT.toISOString());
  });
});

describe("le compte reçoit le jeu", () => {
  it("à la première connexion, garde les points de « Où j'en suis ? » et ajoute ceux du navigateur", () => {
    const depart = progressionDepart({ points: 24, niveau: "2" });
    expect(depart).toEqual({ xp: 24, niveau: "2", badges: ["premier-pas"], serieJours: 0, misAJour: null });
    const apres = recevoirJeu(depart, envoi({ ajout: 30, badges: ["premier-pas"], serieJours: 3, maj: HIER }), { points: 24, niveau: "2" });
    expect(apres).toEqual({ xp: 54, niveau: "2", badges: ["premier-pas", "en-mouvement"], serieJours: 3, misAJour: HIER });
  });

  it("n'efface jamais des points : un compte qui a déjà joué ailleurs garde les siens et reçoit ceux du navigateur", () => {
    const deja = compte({ xp: 120, badges: ["premier-pas", "en-mouvement"], serieJours: 5, misAJour: MAINTENANT.toISOString() });
    const apres = recevoirJeu(deja, envoi({ ajout: 40, serieJours: 1, maj: AVANT_HIER }), { points: 0, niveau: null });
    expect(apres.xp).toBe(160);
    expect(apres.badges).toEqual(["premier-pas", "en-mouvement", "sur-la-lancee"]);
    expect(apres.serieJours).toBe(5);
    expect(apres.misAJour).toBe(MAINTENANT.toISOString());
  });

  it("le même jour, garde la plus longue série ; un jour plus récent l'emporte", () => {
    const deja = compte({ xp: 10, serieJours: 2, misAJour: "2026-10-10T07:00:00.000Z" });
    expect(recevoirJeu(deja, envoi({ ajout: 5, serieJours: 6, maj: "2026-10-10T09:00:00.000Z" }), { points: 0, niveau: null })).toMatchObject({
      serieJours: 6,
      misAJour: "2026-10-10T09:00:00.000Z",
    });
    expect(recevoirJeu(compte({ serieJours: 9, misAJour: AVANT_HIER }), envoi({ ajout: 5, serieJours: 1, maj: HIER }), { points: 0, niveau: null }).serieJours).toBe(1);
  });

  it("« Repartir à zéro » ne garde que les points de « Où j'en suis ? », et la série", () => {
    const deja = compte({ xp: 320, niveau: "3", badges: ["premier-pas", "en-mouvement", "sur-la-lancee", "ancre"], serieJours: 4, misAJour: HIER });
    expect(recevoirJeu(deja, envoi({ repartir: true, ajout: 10 }), { points: 18, niveau: "3" })).toEqual({
      xp: 18,
      niveau: "3",
      badges: ["premier-pas"],
      serieJours: 4,
      misAJour: HIER,
    });
  });
});

describe("« Où j'en suis ? » met la progression à jour", () => {
  it("sans ligne, compte tous les points de la nouvelle position et lance la série", () => {
    const p = apresParcours(null, { points: 0, niveau: null }, { points: 22, niveau: "2" }, MAINTENANT, true);
    expect(p).toEqual({ xp: 22, niveau: "2", badges: ["premier-pas"], serieJours: 1, misAJour: MAINTENANT.toISOString() });
  });

  it("sans ligne mais avec une position déjà dans le compte, part de ses points", () => {
    expect(apresParcours(null, { points: 30, niveau: "2" }, { points: 34, niveau: "3" }, MAINTENANT, true).xp).toBe(34);
  });

  it("suit l'écart de points sans toucher aux points du jeu", () => {
    const deja = compte({ xp: 100, niveau: "2", badges: ["premier-pas", "en-mouvement"], serieJours: 2, misAJour: HIER });
    const plus = apresParcours(deja, { points: 20, niveau: "2" }, { points: 26, niveau: "3" }, MAINTENANT, true);
    expect(plus).toEqual({ xp: 106, niveau: "3", badges: ["premier-pas", "en-mouvement"], serieJours: 3, misAJour: MAINTENANT.toISOString() });
    const moins = apresParcours(deja, { points: 20, niveau: "2" }, { points: 18, niveau: "2" }, MAINTENANT, true);
    expect(moins.xp).toBe(98);
  });

  it("tout effacer retire les points du parcours, garde les badges et ne compte pas comme un jour joué", () => {
    const deja = compte({ xp: 100, niveau: "3", badges: ["premier-pas", "en-mouvement"], serieJours: 2, misAJour: AVANT_HIER });
    expect(apresParcours(deja, { points: 26, niveau: "3" }, { points: 0, niveau: null }, MAINTENANT, false)).toEqual({
      xp: 74,
      niveau: null,
      badges: ["premier-pas", "en-mouvement"],
      serieJours: 2,
      misAJour: AVANT_HIER,
    });
  });

  it("ne descend jamais sous zéro", () => {
    expect(apresParcours(compte({ xp: 3 }), { points: 10, niveau: null }, { points: 0, niveau: null }, MAINTENANT, false).xp).toBe(0);
  });
});

describe("vue et nouveautés", () => {
  it("donne ce qu'affichent le bloc et le jeu", () => {
    expect(vueProgression(compte({ xp: 42, niveau: "2", badges: ["premier-pas"], serieJours: 3, misAJour: HIER }), MAINTENANT)).toEqual({
      xp: 42,
      niveau: "2",
      badges: ["premier-pas"],
      serieJours: 3,
      prochain: { id: "en-mouvement", seuil: 50, manque: 8 },
      misAJour: HIER,
    });
  });

  it("n'envoie rien quand le navigateur n'a rien de neuf", () => {
    const c = { misAJour: HIER, badges: ["premier-pas" as const] };
    expect(aDuNeuf(envoi({ maj: HIER, badges: ["premier-pas"] }), c)).toBe(false);
    expect(aDuNeuf(envoi({ ajout: 1, maj: HIER }), c)).toBe(true);
    expect(aDuNeuf(envoi({ maj: MAINTENANT.toISOString() }), c)).toBe(true);
    expect(aDuNeuf(envoi({ badges: ["en-mouvement"] }), c)).toBe(true);
    expect(aDuNeuf(envoi({ maj: HIER }), null)).toBe(true);
  });
});

describe("le jeu (talent-game/js/progression.js)", () => {
  const code = readFileSync(join(__dirname, "../../../../talent-game/js/progression.js"), "utf8");
  const bac: { MHProgression?: Record<string, unknown> } = {};
  vm.runInNewContext(code, bac);
  const J = bac.MHProgression as {
    CLE: string;
    API: string;
    BADGES: { id: string; seuil: number }[];
    serieApres: (s: number, d: string | null, a: string) => number;
    jourParis: (d: Date) => string;
    lireTexte: (t: string | null) => Record<string, unknown>;
    gagner: (e: unknown, p: number, b: string[], m: Date) => Record<string, unknown>;
    apresEnvoi: (e: unknown, n: number, c: unknown) => Record<string, unknown>;
  };
  const copie = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

  it("a les mêmes badges, la même clé et la bonne adresse", () => {
    expect(J.CLE).toBe(CLE_JEU);
    expect(J.API).toBe("/boussole-decision/api/progression/");
    expect(copie(J.BADGES).map(({ id, seuil }) => ({ id, seuil }))).toEqual(BADGES.map(({ id, seuil }) => ({ id, seuil })));
  });

  it("compte les jours et la série comme l'application", () => {
    for (const [s, d, a] of [
      [3, "2026-10-09", "2026-10-10"],
      [3, "2026-10-10", "2026-10-10"],
      [3, "2026-10-07", "2026-10-10"],
      [0, null, "2026-10-10"],
    ] as const) {
      expect(J.serieApres(s, d, a)).toBe(serieApres(s, d, a));
    }
    expect(J.jourParis(new Date("2026-10-09T22:30:00Z"))).toBe(jourParis(new Date("2026-10-09T22:30:00Z")));
  });

  it("écrit dans le navigateur ce que Mon espace sait relire", () => {
    const e = J.gagner(J.lireTexte(null), 30, ["premier-pas"], MAINTENANT);
    expect(copie(e)).toEqual({ v: 1, aEnvoyer: 30, badges: ["premier-pas"], serieJours: 1, maj: MAINTENANT.toISOString() });
    expect(lireEnvoi(JSON.parse(JSON.stringify(e)), MAINTENANT)).toEqual(envoi({ ajout: 30, badges: ["premier-pas"], serieJours: 1, maj: MAINTENANT.toISOString() }));
    expect(copie(J.lireTexte("pas du json"))).toEqual({ v: 1, aEnvoyer: 0, badges: [], serieJours: 0, maj: null });
  });

  it("après l'envoi, garde les points gagnés pendant l'envoi et reprend la série du compte", () => {
    const pendant = { v: 1, aEnvoyer: 40, badges: ["premier-pas"], serieJours: 1, maj: HIER };
    const apres = J.apresEnvoi(pendant, 30, { badges: ["premier-pas", "en-mouvement"], serieJours: 6, misAJour: MAINTENANT.toISOString() });
    expect(copie(apres)).toEqual({ v: 1, aEnvoyer: 10, badges: ["premier-pas", "en-mouvement"], serieJours: 6, maj: MAINTENANT.toISOString() });
    const compteVu = { badges: ["premier-pas", "en-mouvement"] as const, serieJours: 6, misAJour: MAINTENANT.toISOString() };
    expect(apresEnvoi(envoi({ ajout: 40, badges: ["premier-pas"], serieJours: 1, maj: HIER }), 30, { ...compteVu, badges: [...compteVu.badges] })).toEqual(copie(apres));
  });

  it("garde la série du navigateur quand on a joué pendant l'envoi", () => {
    const pendant = { v: 1, aEnvoyer: 5, badges: [], serieJours: 2, maj: MAINTENANT.toISOString() };
    const c = { badges: [], serieJours: 7, misAJour: HIER };
    expect(copie(J.apresEnvoi(pendant, 5, c))).toEqual({ v: 1, aEnvoyer: 0, badges: [], serieJours: 2, maj: MAINTENANT.toISOString() });
    expect(apresEnvoi(envoi({ ajout: 5, serieJours: 2, maj: MAINTENANT.toISOString() }), 5, c)).toEqual({ v: 1, aEnvoyer: 0, badges: [], serieJours: 2, maj: MAINTENANT.toISOString() });
  });
});
