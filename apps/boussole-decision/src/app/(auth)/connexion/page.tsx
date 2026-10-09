import type { Metadata } from "next";
import { ESPACE } from "@/content/espace";
import { getI18n } from "@/i18n/server";
import { SignInForm } from "@/features/auth/forms";

function suiteDemandee(suite: string | string[] | undefined) {
  return typeof suite === "string" ? suite : undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/connexion">): Promise<Metadata> {
  const { suite } = await searchParams;
  const valeur = suiteDemandee(suite);
  if (valeur?.startsWith("/mon-espace")) return { title: ESPACE.connexion.titre };
  return { title: (await getI18n()).t.auth.titleSignIn };
}

export default async function SignInPage({ searchParams }: PageProps<"/connexion">) {
  const { erreur, suite } = await searchParams;
  return <SignInForm linkError={erreur === "lien"} suite={suiteDemandee(suite)} />;
}
