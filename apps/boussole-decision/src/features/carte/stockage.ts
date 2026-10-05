"use client";

import { useSyncExternalStore } from "react";
import { carteDemo } from "@/content/carte-demo";
import { parseCarte, type Carte } from "@/domain/carte";

// La carte vit dans le navigateur de la personne (aucun compte nécessaire) ; l'export/import en fait une copie.
const CLE = "boussole.carte-du-talent.v1";
const EVENEMENT = "carte-du-talent:change";

const DEMO = carteDemo();
let brutEnCache: string | null | undefined;
let carteEnCache: Carte = DEMO;
/** Copie en mémoire si le navigateur refuse le stockage (navigation privée…). */
let memoire: Carte | null = null;

function lire(): Carte {
  if (memoire) return memoire;
  let brut: string | null = null;
  try {
    brut = window.localStorage.getItem(CLE);
  } catch {
    brut = null;
  }
  if (brut === brutEnCache) return carteEnCache;
  brutEnCache = brut;
  try {
    carteEnCache = brut ? parseCarte(JSON.parse(brut)) : DEMO;
  } catch {
    carteEnCache = DEMO;
  }
  return carteEnCache;
}

function abonner(callback: () => void) {
  window.addEventListener(EVENEMENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENEMENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function enregistrerCarte(carte: Carte) {
  const datee = { ...carte, modifieLe: new Date().toISOString() };
  try {
    window.localStorage.setItem(CLE, JSON.stringify(datee));
    memoire = null;
  } catch {
    memoire = datee;
  }
  window.dispatchEvent(new Event(EVENEMENT));
}

export function rechargerDemo() {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // rien à effacer
  }
  memoire = null;
  window.dispatchEvent(new Event(EVENEMENT));
}

/** La carte courante : celle du navigateur, ou la démo. */
export function useCarte(): Carte {
  return useSyncExternalStore(abonner, lire, () => DEMO);
}
