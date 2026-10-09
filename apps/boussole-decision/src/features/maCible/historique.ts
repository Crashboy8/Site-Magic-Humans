// Historique des résultats du Cibleur, dans le navigateur. Au plus 10, du plus récent au plus ancien.
import { validerSyntheseEntree } from "@/domain/maCible/entree";
import { classerCibles } from "@/domain/maCible/scores";
import { lireExtras } from "@/domain/maCible/extras";
import { EXTRAS_VIDES, type EntreeMaCible, type Extras, type ResultatClasse } from "@/domain/maCible/types";
import { validerResultat } from "@/domain/maCible/validation";
import { NB_ACTIONS } from "./etat";

export const CLE_HISTORIQUE = "ma_cible_historique_v1";
export const MAX_HISTORIQUE = 10;

export interface EntreeHistorique {
  id: string;
  faitLe: string;
  entree: EntreeMaCible;
  resultat: ResultatClasse;
  coches: boolean[];
  extras?: Extras;
}

type Obj = Record<string, unknown>;
const objet = (v: unknown): Obj | null => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : null);

export function identifiantHistorique(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Ajoute en tête, retire un doublon d'identifiant, et ne garde que les 10 plus récents. */
export function ajouterEntree(liste: EntreeHistorique[], entree: EntreeHistorique): EntreeHistorique[] {
  return [entree, ...liste.filter((e) => e.id !== entree.id)].slice(0, MAX_HISTORIQUE);
}

function lireUne(v: unknown): EntreeHistorique | null {
  const o = objet(v);
  if (!o || typeof o.id !== "string" || o.id.length === 0 || typeof o.faitLe !== "string") return null;
  const entree = objet(o.entree);
  const talent = objet(entree?.talent);
  const terrain = objet(entree?.terrain);
  if (!entree || !talent || !terrain) return null;
  const brut = objet(o.resultat);
  if (!brut) return null;
  const { classement: _classement, ...sansClassement } = brut;
  void _classement;
  const valide = validerResultat(sansClassement);
  if (!valide.ok) return null;
  if (!Array.isArray(o.coches) || o.coches.length !== NB_ACTIONS || o.coches.some((c) => typeof c !== "boolean")) return null;
  const entreeBrut = entree as unknown as EntreeMaCible;
  const terrainLu = { ...entreeBrut.terrain, ciblesEnTete: Array.isArray(entreeBrut.terrain?.ciblesEnTete) ? entreeBrut.terrain.ciblesEnTete : [] };
  return {
    id: o.id,
    faitLe: o.faitLe,
    entree: {
      ...entreeBrut,
      terrain: terrainLu,
      synthese: (() => {
        const lue = validerSyntheseEntree(entreeBrut.synthese);
        return lue.ok ? lue.synthese : null;
      })(),
    },
    resultat: { ...valide.valeur, classement: classerCibles(valide.valeur.cibles) },
    coches: o.coches as boolean[],
    extras: o.extras === undefined ? EXTRAS_VIDES : lireExtras(o.extras),
  };
}

/** JSON illisible, ou qui n'est pas une liste : liste vide. Les entrées abîmées sont ignorées. */
export function normaliser(brut: string | null): EntreeHistorique[] {
  if (!brut) return [];
  try {
    const v = JSON.parse(brut);
    if (!Array.isArray(v)) return [];
    return v.flatMap((item) => {
      const lu = lireUne(item);
      return lu ? [lu] : [];
    }).slice(0, MAX_HISTORIQUE);
  } catch {
    return [];
  }
}

/**
 * Écrit la liste. Si le stockage est plein, retire le plus ancien et réessaie une fois.
 * N'échoue jamais : un échec laisse l'écran utilisable.
 */
export function persister(liste: EntreeHistorique[], ecrire: (json: string) => void): void {
  const bornee = liste.slice(0, MAX_HISTORIQUE);
  try {
    ecrire(JSON.stringify(bornee));
  } catch {
    try {
      ecrire(JSON.stringify(bornee.slice(0, -1)));
    } catch {
      // Stockage plein ou bloqué : on n'empêche pas la personne de continuer.
    }
  }
}

/** Au nouveau résultat, l'ancien courant entre dans l'historique. */
export function archiverCourant(liste: EntreeHistorique[], courant: EntreeHistorique | null): EntreeHistorique[] {
  if (!courant) return liste;
  return ajouterEntree(liste, courant);
}

/** L'entrée choisie sort de l'historique. Le courant, s'il existe, y entre. */
export function reprendreDansHistorique(liste: EntreeHistorique[], choisiId: string, courant: EntreeHistorique | null): EntreeHistorique[] {
  const sans = liste.filter((e) => e.id !== choisiId);
  return courant ? ajouterEntree(sans, courant) : sans;
}

export function lireHistorique(): EntreeHistorique[] {
  if (typeof window === "undefined") return [];
  try {
    return normaliser(window.localStorage.getItem(CLE_HISTORIQUE));
  } catch {
    return [];
  }
}

export function ecrireHistorique(liste: EntreeHistorique[]): void {
  if (typeof window === "undefined") return;
  persister(liste, (json) => {
    window.localStorage.setItem(CLE_HISTORIQUE, json);
  });
}

export function effacerHistorique(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE_HISTORIQUE);
  } catch {
    // rien à faire
  }
}
