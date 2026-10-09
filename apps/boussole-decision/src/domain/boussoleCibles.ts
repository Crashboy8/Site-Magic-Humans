// Lien du Cibleur vers la Boussole de décision (§13). Module pur, partagé par les deux outils.
// Même encodage que l'ancre #amour= : JSON, UTF-8, base64url sans « = ». Le serveur revalide toujours la charge.
import { scoreSur10 } from "./maCible/scores";
import type { EntreeMaCible, Extras, ResultatClasse } from "./maCible/types";
import type { CategoryKey, CriterionDirection, EvaluationValue, Importance } from "./types";

export interface NotesCible {
  urgence: number;
  paiement: number;
  acces: number;
  plaisir: number;
}
export interface LienCibles {
  v: 1;
  talent: { mecanisme: string; contexte: string; benefice: string; antiContexte: string; reussite: string };
  offre: string;
  cibles: { nom: string; resume: string; score: number; notes: NotesCible }[];
}

export const TAILLE_MAX_LIEN = 8_000;
export const CHEMIN_DEPUIS_CIBLEUR = "/boussole-decision/depuis-cibleur/";
const TALENT_MAX = 600;
const TALENT_REDUIT = 300;
const OFFRE_MAX = 240;
const RESUME_MAX = 180;
const NOM_MAX = 80;
const CIBLES_MIN = 2;
const CIBLES_MAX = 6;
const CLES_TALENT = ["mecanisme", "contexte", "benefice", "antiContexte", "reussite"] as const;

const couper = (s: string, max: number) => (s.length > max ? s.slice(0, max).trimEnd() : s);

function versBase64Url(texte: string): string {
  const octets = new TextEncoder().encode(texte);
  let bin = "";
  for (const o of octets) bin += String.fromCharCode(o);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function encoderLienCibles(d: LienCibles): string {
  return versBase64Url(JSON.stringify(d));
}

function texte(v: unknown, max: number, requis: boolean): string | null {
  if (typeof v !== "string") return requis ? null : "";
  const t = v.trim();
  if (requis && !t) return null;
  return couper(t, max);
}

function note(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5 ? v : null;
}

/** Valide un objet déjà décodé. `null` si la forme ne va pas. */
export function validerLienCibles(brut: unknown): LienCibles | null {
  if (!brut || typeof brut !== "object" || Array.isArray(brut)) return null;
  const o = brut as Record<string, unknown>;
  if (o.v !== 1) return null;
  const t = o.talent && typeof o.talent === "object" ? (o.talent as Record<string, unknown>) : null;
  if (!t) return null;
  const talent = {} as LienCibles["talent"];
  for (const cle of CLES_TALENT) {
    const lu = texte(t[cle], TALENT_MAX, false);
    if (lu === null) return null;
    talent[cle] = lu;
  }
  const offre = texte(o.offre, OFFRE_MAX, false);
  if (offre === null || !Array.isArray(o.cibles) || o.cibles.length < CIBLES_MIN || o.cibles.length > CIBLES_MAX) return null;
  const cibles: LienCibles["cibles"] = [];
  for (const c of o.cibles) {
    if (!c || typeof c !== "object") return null;
    const x = c as Record<string, unknown>;
    const nom = texte(x.nom, NOM_MAX, true);
    const resume = texte(x.resume, RESUME_MAX, false);
    const n = x.notes && typeof x.notes === "object" ? (x.notes as Record<string, unknown>) : null;
    if (nom === null || resume === null || !n || typeof x.score !== "number" || !Number.isFinite(x.score)) return null;
    const notes = { urgence: note(n.urgence), paiement: note(n.paiement), acces: note(n.acces), plaisir: note(n.plaisir) };
    if (Object.values(notes).some((v) => v === null)) return null;
    cibles.push({ nom, resume, score: Math.min(10, Math.max(0, x.score)), notes: notes as NotesCible });
  }
  return { v: 1, talent, offre, cibles };
}

/** Accepte « #cibles=… » ou la charge seule. `null` si absente, trop longue, illisible ou invalide. */
export function decoderLienCibles(hash: string): LienCibles | null {
  if (typeof hash !== "string" || !hash.trim()) return null;
  let jeton = hash.trim();
  if (jeton.startsWith("#")) jeton = jeton.slice(1);
  if (jeton.startsWith("cibles=")) jeton = jeton.slice("cibles=".length);
  if (!jeton || jeton.length > TAILLE_MAX_LIEN || !/^[A-Za-z0-9_-]+$/.test(jeton)) return null;
  try {
    const b64 = jeton.replace(/-/g, "+").replace(/_/g, "/");
    const complete = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(complete);
    const octets = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return validerLienCibles(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(octets)));
  } catch {
    return null;
  }
}

/** Les 3 cibles dans l'ordre du classement, puis les pistes creusées par score décroissant (6 au plus). */
export function chargeCibles(resultat: ResultatClasse, extras: Extras, entree: EntreeMaCible): LienCibles {
  const t = entree.talent;
  const lignes = resultat.classement.flatMap((l) => {
    const c = resultat.cibles.find((x) => x.id === l.id);
    return c ? [{ cible: c, score: l.score }] : [];
  });
  const pistes = Object.values(extras.pistes)
    .flatMap((p) => (p ? [{ cible: p.cible, score: scoreSur10(p.cible.scores) }] : []))
    .sort((a, b) => b.score - a.score);
  const cibles = [...lignes, ...pistes].slice(0, CIBLES_MAX).map(({ cible, score }) => ({
    nom: couper(cible.nom, NOM_MAX),
    resume: couper(cible.promesse, RESUME_MAX),
    score,
    notes: {
      urgence: cible.scores.urgence.note,
      paiement: cible.scores.paiement.note,
      acces: cible.scores.acces.note,
      plaisir: cible.scores.plaisir.note,
    },
  }));
  return {
    v: 1,
    talent: {
      mecanisme: couper(t.mecanisme, TALENT_MAX),
      contexte: couper(t.contexte, TALENT_MAX),
      benefice: couper(t.benefice, TALENT_MAX),
      antiContexte: couper(t.antiContexte, TALENT_MAX),
      reussite: couper(t.reussite, TALENT_MAX),
    },
    offre: couper(resultat.offre.phrase, OFFRE_MAX),
    cibles,
  };
}

/** Réduit la charge sous 8 000 caractères : résumés vidés en partant de la fin, puis talent coupé à 300. */
export function chargeReduite(d: LienCibles): string {
  let charge = encoderLienCibles(d);
  const copie: LienCibles = structuredClone(d);
  for (let i = copie.cibles.length - 1; i >= 0 && charge.length > TAILLE_MAX_LIEN; i--) {
    copie.cibles[i].resume = "";
    charge = encoderLienCibles(copie);
  }
  if (charge.length > TAILLE_MAX_LIEN) {
    for (const cle of CLES_TALENT) copie.talent[cle] = couper(copie.talent[cle], TALENT_REDUIT);
    charge = encoderLienCibles(copie);
  }
  return charge;
}

/** Le prénom n'est jamais transmis. Marche aussi depuis un résultat de l'historique. */
export function lienBoussoleCibles(resultat: ResultatClasse, extras: Extras, entree: EntreeMaCible): string {
  return `${CHEMIN_DEPUIS_CIBLEUR}#cibles=${chargeReduite(chargeCibles(resultat, extras, entree))}`;
}

// Côté Boussole (§13.2) : critères créés et évaluations préremplies.

export type SourceNote = "plaisir" | "plaisirInverse" | "acces" | "urgence" | "paiement" | null;
export interface CritereCibles {
  categorie: CategoryKey;
  libelle: string;
  importance: Importance;
  nonNegociable: false;
  direction: CriterionDirection;
  description: (talent: LienCibles["talent"]) => string;
  source: SourceNote;
}

export const CRITERES_CIBLES: readonly CritereCibles[] = [
  {
    categorie: "contexte_declencheur",
    libelle: "Cette cible allume mon talent",
    importance: "critique",
    nonNegociable: false,
    direction: "TOWARDS",
    description: (t) => couper(`Mon Contexte Déclencheur : ${t.contexte}`, 280),
    source: "plaisir",
  },
  {
    categorie: "anti_contexte",
    libelle: "Cette cible me plonge dans mon Anti-Contexte",
    importance: "tres_important",
    nonNegociable: false,
    direction: "AWAY_FROM",
    description: (t) => couper(`Mon Anti-Contexte : ${t.antiContexte}`, 280),
    source: "plaisirInverse",
  },
  {
    categorie: "valeurs_culture",
    libelle: "J'aime ce milieu et ses valeurs",
    importance: "important",
    nonNegociable: false,
    direction: "TOWARDS",
    description: () => "Est-ce que je me sens à ma place avec ces personnes ?",
    source: null,
  },
  {
    categorie: "conditions_vie",
    libelle: "Je peux la joindre facilement",
    importance: "important",
    nonNegociable: false,
    direction: "TOWARDS",
    description: () => "Est-ce que je la connais déjà, ou est-ce que je sais où la croiser ?",
    source: "acces",
  },
  {
    categorie: "conditions_vie",
    libelle: "Le rythme et les déplacements me conviennent",
    importance: "moyen",
    nonNegociable: false,
    direction: "TOWARDS",
    description: () => "Horaires, distance, nombre de rendez-vous : est-ce que ça tient dans ma vie ?",
    source: null,
  },
  {
    categorie: "remuneration",
    libelle: "Son problème est urgent pour elle",
    importance: "tres_important",
    nonNegociable: false,
    direction: "TOWARDS",
    description: () => "Est-ce qu'elle cherche déjà une solution ?",
    source: "urgence",
  },
  {
    categorie: "remuneration",
    libelle: "Elle peut payer mon prix",
    importance: "tres_important",
    nonNegociable: false,
    direction: "TOWARDS",
    description: () => "A-t-elle un budget pour ce type d'aide ?",
    source: "paiement",
  },
];

const VALEURS: readonly EvaluationValue[] = ["non", "p25", "p50", "p75", "oui"];

/** Note du Cibleur (1 à 5) vers une valeur de la Boussole : 1 → non … 5 → oui. */
export function valeurDepuisNote(n: number): EvaluationValue {
  return VALEURS[Math.min(5, Math.max(1, Math.round(n))) - 1];
}

/** Valeur préremplie pour un critère, ou `null` si le critère reste sans évaluation. */
export function evaluationPour(source: SourceNote, notes: NotesCible): EvaluationValue | null {
  switch (source) {
    case "plaisir":
      return valeurDepuisNote(notes.plaisir);
    case "plaisirInverse":
      return valeurDepuisNote(6 - notes.plaisir);
    case "acces":
      return valeurDepuisNote(notes.acces);
    case "urgence":
      return valeurDepuisNote(notes.urgence);
    case "paiement":
      return valeurDepuisNote(notes.paiement);
    default:
      return null;
  }
}

/** « Score du Cibleur : 7,4/10 » */
export const noteScoreCibleur = (score: number) => `Score du Cibleur : ${score.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/10`;
