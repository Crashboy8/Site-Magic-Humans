// Accès aux données. Chaque fonction reçoit un client Supabase (serveur ou navigateur) :
// les règles de sécurité de la base décident de ce que l'utilisateur peut voir et modifier.
// Pour une intégration dans une autre application, c'est ce fichier qu'on remplace.
import type { SupabaseClient } from "@supabase/supabase-js";
import { colonneAbsente, ecrireApparenceNotes, type RelationLook } from "@/domain/relationApparence";
import { pourcentageValide, valeurProche } from "@/domain/pourcentage";
import type {
  AppUser,
  Category,
  CoachComment,
  CoacheeSummary,
  CommentTarget,
  Criterion,
  CriterionDirection,
  InvitationCode,
  Profile,
  ImportanceWeights,
  ProjectionFeeling,
  RankingAgreement,
  StepKey,
  TalentUnique,
  Version,
  Importance,
  Evaluation,
  EvaluationValue,
  Opportunity,
} from "@/domain/types";
import {
  mapAppUser,
  mapCategory,
  mapCoacheeSummary,
  mapComment,
  mapCriterion,
  mapEvaluation,
  mapOpportunity,
  mapInvitationCode,
  mapProfile,
  mapVersion,
} from "./mappers";

type Db = SupabaseClient;

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function rows<T>(result: { data: T[] | null; error: { message: string } | null }): T[] {
  return check(result) ?? [];
}

// --- Profils -----------------------------------------------------------------

export async function listProfiles(db: Db, userId: string): Promise<Profile[]> {
  const list = rows(await db.from("profiles").select("*").eq("user_id", userId).order("updated_at", { ascending: false }));
  return list.map(mapProfile);
}

export async function getProfile(db: Db, id: string): Promise<Profile | null> {
  const row = check(await db.from("profiles").select("*").eq("id", id).maybeSingle());
  return row ? mapProfile(row) : null;
}

/** Crée un profil et sa première version « Brouillon ». Renvoie l'id du profil. */
export async function createProfile(db: Db, name: string, description = "", firstVersionName?: string): Promise<string> {
  const id = check(await db.rpc("create_profile", { p_name: name, p_description: description })) as string;
  // La base nomme la première version « Brouillon » ; dans une autre langue, on la renomme.
  if (firstVersionName && firstVersionName !== "Brouillon") {
    check(await db.from("versions").update({ name: firstVersionName }).eq("profile_id", id));
  }
  return id;
}

export async function updateProfile(db: Db, id: string, patch: { name?: string; description?: string }) {
  check(await db.from("profiles").update(patch).eq("id", id));
}

export async function updateTalent(db: Db, id: string, patch: Partial<TalentUnique>) {
  const row: Record<string, string> = {};
  if (patch.mecanisme !== undefined) row.talent_mecanisme = patch.mecanisme;
  if (patch.contexteDeclencheur !== undefined) row.talent_contexte_declencheur = patch.contexteDeclencheur;
  if (patch.superBenefice !== undefined) row.talent_super_benefice = patch.superBenefice;
  if (patch.antiContexte !== undefined) row.anti_contexte = patch.antiContexte;
  if (patch.successSituations !== undefined) row.success_situations = patch.successSituations;
  if (patch.failureSituations !== undefined) row.failure_situations = patch.failureSituations;
  check(await db.from("profiles").update(row).eq("id", id));
}

/** Partage (ou retire le partage) d'un profil avec le coach. Seul le coaché peut le faire. */
export async function setProfileSharing(db: Db, id: string, shared: boolean) {
  check(await db.from("profiles").update({ shared_with_coach: shared }).eq("id", id));
}

export async function deleteProfile(db: Db, id: string) {
  check(await db.from("profiles").delete().eq("id", id));
}

// --- Versions ----------------------------------------------------------------

export async function listVersions(db: Db, profileId: string): Promise<Version[]> {
  const list = rows(await db.from("versions").select("*").eq("profile_id", profileId).order("created_at"));
  return list.map(mapVersion);
}

/** Dernières versions de chaque profil d'un utilisateur, pour la page d'accueil. */
export async function listVersionsForUser(db: Db, userId: string): Promise<Version[]> {
  const list = rows(await db.from("versions").select("*").eq("user_id", userId).order("created_at"));
  return list.map(mapVersion);
}

export async function getVersion(db: Db, id: string): Promise<Version | null> {
  const row = check(await db.from("versions").select("*").eq("id", id).maybeSingle());
  return row ? mapVersion(row) : null;
}

export async function createVersion(db: Db, profileId: string, name: string): Promise<string> {
  return check(await db.rpc("create_version", { p_profile_id: profileId, p_name: name })) as string;
}

export async function duplicateVersion(db: Db, versionId: string, name: string): Promise<string> {
  return check(await db.rpc("duplicate_version", { p_version_id: versionId, p_name: name })) as string;
}

export interface VersionPatch {
  name?: string;
  status?: Version["status"];
  insightNote?: string;
  rankingFeedback?: string;
  currentStep?: StepKey;
  importanceWeights?: ImportanceWeights;
  rankingAgreement?: RankingAgreement | null;
  projectionFeeling?: ProjectionFeeling | null;
  projectionNote?: string;
  chosenOpportunityId?: string | null;
  nextSteps?: string[];
}

export async function updateVersion(db: Db, id: string, patch: VersionPatch) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.insightNote !== undefined) row.insight_note = patch.insightNote;
  if (patch.rankingFeedback !== undefined) row.ranking_feedback = patch.rankingFeedback;
  if (patch.currentStep !== undefined) row.current_step = patch.currentStep;
  if (patch.importanceWeights !== undefined) row.importance_weights = patch.importanceWeights;
  if (patch.rankingAgreement !== undefined) row.ranking_agreement = patch.rankingAgreement;
  if (patch.projectionFeeling !== undefined) row.projection_feeling = patch.projectionFeeling;
  if (patch.projectionNote !== undefined) row.projection_note = patch.projectionNote;
  if (patch.chosenOpportunityId !== undefined) row.chosen_opportunity_id = patch.chosenOpportunityId;
  if (patch.nextSteps !== undefined) row.next_steps = patch.nextSteps;
  check(await db.from("versions").update(row).eq("id", id));
}

export async function deleteVersion(db: Db, id: string) {
  check(await db.from("versions").delete().eq("id", id));
}

// --- Utilisateurs et coach -------------------------------------------------------

export async function getAppUser(db: Db, id: string): Promise<AppUser | null> {
  const row = check(await db.from("app_users").select("*").eq("id", id).maybeSingle());
  return row ? mapAppUser(row) : null;
}

export async function markTutorialSeen(db: Db, id: string) {
  check(await db.from("app_users").update({ tutorial_seen_at: new Date().toISOString() }).eq("id", id));
}

export async function listCoachees(db: Db, coachId: string): Promise<AppUser[]> {
  const list = rows(await db.from("app_users").select("*").eq("coach_id", coachId).order("created_at", { ascending: false }));
  return list.map(mapAppUser);
}

/** Tableau de bord du coach : coachés, dernière activité, nombre de profils partagés. */
export async function coachDashboard(db: Db): Promise<CoacheeSummary[]> {
  const list = rows(await db.rpc("coach_dashboard")) as Record<string, unknown>[];
  return list.map(mapCoacheeSummary);
}

/** Tous les profils visibles (pour le coach : ceux de ses coachés). */
export async function listProfilesOf(db: Db, userIds: string[]): Promise<Profile[]> {
  if (userIds.length === 0) return [];
  const list = rows(await db.from("profiles").select("*").in("user_id", userIds).order("updated_at", { ascending: false }));
  return list.map(mapProfile);
}

// --- Codes d'invitation ---------------------------------------------------------

export async function checkInvitationCode(db: Db, code: string): Promise<boolean> {
  return Boolean(check(await db.rpc("check_invitation_code", { p_code: code })));
}

export async function listInvitationCodes(db: Db): Promise<InvitationCode[]> {
  const list = rows(await db.from("invitation_codes").select("*").order("created_at", { ascending: false }));
  return list.map(mapInvitationCode);
}

/**
 * Crée un code. « existe » : ce code est déjà pris. « sans_lien » : le code est créé, mais sans le lien de fiche
 * (colonne lien_fiche absente tant que le SQL de l'accès client n'est pas collé).
 */
export async function createInvitationCode(
  db: Db,
  input: { code: string; coachId: string; label: string; maxUses: number; expiresAt: string | null; lienFiche?: string | null },
): Promise<"ok" | "existe" | "sans_lien"> {
  const ligne = {
    code: input.code,
    coach_id: input.coachId,
    label: input.label,
    max_uses: input.maxUses,
    expires_at: input.expiresAt,
  };
  const avecLien = input.lienFiche ? { ...ligne, lien_fiche: input.lienFiche } : ligne;
  const { error } = await db.from("invitation_codes").insert(avecLien);
  if (!error) return "ok";
  if (error.code === "23505") return "existe";
  if (input.lienFiche && (error.code === "PGRST204" || error.code === "42703" || /lien_fiche/.test(error.message ?? ""))) {
    check(await db.from("invitation_codes").insert(ligne));
    return "sans_lien";
  }
  throw error;
}

export async function setInvitationCodeDisabled(db: Db, code: string, disabled: boolean) {
  check(await db.from("invitation_codes").update({ disabled_at: disabled ? new Date().toISOString() : null }).eq("code", code));
}

export async function deleteInvitationCode(db: Db, code: string) {
  check(await db.from("invitation_codes").delete().eq("code", code));
}

// --- Catégories et critères -------------------------------------------------------

export async function listCategories(db: Db, versionId: string): Promise<Category[]> {
  const list = rows(await db.from("categories").select("*").eq("version_id", versionId).order("position"));
  return list.map(mapCategory);
}

export async function createCategory(db: Db, versionId: string, label: string, position: number): Promise<Category> {
  const row = check(await db.from("categories").insert({ version_id: versionId, label, position }).select().single());
  return mapCategory(row);
}

export async function updateCategory(db: Db, id: string, patch: { label?: string; position?: number }) {
  check(await db.from("categories").update(patch).eq("id", id));
}

export async function deleteCategory(db: Db, id: string) {
  check(await db.from("categories").delete().eq("id", id));
}

export async function listCriteria(db: Db, versionId: string): Promise<Criterion[]> {
  const list = rows(await db.from("criteria").select("*").eq("version_id", versionId).order("position"));
  return list.map(mapCriterion);
}

export interface CriterionInput {
  categoryId: string;
  label: string;
  description?: string;
  importance: Importance;
  nonNegotiable: boolean;
  direction: CriterionDirection;
  position: number;
}

export async function createCriterion(db: Db, versionId: string, input: CriterionInput): Promise<Criterion> {
  const row = check(
    await db
      .from("criteria")
      .insert({
        version_id: versionId,
        category_id: input.categoryId,
        label: input.label,
        description: input.description ?? "",
        importance: input.importance,
        non_negotiable: input.nonNegotiable,
        direction: input.direction,
        position: input.position,
      })
      .select()
      .single(),
  );
  return mapCriterion(row);
}

export async function updateCriterion(db: Db, id: string, patch: Partial<Omit<CriterionInput, "categoryId">> & { categoryId?: string }) {
  const row: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) row.category_id = patch.categoryId;
  if (patch.label !== undefined) row.label = patch.label;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.importance !== undefined) row.importance = patch.importance;
  if (patch.nonNegotiable !== undefined) row.non_negotiable = patch.nonNegotiable;
  if (patch.direction !== undefined) row.direction = patch.direction;
  if (patch.position !== undefined) row.position = patch.position;
  check(await db.from("criteria").update(row).eq("id", id));
}

/** Enregistre un nouvel ordre (et éventuellement une nouvelle catégorie) pour plusieurs critères. */
export async function reorderCriteria(db: Db, items: { id: string; categoryId: string; position: number }[]) {
  await Promise.all(items.map((i) => updateCriterion(db, i.id, { categoryId: i.categoryId, position: i.position })));
}

export async function deleteCriterion(db: Db, id: string) {
  check(await db.from("criteria").delete().eq("id", id));
}

// --- Commentaires du coach --------------------------------------------------------

export async function listComments(db: Db, versionId: string): Promise<CoachComment[]> {
  const list = rows(await db.from("comments").select("*").eq("version_id", versionId).order("created_at"));
  return list.map(mapComment);
}

export async function addComment(db: Db, versionId: string, targetType: CommentTarget, targetId: string, body: string): Promise<CoachComment> {
  const row = check(
    await db.from("comments").insert({ version_id: versionId, target_type: targetType, target_id: targetId, body }).select().single(),
  );
  return mapComment(row);
}

export async function deleteComment(db: Db, id: string) {
  check(await db.from("comments").delete().eq("id", id));
}

export async function markCommentsRead(db: Db, versionId: string) {
  check(await db.from("comments").update({ read_at: new Date().toISOString() }).eq("version_id", versionId).is("read_at", null));
}

export interface UnreadComment extends CoachComment {
  versionName: string;
  profileName: string;
}

/** Commentaires non lus du coaché connecté, pour la notification et la page « Commentaires ». */
export async function listUnreadComments(db: Db, ownerId: string): Promise<UnreadComment[]> {
  const list = rows(
    await db
      .from("comments")
      .select("*, versions(name, profiles(name))")
      .eq("owner_id", ownerId)
      .is("read_at", null)
      .order("created_at", { ascending: false }),
  );
  return list.map((r) => ({
    ...mapComment(r),
    versionName: r.versions?.name ?? "",
    profileName: r.versions?.profiles?.name ?? "",
  }));
}

export async function countUnreadComments(db: Db, ownerId: string): Promise<number> {
  const { count, error } = await db
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .is("read_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// --- Opportunités et évaluations --------------------------------------------------

export async function listOpportunities(db: Db, versionId: string): Promise<Opportunity[]> {
  const list = rows(await db.from("opportunities").select("*").eq("version_id", versionId).order("position"));
  return list.map(mapOpportunity);
}

export async function createOpportunity(db: Db, versionId: string, name: string, position: number): Promise<Opportunity> {
  const row = check(await db.from("opportunities").insert({ version_id: versionId, name, position }).select().single());
  return mapOpportunity(row);
}

export async function updateOpportunity(
  db: Db,
  id: string,
  patch: Partial<Pick<Opportunity, "name" | "summary" | "url" | "notes" | "position">>,
) {
  check(await db.from("opportunities").update(patch).eq("id", id));
}

export async function deleteOpportunity(db: Db, id: string) {
  check(await db.from("opportunities").delete().eq("id", id));
}

/**
 * Icône et couleur d'une relation, sur la même ligne que le nom.
 * On tente les colonnes optionnelles icon et color. Si elles manquent (pas de migration),
 * on écrit un marqueur invisible au début de notes, qui voyage avec la copie de version.
 */
export async function saveOpportunityAppearance(
  db: Db,
  opportunity: Pick<Opportunity, "id" | "notes">,
  look: RelationLook,
): Promise<"colonnes" | "notes"> {
  const colonnes = await db.from("opportunities").update({ icon: look.icon, color: look.color }).eq("id", opportunity.id);
  const notes = ecrireApparenceNotes(opportunity.notes, look);
  const noteResult = await db.from("opportunities").update({ notes }).eq("id", opportunity.id);
  if (noteResult.error) throw new Error(noteResult.error.message);
  return colonnes.error ? "notes" : "colonnes";
}

export async function listEvaluations(db: Db, versionId: string): Promise<Evaluation[]> {
  const list = rows(await db.from("evaluations").select("*").eq("version_id", versionId));
  return list.map(mapEvaluation);
}

/**
 * Enregistre une case (null : la vider).
 * Un pourcentage libre est écrit dans la colonne optionnelle `percent`.
 * Si elle n'existe pas encore, on garde la note en mots la plus proche dans `value` :
 * le navigateur conserve le pourcentage exact (voir pourcentageLocale).
 */
export async function setEvaluation(
  db: Db,
  versionId: string,
  criterionId: string,
  opportunityId: string,
  saisie: { value: EvaluationValue; percent?: number } | null,
) {
  if (saisie === null) {
    check(await db.from("evaluations").delete().eq("criterion_id", criterionId).eq("opportunity_id", opportunityId));
    return;
  }
  const percent = pourcentageValide(saisie.percent) ? saisie.percent : null;
  const value = percent === null ? saisie.value : valeurProche(percent);
  const base = {
    version_id: versionId,
    criterion_id: criterionId,
    opportunity_id: opportunityId,
    value,
    updated_at: new Date().toISOString(),
  };
  const avec = await db.from("evaluations").upsert({ ...base, percent }, { onConflict: "criterion_id,opportunity_id" });
  if (!avec.error) return;
  if (!colonneAbsente(avec.error)) throw new Error(avec.error.message);
  check(await db.from("evaluations").upsert(base, { onConflict: "criterion_id,opportunity_id" }));
}
