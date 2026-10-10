import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { textesParcours } from "@/i18n/messages/parcours";
import { ACTIONS_CRITERES } from "./actionsCriteres";
import { contenuParcours } from "./contenu";
import type { ParcoursBrut } from "./types";

const brut = JSON.parse(readFileSync(join(__dirname, "parcours.json"), "utf8")) as ParcoursBrut & Record<string, unknown>;
const data = contenuParcours("fr");

function chaines(v: unknown, chemin = ""): { chemin: string; texte: string }[] {
  if (typeof v === "string") return [{ chemin, texte: v }];
  if (Array.isArray(v)) return v.flatMap((x, i) => chaines(x, `${chemin}[${i}]`));
  if (typeof v === "object" && v !== null) return Object.entries(v).flatMap(([k, x]) => chaines(x, chemin ? `${chemin}.${k}` : k));
  return [];
}

describe("parcours.json dans le site", () => {
  it("ne contient pas les exemples internes (données d'un accompagné, à ne pas diffuser)", () => {
    expect(brut).not.toHaveProperty("exemples_internes");
  });

  it("ne cite l'accompagné des exemples internes dans aucun champ, même dans les notes de travail (le dépôt est public)", () => {
    expect(chaines(brut).filter(({ texte }) => /Alexis/.test(texte))).toEqual([]);
  });

  it("ne contient pas non plus les trous connus, les sources ni le statut de travail", () => {
    for (const cle of ["trous_connus", "sources", "statut"]) expect(brut, cle).not.toHaveProperty(cle);
  });

  it("ne cite ni Lukas (accompagné, données privées) ni la vidéo de l'échelle, qui n'existe pas encore", () => {
    const interdits = [/Lukas/, /Barcelon/, /vid[ée]o de l'[ée]chelle/i, /Video-Echelle/i, /repris de la vid[ée]o/i];
    const textes = [...chaines(brut), ...chaines(data), ...chaines(textesParcours("fr"))];
    for (const motif of interdits) expect(textes.filter(({ texte }) => motif.test(texte)), String(motif)).toEqual([]);
  });

  it("garde la version 3.3 et sa structure", () => {
    expect(brut.version).toMatch(/^3\.3/);
    expect(brut.question_voie.choix).toHaveLength(7);
    expect(brut.voies.map((v) => v.id)).toEqual(["A", "B", "C", "D", "E", "K"]);
    expect(brut.etapes).toHaveLength(23);
    expect(brut.outils).toHaveLength(10);
    for (const o of brut.outils) expect(o.url, o.id).toMatch(/^https:\/\//);
    expect(brut.regle_position.reponses).toEqual({ oui: 2, en_partie: 1, pas_encore: 0 });
    expect(brut.regle_position.seuil_pourcentage).toBe(75);
  });
});

describe("contenu public envoyé au navigateur", () => {
  const tout = chaines(data);

  it("n'emporte aucune note de travail ni aucune donnée d'accompagné", () => {
    const interdits = [/Alexis/, /ne_pas_diffuser/, /exemples_internes/, /trous_connus/, /workspace/i, /webinaire/i, /\bdeck\b/i, /Source\s*:/, /Précisé par/, /[Pp]roposition/, /à valider/, /[Ss]tatut/];
    const fuites = tout.filter(({ texte }) => interdits.some((m) => m.test(texte))).map(({ chemin, texte }) => `${chemin} : ${texte.slice(0, 80)}`);
    expect(fuites).toEqual([]);
  });

  it("n'a aucun tiret long et pose les espaces insécables", () => {
    expect(tout.filter(({ texte }) => /[–—]/.test(texte))).toEqual([]);
    expect(tout.filter(({ texte }) => /\d [\p{L}€%]/u.test(texte) || / [:;?!»]/.test(texte))).toEqual([]);
  });

  it("garde les 22 étapes des voies (sans le module Argent) et les 7 choix de voie", () => {
    expect(Object.keys(data.etapes)).toHaveLength(22);
    expect(data.etapes.argent).toBeUndefined();
    expect(data.questionVoie.choix.map((c) => c.voie)).toEqual(["A", "B", "C", "D", "E", "K", "inconnue"]);
  });

  it("relie chaque voie à des étapes qui existent", () => {
    for (const voie of Object.values(data.voies)) {
      const ids = [...voie.etapes, ...(voie.paralleles ? [...voie.paralleles.entrepreneur, ...voie.paralleles.salarie, voie.paralleles.fin] : [])];
      for (const id of ids) expect(data.etapes[id], `${voie.id} : ${id}`).toBeDefined();
    }
  });

  it("nomme chaque critère d'après son étape", () => {
    for (const etape of Object.values(data.etapes)) {
      for (const c of etape.criteres) expect(c.id.startsWith(`${etape.id}.`), c.id).toBe(true);
    }
  });

  it("voie E : pour un freelance qui cherche un poste, « Tes missions en cours » remplace le contrat de travail", () => {
    const E = data.voies.E;
    expect(E.pointsAttention.map((p) => p.id)).toEqual(["temps", "energie", "positionnement", "contrat"]);
    expect(E.pointsAttentionFreelance.map((p) => p.id)).toEqual(["temps", "energie", "positionnement", "missions"]);
    expect(E.pointsAttentionFreelance[3]).toEqual({ id: "missions", nom: "Tes missions en cours", texte: "Garde du temps pour ta recherche." });
    expect(E.pointsAttentionFreelance.slice(0, 3)).toEqual(E.pointsAttention.slice(0, 3));
    // Les autres voies n'ont pas de variante : les deux listes sont les mêmes.
    for (const v of Object.values(data.voies).filter((x) => x.id !== "E")) expect(v.pointsAttentionFreelance, v.id).toEqual(v.pointsAttention);
  });

  it("toutes les voies finissent par Ton Ikigai", () => {
    for (const voie of Object.values(data.voies)) {
      const fin = voie.paralleles ? voie.paralleles.fin : voie.etapes[voie.etapes.length - 1];
      expect(fin, voie.id).toBe("ikigai");
    }
  });

  it("donne un bouton aux actions qui ont un outil, jamais vers le Cibleur salarié en construction", () => {
    const actions = [...Object.values(data.etapes).flatMap((e) => e.actions), ...data.argent.actions];
    const parId = new Map(brut.etapes.flatMap((e) => e.actions).map((a) => [a.id, a]));
    for (const a of actions) {
      const source = parId.get(a.id);
      if (source?.outil && source.outil !== "cibleur_salarie") expect(a.lien, a.id).not.toBeNull();
      if (a.lien) expect(a.lien.url, a.id).toMatch(/^https:\/\/(www\.magichumans\.com|calendly\.com)\//);
      expect(a.lien?.url ?? "", a.id).not.toContain("voie=salarie");
    }
    expect(data.etapes.connaitre.actions[2].lien?.url).toBe("https://calendly.com/pierre-j-sarazin");
  });

  it("ne met aucun lien d'outil dans le module Argent (en séance avec Pierre)", () => {
    expect(data.argent.actions.every((a) => a.lien === null)).toBe(true);
    expect(data.argent.seances.map((s) => s.id)).toEqual(["rebond", "pivot", "seance_argent"]);
    expect(data.argent.seuil).toBe(3);
    expect([data.argent.min, data.argent.max]).toEqual([1, 5]);
  });

  it("table des actions : chaque action et chaque critère existent, dans la même étape", () => {
    const actions = new Set(Object.values(data.etapes).flatMap((e) => e.actions.map((a) => a.id)));
    for (const [action, criteres] of Object.entries(ACTIONS_CRITERES)) {
      expect(actions.has(action), action).toBe(true);
      const etape = data.etapes[action.split(".")[0]];
      for (const c of criteres) expect(etape.criteres.some((x) => x.id === c), `${action} → ${c}`).toBe(true);
    }
  });

  it("garde l'échelle Réussir dans le Plaisir de 0 à 7, avec 5A et 5B", () => {
    expect(data.niveaux.map((n) => n.code)).toEqual(["0", "1", "2", "3", "4", "5A", "5B", "6", "7"]);
  });

  it("efface le prix et la durée « non indiqués » et les notes en fin d'offre", () => {
    expect(data.offres.diagnostic_amour.prix).toBeNull();
    expect(data.offres.diagnostic_amour.duree).toBeNull();
    expect(data.offres.diagnostic_amour.contenu).toMatch(/mieux vous comprendre\.$/);
    expect(data.offres.seance_argent.contenu).toMatch(/Pas d'outil\.$/);
    expect(data.offres.appel_decouverte.url).toBe("https://calendly.com/pierre-j-sarazin");
  });
});
