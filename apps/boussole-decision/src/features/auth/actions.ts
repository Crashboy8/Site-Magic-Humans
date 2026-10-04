"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { absoluteUrl } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";
import { checkInvitationCode } from "@/data/repository";
import { claimPendingGuestTransfer, rememberGuestTransfer } from "@/lib/guestTransfer";
import { normalizeInvitationCode } from "@/domain/versions";

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  /** Sauvegarde d'un essai : l'adresse a déjà un compte, on propose de s'y connecter. */
  existingAccount?: boolean;
  email?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function origin() {
  return (await headers()).get("origin") ?? undefined;
}

function text(fd: FormData, key: string) {
  return String(fd.get(key) ?? "").trim();
}

/** Un invité qui se connecte à son compte garde son essai : on prépare le transfert avant de changer de session. */
async function keepGuestWork(supabase: Awaited<ReturnType<typeof supabaseServer>>) {
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.is_anonymous) return;
  const { data: token } = await supabase.rpc("create_guest_transfer");
  if (token) await rememberGuestTransfer(String(token));
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
    return "Aucun compte n'est associé à cet email. Crée ton compte, ou essaie l'outil directement.";
  if (m.includes("database error saving new user")) return "Ce code d'invitation n'est pas (ou plus) valable.";
  if (m.includes("anonymous sign-ins are disabled")) return "L'essai sans compte n'est pas encore activé. Crée ton compte pour commencer.";
  if (m.includes("already") && m.includes("email")) return "Cette adresse est déjà utilisée par un compte. Connecte-toi plutôt avec elle.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}

export async function signUpAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const firstName = text(fd, "first_name");
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const code = normalizeInvitationCode(text(fd, "code"));

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.first_name = "Indique ton prénom.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Cette adresse email ne semble pas valide.";
  if (password.length < 8) fieldErrors.password = "Au moins 8 caractères.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = await supabaseServer();
  if (code && !(await checkInvitationCode(supabase, code))) {
    return { fieldErrors: { code: "Ce code d'invitation n'est pas (ou plus) valable. Vérifie-le auprès de Pierre." } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { invitation_code: code || undefined, first_name: firstName },
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
  await keepGuestWork(supabase);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message) };
  const claimed = await claimPendingGuestTransfer(supabase);
  redirect(claimed > 0 ? "/?essai=ajoute" : "/");
}

export async function magicLinkAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const email = text(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Cette adresse email ne semble pas valide." };

  const supabase = await supabaseServer();
  await keepGuestWork(supabase);
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

/** « Essayer tout de suite » : session invitée, premier profil créé, ouverture directe du tableau. */
export async function startTrialAction(): Promise<AuthState> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) return { error: translateAuthError(error?.message ?? "") };

  const { data: profileId, error: profileError } = await supabase.rpc("create_profile", {
    p_name: "Mon premier essai",
    p_description: "",
  });
  if (profileError) redirect("/");
  const { data: version } = await supabase.from("versions").select("id").eq("profile_id", profileId).limit(1).maybeSingle();
  redirect(version ? `/versions/${version.id}/tableau/` : "/");
}

/** Un invité ajoute son email pour sauvegarder son travail : un lien de confirmation lui est envoyé. */
export async function saveGuestAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const firstName = text(fd, "first_name");
  const email = text(fd, "email").toLowerCase();
  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.first_name = "Indique ton prénom.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Cette adresse email ne semble pas valide.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: "Ta session d'essai a expiré. Recommence un essai ou crée ton compte." };

  await supabase.from("app_users").update({ first_name: firstName.slice(0, 60) }).eq("id", userId);
  const { error } = await supabase.auth.updateUser(
    { email, data: { first_name: firstName } },
    { emailRedirectTo: absoluteUrl("/auth/callback/?next=/compte/finaliser/", await origin()) },
  );
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already") || m.includes("exists") || m.includes("registered")) {
      return { existingAccount: true, email };
    }
    return { error: translateAuthError(error.message) };
  }
  return {
    message: `Presque fini ! Un email vient de partir vers ${email}. Ouvre-le sur cet appareil et clique sur le lien : ton travail sera alors sauvegardé sur ton compte.`,
  };
}
