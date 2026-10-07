import { describe, expect, it } from "vitest";
import { getMethodology } from "@/domain/methodology";
import { maCible } from "@/i18n/messages/maCible";
import { methodeAlignee } from "./methode";

describe("termes de la méthode sur Ma Cible", () => {
  it("reste en français tant que l'interface n'est pas traduite, y compris en anglais", () => {
    const en = getMethodology("en");
    expect(methodeAlignee(maCible.en, en).terms.mecanisme).toBe("Mécanisme");
    expect(methodeAlignee(maCible.es, getMethodology("es")).terms.mecanisme).toBe("Mécanisme");
  });

  it("suit la langue dès que les textes de l'écran ne sont plus le français", () => {
    const en = getMethodology("en");
    const traduits = { ...maCible.en, talent: { ...maCible.en.talent, titre: "Your talent" }, accueil: { ...maCible.en.accueil, commencer: "Start" } };
    expect(methodeAlignee(traduits, en).terms.mecanisme).toBe("Mechanism");
  });
});
