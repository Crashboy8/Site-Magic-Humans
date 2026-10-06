"use server";

import { redirect } from "next/navigation";
import { createCriterion, createProfile, listCategories, listVersions, updateTalent } from "@/data/repository";
import { parseQuizResult } from "@/domain/quizImport";
import { getI18n } from "@/i18n/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Crée un profil Boussole à partir du résultat du quiz : Talent Unique, Anti-Contexte, contextes vécus
 * et premiers critères. Sans session, `startTrial` ouvre d'abord un essai sans compte.
 */
export async function importQuizAction(raw: string, startTrial: boolean): Promise<{ error?: string }> {
  const { locale, t } = await getI18n();
  let quiz = null;
  try {
    quiz = parseQuizResult(JSON.parse(raw));
  } catch {
    quiz = null;
  }
  if (!quiz) return { error: t.quiz.invalid };

  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    if (!startTrial) return { error: t.quiz.signInFirst };
    const { error } = await supabase.auth.signInAnonymously({ options: { data: { lang: locale } } });
    if (error) return { error: t.auth.errors.trialDisabled };
  }

  let profileId: string;
  try {
    profileId = await createProfile(supabase, quiz.name, "", t.profile.firstVersionName);
    await updateTalent(supabase, profileId, {
      mecanisme: quiz.mecanisme,
      contexteDeclencheur: quiz.contexte,
      superBenefice: quiz.benefice,
      antiContexte: quiz.antiContexte,
      successSituations: quiz.success,
      failureSituations: quiz.failure,
    });
    const [version] = await listVersions(supabase, profileId);
    const categories = await listCategories(supabase, version.id);
    const trigger = categories.find((c) => c.key === "contexte_declencheur");
    const anti = categories.find((c) => c.key === "anti_contexte");
    for (const [i, label] of quiz.fertile.entries()) {
      if (!trigger) break;
      await createCriterion(supabase, version.id, {
        categoryId: trigger.id,
        label,
        importance: i === 0 ? "critique" : "tres_important",
        nonNegotiable: false,
        direction: "TOWARDS",
        position: i,
      });
    }
    for (const [i, label] of quiz.toxic.entries()) {
      if (!anti) break;
      await createCriterion(supabase, version.id, {
        categoryId: anti.id,
        label,
        importance: "tres_important",
        nonNegotiable: false,
        direction: "AWAY_FROM",
        position: i,
      });
    }
  } catch {
    return { error: t.quiz.failed };
  }
  redirect(`/profils/${profileId}/?quiz=1`);
}
