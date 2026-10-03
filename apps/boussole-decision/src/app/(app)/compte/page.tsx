import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageTitle, formatDate } from "@/components/ui";
import { NewPasswordForm } from "@/features/auth/forms";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle title="Mon compte" />
      <div className="grid max-w-3xl gap-6">
        <Card className="space-y-2">
          <h2 className="text-2xl italic">Mes informations</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[15px]">
            <dt className="text-ink-soft">Prénom</dt>
            <dd>{user.firstName || "—"}</dd>
            <dt className="text-ink-soft">Email</dt>
            <dd>{user.email}</dd>
            <dt className="text-ink-soft">Inscription</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </dl>
          {user.role === "coache" && (
            <p className="pt-2 text-sm text-ink-soft">Tes boussoles sont privées. Ton coach ne voit que les profils que tu choisis de partager avec lui, en lecture seule, et tu peux retirer ce partage à tout moment.</p>
          )}
        </Card>
        <Card className="space-y-4" id="mot-de-passe">
          <h2 className="text-2xl italic">Changer de mot de passe</h2>
          <NewPasswordForm />
        </Card>
        <p className="text-sm text-ink-soft">
          <Link href="/" className="hover:underline">
            ← Retour à mes profils
          </Link>
        </p>
      </div>
    </>
  );
}
