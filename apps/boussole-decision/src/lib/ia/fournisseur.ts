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
/** Meilleur modèle gratuit stable pour un nouveau projet (oct. 2026). `gemini-2.5-flash` reste gratuit, mais Google le réserve aux clés qui l'utilisaient déjà. */
export const MODELE_GEMINI_DEFAUT = "gemini-3.8-flash";
const URL_ANTHROPIC = "https://api.anthropic.com/v1/messages";
const URL_OPENAI = "https://api.openai.com/v1/responses";

/** Mots-clés JSON Schema acceptés par Gemini (`responseFormat`, doc « Structured outputs »). Les autres provoquent un rejet. */
const CLES_SCHEMA_GEMINI = new Set([
  "$anchor",
  "$defs",
  "$id",
  "$ref",
  "additionalProperties",
  "anyOf",
  "description",
  "enum",
  "format",
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

/** `false` si le schéma contient un mot-clé que Gemini refuse : on n'enverra alors que le type MIME. */
export function schemaAccepteParGemini(schema: unknown): boolean {
  if (!schema || typeof schema !== "object") return true;
  if (Array.isArray(schema)) return schema.every(schemaAccepteParGemini);
  for (const [cle, valeur] of Object.entries(schema)) {
    if (cle === "properties" || cle === "$defs") {
      if (!valeur || typeof valeur !== "object" || Array.isArray(valeur)) return false;
      if (!Object.values(valeur).every(schemaAccepteParGemini)) return false;
      continue;
    }
    if (!CLES_SCHEMA_GEMINI.has(cle)) return false;
    if (valeur && typeof valeur === "object" && !schemaAccepteParGemini(valeur)) return false;
  }
  return true;
}

export function urlGemini(modele: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modele)}:generateContent`;
}

/**
 * Corps `generateContent`. Le schéma passe par `generationConfig.responseFormat.text.schema`
 * (champ actuel ; `responseSchema` est déprécié). Schéma incompatible : `responseMimeType` seul.
 */
export function corpsGemini(a: AppelModele) {
  const generationConfig: {
    maxOutputTokens: number;
    responseMimeType?: "application/json";
    responseFormat?: { text: { mimeType: "application/json"; schema: object } };
  } = { maxOutputTokens: a.maxTokens };
  if (schemaAccepteParGemini(a.schema)) {
    generationConfig.responseFormat = { text: { mimeType: "application/json", schema: a.schema } };
  } else {
    generationConfig.responseMimeType = "application/json";
  }
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
  if (!reponse.ok) throw new ErreurFournisseur("statut", reponse.status);
  try {
    return await reponse.json();
  } catch (e) {
    const nom = (e as { name?: string })?.name;
    throw new ErreurFournisseur(nom === "TimeoutError" || nom === "AbortError" ? "delai" : "vide");
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
        return texteGemini(await envoyer(fetchImpl, urlGemini(modeleGemini), { "x-goog-api-key": cle }, corpsGemini(a), a.delaiMs));
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
