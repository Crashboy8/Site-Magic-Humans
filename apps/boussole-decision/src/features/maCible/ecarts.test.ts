import { sansInsecables as plat } from "@/i18n/typo";
import { describe, expect, it } from "vitest";
import { maCible } from "@/i18n/messages/maCible";
import { ecartEsquisse, ecartQuestions } from "./ecarts";

const E = maCible.fr.esquisse;
const messages = { manqueOffre: E.manqueOffre, manqueAvis: E.manqueAvis, manqueCommentaire: E.manqueCommentaire };
const cibles = [
  { id: "c1" as const, nom: "Directeurs de site" },
  { id: "c2" as const, nom: "Dirigeants de PME" },
];

describe("écart de l'esquisse", () => {
  const avis = () => ({ verdict: "oui" as const, commentaire: "" });

  it("signale d'abord l'offre trop courte", () => {
    expect(ecartEsquisse(cibles, "court", avis, messages)).toEqual({ id: "champ-esquisse-offre", message: "Il manque quelques mots sur ton offre." });
  });
  it("nomme la première cible sans avis", () => {
    const de = (id: string) => (id === "c1" ? { verdict: "oui" as const, commentaire: "" } : { verdict: "" as const, commentaire: "" });
    expect(plat(ecartEsquisse(cibles, "J'accompagne des dirigeants.", de, messages)?.message ?? "")).toBe("Il manque un avis sur « Dirigeants de PME ».");
  });
  it("nomme le commentaire manquant avant la cible suivante", () => {
    const de = (id: string) => (id === "c1" ? { verdict: "non" as const, commentaire: "" } : { verdict: "" as const, commentaire: "" });
    const ecart = ecartEsquisse(cibles, "J'accompagne des dirigeants.", de, messages);
    expect(ecart?.id).toBe("commentaire-c1");
    expect(plat(ecart?.message ?? "")).toBe("Il manque un commentaire sur « Directeurs de site ».");
  });
  it("ne bloque pas quand tout est dit", () => {
    expect(ecartEsquisse(cibles, "J'accompagne des dirigeants.", avis, messages)).toBeNull();
  });
});

describe("écart des questions", () => {
  it("pointe la première question vide", () => {
    const questions = [{ id: "q1" }, { id: "q2" }];
    expect(ecartQuestions(questions, [false, true], maCible.fr.questions.manqueReponse)).toEqual({
      id: "question-q2",
      message: "Il manque une réponse à la question 2.",
    });
  });
});
