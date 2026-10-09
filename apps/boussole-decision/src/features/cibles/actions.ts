"use server";

import { redirect } from "next/navigation";
import { DEPUIS_CIBLEUR } from "@/content/depuisCibleur";
import { CRITERES_CIBLES, evaluationPour, noteScoreCibleur, validerLienCibles } from "@/domain/boussoleCibles";
import {
  createCriterion,
  createOpportunity,
  createProfile,
  listCategories,
  listVersions,
  setEvaluation,
  updateOpportunity,
  updateTalent,
} from "@/data/repository";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Crée une Boussole « Mes cibles (Le Cibleur) » à partir de la charge du lien (§13.2).
 * Sans session, ouvre d'abord un essai sans compte (comme startLoveCompassAction).
 * La charge est revalidée ici : rien de ce que le navigateur envoie n'est pris tel quel.
 */
export async function startCiblesCompassAction(brut: unknown): Promise<{ error?: string }> {
  const charge = validerLienCibles(brut);
  if (!charge) return { error: DEPUIS_CIBLEUR.invalide };
  const { locale, t } = await getI18n();
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { lang: locale } } });
    if (error || !data.user) return { error: t.auth.errors.trialDisabled };
  }

  let versionId: string;
  try {
    const profileId = await createProfile(supabase, DEPUIS_CIBLEUR.nomProfil, DEPUIS_CIBLEUR.descriptionProfil, DEPUIS_CIBLEUR.nomVersion);
    const [version] = await listVersions(supabase, profileId);
    versionId = version.id;
    const { talent } = charge;
    await updateTalent(supabase, profileId, {
      mecanisme: talent.mecanisme,
      contexteDeclencheur: talent.contexte,
      superBenefice: talent.benefice,
      antiContexte: talent.antiContexte,
      successSituations: talent.reussite,
    });

    // Les 5 catégories MO2I créées par défaut sont gardées, repérées par leur clé.
    const categories = await listCategories(supabase, versionId);
    const parCle = new Map(categories.filter((c) => c.key).map((c) => [c.key, c.id]));
    const criteres: { id: string; source: (typeof CRITERES_CIBLES)[number]["source"] }[] = [];
    for (const [position, c] of CRITERES_CIBLES.entries()) {
      const categoryId = parCle.get(c.categorie);
      if (!categoryId) throw new Error("categorie_absente");
      const cree = await createCriterion(supabase, versionId, {
        categoryId,
        label: c.libelle,
        description: c.description(talent),
        importance: c.importance,
        nonNegotiable: c.nonNegociable,
        direction: c.direction,
        position,
      });
      criteres.push({ id: cree.id, source: c.source });
    }

    for (const [position, cible] of charge.cibles.entries()) {
      const opportunite = await createOpportunity(supabase, versionId, cible.nom, position);
      await updateOpportunity(supabase, opportunite.id, { summary: cible.resume, notes: noteScoreCibleur(cible.score) });
      for (const critere of criteres) {
        const valeur = evaluationPour(critere.source, cible.notes);
        if (valeur) await setEvaluation(supabase, versionId, critere.id, opportunite.id, { value: valeur });
      }
    }
  } catch {
    return { error: DEPUIS_CIBLEUR.echec };
  }
  redirect(`/versions/${versionId}/tableau/`);
}
