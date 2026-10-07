// Validation de l'entrée (§5.3) et indices de flou (§6.1). Module pur.
import { LIMITES } from "./limites";
import type { Adresse, Corrections, EntreeMaCible, Format, IdCible, Langue, Marche, Reponse, Source, Style, Talent, Terrain, Verdict } from "./types";

export interface ErreurChamp {
  champ: string;
  code: "requis" | "trop_court" | "trop_long" | "invalide";
  min?: number;
  max?: number;
}
export type ResultatEntree = { ok: true; entree: EntreeMaCible } | { ok: false; erreurs: ErreurChamp[] };

export const LANGUES: readonly Langue[] = ["fr", "en", "es"];
export const MARCHES: readonly Marche[] = ["b2b", "b2c", "les_deux", "je_ne_sais_pas"];
export const FORMATS: readonly Format[] = ["individuel", "groupe", "presentiel", "distance", "conference", "formation", "mission", "produit"];
export const ADRESSES: readonly Adresse[] = ["tu", "vous"];
export const STYLES: readonly Style[] = ["chaleureux", "direct", "expert", "enjoue"];
const SOURCES: readonly Exclude<Source, null>[] = ["quiz", "carte", "boussole"];

/** String, sans caractères de contrôle (sauf saut de ligne), espaces multiples réduits à un, trim. */
export function normaliser(v: unknown): string {
  if (typeof v !== "string") return v === undefined || v === null ? "" : String(v);
  return v
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .trim();
}

/** Liste de textes : normalisés, vides et doublons (casse ignorée) retirés, tronqués (longueur puis nombre). */
export function normaliserListe(v: unknown, items: number, max: number): string[] {
  if (!Array.isArray(v)) return [];
  const vus = new Set<string>();
  const sortie: string[] = [];
  for (const x of v) {
    const t = normaliser(x).slice(0, max).trim();
    const cle = t.toLowerCase();
    if (!t || vus.has(cle)) continue;
    vus.add(cle);
    sortie.push(t);
  }
  return sortie.slice(0, items);
}

const objet = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export function validerEntree(brut: unknown): ResultatEntree {
  const erreurs: ErreurChamp[] = [];
  const racine = objet(brut);

  /** Texte borné : renvoie la valeur normalisée et note l'erreur éventuelle. */
  function texte(champ: string, valeur: unknown, lim: { min?: number; max: number }, obligatoire: boolean): string {
    const t = normaliser(valeur);
    if (!t) {
      if (obligatoire) erreurs.push({ champ, code: "requis" });
      return t;
    }
    if (lim.min !== undefined && t.length < lim.min) erreurs.push({ champ, code: "trop_court", min: lim.min });
    else if (t.length > lim.max) erreurs.push({ champ, code: "trop_long", max: lim.max });
    return t;
  }
  function choix<T extends string>(champ: string, valeur: unknown, valeurs: readonly T[], defaut: T | undefined): T | "" {
    if (valeur === undefined || valeur === null || valeur === "") {
      if (defaut === undefined) erreurs.push({ champ, code: "requis" });
      return defaut ?? "";
    }
    if (typeof valeur === "string" && (valeurs as readonly string[]).includes(valeur)) return valeur as T;
    erreurs.push({ champ, code: "invalide" });
    return defaut ?? "";
  }

  if (racine.v !== 1) erreurs.push({ champ: "v", code: "invalide" });
  const langue = (choix("langue", racine.langue, LANGUES, "fr") || "fr") as Langue;
  let source: Source = null;
  if (racine.source !== undefined && racine.source !== null) {
    if (typeof racine.source === "string" && (SOURCES as readonly string[]).includes(racine.source)) source = racine.source as Source;
    else erreurs.push({ champ: "source", code: "invalide" });
  }

  const t = objet(racine.talent);
  const talent: Talent = {
    nom: texte("talent.nom", t.nom, LIMITES.nom, false),
    mecanisme: texte("talent.mecanisme", t.mecanisme, LIMITES.mecanisme, true),
    contexte: texte("talent.contexte", t.contexte, LIMITES.contexte, true),
    benefice: texte("talent.benefice", t.benefice, LIMITES.benefice, true),
    antiContexte: texte("talent.antiContexte", t.antiContexte, LIMITES.antiContexte, true),
    reussite: texte("talent.reussite", t.reussite, LIMITES.reussite, false),
    sousTalents: normaliserListe(t.sousTalents, LIMITES.sousTalents.items, LIMITES.sousTalents.max),
    pistes: normaliserListe(t.pistes, LIMITES.pistes.items, LIMITES.pistes.max),
    aDeleguer: normaliserListe(t.aDeleguer, LIMITES.aDeleguer.items, LIMITES.aDeleguer.max),
  };

  const r = objet(racine.terrain);
  const offre = texte("terrain.offre", r.offre, LIMITES.offre, false);
  const clientsPasses = texte("terrain.clientsPasses", r.clientsPasses, LIMITES.clientsPasses, false);
  if (!offre && !clientsPasses) erreurs.push({ champ: "terrain.offre", code: "requis" });
  const marche = choix("terrain.marche", r.marche, MARCHES, undefined) as Marche | "";
  const experience = texte("terrain.experience", r.experience, LIMITES.experience, true);
  const formatsBruts = Array.isArray(r.formats) ? r.formats : [];
  const formats: Format[] = [];
  for (const f of formatsBruts) {
    if (typeof f === "string" && (FORMATS as readonly string[]).includes(f)) {
      if (!formats.includes(f as Format)) formats.push(f as Format);
    } else erreurs.push({ champ: "terrain.formats", code: "invalide" });
  }
  const zone = texte("terrain.zone", r.zone, LIMITES.zone, true);
  const prixActuel = texte("terrain.prixActuel", r.prixActuel, LIMITES.prixActuel, false);
  const adresse = choix("terrain.adresse", r.adresse, ADRESSES, "vous") as Adresse;
  const style = choix("terrain.style", r.style, STYLES, "chaleureux") as Style;
  const terrain: Terrain = { offre, marche, experience, clientsPasses, formats: formats.slice(0, LIMITES.formats.items), zone, prixActuel, adresse, style };

  const reponses: Reponse[] = [];
  (Array.isArray(racine.reponses) ? racine.reponses : []).slice(0, LIMITES.reponses.items).forEach((x, i) => {
    const o = objet(x);
    const id = normaliser(o.id);
    if (!/^t[1-3]-q[1-3]$/.test(id)) erreurs.push({ champ: `reponses[${i}].id`, code: "invalide" });
    const question = texte(`reponses[${i}].question`, o.question, { max: LIMITES.reponses.question }, true);
    const reponse = texte(`reponses[${i}].reponse`, o.reponse, { max: LIMITES.reponses.reponse }, true);
    reponses.push({ id, question, reponse });
  });

  if (erreurs.length) return { ok: false, erreurs };
  return { ok: true, entree: { v: 1, langue, source, talent, terrain: terrain, reponses } };
}

const sansAccents = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .trim();

const FLOU_GENERAL = /\b(tout le monde|les gens|des gens|les personnes|tous publics?|n'importe qui|tous ceux)\b/;
const FLOU_BENEFICE = /^(aider|accompagner|soutenir)\s+(les\s+)?(gens|personnes|autres|clients)\b/;
const FLOU_OFFRE = /^(du |de la |des )?(coaching|accompagnement|conseil|formation)s?\.?$/;

/** Indice de flou (ne bloque jamais) : texte court et générique, pour benefice, offre et clientsPasses. */
export function detecterFlou(champ: string, texte: string): boolean {
  if (champ !== "benefice" && champ !== "offre" && champ !== "clientsPasses") return false;
  const t = sansAccents(texte);
  if (!t || t.length >= 60) return false;
  if (FLOU_GENERAL.test(t)) return true;
  if (champ === "benefice" && FLOU_BENEFICE.test(t)) return true;
  if (champ === "offre" && FLOU_OFFRE.test(t)) return true;
  return false;
}

const VERDICTS: readonly Verdict[] = ["oui", "en_partie", "non"];
const IDS: readonly IdCible[] = ["c1", "c2", "c3"];

/** Validation des corrections (§5.3) : offre 10 à 300, un verdict par cible, commentaire obligatoire pour « en partie » et « non ». */
export function validerCorrections(brut: unknown): { ok: true; corrections: Corrections } | { ok: false; erreurs: ErreurChamp[] } {
  const erreurs: ErreurChamp[] = [];
  const o = objet(brut);
  const offre = normaliser(o.offre);
  if (!offre) erreurs.push({ champ: "corrections.offre", code: "requis" });
  else if (offre.length < LIMITES.correctionOffre.min) erreurs.push({ champ: "corrections.offre", code: "trop_court", min: LIMITES.correctionOffre.min });
  else if (offre.length > LIMITES.correctionOffre.max) erreurs.push({ champ: "corrections.offre", code: "trop_long", max: LIMITES.correctionOffre.max });

  function verdictEtCommentaire(champ: string, v: unknown, commentaireObligatoire: boolean) {
    const x = objet(v);
    const verdict = typeof x.verdict === "string" && (VERDICTS as readonly string[]).includes(x.verdict) ? (x.verdict as Verdict) : null;
    if (!verdict) erreurs.push({ champ: `${champ}.verdict`, code: "invalide" });
    const commentaire = normaliser(x.commentaire);
    const exige = commentaireObligatoire && verdict !== null && verdict !== "oui";
    if (!commentaire) {
      if (exige) erreurs.push({ champ: `${champ}.commentaire`, code: "requis" });
    } else if (exige && commentaire.length < LIMITES.commentaire.min) erreurs.push({ champ: `${champ}.commentaire`, code: "trop_court", min: LIMITES.commentaire.min });
    else if (commentaire.length > LIMITES.commentaire.max) erreurs.push({ champ: `${champ}.commentaire`, code: "trop_long", max: LIMITES.commentaire.max });
    return { verdict: verdict ?? ("oui" as Verdict), commentaire };
  }

  const cibles: Corrections["cibles"] = [];
  const brutes = Array.isArray(o.cibles) ? o.cibles : [];
  if (brutes.length !== 3) erreurs.push({ champ: "corrections.cibles", code: "invalide" });
  brutes.slice(0, 3).forEach((c, i) => {
    const id = objet(c).id;
    if (typeof id !== "string" || !(IDS as readonly string[]).includes(id) || cibles.some((x) => x.id === id)) erreurs.push({ champ: `corrections.cibles[${i}].id`, code: "invalide" });
    const { verdict, commentaire } = verdictEtCommentaire(`corrections.cibles[${i}]`, c, true);
    cibles.push({ id: id as IdCible, verdict, commentaire });
  });
  const antiCible = verdictEtCommentaire("corrections.antiCible", o.antiCible, false);
  const idee = normaliser(o.idee);
  if (idee.length > LIMITES.idee.max) erreurs.push({ champ: "corrections.idee", code: "trop_long", max: LIMITES.idee.max });

  if (erreurs.length) return { ok: false, erreurs };
  return { ok: true, corrections: { offre, cibles, antiCible, idee } };
}
