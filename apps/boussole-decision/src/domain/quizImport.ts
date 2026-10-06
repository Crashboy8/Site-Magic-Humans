// Résultat du quiz Talent Unique (magichumans.com/quiz/) transmis à la Boussole par le lien
// « Utiliser ce résultat dans ma Boussole de décision ». Module pur, couvert par quizImport.test.ts.
//
// Le lien porte le résultat dans son ancre (#q=…, JSON encodé en base64url) : rien ne passe par les
// journaux du serveur, et la personne crée elle-même son profil en un clic.

export interface QuizResult {
  lang: "fr" | "en";
  /** Archétypes dominant et secondaire (clés du quiz), pour mémoire. */
  archetypes: string[];
  /** Nom du profil à créer, ex. « Mon Talent Unique : Analyste Fédérateur ». */
  name: string;
  mecanisme: string;
  contexte: string;
  benefice: string;
  antiContexte: string;
  success: string;
  failure: string;
  /** Conditions fertiles : critères proposés côté Contexte Déclencheur. */
  fertile: string[];
  /** Environnements toxiques : critères « à éviter » proposés côté Anti-Contexte. */
  toxic: string[];
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v)
    ? v
        .map((x) => text(x, maxLen))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];

/** Lit et borne un résultat de quiz ; null s'il n'est pas exploitable. */
export function parseQuizResult(raw: unknown): QuizResult | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  if (r.v !== 1) return null;
  const result: QuizResult = {
    lang: r.lang === "en" ? "en" : "fr",
    archetypes: list(r.archetypes, 2, 40),
    name: text(r.name, 120),
    mecanisme: text(r.mecanisme, 400),
    contexte: text(r.contexte, 600),
    benefice: text(r.benefice, 400),
    antiContexte: text(r.antiContexte, 1000),
    success: text(r.success, 1000),
    failure: text(r.failure, 1000),
    fertile: list(r.fertile, 3, 200),
    toxic: list(r.toxic, 3, 200),
  };
  return result.name && result.mecanisme ? result : null;
}

/** Décode l'ancre « #q=… » d'un lien du quiz (JSON en base64url, UTF-8). */
export function decodeQuizHash(hash: string): QuizResult | null {
  const match = /(?:^|[#&])q=([A-Za-z0-9_-]+)/.exec(hash);
  if (!match) return null;
  try {
    const b64 = match[1].replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return parseQuizResult(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}
