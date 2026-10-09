import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { redirect } from "next/navigation";
import { Card, PageTitle } from "@/components/ui";
import { SaveGuestForm } from "@/features/auth/forms";
import { listProfiles } from "@/data/repository";
import { uniquementAmour } from "@/domain/editionAmour";
import { LoveChrome } from "@/features/amour/LoveChrome";
import { amourPour } from "@/content/amourLangue";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleSave };
}

export default async function SaveGuestPage({ searchParams }: PageProps<"/sauvegarder">) {
  const user = await requireUser();
  if (!user.isGuest) redirect("/compte/");
  const { t, locale } = await getI18n();
  const fromQuiz = (await searchParams).depuis === "quiz";
  const amour = uniquementAmour(await listProfiles(await supabaseServer(), user.id));
  return (
    <>
      {amour && <LoveChrome />}
      <PageTitle eyebrow={t.auth.trialEyebrow} title={t.auth.titleSave}>
        {t.auth.saveIntro}
      </PageTitle>
      {fromQuiz && (
        <p className="mb-5 max-w-lg rounded-2xl border border-eau/25 bg-eau-soft px-5 py-4 text-center text-[15px] leading-relaxed text-ink">
          {amourPour(locale).texts.saveFromQuiz}
        </p>
      )}
      <Card className="max-w-lg">
        <SaveGuestForm fromQuiz={fromQuiz} />
      </Card>
    </>
  );
}
