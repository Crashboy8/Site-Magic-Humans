import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/ui";
import { getAppUser, listProfilesOf, listVersionsForUser } from "@/data/repository";
import { ProfileCard } from "@/features/profiles/ProfileCard";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.coach.titleCoachee };
}

export default async function CoacheePage({ params }: PageProps<"/coach/[userId]">) {
  const { userId } = await params;
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const db = await supabaseServer();
  const coachee = await getAppUser(db, userId).catch(() => null);
  if (!coachee || coachee.coachId !== user.id) notFound();
  const { t } = await getI18n();
  const k = t.coach;
  const [profiles, versions] = await Promise.all([listProfilesOf(db, [userId]), listVersionsForUser(db, userId)]);

  return (
    <>
      <nav aria-label={t.profile.breadcrumb} className="mb-6 text-sm text-ink-soft">
        <Link href="/coach/" className="hover:text-ink hover:underline">
          {k.backToCoach}
        </Link>
      </nav>
      <PageTitle eyebrow={k.coacheeEyebrow} title={coachee.firstName || coachee.email}>
        {coachee.email}
      </PageTitle>
      {profiles.length === 0 ? (
        <p className="max-w-xl text-ink-soft">{k.noSharedProfile(coachee.firstName)}</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <li key={p.id}>
              <ProfileCard profile={p} versions={versions.filter((v) => v.profileId === p.id)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
