import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { ButtonLink, Card, Notice } from "@/components/ui";
import { getAppUser, getProfile, listVersions } from "@/data/repository";
import { ProfileHeader } from "@/features/profiles/ProfileHeader";
import { CarteDuTalentLink } from "@/features/carte/CarteDuTalentLink";
import { ShareWithCoach } from "@/features/profiles/ShareWithCoach";
import { TalentUniqueEditor } from "@/features/profiles/TalentUniqueEditor";
import { VersionList } from "@/features/versions/VersionList";
import { requireUser, supabaseServer } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.profile.titleProfile };
}

export default async function ProfilePage({ params, searchParams }: PageProps<"/profils/[profileId]">) {
  const { profileId } = await params;
  const fromQuiz = (await searchParams).quiz === "1";
  const user = await requireUser();  const { t } = await getI18n();
  const p = t.profile;
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
      {readOnly ? p.viewTable : p.openTable}
    </ButtonLink>
  );

  return (
    <>
      <nav aria-label={p.breadcrumb} className="mb-6 text-sm text-ink-soft">
        <Link href={readOnly ? `/coach/${profile.userId}/` : "/"} className="hover:text-ink hover:underline">
          {readOnly ? p.breadcrumbCoachee(owner?.firstName || owner?.email || "") : p.breadcrumbMine}
        </Link>
      </nav>
      {readOnly && <ReadOnlyBanner ownerName={owner?.firstName || owner?.email || p.yourCoachee} />}      <ProfileHeader profile={profile} readOnly={readOnly} />
      {fromQuiz && !readOnly && (
        <div className="mb-6 max-w-3xl">
          <Notice tone="success">{t.quiz.added}</Notice>
        </div>
      )}
      {tableLink && <div className="mb-8">{tableLink}</div>}

      <div className="mb-12 space-y-6">
        {!readOnly && !user.isGuest && <ShareWithCoach profileId={profile.id} initialShared={profile.sharedWithCoach} />}
        <TalentUniqueEditor profileId={profile.id} talent={profile.talent} readOnly={readOnly} />
        {!readOnly && <CarteDuTalentLink />}
        {tableLink && !readOnly && (
          <Card className="space-y-3 border-accent/30 bg-blush/50">
            <h2 className="font-serif text-2xl italic">{p.nextStepTitle}</h2>
            <p className="text-[15px] text-ink-soft">{p.nextStepText}</p>
            {tableLink}
          </Card>
        )}
      </div>

      <section aria-labelledby="versions" className="space-y-4">
        <div>
          <h2 id="versions" className="text-3xl italic">
            {p.versionsTitle}
          </h2>
          <p className="max-w-2xl text-ink-soft">{p.versionsIntro}</p>
        </div>
        <VersionList profileId={profile.id} versions={versions} readOnly={readOnly} />
      </section>
    </>
  );
}
