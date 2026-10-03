"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, Card, Field, Input, Notice, cx } from "@/components/ui";
import {
  type AuthState,
  magicLinkAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "./actions";

const initial: AuthState = {};

export function SignInForm({ linkError }: { linkError?: boolean }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [pwState, pwAction, pwPending] = useActionState(signInAction, initial);
  const [mlState, mlAction, mlPending] = useActionState(magicLinkAction, initial);

  return (
    <Card className="space-y-6">
      <div>
        <h1 className="text-3xl italic">Te revoilà</h1>
        <p className="mt-1 text-ink-soft">Connecte-toi pour retrouver tes boussoles.</p>
      </div>

      {linkError && <Notice tone="error">Ce lien n&apos;est plus valable (il a peut-être déjà servi). Demande-en un nouveau.</Notice>}

      <div role="tablist" aria-label="Mode de connexion" className="grid grid-cols-2 rounded-full bg-sand p-1 text-sm">
        {(
          [
            ["password", "Mot de passe"],
            ["magic", "Lien par email"],
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
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Mot de passe" htmlFor="password">
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          {pwState.error && <Notice tone="error">{pwState.error}</Notice>}
          <Button type="submit" className="w-full" disabled={pwPending}>
            {pwPending ? "Connexion…" : "Me connecter"}
          </Button>
          <p className="text-center text-sm">
            <Link href="/mot-de-passe-oublie/" className="text-link underline underline-offset-4">
              Mot de passe oublié ?
            </Link>
          </p>
        </form>
      ) : (
        <form action={mlAction} className="space-y-4">
          <Field label="Email" htmlFor="ml-email" hint="Tu recevras un lien qui te connecte en un clic, sans mot de passe.">
            <Input id="ml-email" name="email" type="email" autoComplete="email" required />
          </Field>
          {mlState.error && <Notice tone="error">{mlState.error}</Notice>}
          {mlState.message && <Notice tone="success">{mlState.message}</Notice>}
          <Button type="submit" className="w-full" disabled={mlPending}>
            {mlPending ? "Envoi…" : "Recevoir mon lien de connexion"}
          </Button>
        </form>
      )}

      <p className="border-t border-line pt-5 text-center text-[15px] text-ink-soft">
        Pas encore de compte ?{" "}
        <Link href="/inscription/" className="font-medium text-link underline underline-offset-4">
          J&apos;ai un code d&apos;invitation
        </Link>
      </p>
    </Card>
  );
}

export function SignUpForm({ initialCode = "" }: { initialCode?: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const fe = state.fieldErrors ?? {};

  if (state.message) {
    return (
      <Card className="space-y-4 text-center">
        <h1 className="text-3xl italic">Bienvenue !</h1>
        <Notice tone="success">{state.message}</Notice>
        <p className="text-sm text-ink-soft">Pense à regarder dans tes courriers indésirables si tu ne le vois pas.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-6">
      <div>
        <h1 className="text-3xl italic">Créer mon espace</h1>
        <p className="mt-1 text-ink-soft">
          La Boussole est réservée aux personnes accompagnées par Pierre. Ton code d&apos;invitation t&apos;a été transmis en séance ou par
          message.
        </p>
      </div>
      <form action={action} className="space-y-4" noValidate>
        <Field label="Code d'invitation" htmlFor="code" error={fe.code}>
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
        <Field label="Prénom" htmlFor="first_name" error={fe.first_name}>
          <Input id="first_name" name="first_name" autoComplete="given-name" aria-invalid={Boolean(fe.first_name)} />
        </Field>
        <Field label="Email" htmlFor="email" error={fe.email}>
          <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(fe.email)} />
        </Field>
        <Field label="Mot de passe" htmlFor="password" hint="8 caractères minimum." error={fe.password}>
          <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(fe.password)} />
        </Field>
        <div className="space-y-1">
          <label className="flex items-start gap-3 text-[15px] leading-snug text-ink">
            <input type="checkbox" name="consent" className="mt-1 h-5 w-5 shrink-0 accent-[#b34716]" />
            <span>
              J&apos;ai compris que mes boussoles sont privées, mais que <strong className="font-medium">mon coach peut les consulter</strong>{" "}
              (en lecture seule) pour préparer nos séances.
            </span>
          </label>
          {fe.consent && (
            <p className="text-sm text-danger" role="alert">
              {fe.consent}
            </p>
          )}
        </div>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
      <p className="border-t border-line pt-5 text-center text-[15px] text-ink-soft">
        Déjà inscrit·e ?{" "}
        <Link href="/connexion/" className="font-medium text-link underline underline-offset-4">
          Me connecter
        </Link>
      </p>
    </Card>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <Card className="space-y-6">
      <div>
        <h1 className="text-3xl italic">Mot de passe oublié</h1>
        <p className="mt-1 text-ink-soft">Indique ton email : tu recevras un lien pour en choisir un nouveau.</p>
      </div>
      <form action={action} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {state.message && <Notice tone="success">{state.message}</Notice>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link href="/connexion/" className="text-link underline underline-offset-4">
          Retour à la connexion
        </Link>
      </p>
    </Card>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Field label="Nouveau mot de passe" htmlFor="password" hint="8 caractères minimum." error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.message && <Notice tone="success">{state.message}</Notice>}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </Button>
    </form>
  );
}
