import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { Card, PageTitle } from "@/components/ui";
import { NewPasswordForm } from "@/features/auth/forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleNewPassword };
}

// Page d'arrivée du lien « Mot de passe oublié ».
export default async function NewPasswordPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageTitle title={t.auth.chooseNewPassword} />
      <Card className="max-w-lg">
        <NewPasswordForm />
      </Card>
    </>
  );
}
