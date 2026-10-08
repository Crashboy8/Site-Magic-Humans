import { describe, expect, it } from "vitest";
import { LOVE_TEMPLATE } from "@/content/amour";
import {
  QUIZ_MARK,
  applyLovePrefill,
  normalizeLabel,
  parseLovePrefill,
  proposalStatus,
  proposalsToCreate,
  quizProfilFrom,
} from "./lovePrefill";
import { boussoleRelationExistante } from "./editionAmour";
import type { Profile, Version } from "./types";

const payload = {
  v: 3,
  imp: { energie: "tres_important", frictions: "important", langage: "important", complementarite: "moyen" },
  notes: { besoins: "Ce qui te nourrit : rire ensemble." },
  p: "Miroir Paisible",
  crit: [
    { id: "besoin-profondeur", g: "profil", c: "fond", l: "Mon besoin de profondeur est nourri (Cœur Profond)", i: "critique" },
    { id: "nourrit-rire", g: "besoins", c: "fond", l: "Ce qui me nourrit : rire ensemble", i: "tres_important" },
    { id: "nourrit-desir", g: "besoins", c: "fond", l: "Ce qui me nourrit : le désir et la complicité", i: "important", s: "attirance" },
    { id: "valeur-fidelite", g: "valeurs", c: "fond", l: "Nous partageons la fidélité", i: "critique", n: 1 },
    { id: "valeur-respect", g: "valeurs", c: "fond", l: "Nous partageons le respect", i: "critique", n: 1, s: "respect" },
    { id: "vide-justifier", g: "eviter", c: "quotidien", l: "À éviter : devoir me justifier de tout", i: "critique", a: 1 },
    { id: "bad id!", g: "valeurs", c: "fond", l: "Ignoré", i: "critique" },
    { id: "hors-famille", g: "valeurs", c: "travail", l: "Ignoré aussi", i: "critique" },
    { id: "doublon", g: "besoins", c: "fond", l: "ce qui me nourrit : RIRE ensemble", i: "important" },
  ],
};

describe("critères proposés par le Quiz Amour", () => {
  it("valide la liste et ignore ce qui est douteux ou en double", () => {
    const prefill = parseLovePrefill(payload);
    expect(prefill?.profil).toBe("Miroir Paisible");
    expect(prefill?.proposals.map((p) => p.id)).toEqual([
      "besoin-profondeur",
      "nourrit-rire",
      "nourrit-desir",
      "valeur-fidelite",
      "valeur-respect",
      "vide-justifier",
    ]);
    const avoid = prefill!.proposals.find((p) => p.id === "vide-justifier")!;
    expect(avoid.direction).toBe("AWAY_FROM");
    expect(prefill!.proposals.find((p) => p.id === "valeur-fidelite")!.nonNegotiable).toBe(true);
  });

  it("garde la compatibilité avec l'ancienne charge v = 2", () => {
    const old = parseLovePrefill({ v: 2, notes: { besoins: "x" } });
    expect(old?.proposals).toEqual([]);
    expect(old?.notes.besoins).toBe("x");
  });

  it("ne crée que les critères cochés, jamais ceux du modèle (attirance, sexualité, respect)", () => {
    const prefill = parseLovePrefill(payload);
    const base = applyLovePrefill(prefill).map((c) => c.label);
    const all = prefill!.proposals.map((p) => p.id);
    const created = proposalsToCreate(prefill, all, base);
    expect(created.map((c) => c.label)).toEqual([
      "Mon besoin de profondeur est nourri (Cœur Profond)",
      "Ce qui me nourrit : rire ensemble",
      "Nous partageons la fidélité",
      "À éviter : devoir me justifier de tout",
    ]);
    expect(created.every((c) => c.description.startsWith(QUIZ_MARK))).toBe(true);
    const labels = [...base, ...created.map((c) => c.label)].map(normalizeLabel);
    expect(new Set(labels).size).toBe(labels.length);
    expect(LOVE_TEMPLATE.criteria.filter((c) => c.key === "attirance" || c.key === "sexualite")).toHaveLength(2);
    expect(proposalsToCreate(prefill, ["nourrit-rire"], base)).toHaveLength(1);
    expect(proposalsToCreate(prefill, "pas une liste", base)).toEqual([]);
  });

  it("quiz refait : n'ajoute que les nouveaux critères, sans rien écraser", () => {
    const prefill = parseLovePrefill(payload);
    const existing = ["Ce qui me nourrit : rire ensemble", "Nous partageons la FIDÉLITÉ"];
    const created = proposalsToCreate(prefill, prefill!.proposals.map((p) => p.id), existing);
    expect(created.map((c) => c.label)).toEqual([
      "Mon besoin de profondeur est nourri (Cœur Profond)",
      "À éviter : devoir me justifier de tout",
    ]);
    expect(proposalStatus(prefill!.proposals[1], existing)).toBe("present");
    expect(proposalStatus(prefill!.proposals[2], existing)).toBe("modele");
  });

  it("retrouve le profil pour l'encart", () => {
    const prefill = parseLovePrefill(payload);
    const created = proposalsToCreate(prefill, ["nourrit-rire"], []);
    expect(quizProfilFrom(["Autre chose", created[0].description])).toBe("Miroir Paisible");
    expect(quizProfilFrom(["profil « faux » sans repère"])).toBeNull();
  });
});

describe("une seule Boussole Relation", () => {
  const profile = (id: string, description: string) => ({ id, description }) as Profile;
  const version = (id: string, profileId: string, status = "brouillon") => ({ id, profileId, status }) as Version;
  it("reprend la Boussole Relation la plus récente au lieu d'en créer une autre", () => {
    const profiles = [profile("pro", "Mon métier"), profile("amour", LOVE_TEMPLATE.profileDescription)];
    expect(boussoleRelationExistante(profiles, [version("v1", "pro"), version("v2", "amour")])?.id).toBe("v2");
    expect(boussoleRelationExistante([profile("pro", "Mon métier")], [version("v1", "pro")])).toBeNull();
  });
});
