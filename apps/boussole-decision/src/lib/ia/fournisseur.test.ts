import { describe, expect, it, vi } from "vitest";
import { SCHEMA_CADRAGE, SCHEMA_RESULTAT } from "@/domain/maCible/schemas";
import { corpsAnthropic, corpsGemini, corpsOpenAI, creerFournisseur, ErreurFournisseur, texteAnthropic, texteGemini, texteOpenAI, type AppelModele } from "./fournisseur";

const appel: AppelModele = { systeme: "Tu es utile.", utilisateur: "Bonjour", schema: SCHEMA_CADRAGE, nomSchema: "cadrage", maxTokens: 1500, delaiMs: 5000 };
const reponseJson = (corps: unknown, status = 200) => new Response(JSON.stringify(corps), { status, headers: { "content-type": "application/json" } });
const env = (o: Record<string, string>) => o as NodeJS.ProcessEnv;
const code = async (p: Promise<unknown>) => p.then(() => null, (e: ErreurFournisseur) => ({ code: e.code, statut: e.statut }));

describe("Anthropic", () => {
  it("corpsAnthropic : modèle, system, messages, schéma, max_tokens", () => {
    expect(corpsAnthropic(appel, "claude-sonnet-5")).toEqual({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      system: "Tu es utile.",
      messages: [{ role: "user", content: "Bonjour" }],
      output_config: { format: { type: "json_schema", schema: SCHEMA_CADRAGE } },
    });
  });

  it("texteAnthropic concatène les blocs texte", () => {
    expect(texteAnthropic({ content: [{ type: "text", text: '{"a":' }, { type: "thinking", thinking: "x" }, { type: "text", text: "1}" }], stop_reason: "end_turn" })).toBe('{"a":1}');
  });

  it("stop_reason max_tokens : tronqué ; réponse sans texte : vide", () => {
    expect(() => texteAnthropic({ content: [{ type: "text", text: "{" }], stop_reason: "max_tokens" })).toThrow(expect.objectContaining({ code: "tronque" }));
    expect(() => texteAnthropic({ content: [] })).toThrow(expect.objectContaining({ code: "vide" }));
  });

  it("envoie la requête avec les bons en-têtes, sans clé dans le corps", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ content: [{ type: "text", text: "{}" }], stop_reason: "end_turn" }));
    const f = creerFournisseur(env({ ANTHROPIC_API_KEY: "sk-test", MA_CIBLE_MODELE: "mon-modele" }), fetchSimule as unknown as typeof fetch)!;
    expect(f.nom).toBe("anthropic");
    expect(await f.appeler(appel)).toBe("{}");
    const [url, init] = fetchSimule.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "x-api-key": "sk-test", "anthropic-version": "2023-06-01", "content-type": "application/json" });
    expect(JSON.parse(init.body as string).model).toBe("mon-modele");
    expect(init.body).not.toContain("sk-test");
  });

  it("utilise claude-sonnet-5 par défaut", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ content: [{ type: "text", text: "{}" }] }));
    await creerFournisseur(env({ ANTHROPIC_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!.appeler(appel);
    expect(JSON.parse((fetchSimule.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).model).toBe("claude-sonnet-5");
  });

  it("statut 529 : erreur statut, avec error.message tronqué", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ error: { message: `surcharge ${"y".repeat(400)}` } }, 529));
    const f = creerFournisseur(env({ ANTHROPIC_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!;
    await expect(f.appeler(appel)).rejects.toMatchObject({ code: "statut", statut: 529, messageFournisseur: `surcharge ${"y".repeat(400)}`.slice(0, 300) });
    expect(fetchSimule).toHaveBeenCalledTimes(1);
  });

  it("délai dépassé : erreur délai ; panne réseau : erreur réseau", async () => {
    const lent = ((_u: string, init: RequestInit) =>
      new Promise((_r, rejet) => init.signal!.addEventListener("abort", () => rejet(init.signal!.reason)))) as unknown as typeof fetch;
    const f = creerFournisseur(env({ ANTHROPIC_API_KEY: "k" }), lent)!;
    expect(await code(f.appeler({ ...appel, delaiMs: 20 }))).toEqual({ code: "delai", statut: undefined });
    const coupe = creerFournisseur(env({ ANTHROPIC_API_KEY: "k" }), (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch)!;
    expect(await code(coupe.appeler(appel))).toEqual({ code: "reseau", statut: undefined });
  });
});

describe("OpenAI", () => {
  it("corpsOpenAI", () => {
    expect(corpsOpenAI(appel, "gpt-x")).toEqual({
      model: "gpt-x",
      instructions: "Tu es utile.",
      input: "Bonjour",
      max_output_tokens: 1500,
      text: { format: { type: "json_schema", name: "cadrage", schema: SCHEMA_CADRAGE, strict: true } },
    });
  });

  it("texteOpenAI : output_text, sinon output[].content[].text, incomplet = tronqué", () => {
    expect(texteOpenAI({ output_text: '{"a":1}' })).toBe('{"a":1}');
    expect(texteOpenAI({ output: [{ content: [{ text: '{"a":' }] }, { content: [{ text: "1}" }] }] })).toBe('{"a":1}');
    expect(() => texteOpenAI({ status: "incomplete", output_text: "{" })).toThrow(expect.objectContaining({ code: "tronque" }));
    expect(() => texteOpenAI({})).toThrow(expect.objectContaining({ code: "vide" }));
  });

  it("envoie la requête avec Authorization", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ output_text: "{}" }));
    const f = creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "openai", OPENAI_API_KEY: "sk-o", MA_CIBLE_MODELE: "gpt-x" }), fetchSimule as unknown as typeof fetch)!;
    expect(f.nom).toBe("openai");
    await f.appeler(appel);
    const [url, init] = fetchSimule.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(init.headers).toMatchObject({ authorization: "Bearer sk-o" });
  });
});

describe("Gemini", () => {
  it("corpsGemini : responseMimeType et responseJsonSchema, sans additionalProperties", () => {
    const corps = corpsGemini(appel);
    expect(corps.systemInstruction).toEqual({ parts: [{ text: "Tu es utile." }] });
    expect(corps.contents).toEqual([{ role: "user", parts: [{ text: "Bonjour" }] }]);
    expect(corps.generationConfig.responseMimeType).toBe("application/json");
    expect(corps.generationConfig.maxOutputTokens).toBe(1500);
    expect(corps.generationConfig).not.toHaveProperty("responseFormat");
    const schema = corps.generationConfig.responseJsonSchema as { type: string; required: string[] };
    expect(schema.type).toBe("object");
    expect(schema.required).toContain("statut");
    expect(JSON.stringify(schema)).not.toContain("additionalProperties");
    expect(JSON.stringify(schema)).toContain("hors_sujet");
    expect(JSON.stringify(corpsGemini({ ...appel, schema: SCHEMA_RESULTAT }).generationConfig.responseJsonSchema)).not.toContain("additionalProperties");
  });

  it("retire pattern, format hors date-time, et les mots-clés inconnus", () => {
    const corps = corpsGemini({
      ...appel,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          a: { type: "string", pattern: "^a", format: "email", minLength: 1 },
          b: { type: "string", format: "date-time" },
          c: { type: "string", format: "enum" },
        },
        required: ["a"],
      },
    });
    expect(corps.generationConfig.responseJsonSchema).toEqual({
      type: "object",
      properties: {
        a: { type: "string" },
        b: { type: "string", format: "date-time" },
        c: { type: "string", format: "enum" },
      },
      required: ["a"],
    });
  });

  it("corpsGemini sans schéma : seulement responseMimeType", () => {
    expect(corpsGemini(appel, false).generationConfig).toEqual({ maxOutputTokens: 1500, responseMimeType: "application/json" });
  });

  it("texteGemini concatène les blocs texte, sans le raisonnement", () => {
    expect(texteGemini({
      candidates: [{
        finishReason: "STOP",
        content: { parts: [{ text: "je réfléchis", thought: true }, { text: '{"a":' }, { text: "1}" }] },
      }],
    })).toBe('{"a":1}');
  });

  it("finishReason MAX_TOKENS : tronqué ; réponse sans texte : vide", () => {
    expect(() => texteGemini({ candidates: [{ finishReason: "MAX_TOKENS", content: { parts: [{ text: "{" }] } }] })).toThrow(expect.objectContaining({ code: "tronque" }));
    expect(() => texteGemini({ candidates: [{ finishReason: "STOP", content: { parts: [] } }] })).toThrow(expect.objectContaining({ code: "vide" }));
    expect(() => texteGemini({})).toThrow(expect.objectContaining({ code: "vide" }));
  });

  it("envoie la requête avec x-goog-api-key, sans clé dans l'adresse ni le corps", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ candidates: [{ content: { parts: [{ text: "{}" }] }, finishReason: "STOP" }] }));
    const f = creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "cle-test", MA_CIBLE_MODELE: "mon-modele" }), fetchSimule as unknown as typeof fetch)!;
    expect(f.nom).toBe("gemini");
    expect(await f.appeler(appel)).toBe("{}");
    const [url, init] = fetchSimule.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/mon-modele:generateContent");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "x-goog-api-key": "cle-test", "content-type": "application/json" });
    expect(url).not.toContain("cle-test");
    expect(init.body).not.toContain("cle-test");
    const corps = JSON.parse(init.body as string);
    expect(corps.generationConfig.maxOutputTokens).toBe(1500);
    expect(corps.generationConfig.responseMimeType).toBe("application/json");
    expect(corps.generationConfig.responseJsonSchema).toBeDefined();
    expect(corps.generationConfig).not.toHaveProperty("responseFormat");
  });

  it("utilise gemini-2.5-flash par défaut", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }));
    await creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!.appeler(appel);
    expect((fetchSimule.mock.calls[0] as unknown as [string])[0]).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
  });

  it("statut 429 : même erreur d'indisponibilité, sans second essai", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ error: { message: "quota" } }, 429));
    const f = creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!;
    expect(await code(f.appeler(appel))).toEqual({ code: "statut", statut: 429 });
    expect(fetchSimule).toHaveBeenCalledTimes(1);
    await expect(f.appeler(appel)).rejects.toMatchObject({ messageFournisseur: "quota" });
  });

  it("400 avec le schéma : un second appel sans responseJsonSchema", async () => {
    const fetchSimule = vi.fn()
      .mockResolvedValueOnce(reponseJson({ error: { message: "Unknown name \"additionalProperties\"" } }, 400))
      .mockResolvedValueOnce(reponseJson({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "{}" }] } }] }));
    const f = creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!;
    expect(await f.appeler(appel)).toBe("{}");
    expect(fetchSimule).toHaveBeenCalledTimes(2);
    const corps = (i: number) => JSON.parse((fetchSimule.mock.calls[i] as unknown as [string, RequestInit])[1].body as string);
    expect(corps(0).generationConfig.responseJsonSchema).toBeDefined();
    expect(corps(1).generationConfig).toEqual({ maxOutputTokens: 1500, responseMimeType: "application/json" });
    expect(corps(1).generationConfig).not.toHaveProperty("responseJsonSchema");
  });

  it("400 puis encore 400 : on abandonne, message tronqué à 300 caractères", async () => {
    const message = `modèle refusé ${"x".repeat(400)}`;
    const fetchSimule = vi.fn(async () => reponseJson({ error: { message } }, 400));
    const f = creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!;
    await expect(f.appeler(appel)).rejects.toMatchObject({
      code: "statut",
      statut: 400,
      messageFournisseur: message.slice(0, 300),
    });
    expect(fetchSimule).toHaveBeenCalledTimes(2);
  });
});

describe("creerFournisseur", () => {
  it("renvoie null sans clé", () => {
    expect(creerFournisseur(env({}))).toBeNull();
    expect(creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "anthropic", OPENAI_API_KEY: "x" }))).toBeNull();
    expect(creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini" }))).toBeNull();
    expect(creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", ANTHROPIC_API_KEY: "k" }))).toBeNull();
  });
  it("openai sans MA_CIBLE_MODELE : null", () => {
    expect(creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "openai", OPENAI_API_KEY: "k" }))).toBeNull();
  });
  it("fournisseur inconnu : null", () => {
    expect(creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "autre", ANTHROPIC_API_KEY: "k" }))).toBeNull();
  });
});
