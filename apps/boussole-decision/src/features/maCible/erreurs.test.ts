import { describe, expect, it } from "vitest";
import { maCible } from "@/i18n/messages/maCible";
import { idChamp, messageApi, messageChamp, messagePresBouton } from "./erreurs";

const M = maCible.fr;

describe("messages d'erreur", () => {
  it("donne un identifiant HTML stable aux champs", () => {
    expect(idChamp("talent.mecanisme")).toBe("champ-talent-mecanisme");
  });
  it("choisit le bon message de champ", () => {
    expect(messageChamp({ champ: "terrain.marche", code: "requis" }, M)).toBe(M.validation.marche);
    expect(messageChamp({ champ: "terrain.offre", code: "requis" }, M)).toBe(M.validation.offreOuClients);
    expect(messageChamp({ champ: "talent.mecanisme", code: "trop_court", min: 12 }, M)).toBe(M.validation.tropCourt(12));
    expect(messageChamp({ champ: "talent.mecanisme", code: "trop_long", max: 400 }, M)).toBe(M.validation.tropLong(400));
    expect(messageChamp({ champ: "terrain.zone", code: "requis" }, M)).toBe(M.validation.requis);
    expect(messagePresBouton({ champ: "talent.mecanisme", code: "requis" }, "Mécanisme", M)).toBe("Il manque « Mécanisme ».");
    expect(messagePresBouton({ champ: "terrain.marche", code: "requis" }, "Marché", M)).toBe(M.validation.marche);
  });
  it("ne cite pas un nombre par jour pour le quota personnel", () => {
    const texte = messageApi("quota_ip", M);
    expect(texte).toBe("Tu as atteint la limite du jour. Ton travail est gardé : reviens demain, ou parles-en avec Pierre en attendant.");
    expect(texte).not.toMatch(/\d+\s+par jour/);
    expect(messageApi("quota_global", M)).toBe(M.erreurs.quota_global);
    expect(messageApi("ia_indisponible", M)).toBe(M.erreurs.ia_indisponible);
    expect(messageApi("inconnue", M)).toBe(M.erreurs.inconnue);
  });
});
