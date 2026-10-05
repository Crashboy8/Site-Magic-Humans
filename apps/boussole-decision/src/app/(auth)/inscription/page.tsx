import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { SignUpForm } from "@/features/auth/forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleSignUp };
}

export default async function SignUpPage({ searchParams }: PageProps<"/inscription">) {
  const { code } = await searchParams;
  return <SignUpForm initialCode={typeof code === "string" ? code : ""} />;
}
