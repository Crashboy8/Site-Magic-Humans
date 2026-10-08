// Comparaison de textes pour les contrôles déterministes (idées, pistes, plus tard les phrases exactes).

/** Minuscules, sans accents, apostrophes et guillemets unifiés, ponctuation retirée aux extrémités. */
export function normaliserPourComparer(t: string): string {
  const s = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[’‘ʼ]/g, "'")
    .replace(/[«»“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim();
  return s.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "").trim();
}
