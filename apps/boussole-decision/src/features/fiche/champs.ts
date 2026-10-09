// Répartition des champs de la fiche à l'écran (E.5) et passage formulaire ⇄ fiche. Module pur.
import { bornerFiche } from "@/domain/fiche/bornes";
import { CHAMPS_OBLIGATOIRES, type ChampListe, type ChampObligatoire, type ChampTexte, type FicheTalent } from "@/domain/fiche/types";

export type ChampEcran = ChampTexte | ChampListe | "avatars" | "enneagramme";
export type CleGroupe = "essentiel" | "outils" | "reste";

export const GROUPES: { cle: CleGroupe; ouvert: boolean; champs: ChampEcran[] }[] = [
  { cle: "essentiel", ouvert: true, champs: ["titre", "mecanisme", "contexte", "benefice", "antiContexte", "valeurs", "reussite", "echec"] },
  { cle: "outils", ouvert: true, champs: ["qualites", "defauts", "aimeQuand", "metiersParfaits", "offres", "avatars"] },
  {
    cle: "reste",
    ouvert: false,
    champs: [
      "autresTitres", "resume", "paradoxe", "antiValeurs", "enneagramme", "managerIdeal", "contraintes", "conseils", "talonAchille",
      "sousPression", "vigilance", "axes", "etapes", "metiersTres", "metiersCondition", "secteurs", "questions", "prochainesEtapes",
    ],
  },
];

/** Champs affichés en zone de texte (les autres textes courts en ligne simple). */
export const TEXTES_LONGS: readonly ChampTexte[] = ["mecanisme", "contexte", "benefice", "antiContexte", "resume", "paradoxe", "talonAchille", "sousPression"];

export function estObligatoire(c: ChampEcran): c is ChampObligatoire {
  return (CHAMPS_OBLIGATOIRES as readonly string[]).includes(c);
}

/** Formulaire : chaque champ est une chaîne (listes : une idée par ligne). */
export interface Formulaire {
  textes: Record<string, string>;
  avatars: { profil: string; besoins: string; apport: string }[];
  enneagramme: { base: string; sousType: string };
}

export function versFormulaire(f: FicheTalent): Formulaire {
  const textes: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(f)) {
    if (typeof valeur === "string") textes[cle] = valeur;
    else if (Array.isArray(valeur) && cle !== "avatars") textes[cle] = (valeur as string[]).join("\n");
  }
  const avatars = [0, 1, 2].map((i) => ({ profil: f.avatars[i]?.profil ?? "", besoins: f.avatars[i]?.besoins ?? "", apport: f.avatars[i]?.apport ?? "" }));
  return { textes, avatars, enneagramme: { ...f.enneagramme } };
}

/** Fiche bornée à partir du formulaire ; garde les champs non affichés (prénom, archétypes…). */
export function depuisFormulaire(base: FicheTalent, form: Formulaire): FicheTalent {
  const brut: Record<string, unknown> = { ...base };
  for (const [cle, valeur] of Object.entries(form.textes)) {
    const actuel = (base as unknown as Record<string, unknown>)[cle];
    brut[cle] = Array.isArray(actuel) ? valeur.split("\n").map((l) => l.trim()).filter(Boolean) : valeur;
  }
  brut.avatars = form.avatars.filter((a) => a.profil.trim() || a.besoins.trim() || a.apport.trim());
  brut.enneagramme = form.enneagramme;
  return bornerFiche(brut);
}

/** Un champ est-il rempli ? */
export function rempli(f: FicheTalent, c: ChampEcran): boolean {
  if (c === "enneagramme") return Boolean(f.enneagramme.base || f.enneagramme.sousType);
  const v = f[c];
  return Array.isArray(v) ? v.length > 0 : Boolean(v);
}
