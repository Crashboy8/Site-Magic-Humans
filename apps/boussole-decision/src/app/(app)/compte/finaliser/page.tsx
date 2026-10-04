import type { Metadata } from "next";
import Link from "next/link";
import { Card, Notice, PageTitle } from "@/components/ui";
import { NewPasswordForm } from "@/features/auth/forms";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Compte créé" };

// Arrivée depuis l'email de confirmation d'un invité qui sauvegarde son travail.
export default async function FinalizeAccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageTitle eyebrow={user.firstName ? `Merci ${user.firstName} !` : "Merci !"} title="Ton travail est sauvegardé">
        Ton compte est créé avec l&apos;adresse {user.email || "indiquée"}. Tout ce que tu avais rempli pendant l&apos;essai est conservé.
      </PageTitle>
      <div className="grid max-w-lg gap-6">
        {user.isGuest && <Notice>La confirmation est en cours : recharge la page dans quelques secondes.</Notice>}
        <Card className="space-y-4">
          <h2 className="text-2xl italic">Choisir un mot de passe (facultatif)</h2>
          <p className="text-[15px] text-ink-soft">Sinon, tu pourras toujours te connecter avec un lien reçu par email.</p>
          <NewPasswordForm />
        </Card>
        <Link href="/" className="text-link underline underline-offset-4">
          Retrouver mes boussoles →
        </Link>
      </div>
    </>
  );
}
