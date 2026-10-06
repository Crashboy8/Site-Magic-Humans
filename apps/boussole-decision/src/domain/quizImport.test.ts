import { describe, expect, it } from "vitest";
import { decodeQuizHash, parseQuizResult } from "./quizImport";

const sample = {
  v: 1,
  lang: "fr",
  archetypes: ["analyste", "catalyseur"],
  name: "Mon Talent Unique : Analyste Fédérateur",
  mecanisme: "sais aller au fond des choses avec méthode",
  contexte: "il y a des problèmes complexes",
  benefice: "aider les dirigeants à prendre des décisions solides",
  antiContexte: "L'urgence permanente",
  success: "Auditer un problème.",
  failure: "Sur-cogitation : sous pression…",
  fertile: ["Des problèmes complexes", "De l'autonomie", "Des faits", "en trop"],
  toxic: ["L'urgence permanente"],
};

// Même encodage que le quiz : JSON → UTF-8 → base64url.
function encode(data: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("résultat du quiz", () => {
  it("décode le lien du quiz, accents compris", () => {
    const r = decodeQuizHash(`#q=${encode(sample)}`);
    expect(r?.name).toBe("Mon Talent Unique : Analyste Fédérateur");
    expect(r?.fertile).toEqual(["Des problèmes complexes", "De l'autonomie", "Des faits"]);
  });
  it("ignore un lien absent ou abîmé", () => {
    expect(decodeQuizHash("")).toBeNull();
    expect(decodeQuizHash("#q=!!!")).toBeNull();
    expect(decodeQuizHash(`#q=${encode({ v: 2 })}`)).toBeNull();
  });
  it("borne les textes et exige un nom et un mécanisme", () => {
    expect(parseQuizResult({ ...sample, name: "" })).toBeNull();
    expect(parseQuizResult({ ...sample, mecanisme: "x".repeat(5000) })?.mecanisme).toHaveLength(400);
    expect(parseQuizResult({ ...sample, lang: "es" })?.lang).toBe("es");
    expect(parseQuizResult({ ...sample, lang: "de" })?.lang).toBe("fr");
  });
});

describe("phrase du Talent Unique", () => {
  it("élide « afin de » devant une voyelle", async () => {
    const { getMethodology } = await import("./methodology");
    const fr = getMethodology("fr");
    expect(
      fr.talentSentence({ mecanisme: "sais écouter", contexteDeclencheur: "il y a des gens", superBenefice: "aider les autres" }),
    ).toBe("Je sais écouter dans un environnement où il y a des gens, afin d'aider les autres.");
    expect(
      fr.talentSentence({ mecanisme: "sais écouter", contexteDeclencheur: "il y a des gens", superBenefice: "relier les autres" }),
    ).toContain("afin de relier");
  });
});

describe("version espagnole", () => {
  it("formule le Talent Unique en espagnol", async () => {
    const { getMethodology } = await import("./methodology");
    expect(
      getMethodology("es").talentSentence({
        mecanisme: "sé llegar al fondo de las cosas",
        contexteDeclencheur: "hay problemas complejos",
        superBenefice: "ayudar a directivos y equipos a decidir",
      }),
    ).toBe("Sé llegar al fondo de las cosas en un entorno donde hay problemas complejos, para ayudar a directivos y equipos a decidir.");
  });
  it("reconnaît l'espagnol du navigateur", async () => {
    const { localeFromAcceptLanguage } = await import("@/i18n/config");
    expect(localeFromAcceptLanguage("es-ES,es;q=0.9,en;q=0.8")).toBe("es");
    expect(localeFromAcceptLanguage("de-DE,de;q=0.9")).toBe("fr");
  });
});
