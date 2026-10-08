import { describe, expect, it } from "vitest";
import { ENTREE_EXEMPLE } from "./exemple";
import {
  ENTREE_SALARIE_EXEMPLE,
  RESULTAT_SALARIE_EXEMPLE,
  TERRAIN_SALARIE_EXEMPLE,
} from "./exempleSalarie";
import { validerEntree, type ErreurChamp } from "./entree";
import { LIBELLES_SALARIE, salaireVise } from "./libellesSalarie";
import {
  GRILLE_SALARIE,
  PROMPT_COMMUN,
  PROMPT_RESULTAT_SALARIE,
  VOIE_SALARIE,
  messageUtilisateur,
  promptCadrageSalarie,
  promptSysteme,
} from "./prompt";
import { PHRASE_SORTIE, qualiteSalarie } from "./qualiteSalarie";
import { SCHEMA_RESULTAT_SALARIE } from "./schemas";
import {
  besoinSur10,
  classerPatrons,
  correspondance,
  envieSur10,
  noteAffichee,
} from "./scoresSalarie";
import {
  voieDe,
  type NotesBesoin,
  type NotesEnvie,
  type ResultatSalarie,
} from "./types";
import { validerResultatSalarie } from "./validation";

const copie = <T>(v: T): T => structuredClone(v);
const champs = (e: ErreurChamp[]) => e.map((x) => `${x.champ}:${x.code}`);
const entreeSalarie = (terrain: Record<string, unknown> = {}) => ({
  ...copie(ENTREE_SALARIE_EXEMPLE),
  terrainSalarie: { ...copie(TERRAIN_SALARIE_EXEMPLE), ...terrain },
});

describe("voie et compatibilité", () => {
  it("une entrée V2b sans voie reste identique et vaut « independant »", () => {
    const r = validerEntree(ENTREE_EXEMPLE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect("voie" in r.entree).toBe(false);
    expect("terrainSalarie" in r.entree).toBe(false);
    expect(voieDe(r.entree)).toBe("independant");
  });

  it("voie « independant » explicite : même entrée qu'avant", () => {
    const r = validerEntree({ ...ENTREE_EXEMPLE, voie: "independant" });
    expect(r.ok && "voie" in r.entree).toBe(false);
  });

  it("voie inconnue : erreur", () => {
    const r = validerEntree({ ...ENTREE_EXEMPLE, voie: "patron" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(champs(r.erreurs)).toContain("voie:invalide");
  });

  it("voie salarié : le Terrain indépendant n'est plus obligatoire, le Terrain salarié l'est", () => {
    const r = validerEntree(ENTREE_SALARIE_EXEMPLE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entree.voie).toBe("salarie");
    expect(r.entree.terrainSalarie).toEqual(TERRAIN_SALARIE_EXEMPLE);
    const sans = validerEntree({
      ...ENTREE_SALARIE_EXEMPLE,
      terrainSalarie: undefined,
    });
    expect(sans.ok).toBe(false);
    if (!sans.ok)
      expect(champs(sans.erreurs)).toEqual(["terrainSalarie:requis"]);
  });
});

describe("validation du Terrain salarié", () => {
  it("situation, poste actuel, zone et manager idéal sont obligatoires", () => {
    const r = validerEntree(
      entreeSalarie({
        situation: "",
        posteActuel: " ",
        zone: "",
        manager: { mission: "", erreur: "", decider: "" },
      }),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(champs(r.erreurs)).toEqual([
      "terrainSalarie.situation:requis",
      "terrainSalarie.posteActuel:requis",
      "terrainSalarie.zone:requis",
      "terrainSalarie.manager:requis",
    ]);
  });

  it("une seule réponse sur le manager idéal suffit", () => {
    expect(
      validerEntree(
        entreeSalarie({
          manager: {
            mission: "",
            erreur: "il en parle franchement",
            decider: "",
          },
        }),
      ).ok,
    ).toBe(true);
  });

  it("valeurs : 3 au plus, dans la liste", () => {
    const trop = validerEntree(
      entreeSalarie({ valeurs: ["sens", "autonomie", "exigence", "equipe"] }),
    );
    expect(!trop.ok && champs(trop.erreurs)).toEqual([
      "terrainSalarie.valeurs:trop_long",
    ]);
    const inconnue = validerEntree(entreeSalarie({ valeurs: ["argent"] }));
    expect(!inconnue.ok && champs(inconnue.erreurs)).toEqual([
      "terrainSalarie.valeurs:invalide",
    ]);
  });

  it("contrats et tailles : doublons retirés, valeur inconnue refusée", () => {
    const r = validerEntree(
      entreeSalarie({
        contrats: ["cdi", "cdi", "cdd_mission"],
        tailles: ["pme", "pme"],
      }),
    );
    expect(r.ok && r.entree.terrainSalarie?.contrats).toEqual([
      "cdi",
      "cdd_mission",
    ]);
    expect(r.ok && r.entree.terrainSalarie?.tailles).toEqual(["pme"]);
    const faux = validerEntree(entreeSalarie({ contrats: ["freelance"] }));
    expect(!faux.ok && champs(faux.erreurs)).toEqual([
      "terrainSalarie.contrats:invalide",
    ]);
  });

  it("salaire : entiers positifs, maximum supérieur ou égal au minimum, vide permis", () => {
    expect(
      validerEntree(entreeSalarie({ salaireMin: null, salaireMax: null })).ok,
    ).toBe(true);
    const inverse = validerEntree(
      entreeSalarie({ salaireMin: 60_000, salaireMax: 40_000 }),
    );
    expect(!inverse.ok && champs(inverse.erreurs)).toEqual([
      "terrainSalarie.salaireMax:invalide",
    ]);
    const texte = validerEntree(entreeSalarie({ salaireMin: "45k" }));
    expect(!texte.ok && champs(texte.erreurs)).toEqual([
      "terrainSalarie.salaireMin:invalide",
    ]);
  });

  it("longueurs : poste actuel 120, autre valeur 40, ce qu'on ne veut plus vivre 300", () => {
    const r = validerEntree(
      entreeSalarie({
        posteActuel: "x".repeat(121),
        valeurAutre: "y".repeat(41),
        plusJamais: "z".repeat(301),
      }),
    );
    expect(!r.ok && champs(r.erreurs)).toEqual([
      "terrainSalarie.posteActuel:trop_long",
      "terrainSalarie.valeurAutre:trop_long",
      "terrainSalarie.plusJamais:trop_long",
    ]);
  });

  it("patrons en tête : 5 au plus, 80 caractères, doublons retirés ; ton par défaut tu et chaleureux", () => {
    const r = validerEntree(
      entreeSalarie({
        patronsEnTete: [
          "A1",
          "a1",
          "B2",
          "C3",
          "D4",
          "E5",
          "F6",
          "x".repeat(100),
        ],
        adresse: undefined,
        style: undefined,
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.entree.terrainSalarie?.patronsEnTete).toEqual([
      "A1",
      "B2",
      "C3",
      "D4",
      "E5",
    ]);
    expect(r.entree.terrainSalarie?.adresse).toBe("tu");
    expect(r.entree.terrainSalarie?.style).toBe("chaleureux");
  });
});

describe("double note", () => {
  const b = (
    urgence: number,
    rarete: number,
    paiement: number,
    acces: number,
  ) => ({ urgence, rarete, paiement, acces }) as NotesBesoin;
  const e = (
    management: number,
    valeurs: number,
    declencheur: number,
    cadre: number,
  ) => ({ management, valeurs, declencheur, cadre }) as NotesEnvie;

  it("moyenne × 2, au dixième, et correspondance = la plus basse", () => {
    expect(besoinSur10(b(5, 4, 4, 4))).toBe(8.5);
    expect(envieSur10(e(4, 4, 5, 4))).toBe(8.5);
    expect(besoinSur10(b(4, 3, 3, 3))).toBe(6.5);
    expect(correspondance(b(5, 5, 5, 5), e(2, 2, 2, 2))).toBe(4);
    expect(besoinSur10(b(1, 1, 1, 2))).toBe(2.5);
  });

  it("affichage avec une virgule", () => {
    expect(noteAffichee(7.5)).toBe("7,5");
    expect(noteAffichee(8)).toBe("8,0");
  });

  it("classement : correspondance, puis « tu as besoin de lui », puis « il a besoin de toi », puis identifiant", () => {
    const lignes = classerPatrons([
      { id: "c1", besoin: b(5, 5, 5, 5), envie: e(3, 3, 3, 3) },
      { id: "c2", besoin: b(3, 3, 3, 3), envie: e(5, 5, 5, 5) },
      { id: "c3", besoin: b(4, 4, 4, 4), envie: e(4, 4, 4, 4) },
    ]);
    expect(lignes.map((l) => [l.id, l.correspondance, l.rang])).toEqual([
      ["c3", 8, "prioritaire"],
      ["c2", 6, "secondaire"],
      ["c1", 6, "tertiaire"],
    ]);
  });

  it("le jeu d'essai donne une correspondance par patron", () => {
    const lignes = classerPatrons(RESULTAT_SALARIE_EXEMPLE.patrons);
    expect(
      lignes.map(
        (l) =>
          `${l.id} ${noteAffichee(l.besoin)} ${noteAffichee(l.envie)} ${noteAffichee(l.correspondance)}`,
      ),
    ).toEqual(["c1 8,5 8,5 8,5", "c2 7,5 9,0 7,5", "c3 8,0 6,5 6,5"]);
  });
});

describe("validation du résultat salarié", () => {
  it("le jeu d'essai est valide, sans réparation", () => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE), true);
    expect(v.ok ? [] : v.erreurs).toEqual([]);
    expect(v.reparations).toBe(0);
  });

  it("hors reconversion, le bloc reconversion devient null", () => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE), false);
    expect(v.ok && v.valeur.reconversion).toBeNull();
  });

  it("reconversion attendue mais vide : erreur qui relance", () => {
    const r = copie(RESULTAT_SALARIE_EXEMPLE) as unknown as Record<
      string,
      unknown
    >;
    r.reconversion = { transferables: [], premiereMarche: "", essais: [] };
    const v = validerResultatSalarie(r, true);
    expect(v.ok).toBe(false);
    if (!v.ok)
      expect(v.erreurs.join("\n")).toMatch(/reconversion\.transferables/);
  });

  it("exactement 3 patrons, notes entières de 1 à 5, questions terminées par ?, {{prenom}} dans l'email", () => {
    const r = copie(RESULTAT_SALARIE_EXEMPLE);
    r.patrons[0].besoin.urgence = 6 as never;
    r.patrons[1].questionsEntretien[0] =
      "Racontez-moi votre dernier recrutement.";
    r.patrons[2].pitchs.emailCorps = r.patrons[2].pitchs.emailCorps.replace(
      "{{prenom}}",
      "Claire",
    );
    const v = validerResultatSalarie(r, true);
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.erreurs).toEqual([
      "patrons[0].besoin.urgence : entre 1 et 5 attendu",
      "patrons[1].questionsEntretien[0] : doit se terminer par ?",
      "patrons[2].pitchs.emailCorps : doit contenir {{prenom}}",
    ]);
    const deux = copie(RESULTAT_SALARIE_EXEMPLE);
    deux.patrons.pop();
    const v2 = validerResultatSalarie(deux, true);
    expect(!v2.ok && v2.erreurs).toEqual([
      "patrons : exactement 3 éléments attendus",
    ]);
  });

  it("voie absente : réparée", () => {
    const r = copie(RESULTAT_SALARIE_EXEMPLE) as unknown as Record<
      string,
      unknown
    >;
    delete r.voie;
    const v = validerResultatSalarie(r, true);
    expect(v.ok && v.valeur.voie).toBe("salarie");
    expect(v.reparations).toBe(1);
  });

  it("le schéma couvre chaque champ du jeu d'essai", () => {
    const cles = (o: { properties?: Record<string, unknown> }) =>
      Object.keys(o.properties ?? {}).sort();
    expect(cles(SCHEMA_RESULTAT_SALARIE)).toEqual(
      Object.keys(RESULTAT_SALARIE_EXEMPLE).sort(),
    );
    const patron = (
      SCHEMA_RESULTAT_SALARIE.properties.patrons as {
        items: { properties: Record<string, unknown> };
      }
    ).items;
    expect(cles(patron)).toEqual(
      Object.keys(RESULTAT_SALARIE_EXEMPLE.patrons[0]).sort(),
    );
  });
});

describe("contrôles déterministes (qualiteSalarie)", () => {
  const ctx = { adresse: "vous" as const, aEviter: "" };
  const valide = (): ResultatSalarie => {
    const v = validerResultatSalarie(copie(RESULTAT_SALARIE_EXEMPLE), true);
    if (!v.ok) throw new Error(v.erreurs.join("\n"));
    return v.valeur;
  };

  it("le jeu d'essai passe sans erreur ni réparation", () => {
    const q = qualiteSalarie(valide(), ctx);
    expect(q.erreurs).toEqual([]);
    expect(q.reparations).toBe(0);
  });

  it("ajoute la phrase de sortie avant la signature, et retire les émojis de l'email", () => {
    const r = valide();
    r.patrons[0].pitchs.emailCorps =
      "Bonjour [Prénom],\n\nVotre deuxième site va doubler les commandes 🚀, et j'ai déjà tenu ce cap deux fois sans rupture de livraison chez les enseignes.\n\nAccepteriez-vous 15 minutes pour en parler ?\n\nBien à vous,\n\n{{prenom}}";
    const q = qualiteSalarie(r, ctx);
    expect(q.erreurs).toEqual([]);
    const corps = q.resultat.patrons[0].pitchs.emailCorps;
    expect(corps).not.toMatch(/🚀/);
    expect(
      corps.endsWith(`${PHRASE_SORTIE.vous}\n\nBien à vous,\n\n{{prenom}}`),
    ).toBe(true);
  });

  it("refuse le vocabulaire de la voie indépendant dans les patrons", () => {
    const r = valide();
    r.patrons[1].pourquoiToi =
      "Il a besoin d'une prestation de conseil en logistique au meilleur tarif pour remettre son entrepôt d'aplomb.";
    const q = qualiteSalarie(r, ctx);
    expect(q.erreurs).toEqual([
      "patrons[1] : « prestation » appartient à la voie indépendant. Parle d'employeur, de poste et de manager.",
    ]);
  });

  it("le mot « client » seul reste permis : un patron a ses clients", () => {
    const r = valide();
    r.patrons[0].douleur =
      "Ses clients de la grande distribution appliquent des pénalités à chaque retard de livraison.";
    expect(qualiteSalarie(r, ctx).erreurs).toEqual([]);
  });

  it("deux patrons trop proches (secteur, taille et moment identiques) : relance", () => {
    const r = valide();
    r.patrons[2].portrait = { ...r.patrons[0].portrait };
    expect(qualiteSalarie(r, ctx).erreurs).toEqual([
      "patrons : c1 et c3 se ressemblent trop. Change le secteur, la taille ou le moment de vie de l'entreprise.",
    ]);
  });

  it("pitch oral hors de 55 à 100 mots : relance", () => {
    const r = valide();
    r.patrons[0].pitchs.oral30s =
      "Je remets de l'ordre dans les flux qui débordent. Puis-je vous en parler quinze minutes autour d'un café la semaine prochaine, à Lyon ?";
    expect(qualiteSalarie(r, ctx).erreurs[0]).toMatch(
      /^patrons\[0\]\.pitchs\.oral30s : 70 à 85 mots attendus/,
    );
  });

  it("registre : tutoiement dans un message alors que le vouvoiement est demandé", () => {
    const r = valide();
    r.patrons[0].pitchs.messageLinkedin =
      "Merci pour la connexion, [Prénom]. Ton deuxième site va doubler les commandes, j'ai déjà tenu ce cap deux fois. On en parle 15 minutes ?";
    expect(qualiteSalarie(r, ctx).erreurs).toEqual([
      "patrons[0].pitchs : vouvoiement attendu dans les messages.",
    ]);
  });

  it("un patron qui ressemble à ce qu'on veut éviter : « Contexte Déclencheur » plafonné à 2", () => {
    const q = qualiteSalarie(valide(), {
      adresse: "vous",
      aEviter:
        "filiale d'un groupe national, réorganisation imposée par le siège",
    });
    const c3 = q.resultat.patrons.find((p) => p.id === "c3")!;
    expect(c3.envie.declencheur).toBe(2);
    expect(c3.valeurs.frotte).toMatch(/ce que tu veux éviter/);
    expect(q.reparations).toBeGreaterThan(0);
  });

  it("plan : au moins 2 actions par patron et une action commune", () => {
    const r = valide();
    for (const s of r.plan30)
      for (const a of s.actions) if (a.cible === "c3") a.cible = "c1";
    expect(qualiteSalarie(r, ctx).erreurs).toEqual([
      "plan30 : au moins 2 actions pour chaque patron (c1, c2, c3) et au moins une action commune (toutes).",
    ]);
  });

  it("question hypothétique du test terrain : remplacée", () => {
    const r = valide();
    r.testTerrain.questions[0] =
      "Si vous pouviez recruter demain, qui choisiriez-vous ?";
    const q = qualiteSalarie(r, ctx);
    expect(q.resultat.testTerrain.questions[0]).not.toMatch(/si vous pouviez/i);
    expect(q.reparations).toBe(1);
  });

  it("années retirées des recherches", () => {
    const r = valide();
    r.patrons[0].lieux[1].recherche = "salon agroalimentaire Lyon 2027";
    expect(qualiteSalarie(r, ctx).resultat.patrons[0].lieux[1].recherche).toBe(
      "salon agroalimentaire Lyon",
    );
  });
});

describe("prompts de la voie salarié", () => {
  it("la règle commune 15 et la grille salarié", () => {
    expect(PROMPT_COMMUN).toContain(
      "15. Voie salarié : tu parles d'employeurs et de managers, jamais de clients ni de prix de prestation.",
    );
    for (const cle of [
      "urgence",
      "rarete",
      "paiement",
      "acces",
      "management",
      "valeurs",
      "declencheur",
      "cadre",
    ])
      expect(GRILLE_SALARIE).toContain(`${cle} (`);
  });

  it("le système salarié assemble commun, voie, grille et tâche ; l'indépendant ne change pas", () => {
    const s = promptSysteme("resultat", undefined, undefined, "salarie");
    expect(s).toContain(VOIE_SALARIE);
    expect(s).toContain(GRILLE_SALARIE);
    expect(s).toContain(PROMPT_RESULTAT_SALARIE);
    expect(s).toContain("11. Langue");
    expect(promptSysteme("resultat")).not.toContain(GRILLE_SALARIE);
    expect(promptSysteme("cadrage", 2, undefined, "salarie")).toContain(
      "il est interdit de poser des questions",
    );
    expect(promptCadrageSalarie(3)).toContain(
      "garde tels quels les patrons marqués « oui »",
    );
  });

  it("les données envoyées : terrain salarié avec libellés, patrons en tête comme idées, pas de terrain indépendant", () => {
    const msg = messageUtilisateur({
      etape: "cadrage",
      tour: 1,
      entree: ENTREE_SALARIE_EXEMPLE,
    });
    const json = JSON.parse(
      msg.slice(msg.indexOf("<donnees>\n") + 10, msg.lastIndexOf("</donnees>")),
    );
    expect(json.voie).toBe("salarie");
    expect(json.terrain).toBeUndefined();
    expect(json.terrain_salarie.situation).toBe("Je change de métier");
    expect(json.terrain_salarie.salaire_vise).toBe(
      "48 000 à 58 000 euros brut par an",
    );
    expect(json.terrain_salarie.valeurs_non_negociables).toEqual([
      "Autonomie",
      "Transparence",
      "Impact sur le terrain",
    ]);
    expect(json.terrain_salarie.reconversion.metier_vise).toMatch(
      /économie circulaire/,
    );
    expect(json.idees_de_cibles).toEqual([
      { id: "i1", texte: "Une ressourcerie qui grandit" },
      { id: "i2", texte: "Les entrepôts de la grande distribution" },
    ]);
  });

  it("salaire visé : fourchette, minimum seul, maximum seul, rien", () => {
    expect(salaireVise(45_000, 45_000)).toBe("45 000 euros brut par an");
    expect(salaireVise(45_000, null)).toBe(
      "à partir de 45 000 euros brut par an",
    );
    expect(salaireVise(null, 60_000)).toBe("jusqu'à 60 000 euros brut par an");
    expect(salaireVise(null, null)).toBe("");
  });

  it("aucun tiret long dans les prompts, les libellés et le jeu d'essai", () => {
    const tout = [
      PROMPT_COMMUN,
      VOIE_SALARIE,
      GRILLE_SALARIE,
      promptCadrageSalarie(1),
      promptCadrageSalarie(3),
      PROMPT_RESULTAT_SALARIE,
      JSON.stringify(LIBELLES_SALARIE),
      JSON.stringify(RESULTAT_SALARIE_EXEMPLE),
    ].join("\n");
    expect(tout).not.toMatch(/[\u2013\u2014]/);
  });
});
