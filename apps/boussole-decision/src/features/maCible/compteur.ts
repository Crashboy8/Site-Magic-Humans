/** Le compteur apparaît près du plafond : 200 caractères avant la fin, ou 20 % sur un champ court. */
export function compteurVisible(longueur: number, max: number): boolean {
  if (max <= 0) return false;
  const marge = Math.min(200, Math.ceil(max * 0.2));
  return longueur >= max - marge;
}
