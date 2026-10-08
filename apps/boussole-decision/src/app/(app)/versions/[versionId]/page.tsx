import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getI18n } from "@/i18n/server";
import { isLoveProfile } from "@/content/amour";
import { listVersions } from "@/data/repository";
import { nextVersionName } from "@/domain/versions";
import { loadVersionContext } from "@/features/versions/context";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { VersionWorkspace } from "@/features/versions/VersionWorkspace";
import { supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.version.titleVersion };
}

export default async function VersionPage({ params }: PageProps<"/versions/[versionId]">) {
  const { versionId } = await params;
  const ctx = await loadVersionContext(versionId);
  // Boussole Relation : la page de version est celle du mode pro, on ouvre le tableau amour.
  if (ctx.isOwner && isLoveProfile(ctx.profile)) redirect(`/versions/${versionId}/tableau/`);
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
