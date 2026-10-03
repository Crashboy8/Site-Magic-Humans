import "server-only";
import { notFound } from "next/navigation";
import { getAppUser, getProfile, getVersion, listComments } from "@/data/repository";
import type { AppUser, CoachComment, Profile, Version } from "@/domain/types";
import type { CommentViewer } from "@/features/comments/CommentThread";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export interface VersionContext {
  user: AppUser;
  version: Version;
  profile: Profile;
  /** Propriétaire de la version, si ce n'est pas l'utilisateur connecté (consultation par le coach). */
  owner: AppUser | null;
  isOwner: boolean;
  /** Lecture seule : consultation par le coach, ou version finalisée. */
  readOnly: boolean;
  commentViewer: CommentViewer | null;
  comments: CoachComment[];
}

/** Charge une version et ses droits d'accès. 404 si elle n'existe pas ou n'est pas accessible (ex. partage retiré). */
export async function loadVersionContext(versionId: string): Promise<VersionContext> {
  const user = await requireUser();
  const db = await supabaseServer();
  const version = await getVersion(db, versionId).catch(() => null);
  if (!version) notFound();
  const isOwner = version.userId === user.id;
  const [profile, owner, comments] = await Promise.all([
    getProfile(db, version.profileId),
    isOwner ? null : getAppUser(db, version.userId),
    listComments(db, version.id).catch(() => []),
  ]);
  if (!profile) notFound();
  return {
    user,
    version,
    profile,
    owner,
    isOwner,
    readOnly: !isOwner || version.status === "finalisee",
    commentViewer: isOwner ? "owner" : user.role === "coach" ? "coach" : null,
    comments,
  };
}
