// Un instantané de « Où j'en suis ? » : trois infos pour afficher « Mon parcours » dans les autres outils.
// L'application l'écrit à côté du profil (clé ou_j_en_suis_resume_v1). Les outils du site statique (Quiz, Carte du Talent)
// le lisent avec js/parcours-barre.js : ils n'ont pas le moteur, donc seules des valeurs prêtes à afficher y passent,
// et aucune réponse. Même origine (www.magichumans.com), même stockage du navigateur.
import { calculerPosition, pointsGagnes } from "@/domain/parcours/position";
import type { Profil } from "@/domain/parcours/profil";
import type { ParcoursPublic } from "@/domain/parcours/types";

export const CLE_INSTANTANE = "ou_j_en_suis_resume_v1";

export interface Instantane {
  v: 1;
  /** Date de la dernière modification (ISO). */
  maj: string;
  /** Le code de l'étape à travailler (« S2 »), deux en voie E (« E2 + S2 »), « IK » à la fin, vide tant que la voie est à choisir. */
  etape: string;
  /** Toutes les étapes de la voie sont franchies. */
  fin: boolean;
  points: number;
}

/** null tant que la personne n'a rien répondu. */
export function instantane(data: ParcoursPublic, profil: Profil, maj = new Date().toISOString()): Instantane | null {
  const position = calculerPosition(data, profil);
  if (!position) return null;
  const fin = position.etat === "termine";
  const etapes = fin ? [data.etapes.ikigai] : position.etat === "voie_a_choisir" ? [] : position.actuelles.map((id) => data.etapes[id]);
  return { v: 1, maj, etape: etapes.map((e) => e.code).join(" + "), fin, points: pointsGagnes(position) };
}

export function serialiserInstantane(i: Instantane): string {
  return JSON.stringify(i);
}

/** null si le texte est absent, illisible, d'une autre version ou hors des bornes. */
export function lireInstantane(brut: string | null): Instantane | null {
  if (!brut) return null;
  try {
    const o = JSON.parse(brut) as Partial<Instantane> | null;
    if (!o || o.v !== 1) return null;
    const { maj, etape, fin, points } = o;
    if (typeof maj !== "string" || typeof etape !== "string" || typeof fin !== "boolean") return null;
    if (etape.length > 14 || !/^[A-Za-z0-9 +]*$/.test(etape)) return null;
    if (typeof points !== "number" || !Number.isInteger(points) || points < 0 || points > 100000) return null;
    return { v: 1, maj, etape, fin, points };
  } catch {
    return null;
  }
}
