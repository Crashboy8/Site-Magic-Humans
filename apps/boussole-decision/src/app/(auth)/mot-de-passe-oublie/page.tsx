import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { ResetPasswordForm } from "@/features/auth/forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.auth.titleForgot };
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
