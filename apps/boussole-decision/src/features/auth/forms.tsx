"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Button, Card, Field, Input, Notice, cx } from "@/components/ui";
import { ESPACE } from "@/content/espace";
import { useI18n } from "@/i18n/client";
import {
  type AuthState,
  magicLinkAction,
  saveGuestAction,
  startTrialAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "./actions";

const initial: AuthState = {};

function avecSuite(chemin: string, suite?: string) {
  return suite ? `${chemin}?suite=${encodeURIComponent(suite)}` : chemin;
}

function ChampSuite({ suite }: { suite?: string }) {
  if (!suite) return null;
  return <input type="hidden" name="suite" value={suite} />;
}

function varianteEspace(suite?: string) {
  return Boolean(suite?.startsWith("/mon-espace"));
}

export function SignInForm({ linkError, suite }: { linkError?: boolean; suite?: string }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction, pwPending] = useActionState(signInAction, initial);
  const [mlState, mlAction, mlPending] = useActionState(magicLinkAction, initial);
  const t = useI18n().t.auth;
  const espace = varianteEspace(suite);

  return (
    <Card className="space-y-6">
      <div>
        <h1 className="text-3xl italic">{espace ? ESPACE.connexion.titre : t.welcomeBack}</h1>
        <p className="mt-1 text-ink-soft">{espace ? ESPACE.connexion.texte : t.signInIntro}</p>
      </div>

      {linkError && <Notice tone="error">{t.linkInvalid}</Notice>}

      <div role="tablist" aria-label={t.signInMode} className="grid grid-cols-2 rounded-full bg-sand p-1 text-sm">
        {(
          [
            ["password", t.modePassword],
            ["magic", t.modeMagic],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={cx("min-h-10 rounded-full px-3 font-medium", mode === key ? "bg-paper text-ink shadow-sm" : "text-ink-soft")}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "password" ? (
        <form action={pwAction} className="space-y-4">
          <ChampSuite suite={suite} />
          <Field label={t.email} htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label={t.password} htmlFor="password">
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          {pwState.error && <Notice tone="error">{pwState.error}</Notice>}
          <Button type="submit" className="w-full" disabled={pwPending}>
            {pwPending ? t.signingIn : t.signIn}
          </Button>
          <p className="text-center text-sm">
            <Link href="/mot-de-passe-oublie/" className="text-link underline underline-offset-4">
              {t.forgotPassword}
            </Link>
          </p>
        </form>
      ) : (
        <form action={mlAction} className="space-y-4">
          <ChampSuite suite={suite} />
          <Field label={t.email} htmlFor="ml-email" hint={t.magicHint}>
            <Input id="ml-email" name="email" type="email" autoComplete="email" required />
          </Field>
          {mlState.error && <Notice tone="error">{mlState.error}</Notice>}
          {mlState.message && <Notice tone="success">{mlState.message}</Notice>}
          <Button type="submit" className="w-full" disabled={mlPending}>
            {mlPending ? t.sending : t.sendMagicLink}
          </Button>
        </form>
      )}

      <p className="border-t border-line pt-5 text-center text-[15px] text-ink-soft">
        {t.noAccountYet}{" "}
        <Link href={avecSuite("/inscription/", suite)} className="font-medium text-link underline underline-offset-4">
          {espace ? ESPACE.connexion.creer : t.createAccount}
        </Link>
      </p>
    </Card>
  );
}

export function SignUpForm({ initialCode = "", suite }: { initialCode?: string; suite?: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const fe = state.fieldErrors ?? {};
  const t = useI18n().t.auth;
  const espace = varianteEspace(suite);

  if (state.message) {
    return (
      <Card className="space-y-4 text-center">
        <h1 className="text-3xl italic">{t.signUpDone}</h1>
        <Notice tone="success">{state.message}</Notice>
        <p className="text-sm text-ink-soft">{t.checkSpam}</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <div>
        <h1 className="text-3xl italic">{espace ? ESPACE.connexion.titre : t.signUpTitle}</h1>
        <p className="mt-1 text-ink-soft">{espace ? ESPACE.connexion.texte : t.signUpIntro}</p>
      </div>
      <form action={action} className="space-y-4" noValidate>
        <ChampSuite suite={suite} />
        <Field label={t.inviteCode} htmlFor="code" error={fe.code}>
          <Input
            id="code"
            name="code"
            defaultValue={initialCode}
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="BOUSSOLE-XXXX-XXXX"
            aria-invalid={Boolean(fe.code)}
            className="font-mono tracking-wider uppercase"
          />
        </Field>
        <Field label={t.firstName} htmlFor="first_name" error={fe.first_name}>
          <Input id="first_name" name="first_name" autoComplete="given-name" aria-invalid={Boolean(fe.first_name)} />
        </Field>
        <Field label={t.email} htmlFor="email" error={fe.email}>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(fe.email)} />
        </Field>
        <Field label={t.password} htmlFor="password" hint={t.passwordHint} error={fe.password}>
          <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(fe.password)} />
        </Field>
        <p className="rounded-xl bg-sand/70 px-4 py-3 text-sm text-ink-soft">{t.privacyNote}</p>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t.creating : t.createAccount}
        </Button>
      </form>
      <p className="border-t border-line pt-5 text-center text-[15px] text-ink-soft">
        {t.alreadyRegistered}{" "}
        <Link href={avecSuite("/connexion/", suite)} className="font-medium text-link underline underline-offset-4">
          {espace ? ESPACE.connexion.connecter : t.signIn}
        </Link>
      </p>
    </Card>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  const t = useI18n().t.auth;
  return (
    <Card className="space-y-6">
      <div>
        <h1 className="text-3xl italic">{t.titleForgot}</h1>
        <p className="mt-1 text-ink-soft">{t.forgotIntro}</p>
      </div>
      <form action={action} className="space-y-4">
        <Field label={t.email} htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {state.message && <Notice tone="success">{state.message}</Notice>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t.sending : t.sendLink}
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link href="/connexion/" className="text-link underline underline-offset-4">
          {t.backToSignIn}
        </Link>
      </p>
    </Card>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  const t = useI18n().t.auth;
  return (
    <form action={action} className="space-y-4">
      <Field label={t.newPassword} htmlFor="password" hint={t.passwordHint} error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.message && <Notice tone="success">{state.message}</Notice>}
      <Button type="submit" disabled={pending}>
        {pending ? t.savingPassword : t.savePassword}
      </Button>
    </form>
  );
}

/** Bouton « Essayer tout de suite » : session invitée et ouverture directe du tableau. */
export function TrialButton({ label, className }: { label?: string; className?: string }) {
  const [state, action, pending] = useActionState(startTrialAction, initial);
  const t = useI18n().t.auth;
  return (
    <form action={action} className={cx("space-y-2", className)}>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.tryNowPending : (label ?? t.tryNowButton)}
      </Button>
      {state.error && <Notice tone="error">{state.error}</Notice>}
    </form>
  );
}

/** Les deux portes d'entrée de la page d'accueil. */
export function WelcomeChoices() {
  const t = useI18n().t.auth;
  return (
    <div className="grid gap-4">
      <Card className="space-y-3 border-accent/30 bg-blush/50">
        <h2 className="font-serif text-2xl italic">{t.tryNowTitle}</h2>
        <p className="text-[15px] text-ink-soft">{t.tryNowText}</p>
        <TrialButton />
        <Link
          href="/exemple/"
          className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/40 bg-paper px-5 text-[15px] font-medium text-accent-deep hover:bg-blush"
        >
          {t.seeExample}
        </Link>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-serif text-2xl italic">{t.accountTitle}</h2>
        <p className="text-[15px] text-ink-soft">{t.accountText}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/connexion/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 bg-paper px-5 text-[15px] font-medium hover:bg-sand"
          >
            {t.signIn}
          </Link>
          <Link
            href="/inscription/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 bg-paper px-5 text-[15px] font-medium hover:bg-sand"
          >
            {t.createAccount}
          </Link>
        </div>
      </Card>
    </div>
  );
}

/** Prénom et adresse saisis dans le bloc « Sauvegarder mes résultats » du Quiz Amour (même onglet). */
export const QUIZ_SAVE_KEY = "mh_sauver";

export function SaveGuestForm({ fromQuiz = false }: { fromQuiz?: boolean }) {
  const [state, action, pending] = useActionState(saveGuestAction, initial);
  const [hasAccount, setHasAccount] = useState(false);
  const [prefill, setPrefill] = useState<{ email: string; prenom: string } | null>(null);
  useEffect(() => {
    if (!fromQuiz) return;
    let saved: { email?: unknown; prenom?: unknown } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(QUIZ_SAVE_KEY) ?? "null");
    } catch {
      saved = null;
    }
    if (!saved) return;
    const value = {
      email: typeof saved.email === "string" ? saved.email.slice(0, 200) : "",
      prenom: typeof saved.prenom === "string" ? saved.prenom.slice(0, 60) : "",
    };
    const id = window.setTimeout(() => setPrefill(value), 0);
    return () => window.clearTimeout(id);
  }, [fromQuiz]);
  const fe = state.fieldErrors ?? {};
  const t = useI18n().t.auth;
  if (state.message) return <Notice tone="success">{state.message}</Notice>;
  if (state.existingAccount && state.email) return <ExistingAccountSignIn email={state.email} />;
  if (hasAccount) return <ExistingAccountSignIn onBack={() => setHasAccount(false)} />;
  return (
    <div className="space-y-5">
      <form action={action} className="space-y-4" noValidate key={prefill ? "quiz" : "vide"}>
        <Field label={t.firstName} htmlFor="first_name" error={fe.first_name}>
          <Input id="first_name" name="first_name" autoComplete="given-name" defaultValue={prefill?.prenom} aria-invalid={Boolean(fe.first_name)} />
        </Field>
        <Field label={t.email} htmlFor="email" error={fe.email} hint={t.saveEmailHint}>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={prefill?.email} aria-invalid={Boolean(fe.email)} />
        </Field>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        <Button type="submit" disabled={pending}>
          {pending ? t.sending : t.saveButton}
        </Button>
      </form>
      <div className="space-y-2 border-t border-line pt-5">
        <p className="text-sm text-ink-soft">{t.haveAccountQuestion}</p>
        <Button type="button" variant="secondary" className="w-full" onClick={() => setHasAccount(true)}>
          {t.signInToAccount}
        </Button>
      </div>
    </div>
  );
}

/** L'adresse de l'invité a déjà un compte : il s'y connecte, et son essai y est ajouté. */
function ExistingAccountSignIn({ email, onBack }: { email?: string; onBack?: () => void }) {
  const [pwState, pwAction, pwPending] = useActionState(signInAction, initial);
  const [mlState, mlAction, mlPending] = useActionState(magicLinkAction, initial);
  const [typedEmail, setTypedEmail] = useState("");
  const t = useI18n().t.auth;
  return (
    <div className="space-y-5">
      {email ? (
        <Notice tone="info">
          {t.existingAccount} <strong>{email}</strong>
          {t.existingAccountEnd}
        </Notice>
      ) : (
        <p className="text-[15px] text-ink-soft">{t.signInToAdd}</p>
      )}
      <form action={pwAction} className="space-y-4">
        {email ? (
          <input type="hidden" name="email" value={email} />
        ) : (
          <Field label={t.email} htmlFor="existing-email">
            <Input
              id="existing-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={typedEmail}
              onChange={(e) => setTypedEmail(e.target.value)}
            />
          </Field>
        )}
        <Field label={t.password} htmlFor="existing-password">
          <Input
            id="existing-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus={Boolean(email)}
          />
        </Field>
        {pwState.error && <Notice tone="error">{pwState.error}</Notice>}
        <Button type="submit" className="w-full" disabled={pwPending}>
          {pwPending ? t.signingIn : t.signInToAccount}
        </Button>
      </form>
      <form action={mlAction} className="space-y-3 border-t border-line pt-5">
        <input type="hidden" name="email" value={email ?? typedEmail} />
        <p className="text-sm text-ink-soft">{t.noPasswordHint}</p>
        {mlState.error && <Notice tone="error">{mlState.error}</Notice>}
        {mlState.message ? (
          <Notice tone="success">
            {mlState.message} {t.openOnThisDevice}
          </Notice>
        ) : (
          <Button type="submit" variant="secondary" className="w-full" disabled={mlPending}>
            {mlPending ? t.sending : t.receiveLoginLink}
          </Button>
        )}
      </form>
      {onBack && (
        <p className="text-center text-sm">
          <button type="button" onClick={onBack} className="text-link underline underline-offset-4">
            {t.noAccountYetLink}
          </button>
        </p>
      )}
    </div>
  );
}
