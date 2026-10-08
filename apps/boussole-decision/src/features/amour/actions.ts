"use server";

import { redirect } from "next/navigation";
import {
  createCategory,
  createCriterion,
  createOpportunity,
  createProfile,
  deleteCategory,
  listCategories,
  listVersions,
  saveOpportunityAppearance,
} from "@/data/repository";
import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import { apparenceParDefaut } from "@/domain/relationApparence";
import { applyLovePrefill, parseLovePrefill } from "@/domain/lovePrefill";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Crée une Boussole Relation : un profil marqué « mode amour », ses 4 catégories, ses 12 critères
 * et une première colonne « Ma relation ». Sans session, ouvre d'abord un essai sans compte (comme importQuizAction).
 */
export async function startLoveCompassAction(rawPrefill?: unknown): Promise<{ error?: string }> {
  const { locale, t } = await getI18n();
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    const { error } = await supabase.auth.signInAnonymously({ options: { data: { lang: locale } } });
    if (error) return { error: t.auth.errors.trialDisabled };
  }

  let versionId: string;
  try {
    const profileId = await createProfile(supabase, LOVE_TEMPLATE.profileName, LOVE_TEMPLATE.profileDescription, LOVE_TEMPLATE.versionName);
    const [version] = await listVersions(supabase, profileId);
    versionId = version.id;
    // Les 5 catégories MO2I créées par défaut sont remplacées par les 4 catégories du mode amour.
    for (const c of await listCategories(supabase, versionId)) await deleteCategory(supabase, c.id);
    const categoryIds: Record<string, string> = {};
    for (const [i, c] of LOVE_TEMPLATE.categories.entries()) {
      categoryIds[c.key] = (await createCategory(supabase, versionId, c.label, i)).id;
    }
    const criteria = applyLovePrefill(parseLovePrefill(rawPrefill));
    for (const [i, c] of criteria.entries()) {
      await createCriterion(supabase, versionId, {
        categoryId: categoryIds[c.category],
        label: c.label,
        description: c.description,
        importance: c.importance,
        nonNegotiable: c.nonNegotiable,
        direction: c.direction,
        position: i,
      });
    }
    const relation = await createOpportunity(supabase, versionId, LOVE_TEMPLATE.opportunityName, 0);
    try {
      await saveOpportunityAppearance(supabase, relation, apparenceParDefaut([]));
    } catch {
      // Sans colonne dédiée et si les notes refusent l'écriture, l'écran recalcule la valeur par défaut.
    }
  } catch {
    return { error: LOVE_TEXTS.start.failed };
  }
  redirect(`/versions/${versionId}/tableau/`);
}
