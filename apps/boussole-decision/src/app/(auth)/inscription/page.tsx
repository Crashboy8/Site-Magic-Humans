import type { Metadata } from "next";
import { SignUpForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Inscription" };

export default async function SignUpPage({ searchParams }: PageProps<"/inscription">) {
  const { code } = await searchParams;
  return <SignUpForm initialCode={typeof code === "string" ? code : ""} />;
}
