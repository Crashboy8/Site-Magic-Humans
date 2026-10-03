import Link from "next/link";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { MarkCommentsRead } from "@/features/comments/MarkCommentsRead";
import type { VersionContext } from "./context";
import { SeanceMode } from "./SeanceMode";

/** Fil d'Ariane, bandeau de lecture seule et accusé de lecture des commentaires, communs aux pages d'une version. */
export function VersionHeader({ ctx }: { ctx: VersionContext }) {
  const unread = ctx.isOwner ? ctx.comments.filter((c) => !c.readAt).length : 0;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap gap-x-2 text-sm text-ink-soft">
        {!ctx.isOwner && ctx.owner && (
          <>
            <Link href={`/coach/${ctx.owner.id}/`} className="hover:text-ink hover:underline">
              {ctx.owner.firstName || ctx.owner.email}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        )}
        <Link href={`/profils/${ctx.profile.id}/`} className="hover:text-ink hover:underline">
          {ctx.profile.name}
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/versions/${ctx.version.id}/`} className="hover:text-ink hover:underline">
          {ctx.version.name}
        </Link>
      </nav>
      <SeanceMode />
      </div>
      {!ctx.isOwner && <ReadOnlyBanner ownerName={ctx.owner?.firstName || ctx.owner?.email || "ton coaché"} />}
      {ctx.isOwner && <MarkCommentsRead versionId={ctx.version.id} unread={unread} />}
    </>
  );
}
