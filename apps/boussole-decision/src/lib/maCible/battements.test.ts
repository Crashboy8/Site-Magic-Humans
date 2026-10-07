import { describe, expect, it } from "vitest";
import { lireJsonReponse } from "@/features/maCible/api";
import { reponseAvecBattements } from "./battements";

describe("battements", () => {
  it("envoie des octets avant le JSON, que le client sait relire", async () => {
    const attente = new Promise<Response>((resoudre) => {
      setTimeout(() => resoudre(Response.json({ ok: true, etape: "cadrage", cadrage: { statut: "esquisse" } })), 40);
    });
    const reponse = reponseAvecBattements(attente, 5);
    const texte = await reponse.text();
    expect(texte.startsWith("\n")).toBe(true);
    expect(texte.trim().length).toBeGreaterThan(0);
    expect(lireJsonReponse(texte)).toMatchObject({ ok: true, etape: "cadrage" });
  });
});
