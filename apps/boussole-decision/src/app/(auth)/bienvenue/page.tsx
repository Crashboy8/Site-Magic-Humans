import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { WelcomeChoices } from "@/features/auth/forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleWelcome };
}

export default async function WelcomePage() {
  const { t } = await getI18n();
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl italic sm:text-4xl">{t.auth.welcomeHeading}</h1>
        <p className="text-ink-soft">{t.auth.welcomeText}</p>
      </div>
      <WelcomeChoices />
    </div>
  );
}
