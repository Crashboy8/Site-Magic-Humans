// Étape 3 du lecteur (cahier D.3) : quelle ligne ouvre quelle section. Module pur.

export type Section =
  | "ignorer"
  | "neutre"
  | "titre"
  | "autresTitres"
  | "resume"
  | "formulation"
  | "valeur"
  | "paradoxe"
  | "contextes"
  | "conseils"
  | "enneagramme"
  | "valeurs"
  | "ecologie"
  | "details"
  | "etapes"
  | "metiers"
  | "avatars"
  | "questions"
  | "offres"
  | "actions";

/** Motifs essayés dans cet ordre, sur cle(t), ancrés au début sauf mention contraire. */
export const MOTIFS_SECTIONS: [Section, RegExp[]][] = [
  ["ignorer", [/^informations generales/, /^menu\b/, /^autres pages/, /^lien (conv|video|de la conversation)/, /^compte rendu/, /^plan d'apprentissage/, /^conseils chat ?gpt/, /^une partie prise de notes/]],
  ["neutre", [/^resume (global|de tout)/]],
  ["titre", [/^titre du talent/]],
  ["autresTitres", [/^autres titres possibles/]],
  ["resume", [/^phrases qui resument/, /^(le )?talent identifie/, /^dit plus simplement/]],
  ["formulation", [/^formulation du talent unique/, /^son talent en une phrase/]],
  ["valeur", [/^valeur de ce talent/]],
  ["paradoxe", [/^(explication du )?lien paradoxal/, /^qualites et defauts/, /matrice paradoxale/]],
  ["contextes", [/^contextes? du talent unique/, /^(son |mon )?contexte declencheur\s*$/, /^contexte ideal/, /^contexte piege/, /^ce qui (le|la) fait vibrer/]],
  ["conseils", [/^conseils pour mieux/]],
  ["enneagramme", [/^enneagramme/]],
  ["valeurs", [/^valeurs et anti-?valeurs/]],
  ["ecologie", [/^ecologie de travail/]],
  ["details", [/^details du talent/]],
  ["etapes", [/^(les )?etapes (du|de mon) talent/]],
  ["metiers", [/^(les )?metiers potentiels/]],
  ["avatars", [/^(le )?client ideal/, /^les personnes qu'(il|elle) aide/]],
  ["questions", [/^questions a poser/]],
  ["offres", [/^offres possibles/]],
  ["actions", [/^recommandations strategiques/, /^actions a mettre en place/, /^prochaines etapes/]],
];

/** Section ouverte par cette clé, ou null. `titre` : la ligne était un titre Markdown. */
export function sectionDe(c: string, titre: boolean): Section | null {
  if (!titre && c.length > 90) return null;
  for (const [section, motifs] of MOTIFS_SECTIONS) {
    if (motifs.some((m) => m.test(c))) return section;
  }
  return null;
}
