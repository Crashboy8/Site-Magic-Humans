import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import Link from "next/link";
import { Card, Notice, PageTitle } from "@/components/ui";
import { NewPasswordForm } from "@/features/auth/forms";
import { listProfiles, listVersionsForUser } from "@/data/repository";
import { lienMesProfils, uniquementAmour } from "@/domain/editionAmour";
import { LoveChrome } from "@/features/amour/LoveChrome";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleAccountCreated };
}

// Arrivée depuis l'email de confirmation d'un invité qui sauvegarde son travail.
export default async function FinalizeAccountPage() {
  const user = await requireUser();
  const a = (await getI18n()).t.auth;
  const db = await supabaseServer();
  const [profiles, versions] = await Promise.all([listProfiles(db, user.id), listVersionsForUser(db, user.id)]);
  const amour = uniquementAmour(profiles);
  return (
    <>
      {amour && <LoveChrome />}
      <PageTitle eyebrow={a.thanks(user.firstName)} title={a.workSaved}>
        {a.accountCreatedWith(user.email)}
      </PageTitle>
      <div className="grid max-w-lg gap-6">
        {user.isGuest && <Notice>{a.confirmationPending}</Notice>}
        <Card className="space-y-4">
          <h2 className="text-2xl italic">{a.choosePasswordOptional}</h2>
          <p className="text-[15px] text-ink-soft">{a.orMagicLink}</p>
          <NewPasswordForm />
        </Card>
        <Link href={lienMesProfils(profiles, versions)} className="text-link underline underline-offset-4">
          {a.findMyCompasses}
        </Link>
      </div>
    </>
  );
}
