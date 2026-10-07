import { describe, expect, it } from "vitest";
import { emailAutorise, emailsIllimites, sessionValide } from "./acces";

describe("accès hors quota", () => {
  it("reconnaît un UUID de session et refuse le reste", () => {
    expect(sessionValide("11111111-1111-4111-8111-111111111111")).toBe("11111111-1111-4111-8111-111111111111");
    expect(sessionValide(" 22222222-2222-4222-A222-222222222222 ")).toBe("22222222-2222-4222-a222-222222222222");
    expect(sessionValide("pas-une-session")).toBeNull();
    expect(sessionValide("")).toBeNull();
  });
  it("compare les emails sans tenir compte de la casse", () => {
    expect(emailsIllimites(" Pierre@Example.com, autre@exemple.fr ")).toEqual(["pierre@example.com", "autre@exemple.fr"]);
    expect(emailAutorise("Pierre@Example.com", "pierre@example.com")).toBe(true);
    expect(emailAutorise("pierre@example.com", "quelquun@exemple.fr")).toBe(false);
    expect(emailAutorise("", "pierre@example.com")).toBe(false);
    expect(emailAutorise("pierre@example.com", null)).toBe(false);
  });
});
