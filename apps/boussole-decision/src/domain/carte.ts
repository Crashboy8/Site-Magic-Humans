// Carte du talent : module pur (sans React, sans stockage), couvert par carte.test.ts.
//
// MODÈLE GELÉ (version 1) : les étapes suivantes (interactions, flow, objectifs…) ajoutent des
// collections à côté, sans modifier ces champs.
// - Critère personnalisé : un intitulé et un poids de 1 à 5.
// - Lieu (une opportunité) : un score de 0 à 100 par critère (ou null : pas encore évalué),
//   un statut, et une position sur la carte (null : placement automatique).
// - Le score global d'un lieu n'est jamais stocké : c'est la moyenne pondérée de ses scores.
//
// La carte est un territoire : chaque lieu soulève le relief en proportion de son score.
// Les meilleures opportunités deviennent des sommets, les plus faibles des collines au bord de l'eau.

export const CARTE_SCHEMA_VERSION = 1;

export type LieuStatut = "a_explorer" | "en_cours" | "conquis" | "ecarte";
export const LIEU_STATUTS: LieuStatut[] = ["a_explorer", "en_cours", "conquis", "ecarte"];

export interface CarteCritere {
  id: string;
  label: string;
  /** Poids de 1 (compte un peu) à 5 (essentiel). */
  poids: number;
}

/** Position sur la carte, en unités de carte (0 à CARTE_LARGEUR, 0 à CARTE_HAUTEUR). */
export interface CartePosition {
  x: number;
  y: number;
}

export interface CarteLieu {
  id: string;
  nom: string;
  notes: string;
  /** Score de 0 à 100 par critère (clé : id du critère) ; null ou absent : pas encore évalué. */
  scores: Record<string, number | null>;
  statut: LieuStatut;
  /** null : placement automatique selon le score et le profil du lieu. */
  position: CartePosition | null;
}

export interface Carte {
  schemaVersion: typeof CARTE_SCHEMA_VERSION;
  nom: string;
  criteres: CarteCritere[];
  lieux: CarteLieu[];
  modifieLe: string;
}

export const CARTE_LARGEUR = 1000;
export const CARTE_HAUTEUR = 700;

// --- Score ---------------------------------------------------------------------------------

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Score global d'un lieu (0 à 100) : moyenne des scores pondérée par le poids des critères ; null si rien n'est évalué. */
export function scoreLieu(lieu: Pick<CarteLieu, "scores">, criteres: CarteCritere[]): number | null {
  let num = 0;
  let den = 0;
  for (const c of criteres) {
    const s = lieu.scores[c.id];
    if (s === null || s === undefined) continue;
    num += c.poids * s;
    den += c.poids;
  }
  return den === 0 ? null : num / den;
}

// --- Import / export -------------------------------------------------------------------------

export class CarteInvalide extends Error {}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Lit une carte importée (fichier JSON) et la ramène au modèle : valeurs bornées, champs inconnus ignorés.
 * Lève CarteInvalide avec un message lisible si le fichier n'est pas une carte du talent.
 */
export function parseCarte(raw: unknown): Carte {
  if (!isObject(raw) || !Array.isArray(raw.criteres) || !Array.isArray(raw.lieux)) {
    throw new CarteInvalide("Ce fichier n'est pas une carte du talent.");
  }
  if (raw.schemaVersion !== CARTE_SCHEMA_VERSION) {
    throw new CarteInvalide("Cette carte vient d'une version de l'outil que l'on ne sait pas encore lire.");
  }
  const criteres: CarteCritere[] = [];
  const seen = new Set<string>();
  for (const c of raw.criteres) {
    if (!isObject(c)) continue;
    const id = text(c.id, 64);
    const label = text(c.label, 120);
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    criteres.push({ id, label, poids: clamp(Math.round(Number(c.poids) || 3), 1, 5) });
  }
  const lieux: CarteLieu[] = [];
  const seenLieux = new Set<string>();
  for (const l of raw.lieux) {
    if (!isObject(l)) continue;
    const id = text(l.id, 64);
    const nom = text(l.nom, 120);
    if (!id || !nom || seenLieux.has(id)) continue;
    seenLieux.add(id);
    const scores: Record<string, number | null> = {};
    const rawScores = isObject(l.scores) ? l.scores : {};
    for (const c of criteres) {
      const v = rawScores[c.id];
      scores[c.id] = typeof v === "number" && Number.isFinite(v) ? clamp(Math.round(v), 0, 100) : null;
    }
    const statut = LIEU_STATUTS.includes(l.statut as LieuStatut) ? (l.statut as LieuStatut) : "a_explorer";
    const p = l.position;
    const position =
      isObject(p) && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y))
        ? { x: clamp(Number(p.x), 0, CARTE_LARGEUR), y: clamp(Number(p.y), 0, CARTE_HAUTEUR) }
        : null;
    lieux.push({ id, nom, notes: text(l.notes, 2000), scores, statut, position });
  }
  return {
    schemaVersion: CARTE_SCHEMA_VERSION,
    nom: text(raw.nom, 80) || "Ma carte du talent",
    criteres,
    lieux,
    modifieLe: typeof raw.modifieLe === "string" ? raw.modifieLe : new Date(0).toISOString(),
  };
}

/** Texte du fichier exporté (JSON lisible). */
export function exportCarte(carte: Carte): string {
  return JSON.stringify(carte, null, 2);
}

/**
 * Élévation d'un lieu (0 à 1) : mélange de son score et de sa place parmi les lieux de la carte,
 * pour que les écarts se voient même quand tous les scores sont proches. Non évalué : 0.
 */
export function elevations(carte: Pick<Carte, "criteres" | "lieux">): Map<string, number> {
  const scores = carte.lieux.map((l) => scoreLieu(l, carte.criteres));
  const notes = scores.filter((s): s is number => s !== null);
  const min = Math.min(...notes);
  const max = Math.max(...notes);
  return new Map(
    carte.lieux.map((l, i) => {
      const s = scores[i];
      if (s === null) return [l.id, 0];
      const relatif = max > min ? (s - min) / (max - min) : 0.5;
      return [l.id, 0.4 * (s / 100) + 0.6 * relatif];
    }),
  );
}

// --- Placement -------------------------------------------------------------------------------

const MARGE = 70;
const DISTANCE_MIN = 155;

/**
 * Place les lieux sur la carte. Une position enregistrée est respectée ; sinon :
 * - la distance au centre suit le score (les meilleurs au cœur du territoire) ;
 * - la direction suit le profil du lieu : chaque critère a sa direction, le lieu penche vers ses points forts ;
 * puis les lieux trop proches s'écartent. Le résultat est déterministe.
 */
export function placerLieux(carte: Pick<Carte, "criteres" | "lieux">): Map<string, CartePosition> {
  const cx = CARTE_LARGEUR / 2;
  const cy = CARTE_HAUTEUR / 2;
  const rx = CARTE_LARGEUR / 2 - MARGE;
  const ry = CARTE_HAUTEUR / 2 - MARGE;
  const n = carte.criteres.length;
  const fixe = new Set<string>();
  const elevation = elevations(carte);

  const points = carte.lieux.map((lieu, index) => {
    if (lieu.position) {
      fixe.add(lieu.id);
      return { id: lieu.id, ...lieu.position };
    }
    let vx = 0;
    let vy = 0;
    carte.criteres.forEach((c, i) => {
      const s = lieu.scores[c.id];
      if (s === null || s === undefined) return;
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
      // Ce qui est au-dessus de la moyenne attire, ce qui est en dessous repousse.
      vx += c.poids * (s - 50) * Math.cos(angle);
      vy += c.poids * (s - 50) * Math.sin(angle);
    });
    const angle = vx === 0 && vy === 0 ? index * 2.399963 : Math.atan2(vy, vx); // angle d'or si profil neutre
    const r = 0.1 + 0.85 * (1 - (elevation.get(lieu.id) ?? 0));
    return { id: lieu.id, x: cx + rx * r * Math.cos(angle), y: cy + ry * r * Math.sin(angle) };
  });

  // Écartement : les lieux trop proches se repoussent ; les positions enregistrées ne bougent pas.
  for (let pass = 0; pass < 80; pass++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= DISTANCE_MIN) continue;
        if (d < 0.01) {
          dx = Math.cos(i + j);
          dy = Math.sin(i + j);
          d = 1;
        }
        const push = (DISTANCE_MIN - d) / 2;
        const ux = dx / d;
        const uy = dy / d;
        const aFixe = fixe.has(a.id);
        const bFixe = fixe.has(b.id);
        if (aFixe && bFixe) continue;
        const ka = aFixe ? 0 : bFixe ? 2 : 1;
        const kb = bFixe ? 0 : aFixe ? 2 : 1;
        a.x -= ux * push * ka;
        a.y -= uy * push * ka;
        b.x += ux * push * kb;
        b.y += uy * push * kb;
        moved = true;
      }
    }
    for (const p of points) {
      if (fixe.has(p.id)) continue;
      p.x = clamp(p.x, MARGE, CARTE_LARGEUR - MARGE);
      p.y = clamp(p.y, MARGE, CARTE_HAUTEUR - MARGE);
    }
    if (!moved) break;
  }
  return new Map(points.map((p) => [p.id, { x: p.x, y: p.y }]));
}

// --- Relief ----------------------------------------------------------------------------------

/** Niveau de la mer : en dessous, c'est l'eau. */
export const NIVEAU_MER = 0.1;
/** Altitudes des courbes de niveau (la première est le rivage). */
export const COURBES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

/** Bruit de valeur déterministe, pour un relief naturel (et toujours le même pour une même carte). */
function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function bruit(x: number, y: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, seed);
  const b = hash(x0 + 1, y0, seed);
  const c = hash(x0, y0 + 1, seed);
  const d = hash(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
export function graine(texte: string): number {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) h = Math.imul(h ^ texte.charCodeAt(i), 16777619);
  return h >>> 0;
}

export interface Relief {
  /** Altitudes (0 à ~1) sur une grille de `colonnes` × `lignes`, ligne par ligne. */
  valeurs: Float64Array;
  colonnes: number;
  lignes: number;
  /** Taille d'une maille en unités de carte. */
  pas: number;
}

/**
 * Relief de la carte : chaque lieu est une montagne dont la hauteur et l'étendue suivent son score,
 * sur un fond légèrement vallonné. Un lieu non évalué reste une petite île.
 */
export function calculerRelief(carte: Pick<Carte, "criteres" | "lieux" | "nom">, positions: Map<string, CartePosition>, pas = 5): Relief {
  const colonnes = Math.floor(CARTE_LARGEUR / pas) + 1;
  const lignes = Math.floor(CARTE_HAUTEUR / pas) + 1;
  const valeurs = new Float64Array(colonnes * lignes);
  const seed = graine(carte.nom);
  const elevation = elevations(carte);
  const montagnes = carte.lieux.flatMap((lieu) => {
    const p = positions.get(lieu.id);
    if (!p) return [];
    const t = elevation.get(lieu.id) ?? 0;
    return [{ x: p.x, y: p.y, hauteur: 0.2 + 0.78 * Math.pow(t, 1.3), etendue: 38 + 30 * t }];
  });
  for (let j = 0; j < lignes; j++) {
    for (let i = 0; i < colonnes; i++) {
      const x = i * pas;
      const y = j * pas;
      // Le sommet le plus haut l'emporte ; les contreforts, plus larges, s'additionnent et relient les massifs.
      let sommet = 0;
      let contreforts = 0;
      for (const m of montagnes) {
        const d2 = (x - m.x) ** 2 + (y - m.y) ** 2;
        sommet = Math.max(sommet, m.hauteur * Math.exp(-d2 / (2 * m.etendue * m.etendue)));
        contreforts += 0.06 * m.hauteur * Math.exp(-d2 / (2 * (m.etendue * 2) ** 2));
      }
      const ondulation = 0.1 * (bruit(x / 130, y / 130, seed) - 0.5) + 0.04 * (bruit(x / 40, y / 40, seed + 1) - 0.5);
      // Les bords de la carte descendent vers la mer.
      const bord = Math.min(x, CARTE_LARGEUR - x, y, CARTE_HAUTEUR - y);
      const littoral = bord < 70 ? (70 - bord) / 70 : 0;
      const h = sommet + contreforts;
      valeurs[j * colonnes + i] = Math.max(0, h + ondulation * (0.5 + h) - 0.15 * littoral);
    }
  }
  return { valeurs, colonnes, lignes, pas };
}

/** Altitude au point (x, y) : la maille la plus proche. */
export function altitude(relief: Relief, x: number, y: number): number {
  const i = clamp(Math.round(x / relief.pas), 0, relief.colonnes - 1);
  const j = clamp(Math.round(y / relief.pas), 0, relief.lignes - 1);
  return relief.valeurs[j * relief.colonnes + i];
}
