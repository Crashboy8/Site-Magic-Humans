// Modèle métier de la Boussole de décision.
// Ce dossier ne dépend ni de React ni de Supabase : il est réutilisable tel quel (Talent Unique).

export type UserRole = "coache" | "coach";

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  role: UserRole;
  coachId: string | null;
  invitationCode: string | null;
  tutorialSeenAt: string | null;
  createdAt: string;
}

/** Talent Unique (Talent MO2I) : « Je [Mécanisme] dans un environnement où [Contexte Déclencheur], afin de [Super bénéfice]. » */
export interface TalentUnique {
  mecanisme: string;
  contexteDeclencheur: string;
  superBenefice: string;
  /** Anti-Contexte (ou Contexte d'Inhibition) : ce qui éteint le talent. */
  antiContexte: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  description: string;
  talent: TalentUnique;
  sharedWithCoach: boolean;
  sharedAt: string | null;
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

/** Catégories de la matrice de décision MO2I. */
export type CategoryKey = "contexte_declencheur" | "anti_contexte" | "valeurs_culture" | "conditions_vie" | "remuneration";

export interface Category {
  id: string;
  versionId: string;
  key: CategoryKey | null; // null : catégorie créée par l'utilisateur
  label: string;
  position: number;
}

/**
 * Niveau d'importance d'un critère, du plus fort au plus faible.
 * « bonus » : ajoute des points si l'opportunité l'offre, n'en retire jamais.
 */
export type Importance = "critique" | "tres_important" | "important" | "moyen" | "bof" | "bonus";
/** TOWARDS : pour aller vers. AWAY_FROM : pour éviter (on évalue la présence du risque). */
export type CriterionDirection = "TOWARDS" | "AWAY_FROM";

export interface Criterion {
  id: string;
  versionId: string;
  categoryId: string;
  label: string;
  description: string;
  importance: Importance;
  /** Non négociable (DEALBREAKER) : si ce n'est pas pleinement satisfait, l'opportunité est signalée et classée après. */
  nonNegotiable: boolean;
  direction: CriterionDirection;
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
  disabledAt: string | null;
  createdAt: string;
}

export type CommentTarget = "version" | "criterion" | "opportunity";

export interface CoachComment {
  id: string;
  versionId: string;
  ownerId: string;
  authorId: string;
  targetType: CommentTarget;
  targetId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface CoacheeSummary {
  id: string;
  firstName: string;
  email: string;
  createdAt: string;
  lastActivityAt: string;
  sharedProfiles: number;
}
