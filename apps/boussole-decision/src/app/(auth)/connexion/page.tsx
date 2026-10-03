import type { Metadata } from "next";
import { SignInForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Connexion" };

export default async function SignInPage({ searchParams }: PageProps<"/connexion">) {
  const { erreur } = await searchParams;
  return <SignInForm linkError={erreur === "lien"} />;
}
