"use server";

import { redirect } from "next/navigation";
import {
  createCategory,
  createCriterion,
  createOpportunity,
  createProfile,
  deleteCategory,
  listCategories,
  listCriteria,
  listProfiles,
  listVersions,
  listVersionsForUser,
  saveOpportunityAppearance,
} from "@/data/repository";
import { amourPour, cleCategorieAmour } from "@/content/amourLangue";
import { boussoleRelationExistante } from "@/domain/editionAmour";
import { apparenceParDefaut } from "@/domain/relationApparence";
import { applyLovePrefill, parseLovePrefill, proposalsToCreate, type LoveCriterionToCreate } from "@/domain/lovePrefill";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof supabaseServer>>;

async function existingLove(supabase: Db, userId: string) {
  const [profiles, versions] = await Promise.all([listProfiles(supabase, userId), listVersionsForUser(supabase, userId)]);
  return boussoleRelationExistante(profiles, versions);
}

/** Ce que l'accueil amour doit savoir : une Boussole Relation existe-t-elle déjà, et quels critères a-t-elle ? */
export async function loveStatusAction(): Promise<{ tableau: string | null; labels: string[] }> {
  try {
    const supabase = await supabaseServer();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (!userId) return { tableau: null, labels: [] };
    const version = await existingLove(supabase, userId);
    if (!version) return { tableau: null, labels: [] };
    const criteria = await listCriteria(supabase, version.id);
    return { tableau: `/versions/${version.id}/tableau/`, labels: criteria.map((c) => c.label) };
  } catch {
    return { tableau: null, labels: [] };
  }
}

/**
 * Ouvre la Boussole Relation. Sans session, ouvre d'abord un essai sans compte (comme importQuizAction).
 * Si la personne en a déjà une, on la reprend : on n'y ajoute que les critères du quiz cochés et absents,
 * sans jamais rien modifier ni supprimer. Sinon, on la crée : profil « mode amour », 4 catégories,
 * 12 critères du modèle, les critères cochés du quiz, et une première colonne « Ma relation ».
 * Avec sauver, l'invité est envoyé vers /sauvegarder/ pour rattacher ses résultats à son adresse mail.
 * Avec nouvelle, on crée toujours une nouvelle Boussole Relation (bouton de « Mes profils »).
 */
export async function startLoveCompassAction(
  rawPrefill?: unknown,
  chosenIds?: unknown,
  options?: { sauver?: boolean; nouvelle?: boolean },
): Promise<{ error?: string }> {
  const { locale, t } = await getI18n();
  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  let userId = claims?.claims?.sub ?? null;
  let guest = Boolean(claims?.claims?.is_anonymous);
  if (!userId) {
    const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { lang: locale } } });
    if (error || !data.user) return { error: t.auth.errors.trialDisabled };
    userId = data.user.id;
    guest = true;
  }

  // Modèle et textes dans la langue de l'interface ; le repère technique du profil reste le même.
  const { template: LOVE_TEMPLATE, texts: LOVE_TEXTS } = amourPour(locale);
  const prefill = parseLovePrefill(rawPrefill);
  let versionId: string;
  let added = 0;
  try {
    // « + Nouvelle Boussole Relation » (Mes profils) : on en crée une autre, sans reprendre l'existante.
    const existing = options?.nouvelle ? null : await existingLove(supabase, userId);
    if (existing) {
      versionId = existing.id;
      const [criteria, categories] = await Promise.all([listCriteria(supabase, versionId), listCategories(supabase, versionId)]);
      const toAdd = proposalsToCreate(prefill, chosenIds, criteria.map((c) => c.label), locale);
      const categoryIds: Record<string, string> = {};
      let nextCategory = categories.length;
      // Catégories reconnues quelle que soit leur langue de création (une Boussole commencée en français reste utilisable en anglais).
      for (const cat of categories) {
        const key = cleCategorieAmour(cat.label);
        if (key && !categoryIds[key]) categoryIds[key] = cat.id;
      }
      let position = criteria.reduce((max, c) => Math.max(max, c.position), -1) + 1;
      for (const c of toAdd) {
        if (!categoryIds[c.category]) {
          const label = LOVE_TEMPLATE.categories.find((cat) => cat.key === c.category)?.label ?? c.category;
          categoryIds[c.category] = (await createCategory(supabase, versionId, label, nextCategory++)).id;
        }
        await addCriterion(supabase, versionId, categoryIds[c.category], c, position++);
      }
      added = toAdd.length;
    } else {
      const profileId = await createProfile(supabase, LOVE_TEMPLATE.profileName, LOVE_TEMPLATE.profileDescription, LOVE_TEMPLATE.versionName);
      const [version] = await listVersions(supabase, profileId);
      versionId = version.id;
      // Les 5 catégories créées par défaut sont remplacées par les 4 catégories du mode amour.
      for (const c of await listCategories(supabase, versionId)) await deleteCategory(supabase, c.id);
      const categoryIds: Record<string, string> = {};
      for (const [i, c] of LOVE_TEMPLATE.categories.entries()) {
        categoryIds[c.key] = (await createCategory(supabase, versionId, c.label, i)).id;
      }
      const base = applyLovePrefill(prefill, locale);
      const fromQuiz = proposalsToCreate(prefill, chosenIds, base.map((c) => c.label), locale);
      for (const [i, c] of [...base, ...fromQuiz].entries()) {
        await addCriterion(supabase, versionId, categoryIds[c.category], c, i);
      }
      added = fromQuiz.length;
      const relation = await createOpportunity(supabase, versionId, LOVE_TEMPLATE.opportunityName, 0);
      try {
        await saveOpportunityAppearance(supabase, relation, apparenceParDefaut([]));
      } catch {
        // Sans colonne dédiée et si les notes refusent l'écriture, l'écran recalcule la valeur par défaut.
      }
    }
  } catch {
    return { error: LOVE_TEXTS.start.failed };
  }
  if (options?.sauver && guest) redirect("/sauvegarder/?depuis=quiz");
  redirect(`/versions/${versionId}/tableau/${added > 0 ? `?repris=${added}` : ""}`);
}

async function addCriterion(supabase: Db, versionId: string, categoryId: string, c: LoveCriterionToCreate, position: number) {
  await createCriterion(supabase, versionId, {
    categoryId,
    label: c.label,
    description: c.description,
    importance: c.importance,
    nonNegotiable: c.nonNegotiable,
    direction: c.direction,
    position,
  });
}
