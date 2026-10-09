import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PageTitle, formatDate } from "@/components/ui";
import { coachDashboard, listCoachees, listInvitationCodes } from "@/data/repository";
import { InvitationCodes, type CodeUser } from "@/features/coach/InvitationCodes";

import { requireUser, supabaseServer } from "@/lib/supabase/server";

/** Adresse publique du site (liens envoyés aux clients). */
function siteUrl(origin?: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || origin || "http://localhost:3000").replace(/\/$/, "");
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.coach.titleCoach };
}

export default async function CoachPage() {
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const db = await supabaseServer();
  const [dashboard, coachees, codes] = await Promise.all([coachDashboard(db), listCoachees(db, user.id), listInvitationCodes(db)]);
  const origin = (await headers()).get("origin") ?? undefined;
  const { t, locale } = await getI18n();
  const k = t.coach;

  const usersByCode: Record<string, CodeUser[]> = {};
  for (const c of coachees) {
    if (!c.invitationCode) continue;
    (usersByCode[c.invitationCode] ??= []).push({ firstName: c.firstName, email: c.email });
  }

  return (
    <>
      <PageTitle eyebrow={k.eyebrow} title={k.title}>
        {k.intro}
      </PageTitle>

      <section aria-labelledby="coaches" className="mb-14 space-y-4">
        <h2 id="coaches" className="sr-only">
          {k.coachees}
        </h2>
        {dashboard.length === 0 ? (
          <p className="text-ink-soft">{k.nobodyYet}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-paper" tabIndex={0} role="region" aria-labelledby="coaches">
            <table className="w-full min-w-[560px] text-left text-[15px]">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {k.colCoachee}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {k.colLastActivity}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {k.colShared}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {dashboard.map((c) => (
                  <tr key={c.id} className="hover:bg-cream">
                    <td className="px-5 py-4">
                      <Link href={`/coach/${c.id}/`} className="font-serif text-xl italic text-ink hover:text-accent-deep hover:underline">
                        {c.firstName || c.email}
                      </Link>
                      <p className="text-sm text-ink-soft">{c.email}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{formatDate(c.lastActivityAt, false, locale)}</td>
                    <td className="px-5 py-4">
                      {c.sharedProfiles > 0 ? (
                        <Badge tone="sage">{k.sharedProfiles(c.sharedProfiles)}</Badge>
                      ) : (
                        <Badge>{k.nothingShared}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="codes" className="space-y-4">
        <div>
          <h2 id="codes" className="text-3xl italic">
            {t.client.coach.titre}
          </h2>
          <p className="max-w-2xl text-ink-soft">{t.client.coach.intro}</p>
        </div>
        <InvitationCodes coachId={user.id} codes={codes} usersByCode={usersByCode} siteUrl={siteUrl(origin)} />
      </section>
    </>
  );
}
