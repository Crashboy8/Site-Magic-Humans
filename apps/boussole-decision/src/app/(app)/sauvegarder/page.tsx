import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { redirect } from "next/navigation";
import { Card, PageTitle } from "@/components/ui";
import { SaveGuestForm } from "@/features/auth/forms";
import { listProfiles } from "@/data/repository";
import { uniquementAmour } from "@/domain/editionAmour";
import { LoveChrome } from "@/features/amour/LoveChrome";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleSave };
}

export default async function SaveGuestPage() {
  const user = await requireUser();
  if (!user.isGuest) redirect("/compte/");
  const { t } = await getI18n();
  const amour = uniquementAmour(await listProfiles(await supabaseServer(), user.id));
  return (
    <>
      {amour && <LoveChrome />}
      <PageTitle eyebrow={t.auth.trialEyebrow} title={t.auth.titleSave}>
        {t.auth.saveIntro}
      </PageTitle>
      <Card className="max-w-lg">
        <SaveGuestForm />
      </Card>
    </>
  );
}
