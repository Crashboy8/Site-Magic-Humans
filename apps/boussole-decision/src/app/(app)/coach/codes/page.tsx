import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle } from "@/components/ui";
import { listFichesPreparees } from "@/data/fichesPreparees";
import { listCoachees, listInvitationCodes } from "@/data/repository";
import { InvitationCodes, type CodeUser } from "@/features/coach/InvitationCodes";
import { getI18n } from "@/i18n/server";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

/** Adresse publique du site (liens envoyés aux clients). */
function siteUrl(origin?: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || origin || "http://localhost:3000").replace(/\/$/, "");
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.vip.codes.meta };
}

/** coach/codes : Pierre crée un code, choisit le niveau et la durée, et dépose une fiche préparée. */
export default async function CoachCodesPage() {
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const db = await supabaseServer();
  const [coachees, codes, fiches] = await Promise.all([listCoachees(db, user.id), listInvitationCodes(db), listFichesPreparees(db)]);
  const origin = (await headers()).get("origin") ?? undefined;
  const { t } = await getI18n();

  const usersByCode: Record<string, CodeUser[]> = {};
  for (const c of coachees) {
    if (!c.invitationCode) continue;
    (usersByCode[c.invitationCode] ??= []).push({ firstName: c.firstName, email: c.email });
  }

  return (
    <>
      <p className="mb-4 text-[15px]">
        <Link href="/coach/" className="text-ink-soft hover:text-ink hover:underline">
          {t.vip.codes.retour}
        </Link>
      </p>
      <PageTitle eyebrow={t.coach.eyebrow} title={t.client.coach.titre}>
        {t.client.coach.intro}
      </PageTitle>
      <InvitationCodes coachId={user.id} codes={codes} usersByCode={usersByCode} siteUrl={siteUrl(origin)} fiches={fiches} />
    </>
  );
}
