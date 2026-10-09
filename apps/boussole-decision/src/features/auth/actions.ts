"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ACCUEIL_CONNECTE, absoluteUrl, suiteSure } from "@/lib/config";
import { supabaseServer } from "@/lib/supabase/server";
import { checkInvitationCode } from "@/data/repository";
import { claimPendingGuestTransfer, rememberGuestTransfer } from "@/lib/guestTransfer";
import { normalizeInvitationCode } from "@/domain/versions";
import { getI18n } from "@/i18n/server";
import type { Messages } from "@/i18n/messages";

type AuthErrors = Messages["auth"]["errors"];

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

/** Où aller après une connexion. La règle « essai ajouté » reste prioritaire. */
function pageApresConnexion(fd: FormData, claimed = 0): string {
  if (claimed > 0) return "/?essai=ajoute";
  return suiteSure(fd.get("suite")) ?? ACCUEIL_CONNECTE;
}

function lienCallback(fd: FormData, origine?: string): string {
  const suite = suiteSure(fd.get("suite")) ?? ACCUEIL_CONNECTE;
  return absoluteUrl(`/auth/callback/?next=${encodeURIComponent(suite)}`, origine);
}

/** Un invité qui se connecte à son compte garde son essai : on prépare le transfert avant de changer de session. */
async function keepGuestWork(supabase: Awaited<ReturnType<typeof supabaseServer>>) {
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.is_anonymous) return;
  const { data: token } = await supabase.rpc("create_guest_transfer");
  if (token) await rememberGuestTransfer(String(token));
}

function translateAuthError(message: string, e: AuthErrors): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return e.invalidCredentials;
  if (m.includes("email not confirmed")) return e.emailNotConfirmed;
  if (m.includes("already registered") || m.includes("already been registered")) return e.alreadyRegistered;
  if (m.includes("password should be")) return e.passwordTooShort;
  if (m.includes("rate limit") || m.includes("security purposes")) return e.rateLimit;
  if (m.includes("signups not allowed") || m.includes("user not found")) return e.noAccount;
  if (m.includes("database error saving new user")) return e.badInviteCode;
  if (m.includes("anonymous sign-ins are disabled")) return e.trialDisabled;
  if (m.includes("already") && m.includes("email")) return e.emailInUse;
  return e.generic;
}

export async function signUpAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const e = t.auth.errors;
  const firstName = text(fd, "first_name");
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const code = normalizeInvitationCode(text(fd, "code"));

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.first_name = e.firstNameRequired;
  if (!EMAIL_RE.test(email)) fieldErrors.email = e.emailInvalid;
  if (password.length < 8) fieldErrors.password = e.min8;
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = await supabaseServer();
  if (code && !(await checkInvitationCode(supabase, code))) {
    return { fieldErrors: { code: e.inviteCodeCheck } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // lang : langue des emails d'authentification (modèles de supabase/templates/).
      data: { invitation_code: code || undefined, first_name: firstName, lang: locale },
      emailRedirectTo: lienCallback(fd, await origin()),
    },
  });
  if (error) return { error: translateAuthError(error.message, e) };
  if (data.session) redirect(pageApresConnexion(fd));
  return {
    message: t.auth.messages.accountCreated(email),
  };
}

export async function signInAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const e = t.auth.errors;
  const email = text(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!EMAIL_RE.test(email) || !password) return { error: e.emailAndPassword };

  const supabase = await supabaseServer();
  await keepGuestWork(supabase);
  const { data: signedIn, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateAuthError(error.message, e) };
  if (signedIn.user?.user_metadata?.lang !== locale) await supabase.auth.updateUser({ data: { lang: locale } });
  const claimed = await claimPendingGuestTransfer(supabase);
  redirect(pageApresConnexion(fd, claimed));
}

export async function magicLinkAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const e = t.auth.errors;
  const email = text(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: e.emailInvalid };

  const supabase = await supabaseServer();
  await keepGuestWork(supabase);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: lienCallback(fd, await origin()) },
  });
  if (error) return { error: translateAuthError(error.message, e) };
  return { message: t.auth.messages.magicLinkSent(email) };
}

export async function resetPasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const e = t.auth.errors;
  const email = text(fd, "email").toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: e.emailInvalid };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: absoluteUrl("/auth/callback/?next=/compte/mot-de-passe/", await origin()),
  });
  if (error) return { error: translateAuthError(error.message, e) };
  return { message: t.auth.messages.resetSent };
}

export async function updatePasswordAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const e = t.auth.errors;
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { fieldErrors: { password: e.min8 } };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translateAuthError(error.message, e) };
  return { message: t.auth.messages.passwordSaved };
}

export async function signOutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/connexion/");
}

/** « Essayer tout de suite » : session invitée, premier profil créé, ouverture directe du tableau. */
export async function startTrialAction(): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const e = t.auth.errors;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInAnonymously({ options: { data: { lang: locale } } });
  if (error || !data.user) return { error: translateAuthError(error?.message ?? "", e) };

  const { data: profileId, error: profileError } = await supabase.rpc("create_profile", {
    p_name: t.auth.firstTrialProfile,
    p_description: "",
  });
  if (profileError) redirect("/");
  // La base nomme la première version « Brouillon » ; dans une autre langue, on la renomme.
  if (t.profile.firstVersionName !== "Brouillon") {
    await supabase.from("versions").update({ name: t.profile.firstVersionName }).eq("profile_id", profileId);
  }
  const { data: version } = await supabase.from("versions").select("id").eq("profile_id", profileId).limit(1).maybeSingle();
  redirect(version ? `/versions/${version.id}/tableau/` : "/");
}

/** Un invité ajoute son email pour sauvegarder son travail : un lien de confirmation lui est envoyé. */
export async function saveGuestAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const { locale, t } = await getI18n();
  const e = t.auth.errors;
  const firstName = text(fd, "first_name");
  const email = text(fd, "email").toLowerCase();
  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.first_name = e.firstNameRequired;
  if (!EMAIL_RE.test(email)) fieldErrors.email = e.emailInvalid;
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = await supabaseServer();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return { error: e.trialExpired };

  await supabase
    .from("app_users")
    .update({ first_name: firstName.slice(0, 60) })
    .eq("id", userId);
  const { error } = await supabase.auth.updateUser(
    { email, data: { first_name: firstName, lang: locale } },
    { emailRedirectTo: absoluteUrl("/auth/callback/?next=/compte/finaliser/", await origin()) },
  );
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already") || m.includes("exists") || m.includes("registered")) {
      return { existingAccount: true, email };
    }
    return { error: translateAuthError(error.message, e) };
  }
  return {
    message: t.auth.messages.almostDone(email),
  };
}
