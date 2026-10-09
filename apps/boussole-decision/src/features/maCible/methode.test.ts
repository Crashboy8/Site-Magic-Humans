import { describe, expect, it } from "vitest";
import { getMethodology } from "@/domain/methodology";
import { maCible } from "@/i18n/messages/maCible";
import { methodeAlignee } from "./methode";

describe("termes de la méthode sur le Cibleur", () => {
  it("reste en français tant que l'interface n'est pas traduite (espagnol)", () => {
    expect(methodeAlignee(maCible.es, getMethodology("es")).terms.mecanisme).toBe("Mécanisme");
  });

  it("passe aux termes validés en anglais, l'interface étant traduite", () => {
    const t = methodeAlignee(maCible.en, getMethodology("en")).terms;
    expect(t.mecanisme).toBe("Mechanism");
    expect(Object.values(t)).toEqual(expect.arrayContaining(["Unique Talent", "Trigger Context", "Super Benefit", "Anti-Context"]));
  });

  it("suit la langue dès que les textes de l'écran ne sont plus le français", () => {
    const en = getMethodology("en");
    const traduits = { ...maCible.en, talent: { ...maCible.en.talent, titre: "Your talent" }, accueil: { ...maCible.en.accueil, commencer: "Start" } };
    expect(methodeAlignee(traduits, en).terms.mecanisme).toBe("Mechanism");
  });
});
