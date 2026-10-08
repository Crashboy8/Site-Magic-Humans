import { describe, expect, it } from "vitest";
import { isPublicPath } from "./config";

describe("isPublicPath", () => {
  it("laisse la photo de la salle accessible sans connexion", () => {
    expect(isPublicPath("/api/quiz-salle")).toBe(true);
  });
  it("ouvre la page d'arrivée depuis Le Cibleur sans compte", () => {
    expect(isPublicPath("/depuis-cibleur")).toBe(true);
    expect(isPublicPath("/depuis-cibleur/")).toBe(true);
    expect(isPublicPath("/depuis-cibleurs")).toBe(false);
  });
});
