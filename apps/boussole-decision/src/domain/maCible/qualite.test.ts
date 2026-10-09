import { describe, expect, it } from "vitest";
import { ENTREE_EXEMPLE, RESULTAT_EXEMPLE } from "./exemple";
import { CIBLE_PISTE_EXEMPLE, PORTRAIT_EXEMPLE } from "./exempleApprofondir";
import { filtrerVerbatimsCibles, filtrerVerbatimsPortrait } from "./idees";
import { appliquerQualite, qualiteCible, qualitePortrait, contradictionFormatTalent, phrasesDepartage, questionsManquantes, type ContexteQualite } from "./qualite";
import { classerCibles } from "./scores";
import type { Cadrage, Resultat } from "./types";

const copie = () => structuredClone(RESULTAT_EXEMPLE) as Resultat;

function ctx(extra: Partial<ContexteQualite> = {}): ContexteQualite {
  const { talent, terrain } = ENTREE_EXEMPLE;
  return {
    antiContexte: talent.antiContexte,
    reseau: [terrain.experience, terrain.clientsPasses, talent.reussite].join("\n"),
    idee: "",
    marche: terrain.marche,
    prixActuel: terrain.prixActuel,
    adresse: terrain.adresse,
    formats: terrain.formats,
    talent: `${talent.mecanisme}\n${talent.contexte}`,
    ...extra,
  };
}

const esquisse = (statut: Cadrage["statut"]): Cadrage => ({
  statut,
  message: "",
  questions: [],
  esquisse: { offre: "x".repeat(20), cibles: [], antiCible: "y".repeat(20), hypotheses: [], autresPistes: [] },
});

describe("appliquerQualite", () => {
  it("laisse l'exemple intact", () => {
    const q = appliquerQualite(copie(), ctx());
    expect(q.erreurs).toEqual([]);
    expect(q.reparations).toBe(0);
    expect(q.resultat.cibles[0].scores.plaisir.note).toBe(5);
    expect(q.resultat.cibles[0].messages.emailCorps).toContain("{{prenom}}");
  });

  it("plafonne le plaisir à 2 quand la cible reprend l'anti-contexte", () => {
    const r = copie();
    r.cibles[1].portrait = "Directeur dans des organisations très hiérarchiques, avec des missions sans contact humain et des validations à répétition. Le déclic arrive après un audit.";
    r.cibles[1].scores.plaisir.note = 5;
    const q = appliquerQualite(r, ctx());
    expect(q.erreurs).toEqual([]);
    expect(q.resultat.cibles[1].scores.plaisir.note).toBe(2);
    expect(q.resultat.cibles[1].scores.plaisir.raison).toContain("Anti-Contexte");
    expect(classerCibles(q.resultat.cibles).find((l) => l.id === "c2")?.alertePlaisir).toBe(true);
  });

  it("place l'idée de la personne dans les hypothèses si aucune cible ne la reprend", () => {
    const idee = "les associés fondateurs qui ne s'entendent plus";
    const q = appliquerQualite(copie(), ctx({ idee }));
    expect(q.erreurs).toEqual([]);
    expect(q.resultat.hypotheses.some((h) => h.includes("associés fondateurs") && h.includes("pas reprise comme cible"))).toBe(true);
  });

  it("ne répète pas l'idée si une cible la contient déjà", () => {
    const r = copie();
    r.cibles[1].nom = "Associés fondateurs qui ne s'entendent plus";
    const q = appliquerQualite(r, ctx({ idee: "les associés fondateurs qui ne s'entendent plus" }));
    expect(q.resultat.hypotheses.some((h) => h.includes("pas reprise comme cible"))).toBe(false);
  });

  it("refuse un prix qui recopie le tarif actuel sans parler de valeur", () => {
    const r = copie();
    r.cibles[0].prix = { ...r.cibles[0].prix, min: 600, max: 600, justification: "C'est exactement ton tarif actuel, inchangé." };
    const q = appliquerQualite(r, ctx());
    expect(q.erreurs.some((e) => e.includes("recopie le prix actuel"))).toBe(true);
  });

  it("accepte un prix différent justifié par la valeur", () => {
    const q = appliquerQualite(copie(), ctx());
    expect(q.erreurs.some((e) => e.includes("prix"))).toBe(false);
  });

  it("exige deux actions par cible et une action commune", () => {
    const r = copie();
    for (const semaine of r.plan30) for (const action of semaine.actions) action.cible = "c1";
    const q = appliquerQualite(r, ctx());
    expect(q.erreurs.some((e) => e.includes("plan30"))).toBe(true);
  });

  it("ramène l'accès 5 à 4 hors du réseau proche", () => {
    const r = copie();
    r.cibles[2].nom = "Particuliers qui veulent écrire un roman";
    r.cibles[2].portrait = "Personne qui souhaite publier un roman et cherche un accompagnement long, sans lien avec un ancien métier ni un secteur déjà connu.";
    r.cibles[2].pourquoi = "Un public large, joignable seulement par des annonces, sans relation déjà établie dans le réseau.";
    r.cibles[2].scores.acces = { note: 5, raison: "Des publications en ligne suffisent pour les trouver chaque semaine, sans contact direct." };
    const q = appliquerQualite(r, ctx());
    expect(q.resultat.cibles[2].scores.acces.note).toBe(4);
    expect(q.resultat.cibles[0].scores.acces.note).toBe(5);
  });

  it("répare une question hypothétique du Mom Test", () => {
    const r = copie();
    r.cibles[0].testTerrain.questions[0] = "Si vous pouviez changer une chose dans votre site, que feriez-vous ?";
    r.cibles[0].testTerrain.questions[1] = "Que pensez-vous de faire appel à un intervenant extérieur ?";
    const q = appliquerQualite(r, ctx());
    expect(q.erreurs).toEqual([]);
    expect(q.resultat.cibles[0].testTerrain.questions[0]).toContain("qu'avez-vous fait");
    expect(q.resultat.cibles[0].testTerrain.questions[1].toLowerCase()).not.toContain("pensez-vous");
    expect(q.resultat.cibles[0].testTerrain.questions[0]).not.toMatch(/si vous pouviez/i);
  });

  it("aligne la promesse sur un format à plusieurs séances", () => {
    const r = copie();
    r.cibles[2].promesse = "En une séance, vous savez mener les conversations difficiles avec votre équipe.";
    const q = appliquerQualite(r, ctx());
    expect(q.resultat.cibles[2].promesse.toLowerCase()).not.toContain("en une séance");
    expect(q.resultat.cibles[2].promesse).toContain("sur la durée du parcours");
  });

  it("retire {{prenom}} hors signature et garde le jeton dans l'email", () => {
    const r = copie();
    r.cibles[0].pitch = `${r.cibles[0].pitch.slice(0, 80)} Signé {{ prénom }} pour cette cible précise, sans autre ajout.`;
    const q = appliquerQualite(r, ctx());
    expect(q.resultat.cibles[0].pitch.toLowerCase()).not.toContain("prenom");
    expect(q.resultat.cibles[0].pitch.toLowerCase()).not.toContain("prénom");
    expect(q.resultat.cibles[0].messages.emailCorps).toContain("{{prenom}}");
  });

  it("signale un tutoiement quand le vouvoiement est attendu", () => {
    const r = copie();
    r.cibles[0].messages.linkedin = "Bonjour, tu pourrais me dire comment ton équipe vit les tensions en ce moment sur le site ?";
    const q = appliquerQualite(r, ctx({ adresse: "vous" }));
    expect(q.erreurs.some((e) => e.includes("vouvoiement attendu"))).toBe(true);
  });

  it("ajoute une raison si le marché « je ne sais pas » ne mélange pas B2B et B2C", () => {
    const r = copie();
    r.cibles.forEach((c) => (c.marche = "b2b"));
    r.hypotheses = ["J'ai supposé que tu te déplaces."];
    const q = appliquerQualite(r, ctx({ marche: "je_ne_sais_pas" }));
    expect(q.resultat.hypotheses.some((h) => h.includes("marché n'était pas tranché"))).toBe(true);
  });
});

describe("questions de cadrage", () => {
  it("détecte un format de groupe face à un talent individuel", () => {
    const talent = "accompagnement individuel en face a face";
    expect(contradictionFormatTalent({ formats: ["groupe"], talent })).toBe(true);
    expect(contradictionFormatTalent({ formats: ["groupe", "individuel"], talent })).toBe(false);
    expect(questionsManquantes(esquisse("esquisse"), 1, { formats: ["groupe"], talent })).toContain("questions attendues");
    expect(questionsManquantes(esquisse("esquisse"), 2, { formats: ["groupe"], talent })).toBeNull();
    expect(questionsManquantes(esquisse("questions"), 1, { formats: ["groupe"], talent })).toBeNull();
  });
});

describe("départage des scores", () => {
  it("explique l'égalité d'un dixième", () => {
    const cibles = [
      { id: "c1" as const, nom: "Alpha" },
      { id: "c2" as const, nom: "Beta" },
      { id: "c3" as const, nom: "Gamma" },
    ];
    const lignes = classerCibles([
      { id: "c1", scores: RESULTAT_EXEMPLE.cibles[2].scores },
      { id: "c2", scores: RESULTAT_EXEMPLE.cibles[2].scores },
      { id: "c3", scores: RESULTAT_EXEMPLE.cibles[2].scores },
    ]);
    const phrases = phrasesDepartage(cibles, lignes);
    expect(phrases.length).toBeGreaterThan(0);
    expect(phrases[0]).toContain("avaient le même score");
    expect(phrases[0]).not.toMatch(/[\u2013\u2014]/);
  });
});

describe("qualitePortrait (§9.6)", () => {
  const base = structuredClone(PORTRAIT_EXEMPLE);
  base.douleurs[0].sesMots = "« J'ai l'impression de diriger deux usines »";
  base.lieux[0].recherche = "salon agroalimentaire Rennes 2026";

  it("retire les guillemets de sesMots et l'année de recherche", () => {
    const r = qualitePortrait(base, "");
    expect(r.portrait.douleurs[0].sesMots).toBe("J'ai l'impression de diriger deux usines");
    expect(r.portrait.lieux[0].recherche).toBe("salon agroalimentaire Rennes");
    expect(r.reparations).toBe(2);
  });

  it("remplace un prénom présent dans les données par le premier prénom libre", () => {
    expect(qualitePortrait(base, "Mon ancienne cliente Claire, et Nadia aussi").portrait.prenom).toBe("Julien");
    expect(qualitePortrait(base, "Une cliente, Clairette").portrait.prenom).toBe("Claire");
    expect(qualitePortrait(base, "CLAIRE").portrait.prenom).toBe("Nadia");
  });
});

describe("filtres des phrases de clients (§9.4)", () => {
  const synthese = { verbatims: [{ id: "v1" }, { id: "v2" }] };
  it("filtrerVerbatimsCibles retire v9 inexistant", () => {
    const r = filtrerVerbatimsCibles({ cibles: [{ verbatims: ["v1", "v9"] }] }, synthese);
    expect(r.sortie.cibles[0].verbatims).toEqual(["v1"]);
    expect(r.retires).toBe(1);
  });
  it("filtrerVerbatimsPortrait vide un identifiant inconnu", () => {
    const p = structuredClone(PORTRAIT_EXEMPLE);
    p.douleurs[0].verbatim = "v2";
    p.douleurs[1].verbatim = "v9";
    const r = filtrerVerbatimsPortrait(p, synthese);
    expect(r.sortie.douleurs.map((d) => d.verbatim)).toEqual(["v2", "", ""]);
    expect(r.retires).toBe(1);
    expect(filtrerVerbatimsPortrait(p, null).sortie.douleurs[0].verbatim).toBe("");
  });
});

describe("qualiteCible (piste creusée)", () => {
  it("applique les contrôles par cible, comme pour le résultat", () => {
    const c = structuredClone(CIBLE_PISTE_EXEMPLE);
    c.messages.linkedin = `{{prenom}} ${c.messages.linkedin}`;
    const r = qualiteCible(c, ctx());
    expect(r.cible.messages.linkedin.startsWith("{{prenom}}")).toBe(false);
    expect(r.reparations).toBeGreaterThan(0);
  });
});
