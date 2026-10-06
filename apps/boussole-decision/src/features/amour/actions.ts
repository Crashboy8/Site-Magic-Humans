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
} from "@/data/repository";
import { LOVE_TEMPLATE, LOVE_TEXTS } from "@/content/amour";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Crée une Boussole Relation : un profil marqué « mode amour », ses 4 catégories, ses 10 critères
 * et une première colonne « Ma relation ». Sans session, ouvre d'abord un essai sans compte (comme importQuizAction).
 */
export async function startLoveCompassAction(): Promise<{ error?: string }> {
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
    for (const [i, c] of LOVE_TEMPLATE.criteria.entries()) {
      await createCriterion(supabase, versionId, {
        categoryId: categoryIds[c.category],
        label: c.label,
        description: c.guide,
        importance: c.importance,
        nonNegotiable: c.nonNegotiable,
        direction: c.direction,
        position: i,
      });
    }
    await createOpportunity(supabase, versionId, LOVE_TEMPLATE.opportunityName, 0);
  } catch {
    return { error: LOVE_TEXTS.start.failed };
  }
  redirect(`/versions/${versionId}/tableau/`);
}
