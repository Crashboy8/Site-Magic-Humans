// Progression : un seul jeu relié au compte (table progression, une ligne par compte).
// XP = points du jeu (talent-game) + points de « Où j'en suis ? ». Badges, série de jours et niveau Réussir dans le Plaisir.
// Fonctions pures, testées dans progression.test.ts. Le jeu (site statique) a les mêmes badges et la même clé de
// navigateur dans talent-game/js/progression.js : le test vérifie qu'ils restent égaux.

/** Les badges du jeu, dans l'ordre : on les gagne en atteignant leur seuil d'XP. */
export const BADGES = [
  { id: "premier-pas", seuil: 1 },
  { id: "en-mouvement", seuil: 50 },
  { id: "sur-la-lancee", seuil: 150 },
  { id: "ancre", seuil: 300 },
] as const;

export type IdBadge = (typeof BADGES)[number]["id"];

/** Ce que le jeu garde dans le navigateur pour le compte (même origine www.magichumans.com, même stockage). */
export const CLE_JEU = "talent_game_progression_v1";

export const XP_MAX = 1_000_000;
/** Points envoyés en une fois (une quête, ou tout ce que le navigateur a gagné avant la première connexion). */
export const AJOUT_MAX = 100_000;
export const SERIE_MAX = 100_000;

export interface Progression {
  xp: number;
  /** Code du niveau Réussir dans le Plaisir (« 3 », « 5A »), null au point de départ. */
  niveau: string | null;
  badges: IdBadge[];
  serieJours: number;
  /** Dernière fois que la personne a gagné des points ou répondu (ISO), null si jamais. */
  misAJour: string | null;
}

/** Ce que le jeu envoie au compte : ses points pas encore envoyés, ses badges et sa série. */
export interface EnvoiJeu {
  ajout: number;
  badges: IdBadge[];
  serieJours: number;
  /** Dernière fois que la personne a joué dans ce navigateur (ISO), null si jamais. */
  maj: string | null;
  /** « Repartir à zéro » dans le jeu : les points du jeu et les badges repartent de zéro. */
  repartir: boolean;
}

const entier = (v: unknown, min: number, max: number): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const borne = (xp: number) => Math.min(XP_MAX, Math.max(0, Math.round(xp)));

const JOUR_PARIS = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" });

/** Le jour (AAAA-MM-JJ), à l'heure de Paris : la série se compte comme le quota du Cibleur. */
export function jourParis(d: Date | string): string {
  return JOUR_PARIS.format(typeof d === "string" ? new Date(d) : d);
}

/** La veille d'un jour AAAA-MM-JJ. */
export function veille(jour: string): string {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** La série après un jour joué : le même jour ne compte qu'une fois, la veille la prolonge, un trou la relance à 1. */
export function serieApres(serie: number, dernierJour: string | null, aujourdhui: string): number {
  if (dernierJour === aujourdhui) return Math.max(serie, 1);
  if (dernierJour !== null && serie > 0 && dernierJour === veille(aujourdhui)) return Math.min(serie + 1, SERIE_MAX);
  return 1;
}

/** La série affichée : elle tient tant que la personne a joué aujourd'hui ou hier. */
export function serieEnCours(p: Pick<Progression, "serieJours" | "misAJour">, maintenant: Date): number {
  if (!p.misAJour) return 0;
  const dernier = jourParis(p.misAJour);
  const aujourdhui = jourParis(maintenant);
  return dernier === aujourdhui || dernier === veille(aujourdhui) ? p.serieJours : 0;
}

export function estBadge(v: unknown): v is IdBadge {
  return typeof v === "string" && BADGES.some((b) => b.id === v);
}

/** Les badges connus, sans doublon, dans l'ordre des seuils. */
export function rangerBadges(ids: Iterable<unknown>): IdBadge[] {
  const vus = new Set<unknown>(ids);
  return BADGES.filter((b) => vus.has(b.id)).map((b) => b.id);
}

export function badgesAtteints(xp: number): IdBadge[] {
  return BADGES.filter((b) => xp >= b.seuil).map((b) => b.id);
}

/** Le premier badge pas encore gagné et l'XP qui manque, ou null quand tout est gagné. */
export function prochainBadge(xp: number, badges: readonly string[]): { id: IdBadge; seuil: number; manque: number } | null {
  const b = BADGES.find((x) => !badges.includes(x.id));
  return b ? { id: b.id, seuil: b.seuil, manque: Math.max(0, b.seuil - xp) } : null;
}

/** Une date ISO lisible, ramenée à maintenant si elle est dans le futur ; null sinon. */
function dateSure(v: unknown, maintenant: Date): string | null {
  if (typeof v !== "string" || v.length > 40) return null;
  const t = Date.parse(v);
  if (Number.isNaN(t)) return null;
  return new Date(Math.min(t, maintenant.getTime())).toISOString();
}

/** Une ligne de la table, revalidée ; null si elle ne ressemble pas à une progression. */
export function progressionDeLigne(ligne: unknown): Progression | null {
  if (!ligne || typeof ligne !== "object") return null;
  const l = ligne as Record<string, unknown>;
  if (!entier(l.xp, 0, XP_MAX) || !entier(l.serie_jours, 0, SERIE_MAX)) return null;
  const niveau = typeof l.niveau === "string" && /^[0-9][A-Z]?$/.test(l.niveau) ? l.niveau : null;
  const badges = Array.isArray(l.badges) ? rangerBadges(l.badges) : [];
  const misAJour = typeof l.mis_a_jour === "string" && !Number.isNaN(Date.parse(l.mis_a_jour)) ? l.mis_a_jour : null;
  return { xp: l.xp, niveau, badges, serieJours: l.serie_jours, misAJour };
}

/** La ligne à écrire. */
export function ligneDeProgression(p: Progression, userId: string, maintenant: Date) {
  return {
    user_id: userId,
    xp: borne(p.xp),
    niveau: p.niveau,
    badges: rangerBadges(p.badges),
    serie_jours: Math.min(SERIE_MAX, Math.max(0, p.serieJours)),
    mis_a_jour: p.misAJour ?? maintenant.toISOString(),
  };
}

/**
 * Ce que le jeu envoie (route api/progression) ou ce que Mon espace lit dans le navigateur (clé talent_game_progression_v1).
 * On ne fait confiance à rien : null si un champ manque ou sort des bornes. Les badges inconnus sont ignorés.
 */
export function lireEnvoi(brut: unknown, maintenant: Date): EnvoiJeu | null {
  if (!brut || typeof brut !== "object") return null;
  const o = brut as Record<string, unknown>;
  if (o.v !== undefined && o.v !== 1) return null;
  const ajout = o.ajout ?? o.aEnvoyer ?? 0;
  if (!entier(ajout, 0, AJOUT_MAX)) return null;
  const serieJours = o.serieJours ?? 0;
  if (!entier(serieJours, 0, SERIE_MAX)) return null;
  const badges = o.badges ?? [];
  if (!Array.isArray(badges) || badges.length > 20) return null;
  if (o.maj !== undefined && o.maj !== null && dateSure(o.maj, maintenant) === null) return null;
  if (o.repartir !== undefined && typeof o.repartir !== "boolean") return null;
  return { ajout, badges: rangerBadges(badges), serieJours, maj: dateSure(o.maj, maintenant), repartir: o.repartir === true };
}

/** Points et niveau tirés de « Où j'en suis ? » (0 et null sans position). */
export interface ResumeParcours {
  points: number;
  niveau: string | null;
}

/** Le compte n'a pas encore de ligne : on part des points de « Où j'en suis ? » déjà gagnés. */
export function progressionDepart(parcours: ResumeParcours): Progression {
  const xp = borne(parcours.points);
  return { xp, niveau: parcours.niveau, badges: badgesAtteints(xp), serieJours: 0, misAJour: null };
}

/**
 * Le compte reçoit le jeu : les points s'ajoutent (jamais perdus), les badges s'unissent, la série la plus récente
 * l'emporte (le même jour, la plus longue). « Repartir à zéro » ne garde que les points de « Où j'en suis ? ».
 */
export function recevoirJeu(compte: Progression, envoi: EnvoiJeu, parcours: ResumeParcours): Progression {
  if (envoi.repartir) {
    const xp = borne(parcours.points);
    return { ...compte, xp, niveau: parcours.niveau, badges: badgesAtteints(xp) };
  }
  const xp = borne(compte.xp + envoi.ajout);
  const badges = rangerBadges([...compte.badges, ...envoi.badges, ...badgesAtteints(xp)]);
  let { serieJours, misAJour } = compte;
  if (envoi.maj !== null) {
    if (misAJour !== null && jourParis(envoi.maj) === jourParis(misAJour)) {
      serieJours = Math.max(serieJours, envoi.serieJours);
      if (Date.parse(envoi.maj) > Date.parse(misAJour)) misAJour = envoi.maj;
    } else if (misAJour === null || Date.parse(envoi.maj) > Date.parse(misAJour)) {
      serieJours = envoi.serieJours;
      misAJour = envoi.maj;
    }
  }
  return { ...compte, xp, badges, serieJours, misAJour };
}

/**
 * « Où j'en suis ? » vient d'être enregistré (ou effacé) : l'XP suit l'écart de points, le niveau suit la position.
 * Sans ligne, on part de zéro et l'on compte tous les points de la nouvelle position.
 * actif : la personne a répondu, la série compte ce jour-là. Effacer n'est pas jouer.
 */
export function apresParcours(compte: Progression | null, avant: ResumeParcours, apres: ResumeParcours, maintenant: Date, actif: boolean): Progression {
  const base = compte ?? progressionDepart(avant);
  const xp = borne(base.xp + apres.points - avant.points);
  const badges = rangerBadges([...base.badges, ...badgesAtteints(xp)]);
  if (!actif) return { ...base, xp, niveau: apres.niveau, badges };
  const serieJours = serieApres(base.serieJours, base.misAJour ? jourParis(base.misAJour) : null, jourParis(maintenant));
  return { xp, niveau: apres.niveau, badges, serieJours, misAJour: maintenant.toISOString() };
}

/** Ce que voient le bloc « Ton aventure » et le jeu. */
export interface VueProgression {
  xp: number;
  niveau: string | null;
  badges: IdBadge[];
  /** Série en cours (0 si la personne n'a joué ni aujourd'hui ni hier). */
  serieJours: number;
  prochain: { id: IdBadge; seuil: number; manque: number } | null;
  misAJour: string | null;
}

export function vueProgression(p: Progression, maintenant: Date): VueProgression {
  return { xp: p.xp, niveau: p.niveau, badges: p.badges, serieJours: serieEnCours(p, maintenant), prochain: prochainBadge(p.xp, p.badges), misAJour: p.misAJour };
}

/** Le jeu a-t-il quelque chose de neuf pour le compte (des points pas encore envoyés, ou un jour joué plus récent) ? */
export function aDuNeuf(envoi: EnvoiJeu, compte: Pick<Progression, "misAJour" | "badges"> | null): boolean {
  if (envoi.ajout > 0) return true;
  if (envoi.badges.some((b) => !compte?.badges.includes(b))) return true;
  if (envoi.maj === null) return false;
  return !compte?.misAJour || Date.parse(envoi.maj) > Date.parse(compte.misAJour);
}

/** Ce que le jeu garde dans le navigateur (clé talent_game_progression_v1). */
export interface EnregistrementJeu {
  v: 1;
  aEnvoyer: number;
  badges: IdBadge[];
  serieJours: number;
  maj: string | null;
}

/**
 * Le compte a reçu « envoye » points : on les retire de ce que le navigateur garde (les points gagnés pendant l'envoi
 * restent à envoyer) et la série repart de celle du compte, sauf si l'on a joué depuis. Même règle que le jeu.
 */
export function apresEnvoi(e: EnvoiJeu, envoye: number, compte: Pick<VueProgression, "badges" | "serieJours" | "misAJour">): EnregistrementJeu {
  const joueDepuis = e.maj !== null && (!compte.misAJour || Date.parse(e.maj) > Date.parse(compte.misAJour));
  return {
    v: 1,
    aEnvoyer: Math.max(0, e.ajout - envoye),
    badges: rangerBadges([...e.badges, ...compte.badges]),
    serieJours: joueDepuis ? e.serieJours : compte.serieJours,
    maj: joueDepuis ? e.maj : compte.misAJour,
  };
}
