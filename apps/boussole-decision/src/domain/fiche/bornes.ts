// Bornes, nettoyage et validation de la fiche (cahier C.1). Module pur.
import { normaliser } from "@/domain/maCible/entree";
import { CHAMPS_OBLIGATOIRES, type Avatar, type ChampListe, type ChampObligatoire, type ChampTexte, type FicheTalent } from "./types";

export const LIMITES_FICHE = {
  textes: {
    prenom: 60,
    titre: 120,
    resume: 1500,
    mecanisme: 2000,
    contexte: 2000,
    benefice: 2000,
    antiContexte: 2000,
    paradoxe: 600,
    phraseAntiValeurs: 400,
    talonAchille: 600,
    sousPression: 600,
  } satisfies Record<ChampTexte, number>,
  listes: {
    autresTitres: [6, 120],
    reussite: [8, 300],
    echec: [8, 300],
    qualites: [10, 120],
    defauts: [10, 120],
    valeurs: [10, 120],
    antiValeurs: [10, 120],
    aimeQuand: [8, 200],
    managerIdeal: [8, 200],
    contraintes: [8, 200],
    conseils: [6, 300],
    vigilance: [6, 300],
    axes: [6, 300],
    etapes: [5, 300],
    metiersParfaits: [8, 120],
    metiersTres: [8, 120],
    metiersCondition: [8, 120],
    secteurs: [6, 200],
    questions: [10, 300],
    offres: [6, 300],
    prochainesEtapes: [10, 300],
    archetypes: [2, 40],
  } satisfies Record<ChampListe, [number, number]>,
  enneagramme: 80,
  avatars: { nombre: 3, texte: 400 },
  /** Minimums des champs obligatoires (ceux du Cibleur). */
  minimums: { mecanisme: 12, contexte: 12, benefice: 12, antiContexte: 8 } satisfies Record<ChampObligatoire, number>,
  /** Taille maximale du JSON enregistré (octets), comme la contrainte SQL. */
  octets: 60000,
} as const;

export const CHAMPS_TEXTE = Object.keys(LIMITES_FICHE.textes) as ChampTexte[];
export const CHAMPS_LISTE = Object.keys(LIMITES_FICHE.listes) as ChampListe[];

export function ficheVide(): FicheTalent {
  return {
    v: 1,
    prenom: "",
    titre: "",
    autresTitres: [],
    resume: "",
    mecanisme: "",
    contexte: "",
    benefice: "",
    antiContexte: "",
    reussite: [],
    echec: [],
    qualites: [],
    defauts: [],
    paradoxe: "",
    valeurs: [],
    antiValeurs: [],
    phraseAntiValeurs: "",
    enneagramme: { base: "", sousType: "" },
    aimeQuand: [],
    managerIdeal: [],
    contraintes: [],
    conseils: [],
    talonAchille: "",
    sousPression: "",
    vigilance: [],
    axes: [],
    etapes: [],
    metiersParfaits: [],
    metiersTres: [],
    metiersCondition: [],
    secteurs: [],
    avatars: [],
    questions: [],
    offres: [],
    prochainesEtapes: [],
    archetypes: [],
  };
}

/** Clé de comparaison : minuscules, sans accents. */
const cleDoublon = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Coupe au mot si possible. */
export function couper(t: string, max: number): string {
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  const espace = coupe.lastIndexOf(" ");
  return (espace > max * 0.6 ? coupe.slice(0, espace) : coupe).trim();
}

function texte(v: unknown, max: number): string {
  return couper(normaliser(typeof v === "string" ? v : ""), max);
}

function liste(v: unknown, items: number, max: number): string[] {
  if (!Array.isArray(v)) return [];
  const vus = new Set<string>();
  const sortie: string[] = [];
  for (const x of v) {
    if (typeof x !== "string") continue;
    const t = couper(normaliser(x).replace(/\n+/g, " "), max);
    const cle = cleDoublon(t);
    if (!t || vus.has(cle)) continue;
    vus.add(cle);
    sortie.push(t);
  }
  return sortie.slice(0, items);
}

const objet = (v: unknown): Record<string, unknown> => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** Fiche propre et bornée à partir de n'importe quoi. Champs inconnus ignorés, v forcé à 1. */
export function bornerFiche(brut: unknown): FicheTalent {
  const o = objet(brut);
  const f = ficheVide();
  for (const c of CHAMPS_TEXTE) (f[c] as string) = texte(o[c], LIMITES_FICHE.textes[c]);
  for (const c of CHAMPS_LISTE) {
    const [items, max] = LIMITES_FICHE.listes[c];
    (f[c] as string[]) = liste(o[c], items, max);
  }
  const e = objet(o.enneagramme);
  f.enneagramme = { base: texte(e.base, LIMITES_FICHE.enneagramme), sousType: texte(e.sousType, LIMITES_FICHE.enneagramme) };
  const avatars: Avatar[] = [];
  if (Array.isArray(o.avatars)) {
    for (const a of o.avatars) {
      const x = objet(a);
      const max = LIMITES_FICHE.avatars.texte;
      const av = { profil: texte(x.profil, max), besoins: texte(x.besoins, max), apport: texte(x.apport, max) };
      if (av.profil) avatars.push(av);
    }
  }
  f.avatars = avatars.slice(0, LIMITES_FICHE.avatars.nombre);
  return f;
}

export interface ErreurFiche {
  champ: ChampObligatoire;
  code: "requis" | "trop_court";
}

export type ResultatFiche = { ok: true; fiche: FicheTalent } | { ok: false; erreurs: ErreurFiche[] };

/** Fiche bornée + champs obligatoires (mêmes minimums que le Cibleur). */
export function validerFiche(brut: unknown): ResultatFiche {
  const fiche = bornerFiche(brut);
  const erreurs: ErreurFiche[] = [];
  for (const champ of CHAMPS_OBLIGATOIRES) {
    const t = fiche[champ];
    if (!t) erreurs.push({ champ, code: "requis" });
    else if (t.length < LIMITES_FICHE.minimums[champ]) erreurs.push({ champ, code: "trop_court" });
  }
  if (erreurs.length) return { ok: false, erreurs };
  if (new TextEncoder().encode(JSON.stringify(fiche)).length > LIMITES_FICHE.octets) return { ok: false, erreurs: [{ champ: "mecanisme", code: "requis" }] };
  return { ok: true, fiche };
}

/** Champs non vides (pour le badge « trouvé dans ta fiche » à la relecture). */
export function champsRemplis(f: FicheTalent): (keyof FicheTalent)[] {
  const sortie: (keyof FicheTalent)[] = [];
  for (const c of CHAMPS_TEXTE) if (f[c]) sortie.push(c);
  for (const c of CHAMPS_LISTE) if (f[c].length) sortie.push(c);
  if (f.enneagramme.base || f.enneagramme.sousType) sortie.push("enneagramme");
  if (f.avatars.length) sortie.push("avatars");
  return sortie;
}
