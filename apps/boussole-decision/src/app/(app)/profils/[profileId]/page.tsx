import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { ButtonLink, Card } from "@/components/ui";
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
  // Le tableau à ouvrir : le brouillon le plus récent, sinon la dernière version.
  const current = [...versions].reverse().find((v) => v.status === "brouillon") ?? versions.at(-1);
  const tableHref = current ? `/versions/${current.id}/tableau/` : null;
  const tableLink = tableHref && (
    <ButtonLink href={tableHref} className="w-full sm:w-auto">
      {readOnly ? "Voir le tableau de décision →" : "Ouvrir mon tableau : critères et opportunités →"}
    </ButtonLink>
  );

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-soft">
        <Link href={readOnly ? `/coach/${profile.userId}/` : "/"} className="hover:text-ink hover:underline">
          ← {readOnly ? `Profils de ${owner?.firstName || owner?.email}` : "Mes profils"}
        </Link>
      </nav>
      {readOnly && <ReadOnlyBanner ownerName={owner?.firstName || owner?.email || "ton coaché"} />}
      <ProfileHeader profile={profile} readOnly={readOnly} />
      {tableLink && <div className="mb-8">{tableLink}</div>}

      <div className="mb-12 space-y-6">
        {!readOnly && !user.isGuest && <ShareWithCoach profileId={profile.id} initialShared={profile.sharedWithCoach} />}
        <TalentUniqueEditor profileId={profile.id} talent={profile.talent} readOnly={readOnly} />
        {tableLink && !readOnly && (
          <Card className="space-y-3 border-accent/30 bg-blush/50">
            <h2 className="font-serif text-2xl italic">Étape suivante : ton tableau de décision</h2>
            <p className="text-[15px] text-ink-soft">
              Pose tes critères en lignes (ce qui compte pour toi, ce que tu veux éviter), ajoute tes opportunités professionnelles
              en colonnes, et vois le score se calculer en direct.
            </p>
            {tableLink}
          </Card>
        )}
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
