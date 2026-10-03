// Modèle métier de la Boussole de décision.
// Ce dossier ne dépend ni de React ni de Supabase : il est réutilisable tel quel (Talent Unique).

export type UserRole = "coache" | "coach";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  role: UserRole;
  coachId: string | null;
  tutorialSeenAt: string | null;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type VersionStatus = "brouillon" | "finalisee";

export type StepKey = "criteres" | "opportunites" | "evaluation" | "resultats";

export interface Version {
  id: string;
  profileId: string;
  userId: string;
  name: string;
  status: VersionStatus;
  sourceVersionId: string | null;
  insightNote: string;
  rankingFeedback: string;
  currentStep: StepKey;
  createdAt: string;
  updatedAt: string;
  finalizedAt: string | null;
}

export type CategoryKey = "talent" | "valeurs" | "logistique" | "remuneration" | "autre";

export interface Category {
  id: string;
  versionId: string;
  key: CategoryKey | null; // null : catégorie créée par l'utilisateur
  label: string;
  position: number;
}

export type Importance = "eliminatoire" | "crucial" | "tres_important" | "important" | "souhaitable" | "bonus";

export interface Criterion {
  id: string;
  versionId: string;
  categoryId: string;
  label: string;
  description: string;
  importance: Importance;
  position: number;
}

export interface Opportunity {
  id: string;
  versionId: string;
  name: string;
  summary: string;
  url: string;
  notes: string;
  position: number;
}

export type EvaluationValue = "non" | "p25" | "p50" | "p75" | "oui" | "inconnu";

export interface Evaluation {
  criterionId: string;
  opportunityId: string;
  value: EvaluationValue;
}

export interface InvitationCode {
  code: string;
  label: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}
