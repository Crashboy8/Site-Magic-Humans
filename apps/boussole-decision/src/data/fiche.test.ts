import { describe, expect, it } from "vitest";
import { tableAbsente } from "./fiche";

describe("tableAbsente", () => {
  it("reconnaît une migration pas encore passée", () => {
    expect(tableAbsente({ code: "42P01" })).toBe(true);
    expect(tableAbsente({ code: "PGRST205" })).toBe(true);
    expect(tableAbsente({ message: "Could not find the table 'public.talent_fiches' in the schema cache" })).toBe(true);
  });
  it("laisse passer les autres erreurs", () => {
    expect(tableAbsente(null)).toBe(false);
    expect(tableAbsente({ code: "42501", message: "permission denied for table talent_fiches" })).toBe(false);
  });
});
