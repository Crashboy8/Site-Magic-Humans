// Masquage des coordonnées dans les notes de terrain (§9.1). Les expressions sont celles du cahier.

export interface CompteMasques {
  mails: number;
  telephones: number;
  liens: number;
}

const VIDE: CompteMasques = { mails: 0, telephones: 0, liens: 0 };

function remplacer(texte: string, motif: RegExp, jeton: string): { texte: string; n: number } {
  let n = 0;
  const sortie = texte.replace(motif, () => {
    n += 1;
    return jeton;
  });
  return { texte: sortie, n };
}

/** Liens, puis adresses mail, puis téléphones. */
export function masquerDonnees(texte: string): { texte: string } & CompteMasques {
  const liens = remplacer(texte, /\bhttps?:\/\/[^\s<>"]+|\bwww\.[^\s<>"]+/gi, "[lien]");
  const mails = remplacer(liens.texte, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[adresse mail]");
  const telephones = remplacer(
    mails.texte,
    /(?<![\d+])(?:(?:\+|00)\d{2,3}[\s.-]?(?:\(0\)[\s.-]?)?[1-9]|0[1-9])(?:[\s.-]?\d{2}){4}(?!\d)/g,
    "[téléphone]",
  );
  return { texte: telephones.texte, mails: mails.n, telephones: telephones.n, liens: liens.n };
}

export function additionnerMasques(a: CompteMasques, b: CompteMasques): CompteMasques {
  return { mails: a.mails + b.mails, telephones: a.telephones + b.telephones, liens: a.liens + b.liens };
}

export const MASQUES_VIDES: CompteMasques = { ...VIDE };

/** « On a masqué 2 adresses mail, 1 numéro de téléphone et 1 lien. » Les zéros sont omis. */
export function decrireMasques(m: CompteMasques): string | null {
  const parts: string[] = [];
  if (m.mails === 1) parts.push("1 adresse mail");
  else if (m.mails > 1) parts.push(`${m.mails} adresses mail`);
  if (m.telephones === 1) parts.push("1 numéro de téléphone");
  else if (m.telephones > 1) parts.push(`${m.telephones} numéros de téléphone`);
  if (m.liens === 1) parts.push("1 lien");
  else if (m.liens > 1) parts.push(`${m.liens} liens`);
  if (parts.length === 0) return null;
  const liste = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} et ${parts[parts.length - 1]}`;
  return `On a masqué ${liste}.`;
}
