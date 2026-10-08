import { describe, expect, it } from "vitest";
import { isPublicPath, suiteSure } from "./config";

describe("isPublicPath", () => {
  it("laisse la photo de la salle accessible sans connexion", () => {
    expect(isPublicPath("/api/quiz-salle")).toBe(true);
  });
});

describe("suiteSure", () => {
  it("accepte Mon espace, un profil et une version", () => {
    expect(suiteSure("/mon-espace")).toBe("/mon-espace");
    expect(suiteSure("/mon-espace/")).toBe("/mon-espace/");
    expect(suiteSure("/mon-espace/importer/")).toBe("/mon-espace/importer/");
    expect(suiteSure("/profils/abc/")).toBe("/profils/abc/");
    expect(suiteSure("/versions/abc/tableau/")).toBe("/versions/abc/tableau/");
  });

  it("refuse un double slash", () => {
    expect(suiteSure("/mon-espace//importer/")).toBeNull();
    expect(suiteSure("//mon-espace")).toBeNull();
    expect(suiteSure("/profils//abc")).toBeNull();
  });

  it("refuse une barre oblique inverse", () => {
    expect(suiteSure("/mon-espace/\\importer")).toBeNull();
    expect(suiteSure("\\mon-espace")).toBeNull();
  });

  it("refuse un deux-points", () => {
    expect(suiteSure("/mon-espace/:id")).toBeNull();
    expect(suiteSure("/profils/a:b")).toBeNull();
    expect(suiteSure("https://magichumans.com/mon-espace/")).toBeNull();
  });

  it("refuse une adresse trop longue", () => {
    const ok = `/mon-espace/${"a".repeat(200 - "/mon-espace/".length)}`;
    expect(ok).toHaveLength(200);
    expect(suiteSure(ok)).toBe(ok);
    expect(suiteSure(`${ok}a`)).toBeNull();
  });

  it("refuse un autre préfixe", () => {
    expect(suiteSure("/")).toBeNull();
    expect(suiteSure("/compte/")).toBeNull();
    expect(suiteSure("/profils")).toBeNull();
    expect(suiteSure("/versions")).toBeNull();
    expect(suiteSure("mon-espace")).toBeNull();
    expect(suiteSure("")).toBeNull();
  });

  it("refuse une valeur qui n'est pas une chaîne", () => {
    expect(suiteSure(null)).toBeNull();
    expect(suiteSure(undefined)).toBeNull();
    expect(suiteSure(1)).toBeNull();
    expect(suiteSure(["/mon-espace/"])).toBeNull();
    expect(suiteSure({ toString: () => "/mon-espace/" })).toBeNull();
  });
});
