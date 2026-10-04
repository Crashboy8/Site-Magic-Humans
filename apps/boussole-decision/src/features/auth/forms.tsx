"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button, Card, Field, Input, Notice, cx } from "@/components/ui";
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
          Créer mon compte
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
          Ton compte garde tout ton travail, sur tous tes appareils. Si Pierre t&apos;a donné un code d&apos;invitation, indique-le : il
          sera ton coach dans l&apos;outil.
        </p>
      </div>
      <form action={action} className="space-y-4" noValidate>
        <Field label="Code d'invitation (facultatif)" htmlFor="code" error={fe.code}>
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
        <p className="rounded-xl bg-sand/70 px-4 py-3 text-sm text-ink-soft">
          🔒 Tes boussoles sont privées. Rien n&apos;est visible par ton coach tant que tu ne choisis pas, profil par profil, de les
          partager avec lui. Tu peux retirer ce partage à tout moment.
        </p>
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

/** Les deux portes d'entrée de la page d'accueil. */
export function WelcomeChoices() {
  const [state, action, pending] = useActionState(startTrialAction, initial);
  return (
    <div className="grid gap-4">
      <Card className="space-y-3 border-accent/30 bg-blush/50">
        <h2 className="font-serif text-2xl italic">Essayer tout de suite</h2>
        <p className="text-[15px] text-ink-soft">
          Sans email, sans mot de passe : tu entres directement dans ton tableau de décision. Ton travail est gardé sur cet appareil, et tu
          pourras le sauvegarder ensuite avec ton email.
        </p>
        <form action={action}>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Préparation de ton espace…" : "Essayer tout de suite"}
          </Button>
        </form>
        {state.error && <Notice tone="error">{state.error}</Notice>}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-serif text-2xl italic">J&apos;ai déjà un compte, ou je veux en créer un</h2>
        <p className="text-[15px] text-ink-soft">Tout est sauvegardé avec ton email, et accessible depuis n&apos;importe quel appareil.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/connexion/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 bg-paper px-5 text-[15px] font-medium hover:bg-sand"
          >
            Me connecter
          </Link>
          <Link
            href="/inscription/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 bg-paper px-5 text-[15px] font-medium hover:bg-sand"
          >
            Créer mon compte
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function SaveGuestForm() {
  const [state, action, pending] = useActionState(saveGuestAction, initial);
  const fe = state.fieldErrors ?? {};
  if (state.message) return <Notice tone="success">{state.message}</Notice>;
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Prénom" htmlFor="first_name" error={fe.first_name}>
        <Input id="first_name" name="first_name" autoComplete="given-name" aria-invalid={Boolean(fe.first_name)} />
      </Field>
      <Field label="Email" htmlFor="email" error={fe.email} hint="Tu recevras un lien pour confirmer : ouvre-le sur cet appareil.">
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(fe.email)} />
      </Field>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Button type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Sauvegarder mon travail"}
      </Button>
    </form>
  );
}
