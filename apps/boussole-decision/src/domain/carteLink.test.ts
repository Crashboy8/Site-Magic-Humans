import { describe, expect, it } from "vitest";
import { carteDuTalentHref, carteLinkData } from "./carteLink";
import type { TalentUnique } from "./types";

const talent: TalentUnique = {
  mecanisme: " raconte des histoires qui donnent envie d'agir ",
  contexteDeclencheur: "un projet porteur de sens doit embarquer des personnes très différentes",
  superBenefice: "transformer l'adhésion en passage à l'action",
  antiContexte: "Une communication descendante et aseptisée.",
  successSituations: "Quand j'anime un atelier. Quand je recueille des témoignages.",
  failureSituations: "Quand je reformule des communiqués.",
};

const empty: TalentUnique = {
  mecanisme: "",
  contexteDeclencheur: "",
  superBenefice: "",
  antiContexte: "",
  successSituations: "",
  failureSituations: "",
};

function decode(href: string) {
  const b64 = href.split("#b=")[1].replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))));
}

describe("carteDuTalentHref", () => {
  it("transmet le Talent Unique dans l'ancre, en base64url", () => {
    const href = carteDuTalentHref("https://www.magichumans.com/carte-du-talent/", talent);
    expect(href.startsWith("https://www.magichumans.com/carte-du-talent/#b=")).toBe(true);
    expect(href.split("#b=")[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decode(href)).toEqual({
      v: 1,
      mecanisme: "raconte des histoires qui donnent envie d'agir",
      contexte: talent.contexteDeclencheur,
      benefice: talent.superBenefice,
      antiContexte: talent.antiContexte,
      success: talent.successSituations,
      failure: talent.failureSituations,
    });
  });

  it("garde le lien simple quand rien n'est rempli", () => {
    expect(carteLinkData(empty)).toBeNull();
    expect(carteDuTalentHref("https://x/carte/", empty)).toBe("https://x/carte/");
    expect(carteDuTalentHref("https://x/carte/", { ...empty, failureSituations: "  " })).toBe("https://x/carte/");
  });

  it("transmet aussi un profil partiellement rempli", () => {
    expect(decode(carteDuTalentHref("https://x/", { ...empty, successSituations: "Écrire" })).success).toBe("Écrire");
  });
});
