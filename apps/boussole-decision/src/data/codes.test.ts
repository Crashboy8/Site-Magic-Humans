/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import { createInvitationCode } from "./repository";

/** Base où seules certaines colonnes existent : une colonne inconnue répond comme PostgREST (PGRST204). */
function base(colonnes: string[]) {
  const inserts: Record<string, unknown>[] = [];
  const db = {
    from: () => ({
      insert: async (ligne: Record<string, unknown>) => {
        const inconnue = Object.keys(ligne).find((c) => !colonnes.includes(c));
        if (inconnue) return { error: { code: "PGRST204", message: `Could not find the '${inconnue}' column of 'invitation_codes' in the schema cache` } };
        if (ligne.code === "PRIS-0001") return { error: { code: "23505", message: "duplicate key" } };
        inserts.push(ligne);
        return { error: null };
      },
    }),
  };
  return { db: db as any, inserts };
}

const BASE = ["code", "coach_id", "label", "max_uses", "expires_at"];
const CODE = { code: "MH-EMMA-01", coachId: "c0", label: "Emma", maxUses: 1, expiresAt: null };

describe("création d'un code client", () => {
  it("garde le niveau, la fin de l'accès et le lien de fiche quand la base les connaît", async () => {
    const { db, inserts } = base([...BASE, "lien_fiche", "niveau", "acces_jusqu_au"]);
    const r = await createInvitationCode(db, { ...CODE, lienFiche: "https://emma.notion.site/x", niveau: "vip12", accesJusquAu: "2027-10-10T10:00:00.000Z" });
    expect(r).toEqual({ resultat: "ok", sans: [] });
    expect(inserts[0]).toMatchObject({ niveau: "vip12", acces_jusqu_au: "2027-10-10T10:00:00.000Z", lien_fiche: "https://emma.notion.site/x" });
  });

  it("un pionnier à vie s'enregistre avec une fin d'accès vide", async () => {
    const { db, inserts } = base([...BASE, "niveau", "acces_jusqu_au"]);
    await createInvitationCode(db, { ...CODE, niveau: "pionnier", accesJusquAu: null });
    expect(inserts[0]).toMatchObject({ niveau: "pionnier", acces_jusqu_au: null });
  });

  it("sans le SQL des accès VIP : le code est créé avec son lien, sans niveau", async () => {
    const { db, inserts } = base([...BASE, "lien_fiche"]);
    const r = await createInvitationCode(db, { ...CODE, lienFiche: "https://emma.notion.site/x", niveau: "membre", accesJusquAu: null });
    expect(r).toEqual({ resultat: "ok", sans: ["niveau", "acces_jusqu_au"] });
    expect(inserts[0]).toEqual({ code: "MH-EMMA-01", coach_id: "c0", label: "Emma", max_uses: 1, expires_at: null, lien_fiche: "https://emma.notion.site/x" });
  });

  it("sans aucun SQL récent : le code est créé tout simple", async () => {
    const { db, inserts } = base(BASE);
    const r = await createInvitationCode(db, { ...CODE, lienFiche: "https://emma.notion.site/x", niveau: "vip12", accesJusquAu: null });
    expect(r.resultat).toBe("ok");
    expect([...r.sans].sort()).toEqual(["acces_jusqu_au", "lien_fiche", "niveau"]);
    expect(Object.keys(inserts[0])).toEqual(BASE);
  });

  it("un code ordinaire n'envoie ni niveau ni durée, et un code déjà pris est signalé", async () => {
    const { db, inserts } = base(BASE);
    expect(await createInvitationCode(db, CODE)).toEqual({ resultat: "ok", sans: [] });
    expect(Object.keys(inserts[0])).toEqual(BASE);
    expect((await createInvitationCode(db, { ...CODE, code: "PRIS-0001" })).resultat).toBe("existe");
  });
});
