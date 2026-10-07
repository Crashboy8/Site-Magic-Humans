// Grille de notation et calcul du score des cibles (§9). Fonctions pures et déterministes.
import type { Cible, IdCible } from "./types";

export type CleCritere = "urgence" | "paiement" | "acces" | "plaisir";

/** Grille affichée aussi dans l'interface. Les notes 2 et 4 sont intermédiaires (voir GRILLE_TEXTE). */
export const GRILLE: readonly { cle: CleCritere; libelle: string; poids: number; un: string; trois: string; cinq: string }[] = [
  {
    cle: "urgence",
    libelle: "Urgence du problème",
    poids: 30,
    un: "« Ce serait bien un jour », personne ne cherche",
    trois: "Gêne réelle, la cible cherche quand ça déborde",
    cinq: "Douleur aiguë, elle cherche activement une solution maintenant",
  },
  {
    cle: "paiement",
    libelle: "Capacité à payer",
    poids: 25,
    un: "Pas de budget, attend du gratuit",
    trois: "Peut payer de sa poche ou obtenir un budget en se battant",
    cinq: "Budget dédié et habitude d'acheter ce type de prestation à ce prix",
  },
  {
    cle: "acces",
    libelle: "Facilité d'accès",
    poids: 20,
    un: "Personne dans l'entourage, aucun lieu où elle se rassemble",
    trois: "Joignable par des canaux identifiés, sans contact direct",
    cinq: "Déjà dans ton réseau ou ton expérience",
  },
  {
    cle: "plaisir",
    libelle: "Plaisir de ton talent",
    poids: 25,
    un: "Ressemble à ton Anti-Contexte",
    trois: "Neutre",
    cinq: "C'est exactement ton Contexte Déclencheur",
  },
];

export const POIDS = { urgence: 0.30, paiement: 0.25, acces: 0.20, plaisir: 0.25 } as const;

export function scoreSur10(s: Cible["scores"]): number {
  const somme = POIDS.urgence * s.urgence.note + POIDS.paiement * s.paiement.note + POIDS.acces * s.acces.note + POIDS.plaisir * s.plaisir.note;
  return Math.round(somme * 20) / 10; // somme sur 5 → sur 10, arrondi au dixième
}

export type Rang = "prioritaire" | "secondaire" | "tertiaire";
export type MotifDepartage = "plaisir" | "urgence" | "identifiant";
export interface LigneClassement {
  id: IdCible;
  score: number;
  rang: Rang;
  alertePlaisir: boolean;
  /** Présent quand le score affiché a été baissé d'un dixième pour sortir d'une égalité. */
  departage?: MotifDepartage;
}

const RANGS: readonly Rang[] = ["prioritaire", "secondaire", "tertiaire"];

/**
 * Classe les cibles : d'abord celles sans alerte plaisir (note de plaisir de 2 au plus), puis score décroissant,
 * plaisir décroissant, urgence décroissante, enfin `id` croissant.
 */
export function classerCibles(cibles: readonly Pick<Cible, "id" | "scores">[]): LigneClassement[] {
  const lignes = cibles.map((c) => ({
    id: c.id,
    score: scoreSur10(c.scores),
    alertePlaisir: c.scores.plaisir.note <= 2,
    plaisir: c.scores.plaisir.note,
    urgence: c.scores.urgence.note,
  }));
  lignes.sort(
    (a, b) =>
      Number(a.alertePlaisir) - Number(b.alertePlaisir) ||
      b.score - a.score ||
      b.plaisir - a.plaisir ||
      b.urgence - a.urgence ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  const departages: (MotifDepartage | undefined)[] = lignes.map(() => undefined);
  for (let i = 1; i < lignes.length; i++) {
    const avant = lignes[i - 1];
    const courant = lignes[i];
    if (avant.alertePlaisir !== courant.alertePlaisir) continue;
    if (courant.score < avant.score) continue;
    departages[i] = avant.plaisir !== courant.plaisir ? "plaisir" : avant.urgence !== courant.urgence ? "urgence" : "identifiant";
    courant.score = Math.max(0, Math.round((avant.score - 0.1) * 10) / 10);
  }
  return lignes.map((l, i) => ({
    id: l.id,
    score: l.score,
    rang: RANGS[i] ?? "tertiaire",
    alertePlaisir: l.alertePlaisir,
    ...(departages[i] ? { departage: departages[i] } : {}),
  }));
}
