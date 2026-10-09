import type { Metadata } from "next";
import { ESPACE } from "@/content/espace";
import { getI18n } from "@/i18n/server";
import { SignUpForm } from "@/features/auth/forms";

function suiteDemandee(suite: string | string[] | undefined) {
  return typeof suite === "string" ? suite : undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/inscription">): Promise<Metadata> {
  const { suite } = await searchParams;
  const valeur = suiteDemandee(suite);
  if (valeur?.startsWith("/mon-espace")) return { title: ESPACE.connexion.titre };
  return { title: (await getI18n()).t.auth.titleSignUp };
}

export default async function SignUpPage({ searchParams }: PageProps<"/inscription">) {
  const { code, suite } = await searchParams;
  return <SignUpForm initialCode={typeof code === "string" ? code : ""} suite={suiteDemandee(suite)} />;
}
