// Portraits et pistes creusées gardés dans le navigateur (§14). Lecture tolérante : un élément invalide est ignoré.
import { scoreSur10 } from "./scores";
import type { Cible, Extras, IdCible, IdPiste, LignePiste, Portrait } from "./types";
import { validerCible, validerPortrait } from "./validation";

const IDS_CIBLE: readonly IdCible[] = ["c1", "c2", "c3", "c4", "c5", "c6"];
const IDS_PISTE: readonly IdPiste[] = ["p1", "p2", "p3", "p4", "p5", "p6"];
const MAX_PISTES = 3;

const objet = (v: unknown): Record<string, unknown> | null =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

function ligneValide(v: unknown, cible: Cible): LignePiste | null {
  const o = objet(v);
  if (!o || o.id !== cible.id || typeof o.score !== "number" || !Number.isFinite(o.score) || typeof o.alertePlaisir !== "boolean") return null;
  // Le score affiché est toujours recalculé depuis les notes de la cible.
  return { id: cible.id, score: scoreSur10(cible.scores), alertePlaisir: cible.scores.plaisir.note <= 2 };
}

export function lireExtras(v: unknown): Extras {
  const o = objet(v);
  const extras: Extras = { portraits: {}, pistes: {} };
  if (!o) return extras;
  const portraits = objet(o.portraits);
  if (portraits) {
    for (const id of IDS_CIBLE) {
      if (portraits[id] === undefined) continue;
      const p = validerPortrait(structuredClone(portraits[id]));
      if (p.ok) extras.portraits[id] = p.valeur as Portrait;
    }
  }
  const pistes = objet(o.pistes);
  if (pistes) {
    const prises = new Set<IdCible>();
    for (const id of IDS_PISTE) {
      const brute = objet(pistes[id]);
      if (!brute || Object.keys(extras.pistes).length >= MAX_PISTES) continue;
      const c = validerCible(structuredClone(brute.cible), ["c4", "c5", "c6"]);
      if (!c.ok || prises.has(c.valeur.id)) continue;
      const ligne = ligneValide(brute.ligne, c.valeur);
      if (!ligne) continue;
      prises.add(c.valeur.id);
      extras.pistes[id] = { cible: c.valeur, ligne };
    }
  }
  return extras;
}
