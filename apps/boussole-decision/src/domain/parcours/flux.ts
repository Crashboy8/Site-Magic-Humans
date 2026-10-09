// Le déroulé de « Où j'en suis ? » : 1) la voie, 2) l'autodiagnostic argent (voies A à E),
// 3) la connaissance de soi en parallèle (voies pro), 4) une étape par écran, 5) le résultat.
import { etapesRaccourci, etapesSoi, PAIRES_QUESTIONS, questionnaire } from "./position";
import type { Profil } from "./profil";
import type { ParcoursPublic } from "./types";

export type Vue = { type: "voie" } | { type: "argent" } | { type: "parallele" } | { type: "ecran"; index: number } | { type: "resultat" };

/** L'autodiagnostic argent n'est posé que dans les voies qui proposent le module Argent (A à E). */
export function poseArgent(data: ParcoursPublic, profil: Profil): boolean {
  return profil.voie !== null && profil.voie !== "inconnue" && data.voies[profil.voie].argent;
}

/** « Tu veux aussi travailler ta connaissance de toi en parallèle ? » : seulement après une voie pro. */
export function poseParallele(data: ParcoursPublic, profil: Profil): boolean {
  return profil.voie !== null && profil.voie !== "inconnue" && data.voies[profil.voie].pro;
}

/** Tous les écrans du déroulé, dans l'ordre, pour les réponses actuelles. */
export function deroule(data: ParcoursPublic, profil: Profil): Vue[] {
  const vues: Vue[] = [{ type: "voie" }];
  if (profil.voie === null) return vues;
  if (poseArgent(data, profil)) vues.push({ type: "argent" });
  if (poseParallele(data, profil)) vues.push({ type: "parallele" });
  questionnaire(data, profil).ecrans.forEach((_, index) => vues.push({ type: "ecran", index }));
  vues.push({ type: "resultat" });
  return vues;
}

export function memeVue(a: Vue, b: Vue): boolean {
  if (a.type === "ecran" || b.type === "ecran") return a.type === b.type && (a as { index: number }).index === (b as { index: number }).index;
  return a.type === b.type;
}

/** Où reprendre : la première question sans réponse, sinon le résultat. */
export function vueDeReprise(data: ParcoursPublic, profil: Profil): Vue {
  if (profil.voie === null) return { type: "voie" };
  if (poseArgent(data, profil) && profil.argent === null) return { type: "argent" };
  if (poseParallele(data, profil) && profil.parallele === null) return { type: "parallele" };
  const { enAttente } = questionnaire(data, profil);
  return enAttente === null ? { type: "resultat" } : { type: "ecran", index: enAttente };
}

/** L'écran qui suit, recalculé avec les réponses qu'on vient de donner. */
export function vueSuivante(data: ParcoursPublic, profil: Profil, vue: Vue): Vue {
  const vues = deroule(data, profil);
  const i = vues.findIndex((v) => memeVue(v, vue));
  if (i === -1) return vueDeReprise(data, profil);
  return vues[i + 1] ?? { type: "resultat" };
}

/** Nombre de quêtes (écrans d'étapes) si toutes les étapes de la voie étaient posées : « Quête 3 sur 10 ». */
export function totalQuetes(data: ParcoursPublic, profil: Profil): number {
  if (profil.voie === null) return 0;
  const auto = etapesRaccourci(data, profil);
  const compter = (ids: readonly string[]) => ids.filter((id) => !auto.has(id)).length;
  if (profil.voie === "inconnue") return compter(data.tronc);
  const v = data.voies[profil.voie];
  let n = compter(v.etapes);
  if (v.paralleles) n += v.paralleles.entrepreneur.length + v.paralleles.salarie.length - PAIRES_QUESTIONS.length + 1;
  if (v.pro && profil.parallele === true) n += etapesSoi(data).length;
  return n;
}

export function vuePrecedente(data: ParcoursPublic, profil: Profil, vue: Vue): Vue | null {
  const vues = deroule(data, profil);
  const i = vues.findIndex((v) => memeVue(v, vue));
  return i > 0 ? vues[i - 1] : null;
}
