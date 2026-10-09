// Fiche Talent Unique d'une personne (cahier Mon espace, C.1). Module pur.

/** Fiche Talent Unique d'une personne, une seule par compte. Version 1. */
export interface FicheTalent {
  v: 1;
  prenom: string;
  titre: string;
  autresTitres: string[];
  resume: string;
  mecanisme: string;
  contexte: string;
  benefice: string;
  antiContexte: string;
  reussite: string[];
  echec: string[];
  qualites: string[];
  defauts: string[];
  paradoxe: string;
  valeurs: string[];
  antiValeurs: string[];
  phraseAntiValeurs: string;
  enneagramme: { base: string; sousType: string };
  aimeQuand: string[];
  managerIdeal: string[];
  contraintes: string[];
  conseils: string[];
  talonAchille: string;
  sousPression: string;
  vigilance: string[];
  axes: string[];
  etapes: string[];
  metiersParfaits: string[];
  metiersTres: string[];
  metiersCondition: string[];
  secteurs: string[];
  avatars: Avatar[];
  questions: string[];
  offres: string[];
  prochainesEtapes: string[];
  archetypes: string[];
}

export interface Avatar {
  profil: string;
  besoins: string;
  apport: string;
}

export type SourceFiche = "collage" | "notion" | "lien_notion" | "word" | "pdf" | "qcm" | "manuel";
export type MethodeFiche = "modele" | "mots_cles" | "ia" | "manuel";

export const SOURCES_FICHE: readonly SourceFiche[] = ["collage", "notion", "lien_notion", "word", "pdf", "qcm", "manuel"];
export const METHODES_FICHE: readonly MethodeFiche[] = ["modele", "mots_cles", "ia", "manuel"];

/** Champs obligatoires (mêmes minimums que le Cibleur). */
export type ChampObligatoire = "mecanisme" | "contexte" | "benefice" | "antiContexte";
export const CHAMPS_OBLIGATOIRES: readonly ChampObligatoire[] = ["mecanisme", "contexte", "benefice", "antiContexte"];

export type ChampTexte = {
  [K in keyof FicheTalent]: FicheTalent[K] extends string ? K : never;
}[keyof FicheTalent];
export type ChampListe = {
  [K in keyof FicheTalent]: FicheTalent[K] extends string[] ? K : never;
}[keyof FicheTalent];

export interface RapportLecture {
  /** Champs remplis par la lecture. */
  trouves: (keyof FicheTalent)[];
  /** Champs remplis par completerFiche (badge « à vérifier »). */
  deduits: (keyof FicheTalent)[];
  manquants: ChampObligatoire[];
  /** "modele" si au moins 4 de : titre, mecanisme, contexte, benefice, reussite, echec, valeurs. */
  methode: "modele" | "mots_cles";
}
