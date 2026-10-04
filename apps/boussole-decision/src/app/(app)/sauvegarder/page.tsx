import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, PageTitle } from "@/components/ui";
import { SaveGuestForm } from "@/features/auth/forms";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sauvegarder mon travail" };

export default async function SaveGuestPage() {
  const user = await requireUser();
  if (!user.isGuest) redirect("/compte/");
  return (
    <>
      <PageTitle eyebrow="Mode essai" title="Sauvegarder mon travail">
        Ajoute ton email : tout ce que tu as rempli est conservé et rattaché à ton compte. Tu pourras le retrouver depuis n&apos;importe quel
        appareil et, si tu le souhaites, le partager avec ton coach.
      </PageTitle>
      <Card className="max-w-lg">
        <SaveGuestForm />
      </Card>
    </>
  );
}
