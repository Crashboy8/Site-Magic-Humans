import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ENTREE_EXEMPLE, RESULTAT_EXEMPLE } from "@/domain/maCible/exemple";
import { CIBLE_PISTE_EXEMPLE, PISTES_EXEMPLE, PORTRAIT_EXEMPLE } from "@/domain/maCible/exempleApprofondir";
import { changerTexte, planDepuisResultat } from "@/domain/maCible/planEdite";
import { classerCibles } from "@/domain/maCible/scores";
import type { Extras, SyntheseTerrain } from "@/domain/maCible/types";
import { maCible } from "@/i18n/messages/maCible";
import { etatInitial } from "./etat";
import { exporterResultat, markdownPartie, markdownPartieCible, pourMonIA, type PartieCopiable, type PartieResultat } from "./export";
import { Plan30 } from "./Plan30";
import { Resultat } from "./Resultat";

const TIRETS_LONGS = /[\u2013\u2014]/;
const synthese: SyntheseTerrain = {
  resume: "Les directeurs parlent surtout de clans et de départs.",
  profils: ["Directeurs de site"],
  douleurs: [{ texte: "Deux clans dans l'équipe", frequence: "souvent" }],
  verbatims: [{ id: "v1", note: "n1", citation: "On ne se parle plus entre les deux ateliers", theme: "douleur" }],
  declencheurs: ["Un départ"],
  objections: ["Le prix"],
  motsCles: ["clans"],
  nbNotes: 1,
  faitLe: "2026-10-10T10:00:00Z",
};
const resultat = {
  ...RESULTAT_EXEMPLE,
  cibles: RESULTAT_EXEMPLE.cibles.map((c, i) => (i === 0 ? { ...c, verbatims: ["v1"] } : c)),
  autresPistes: PISTES_EXEMPLE,
  classement: classerCibles(RESULTAT_EXEMPLE.cibles),
} as typeof RESULTAT_EXEMPLE & { classement: ReturnType<typeof classerCibles> };
const cible = resultat.cibles[0];
const extras: Extras = {
  portraits: { c1: PORTRAIT_EXEMPLE },
  pistes: { p2: { cible: CIBLE_PISTE_EXEMPLE, ligne: { id: "c4" as const, score: 8.5, alertePlaisir: false } } },
} as Extras;
const options = { synthese, extras };

describe("copier une partie d'une cible en Markdown", () => {
  const partie = (p: PartieCopiable, portrait = extras.portraits.c1) => markdownPartieCible(cible, "Camille", p, { portrait, synthese });

  it("chaque partie commence par le nom de la cible, puis son propre titre", () => {
    for (const p of ["offre", "lieux", "linkedin", "messages", "test", "clients", "portrait"] as const) {
      const md = partie(p);
      expect(md.startsWith(`## Cible\n${cible.nom}\n\n### `), p).toBe(true);
      expect(md).not.toContain("{{prenom}}");
      expect(md).not.toMatch(/[\u00a0\u202f]/);
    }
  });

  it("garde le bon contenu, et seulement lui", () => {
    const offre = partie("offre");
    expect(offre).toContain("### Ta promesse");
    expect(offre).toContain("### Ton offre pour elle");
    expect(offre).toContain(cible.offre.nom);
    expect(offre).toContain("Prix indicatif");
    expect(offre).not.toContain("### Messages");

    const lieux = partie("lieux");
    expect(lieux).toContain("### Où la rencontrer");
    expect(lieux).toContain(cible.lieux[0].type);
    expect(lieux).toContain(cible.canaux[0].action.replace("{{prenom}}", "Camille"));
    expect(lieux).not.toContain(cible.offre.nom);

    expect(partie("messages")).toContain("Message LinkedIn");
    expect(partie("test")).toContain(`1. ${cible.testTerrain.questions[0].replace("{{prenom}}", "Camille")}`);
    expect(partie("clients")).toContain("On ne se parle plus entre les deux ateliers");
    expect(partie("portrait")).toContain("#### ");
    expect(partie("portrait")).toContain(PORTRAIT_EXEMPLE.prenom);
  });

  it("rien à copier quand la partie n'existe pas", () => {
    expect(markdownPartieCible(cible, "Camille", "portrait", {})).toBe("");
    expect(markdownPartieCible(resultat.cibles[1], "Camille", "clients", { synthese })).toBe("");
  });
});

describe("copier une grande partie du résultat", () => {
  const { markdown } = exporterResultat(resultat, "Camille", options);
  const partie = (p: PartieResultat) => markdownPartie(resultat, "Camille", p, options);

  it("chaque partie est un morceau exact de l'export complet", () => {
    for (const p of ["offre", "notes", "pistes", "creusees", "anti", "plan", "hypotheses", "mot"] as const) {
      const md = partie(p);
      expect(md.length, p).toBeGreaterThan(0);
      expect(markdown).toContain(md);
    }
  });

  it("titres et contenus attendus", () => {
    expect(partie("offre").startsWith("# Ton offre\n")).toBe(true);
    expect(partie("notes")).toContain("## Ce que disent tes notes");
    expect(partie("pistes")).toContain("## D'autres pistes");
    expect(partie("creusees")).toContain(CIBLE_PISTE_EXEMPLE.nom);
    expect(partie("anti")).toContain("## Anti-cible");
    const plan = partie("plan");
    expect(plan).toContain("## Plan 30 jours");
    expect(plan).toContain("### Semaine 1 : ");
    expect(plan).toContain(`- ${resultat.plan30[0].actions[0].texte.replace("{{prenom}}", "Camille")}`);
    expect(partie("mot")).toContain(resultat.motPourToi.slice(0, 20));
  });

  it("une partie absente reste vide", () => {
    const sans = { ...resultat, autresPistes: [], hypotheses: [] };
    expect(markdownPartie(sans, "Camille", "pistes")).toBe("");
    expect(markdownPartie(sans, "Camille", "hypotheses")).toBe("");
    expect(markdownPartie(sans, "Camille", "notes")).toBe("");
    expect(markdownPartie(sans, "Camille", "creusees")).toBe("");
  });
});

describe("Copier pour mon IA", () => {
  it("met une courte consigne avant le résultat complet, en français", () => {
    const { markdown } = exporterResultat(resultat, "Camille", options);
    const texte = pourMonIA(markdown, maCible.fr);
    expect(texte.startsWith("Voici mon résultat du Cibleur Magic Humans.")).toBe(true);
    expect(texte).toContain("Aide-moi à");
    expect(texte).toContain("\n\n---\n\n# Ton offre");
    expect(texte.endsWith(markdown)).toBe(true);
    expect(texte).not.toMatch(TIRETS_LONGS);
    expect(texte).not.toMatch(/[\u00a0\u202f]/);
  });

  it("en anglais, consigne anglaise et chiffres en chiffres", () => {
    const { markdown } = exporterResultat(resultat, "Camille", { ...options, M: maCible.en });
    const texte = pourMonIA(markdown, maCible.en);
    expect(texte.startsWith("Here is my result from the Magic Humans Targeter.")).toBe(true);
    expect(texte).toContain("a 30-day plan");
    expect(texte).toContain("Help me");
    expect(texte).not.toMatch(TIRETS_LONGS);
  });

  it("l'introduction pour l'IA est en espagnol", () => {
    expect(maCible.es.export.introIA).toContain("El Buscador de Clientes");
    expect(maCible.es.export.introIA).not.toBe(maCible.fr.export.introIA);
  });
});

describe("boutons d'export sur la page de résultat", () => {
  const rendre = (M = maCible.fr) =>
    renderToStaticMarkup(
      createElement(Resultat, {
        resultat,
        fait: "2026-10-09T08:00:00Z",
        etat: etatInitial(),
        prenom: "Camille",
        coches: [],
        plan: null,
        resultatLe: "2026-10-09T08:00:00Z",
        locale: "fr",
        M,
        nbHistorique: 0,
        synthese,
        entree: ENTREE_EXEMPLE,
        extras,
        onCoche: () => {},
        onPlan: () => {},
        onPlanOrigine: () => {},
        onModifier: () => {},
        onEffacer: () => {},
        onAller: () => {},
        onHistorique: () => {},
      }),
    );

  it("PDF et « Copier pour mon IA » en haut et en bas", () => {
    const html = rendre();
    expect(html.match(/data-pdf="haut"/g)).toHaveLength(1);
    expect(html.match(/data-pdf="bas"/g)).toHaveLength(1);
    expect(html.match(/data-copier-ia=""/g)).toHaveLength(2);
    expect(html).toContain("Télécharger en PDF");
    expect(html).toContain("Copier pour mon IA");
  });

  it("une icône « Copier » sur chaque grande partie, et rien de tout ça à l'impression", () => {
    const html = rendre().replace(/[\u00a0\u202f]/g, " ");
    const icones = html.match(/data-copier-partie=""/g) ?? [];
    // offre, 3 cibles, l'offre de chaque cible, pistes, piste creusée (titre + carte + offre), anti-cible, plan, hypothèses, mot
    expect(icones.length).toBeGreaterThanOrEqual(12);
    for (const titre of [`Copier « ${maCible.fr.resultat.offreTitre.replace(/[\u00a0\u202f]/g, " ")} » en Markdown`, `Copier « ${cible.nom} » en Markdown`, `Copier « ${maCible.fr.plan.titre.replace(/[\u00a0\u202f]/g, " ")} » en Markdown`]) {
      expect(html).toContain(titre.replace(/'/g, "&#x27;"));
    }
    expect(html).toMatch(/<span data-ecran-seul="[^"]*" data-copier-partie=""/);
  });

  it("en anglais", () => {
    const html = rendre(maCible.en);
    expect(html).toContain("Download as PDF");
    expect(html).toContain("Copy for my AI");
    expect(html).toContain("as Markdown");
  });
});

describe("plan modifié dans les exports et à l'écran", () => {
  const T = new Date("2026-10-10T10:00:00Z");
  const base = planDepuisResultat(resultat, [], { titreSemaine: (n, t) => `Semaine ${n} : ${t}` }, "2026-10-09T08:00:00Z", T);
  const plan = changerTexte(changerTexte(base, "s0", "🎯 **Mon départ**", T), "a0", "Appeler *trois* anciens collègues", T);

  it("le plan modifié remplace celui de l'IA dans le Markdown, la partie « plan » et « Copier pour mon IA »", () => {
    const { markdown, texte } = exporterResultat(resultat, "Camille", { ...options, plan });
    expect(markdown).toContain("### 🎯 **Mon départ**");
    expect(markdown).toContain("- Appeler *trois* anciens collègues");
    expect(markdown).not.toContain(`### Semaine 1 : ${resultat.plan30[0].titre}`);
    expect(texte).toContain("🎯 MON DÉPART");
    expect(texte).toContain("- Appeler trois anciens collègues");
    expect(markdownPartie(resultat, "Camille", "plan", { ...options, plan })).toContain("- Appeler *trois* anciens collègues");
    expect(pourMonIA(markdown)).toContain("- Appeler *trois* anciens collègues");
  });
  it("sans plan modifié, l'export reste celui de l'IA", () => {
    expect(exporterResultat(resultat, "Camille", options).markdown).toContain(`### Semaine 1 : ${resultat.plan30[0].titre}`);
  });
  it("à l'écran, le gras et l'émoji s'affichent, et le HTML saisi reste du texte", () => {
    const piege = changerTexte(plan, "a1", '<img src=x onerror="alert(1)"> **<b>gras</b>**', T);
    const html = renderToStaticMarkup(
      createElement(Plan30, { resultat, coches: [], onCoche: () => {}, plan: piege, resultatLe: "2026-10-09T08:00:00Z", onPlan: () => {}, onPlanOrigine: () => {}, M: maCible.fr }),
    );
    expect(html).toContain("<strong>Mon départ</strong>");
    expect(html).toContain("🎯");
    expect(html).toContain("<em>trois</em>");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;img src=x onerror=");
    expect(html).toContain("Revenir à la proposition de l&#x27;IA");
  });
  it("sans plan modifié, pas de bouton de retour à la proposition de l'IA", () => {
    const html = renderToStaticMarkup(
      createElement(Plan30, { resultat, coches: [], onCoche: () => {}, plan: null, resultatLe: null, onPlan: () => {}, onPlanOrigine: () => {}, M: maCible.fr }),
    );
    expect(html).not.toContain("Revenir à la proposition");
    expect(html.replace(/[\u00a0\u202f]/g, " ")).toContain("0 action faite sur 12");
  });
});
