/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { contenuParcours } from "@/domain/parcours/contenu";
import { PROFIL_VIDE, type Profil } from "@/domain/parcours/profil";
import { resumeParcours } from "@/domain/parcours/resume";
import type { Reponse } from "@/domain/parcours/types";
import type { EnvoiJeu } from "@/domain/progression";
import { progressionDuCompte, recevoirDuJeu, suivreParcours } from "./serveur";

const MOI = "00000000-0000-0000-0000-0000000000e1";
const MAINTENANT = new Date("2026-10-10T10:00:00Z");
const data = contenuParcours("fr");
const rep = (etapes: string[], r: Reponse = "oui") => Object.fromEntries(etapes.flatMap((id) => data.etapes[id].criteres.map((c) => [c.id, r])));
const POSITION: Profil = { ...PROFIL_VIDE, voie: "A", argent: 5, parallele: false, reponses: rep(["connaitre", "nommer"]) };
const POINTS = resumeParcours(data, POSITION).points;
const envoi = (e: Partial<EnvoiJeu> = {}): EnvoiJeu => ({ ajout: 0, badges: [], serieJours: 0, maj: null, repartir: false, ...e });

/**
 * Doublure du client Supabase : deux tables d'une ligne au plus, et la liste des écritures. L'écriture conditionnelle
 * (update … eq) ne passe que si la ligne n'a pas bougé. avantEcriture simule un autre onglet qui écrit entre-temps.
 */
function base(
  tables: { progression?: Record<string, unknown> | null | "absente"; parcours_positions?: Record<string, unknown> | null | "absente" },
  avantEcriture?: (t: typeof tables) => void,
) {
  const ecritures: Record<string, unknown>[] = [];
  let lectures = 0;
  const db = {
    from(table: string) {
      const filtres: [string, unknown][] = [];
      let maj: Record<string, unknown> | null = null;
      const t = () => (tables as any)[table];
      const q: any = {
        select: () => q,
        eq: (c: string, v: unknown) => (filtres.push([c, v]), q),
        maybeSingle: async () => {
          if (t() === "absente") return { data: null, error: { code: "PGRST205", message: `relation ${table} does not exist` } };
          if (table === "progression") lectures += 1;
          return { data: t() ? { ...t() } : null, error: null };
        },
        insert: async (ligne: Record<string, unknown>) => {
          if (t() === "absente") return { error: { code: "PGRST205" } };
          avantEcriture?.(tables);
          if (t()) return { error: { code: "23505", message: "duplicate key" } };
          (tables as any)[table] = { ...ligne };
          ecritures.push(ligne);
          return { error: null };
        },
        update: (ligne: Record<string, unknown>) => ((maj = ligne), q),
        then: (ok: (r: unknown) => void) => {
          // update(…).eq(…).select() : on écrit seulement si chaque filtre correspond encore à la ligne.
          avantEcriture?.(tables);
          const actuelle = t();
          const correspond = actuelle && filtres.every(([c, v]) => c === "user_id" || actuelle[c] === v);
          if (correspond && maj) {
            (tables as any)[table] = { ...actuelle, ...maj };
            ecritures.push(maj);
          }
          ok({ data: correspond ? [{ user_id: MOI }] : [], error: null });
        },
      };
      return q;
    },
  };
  return { db: db as any, ecritures, lectures: () => lectures };
}

const lignePosition = { voie: "A", argent: 5, parallele: false, raccourci: false, freelance: false, reponses: POSITION.reponses, updated_at: "2026-10-09T10:00:00Z" };

describe("progression du compte, côté serveur", () => {
  it("sans ligne, le bloc montre déjà les points de « Où j'en suis ? », sans rien écrire", async () => {
    const { db, ecritures } = base({ progression: null, parcours_positions: lignePosition });
    const vue = await progressionDuCompte(db, MOI, MAINTENANT);
    expect(POINTS).toBeGreaterThan(0);
    expect(vue).toMatchObject({ xp: POINTS, serieJours: 0 });
    expect(ecritures).toEqual([]);
  });

  it("première connexion : les points du navigateur s'ajoutent à ceux de « Où j'en suis ? »", async () => {
    const { db, ecritures } = base({ progression: null, parcours_positions: lignePosition });
    const vue = await recevoirDuJeu(db, MOI, envoi({ ajout: 30, badges: ["premier-pas"], serieJours: 2, maj: "2026-10-09T18:00:00.000Z" }), MAINTENANT);
    expect(vue).toMatchObject({ xp: POINTS + 30, serieJours: 2 });
    expect(ecritures).toEqual([
      expect.objectContaining({ user_id: MOI, xp: POINTS + 30, serie_jours: 2, mis_a_jour: "2026-10-09T18:00:00.000Z" }),
    ]);
  });

  it("rien de neuf : aucune écriture", async () => {
    const ligne = { xp: 80, niveau: "2", badges: ["premier-pas", "en-mouvement"], serie_jours: 1, mis_a_jour: "2026-10-10T08:00:00.000Z" };
    const { db, ecritures } = base({ progression: ligne, parcours_positions: null });
    expect(await recevoirDuJeu(db, MOI, envoi({ maj: "2026-10-10T07:00:00.000Z" }), MAINTENANT)).toMatchObject({ xp: 80 });
    expect(ecritures).toEqual([]);
  });

  it("table pas encore créée : rien ne casse, le jeu reste sur le navigateur", async () => {
    const { db, ecritures } = base({ progression: "absente" });
    expect(await recevoirDuJeu(db, MOI, envoi({ ajout: 10 }), MAINTENANT)).toBe("absente");
    expect(await progressionDuCompte(db, MOI, MAINTENANT)).toBe("absente");
    expect(ecritures).toEqual([]);
  });

  it("« Où j'en suis ? » enregistré : l'XP suit l'écart de points et la série compte ce jour", async () => {
    const ligne = { xp: 100, niveau: null, badges: ["premier-pas", "en-mouvement"], serie_jours: 2, mis_a_jour: "2026-10-09T18:00:00.000Z" };
    const { db, ecritures } = base({ progression: ligne });
    await suivreParcours(db, MOI, data, PROFIL_VIDE, POSITION, MAINTENANT, true);
    expect(ecritures).toEqual([expect.objectContaining({ xp: 100 + POINTS, serie_jours: 3, mis_a_jour: MAINTENANT.toISOString() })]);
  });

  it("un autre onglet écrit pendant le calcul : on relit, et les points s'additionnent", async () => {
    const ligne = { xp: 100, niveau: null, badges: ["premier-pas", "en-mouvement"], serie_jours: 2, mis_a_jour: "2026-10-10T08:00:00.000Z" };
    let fois = 0;
    const tables = { progression: ligne as Record<string, unknown>, parcours_positions: null };
    const { db, lectures } = base(tables, (t) => {
      // La première fois seulement : « Où j'en suis ? » ajoute 6 points juste avant notre écriture.
      if (fois++ === 0) t.progression = { ...ligne, xp: 106, mis_a_jour: "2026-10-10T09:59:00.000Z" };
    });
    const vue = await recevoirDuJeu(db, MOI, envoi({ ajout: 20, maj: "2026-10-10T09:00:00.000Z" }), MAINTENANT);
    expect(vue).toMatchObject({ xp: 126 });
    expect((tables.progression as any).xp).toBe(126);
    expect(lectures()).toBe(2);
  });

  it("la ligne est créée ailleurs entre la lecture et l'écriture : on recommence avec elle", async () => {
    const tables: { progression: Record<string, unknown> | null; parcours_positions: null } = { progression: null, parcours_positions: null };
    let fois = 0;
    const { db } = base(tables, (t) => {
      if (fois++ === 0) t.progression = { xp: 40, niveau: null, badges: ["premier-pas"], serie_jours: 1, mis_a_jour: "2026-10-10T09:30:00.000Z" };
    });
    await suivreParcours(db, MOI, data, PROFIL_VIDE, POSITION, MAINTENANT, true);
    expect((tables.progression as any).xp).toBe(40 + POINTS);
  });

  it("une panne ne remonte jamais jusqu'à « Où j'en suis ? »", async () => {
    const { db } = base({ progression: "absente" });
    await expect(suivreParcours(db, MOI, data, null, POSITION, MAINTENANT, true)).resolves.toBeUndefined();
    const panne = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => Promise.reject(new Error("réseau")) }) }) }) } as any;
    await expect(suivreParcours(panne, MOI, data, null, POSITION, MAINTENANT, true)).resolves.toBeUndefined();
  });
});
