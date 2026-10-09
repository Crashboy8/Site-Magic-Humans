import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { contenuParcours } from "@/domain/parcours/contenu";
import type { Profil } from "@/domain/parcours/profil";
import { enregistrerPosition, lirePosition } from "./parcours";

const data = contenuParcours("fr");
const profil: Profil = { voie: "E", argent: 3, parallele: false, raccourci: false, freelance: true, reponses: { "connaitre.quiz": "oui" } };
const ABSENTE = { code: "42703", message: 'column parcours_positions.freelance does not exist' };

/** Un faux client : la colonne freelance existe ou non, et on note chaque appel. */
function faux({ colonne, ligne }: { colonne: boolean; ligne?: Record<string, unknown> | null }) {
  const appels: { action: "select" | "upsert"; contenu: unknown }[] = [];
  const db = {
    from: () => ({
      select: (colonnes: string) => {
        appels.push({ action: "select", contenu: colonnes });
        const manque = !colonne && colonnes.includes("freelance");
        return { eq: () => ({ maybeSingle: async () => (manque ? { data: null, error: ABSENTE } : { data: ligne ?? null, error: null }) }) };
      },
      upsert: async (valeurs: Record<string, unknown>) => {
        appels.push({ action: "upsert", contenu: valeurs });
        return { error: !colonne && "freelance" in valeurs ? ABSENTE : null };
      },
    }),
  } as unknown as SupabaseClient;
  return { db, appels };
}

describe("position gardée dans le compte : la colonne freelance", () => {
  it("la lit et l'écrit quand la migration est passée", async () => {
    const { db, appels } = faux({ colonne: true, ligne: { voie: "E", argent: 3, parallele: false, raccourci: false, freelance: true, reponses: {}, updated_at: "2026-10-09T10:00:00Z" } });
    const lu = await lirePosition(db, "u1", data);
    expect(lu).toMatchObject({ absente: false, profil: { voie: "E", freelance: true } });
    expect(await enregistrerPosition(db, "u1", profil)).toBe("ok");
    expect(appels.filter((a) => a.action === "upsert")).toHaveLength(1);
    expect((appels.find((a) => a.action === "upsert")!.contenu as Record<string, unknown>).freelance).toBe(true);
  });

  it("sans la colonne, lit et écrit comme avant, sans erreur", async () => {
    const { db, appels } = faux({ colonne: false, ligne: { voie: "E", argent: 3, parallele: false, raccourci: false, reponses: {}, updated_at: "2026-10-09T10:00:00Z" } });
    const lu = await lirePosition(db, "u1", data);
    expect(lu).toMatchObject({ absente: false, profil: { voie: "E", freelance: false } });
    expect(await enregistrerPosition(db, "u1", profil)).toBe("ok");
    const envois = appels.filter((a) => a.action === "upsert").map((a) => a.contenu as Record<string, unknown>);
    expect(envois).toHaveLength(2);
    expect("freelance" in envois[1]).toBe(false);
    expect(envois[1].voie).toBe("E");
  });
});
