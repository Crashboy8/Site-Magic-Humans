import { LIMITES } from "@/domain/maCible/limites";
import type { IdCible, Verdict } from "@/domain/maCible/types";
import { idChamp } from "./erreurs";

export interface Ecart {
  id: string;
  message: string;
}

interface AvisSaisi {
  verdict: Verdict | "";
  commentaire: string;
}

/** Premier point bloquant de l'esquisse, dans l'ordre de l'écran. */
export function ecartEsquisse(
  cibles: { id: IdCible; nom: string }[],
  offre: string,
  avis: (id: IdCible) => AvisSaisi,
  messages: {
    manqueOffre: string;
    manqueAvis: (nom: string) => string;
    manqueCommentaire: (nom: string) => string;
  },
): Ecart | null {
  if (offre.trim().length < LIMITES.correctionOffre.min) return { id: idChamp("esquisse.offre"), message: messages.manqueOffre };
  for (const c of cibles) {
    const a = avis(c.id);
    if (!a.verdict) return { id: `verdict-${c.id}`, message: messages.manqueAvis(c.nom) };
    const commentaireDu = a.verdict === "en_partie" || a.verdict === "non";
    if (commentaireDu && a.commentaire.trim().length < LIMITES.commentaire.min) {
      return { id: `commentaire-${c.id}`, message: messages.manqueCommentaire(c.nom) };
    }
  }
  return null;
}

/** Première question sans réponse. `n` commence à 1. */
export function ecartQuestions(questions: { id: string }[], manquantes: boolean[], message: (n: number) => string): Ecart | null {
  const i = manquantes.findIndex(Boolean);
  if (i < 0) return null;
  return { id: `question-${questions[i].id}`, message: message(i + 1) };
}
