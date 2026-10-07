import "server-only";

// Appel au modèle d'IA par simple `fetch` (aucun SDK). Le fournisseur et le modèle sont réglables par variables d'environnement (§11).

export interface AppelModele {
  systeme: string;
  utilisateur: string;
  schema: object;
  nomSchema: string;
  maxTokens: number;
  delaiMs: number;
}

export class ErreurFournisseur extends Error {
  constructor(
    public code: "reseau" | "delai" | "statut" | "tronque" | "vide",
    public statut?: number,
    /** Message du fournisseur (`error.message`), au plus 300 caractères. Jamais le texte saisi. */
    public messageFournisseur?: string,
  ) {
    super(code);
  }
}

export interface Fournisseur {
  nom: "anthropic" | "openai" | "gemini";
  /** Renvoie le texte JSON brut. */
  appeler(a: AppelModele): Promise<string>;
}

export const MODELE_ANTHROPIC_DEFAUT = "claude-sonnet-5";
/** Modèle Flash stable de l'offre gratuite (doc modèles Gemini). */
export const MODELE_GEMINI_DEFAUT = "gemini-2.5-flash";
const URL_ANTHROPIC = "https://api.anthropic.com/v1/messages";
const URL_OPENAI = "https://api.openai.com/v1/responses";
const LIMITE_MESSAGE_FOURNISSEUR = 300;

/**
 * Mots-clés gardés pour `responseJsonSchema` (REST GenerationConfig).
 * `additionalProperties` n'en fait pas partie : le schéma OpenAPI de l'API le refuse (HTTP 400).
 */
const CLES_SCHEMA_GEMINI = new Set([
  "$anchor",
  "$defs",
  "$id",
  "$ref",
  "anyOf",
  "description",
  "enum",
  "items",
  "maxItems",
  "maximum",
  "minItems",
  "minimum",
  "oneOf",
  "prefixItems",
  "properties",
  "propertyOrdering",
  "required",
  "title",
  "type",
]);

/** Retire, à tous les niveaux, les mots-clés que Gemini refuse (`pattern`, `additionalProperties`, `format` hors `date-time` et `enum`). */
export function schemaPourGemini(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(schemaPourGemini);
  if (!schema || typeof schema !== "object") return schema;
  const sortie: Record<string, unknown> = {};
  for (const [cle, valeur] of Object.entries(schema)) {
    if (cle === "format") {
      if (valeur === "date-time" || valeur === "enum") sortie.format = valeur;
      continue;
    }
    if (cle === "properties" || cle === "$defs") {
      if (valeur && typeof valeur === "object" && !Array.isArray(valeur)) {
        sortie[cle] = Object.fromEntries(Object.entries(valeur).map(([nom, sous]) => [nom, schemaPourGemini(sous)]));
      }
      continue;
    }
    if (!CLES_SCHEMA_GEMINI.has(cle)) continue;
    sortie[cle] = valeur && typeof valeur === "object" ? schemaPourGemini(valeur) : valeur;
  }
  return sortie;
}

export function urlGemini(modele: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modele)}:generateContent`;
}

/** Corps `generateContent`. `avecSchema` à faux : seulement `responseMimeType` (repli après un HTTP 400). */
export function corpsGemini(a: AppelModele, avecSchema = true) {
  const generationConfig: {
    maxOutputTokens: number;
    responseMimeType: "application/json";
    responseJsonSchema?: unknown;
  } = { maxOutputTokens: a.maxTokens, responseMimeType: "application/json" };
  if (avecSchema) generationConfig.responseJsonSchema = schemaPourGemini(a.schema);
  return {
    systemInstruction: { parts: [{ text: a.systeme }] },
    contents: [{ role: "user", parts: [{ text: a.utilisateur }] }],
    generationConfig,
  };
}

/** Concatène `candidates[0].content.parts[].text` (hors blocs de raisonnement). `finishReason = "MAX_TOKENS"` : tronqué. */
export function texteGemini(json: unknown): string {
  const j = (json ?? {}) as {
    candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  };
  const candidat = Array.isArray(j.candidates) ? j.candidates[0] : undefined;
  if (candidat?.finishReason === "MAX_TOKENS") throw new ErreurFournisseur("tronque");
  const texte = (Array.isArray(candidat?.content?.parts) ? candidat.content.parts : [])
    .filter((p) => p?.thought !== true)
    .map((p) => (typeof p?.text === "string" ? p.text : ""))
    .join("");
  if (!texte) throw new ErreurFournisseur("vide");
  return texte;
}

export function corpsAnthropic(a: AppelModele, modele: string) {
  return {
    model: modele,
    max_tokens: a.maxTokens,
    system: a.systeme,
    messages: [{ role: "user", content: a.utilisateur }],
    output_config: { format: { type: "json_schema", schema: a.schema } },
  };
}

/** Concatène les blocs texte. `stop_reason = "max_tokens"` : réponse tronquée. */
export function texteAnthropic(json: unknown): string {
  const j = (json ?? {}) as { content?: { type?: string; text?: string }[]; stop_reason?: string };
  if (j.stop_reason === "max_tokens") throw new ErreurFournisseur("tronque");
  const texte = (Array.isArray(j.content) ? j.content : [])
    .filter((b) => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
  if (!texte) throw new ErreurFournisseur("vide");
  return texte;
}

export function corpsOpenAI(a: AppelModele, modele: string) {
  return {
    model: modele,
    instructions: a.systeme,
    input: a.utilisateur,
    max_output_tokens: a.maxTokens,
    text: { format: { type: "json_schema", name: a.nomSchema, schema: a.schema, strict: true } },
  };
}

/** `output_text` s'il existe, sinon concaténation de `output[].content[].text`. `status = "incomplete"` : tronqué. */
export function texteOpenAI(json: unknown): string {
  const j = (json ?? {}) as { output_text?: string; status?: string; output?: { content?: { text?: string }[] }[] };
  if (j.status === "incomplete") throw new ErreurFournisseur("tronque");
  let texte = typeof j.output_text === "string" ? j.output_text : "";
  if (!texte) {
    texte = (Array.isArray(j.output) ? j.output : [])
      .flatMap((o) => (Array.isArray(o?.content) ? o.content : []))
      .map((c) => (typeof c?.text === "string" ? c.text : ""))
      .join("");
  }
  if (!texte) throw new ErreurFournisseur("vide");
  return texte;
}

async function envoyer(fetchImpl: typeof fetch, url: string, headers: Record<string, string>, corps: unknown, delaiMs: number): Promise<unknown> {
  let reponse: Response;
  try {
    reponse = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(corps),
      signal: AbortSignal.timeout(delaiMs),
    });
  } catch (e) {
    const nom = (e as { name?: string })?.name;
    throw new ErreurFournisseur(nom === "TimeoutError" || nom === "AbortError" ? "delai" : "reseau");
  }
  if (!reponse.ok) throw new ErreurFournisseur("statut", reponse.status, await messageStatut(reponse));
  try {
    return await reponse.json();
  } catch (e) {
    const nom = (e as { name?: string })?.name;
    throw new ErreurFournisseur(nom === "TimeoutError" || nom === "AbortError" ? "delai" : "vide");
  }
}

/** `error.message` du JSON d'erreur, tronqué. Rien si le corps n'a pas cette forme (on n'y met pas la saisie). */
async function messageStatut(reponse: Response): Promise<string | undefined> {
  try {
    const json = (await reponse.json()) as { error?: { message?: unknown } };
    const brut = json?.error && typeof json.error === "object" ? json.error.message : undefined;
    if (typeof brut !== "string") return undefined;
    const texte = brut.trim();
    return texte ? texte.slice(0, LIMITE_MESSAGE_FOURNISSEUR) : undefined;
  } catch {
    return undefined;
  }
}

/** `null` si la clé du fournisseur choisi est absente (ou, pour OpenAI, si le modèle n'est pas précisé). */
export function creerFournisseur(env: NodeJS.ProcessEnv, fetchImpl: typeof fetch = fetch): Fournisseur | null {
  const choix = (env.MA_CIBLE_FOURNISSEUR || "anthropic").trim().toLowerCase();
  const modele = env.MA_CIBLE_MODELE?.trim();
  if (choix === "openai") {
    const cle = env.OPENAI_API_KEY?.trim();
    if (!cle || !modele) return null;
    return {
      nom: "openai",
      async appeler(a) {
        return texteOpenAI(await envoyer(fetchImpl, URL_OPENAI, { authorization: `Bearer ${cle}` }, corpsOpenAI(a, modele), a.delaiMs));
      },
    };
  }
  if (choix === "gemini") {
    const cle = env.GEMINI_API_KEY?.trim();
    if (!cle) return null;
    const modeleGemini = modele || MODELE_GEMINI_DEFAUT;
    return {
      nom: "gemini",
      async appeler(a) {
        const url = urlGemini(modeleGemini);
        const headers = { "x-goog-api-key": cle };
        try {
          return texteGemini(await envoyer(fetchImpl, url, headers, corpsGemini(a), a.delaiMs));
        } catch (e) {
          if (!(e instanceof ErreurFournisseur) || e.statut !== 400) throw e;
          return texteGemini(await envoyer(fetchImpl, url, headers, corpsGemini(a, false), a.delaiMs));
        }
      },
    };
  }
  if (choix !== "anthropic") return null;
  const cle = env.ANTHROPIC_API_KEY?.trim();
  if (!cle) return null;
  return {
    nom: "anthropic",
    async appeler(a) {
      const headers = { "x-api-key": cle, "anthropic-version": "2023-06-01" };
      return texteAnthropic(await envoyer(fetchImpl, URL_ANTHROPIC, headers, corpsAnthropic(a, modele || MODELE_ANTHROPIC_DEFAUT), a.delaiMs));
    },
  };
}
