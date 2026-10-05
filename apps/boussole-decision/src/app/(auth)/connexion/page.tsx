import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { SignInForm } from "@/features/auth/forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleSignIn };
}

export default async function SignInPage({ searchParams }: PageProps<"/connexion">) {
  const { erreur } = await searchParams;
  return <SignInForm linkError={erreur === "lien"} />;
}
