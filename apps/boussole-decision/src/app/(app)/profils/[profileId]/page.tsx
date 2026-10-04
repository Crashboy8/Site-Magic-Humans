import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { getAppUser, getProfile, listVersions } from "@/data/repository";
import { ProfileHeader } from "@/features/profiles/ProfileHeader";
import { ShareWithCoach } from "@/features/profiles/ShareWithCoach";
import { TalentUniqueEditor } from "@/features/profiles/TalentUniqueEditor";
import { VersionList } from "@/features/versions/VersionList";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage({ params }: PageProps<"/profils/[profileId]">) {
  const { profileId } = await params;
  const user = await requireUser();
  const db = await supabaseServer();
  const profile = await getProfile(db, profileId).catch(() => null);
  if (!profile) notFound();

  const readOnly = profile.userId !== user.id;
  const [versions, owner] = await Promise.all([listVersions(db, profile.id), readOnly ? getAppUser(db, profile.userId) : null]);

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-soft">
        <Link href={readOnly ? `/coach/${profile.userId}/` : "/"} className="hover:text-ink hover:underline">
          ← {readOnly ? `Profils de ${owner?.firstName || owner?.email}` : "Mes profils"}
        </Link>
      </nav>
      {readOnly && <ReadOnlyBanner ownerName={owner?.firstName || owner?.email || "ton coaché"} />}
      <ProfileHeader profile={profile} readOnly={readOnly} />

      <div className="mb-12 space-y-6">
        {!readOnly && !user.isGuest && <ShareWithCoach profileId={profile.id} initialShared={profile.sharedWithCoach} />}
        <TalentUniqueEditor profileId={profile.id} talent={profile.talent} readOnly={readOnly} />
      </div>

      <section aria-labelledby="versions" className="space-y-4">
        <div>
          <h2 id="versions" className="text-3xl italic">
            Versions
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Ta réflexion évolue : duplique une version pour en créer une nouvelle sans perdre la précédente. Une version finalisée
            est protégée ; rouvre-la si tu veux la retoucher.
          </p>
        </div>
        <VersionList profileId={profile.id} versions={versions} readOnly={readOnly} />
      </section>
    </>
  );
}
