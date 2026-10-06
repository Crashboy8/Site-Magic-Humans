"use client";

import { useSyncExternalStore } from "react";

// Résultat du quiz mis de côté le temps de se connecter : la page d'accueil le propose ensuite.
const KEY = "boussole.quiz-import";
const EVENT = "boussole:quiz-import";

export function savePendingQuiz(raw: string) {
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // stockage indisponible : la personne pourra recliquer sur le lien du quiz
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearPendingQuiz() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // rien à effacer
  }
  window.dispatchEvent(new Event(EVENT));
}

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePendingQuiz(): string | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

function subscribeHash(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/** Ancre de l'adresse (#q=…), lue côté navigateur uniquement. */
export function useLocationHash(): string | null {
  return useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => null,
  );
}
