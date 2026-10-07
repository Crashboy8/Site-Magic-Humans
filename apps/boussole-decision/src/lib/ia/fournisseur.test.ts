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

  it("statut 529 : erreur statut", async () => {
    const f = creerFournisseur(env({ ANTHROPIC_API_KEY: "k" }), (async () => reponseJson({ error: "surcharge" }, 529)) as unknown as typeof fetch)!;
    expect(await code(f.appeler(appel))).toEqual({ code: "statut", statut: 529 });
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
  it("corpsGemini : instruction système, message utilisateur, schéma JSON via responseFormat", () => {
    expect(corpsGemini(appel)).toEqual({
      systemInstruction: { parts: [{ text: "Tu es utile." }] },
      contents: [{ role: "user", parts: [{ text: "Bonjour" }] }],
      generationConfig: {
        maxOutputTokens: 1500,
        responseFormat: { text: { mimeType: "application/json", schema: SCHEMA_CADRAGE } },
      },
    });
    expect(corpsGemini({ ...appel, schema: SCHEMA_RESULTAT }).generationConfig.responseFormat?.text.schema).toBe(SCHEMA_RESULTAT);
  });

  it("schéma avec un mot-clé refusé : seulement responseMimeType", () => {
    const corps = corpsGemini({ ...appel, schema: { type: "string", pattern: "^a" } });
    expect(corps.generationConfig).toEqual({ maxOutputTokens: 1500, responseMimeType: "application/json" });
    expect(corps.generationConfig).not.toHaveProperty("responseFormat");
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
    expect(JSON.parse(init.body as string).generationConfig.maxOutputTokens).toBe(1500);
  });

  it("utilise gemini-3.8-flash par défaut", async () => {
    const fetchSimule = vi.fn(async () => reponseJson({ candidates: [{ content: { parts: [{ text: "{}" }] } }] }));
    await creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "k" }), fetchSimule as unknown as typeof fetch)!.appeler(appel);
    expect((fetchSimule.mock.calls[0] as unknown as [string])[0]).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent");
  });

  it("statut 429 : même erreur d'indisponibilité que les autres fournisseurs", async () => {
    const f = creerFournisseur(env({ MA_CIBLE_FOURNISSEUR: "gemini", GEMINI_API_KEY: "k" }), (async () => reponseJson({ error: "quota" }, 429)) as unknown as typeof fetch)!;
    expect(await code(f.appeler(appel))).toEqual({ code: "statut", statut: 429 });
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
