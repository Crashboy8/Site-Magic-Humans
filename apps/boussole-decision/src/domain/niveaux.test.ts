import { describe, expect, it } from "vitest";
import { accesActif, dureeParDefaut, estNiveau, finAcces, NIVEAUX } from "./niveaux";

const MAINTENANT = new Date("2026-10-10T10:00:00Z");

describe("niveaux VIP des codes", () => {
  it("trois niveaux, les mêmes que la base", () => {
    expect(NIVEAUX).toEqual(["pionnier", "vip12", "membre"]);
    expect(estNiveau("vip12")).toBe(true);
    expect(estNiveau("VIP12")).toBe(false);
    expect(estNiveau("")).toBe(false);
    expect(estNiveau(null)).toBe(false);
  });

  it("durée proposée : à vie pour un pionnier, 1 an pour vip12 et membre", () => {
    expect(dureeParDefaut("pionnier")).toBe("vie");
    expect(dureeParDefaut("vip12")).toBe("1an");
    expect(dureeParDefaut("membre")).toBe("1an");
  });

  it("calcule la fin de l'accès : null à vie, un an plus tard, ou une date précise à venir", () => {
    expect(finAcces("vie", "", MAINTENANT)).toEqual({ ok: true, fin: null });
    expect(finAcces("1an", "", MAINTENANT)).toEqual({ ok: true, fin: "2027-10-10T10:00:00.000Z" });
    const date = finAcces("date", "2027-03-31", MAINTENANT);
    expect(date.ok && date.fin && new Date(date.fin) > new Date("2027-03-31T00:00:00Z")).toBe(true);
    expect(finAcces("date", "2026-01-01", MAINTENANT)).toEqual({ ok: false });
    expect(finAcces("date", "", MAINTENANT)).toEqual({ ok: false });
    expect(finAcces("date", "31/03/2027", MAINTENANT)).toEqual({ ok: false });
  });

  it("un accès est actif avec un niveau, sans fin ou avant sa fin", () => {
    expect(accesActif({ niveau: "pionnier", accesJusquAu: null }, MAINTENANT)).toBe(true);
    expect(accesActif({ niveau: "vip12", accesJusquAu: "2027-10-10T10:00:00Z" }, MAINTENANT)).toBe(true);
    expect(accesActif({ niveau: "membre", accesJusquAu: "2026-10-09T10:00:00Z" }, MAINTENANT)).toBe(false);
    expect(accesActif({ niveau: null, accesJusquAu: null }, MAINTENANT)).toBe(false);
  });
});
