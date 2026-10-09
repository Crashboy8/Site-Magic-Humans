import { describe, expect, it } from "vitest";
import { lireLienNotion } from "./url";

const ID = "0f1c2a3b4d5e4f608a7192b3c4d5e6f7";
const ATTENDU = "0f1c2a3b-4d5e-4f60-8a71-92b3c4d5e6f7";

describe("lireLienNotion", () => {
  it.each([
    `https://camille-exemple.notion.site/Talent-Camille-${ID}?pvs=4`,
    `https://notion.so/${ID}`,
    `https://www.notion.so/Talent-${ID}`,
    `https://notion.site/${ID}`,
    `https://notion.com/${ID}`,
    `https://www.notion.com/x/${ID}`,
    `https://app.notion.com/p/${ID}`,
    `https://www.notion.so/base-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?v=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb&p=${ID}`,
    `https://www.notion.so/Talent-0f1c2a3b-4d5e-4f60-8a71-92b3c4d5e6f7`,
    `  https://www.notion.so/${ID}  `,
  ])("accepte %s", (lien) => {
    expect(lireLienNotion(lien)).toEqual({ ok: true, pageId: ATTENDU });
  });

  it.each([
    [`http://www.notion.so/${ID}`, "pas_notion"],
    [`https://www.notion.so:8443/${ID}`, "pas_notion"],
    [`https://user:mdp@www.notion.so/${ID}`, "pas_notion"],
    [`https://notion.site.exemple.com/${ID}`, "pas_notion"],
    [`https://exemple.com/?u=notion.so/${ID}`, "pas_notion"],
    [`https://a.b.notion.site/${ID}`, "pas_notion"],
    [`https://localhost/${ID}`, "pas_notion"],
    [`https://169.254.169.254/${ID}`, "pas_notion"],
    [`file:///etc/${ID}`, "pas_notion"],
    [`javascript:alert(1)//${ID}`, "pas_notion"],
    ["https://www.notion.so/Talent-sans-id", "lien_invalide"],
    ["pas un lien", "lien_invalide"],
    [`https://www.notion.so/${ID}?x=${"a".repeat(2049)}`, "lien_invalide"],
  ])("refuse %s", (lien, code) => {
    expect(lireLienNotion(lien)).toEqual({ ok: false, code });
  });
});
