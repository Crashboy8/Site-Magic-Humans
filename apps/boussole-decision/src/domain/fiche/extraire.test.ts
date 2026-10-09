import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bornerFiche, ficheVide, validerFiche } from "./bornes";
import { completerFiche } from "./completer";
import { ficheDepuisQuiz, lireFiche } from "./extraire";
import { htmlVersMarkdown } from "./html";
import { cle, versLignes } from "./lignes";
import type { FicheTalent } from "./types";

const dir = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__");
const lire = (nom: string) => {
  const brut = readFileSync(join(dir, nom), "utf8");
  return lireFiche(nom.endsWith(".html") ? htmlVersMarkdown(brut) : brut);
};
const plat = (f: FicheTalent) => JSON.stringify(f);

describe("jeux d'essai du cahier (D.4)", () => {
  it("modele 2026 : Camille, L'Architecte des Liens", () => {
    const { fiche: f, rapport } = lire("fiche-modele-2026.md");
    expect(f.titre).toBe("L'Architecte des Liens");
    expect(f.prenom).toBe("Camille");
    expect(f.mecanisme.startsWith("Relier des personnes")).toBe(true);
    expect(f.contexte).toBeTruthy();
    expect(f.benefice).toBeTruthy();
    expect(f.reussite).toHaveLength(3);
    expect(f.echec).toHaveLength(3);
    expect(f.qualites.length).toBeGreaterThanOrEqual(3);
    expect(f.defauts.length).toBeGreaterThanOrEqual(3);
    expect(f.valeurs).toEqual(["Liberté", "Lien", "Créativité", "Justice", "Joie"]);
    expect(f.antiValeurs.length).toBeGreaterThanOrEqual(3);
    expect(f.enneagramme.base).toBe("Type 2");
    expect(f.aimeQuand).toHaveLength(3);
    expect(f.metiersParfaits).toHaveLength(3);
    expect(f.avatars).toHaveLength(3);
    expect(f.offres).toHaveLength(3);
    expect(f.etapes).toHaveLength(5);
    expect(plat(f)).not.toContain("http");
    expect(plat(f)).not.toContain("Martinot");
    expect(plat(f)).not.toContain("septembre");
    expect(rapport.methode).toBe("modele");
  });

  it("ancien découpage : Karim, Le Bâtisseur Patient", () => {
    const { fiche: f, rapport } = lire("fiche-ancien-decoupage.md");
    expect(f.titre).toBe("Le Bâtisseur Patient");
    expect(f.prenom).toBe("Karim");
    expect(f.mecanisme).toBeTruthy();
    expect(f.contexte).toBeTruthy();
    expect(f.reussite.length).toBeGreaterThanOrEqual(3);
    expect(f.echec.length).toBeGreaterThanOrEqual(3);
    expect(f.valeurs).toEqual(["Autonomie", "Rigueur", "Respect", "Transmission", "Loyauté"]);
    expect(rapport.methode).toBe("modele");
  });

  it("word : Léo, Le Jardinier des Équipes", () => {
    const { fiche: f, rapport } = lire("fiche-word.html");
    expect(f.titre).toBe("Le Jardinier des Équipes");
    expect(f.mecanisme.startsWith("Faire pousser la confiance")).toBe(true);
    expect(f.mecanisme).not.toContain("«");
    expect(f.resume).toContain("apaise les tensions");
    expect(f.contexte.startsWith("Une équipe fatiguée")).toBe(true);
    expect(f.reussite).toHaveLength(3);
    expect(f.echec).toHaveLength(3);
    expect(f.enneagramme.base).toContain("Type 9");
    expect(f.avatars).toHaveLength(1);
    expect(plat(f)).not.toContain("juin");
    expect(rapport.methode).toBe("modele");
  });

  it("pdf : Nora, La Boussole Calme", () => {
    const { fiche: f, rapport } = lire("fiche-pdf.txt");
    expect(f.titre).toBe("La Boussole Calme");
    expect(f.prenom).toBe("Nora");
    expect(f.mecanisme).toBeTruthy();
    expect(f.contexte).toBeTruthy();
    expect(f.benefice).toBeTruthy();
    expect(f.reussite.length).toBeGreaterThan(0);
    expect(f.echec.length).toBeGreaterThan(0);
    expect(f.valeurs).toHaveLength(5);
    expect(rapport.methode).toBe("modele");
  });

  it("vierge : rien, les quatre champs manquent", () => {
    const { fiche: f, rapport } = lire("fiche-vierge.md");
    expect(f.prenom).toBe("");
    expect(f.avatars).toEqual([]);
    expect(rapport.manquants).toEqual(["mecanisme", "contexte", "benefice", "antiContexte"]);
    expect(rapport.methode).toBe("mots_cles");
  });

  it("libre : rien, les quatre champs manquent", () => {
    const { rapport } = lire("fiche-libre.txt");
    expect(rapport.manquants).toEqual(["mecanisme", "contexte", "benefice", "antiContexte"]);
    expect(rapport.methode).toBe("mots_cles");
  });
});

describe("versLignes et cle", () => {
  it("retire emojis, gras, numérotations romaines, et découpe les <br>", () => {
    const lignes = versLignes("💡 **Titre du talent**\nI/ Valeurs\n- Une puce<br>Une autre\n| a | b |");
    expect(lignes.map((l) => l.texte)).toEqual(["Titre du talent", "I/ Valeurs", "Une puce", "Une autre", "a | b"]);
    expect(lignes[4].cellules).toEqual(["a", "b"]);
  });
  it("cle retire accents, apostrophes typographiques et numéros", () => {
    expect(cle("1. Écologie de travail :")).toBe("ecologie de travail");
    expect(cle("III/ Le talent Identifié")).toBe("le talent identifie");
    expect(cle("L’Ingénieure")).toBe("l'ingenieure");
  });
});

describe("bornerFiche et validerFiche", () => {
  it("tronque, retire les doublons sans tenir compte de la casse ni des accents, ignore l'inconnu", () => {
    const f = bornerFiche({ titre: "a".repeat(200), valeurs: ["Liberté", "LIBERTE", "Joie"], v: 9, champInconnu: "x" });
    expect(f.titre.length).toBeLessThanOrEqual(120);
    expect(f.valeurs).toEqual(["Liberté", "Joie"]);
    expect(f.v).toBe(1);
    expect(f).not.toHaveProperty("champInconnu");
  });
  it("validerFiche applique les minimums du Cibleur", () => {
    const tropCourt = validerFiche({ mecanisme: "court", contexte: "un contexte assez long", benefice: "un bénéfice assez long", antiContexte: "assez long" });
    expect(tropCourt.ok).toBe(false);
    const ok = validerFiche({ mecanisme: "Relier des personnes", contexte: "un groupe de métiers différents", benefice: "un collectif qui avance", antiContexte: "les silos" });
    expect(ok.ok).toBe(true);
  });
});

describe("completerFiche", () => {
  it("déduit contexte, bénéfice, anti-contexte et résumé", () => {
    const base = { ...ficheVide(), reussite: ["A", "B"], echec: ["C"], phraseAntiValeurs: "D", resume: "Une phrase. Puis une autre.", mecanisme: "Mécanisme long" };
    const { fiche: f, deduits } = completerFiche(base);
    expect(f.contexte).toBe("A ; B");
    expect(f.benefice).toBe("Une phrase.");
    expect(f.antiContexte).toBe("C ; D");
    expect(deduits).toContain("contexte");
    const sansResume = completerFiche({ ...ficheVide(), mecanisme: "x".repeat(300) });
    expect(sansResume.fiche.resume.length).toBeLessThanOrEqual(220);
    const depuisAnti = completerFiche({ ...ficheVide(), antiValeurs: ["a", "b", "c", "d"] });
    expect(depuisAnti.fiche.antiContexte).toBe("a ; b ; c");
  });
});

describe("ficheDepuisQuiz", () => {
  it("retire le préfixe du titre et le « sais » du mécanisme", () => {
    const f = ficheDepuisQuiz({
      lang: "fr",
      archetypes: ["mediateur", "stratege"],
      name: "Mon Talent Unique : Médiatrice Audacieuse",
      mecanisme: "sais démêler les situations bloquées",
      contexte: "une équipe sous tension",
      benefice: "aider les équipes",
      antiContexte: "les organisations très hiérarchiques",
      success: "J'ai réconcilié deux chefs",
      failure: "Tâches administratives",
      fertile: ["du temps"],
      toxic: ["le bruit"],
    });
    expect(f.titre).toBe("Médiatrice Audacieuse");
    expect(f.mecanisme).toBe("démêler les situations bloquées");
    expect(f.reussite).toEqual(["J'ai réconcilié deux chefs", "du temps"]);
    expect(f.echec).toEqual(["Tâches administratives", "le bruit"]);
    expect(f.archetypes).toEqual(["mediateur", "stratege"]);
  });
});
