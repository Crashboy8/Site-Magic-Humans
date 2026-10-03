// Conversion des lignes Postgres (snake_case) vers le modèle métier (camelCase).
import type { AppUser, InvitationCode, Profile, Version } from "@/domain/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const mapAppUser = (r: Row): AppUser => ({
  id: r.id,
  email: r.email,
  firstName: r.first_name,
  role: r.role,
  coachId: r.coach_id,
  tutorialSeenAt: r.tutorial_seen_at,
  createdAt: r.created_at,
});

export const mapProfile = (r: Row): Profile => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  description: r.description,
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
  createdAt: r.created_at,
});
