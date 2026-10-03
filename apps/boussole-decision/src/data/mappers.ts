// Conversion des lignes Postgres (snake_case) vers le modèle métier (camelCase).
import type {
  AppUser,
  Category,
  CoachComment,
  CoacheeSummary,
  Criterion,
  InvitationCode,
  Profile,
  Version,
} from "@/domain/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const mapAppUser = (r: Row): AppUser => ({
  id: r.id,
  email: r.email,
  firstName: r.first_name,
  role: r.role,
  coachId: r.coach_id,
  invitationCode: r.invitation_code ?? null,
  tutorialSeenAt: r.tutorial_seen_at,
  createdAt: r.created_at,
});

export const mapProfile = (r: Row): Profile => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  description: r.description,
  talent: {
    mecanisme: r.talent_mecanisme ?? "",
    contexteDeclencheur: r.talent_contexte_declencheur ?? "",
    superBenefice: r.talent_super_benefice ?? "",
    antiContexte: r.anti_contexte ?? "",
  },
  sharedWithCoach: Boolean(r.shared_with_coach),
  sharedAt: r.shared_at ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const mapVersion = (r: Row): Version => ({
  id: r.id,
  profileId: r.profile_id,
  userId: r.user_id,
  name: r.name,
  status: r.status,
  sourceVersionId: r.source_version_id,
  insightNote: r.insight_note,
  rankingFeedback: r.ranking_feedback,
  currentStep: r.current_step,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  finalizedAt: r.finalized_at,
});

export const mapInvitationCode = (r: Row): InvitationCode => ({
  code: r.code,
  label: r.label,
  maxUses: r.max_uses,
  usedCount: r.used_count,
  expiresAt: r.expires_at,
  disabledAt: r.disabled_at ?? null,
  createdAt: r.created_at,
});

export const mapCategory = (r: Row): Category => ({
  id: r.id,
  versionId: r.version_id,
  key: r.key,
  label: r.label,
  position: r.position,
});

export const mapCriterion = (r: Row): Criterion => ({
  id: r.id,
  versionId: r.version_id,
  categoryId: r.category_id,
  label: r.label,
  description: r.description,
  kind: r.kind,
  weight: r.weight,
  direction: r.direction,
  position: r.position,
});

export const mapComment = (r: Row): CoachComment => ({
  id: r.id,
  versionId: r.version_id,
  ownerId: r.owner_id,
  authorId: r.author_id,
  targetType: r.target_type,
  targetId: r.target_id,
  body: r.body,
  createdAt: r.created_at,
  readAt: r.read_at,
});

export const mapCoacheeSummary = (r: Row): CoacheeSummary => ({
  id: r.id,
  firstName: r.first_name,
  email: r.email,
  createdAt: r.created_at,
  lastActivityAt: r.last_activity_at,
  sharedProfiles: r.shared_profiles,
});
