import type { Metadata } from "next";
import { listVersions } from "@/data/repository";
import { nextVersionName } from "@/domain/versions";
import { loadVersionContext } from "@/features/versions/context";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { VersionWorkspace } from "@/features/versions/VersionWorkspace";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Version" };

export default async function VersionPage({ params }: PageProps<"/versions/[versionId]">) {
  const { versionId } = await params;
  const ctx = await loadVersionContext(versionId);
  const siblings = await listVersions(await supabaseServer(), ctx.version.profileId);

  return (
    <>
      <VersionHeader ctx={ctx} />
      <VersionWorkspace
        key={ctx.version.id + ctx.version.status}
        version={ctx.version}
        readOnly={!ctx.isOwner}
        nextName={nextVersionName(siblings)}
        comments={ctx.comments}
        commentViewer={ctx.commentViewer}
      />
    </>
  );
}
