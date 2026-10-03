import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { getAppUser, getProfile, getVersion, listVersions } from "@/data/repository";
import { nextVersionName } from "@/domain/versions";
import { VersionWorkspace } from "@/features/versions/VersionWorkspace";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Version" };

export default async function VersionPage({ params }: PageProps<"/versions/[versionId]">) {
  const { versionId } = await params;
  const user = await requireUser();
  const db = await supabaseServer();
  const version = await getVersion(db, versionId).catch(() => null);
  if (!version) notFound();

  const readOnly = version.userId !== user.id;
  const [profile, siblings, owner] = await Promise.all([
    getProfile(db, version.profileId),
    listVersions(db, version.profileId),
    readOnly ? getAppUser(db, version.userId) : null,
  ]);

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-soft">
        <Link href={`/profils/${version.profileId}/`} className="hover:text-ink hover:underline">
          ← {profile?.name ?? "Profil"}
        </Link>
      </nav>
      {readOnly && <ReadOnlyBanner ownerName={owner?.firstName || owner?.email || "ton coaché"} />}
      <VersionWorkspace key={version.id + version.status} version={version} readOnly={readOnly} nextName={nextVersionName(siblings)} />
    </>
  );
}
