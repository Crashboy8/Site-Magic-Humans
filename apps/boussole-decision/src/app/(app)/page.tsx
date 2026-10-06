import Link from "next/link";
import { Card, Notice, PageTitle } from "@/components/ui";
import { listProfiles, listVersionsForUser } from "@/data/repository";
import { CreateProfile } from "@/features/profiles/CreateProfile";
import { ProfileCard } from "@/features/profiles/ProfileCard";
import { PendingQuizImport } from "@/features/quiz/PendingQuizImport";
import { requireUser, supabaseServer } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/server";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const trialAdded = (await searchParams).essai === "ajoute";
  const { t } = await getI18n();
  const p = t.profile;
  const db = await supabaseServer();
  const [profiles, versions] = await Promise.all([listProfiles(db, user.id), listVersionsForUser(db, user.id)]);

  return (
    <>
      <PageTitle eyebrow={p.hello(user.firstName)} title={p.homeTitle}>
        {p.homeIntro}
      </PageTitle>      <PendingQuizImport />

      {trialAdded && (
        <div className="mb-8 max-w-2xl">
          <Notice tone="success">{t.auth.trialAdded}</Notice>
        </div>
      )}

      <section aria-labelledby="mes-profils" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="mes-profils" className="text-3xl italic">
            {p.myProfiles}
          </h2>
          {profiles.length > 0 && <CreateProfile />}
        </div>

        {profiles.length === 0 ? (
          <div className="max-w-2xl space-y-4">
            <p className="text-ink-soft">
              <span className="font-serif text-2xl italic text-ink">{p.startHere}</span> {p.startHereText}
            </p>
            <CreateProfile startOpen />
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <li key={p.id}>
                <ProfileCard profile={p} versions={versions.filter((v) => v.profileId === p.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="exemple" className="mt-14">
        <Card className="flex flex-col gap-3 border-dashed bg-sand/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="exemple" className="text-2xl italic">
              {p.exampleTitle}
            </h2>
            <p className="text-ink-soft">{p.exampleText}</p>
          </div>
          <Link
            href="/exemple/"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-ink/25 bg-paper px-5 text-[15px] font-medium hover:bg-sand"
          >
            {p.seeExample}
          </Link>
        </Card>
      </section>
    </>
  );
}
