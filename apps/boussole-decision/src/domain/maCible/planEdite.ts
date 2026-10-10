// Plan d'action modifiable du Cibleur. Module pur : aucun accès au navigateur, aucun HTML.
// Le texte des actions et des titres est du Markdown léger (gras, italique). Il n'est jamais injecté comme HTML :
// l'écran le rend avec des éléments React, ce qui ferme la porte au XSS.
import { CANAUX } from "./schemas";
import type { Canal, Resultat } from "./types";

export const TEXTE_ACTION_MAX = 400;
export const TEXTE_TITRE_MAX = 120;
export const BLOCS_MAX = 60;

export interface DetailAction {
  /** « toutes » ou un identifiant de cible du résultat. */
  cible: string;
  canal: Canal;
  minutes: number;
}

export type Bloc =
  | { id: string; type: "titre"; texte: string }
  | { id: string; type: "action"; texte: string; fait: boolean; detail: DetailAction | null; origine: number | null };

export interface PlanEdite {
  v: 1;
  maj: string;
  /** Date du résultat auquel ce plan appartient : un plan ne se plaque jamais sur un autre résultat. */
  resultatLe: string | null;
  blocs: Bloc[];
}

export interface TextesPlan {
  /** Titre d'une semaine du plan d'origine, par exemple « Semaine 1 : Tester ». */
  titreSemaine: (semaine: number, titre: string) => string;
}

const CANAUX_CONNUS: readonly string[] = CANAUX;
// On retire les caractères de contrôle, sauf le retour à la ligne.
const CONTROLE = /[\u0000-\u0009\u000b-\u001f\u007f]/g;

/** Texte nettoyé : sans caractère de contrôle, retours à la ligne normalisés, coupé à la limite. */
export function nettoyerTexte(brut: string, max: number): string {
  return brut.replace(/\r\n?/g, "\n").replace(CONTROLE, "").slice(0, max);
}

/** Un titre tient sur une ligne et n'a pas besoin de « # » devant. */
export function nettoyerTitre(brut: string): string {
  return nettoyerTexte(brut, TEXTE_TITRE_MAX + 8).replace(/\n+/g, " ").replace(/^\s*#{1,6}\s+/, "").slice(0, TEXTE_TITRE_MAX);
}

let compteur = 0;
/** Identifiant local d'un bloc (pour les clés React et les cases). */
export function nouvelIdBloc(): string {
  compteur += 1;
  return `b${Date.now().toString(36)}${compteur.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Le plan d'origine proposé par l'IA, mis à plat : un titre par semaine, puis ses actions. Les identifiants sont stables (`s0`, `a0`…). */
export function planDepuisResultat(resultat: Pick<Resultat, "plan30">, coches: boolean[], textes: TextesPlan, resultatLe: string | null, maintenant: Date): PlanEdite {
  const blocs: Bloc[] = [];
  resultat.plan30.forEach((s, si) => {
    blocs.push({ id: `s${si}`, type: "titre", texte: nettoyerTitre(textes.titreSemaine(s.semaine, s.titre)) });
    s.actions.forEach((a, ai) => {
      const origine = si * 3 + ai;
      blocs.push({
        id: `a${origine}`,
        type: "action",
        texte: nettoyerTexte(a.texte, TEXTE_ACTION_MAX),
        fait: Boolean(coches[origine]),
        detail: { cible: a.cible, canal: a.canal, minutes: a.minutes },
        origine,
      });
    });
  });
  return { v: 1, maj: maintenant.toISOString(), resultatLe, blocs };
}

/** Les cases cochées du plan d'origine, retrouvées depuis un plan modifié (pour « Revenir à la proposition de l'IA »). */
export function cochesDepuisPlan(plan: PlanEdite, nb: number): boolean[] {
  const coches = Array<boolean>(nb).fill(false);
  for (const b of plan.blocs) {
    if (b.type === "action" && b.origine !== null && b.origine < nb) coches[b.origine] = b.fait;
  }
  return coches;
}

const objet = (v: unknown): Record<string, unknown> | null => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null);

function lireDetail(v: unknown): DetailAction | null {
  const o = objet(v);
  if (!o || typeof o.cible !== "string" || o.cible.length > 12 || typeof o.minutes !== "number" || !Number.isFinite(o.minutes)) return null;
  if (typeof o.canal !== "string" || !CANAUX_CONNUS.includes(o.canal)) return null;
  return { cible: o.cible, canal: o.canal as Canal, minutes: Math.min(Math.max(Math.round(o.minutes), 0), 600) };
}

function lireBloc(v: unknown, vus: Set<string>): Bloc | null {
  const o = objet(v);
  if (!o || typeof o.texte !== "string") return null;
  const id = typeof o.id === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(o.id) && !vus.has(o.id) ? o.id : nouvelIdBloc();
  vus.add(id);
  if (o.type === "titre") return { id, type: "titre", texte: nettoyerTitre(o.texte) };
  if (o.type !== "action") return null;
  const origine = typeof o.origine === "number" && Number.isInteger(o.origine) && o.origine >= 0 && o.origine < 12 ? o.origine : null;
  return { id, type: "action", texte: nettoyerTexte(o.texte, TEXTE_ACTION_MAX), fait: o.fait === true, detail: lireDetail(o.detail), origine };
}

/** Lecture tolérante d'un plan venu du navigateur ou du serveur. `null` si ce n'est pas un plan exploitable. */
export function lirePlan(v: unknown): PlanEdite | null {
  const o = objet(v);
  if (!o || o.v !== 1 || !Array.isArray(o.blocs) || o.blocs.length > BLOCS_MAX) return null;
  const vus = new Set<string>();
  const blocs = o.blocs.flatMap((b) => {
    const lu = lireBloc(b, vus);
    return lu ? [lu] : [];
  });
  return {
    v: 1,
    maj: typeof o.maj === "string" && !Number.isNaN(Date.parse(o.maj)) ? o.maj : new Date(0).toISOString(),
    resultatLe: typeof o.resultatLe === "string" ? o.resultatLe.slice(0, 40) : null,
    blocs,
  };
}

// ---------------------------------------------------------------- Markdown léger

export type Noeud = { type: "texte"; texte: string } | { type: "gras" | "italique"; enfants: Noeud[] };

const GRAS = /\*\*(?=\S)([\s\S]*?\S)\*\*/;
const ITALIQUE = /\*(?=[^\s*])([^*]*?[^\s*])\*|\*([^\s*])\*/;

/** Analyse en ligne : **gras** et *italique*. Tout le reste est du texte, tel quel (les balises HTML ne sont pas interprétées). */
export function analyserMarkdown(texte: string, profondeur = 0): Noeud[] {
  if (texte === "") return [];
  if (profondeur > 4) return [{ type: "texte", texte }];
  const g = GRAS.exec(texte);
  const i = ITALIQUE.exec(texte);
  const choix = g && (!i || g.index <= i.index) ? { m: g, type: "gras" as const, dedans: g[1] } : i ? { m: i, type: "italique" as const, dedans: i[1] ?? i[2] } : null;
  if (!choix) return [{ type: "texte", texte }];
  const avant = texte.slice(0, choix.m.index);
  const apres = texte.slice(choix.m.index + choix.m[0].length);
  return [
    ...(avant ? [{ type: "texte" as const, texte: avant }] : []),
    { type: choix.type, enfants: analyserMarkdown(choix.dedans, profondeur + 1) },
    ...analyserMarkdown(apres, profondeur),
  ];
}

/** Le texte sans les marques de gras et d'italique (export texte brut, résumé lu par un lecteur d'écran). */
export function enTexteBrut(texte: string): string {
  const brut = (n: Noeud): string => (n.type === "texte" ? n.texte : n.enfants.map(brut).join(""));
  return analyserMarkdown(texte).map(brut).join("");
}

// ---------------------------------------------------------------- Export

/** Plan en Markdown : un titre `###` par section, une puce par action (les retours à la ligne restent dans la puce). */
export function planEnMarkdown(blocs: Bloc[]): string[] {
  return blocs.flatMap((b) => {
    if (!b.texte.trim()) return [];
    if (b.type === "titre") return [`### ${b.texte.trim()}`];
    const lignes = b.texte.trim().split("\n");
    return [`- ${lignes[0] ?? ""}`, ...lignes.slice(1).map((l) => (l.trim() ? `  ${l}` : ""))];
  });
}

/** Plan en texte brut : titres en majuscules, puces, sans marques de Markdown. */
export function planEnTexte(blocs: Bloc[]): string[] {
  return blocs.flatMap((b) => {
    if (!b.texte.trim()) return [];
    if (b.type === "titre") return [enTexteBrut(b.texte).trim().toUpperCase()];
    const lignes = enTexteBrut(b.texte).trim().split("\n");
    return [`- ${lignes[0] ?? ""}`, ...lignes.slice(1).map((l) => (l.trim() ? `  ${l}` : ""))];
  });
}

// ---------------------------------------------------------------- Modifications (fonctions pures)

const modifie = (plan: PlanEdite, blocs: Bloc[], maintenant: Date): PlanEdite => ({ ...plan, blocs, maj: maintenant.toISOString() });

export function changerTexte(plan: PlanEdite, id: string, texte: string, maintenant: Date): PlanEdite {
  return modifie(
    plan,
    plan.blocs.map((b) => (b.id !== id ? b : b.type === "titre" ? { ...b, texte: nettoyerTitre(texte) } : { ...b, texte: nettoyerTexte(texte, TEXTE_ACTION_MAX) })),
    maintenant,
  );
}

export function basculerFait(plan: PlanEdite, id: string, maintenant: Date): PlanEdite {
  return modifie(plan, plan.blocs.map((b) => (b.id === id && b.type === "action" ? { ...b, fait: !b.fait } : b)), maintenant);
}

export function supprimerBloc(plan: PlanEdite, id: string, maintenant: Date): PlanEdite {
  return modifie(plan, plan.blocs.filter((b) => b.id !== id), maintenant);
}

/** Déplace d'un cran. Un titre entraîne ses actions : monter une section la fait passer au-dessus de la précédente. */
export function deplacerBloc(plan: PlanEdite, id: string, sens: -1 | 1, maintenant: Date): PlanEdite {
  const i = plan.blocs.findIndex((b) => b.id === id);
  if (i < 0) return plan;
  const groupe = (debut: number): number => {
    let fin = debut + 1;
    while (fin < plan.blocs.length && plan.blocs[fin].type !== "titre") fin += 1;
    return fin;
  };
  const bloc = plan.blocs[i];
  if (bloc.type === "action") {
    const j = i + sens;
    if (j < 0 || j >= plan.blocs.length) return plan;
    const blocs = plan.blocs.slice();
    [blocs[i], blocs[j]] = [blocs[j], blocs[i]];
    return modifie(plan, blocs, maintenant);
  }
  const fin = groupe(i);
  const section = plan.blocs.slice(i, fin);
  if (sens === -1) {
    let debut = i - 1;
    while (debut >= 0 && plan.blocs[debut].type !== "titre") debut -= 1;
    if (i === 0) return plan;
    const avant = plan.blocs.slice(Math.max(debut, 0), i);
    return modifie(plan, [...plan.blocs.slice(0, Math.max(debut, 0)), ...section, ...avant, ...plan.blocs.slice(fin)], maintenant);
  }
  if (fin >= plan.blocs.length) return plan;
  const finSuivant = groupe(fin);
  const suivant = plan.blocs.slice(fin, finSuivant);
  return modifie(plan, [...plan.blocs.slice(0, i), ...suivant, ...section, ...plan.blocs.slice(finSuivant)], maintenant);
}

/** Ajoute une action à la fin de la section qui contient `apresId` (ou à la fin du plan si `apresId` est null). */
export function ajouterAction(plan: PlanEdite, apresId: string | null, maintenant: Date): { plan: PlanEdite; id: string } | null {
  if (plan.blocs.length >= BLOCS_MAX) return null;
  let position = plan.blocs.length;
  if (apresId) {
    const i = plan.blocs.findIndex((b) => b.id === apresId);
    if (i >= 0) {
      position = i + 1;
      while (position < plan.blocs.length && plan.blocs[position].type !== "titre") position += 1;
    }
  }
  const id = nouvelIdBloc();
  const bloc: Bloc = { id, type: "action", texte: "", fait: false, detail: null, origine: null };
  return { plan: modifie(plan, [...plan.blocs.slice(0, position), bloc, ...plan.blocs.slice(position)], maintenant), id };
}

export function ajouterTitre(plan: PlanEdite, maintenant: Date): { plan: PlanEdite; id: string } | null {
  if (plan.blocs.length >= BLOCS_MAX) return null;
  const id = nouvelIdBloc();
  return { plan: modifie(plan, [...plan.blocs, { id, type: "titre", texte: "" }], maintenant), id };
}
