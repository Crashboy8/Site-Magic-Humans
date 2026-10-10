import { describe, expect, it } from "vitest";
import type { PlanEdite } from "@/domain/maCible/planEdite";
import { planAGarder } from "./planCompte";

const plan = (maj: string, resultatLe: string | null = "R1"): PlanEdite => ({ v: 1, maj, resultatLe, blocs: [] });

describe("planAGarder", () => {
  it("garde le plus récent des deux pour le même résultat", () => {
    const vieux = plan("2026-10-10T10:00:00Z");
    const neuf = plan("2026-10-10T11:00:00Z");
    expect(planAGarder(vieux, neuf, "R1")).toBe(neuf);
    expect(planAGarder(neuf, vieux, "R1")).toBe(neuf);
  });
  it("prend le plan du compte quand le navigateur n'en a pas", () => {
    const c = plan("2026-10-10T10:00:00Z");
    expect(planAGarder(null, c, "R1")).toBe(c);
  });
  it("n'applique jamais le plan du compte à un autre résultat", () => {
    const local = plan("2026-10-10T10:00:00Z");
    expect(planAGarder(local, plan("2026-10-11T10:00:00Z", "R0"), "R1")).toBe(local);
    expect(planAGarder(null, plan("2026-10-11T10:00:00Z", "R0"), "R1")).toBeNull();
  });
});
