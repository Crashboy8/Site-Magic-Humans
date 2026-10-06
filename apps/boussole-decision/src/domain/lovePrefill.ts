// Préréglage de la Boussole Relation depuis l'ancre #amour= du Quiz Amour.
// Module pur : pas de React, pas de Supabase. Le serveur revalide toujours le contenu.
import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import type { CriterionDirection, Importance } from "./types";

export const LOVE_ADJUSTABLE_KEYS = ["energie", "frictions", "langage", "complementarite"] as const;
export const LOVE_ADJUSTABLE_LEVELS: Importance[] = ["tres_important", "important", "important", "moyen"];
export const LOVE_NOTE_MAX = 300;
export const LOVE_HASH_MAX = 4000;

type AdjustableKey = (typeof LOVE_ADJUSTABLE_KEYS)[number];

export interface LovePrefill {
  imp: Partial<Record<AdjustableKey, Importance>>;
  notes: Partial<Record<string, string>>;
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
  const obj = raw as { v?: unknown; imp?: unknown; notes?: unknown };
  if (obj.v !== 2) return null;

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

  if (Object.keys(imp).length === 0 && Object.keys(notes).length === 0) return null;
  return { imp, notes };
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
