// Nettoyage des textes renvoyés par le modèle (§8.5). Module pur.

const CHAMPS_LIEUX = new Set(["type", "pourquoi", "recherche"]);

function nettoyerChaine(s: string, lieu: boolean, recherche: boolean): string {
  let t = s.replace(/\*\*/g, "").replace(/__/g, "");
  t = t.replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 à $2");
  t = t.replace(/\s*[\u2013\u2014]\s*/g, ", ").replace(/,\s*,/g, ",").replace(/^,\s*/, "");
  if (lieu) t = t.replace(/\s*\b(19|20)\d{2}\b/g, "");
  if (recherche) t = t.replace(/["«»“”„]/g, "");
  return t.replace(/[^\S\n]+/g, " ").trim();
}

function parcourir(v: unknown, chemin: string[]): unknown {
  if (typeof v === "string") {
    const cle = chemin[chemin.length - 1] ?? "";
    const lieu = chemin.includes("lieux") && CHAMPS_LIEUX.has(cle);
    return nettoyerChaine(v, lieu, lieu && cle === "recherche");
  }
  if (Array.isArray(v)) return v.map((x) => parcourir(x, chemin));
  if (typeof v === "object" && v !== null) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, parcourir(x, [...chemin, k])]));
  }
  return v;
}

/** Parcourt objets et tableaux et nettoie chaque chaîne : gras, tirets longs, espaces, années des lieux. */
export function nettoyerTextes<T>(v: T): T {
  return parcourir(v, []) as T;
}
