import type { Metadata } from "next";
import { Card, PageTitle } from "@/components/ui";
import { NewPasswordForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

// Page d'arrivée du lien « Mot de passe oublié ».
export default function NewPasswordPage() {
  return (
    <>
      <PageTitle title="Choisis un nouveau mot de passe" />
      <Card className="max-w-lg">
        <NewPasswordForm />
      </Card>
    </>
  );
}
