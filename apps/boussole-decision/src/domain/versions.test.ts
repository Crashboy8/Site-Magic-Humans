import { describe, expect, it } from "vitest";
import { generateInvitationCode, nextVersionName, normalizeInvitationCode } from "./versions";

describe("nextVersionName", () => {
  it("propose V1 quand il n'y a que le brouillon", () => {
    expect(nextVersionName([{ name: "Brouillon" }])).toBe("V1");
  });
  it("suit le plus grand numéro, même dans le désordre", () => {
    expect(nextVersionName([{ name: "V2" }, { name: "Brouillon" }, { name: "v5" }, { name: "V3 bis" }])).toBe("V6");
  });
});

describe("codes d'invitation", () => {
  it("génère un code au format accepté par la base", () => {
    expect(generateInvitationCode()).toMatch(/^[A-Z0-9-]{6,40}$/);
  });
  it("normalise la saisie", () => {
    expect(normalizeInvitationCode("  boussole-ab12 ")).toBe("BOUSSOLE-AB12");
  });
});
