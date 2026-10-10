import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ButtonLink, PageTitle, formatDate } from "@/components/ui";
import { coachDashboard } from "@/data/repository";
import { estNiveau } from "@/domain/niveaux";
import { demandesM3Coach } from "@/features/vip/serveur";

import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.coach.titleCoach };
}

export default async function CoachPage() {
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const db = await supabaseServer();
  const [dashboard, demandes] = await Promise.all([coachDashboard(db), demandesM3Coach(db)]);
  const { t, locale } = await getI18n();
  const k = t.coach;
  const V = t.vip.codes;

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

      <section aria-labelledby="m3" className="mb-14 space-y-4">
        <div>
          <h2 id="m3" className="text-3xl italic">
            {V.m3.titre}
          </h2>
          <p className="max-w-2xl text-ink-soft">{V.m3.intro}</p>
        </div>
        {demandes.length === 0 ? (
          <p className="text-ink-soft">{V.m3.vide}</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {demandes.map((d) => (
              <li key={d.userId} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4">
                <span>
                  <Link href={`/coach/${d.userId}/`} className="font-serif text-xl italic text-ink hover:text-accent-deep hover:underline">
                    {d.prenom || d.email}
                  </Link>
                  <span className="block text-sm text-ink-soft">{d.email}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                  {estNiveau(d.niveau) && <Badge tone="accent">{V.niveaux[d.niveau]}</Badge>}
                  {V.m3.le(formatDate(d.le, false, locale))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="codes" className="space-y-4">
        <div>
          <h2 id="codes" className="text-3xl italic">
            {t.client.coach.titre}
          </h2>
          <p className="max-w-2xl text-ink-soft">{V.ouvrirTexte}</p>
        </div>
        <ButtonLink href="/coach/codes/">{V.ouvrir}</ButtonLink>
      </section>
    </>
  );
}
