"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";
import { checkInvitationCode } from "@/data/repository";
import { normalizeInvitationCode } from "@/domain/versions";

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function origin() {
  return (await headers()).get("origin") ?? undefined;
}

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Ton adresse email n'est pas encore confirmée : clique sur le lien reçu par email.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Un compte existe déjà avec cet email. Connecte-toi ou utilise « Mot de passe oublié ».";
  if (m.includes("password should be")) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Trop de tentatives en peu de temps. Patiente une minute puis réessaie.";
  if (m.includes("signups not allowed") || m.includes("user not found"))
    return "Aucun compte n'est associé à cet email. L'inscription se fait avec un code d'invitation.";
  if (m.includes("database error saving new user")) return "Ce code d'invitation n'est pas (ou plus) valable.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}

export async function signUpAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const firstName = text(fd, "first_name");
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const code = normalizeInvitationCode(text(fd, "code"));

  const fieldErrors: Record<string, string> = {};
  if (!code) fieldErrors.code = "Le code d'invitation est nécessaire pour créer ton compte.";
  if (!firstName) fieldErrors.first_name = "Indique ton prénom.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Cette adresse email ne semble pas valide.";
  if (password.length < 8) fieldErrors.password = "Au moins 8 caractères.";
  if (!fd.get("consent")) fieldErrors.consent = "Merci de cocher cette case pour continuer.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = await supabaseServer();
  if (!(await checkInvitationCode(supabase, code))) {
    return { fieldErrors: { code: "Ce code d'invitation n'est pas (ou plus) valable. Vérifie-le auprès de Pierre." } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { invitation_code: code, first_name: firstName },
      emailRedirectTo: absoluteUrl("/auth/callback/", await origin()),
    },
  });
  if (error) return { error: translateAuthError(error.message) };
  if (data.session) redirect("/");
  return {
    message: `Ton compte est créé. Un email de confirmation vient de partir vers ${email} : clique sur le lien qu'il contient pour commencer.`,
  };
}

export async function signInAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) return { error: "Indique ton email et ton mot de passe." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };
  redirect("/");
}

export async function magicLinkAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Cette adresse email ne semble pas valide." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: absoluteUrl("/auth/callback/", await origin()) },
  });
  if (error) return { error: translateAuthError(error.message) };
  return { message: `C'est parti ! Un lien de connexion vient d'être envoyé à ${email}. Il est valable une heure.` };
}

export async function resetPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Cette adresse email ne semble pas valide." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: absoluteUrl("/auth/callback/?next=/compte/mot-de-passe/", await origin()),
  });
  if (error) return { error: translateAuthError(error.message) };
  return { message: "Si un compte existe pour cette adresse, un email pour choisir un nouveau mot de passe vient de partir." };
}

export async function updatePasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { fieldErrors: { password: "Au moins 8 caractères." } };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message) };
  return { message: "Ton mot de passe est enregistré." };
}

export async function signOutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/connexion/");
}
