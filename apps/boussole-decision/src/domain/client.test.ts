import { describe, expect, it } from "vitest";
import { suiteSure } from "@/lib/config";
import { client } from "@/i18n/messages/client";
import { sansInsecables } from "@/i18n/typo";
import { CODE_CLIENT_RE, LIEN_FICHE_RE, codeClient, lienClient, messageClient, pageApresActivation, pageLienEchoue, prenomPropre, statutActivation, suiteActivation } from "./client";
import { generateInvitationCode } from "./versions";

describe("accès client : le code", () => {
  it("met le code en majuscules sans espaces, et refuse ce qui n'en est pas un", () => {
    expect(codeClient("  mh-camille ")).toBe("MH-CAMILLE");
    expect(codeClient("mh k7qf 2mzd")).toBe("MHK7QF2MZD");
    expect(codeClient("abc")).toBe("");
    expect(codeClient("MH_CAMILLE")).toBe("");
    expect(codeClient("<script>")).toBe("");
    expect(codeClient(undefined)).toBe("");
    expect(codeClient(["MH-CAMILLE"])).toBe("");
  });

  it("les codes créés pour les clients commencent par MH et respectent la règle de la base", () => {
    const code = generateInvitationCode(Math.random, "MH");
    expect(code).toMatch(/^MH-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(CODE_CLIENT_RE.test(code)).toBe(true);
    expect(generateInvitationCode()).toMatch(/^BOUSSOLE-/);
  });
});

describe("accès client : prénom et page d'arrivée", () => {
  it("nettoie le prénom", () => {
    expect(prenomPropre("  Anne-Sophie  ")).toBe("Anne-Sophie");
    expect(prenomPropre("Zoé <b>")).toBe("Zoé b");
    expect(prenomPropre("D'Artagnan")).toBe("D'Artagnan");
    expect(prenomPropre("x".repeat(80))).toHaveLength(40);
    expect(prenomPropre(42)).toBe("");
  });

  it("le lien reçu par mail mène à /mon-espace/activer/, accepté comme suite de connexion", () => {
    const suite = suiteActivation("MH-K7QF-2MZD", "Zoé");
    expect(suite).toBe("/mon-espace/activer/?code=MH-K7QF-2MZD&prenom=Zo%C3%A9");
    expect(suiteSure(suite)).toBe(suite);
    const longue = suiteActivation("M".repeat(40), "é".repeat(40));
    expect(suiteSure(longue)).toBe(`/mon-espace/activer/?code=${"M".repeat(40)}`);
    expect(suiteActivation("", "")).toBe("/mon-espace/activer/");
  });

  it("après l'activation : l'import de la fiche, sauf si elle est déjà là", () => {
    expect(pageApresActivation("ok", true, "absente")).toBe("/mon-espace/importer/?accueil=client");
    expect(pageApresActivation("deja", true, "absente")).toBe("/mon-espace/importer/?accueil=client");
    expect(pageApresActivation("ok", true, "presente")).toBe("/mon-espace/?client=bienvenue");
    expect(pageApresActivation("ok", true, "indisponible")).toBe("/mon-espace/?client=bienvenue");
    expect(pageApresActivation("invalide", false, "absente")).toBe("/mon-espace/?client=code");
    expect(pageApresActivation("invalide", true, "absente")).toBe("/mon-espace/importer/?accueil=client");
  });

  it("lien refusé : retour sur la page du code pour l'accès client, sinon la connexion", () => {
    expect(pageLienEchoue(suiteActivation("MH-CAMILLE", "Camille"))).toBe("/client/?lien=expire&code=MH-CAMILLE");
    expect(pageLienEchoue("/mon-espace/activer/")).toBe("/client/?lien=expire");
    expect(pageLienEchoue("/mon-espace/")).toBe("/connexion/?erreur=lien");
    expect(pageLienEchoue("/mon-espace/activer/?code=%3Cscript%3E")).toBe("/client/?lien=expire");
  });

  it("lit la réponse de la base, et traite une fonction absente comme « indisponible »", () => {
    expect(statutActivation("ok", false)).toBe("ok");
    expect(statutActivation("deja", false)).toBe("deja");
    expect(statutActivation("invalide", false)).toBe("invalide");
    expect(statutActivation(null, true)).toBe("indisponible");
    expect(statutActivation("bizarre", false)).toBe("indisponible");
  });
});

describe("accès client : lien et message pour Pierre", () => {
  it("en production, le lien court magichumans.com/client/CODE", () => {
    expect(lienClient("MH-CAMILLE", "https://www.magichumans.com")).toBe("https://www.magichumans.com/client/MH-CAMILLE/");
    expect(lienClient("MH-CAMILLE", "https://magichumans.com/")).toBe("https://www.magichumans.com/client/MH-CAMILLE/");
  });

  it("ailleurs, l'adresse complète de la page", () => {
    expect(lienClient("MH-CAMILLE", "https://preview.vercel.app")).toBe("https://preview.vercel.app/boussole-decision/client/?code=MH-CAMILLE");
    expect(lienClient("MH-CAMILLE", undefined)).toBe("http://localhost:3000/boussole-decision/client/?code=MH-CAMILLE");
  });

  it("le message contient le prénom, le lien et le code, sans tiret long", () => {
    const m = sansInsecables(messageClient(client.fr.message, "Camille", "https://www.magichumans.com/client/MH-CAMILLE/", "MH-CAMILLE"));
    expect(m.startsWith("Bonjour Camille,\n\n")).toBe(true);
    expect(m).toContain("1. Clique sur ce lien : https://www.magichumans.com/client/MH-CAMILLE/");
    expect(m).toContain("Ton code, si on te le demande : MH-CAMILLE");
    expect(m).not.toMatch(/[\u2013\u2014\u00a0\u202f]/);
    expect(m).not.toMatch(/gratuit/i);
    expect(sansInsecables(messageClient(client.fr.message, "", "x", "y")).startsWith("Bonjour,\n")).toBe(true);
    expect(sansInsecables(messageClient(client.en.message, "Sam", "x", "y")).startsWith("Hi Sam,\n")).toBe(true);
  });

  it("n'accepte que des liens de page Notion pour la fiche", () => {
    expect(LIEN_FICHE_RE.test("https://camille.notion.site/Talent-Unique-123")).toBe(true);
    expect(LIEN_FICHE_RE.test("https://www.notion.so/Talent-123")).toBe(true);
    expect(LIEN_FICHE_RE.test("http://camille.notion.site/x")).toBe(false);
    expect(LIEN_FICHE_RE.test("https://notion.site.evil.com/x")).toBe(false);
    expect(LIEN_FICHE_RE.test("https://exemple.fr/notion.so/")).toBe(false);
  });
});
