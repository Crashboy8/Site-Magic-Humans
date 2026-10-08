"use client";

import { useSyncExternalStore } from "react";
import { pourcentageValide } from "@/domain/pourcentage";

const CLE = "boussole-pourcentage";
const VIDE: Record<string, number> = {};
const auditeurs = new Set<() => void>();
let apercu: Record<string, number> = VIDE;
let apercuLu = false;

function lireBrut(): Record<string, number> {
  if (typeof window === "undefined") return VIDE;
  try {
    const brut = JSON.parse(window.localStorage.getItem(CLE) ?? "{}") as Record<string, unknown>;
    const sortie: Record<string, number> = {};
    for (const [id, valeur] of Object.entries(brut)) {
      if (pourcentageValide(valeur)) sortie[id] = valeur;
    }
    return sortie;
  } catch {
    return VIDE;
  }
}

function apercuClient(): Record<string, number> {
  if (!apercuLu) {
    apercu = lireBrut();
    apercuLu = true;
  }
  return apercu;
}

function prevenir() {
  auditeurs.forEach((ecoute) => ecoute());
}

function ecrire(suivant: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLE, JSON.stringify(suivant));
  apercu = suivant;
  prevenir();
}

/** Garde le pourcentage sur cet appareil, même si la colonne n'existe pas encore. */
export function memoriserPourcentage(cle: string, pourcent: number) {
  if (!pourcentageValide(pourcent)) return;
  const actuel = apercuClient();
  if (actuel[cle] === pourcent) return;
  ecrire({ ...actuel, [cle]: pourcent });
}

export function oublierPourcentage(cle: string) {
  const actuel = apercuClient();
  if (!(cle in actuel)) return;
  const suivant = { ...actuel };
  delete suivant[cle];
  ecrire(suivant);
}

function suivre(ecoute: () => void) {
  auditeurs.add(ecoute);
  return () => auditeurs.delete(ecoute);
}

/** Cache navigateur des pourcentages. Vide pendant le rendu serveur. */
export function usePourcentagesLocaux(): Record<string, number> {
  return useSyncExternalStore(suivre, apercuClient, () => VIDE);
}
