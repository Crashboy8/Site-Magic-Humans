// Apparence d'une relation (Boussole Relation) : icône, couleur, jauge, phrases de lecture.
// Module pur. Le mode pro n'importe pas ce fichier.
//
// Stockage : le nom vit dans la colonne opportunities.name. Il n'y a pas de colonne JSON,
// et on n'exige pas de migration. Les champs icon et color sont lus s'ils existent.
// Sinon l'apparence est glissée dans notes (même ligne que le nom) derrière un marqueur
// invisible, et recopiée dans le navigateur (localStorage) si l'écriture en base échoue.
import { LOVE_RESULTS } from "@/content/amour";
import type { OpportunityResult } from "./scoring";
import type { RelationColor, RelationIcon } from "./types";

export const RELATION_ICONS: readonly RelationIcon[] = [
  "coeur",
  "etoile",
  "soleil",
  "lune",
  "montagne",
  "vague",
  "fleur",
  "feuille",
  "flamme",
  "maison",
];

export const RELATION_COLORS: readonly RelationColor[] = [
  "corail",
  "framboise",
  "miel",
  "abricot",
  "eau",
  "sauge",
  "lilas",
  "ciel",
];

/** Teintes d'icône et de tracé : vives, lisibles sur crème, sans bleu foncé. */
export const COULEUR_RELATION: Record<RelationColor, string> = {
  corail: "#e2683a",
  framboise: "#d4537e",
  miel: "#e0a106",
  abricot: "#f08a3c",
  eau: "#2a9d8f",
  sauge: "#6d9a62",
  lilas: "#a678d4",
  ciel: "#3aa0d8",
};

export const COULEUR_JAUGE = {
  sauge: "#6d9a62",
  miel: "#e0a106",
  corail: "#e2683a",
} as const;

export const COULEUR_ETAT = {
  nourri: "#3f7a4a",
  partiel: "#c48a00",
  absent: "#d15a45",
} as const;

export type TonJauge = keyof typeof COULEUR_JAUGE;
export type EtatBesoin = keyof typeof COULEUR_ETAT;

export interface RelationLook {
  icon: RelationIcon;
  color: RelationColor;
}

const ICONES = new Set<string>(RELATION_ICONS);
const COULEURS = new Set<string>(RELATION_COLORS);

export function estIcone(valeur: unknown): valeur is RelationIcon {
  return typeof valeur === "string" && ICONES.has(valeur);
}

export function estCouleur(valeur: unknown): valeur is RelationColor {
  return typeof valeur === "string" && COULEURS.has(valeur);
}

/**
 * Prochaine icône et prochaine couleur encore libres.
 * Chaque relation reçoit une combinaison différente tant qu'il reste des teintes et des icônes.
 */
export function apparenceParDefaut(deja: readonly RelationLook[]): RelationLook {
  const icones = new Set(deja.map((d) => d.icon));
  const couleurs = new Set(deja.map((d) => d.color));
  const icon = RELATION_ICONS.find((i) => !icones.has(i)) ?? RELATION_ICONS[deja.length % RELATION_ICONS.length];
  const color = RELATION_COLORS.find((c) => !couleurs.has(c)) ?? RELATION_COLORS[deja.length % RELATION_COLORS.length];
  return { icon, color };
}

type RelationSource = { id: string; position: number; icon?: RelationIcon; color?: RelationColor };

/** Complète les relations sans apparence enregistrée, dans l'ordre des colonnes. */
export function apparencesResolues<T extends RelationSource>(relations: readonly T[]): (T & RelationLook)[] {
  const ordre = [...relations].sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
  const parId = new Map<string, RelationLook>();
  const choisis: RelationLook[] = [];
  for (const relation of ordre) {
    const look = relation.icon && relation.color ? { icon: relation.icon, color: relation.color } : apparenceParDefaut(choisis);
    choisis.push(look);
    parId.set(relation.id, look);
  }
  return relations.map((relation) => ({ ...relation, ...parId.get(relation.id)! }));
}

/** Vert sauge dès 70 %, miel de 45 à 69 %, corail en dessous. On compare le pourcentage affiché. */
export function tonJauge(pourcent: number): TonJauge {
  const n = Math.round(pourcent);
  if (n >= 70) return "sauge";
  if (n >= 45) return "miel";
  return "corail";
}

export function couleurJauge(pourcent: number): string {
  return COULEUR_JAUGE[tonJauge(pourcent)];
}

/** 100 % : nourri. 0 % : pas nourri. Entre les deux : en partie. */
export function etatBesoinEssentiel(satisfaction: number): EtatBesoin {
  if (satisfaction >= 100) return "nourri";
  if (satisfaction <= 0) return "absent";
  return "partiel";
}

export function phraseBesoin(etat: EtatBesoin, nom: string, critere: string): string {
  if (etat === "nourri") return LOVE_RESULTS.needNourri(nom, critere);
  if (etat === "partiel") return LOVE_RESULTS.needPartiel(nom, critere);
  return LOVE_RESULTS.needAbsent(nom, critere);
}

export interface LigneBesoin {
  criterionId: string;
  etat: EtatBesoin;
  critere: string;
  nom: string;
  phrase: string;
}

/** Une phrase par besoin essentiel (non négociable) évalué, pour cette relation. */
export function lignesBesoins(result: Pick<OpportunityResult, "opportunity" | "details">): LigneBesoin[] {
  return result.details
    .filter((d) => d.criterion.nonNegotiable && d.satisfaction !== null)
    .map((d) => {
      const etat = etatBesoinEssentiel(d.satisfaction as number);
      const critere = d.criterion.label;
      const nom = result.opportunity.name;
      return { criterionId: d.criterion.id, etat, critere, nom, phrase: phraseBesoin(etat, nom, critere) };
    });
}

/** Espace insécable avant % : ; ? ! pour que la ponctuation ne passe pas seule à la ligne. */
export function espacesFins(texte: string): string {
  return texte.replace(/ ([%:;?!])/g, "\u00a0$1");
}

const MARQUE = /^\u2060BR1:([a-z]+):([a-z]+)\u2060/;

/**
 * Lit l'apparence cachée au début des notes. Les notes du mode pro, sans marqueur, restent intactes.
 * Le marqueur (U+2060) n'est pas affiché.
 */
export function lireApparenceNotes(notes: string): { look: RelationLook | null; notes: string } {
  const m = notes.match(MARQUE);
  if (!m) return { look: null, notes };
  const icon = estIcone(m[1]) ? m[1] : null;
  const color = estCouleur(m[2]) ? m[2] : null;
  const reste = notes.slice(m[0].length);
  return { look: icon && color ? { icon, color } : null, notes: reste };
}

/** Replace le marqueur sans toucher au texte de notes qui suit. */
export function ecrireApparenceNotes(notes: string, look: RelationLook): string {
  const propre = lireApparenceNotes(notes).notes;
  return `\u2060BR1:${look.icon}:${look.color}\u2060${propre}`;
}

/** Vrai si PostgREST ou Postgres refuse la colonne (pas encore migrée). */
export function colonneAbsente(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === "PGRST204" || error.code === "42703") return true;
  return /column|schema cache/i.test(error.message ?? "");
}
