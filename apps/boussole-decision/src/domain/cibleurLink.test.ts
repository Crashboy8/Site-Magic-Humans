import { describe, expect, it } from "vitest";
import { lireAncre } from "./maCible/ancre";
import { cibleurHref } from "./cibleurLink";
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

describe("cibleurHref", () => {
  it("talent vide : pas d'ancre", () => {
    expect(cibleurHref(empty)).toBe("/boussole-decision/ma-cible/");
    expect(cibleurHref({ ...empty, failureSituations: "   " })).toBe("/boussole-decision/ma-cible/");
  });

  it("talent rempli : l'ancre relue donne la Boussole et les bons champs", () => {
    const href = cibleurHref(talent);
    expect(href.startsWith("/boussole-decision/ma-cible/#b=")).toBe(true);
    expect(href.split("#b=")[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    const lu = lireAncre(href);
    expect(lu?.source).toBe("boussole");
    expect(lu?.talent).toEqual({
      mecanisme: "raconte des histoires qui donnent envie d'agir",
      contexte: talent.contexteDeclencheur,
      benefice: talent.superBenefice,
      antiContexte: talent.antiContexte,
      reussite: talent.successSituations,
    });
  });
});
