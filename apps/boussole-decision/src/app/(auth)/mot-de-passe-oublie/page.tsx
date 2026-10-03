import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/forms";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
