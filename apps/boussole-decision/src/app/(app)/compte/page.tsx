import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, PageTitle, formatDate } from "@/components/ui";
import { NewPasswordForm } from "@/features/auth/forms";
import { SupprimerCompte } from "@/features/fiche/SupprimerCompte";
import { requireUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleAccount };
}

export default async function AccountPage() {
  const user = await requireUser();
  if (user.isGuest) redirect("/sauvegarder/");
  const { t, locale } = await getI18n();
  const a = t.auth;
  return (
    <>
      <PageTitle title={a.titleAccount} />
      <div className="grid max-w-3xl gap-6">
        <Card className="space-y-2">
          <h2 className="text-2xl italic">{a.myInfo}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[15px]">
            <dt className="text-ink-soft">{a.firstName}</dt>
            <dd>{user.firstName || "—"}</dd>
            <dt className="text-ink-soft">{a.email}</dt>
            <dd>{user.email}</dd>
            <dt className="text-ink-soft">{a.registered}</dt>
            <dd>{formatDate(user.createdAt, false, locale)}</dd>
          </dl>
          {user.role === "coache" && <p className="pt-2 text-sm text-ink-soft">{a.coacheePrivacy}</p>}
        </Card>
        <Card className="space-y-4" id="mot-de-passe">
          <h2 className="text-2xl italic">{a.changePassword}</h2>
          <NewPasswordForm />
        </Card>
        {user.role !== "coach" && (
          <Card className="border-danger/30" id="supprimer">
            <SupprimerCompte />
          </Card>
        )}
        <p className="text-sm text-ink-soft">
          <Link href="/" className="hover:underline">
            {a.backToProfiles}
          </Link>
        </p>
      </div>
    </>
  );
}
