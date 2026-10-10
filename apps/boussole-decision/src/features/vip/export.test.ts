/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { exporterMesDonnees, nomFichierExport, PAGE_EXPORT } from "./export";

const MOI = "00000000-0000-0000-0000-0000000000e1";
const AUTRE = "00000000-0000-0000-0000-0000000000b2";

/** Doublure minimale du client Supabase : filtres eq, pages range, tables absentes en erreur. */
function base(tables: Record<string, Record<string, unknown>[] | "absente">, rpc: Record<string, unknown> = {}) {
  const lectures: string[] = [];
  const db = {
    from(table: string) {
      const filtres: [string, unknown][] = [];
      const lignes = () => {
        const t = tables[table];
        if (t === undefined || t === "absente") return null;
        return t.filter((l) => filtres.every(([c, v]) => l[c] === v));
      };
      const constructeur: any = {
        select: () => constructeur,
        eq: (c: string, v: unknown) => (filtres.push([c, v]), constructeur),
        order: () => constructeur,
        range: async (a: number, b: number) => {
          lectures.push(`${table}:${a}`);
          const l = lignes();
          return l ? { data: l.slice(a, b + 1), error: null } : { data: null, error: { code: "PGRST205", message: "absente" } };
        },
        maybeSingle: async () => {
          const l = lignes();
          return l ? { data: l[0] ?? null, error: null } : { data: null, error: { code: "PGRST205" } };
        },
      };
      return constructeur;
    },
    rpc: async (nom: string) => (nom in rpc ? { data: rpc[nom], error: null } : { data: null, error: { code: "PGRST202" } }),
  };
  return { db: db as any, lectures };
}

describe("export « Tes données »", () => {
  it("rassemble le compte et chaque table, seulement pour la personne", async () => {
    const { db } = base(
      {
        app_users: [{ id: MOI, email: "emma@test.fr", first_name: "Emma", consentement_fiche_at: "2026-10-10T09:00:00Z" }],
        talent_fiches: [{ user_id: MOI, fiche: { v: 1, prenom: "Emma" }, source: "coach" }],
        profiles: [
          { id: "p1", user_id: MOI, name: "Reconversion" },
          { id: "p2", user_id: AUTRE, name: "Pas à moi" },
        ],
        versions: [],
        categories: [],
        criteria: [],
        opportunities: [],
        evaluations: [],
        comments: [{ id: "c1", owner_id: MOI, body: "Bravo" }],
        parcours_positions: [],
        progression: [
          { user_id: MOI, xp: 54, niveau: "2", badges: ["premier-pas", "en-mouvement"], serie_jours: 3, mis_a_jour: "2026-10-10T09:00:00Z" },
          { user_id: AUTRE, xp: 999, niveau: "7", badges: [], serie_jours: 0, mis_a_jour: "2026-10-10T09:00:00Z" },
        ],
        demandes_groupe_m3: [{ user_id: MOI, created_at: "2026-10-10T10:00:00Z" }],
        evenements_intention: [
          { id: "i1", user_id: MOI, outil: "cibleur", etape: "resultat", question: "Ma cible est-elle trop large ?", mail: null, accord_reponse_mail: true },
          { id: "i2", user_id: AUTRE, outil: "jeu", etape: "accueil", question: "Pas à moi", mail: null, accord_reponse_mail: false },
        ],
      },
      { mon_acces_client: [{ code: "MH-EMMA-01", coach_prenom: "Pierre", lien_fiche: null }], mon_niveau_acces: [{ niveau: "vip12", acces_jusqu_au: null }] },
    );
    const contenu = await exporterMesDonnees(db, MOI, new Date("2026-10-10T12:00:00Z"));
    expect(contenu.exporteLe).toBe("2026-10-10T12:00:00.000Z");
    expect((contenu.compte as any).email).toBe("emma@test.fr");
    expect((contenu.accesClient as any).code).toBe("MH-EMMA-01");
    expect((contenu.niveauAcces as any).niveau).toBe("vip12");
    expect((contenu.ficheTalent as any).source).toBe("coach");
    expect(contenu.profils).toEqual([{ id: "p1", user_id: MOI, name: "Reconversion" }]);
    expect(contenu.commentairesRecus).toHaveLength(1);
    expect(contenu.parcours).toBeNull();
    expect(contenu.progression).toEqual({ user_id: MOI, xp: 54, niveau: "2", badges: ["premier-pas", "en-mouvement"], serie_jours: 3, mis_a_jour: "2026-10-10T09:00:00Z" });
    expect((contenu.demandeGroupeM3 as any).created_at).toBe("2026-10-10T10:00:00Z");
    expect(contenu.demandesAvis).toEqual([
      { id: "i1", user_id: MOI, outil: "cibleur", etape: "resultat", question: "Ma cible est-elle trop large ?", mail: null, accord_reponse_mail: true },
    ]);
  });

  it("une table absente donne null sans faire échouer l'export", async () => {
    const { db } = base({ app_users: [{ id: MOI }], profiles: [], demandes_groupe_m3: "absente" });
    const contenu = await exporterMesDonnees(db, MOI, new Date("2026-10-10T12:00:00Z"));
    expect(contenu.demandeGroupeM3).toBeNull();
    expect(contenu.ficheTalent).toBeNull();
    expect(contenu.progression).toBeNull();
    expect(contenu.profils).toEqual([]);
    expect(contenu.niveauAcces).toBeNull();
  });

  it("lit page par page, sans rien perdre au-delà d'une page", async () => {
    const evaluations = Array.from({ length: PAGE_EXPORT + 3 }, (_, i) => ({ user_id: MOI, criterion_id: `c${i}`, opportunity_id: "o1" }));
    const { db, lectures } = base({ app_users: [{ id: MOI }], evaluations });
    const contenu = await exporterMesDonnees(db, MOI, new Date());
    expect(contenu.evaluations).toHaveLength(PAGE_EXPORT + 3);
    expect(lectures.filter((l) => l.startsWith("evaluations:"))).toEqual(["evaluations:0", `evaluations:${PAGE_EXPORT}`]);
  });

  it("nomme le fichier avec la date du jour", () => {
    expect(nomFichierExport(new Date("2026-10-10T12:00:00Z"))).toBe("magic-humans-mes-donnees-2026-10-10.json");
  });
});
