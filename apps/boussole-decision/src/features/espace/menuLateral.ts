// Menu latéral de la Boussole : quelle rubrique est la rubrique courante, d'après l'adresse. Module pur.

export type Rubrique = "espace" | "profils" | "commentaires" | "coach" | "compte" | "sauvegarder";
export type EtapeVersion = "tableau" | "resultats";

const segments = (chemin: string) => chemin.split(/[?#]/)[0].split("/").filter(Boolean);

/** La rubrique où se trouve la personne, ou `null` hors des pages de l'application. */
export function rubriqueActive(chemin: string): Rubrique | null {
  const [premier] = segments(chemin);
  switch (premier) {
    case undefined:
    case "profils":
    case "versions":
      return "profils";
    case "mon-espace":
      return "espace";
    case "commentaires":
      return "commentaires";
    case "coach":
      return "coach";
    case "compte":
      return "compte";
    case "sauvegarder":
      return "sauvegarder";
    default:
      return null;
  }
}

/** Dans une version : son identifiant et l'étape ouverte (`criteres` redirige vers le tableau). */
export function versionOuverte(chemin: string): { id: string; etape: EtapeVersion | null } | null {
  const [premier, id, etape] = segments(chemin);
  if (premier !== "versions" || !id) return null;
  return { id, etape: etape === "tableau" || etape === "criteres" ? "tableau" : etape === "resultats" ? "resultats" : null };
}
