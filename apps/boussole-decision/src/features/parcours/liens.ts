// Liens sortants de « Où j'en suis ? ». Les liens Calendly portent les paramètres UTM du site
// (utm_source=site, utm_medium=cta, utm_campaign=<page>, utm_content=<emplacement>), voir README à la racine.

export function lienSortant(url: string, emplacement: string): string {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  if (!u.hostname.endsWith("calendly.com")) return url;
  u.searchParams.set("utm_source", "site");
  u.searchParams.set("utm_medium", "cta");
  u.searchParams.set("utm_campaign", "ou-j-en-suis");
  u.searchParams.set("utm_content", emplacement);
  return u.toString();
}

/** Première lettre en capitale (« offert » devient « Offert »). */
export const capitale = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

/** « Niveau 2 · La prise de conscience » : la partie après le point médian. */
export function titreCourt(titre: string): string {
  const i = titre.indexOf("·");
  return i === -1 ? titre : titre.slice(i + 1).trim();
}

/** « Niveau 2 · La prise de conscience » : la partie avant le point médian. */
export function titreNumero(titre: string): string {
  const i = titre.indexOf("·");
  return i === -1 ? titre : titre.slice(0, i).trim();
}
