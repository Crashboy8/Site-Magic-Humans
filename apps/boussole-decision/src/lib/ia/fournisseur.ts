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
    /** Message du fournisseur, au plus 300 caractères. Jamais le texte saisi. */
    public messageFournisseur?: string,
  ) {
    super(code);
  }
}

export interface Fournisseur {
  nom: "anthropic" | "openai" | "gemini" | "mistral";
  /** Renvoie le texte JSON brut. */
  appeler(a: AppelModele): Promise<string>;
}

export const MODELE_ANTHROPIC_DEFAUT = "claude-sonnet-5";
/** Modèle Flash stable de l'offre gratuite (doc modèles Gemini). */
export const MODELE_GEMINI_DEFAUT = "gemini-3.8-flash";
/**
 * Secours plus léger, stable, documenté (doc modèles : `gemini-3.5-flash-lite`, sorties texte et JSON).
 * `gemini-3.8-flash-lite` n'y figure pas.
 */
export const MODELE_GEMINI_SECOURS = "gemini-3.5-flash-lite";
/**
 * Alias du mode gratuit Mistral (quickstart « Activate Studio and generate an API key ») :
 * `mistral-small-latest`. Sorties JSON par schéma.
 */
export const MODELE_MISTRAL_DEFAUT = "mistral-small-latest";
/** Pause avant de relancer le même modèle Gemini (503, 429, 500 ou réseau). */
export const PAUSE_REESSAI_GEMINI_MS = 3_000;
const STATUTS_SURCHARGE = new Set([429, 500, 503]);
const URL_ANTHROPIC = "https://api.anthropic.com/v1/messages";
const URL_OPENAI = "https://api.openai.com/v1/responses";
const URL_MISTRAL = "https://api.mistral.ai/v1/chat/completions";
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

/** Le modèle principal dispose d'environ 60 % du délai, le secours du reste. */
export function partagerDelaiGemini(delaiMs: number): { primaire: number; secours: number } {
  const primaire = Math.round(delaiMs * 0.6);
  return { primaire, secours: delaiMs - primaire };
}

const pause = (ms: number) => new Promise<void>((resoudre) => setTimeout(resoudre, ms));

function surcharge(e: unknown): boolean {
  return e instanceof ErreurFournisseur && (e.code === "reseau" || (e.code === "statut" && STATUTS_SURCHARGE.has(e.statut ?? -1)));
}

function delaiDepasse(e: unknown): boolean {
  return e instanceof ErreurFournisseur && e.code === "delai";
}

/** Échec d'un essai : fournisseur, modèle, codes et message, jamais le texte saisi ni la réponse. */
function journaliserEchec(fournisseur: "gemini" | "mistral", modele: string, e: unknown) {
  if (!(e instanceof ErreurFournisseur)) return;
  const messageFournisseur = e.messageFournisseur?.slice(0, LIMITE_MESSAGE_FOURNISSEUR);
  console.error("[ma-cible]", {
    code: fournisseur === "gemini" ? "essai_gemini" : "essai_mistral",
    fournisseur,
    modele,
    motif: e.code,
    ...(e.statut !== undefined ? { statutFournisseur: e.statut } : {}),
    ...(messageFournisseur ? { messageFournisseur } : {}),
  });
}

/** Fournisseur et modèle qui ont réellement répondu. Aucun contenu. */
function journaliserModele(fournisseur: "gemini" | "mistral", modele: string) {
  console.error("[ma-cible]", { code: "modele", fournisseur, modele });
}

/** 429, 5xx ou délai : Mistral laisse la place à Gemini. */
function basculeGemini(e: unknown): boolean {
  if (!(e instanceof ErreurFournisseur)) return false;
  if (e.code === "delai") return true;
  if (e.code !== "statut" || e.statut === undefined) return false;
  return e.statut === 429 || (e.statut >= 500 && e.statut <= 599);
}

/**
 * Plafond de sortie de gemini-3.8-flash (doc modèle).
 * La réflexion est décomptée dans `maxOutputTokens` : un budget calé sur le seul JSON tronque la réponse.
 */
const PLAFOND_SORTIE_GEMINI = 65_536;

/** Corps `generateContent`. `avecSchema` à faux : seulement `responseMimeType` (repli après un HTTP 400). */
export function corpsGemini(a: AppelModele, avecSchema = true) {
  const generationConfig: {
    maxOutputTokens: number;
    responseMimeType: "application/json";
    responseJsonSchema?: unknown;
  } = { maxOutputTokens: PLAFOND_SORTIE_GEMINI, responseMimeType: "application/json" };
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

/**
 * Corps `chat/completions`. `avecSchema` à faux : `json_object` et le schéma dans le message système
 * (repli après un HTTP 400). Forme documentée : `response_format.json_schema` avec `name`, `schema`, `strict`.
 */
export function corpsMistral(a: AppelModele, modele: string, avecSchema = true) {
  const systeme = avecSchema
    ? a.systeme
    : `${a.systeme}\n\nRéponds uniquement par un objet JSON conforme à ce schéma :\n${JSON.stringify(a.schema)}`;
  return {
    model: modele,
    max_tokens: a.maxTokens,
    messages: [
      { role: "system", content: systeme },
      { role: "user", content: a.utilisateur },
    ],
    response_format: avecSchema
      ? { type: "json_schema", json_schema: { name: a.nomSchema, strict: true, schema: a.schema } }
      : { type: "json_object" },
  };
}

/** `choices[0].message.content` (chaîne ou blocs `text`). `finish_reason` `length` ou `model_length` : tronqué. */
export function texteMistral(json: unknown): string {
  const j = (json ?? {}) as {
    choices?: { finish_reason?: string; message?: { content?: unknown } }[];
  };
  const choix = Array.isArray(j.choices) ? j.choices[0] : undefined;
  if (choix?.finish_reason === "length" || choix?.finish_reason === "model_length") throw new ErreurFournisseur("tronque");
  const contenu = choix?.message?.content;
  const texte = typeof contenu === "string" ? contenu : texteBlocsMistral(contenu);
  if (!texte) throw new ErreurFournisseur("vide");
  return texte;
}

function texteBlocsMistral(contenu: unknown): string {
  if (!Array.isArray(contenu)) return "";
  return contenu
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const p = part as { type?: string; text?: unknown };
      if (p.type && p.type !== "text") return "";
      return typeof p.text === "string" ? p.text : "";
    })
    .join("");
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

/** Message d'erreur du JSON, tronqué : `error.message`, sinon `message` ou `detail` s'ils sont des chaînes. */
async function messageStatut(reponse: Response): Promise<string | undefined> {
  try {
    const json = (await reponse.json()) as {
      message?: unknown;
      detail?: unknown;
      error?: { message?: unknown } | string;
    };
    const imbrique = json?.error && typeof json.error === "object" ? json.error.message : undefined;
    const candidats = [imbrique, typeof json?.error === "string" ? json.error : undefined, json?.message, json?.detail];
    const brut = candidats.find((c): c is string => typeof c === "string");
    if (!brut) return undefined;
    const texte = brut.trim();
    return texte ? texte.slice(0, LIMITE_MESSAGE_FOURNISSEUR) : undefined;
  } catch {
    return undefined;
  }
}

async function appelerGemini(
  fetchImpl: typeof fetch,
  cle: string,
  modeleGemini: string,
  modeleSecours: string,
  attendre: (ms: number) => Promise<void>,
  a: AppelModele,
): Promise<string> {
  const { primaire, secours } = partagerDelaiGemini(a.delaiMs);
  const uneFois = async (modeleEssai: string, budgetMs: number) => {
    const url = urlGemini(modeleEssai);
    const headers = { "x-goog-api-key": cle };
    try {
      return texteGemini(await envoyer(fetchImpl, url, headers, corpsGemini(a), budgetMs));
    } catch (e) {
      journaliserEchec("gemini", modeleEssai, e);
      if (!(e instanceof ErreurFournisseur) || e.statut !== 400) throw e;
      try {
        return texteGemini(await envoyer(fetchImpl, url, headers, corpsGemini(a, false), budgetMs));
      } catch (e2) {
        journaliserEchec("gemini", modeleEssai, e2);
        throw e2;
      }
    }
  };

  const debut = Date.now();
  let dernier: unknown;
  try {
    const texte = await uneFois(modeleGemini, primaire);
    journaliserModele("gemini", modeleGemini);
    return texte;
  } catch (e) {
    dernier = e;
    const reste = primaire - (Date.now() - debut);
    if (surcharge(e) && reste > PAUSE_REESSAI_GEMINI_MS) {
      await attendre(PAUSE_REESSAI_GEMINI_MS);
      try {
        const texte = await uneFois(modeleGemini, reste - PAUSE_REESSAI_GEMINI_MS);
        journaliserModele("gemini", modeleGemini);
        return texte;
      } catch (e2) {
        dernier = e2;
        if (!surcharge(e2) && !delaiDepasse(e2)) throw e2;
      }
    } else if (!surcharge(e) && !delaiDepasse(e)) {
      throw e;
    }
  }
  if (modeleSecours === modeleGemini || secours < 1) throw dernier;
  const texte = await uneFois(modeleSecours, secours);
  journaliserModele("gemini", modeleSecours);
  return texte;
}

/** `null` si la clé du fournisseur choisi est absente (ou, pour OpenAI, si le modèle n'est pas précisé). */
export function creerFournisseur(
  env: NodeJS.ProcessEnv,
  fetchImpl: typeof fetch = fetch,
  options?: { attendre?: (ms: number) => Promise<void> },
): Fournisseur | null {
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
    const modeleSecours = env.MA_CIBLE_MODELE_SECOURS?.trim() || MODELE_GEMINI_SECOURS;
    const attendre = options?.attendre ?? pause;
    return {
      nom: "gemini",
      appeler: (a) => appelerGemini(fetchImpl, cle, modeleGemini, modeleSecours, attendre, a),
    };
  }
  if (choix === "mistral") {
    const cle = env.MISTRAL_API_KEY?.trim();
    if (!cle) return null;
    const modeleMistral = modele || MODELE_MISTRAL_DEFAUT;
    const cleGemini = env.GEMINI_API_KEY?.trim();
    const modeleSecours = env.MA_CIBLE_MODELE_SECOURS?.trim() || MODELE_GEMINI_SECOURS;
    const attendre = options?.attendre ?? pause;
    return {
      nom: "mistral",
      async appeler(a) {
        const { primaire, secours } = partagerDelaiGemini(a.delaiMs);
        const headers = { authorization: `Bearer ${cle}` };
        const uneFois = async (avecSchema: boolean) => {
          try {
            return texteMistral(await envoyer(fetchImpl, URL_MISTRAL, headers, corpsMistral(a, modeleMistral, avecSchema), primaire));
          } catch (e) {
            journaliserEchec("mistral", modeleMistral, e);
            throw e;
          }
        };
        try {
          let texte: string;
          try {
            texte = await uneFois(true);
          } catch (e) {
            if (!(e instanceof ErreurFournisseur) || e.statut !== 400) throw e;
            texte = await uneFois(false);
          }
          journaliserModele("mistral", modeleMistral);
          return texte;
        } catch (e) {
          if (!basculeGemini(e) || !cleGemini || secours < 1) throw e;
          return appelerGemini(fetchImpl, cleGemini, MODELE_GEMINI_DEFAUT, modeleSecours, attendre, { ...a, delaiMs: secours });
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
