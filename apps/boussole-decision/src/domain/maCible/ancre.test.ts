import { describe, expect, it } from "vitest";
import { encodeBase64Url } from "@/domain/carteLink";
import { encoderCible, lireAncre, type AncreCible } from "./ancre";

const quiz = {
  v: 1,
  lang: "fr",
  archetypes: ["mediateur", "stratege"],
  name: "Mon Talent Unique : Médiatrice Audacieuse",
  mecanisme: "sais démêler les situations bloquées",
  contexte: "une équipe est sous tension",
  benefice: "aider les équipes à retrouver confiance",
  antiContexte: "les organisations très hiérarchiques",
  success: "J'ai réconcilié deux chefs d'équipe.",
  failure: "Tâches administratives",
  fertile: [],
  toxic: [],
};

describe("#cible=", () => {
  it("aller-retour avec encoderCible (accents, emoji, guillemets)", () => {
    const a: AncreCible = {
      v: 1,
      src: "carte",
      lang: "en",
      nom: "Médiatrice « Audacieuse » 🌟",
      mecanisme: "démêle l'inextricable",
      contexte: "une équipe sous tension",
      sousTalents: ["Écoute", "Humour"],
      pistes: ["Conseil RH"],
      aDeleguer: ["Reporting"],
    };
    const lu = lireAncre(`#cible=${encoderCible(a)}`);
    expect(lu).toEqual({
      source: "carte",
      langue: "en",
      talent: { nom: a.nom, mecanisme: a.mecanisme, contexte: a.contexte, sousTalents: a.sousTalents, pistes: a.pistes, aDeleguer: a.aDeleguer },
    });
  });

  it("applique les bornes de longueur", () => {
    const lu = lireAncre(`#cible=${encoderCible({ v: 1, src: "carte", nom: "n".repeat(300), mecanisme: "m".repeat(900), sousTalents: Array.from({ length: 10 }, (_, i) => `t${i}`) })}`);
    expect(lu?.talent.nom).toHaveLength(120);
    expect(lu?.talent.mecanisme).toHaveLength(400);
    expect(lu?.talent.sousTalents).toHaveLength(6);
  });
});

describe("#q=", () => {
  it("lit une charge du quiz : « sais » retiré, nom, source", () => {
    const lu = lireAncre(`#q=${encodeBase64Url(quiz)}`);
    expect(lu?.source).toBe("quiz");
    expect(lu?.talent.nom).toBe(quiz.name);
    expect(lu?.talent.mecanisme).toBe("démêler les situations bloquées");
    expect(lu?.talent.reussite).toBe(quiz.success);
    expect(lu?.talent.antiContexte).toBe(quiz.antiContexte);
    expect(lu?.langue).toBe("fr");
  });
});

describe("#b=", () => {
  it("lit le format de la Boussole", () => {
    const lu = lireAncre(`#b=${encodeBase64Url({ v: 1, mecanisme: "écoute", contexte: "un groupe", benefice: "du lien", antiContexte: "le bruit", success: "un beau moment", failure: "x" })}`);
    expect(lu).toEqual({ source: "boussole", talent: { mecanisme: "écoute", contexte: "un groupe", benefice: "du lien", antiContexte: "le bruit", reussite: "un beau moment" } });
  });
});

describe("ancres inexploitables", () => {
  it.each([
    ["absente", ""],
    ["sans clé connue", "#autre=abc"],
    ["base64 invalide", "#cible=***"],
    ["base64 correct mais JSON invalide", `#cible=${btoa("pas du json")}`],
    ["version différente", `#cible=${encodeBase64Url({ v: 2, src: "carte", mecanisme: "x" })}`],
    ["vide", `#cible=${encodeBase64Url({ v: 1, src: "carte" })}`],
    ["trop longue", `#cible=${"a".repeat(8001)}`],
  ])("%s : null", (_nom, hash) => expect(lireAncre(hash)).toBeNull());
});

describe("priorité", () => {
  it("cible > q > b", () => {
    const c = `cible=${encoderCible({ v: 1, src: "carte", mecanisme: "depuis la carte" })}`;
    const q = `q=${encodeBase64Url(quiz)}`;
    const b = `b=${encodeBase64Url({ v: 1, mecanisme: "depuis la boussole" })}`;
    expect(lireAncre(`#${b}&${q}&${c}`)?.source).toBe("carte");
    expect(lireAncre(`#${b}&${q}`)?.source).toBe("quiz");
    expect(lireAncre(`#${b}`)?.source).toBe("boussole");
  });

  it("retombe sur l'ancre suivante si la première est illisible", () => {
    expect(lireAncre(`#cible=***&q=${encodeBase64Url(quiz)}`)?.source).toBe("quiz");
  });
});
