"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui";
import { Icone } from "@/features/espace/Icones";
import { useI18n } from "@/i18n/client";
import { creerMotDePasseAction } from "./actions";

/** Encart replié de Mon espace : ajouter un mot de passe à un compte ouvert avec un lien par mail. Jamais obligatoire. */
export function MotDePasseFacultatif() {
  const [etat, action, envoi] = useActionState(creerMotDePasseAction, {});
  const M = useI18n().t.client.motDePasse;
  if (etat.ok) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-base text-ink">
        <Icone nom="coche" className="h-5 w-5 shrink-0 text-sage" />
        {M.ok}
      </p>
    );
  }
  return (
    <details className="group rounded-[14px] border border-line bg-cream" open={Boolean(etat.erreur)}>
      <summary className="flex min-h-12 cursor-pointer items-center gap-2 px-4 py-3 text-base font-medium text-ink">
        <Icone nom="cle" className="h-5 w-5 shrink-0 text-corail" />
        {M.titre}
        <Icone nom="fleche" className="ml-auto h-4 w-4 shrink-0 text-ink-soft transition-transform group-open:rotate-90" />
      </summary>
      <form action={action} className="space-y-3 px-4 pb-4" noValidate>
        <p className="text-base leading-relaxed text-ink-soft">{M.texte}</p>
        <Field label={M.champ} htmlFor="nouveau-mot-de-passe" hint={M.aide} error={etat.erreur}>
          <Input id="nouveau-mot-de-passe" name="mot_de_passe" type="password" autoComplete="new-password" minLength={8} aria-invalid={Boolean(etat.erreur)} />
        </Field>
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-5 text-base font-medium text-white disabled:opacity-60 sm:w-auto"
        >
          <Icone nom="cle" className="h-5 w-5 shrink-0" />
          {envoi ? M.envoi : M.bouton}
        </button>
      </form>
    </details>
  );
}
