import { describe, expect, it } from "vitest";
import { contenuParcours } from "@/domain/parcours/contenu";
import { contrasteWcag } from "@/features/espace/outils";
import { ICONE_ETAPE, iconeEtape, NOTES_ARGENT, TEINTES } from "./theme";

const CREME = "#FBF7F0";
const BLANC = "#FFFFFF";

describe("teintes du parcours", () => {
  it("une teinte par branche, avec un texte lisible (AA) sur blanc, crème et son fond", () => {
    for (const [branche, t] of Object.entries(TEINTES)) {
      for (const fond of [BLANC, CREME, t.fond]) expect(contrasteWcag(t.texte, fond), `${branche} sur ${fond}`).toBeGreaterThanOrEqual(4.5);
      expect(contrasteWcag(t.bouton, t.boutonTexte), `${branche} : bouton`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("les 5 bulles de l'autodiagnostic argent restent lisibles", () => {
    expect(NOTES_ARGENT).toHaveLength(5);
    for (const n of NOTES_ARGENT) expect(contrasteWcag(n.fond, n.texte), n.fond).toBeGreaterThanOrEqual(4.5);
  });

  it("pas de bleu foncé : le bleu reste un bleu ciel", () => {
    // Un bleu foncé (marine) a une luminance très basse ; le bleu ciel du Salarié reste clair et vif.
    const { forte } = TEINTES.salarie;
    expect(contrasteWcag(forte, BLANC)).toBeLessThan(4);
  });

  it("chaque étape a son icône", () => {
    expect(Object.keys(contenuParcours().etapes).filter((id) => !(id in ICONE_ETAPE))).toEqual([]);
    expect(iconeEtape("ikigai")).toBe("soleil");
  });
});
