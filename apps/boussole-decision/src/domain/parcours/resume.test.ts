import { describe, expect, it } from "vitest";
import { contenuParcours } from "./contenu";
import { calculerPosition, niveauAffiche, pointsGagnes } from "./position";
import { PROFIL_VIDE, type Profil } from "./profil";
import { resumeParcours } from "./resume";
import type { Reponse } from "./types";

const data = contenuParcours("fr");
const rep = (etapes: string[], r: Reponse = "oui") => Object.fromEntries(etapes.flatMap((id) => data.etapes[id].criteres.map((c) => [c.id, r])));
const profil = (p: Partial<Profil>): Profil => ({ ...PROFIL_VIDE, argent: 5, parallele: false, ...p });

describe("ce que « Où j'en suis ? » apporte à la progression", () => {
  it("rien sans position, ni avant la première réponse", () => {
    expect(resumeParcours(data, null)).toEqual({ points: 0, niveau: null });
    expect(resumeParcours(data, PROFIL_VIDE)).toEqual({ points: 0, niveau: null });
  });

  it("les points affichés par l'outil et le code du niveau atteint", () => {
    const p = profil({ voie: "A", reponses: rep(["connaitre", "nommer", "cap"]) });
    const position = calculerPosition(data, p);
    if (!position) throw new Error("position attendue");
    const r = resumeParcours(data, p);
    expect(r.points).toBe(pointsGagnes(position));
    expect(r.points).toBeGreaterThan(0);
    expect(r.niveau).toBe(niveauAffiche(data, position).actuel?.code ?? null);
    expect(r.niveau).toMatch(/^[0-9][A-Z]?$/);
  });

  it("des réponses à En partie rapportent moins", () => {
    const oui = resumeParcours(data, profil({ voie: "A", reponses: rep(["connaitre"]) }));
    const enPartie = resumeParcours(data, profil({ voie: "A", reponses: rep(["connaitre"], "en_partie") }));
    expect(enPartie.points).toBeLessThan(oui.points);
  });
});
