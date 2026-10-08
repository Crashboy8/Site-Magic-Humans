// Étapes 1 et 2 du lecteur (cahier D.3) : texte façon Markdown → lignes propres, et clé de comparaison. Module pur.

export interface Ligne {
  /** Texte d'origine nettoyé (accents gardés), sans marque de titre ni de puce. */
  texte: string;
  titre: boolean;
  puce: boolean;
  /** Numérotation « 1/ » (ouvre un secteur dans la section métiers). */
  numeroBarre: boolean;
  /** Cellules d'une ligne de tableau (les <br> et • des cellules sont gardés, découpés plus tard). */
  cellules: string[] | null;
}

/** Minuscules, sans accents, apostrophes droites, sans numérotation de tête, sans « : » final, espaces réduits. */
export function cle(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u2032]/g, "'")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(\d+|[ivxlc]+)\s*[/.)]\s*/, "")
    .replace(/\s*:\s*/g, " : ")
    .replace(/\s*:\s*$/, "")
    .trim();
}

/** Textes d'aide du modèle vierge (comparés sur cle, sans crochets ni parenthèses ni … aux bords). */
const PLACEHOLDERS_EXACTS = [
  "a completer",
  "a formuler",
  "ancien modelise ou client, si c'est le cas",
  "ce qui la fait vibrer, ce qui la motive profondement",
  "ce qui l'eteint",
  "ce qui active le talent, qu'il s'exprime en force ou en exces",
  "prenom",
  "nom",
  ":",
  "-",
];
const PLACEHOLDERS_DEBUT = [
  "2 a 3 phrases valorisantes",
  "montrer comment le plus grand defaut",
  "le titre du talent et une description valorisante",
];

function cleAide(t: string): string {
  return cle(t)
    .replace(/^[[(\s…]+|[\])\s….]+$/g, "")
    .trim();
}

export function estTexteAide(t: string): boolean {
  const c = cleAide(t);
  if (!c) return true;
  if (/^titre \d+$/.test(c)) return true;
  if (PLACEHOLDERS_EXACTS.includes(c)) return true;
  return PLACEHOLDERS_DEBUT.some((p) => c.startsWith(p));
}

const EMOJIS = /[\p{Extended_Pictographic}\uFE0F\u200D]/gu;

/** Nettoyage commun d'un morceau de texte (ligne ou cellule). */
export function nettoyer(t: string): string {
  return t
    .replace(/\{[a-z_]+="[^"]*"\}/gi, "")
    .replace(/\\([[\]()*_#|>-])/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/<(?!br\s*\/?>)[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\*\*|__|`/g, "")
    .replace(/(^|\s)\*(\S)/g, "$1$2")
    .replace(/(\S)\*(\s|$)/g, "$1$2")
    .replace(EMOJIS, "")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

const PUCE = /^(?:[-*•▪◦‣]\s+|\d+[.)]\s+|\d+\/\s*)/;
const CASE = /^\[[ xX]?\]\s*/;

/** Une ligne de texte (hors tableau) → Ligne, ou null si elle est vide ou un texte d'aide. */
export function lireLigne(brut: string, titreForce = false): Ligne | null {
  let t = brut.trim();
  let titre = titreForce;
  while (t.startsWith(">")) t = t.slice(1).trim();
  if (/^#{1,6}(\s|$)/.test(t)) {
    titre = true;
    t = t.replace(/^#{1,6}\s*/, "");
  }
  if (/^-{3,}$|^\*{3,}$|^_{3,}$/.test(t)) return null;
  t = nettoyer(t);
  let puce = false;
  let numeroBarre = false;
  // Puces et cases à cocher (plusieurs couches possibles : « - [ ] texte »).
  for (let i = 0; i < 3; i++) {
    const m = PUCE.exec(t);
    if (m) {
      puce = true;
      if (/^\d+\//.test(m[0])) numeroBarre = true;
      t = t.slice(m[0].length).trim();
      continue;
    }
    if (CASE.test(t)) {
      puce = true;
      t = t.replace(CASE, "").trim();
      continue;
    }
    break;
  }
  t = nettoyer(t);
  // Les titres sont des repères de structure : on ne les filtre pas comme textes d'aide.
  if (!t || (!titre && estTexteAide(t))) return null;
  return { texte: t, titre, puce, numeroBarre, cellules: null };
}

/** Découpe une cellule (ou une ligne d'une seule cellule) sur <br> et sur les puces •. */
export function morceaux(t: string): string[] {
  return t
    .split(/<br\s*\/?>|•|\n/i)
    .map((x) => nettoyer(x).replace(/^[-*]\s+/, "").trim())
    .filter((x) => x && !estTexteAide(x));
}

/** Texte façon Markdown → lignes propres (cahier D.3, étape 1). */
export function versLignes(md: string): Ligne[] {
  const sortie: Ligne[] = [];
  for (const brute of md.replace(/\r\n?/g, "\n").split("\n")) {
    const t = brute.trim();
    if (!t) continue;
    if (t.startsWith("|") && t.endsWith("|") && t.length > 1) {
      if (/^\|[\s|:-]+\|$/.test(t)) continue; // séparation |---|
      const cellules = t
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      const nettes = cellules.map((c) => nettoyer(c));
      if (nettes.every((c) => !c.replace(/<br\s*\/?>/gi, "").trim())) continue;
      sortie.push({ texte: nettes.map((c) => c.replace(/<br\s*\/?>/gi, " ")).join(" | "), titre: false, puce: false, numeroBarre: false, cellules: nettes });
      continue;
    }
    for (const morceau of t.split(/<br\s*\/?>/i)) {
      const l = lireLigne(morceau);
      if (l) sortie.push(l);
    }
  }
  return sortie;
}
