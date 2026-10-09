// Comparaison de textes et phrases exactes des notes (§9.2).
import type { Frequence, IdNote, NoteTerrain, ThemeVerbatim } from "./types";

/** Ce que le modèle renvoie pour une synthèse, avant `nbNotes` et la renumérotation finale. */
export interface SyntheseBrute {
  resume: string;
  profils: string[];
  douleurs: { texte: string; frequence: Frequence }[];
  verbatims: { id: string; note: IdNote; citation: string; theme: ThemeVerbatim }[];
  declencheurs: string[];
  objections: string[];
  motsCles: string[];
}

const JETONS_MASQUES = ["[téléphone]", "[adresse mail]", "[lien]"];

/** Minuscules, sans accents, apostrophes et guillemets unifiés, ponctuation retirée aux extrémités. */
export function normaliserPourComparer(t: string): string {
  const s = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[«»“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
  return s.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "").trim();
}

function presenteDans(note: string, citation: string): boolean {
  const n = normaliserPourComparer(note);
  const c = normaliserPourComparer(citation);
  if (c.includes("...")) {
    const morceaux = c
      .split("...")
      .map((m) => m.trim())
      .filter((m) => m.length >= 8);
    if (morceaux.length === 0) return false;
    let depuis = 0;
    for (const morceau of morceaux) {
      const i = n.indexOf(morceau, depuis);
      if (i < 0) return false;
      depuis = i + morceau.length;
    }
    return true;
  }
  return c.length >= 8 && n.includes(c);
}

function noteDeLaPhrase(citation: string, notes: NoteTerrain[], preferee: IdNote): IdNote | null {
  const pref = notes.find((n) => n.id === preferee);
  if (pref && presenteDans(pref.texte, citation)) return pref.id;
  for (const n of notes) {
    if (presenteDans(n.texte, citation)) return n.id;
  }
  return null;
}

/**
 * Ne garde que les phrases recopiées mot pour mot, puis renumérote v1…vN.
 * Aucune relance du modèle : chaque retrait compte dans `retires`.
 */
export function verifierVerbatims(s: SyntheseBrute, notes: NoteTerrain[]): { synthese: SyntheseBrute; retires: number } {
  const synthese: SyntheseBrute = {
    ...s,
    profils: s.profils.slice(),
    douleurs: s.douleurs.slice(),
    declencheurs: s.declencheurs.slice(),
    objections: s.objections.slice(),
    verbatims: [],
    motsCles: [],
  };
  let retires = 0;
  const vues = new Set<string>();
  for (const v of s.verbatims) {
    if (JETONS_MASQUES.some((jeton) => v.citation.includes(jeton))) {
      retires += 1;
      continue;
    }
    const note = noteDeLaPhrase(v.citation, notes, v.note);
    if (!note) {
      retires += 1;
      continue;
    }
    const cle = normaliserPourComparer(v.citation);
    if (vues.has(cle)) {
      retires += 1;
      continue;
    }
    vues.add(cle);
    synthese.verbatims.push({ ...v, note });
  }
  synthese.verbatims = synthese.verbatims.map((v, i) => ({ ...v, id: `v${i + 1}` }));

  const corpus = notes.map((n) => normaliserPourComparer(n.texte)).join("\n");
  for (const mot of s.motsCles) {
    const cle = normaliserPourComparer(mot);
    if (cle && corpus.includes(cle)) synthese.motsCles.push(mot);
    else retires += 1;
  }
  return { synthese, retires };
}
