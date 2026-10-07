// Pré-remplissage du talent par l'ancre de l'adresse (§12.1) : #cible=, #q= (QCM), #b= (Boussole). Module pur.
// L'ancre n'est jamais envoyée au serveur.
import { encodeBase64Url } from "@/domain/carteLink";
import { decodeQuizHash } from "@/domain/quizImport";
import { LIMITES, TAILLE_MAX_ANCRE } from "./limites";
import type { Langue, Source, Talent } from "./types";

export interface AncreCible {
  v: 1;
  src: "carte" | "quiz" | "boussole";
  lang?: "fr" | "en" | "es";
  nom?: string;          // ≤ 120 (Carte : carte.talent.nom)
  mecanisme?: string;    // ≤ 400
  contexte?: string;     // ≤ 600 (Carte : carte.talent.filRouge)
  benefice?: string;     // ≤ 400
  antiContexte?: string; // ≤ 1000
  reussite?: string;     // ≤ 1000
  sousTalents?: string[];// ≤ 6 × 60 (Carte : noms des régions)
  pistes?: string[];     // ≤ 5 × 80 (Carte : noms des pistes visées)
  aDeleguer?: string[];  // ≤ 6 × 60 (Carte : noms des compétences en zone à déléguer)
}

export interface AncreLue {
  source: Source;
  talent: Partial<Talent>;
  langue?: Langue;
}

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
function liste(v: unknown, items: number, max: number): string[] {
  if (!Array.isArray(v)) return [];
  const vus = new Set<string>();
  const sortie: string[] = [];
  for (const x of v) {
    const t = texte(x, max);
    if (t && !vus.has(t.toLowerCase())) {
      vus.add(t.toLowerCase());
      sortie.push(t);
    }
  }
  return sortie.slice(0, items);
}

function decoderJson(b64url: string): unknown {
  try {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const binaire = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const octets = Uint8Array.from(binaire, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(octets));
  } catch {
    return null;
  }
}

const objet = (v: unknown): Record<string, unknown> | null => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : null);

/** On ne garde que les champs renseignés. */
function retirerVides(t: Partial<Talent>): Partial<Talent> {
  return Object.fromEntries(Object.entries(t).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))) as Partial<Talent>;
}

function lireCible(payload: string): AncreLue | null {
  const o = objet(decoderJson(payload));
  if (!o || o.v !== 1) return null;
  const src: Source = o.src === "carte" || o.src === "quiz" || o.src === "boussole" ? o.src : "carte";
  const talent = retirerVides({
    nom: texte(o.nom, LIMITES.nom.max),
    mecanisme: texte(o.mecanisme, LIMITES.mecanisme.max),
    contexte: texte(o.contexte, LIMITES.contexte.max),
    benefice: texte(o.benefice, LIMITES.benefice.max),
    antiContexte: texte(o.antiContexte, LIMITES.antiContexte.max),
    reussite: texte(o.reussite, LIMITES.reussite.max),
    sousTalents: liste(o.sousTalents, LIMITES.sousTalents.items, LIMITES.sousTalents.max),
    pistes: liste(o.pistes, LIMITES.pistes.items, LIMITES.pistes.max),
    aDeleguer: liste(o.aDeleguer, LIMITES.aDeleguer.items, LIMITES.aDeleguer.max),
  });
  if (Object.keys(talent).length === 0) return null;
  const langue = o.lang === "fr" || o.lang === "en" || o.lang === "es" ? o.lang : undefined;
  return { source: src, talent, langue };
}

/** Même règle que `sansSais` de la Carte du Talent. */
const sansSais = (t: string) => t.replace(/^(?:sais|sé|know how to)\s+/i, "");

function lireQuiz(payload: string): AncreLue | null {
  const q = decodeQuizHash(`q=${payload}`);
  if (!q) return null;
  const talent = retirerVides({
    nom: q.name.slice(0, LIMITES.nom.max),
    mecanisme: sansSais(q.mecanisme).slice(0, LIMITES.mecanisme.max),
    contexte: q.contexte.slice(0, LIMITES.contexte.max),
    benefice: q.benefice.slice(0, LIMITES.benefice.max),
    antiContexte: q.antiContexte.slice(0, LIMITES.antiContexte.max),
    reussite: q.success.slice(0, LIMITES.reussite.max),
  });
  return { source: "quiz", talent, langue: q.lang };
}

function lireBoussole(payload: string): AncreLue | null {
  const o = objet(decoderJson(payload));
  if (!o || o.v !== 1) return null;
  const talent = retirerVides({
    mecanisme: texte(o.mecanisme, LIMITES.mecanisme.max),
    contexte: texte(o.contexte, LIMITES.contexte.max),
    benefice: texte(o.benefice, LIMITES.benefice.max),
    antiContexte: texte(o.antiContexte, LIMITES.antiContexte.max),
    reussite: texte(o.success, LIMITES.reussite.max),
  });
  if (Object.keys(talent).length === 0) return null;
  return { source: "boussole", talent };
}

/** Lit l'ancre (priorité : cible, puis q, puis b). `null` si rien d'exploitable. */
export function lireAncre(hash: string): AncreLue | null {
  if (typeof hash !== "string" || hash.length > TAILLE_MAX_ANCRE) return null;
  const trouvees: Record<string, string> = {};
  for (const m of hash.matchAll(/(?:^|[#&])(cible|q|b)=([A-Za-z0-9_-]+)/g)) {
    if (!(m[1] in trouvees)) trouvees[m[1]] = m[2];
  }
  const lecteurs: [string, (p: string) => AncreLue | null][] = [
    ["cible", lireCible],
    ["q", lireQuiz],
    ["b", lireBoussole],
  ];
  for (const [cle, lecteur] of lecteurs) {
    if (cle in trouvees) {
      const lu = lecteur(trouvees[cle]);
      if (lu) return lu;
    }
  }
  return null;
}

/** JSON → UTF-8 → base64url sans remplissage (même encodage que le quiz et la Carte). */
export function encoderCible(a: AncreCible): string {
  return encodeBase64Url(a);
}
