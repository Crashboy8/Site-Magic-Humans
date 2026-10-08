"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { saveOpportunityAppearance } from "@/data/repository";
import { apparencesResolues, estCouleur, estIcone, type RelationLook } from "@/domain/relationApparence";
import type { Opportunity } from "@/domain/types";

const CLE = "boussole-relation-apparence";
const VIDE: Record<string, RelationLook> = {};
const auditeurs = new Set<() => void>();
let apercu: Record<string, RelationLook> = VIDE;
let apercuLu = false;

function lireBrut(): Record<string, RelationLook> {
  if (typeof window === "undefined") return VIDE;
  try {
    const brut = JSON.parse(window.localStorage.getItem(CLE) ?? "{}") as Record<string, unknown>;
    const sortie: Record<string, RelationLook> = {};
    for (const [id, valeur] of Object.entries(brut)) {
      if (!valeur || typeof valeur !== "object") continue;
      const look = valeur as { icon?: unknown; color?: unknown };
      if (estIcone(look.icon) && estCouleur(look.color)) sortie[id] = { icon: look.icon, color: look.color };
    }
    return sortie;
  } catch {
    return VIDE;
  }
}

function apercuClient(): Record<string, RelationLook> {
  if (!apercuLu) {
    apercu = lireBrut();
    apercuLu = true;
  }
  return apercu;
}

function prevenir() {
  auditeurs.forEach((ecoute) => ecoute());
}

/** Cache navigateur : dernier recours si la base refuse l'écriture. */
export function memoriserApparence(id: string, look: RelationLook) {
  if (typeof window === "undefined") return;
  const actuel = apercuClient()[id];
  if (actuel?.icon === look.icon && actuel.color === look.color) return;
  const toutes = { ...apercuClient(), [id]: look };
  window.localStorage.setItem(CLE, JSON.stringify(toutes));
  apercu = toutes;
  prevenir();
}

/**
 * Enregistre l'apparence sur la même ligne que le nom.
 * Si les colonnes manquent, la base garde le marqueur dans notes.
 * Le navigateur garde une copie dans tous les cas.
 */
export async function enregistrerApparence(opportunite: Pick<Opportunity, "id" | "notes">, look: RelationLook) {
  memoriserApparence(opportunite.id, look);
  try {
    await saveOpportunityAppearance(supabaseBrowser(), opportunite, look);
  } catch {
    // La copie locale suffit pour cet appareil.
  }
}

function suivre(ecoute: () => void) {
  auditeurs.add(ecoute);
  return () => auditeurs.delete(ecoute);
}

/**
 * Apparences affichées : base, puis cache local, puis valeur par défaut.
 * En édition, une relation encore sans apparence est enregistrée une fois.
 */
export function useApparenceRelations(opportunities: Opportunity[], actif: boolean, enregistrer: boolean): (Opportunity & RelationLook)[] | Opportunity[] {
  const locales = useSyncExternalStore(suivre, apercuClient, () => VIDE);
  const coteClient = useSyncExternalStore(suivre, () => true, () => false);

  const relations = useMemo(() => {
    if (!actif) return opportunities;
    const fusion = opportunities.map((o) => (o.icon && o.color ? o : locales[o.id] ? { ...o, ...locales[o.id] } : o));
    return apparencesResolues(fusion);
  }, [actif, opportunities, locales]);

  useEffect(() => {
    if (!actif || !enregistrer || !coteClient) return;
    const manquantes = opportunities.filter((o) => !o.icon || !o.color);
    if (manquantes.length === 0) return;
    const suite = apparencesResolues(
      opportunities.map((o) => (o.icon && o.color ? o : locales[o.id] ? { ...o, ...locales[o.id] } : o)),
    );
    for (const avant of manquantes) {
      const look = suite.find((r) => r.id === avant.id);
      if (!look) continue;
      void enregistrerApparence(avant, { icon: look.icon, color: look.color });
    }
  }, [actif, enregistrer, coteClient, opportunities, locales]);

  return relations;
}
