// Accès aux données. Chaque fonction reçoit un client Supabase (serveur ou navigateur) :
// les règles de sécurité de la base décident de ce que l'utilisateur peut voir et modifier.
// Pour une intégration dans une autre application, c'est ce fichier qu'on remplace.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppUser, InvitationCode, Profile, StepKey, Version } from "@/domain/types";
import { mapAppUser, mapInvitationCode, mapProfile, mapVersion } from "./mappers";

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
export async function createProfile(db: Db, name: string, description = ""): Promise<string> {
  return check(await db.rpc("create_profile", { p_name: name, p_description: description })) as string;
}

export async function updateProfile(db: Db, id: string, patch: { name?: string; description?: string }) {
  check(await db.from("profiles").update(patch).eq("id", id));
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
}

export async function updateVersion(db: Db, id: string, patch: VersionPatch) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.insightNote !== undefined) row.insight_note = patch.insightNote;
  if (patch.rankingFeedback !== undefined) row.ranking_feedback = patch.rankingFeedback;
  if (patch.currentStep !== undefined) row.current_step = patch.currentStep;
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

export async function createInvitationCode(
  db: Db,
  input: { code: string; coachId: string; label: string; maxUses: number; expiresAt: string | null },
) {
  check(
    await db.from("invitation_codes").insert({
      code: input.code,
      coach_id: input.coachId,
      label: input.label,
      max_uses: input.maxUses,
      expires_at: input.expiresAt,
    }),
  );
}

export async function deleteInvitationCode(db: Db, code: string) {
  check(await db.from("invitation_codes").delete().eq("code", code));
}
