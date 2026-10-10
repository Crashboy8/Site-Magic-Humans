import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { OUTILS_INTENTION, QUESTION_MAX } from "@/domain/intention";
import { intention } from "@/i18n/messages/intention";
import { MESSAGES } from "@/i18n/messages";
import { sansInsecables } from "@/i18n/typo";
import { BASE_PATH } from "@/lib/config";
import { CLES_ERREUR, cleErreur } from "./erreurs";

const RACINE = join(__dirname, "../../../../..");
const APP = join(__dirname, "../../..");

type TextesStatiques = Record<"fr" | "en" | "es", Record<string, string> & { erreurs: Record<string, string> }>;
const bac: { MHAvisPierre?: { API: string; OUTILS: string[]; QUESTION_MAX: number; TEXTES: TextesStatiques } } = {};
vm.runInNewContext(readFileSync(join(RACINE, "js/avis-pierre.js"), "utf8"), bac);
const statique = bac.MHAvisPierre!;
const copie = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const TIRETS_LONGS = /[\u2013\u2014]/;
function chaines(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (typeof v === "function") return chaines((v as (...a: unknown[]) => unknown)("x", 500));
  if (typeof v === "object" && v !== null) return Object.values(v).flatMap(chaines);
  return [];
}

describe("« Demander l'avis de Pierre »", () => {
  it("branché dans les dictionnaires, dans les trois langues", () => {
    expect(MESSAGES.fr.intention).toBe(intention.fr);
    expect(MESSAGES.en.intention).toBe(intention.en);
    expect(MESSAGES.es.intention).toBe(intention.es);
    for (const l of ["fr", "en", "es"] as const) {
      for (const t of chaines(intention[l])) {
        expect(TIRETS_LONGS.test(t), `${l} : ${t}`).toBe(false);
        expect(t.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("le bouton et la case disent mot pour mot ce qui est demandé", () => {
    expect(intention.fr.bouton).toBe("Demander l'avis de Pierre");
    expect(intention.fr.formulaire.accord).toBe("J'accepte que Pierre me réponde par mail");
  });

  it("le site statique a les mêmes textes, la même route et les mêmes outils que l'application", () => {
    expect(statique.API).toBe(`${BASE_PATH}/api/intention/`);
    expect(copie(statique.OUTILS)).toEqual([...OUTILS_INTENTION]);
    expect(statique.QUESTION_MAX).toBe(QUESTION_MAX);
    for (const l of ["fr", "en", "es"] as const) {
      const F = intention[l].formulaire;
      const S = copie(statique.TEXTES[l]);
      const attendu = {
        bouton: intention[l].bouton,
        titre: F.titre,
        intro: F.intro,
        question: F.question,
        compteur: F.compteur(7, 500),
        mail: F.mail,
        mailAide: F.mailAide,
        accord: F.accord,
        piege: F.piege,
        envoyer: F.envoyer,
        envoi: F.envoi,
        fermer: F.fermer,
        donnees: F.donnees,
        lienDonnees: F.lienDonnees,
        chargement: F.chargement,
        envoye: F.envoye,
        erreurs: F.erreurs,
      };
      const recu = { ...S, compteur: S.compteur.replace("{n}", "7").replace("{max}", "500") };
      expect(JSON.parse(sansInsecables(JSON.stringify(recu))), l).toEqual(JSON.parse(sansInsecables(JSON.stringify(attendu))));
    }
  });

  it("chaque réponse de la route a son message", () => {
    for (const e of ["question", "mail", "trop_tot", "jeton", "attendre", "plafond", "indisponible"]) expect(cleErreur(e)).toBe(e);
    expect(cleErreur("invalide")).toBe("question");
    expect(cleErreur("origine")).toBe("indisponible");
    expect(cleErreur(undefined)).toBe("indisponible");
    expect(Object.keys(intention.fr.formulaire.erreurs).sort()).toEqual([...CLES_ERREUR].sort());
  });

  it("le bouton est posé dans chaque outil de l'application", () => {
    const lire = (f: string) => readFileSync(join(APP, f), "utf8");
    expect(lire("src/features/maCible/MaCible.tsx")).toContain('outil="cibleur"');
    expect(lire("src/app/(app)/versions/[versionId]/page.tsx")).toContain('outil="boussole-pro"');
    for (const page of ["tableau", "resultats"]) expect(lire(`src/app/(app)/versions/[versionId]/${page}/page.tsx`)).toContain('love ? "boussole-perso" : "boussole-pro"');
    expect(lire("src/features/parcours/OuJenSuis.tsx")).toContain('outil="ou-j-en-suis"');
  });

  it("aucun numéro de téléphone ni lien WhatsApp dans ce qui touche à la demande d'avis", () => {
    const fichiers = [
      join(RACINE, "js/avis-pierre.js"),
      join(APP, "src/features/intention/DemanderAvis.tsx"),
      join(APP, "src/features/intention/serveur.ts"),
      join(APP, "src/features/intention/BoutonTraitee.tsx"),
      join(APP, "src/i18n/messages/intention.ts"),
      join(APP, "src/lib/intention/traitement.ts"),
      join(APP, "src/app/(app)/coach/intentions/page.tsx"),
      join(APP, "supabase/migrations/20261019000000_intentions.sql"),
    ];
    for (const f of fichiers) {
      const texte = readFileSync(f, "utf8");
      expect(/wa\.me|whatsapp|tel:/i.test(texte), f).toBe(false);
      expect(/(\+33|\b0[1-9])([\s.-]?\d{2}){4}/.test(texte), f).toBe(false);
    }
  });
});
