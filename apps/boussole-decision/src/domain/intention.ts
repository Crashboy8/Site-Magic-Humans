// « Demander l'avis de Pierre » : ce qu'une demande peut contenir, et sa lecture. Fonctions pures.
// La question est une donnée écrite par une personne : elle est gardée et affichée telle quelle, comme du texte,
// et n'est jamais donnée à une IA comme une instruction.

/** Les outils qui portent le bouton, dans l'ordre de la page coach/intentions. */
export const OUTILS_INTENTION = ["cibleur", "boussole-pro", "boussole-perso", "carte-talent", "quiz-talent", "quiz-amour", "ou-j-en-suis", "jeu"] as const;
export type OutilIntention = (typeof OUTILS_INTENTION)[number];

export const QUESTION_MAX = 500;
export const MAIL_MAX = 254;
/** Délai minimal entre l'ouverture du formulaire et l'envoi. */
export const DELAI_MIN_MS = 3_000;
/** Au-delà, le jeton du formulaire est trop vieux : on en redemande un. */
export const JETON_MAX_MS = 2 * 60 * 60 * 1000;

const ETAPE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function estOutil(v: unknown): v is OutilIntention {
  return typeof v === "string" && (OUTILS_INTENTION as readonly string[]).includes(v);
}

export function etapeValide(v: unknown): v is string {
  return typeof v === "string" && ETAPE.test(v);
}

export function mailValide(v: string): boolean {
  return v.length <= MAIL_MAX && MAIL.test(v);
}

/** Longueur d'une question telle que la base la compte (caractères, pas unités UTF-16). */
export function longueur(question: string): number {
  return Array.from(question).length;
}

export interface DemandeIntention {
  outil: OutilIntention;
  etape: string;
  question: string;
  /** Vide quand la personne n'en a pas donné (elle a un compte). */
  mail: string;
  accord: boolean;
  /** Champ pot de miel : rempli, c'est un robot. */
  piege: string;
  jeton: string;
}

export type LectureDemande = { ok: true; demande: DemandeIntention } | { ok: false; erreur: "invalide" | "question" | "mail" };

function texte(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Lit le corps JSON d'un envoi. Le mail est obligatoire plus tard, seulement si la personne n'a pas de compte. */
export function lireDemande(corps: unknown): LectureDemande {
  if (!corps || typeof corps !== "object" || Array.isArray(corps)) return { ok: false, erreur: "invalide" };
  const c = corps as Record<string, unknown>;
  if (!estOutil(c.outil) || !etapeValide(c.etape)) return { ok: false, erreur: "invalide" };
  const question = texte(c.question).trim();
  if (!question || longueur(question) > QUESTION_MAX) return { ok: false, erreur: "question" };
  const mail = texte(c.mail).trim().toLowerCase();
  if (mail && !mailValide(mail)) return { ok: false, erreur: "mail" };
  return {
    ok: true,
    demande: {
      outil: c.outil,
      etape: c.etape,
      question,
      mail,
      accord: c.accord === true,
      piege: texte(c.site),
      jeton: texte(c.jeton),
    },
  };
}
