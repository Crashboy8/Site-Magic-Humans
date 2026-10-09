import { describe, expect, it } from "vitest";
import { RESULTAT_EXEMPLE_EN } from "@/domain/maCible/exempleEn";
import { CIBLE_PISTE_EXEMPLE_EN, PORTRAIT_EXEMPLE_EN } from "@/domain/maCible/exempleApprofondirEn";
import { classerCibles } from "@/domain/maCible/scores";
import { maCible } from "@/i18n/messages/maCible";
import { exporterResultat, nomFichierExport, textePortrait } from "./export";

const FRANCAIS = /[éèêàùçœ«»]|\b(le|la|les|des|du|une|est|pour|avec|vous|votre|tes|ton|ta)\b/i;
const M = maCible.en;

describe("export du résultat en anglais", () => {
  const resultat = { ...RESULTAT_EXEMPLE_EN, classement: classerCibles(RESULTAT_EXEMPLE_EN.cibles) };
  const extras = { portraits: { c1: PORTRAIT_EXEMPLE_EN }, pistes: { p2: { cible: CIBLE_PISTE_EXEMPLE_EN } } } as never;
  const { texte, markdown } = exporterResultat(resultat, "Camille", { M, extras });

  it("utilise les libellés anglais, sans aucun libellé français", () => {
    expect(texte).toContain("YOUR OFFER");
    expect(markdown).toContain("# Your offer");
    expect(markdown).toContain("### Week 1: Listen to the field");
    expect(texte).toContain("Ballpark price: €3,500 to €6,000 excl. VAT, flat fee per site");
    expect(texte).toContain("Word of mouth (priority 1): ");
    expect(texte).toContain("Their portrait".toUpperCase());
    const lignes = texte.split("\n").filter((l) => FRANCAIS.test(l));
    // Seules les recherches locales en France gardent des mots français.
    expect(lignes.filter((l) => !/Ille-et-Vilaine|agroalimentaire|directeur de site|PME/.test(l))).toEqual([]);
  });

  it("le prénom remplace le jeton et le score est au format anglais", () => {
    expect(texte).not.toContain("{{prenom}}");
    expect(texte).toContain("Camille");
    expect(texte).toMatch(/B2B · \d(\.\d)?\/10/);
    expect(texte).not.toMatch(/\d,\d\/10/);
  });

  it("le portrait seul est en anglais", () => {
    const p = textePortrait(PORTRAIT_EXEMPLE_EN, null, false, 3, M);
    expect(p).toContain("Claire, 45 to 55 (imagined by the AI)");
    expect(p).toContain("In their own words: ");
    expect(p).toContain("Trade show: ");
  });

  it("le fichier s'appelle the-targeter en anglais, le-cibleur en français", () => {
    expect(nomFichierExport("2026-10-07T10:00:00.000Z", M)).toBe("the-targeter-2026-10-07.md");
    expect(nomFichierExport("2026-10-07T10:00:00.000Z")).toBe("le-cibleur-2026-10-07.md");
  });
});
