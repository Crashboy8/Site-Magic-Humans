// État de Ma Cible et réducteur des étapes (§6.5, §12.5). Module pur : aucun accès au navigateur.
import type { AncreLue } from "@/domain/maCible/ancre";
import type { Cadrage, Corrections, EntreeMaCible, Langue, Reponse, ResultatClasse, Talent, Terrain } from "@/domain/maCible/types";

export const ETAPES = ["accueil", "talent", "terrain", "questions", "esquisse", "resultat"] as const;
export type Etape = (typeof ETAPES)[number];

/** Nombre d'actions du plan sur 30 jours (4 semaines de 3). */
export const NB_ACTIONS = 12;

export interface Etat {
  v: 1;
  maj: string;
  etape: Etape;
  entree: EntreeMaCible;
  /** Le prénom ne quitte jamais le navigateur : il n'est pas dans `entree`. */
  prenom: string;
  cadrage: Cadrage | null;
  tour: 1 | 2 | 3;
  nouvelleEsquisseFaite: boolean;
  corrections: Corrections | null;
  resultat: ResultatClasse | null;
  /** Date de réception du résultat (ISO). */
  resultatLe: string | null;
  coches: boolean[];
}

export const TALENT_VIDE: Talent = { nom: "", mecanisme: "", contexte: "", benefice: "", antiContexte: "", reussite: "", sousTalents: [], pistes: [], aDeleguer: [] };
export const TERRAIN_VIDE: Terrain = { offre: "", marche: "", experience: "", clientsPasses: "", formats: [], zone: "", prixActuel: "", adresse: "vous", style: "chaleureux" };

/** La langue envoyée à l'IA : celle de l'interface, si elle existe dans cette langue (en v1, seul le français). */
const LANGUES_INTERFACE: readonly Langue[] = ["fr"];
export const langueEntree = (locale: string): Langue => (LANGUES_INTERFACE as readonly string[]).includes(locale) ? (locale as Langue) : "fr";

export function etatInitial(locale = "fr", maintenant = new Date()): Etat {
  return {
    v: 1,
    maj: maintenant.toISOString(),
    etape: "accueil",
    entree: { v: 1, langue: langueEntree(locale), source: null, talent: { ...TALENT_VIDE }, terrain: { ...TERRAIN_VIDE }, reponses: [] },
    prenom: "",
    cadrage: null,
    tour: 1,
    nouvelleEsquisseFaite: false,
    corrections: null,
    resultat: null,
    resultatLe: null,
    coches: Array<boolean>(NB_ACTIONS).fill(false),
  };
}

/** Vrai si la personne a déjà avancé (au-delà de l'accueil, ou un début de terrain). Un talent pré-rempli seul ne compte pas. */
export function travailExiste(e: Etat): boolean {
  const t = e.entree.terrain;
  return e.etape !== "accueil" || Boolean(t.offre || t.experience || t.clientsPasses || t.zone || e.resultat);
}

export type Action =
  | { type: "charger"; etat: Etat }
  | { type: "aller"; etape: Etape }
  | { type: "talent"; patch: Partial<Talent> }
  | { type: "terrain"; patch: Partial<Terrain> }
  | { type: "prenom"; prenom: string }
  | { type: "ancre"; ancre: AncreLue }
  | { type: "reponses"; tour: 1 | 2 | 3; reponses: { id: string; question: string; reponse: string }[] }
  | { type: "cadrage"; tour: 1 | 2 | 3; cadrage: Cadrage }
  | { type: "corrections"; corrections: Corrections }
  | { type: "resultat"; resultat: ResultatClasse; maintenant: string }
  | { type: "coche"; index: number }
  | { type: "recommencer"; locale?: string };

const memes = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Une modification du talent ou du terrain invalide l'esquisse : retour au cadrage tour 1 au prochain « Continuer ». */
function invalider(e: Etat): Etat {
  if (!e.cadrage) return e;
  return { ...e, cadrage: null, tour: 1, nouvelleEsquisseFaite: false, corrections: null };
}

/** Une question du tour `tour` : identifiant `t{tour}-{id}`, remplacé si la même réponse existe déjà. */
export function ajouterReponses(existantes: Reponse[], tour: number, nouvelles: { id: string; question: string; reponse: string }[]): Reponse[] {
  const ids = new Set(nouvelles.map((r) => `t${tour}-${r.id}`));
  return [...existantes.filter((r) => !ids.has(r.id)), ...nouvelles.map((r) => ({ id: `t${tour}-${r.id}`, question: r.question, reponse: r.reponse }))];
}

/** « Me proposer une autre esquisse » : au moins 2 cibles « non », et une seule fois. */
export function peutNouvelleEsquisse(e: Pick<Etat, "nouvelleEsquisseFaite">, corrections: Pick<Corrections, "cibles"> | null): boolean {
  if (e.nouvelleEsquisseFaite || !corrections) return false;
  return corrections.cibles.filter((c) => c.verdict === "non").length >= 2;
}

export function reducteur(e: Etat, a: Action): Etat {
  switch (a.type) {
    case "charger":
      return a.etat;
    case "aller":
      return { ...e, etape: a.etape };
    case "talent": {
      const talent = { ...e.entree.talent, ...a.patch };
      if (memes(talent, e.entree.talent)) return e;
      return invalider({ ...e, entree: { ...e.entree, talent } });
    }
    case "terrain": {
      const terrain = { ...e.entree.terrain, ...a.patch };
      if (memes(terrain, e.entree.terrain)) return e;
      return invalider({ ...e, entree: { ...e.entree, terrain } });
    }
    case "prenom":
      return { ...e, prenom: a.prenom };
    case "ancre": {
      const talent = { ...e.entree.talent, ...a.ancre.talent };
      return invalider({ ...e, entree: { ...e.entree, source: a.ancre.source, talent } });
    }
    case "reponses":
      return { ...e, entree: { ...e.entree, reponses: ajouterReponses(e.entree.reponses, a.tour, a.reponses) } };
    case "cadrage": {
      const { cadrage, tour } = a;
      if (cadrage.statut === "questions") return { ...e, cadrage, tour, etape: "questions" };
      if (cadrage.statut === "esquisse") {
        return { ...e, cadrage, tour, etape: "esquisse", corrections: null, nouvelleEsquisseFaite: e.nouvelleEsquisseFaite || tour === 3 };
      }
      return { ...e, cadrage: null, tour: 1, etape: "terrain" }; // hors_sujet : le message est affiché par l'écran
    }
    case "corrections":
      return { ...e, corrections: a.corrections };
    case "resultat":
      return { ...e, resultat: a.resultat, resultatLe: a.maintenant, etape: "resultat", coches: Array<boolean>(NB_ACTIONS).fill(false) };
    case "coche": {
      if (a.index < 0 || a.index >= NB_ACTIONS) return e;
      const coches = e.coches.slice();
      coches[a.index] = !coches[a.index];
      return { ...e, coches };
    }
    case "recommencer":
      return etatInitial(a.locale);
  }
}
