// Conversion des lignes Postgres (snake_case) vers le modèle métier (camelCase).
import type {
  AppUser,
  Category,
  CoachComment,
  CoacheeSummary,
  Criterion,
  Evaluation,
  Opportunity,
  InvitationCode,
  Profile,
  Version,
} from "@/domain/types";

import { estCouleur, estIcone, lireApparenceNotes } from "@/domain/relationApparence";
import { normalizeWeights } from "@/domain/scoring";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const mapAppUser = (r: Row): AppUser => ({
  id: r.id,
  email: r.email,
  firstName: r.first_name,
  role: r.role,
  coachId: r.coach_id,
  invitationCode: r.invitation_code ?? null,
  isGuest: Boolean(r.is_guest),
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
    successSituations: r.success_situations ?? "",
    failureSituations: r.failure_situations ?? "",
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
  importanceWeights: normalizeWeights(r.importance_weights),
  rankingAgreement: r.ranking_agreement ?? null,
  projectionFeeling: r.projection_feeling ?? null,
  projectionNote: r.projection_note ?? "",
  chosenOpportunityId: r.chosen_opportunity_id ?? null,
  nextSteps: Array.isArray(r.next_steps) ? r.next_steps.map(String) : [],
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
  importance: r.importance,
  nonNegotiable: Boolean(r.non_negotiable),
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

export const mapOpportunity = (r: Row): Opportunity => {
  // Pas de migration obligatoire : icon/color en colonnes si elles existent, sinon marqueur dans notes.
  const cache = lireApparenceNotes(r.notes ?? "");
  const icon = estIcone(r.icon) ? r.icon : cache.look?.icon;
  const color = estCouleur(r.color) ? r.color : cache.look?.color;
  return {
    id: r.id,
    versionId: r.version_id,
    name: r.name,
    summary: r.summary,
    url: r.url,
    notes: cache.notes,
    position: r.position,
    ...(icon && color ? { icon, color } : {}),
  };
};

export const mapEvaluation = (r: Row): Evaluation => ({
  criterionId: r.criterion_id,
  opportunityId: r.opportunity_id,
  value: r.value,
});
