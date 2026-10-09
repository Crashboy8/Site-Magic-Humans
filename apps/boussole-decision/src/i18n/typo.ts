// Typographie des textes affichés : espaces insécables là où une coupure de ligne serait laide (français et anglais).
// Appliquée une fois aux dictionnaires du Cibleur et de Mon espace ; le texte reste identique à l'œil.

const INSECABLE = "\u00a0";

/**
 * - un nombre et ce qui le suit (« 2 minutes », « 600 € », « 3 targets », « 6 semaines ») ;
 * - l'espace avant « : ; ? ! % » et à l'intérieur des guillemets « » ;
 * - le tiret de liste « · » reste collé au mot qui le précède.
 */
export function insecables(texte: string): string {
  return texte
    .replace(/(\d) (?=[\p{L}€%$£])/gu, `$1${INSECABLE}`)
    .replace(/(€|\$|£) (?=\d)/g, `$1${INSECABLE}`)
    .replace(/ ([:;?!%»])/g, `${INSECABLE}$1`)
    .replace(/« /g, `«${INSECABLE}`)
    .replace(/ ·/g, `${INSECABLE}·`);
}

/** Applique `insecables` à toutes les chaînes d'un dictionnaire, y compris aux résultats de ses fonctions. */
export function typographier<T>(valeur: T): T {
  return marcher(valeur) as T;
}

function marcher(v: unknown): unknown {
  if (typeof v === "string") return insecables(v);
  if (typeof v === "function") {
    const f = v as (...a: unknown[]) => unknown;
    return (...a: unknown[]) => marcher(f(...a));
  }
  if (Array.isArray(v)) return v.map(marcher);
  if (v instanceof RegExp) return v;
  if (typeof v === "object" && v !== null) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, marcher(x)]));
  return v;
}

/** Remet des espaces simples : pour les exports (texte copié, fichier .md) et les comparaisons dans les tests. */
export function sansInsecables(texte: string): string {
  return texte.replace(/[\u00a0\u202f]/g, " ");
}
