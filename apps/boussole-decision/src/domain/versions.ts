import type { Version } from "./types";

/** Nom proposé pour la prochaine version : V1, V2… (après le plus grand Vn existant). */
export function nextVersionName(versions: Pick<Version, "name">[]): string {
  const max = versions.reduce((acc, v) => {
    const m = /^V(\d+)$/i.exec(v.name.trim());
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, 0);
  return `V${max + 1}`;
}

/** Génère un code d'invitation lisible, sans caractères ambigus (0/O, 1/I). */
export function generateInvitationCode(random: () => number = Math.random, prefixe = "BOUSSOLE"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("");
  return `${prefixe}-${block()}-${block()}`;
}

export function normalizeInvitationCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
