// Accès hors quota : noms d'en-têtes partagés par le navigateur et la route. Aucun secret ici.

export const ENTETE_SESSION = "x-ma-cible-session";
export const ENTETE_TEST = "x-ma-cible-test";
export const CLE_SESSION_NAVIGATEUR = "ma_cible_session";
export const CLE_TEST_NAVIGATEUR = "ma_cible_cle";
/** Paramètre d'adresse comparé, côté serveur seulement, à `MA_CIBLE_CLE_TEST`. */
export const PARAM_TEST = "cle";

const SESSION = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** UUID de session navigateur, ou null si la valeur n'en est pas un. */
export function sessionValide(v: string | null | undefined): string | null {
  const s = v?.trim().toLowerCase() ?? "";
  return SESSION.test(s) ? s : null;
}

export function emailsIllimites(brut: string | undefined): string[] {
  return (brut ?? "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.includes("@"));
}

export function emailAutorise(liste: string | undefined, email: string | null | undefined): boolean {
  if (!email) return false;
  return emailsIllimites(liste).includes(email.trim().toLowerCase());
}
