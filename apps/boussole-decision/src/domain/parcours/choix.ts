// Le choix de voie, quand on mène deux projets en même temps : on coche un côté entrepreneur et un côté salarié.
// Deux voies cochées donnent la voie E (hybride), qui existe déjà dans parcours.json : les deux branches en même temps.
// Seule la voie résultante est gardée (E), avec une marque quand la personne est freelance et cherche un poste.
import type { ChoixVoie } from "./types";

/** Les voies qui visent une activité d'indépendant. */
export const COTE_ENTREPRENEUR: readonly ChoixVoie[] = ["A", "C"];
/** Les voies qui visent un poste de salarié. */
export const COTE_SALARIE: readonly ChoixVoie[] = ["B", "D"];

const COMBINABLES: readonly ChoixVoie[] = [...COTE_ENTREPRENEUR, ...COTE_SALARIE];
const ORDRE: readonly ChoixVoie[] = ["A", "B", "C", "D", "E", "K", "inconnue"];

const cote = (voie: ChoixVoie) => (COTE_ENTREPRENEUR.includes(voie) ? COTE_ENTREPRENEUR : COTE_SALARIE);

/**
 * Freelance qui cherche un poste : « entrepreneur » (A) et « entrepreneur qui veut redevenir salarié » (D) cochés ensemble.
 * Les autres paires gardent un emploi (ou le visent) : leur voie E garde le point d'attention sur le contrat de travail.
 */
export function freelanceCherchePoste(coches: readonly ChoixVoie[]): boolean {
  return coches.length === 2 && coches.includes("A") && coches.includes("D");
}

/** Les cases cochées au départ : celle de la voie déjà choisie, ou A et D pour un freelance qui cherche un poste. */
export function cochesDeLaVoie(voie: ChoixVoie | null, freelance = false): ChoixVoie[] {
  if (voie === "E" && freelance) return ["A", "D"];
  return voie === null ? [] : [voie];
}

/**
 * Coche ou décoche une case.
 * - E, « Je veux d'abord mieux me connaître » et « Je ne sais pas encore » se choisissent seuls.
 * - Une voie entrepreneur (A, C) et une voie salarié (B, D) se combinent : au plus deux cases, une de chaque côté.
 * - Cocher une voie du même côté que celle déjà cochée la remplace.
 */
export function basculer(coches: readonly ChoixVoie[], voie: ChoixVoie): ChoixVoie[] {
  if (coches.includes(voie)) return coches.filter((c) => c !== voie);
  if (!COMBINABLES.includes(voie)) return [voie];
  const gardees = coches.filter((c) => COMBINABLES.includes(c) && !cote(voie).includes(c));
  return [...gardees, voie].sort((a, b) => ORDRE.indexOf(a) - ORDRE.indexOf(b));
}

/** La voie que donnent les cases cochées : aucune, la voie cochée, ou E quand on en coche deux. */
export function voieDesCoches(coches: readonly ChoixVoie[]): ChoixVoie | null {
  if (coches.length === 0) return null;
  return coches.length === 1 ? coches[0] : "E";
}
