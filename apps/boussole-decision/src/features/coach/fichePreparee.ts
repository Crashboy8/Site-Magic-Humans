// Lecture d'une fiche déposée par Pierre sur la page coach/codes. Module pur, testé dans fichePreparee.test.ts.
import { validerFiche } from "@/domain/fiche/bornes";
import { lireFiche } from "@/domain/fiche/extraire";
import { CHAMPS_OBLIGATOIRES, type ChampObligatoire, type FicheTalent, type MethodeFiche } from "@/domain/fiche/types";
import { qcmDansTexte } from "@/features/fiche/lireDocument";

export type FicheLue = { ok: true; fiche: FicheTalent; methode: MethodeFiche } | { ok: false; manquants: ChampObligatoire[] };

/**
 * Texte d'une fiche (Word, PDF, export Notion ou collage, déjà converti) vers la fiche à garder.
 * Mêmes champs obligatoires que l'import fait par la personne : sans eux, la fiche n'est pas acceptée.
 */
export function lireFichePreparee(texte: string, ficheQcm?: FicheTalent): FicheLue {
  const qcm = ficheQcm ?? qcmDansTexte(texte);
  const { fiche, methode } = qcm ? { fiche: qcm, methode: "modele" as const } : (({ fiche: f, rapport }) => ({ fiche: f, methode: rapport.methode }))(lireFiche(texte));
  const v = validerFiche(fiche);
  if (!v.ok) {
    const manquants = CHAMPS_OBLIGATOIRES.filter((c) => v.erreurs.some((e) => e.champ === c));
    return { ok: false, manquants: manquants.length ? manquants : [...CHAMPS_OBLIGATOIRES] };
  }
  return { ok: true, fiche: v.fiche, methode };
}
