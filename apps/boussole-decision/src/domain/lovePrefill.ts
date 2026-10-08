// Préréglage de la Boussole Relation depuis l'ancre #amour= du Quiz Amour.
// Module pur : pas de React, pas de Supabase. Le serveur revalide toujours le contenu.
import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import type { CriterionDirection, Importance } from "./types";

export const LOVE_ADJUSTABLE_KEYS = ["energie", "frictions", "langage", "complementarite"] as const;
export const LOVE_ADJUSTABLE_LEVELS: Importance[] = ["tres_important", "important", "important", "moyen"];
export const LOVE_NOTE_MAX = 300;
export const LOVE_HASH_MAX = 9000;
export const LOVE_PROPOSALS_MAX = 20;
/** Repère posé dans la description d'un critère importé : c'est lui qui alimente l'encart « Repris de ton Quiz Amour ». */
export const QUIZ_MARK = "Repris de ton Quiz Amour";

type AdjustableKey = (typeof LOVE_ADJUSTABLE_KEYS)[number];

export type LoveProposalGroup = "profil" | "besoins" | "valeurs" | "eviter";

/** Un résultat du quiz transformé en critère que la personne peut cocher. */
export interface LoveProposal {
  id: string;
  group: LoveProposalGroup;
  category: string;
  label: string;
  importance: Importance;
  nonNegotiable: boolean;
  direction: CriterionDirection;
  /** Clé du critère du modèle qui couvre déjà ce résultat (jamais créé en double). */
  coveredBy: string | null;
}

export interface LovePrefill {
  imp: Partial<Record<AdjustableKey, Importance>>;
  notes: Partial<Record<string, string>>;
  proposals: LoveProposal[];
  /** Nom du profil amoureux (catalogue du quiz), affiché dans l'encart. */
  profil: string;
}

export interface LoveCriterionToCreate {
  key: string;
  category: string;
  label: string;
  description: string;
  importance: Importance;
  nonNegotiable: boolean;
  direction: CriterionDirection;
}

const NOTE_KEYS = new Set(LOVE_TEMPLATE.criteria.map((c) => c.key).filter((key) => key !== "respect"));

function countLevel(values: string[], level: Importance) {
  return values.filter((value) => value === level).length;
}

/** "#amour=..." ou la charge seule. Null si absente, trop longue, ou illisible. */
export function decodeLoveHash(hash: string): unknown | null {
  if (typeof hash !== "string" || !hash.trim()) return null;
  let token = hash.trim();
  if (token.startsWith("#")) token = token.slice(1);
  if (token.startsWith("amour=")) token = token.slice("amour=".length);
  if (!token || token.length > LOVE_HASH_MAX) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    return null;
  }
}

/** Valide v = 2, le multiset des poids, et les notes. Null si rien n'est utilisable. */
export function parseLovePrefill(raw: unknown): LovePrefill | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { v?: unknown; imp?: unknown; notes?: unknown; crit?: unknown; p?: unknown };
  if (obj.v !== 2 && obj.v !== 3) return null;

  let imp: LovePrefill["imp"] = {};
  if (obj.imp && typeof obj.imp === "object") {
    const src = obj.imp as Record<string, unknown>;
    const values = LOVE_ADJUSTABLE_KEYS.map((key) => src[key]);
    if (values.every((value) => typeof value === "string")) {
      const levels = values as string[];
      const exact =
        countLevel(levels, "tres_important") === 1 &&
        countLevel(levels, "important") === 2 &&
        countLevel(levels, "moyen") === 1;
      if (exact) {
        imp = {
          energie: src.energie as Importance,
          frictions: src.frictions as Importance,
          langage: src.langage as Importance,
          complementarite: src.complementarite as Importance,
        };
      }
    }
  }

  const notes: LovePrefill["notes"] = {};
  if (obj.notes && typeof obj.notes === "object") {
    for (const [key, value] of Object.entries(obj.notes as Record<string, unknown>)) {
      if (!NOTE_KEYS.has(key) || typeof value !== "string") continue;
      const cleaned = value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
      if (!cleaned) continue;
      notes[key] = cleaned.length > LOVE_NOTE_MAX ? cleaned.slice(0, LOVE_NOTE_MAX) : cleaned;
    }
  }

  const proposals = parseProposals(obj.crit);
  const profil = typeof obj.p === "string" ? clean(obj.p).slice(0, 60) : "";

  if (Object.keys(imp).length === 0 && Object.keys(notes).length === 0 && proposals.length === 0) return null;
  return { imp, notes, proposals, profil };
}

function clean(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

const CATEGORY_KEYS = new Set<string>(LOVE_TEMPLATE.categories.map((c) => c.key));
const TEMPLATE_KEYS = new Set<string>(LOVE_TEMPLATE.criteria.map((c) => c.key));
const GROUPS = new Set<string>(["profil", "besoins", "valeurs", "eviter"]);
const PROPOSAL_LEVELS = new Set<string>(["critique", "tres_important", "important", "moyen"]);

/** Valide la liste « crit » du quiz (v = 3). Tout élément douteux est ignoré, jamais corrigé. */
function parseProposals(raw: unknown): LoveProposal[] {
  if (!Array.isArray(raw)) return [];
  const out: LoveProposal[] = [];
  for (const item of raw.slice(0, LOVE_PROPOSALS_MAX)) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;
    if (typeof c.id !== "string" || !/^[a-z0-9_-]{1,40}$/.test(c.id)) continue;
    if (typeof c.l !== "string" || typeof c.c !== "string" || typeof c.i !== "string" || typeof c.g !== "string") continue;
    const label = clean(c.l);
    if (!label || label.length > 120 || !CATEGORY_KEYS.has(c.c) || !PROPOSAL_LEVELS.has(c.i) || !GROUPS.has(c.g)) continue;
    if (out.some((p) => p.id === c.id || normalizeLabel(p.label) === normalizeLabel(label))) continue;
    out.push({
      id: c.id,
      group: c.g as LoveProposalGroup,
      category: c.c,
      label,
      importance: c.i as Importance,
      nonNegotiable: c.n === 1,
      direction: c.a === 1 ? "AWAY_FROM" : "TOWARDS",
      coveredBy: typeof c.s === "string" && TEMPLATE_KEYS.has(c.s) ? c.s : null,
    });
  }
  return out;
}

/** Pour comparer deux libellés : sans accents, sans ponctuation, sans majuscules. */
export function normalizeLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Ce qui peut être coché : ni couvert par le modèle, ni déjà présent dans la Boussole. */
export function proposalStatus(proposal: LoveProposal, existingLabels: string[]): "nouveau" | "modele" | "present" {
  if (proposal.coveredBy) return "modele";
  const key = normalizeLabel(proposal.label);
  return existingLabels.some((label) => normalizeLabel(label) === key) ? "present" : "nouveau";
}

/** Critères importés à créer : ceux cochés, nouveaux, sans doublon, avec le repère de l'encart. */
export function proposalsToCreate(prefill: LovePrefill | null, chosenIds: unknown, existingLabels: string[]): LoveCriterionToCreate[] {
  if (!prefill || !Array.isArray(chosenIds)) return [];
  const chosen = new Set(chosenIds.filter((id): id is string => typeof id === "string"));
  const seen = [...existingLabels];
  const out: LoveCriterionToCreate[] = [];
  for (const p of prefill.proposals) {
    if (!chosen.has(p.id) || proposalStatus(p, seen) !== "nouveau") continue;
    seen.push(p.label);
    out.push({
      key: `quiz-${p.id}`,
      category: p.category,
      label: p.label,
      description: quizMarkLine(prefill.profil, p.group),
      importance: p.importance,
      nonNegotiable: p.nonNegotiable,
      direction: p.direction,
    });
  }
  return out;
}

const GROUP_WORDS: Record<LoveProposalGroup, string> = {
  profil: "ton profil",
  besoins: "ce qui te nourrit",
  valeurs: "tes valeurs",
  eviter: "ce que tu veux éviter",
};

export function quizMarkLine(profil: string, group: LoveProposalGroup): string {
  return `${QUIZ_MARK} (${GROUP_WORDS[group]}${profil ? `, profil « ${profil} »` : ""}).`;
}

/** Nom du profil amoureux retrouvé dans les critères importés, s'il y en a. */
export function quizProfilFrom(descriptions: string[]): string | null {
  for (const d of descriptions) {
    const m = d.match(/profil « ([^»]{1,60}) »/);
    if (d.startsWith(QUIZ_MARK) && m) return m[1];
  }
  return null;
}

/** Critères à créer : le modèle, plus les poids et les notes acceptés. */
export function applyLovePrefill(prefill: LovePrefill | null): LoveCriterionToCreate[] {
  const impReady = Boolean(prefill && LOVE_ADJUSTABLE_KEYS.every((key) => prefill.imp[key]));
  return LOVE_TEMPLATE.criteria.map((criterion) => {
    const adjustable = (LOVE_ADJUSTABLE_KEYS as readonly string[]).includes(criterion.key);
    const importance = impReady && adjustable ? prefill!.imp[criterion.key as AdjustableKey]! : criterion.importance;
    const note = prefill?.notes[criterion.key];
    const description = criterion.guide + (note ? "\n\n" + LOVE_TEXTS.quizNoteLabel + note : "");
    return {
      key: criterion.key,
      category: criterion.category,
      label: criterion.label,
      description,
      importance,
      nonNegotiable: criterion.nonNegotiable,
      direction: criterion.direction,
    };
  });
}
