"use client";

import { startTransition, useActionState, useState } from "react";
import { Field, Input } from "@/components/ui";
import { Icone } from "@/features/espace/Icones";
import { useI18n } from "@/i18n/client";
import { activerAction, changerDeCompteAction, rejoindreAction, type EtatRejoindre } from "./actions";
import { Etapes } from "./Etapes";

const initial: EtatRejoindre = {};
const CORAIL = "#B34716";

function BoutonPlein({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-medium text-white disabled:opacity-60"
      style={{ background: CORAIL }}
    >
      {children}
    </button>
  );
}

function Carte({ children }: { children: React.ReactNode }) {
  return <section className="space-y-5 rounded-[18px] border border-line bg-paper p-5 shadow-[0_2px_14px_rgba(58,47,36,0.06)]">{children}</section>;
}

function EtapesClient({ active }: { active: 1 | 2 | 3 }) {
  const E = useI18n().t.client.etapes;
  return <Etapes active={active} libelles={E.liste} aria={E.aria} sur={E.sur(active)} />;
}

/** Le code reconnu, en pastille verte sur une ligne, avec « Changer ». */
function CodeReconnu({ code, onChanger }: { code: string; onChanger: () => void }) {
  const R = useI18n().t.client.rejoindre;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-sage/30 bg-sage-soft px-3.5 py-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage text-white" aria-hidden="true">
        <Icone nom="coche" className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[15px] font-medium text-ink">{R.codeReconnu}</span>
        <span className="block truncate font-mono text-sm tracking-wider text-sage">{code}</span>
      </span>
      <button type="button" onClick={onChanger} className="min-h-11 shrink-0 px-1 text-[15px] font-medium text-link underline underline-offset-4">
        {R.codeChanger}
      </button>
    </div>
  );
}

/** Écran 1 (et 2, une fois le lien envoyé) : prénom + email, le code est déjà là. */
export function RejoindreForm({ code, codeOk, lienExpire = false }: { code: string; codeOk: boolean; lienExpire?: boolean }) {
  const [etat, action, envoi] = useActionState(rejoindreAction, initial);
  const [changerCode, setChangerCode] = useState(!codeOk);
  const [modifier, setModifier] = useState(false);
  const [dernier, setDernier] = useState<[string, string][]>([]);
  const [motDePasseVoulu, setMotDePasseVoulu] = useState(false);
  const C = useI18n().t.client;
  const R = C.rejoindre;
  const champs = etat.champs ?? {};
  const champCode = changerCode || Boolean(champs.code);
  const avecMotDePasse = motDePasseVoulu;
  // Après une erreur, React vide le formulaire : on remet le prénom et l'email déjà tapés (jamais le mot de passe).
  const deja = (cle: string) => dernier.find(([k]) => k === cle)?.[1] ?? "";

  if (etat.envoye && !modifier) {
    return <MailEnvoye email={etat.envoye} dernier={dernier} action={action} envoi={envoi} onModifier={() => setModifier(true)} />;
  }

  return (
    <div className="space-y-5">
      <EtapesClient active={1} />
      {lienExpire && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-miel/30 bg-miel-soft px-4 py-3 text-base text-ink">
          <Icone nom="horloge" className="mt-0.5 h-5 w-5 shrink-0 text-miel" />
          {R.lienExpire}
        </p>
      )}
      <Carte>
        <header className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide" style={{ color: CORAIL }}>
            <Icone nom="cle" className="h-4 w-4 shrink-0" />
            {R.surtitre}
          </p>
          <h1 className="font-serif text-[30px] italic leading-tight">{R.titre}</h1>
          <p className="text-base leading-relaxed text-ink-soft">{R.intro}</p>
        </header>
        <form action={action} onSubmit={(e) => {
            setModifier(false);
            setDernier([...new FormData(e.currentTarget).entries()].map(([k, v]) => [k, String(v)]));
          }} className="space-y-4" noValidate>
          {champCode ? (
            <Field label={R.codeLabel} htmlFor="code" hint={R.codeAide} error={champs.code ?? (code && !codeOk ? R.codeInvalide : undefined)}>
              <Input
                id="code"
                name="code"
                defaultValue={code}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={Boolean(champs.code)}
                className="font-mono uppercase tracking-wider"
              />
            </Field>
          ) : (
            <>
              <input type="hidden" name="code" value={code} />
              <CodeReconnu code={code} onChanger={() => setChangerCode(true)} />
            </>
          )}
          <Field label={R.prenom} htmlFor="prenom" error={champs.prenom}>
            <Input id="prenom" name="prenom" defaultValue={deja("prenom")} autoComplete="given-name" maxLength={40} aria-invalid={Boolean(champs.prenom)} />
          </Field>
          <Field label={R.email} htmlFor="email" hint={avecMotDePasse ? undefined : R.emailAide} error={champs.email}>
            <Input id="email" name="email" defaultValue={deja("email")} type="email" inputMode="email" autoComplete="email" aria-invalid={Boolean(champs.email)} />
          </Field>
          {avecMotDePasse && (
            <Field label={R.motDePasse} htmlFor="mot_de_passe" hint={R.motDePasseAide} error={champs.motDePasse}>
              <Input id="mot_de_passe" name="mot_de_passe" type="password" autoComplete="new-password" minLength={8} aria-invalid={Boolean(champs.motDePasse)} />
            </Field>
          )}
          {etat.erreur && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-base text-danger">
              {etat.erreur}
            </p>
          )}
          <BoutonPlein disabled={envoi}>
            <Icone nom={avecMotDePasse ? "cle" : "enveloppe"} className="h-5 w-5 shrink-0" />
            {envoi ? R.envoi : avecMotDePasse ? R.boutonMotDePasse : R.bouton}
          </BoutonPlein>
          <button
            type="button"
            aria-expanded={avecMotDePasse}
            onClick={() => setMotDePasseVoulu(!avecMotDePasse)}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            <Icone nom={avecMotDePasse ? "enveloppe" : "cle"} className="h-4 w-4 shrink-0" />
            {avecMotDePasse ? R.plutotLien : R.prefereMotDePasse}
          </button>
        </form>
        <p className="text-sm leading-relaxed text-ink-soft">{R.dejaCompte}</p>
      </Carte>
      <p className="flex items-start gap-2 px-1 text-sm leading-relaxed text-ink-soft">
        <Icone nom="cle" className="mt-0.5 h-4 w-4 shrink-0" />
        {R.confidentialite}
      </p>
    </div>
  );
}

/** Écran 2 : le lien est parti. Les champs restent dans un formulaire caché pour « Renvoyer le lien ». */
function MailEnvoye({
  email,
  dernier,
  action,
  envoi,
  onModifier,
}: {
  email: string;
  dernier: [string, string][];
  action: (fd: FormData) => void;
  envoi: boolean;
  onModifier: () => void;
}) {
  const M = useI18n().t.client.mail;
  return (
    <div className="space-y-5">
      <EtapesClient active={2} />
      <Carte>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white" style={{ background: CORAIL }} aria-hidden="true">
            <Icone nom="enveloppe" className="h-6 w-6" />
          </span>
          <h1 className="font-serif text-[30px] italic leading-tight">{M.titre}</h1>
        </div>
        <div role="status" className="space-y-3 text-base leading-relaxed">
          <p className="font-medium text-ink">{M.texte(email)}</p>
          <p className="text-ink">{M.action}</p>
          <p className="flex items-center gap-2 rounded-xl bg-corail-soft px-3.5 py-2.5 text-ink">
            <Icone nom="horloge" className="h-5 w-5 shrink-0 text-corail" />
            {M.memeAppareil}
          </p>
          <p className="text-ink-soft">{M.spam}</p>
        </div>
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <RenvoyerLien dernier={dernier} action={action} envoi={envoi} />
          <button type="button" onClick={onModifier} className="min-h-11 text-base font-medium text-link underline underline-offset-4">
            {M.autreAdresse}
          </button>
        </div>
      </Carte>
    </div>
  );
}

/** Renvoie le même formulaire (une fois : Supabase n'envoie pas deux liens à moins d'une minute d'écart). */
function RenvoyerLien({ dernier, action, envoi }: { dernier: [string, string][]; action: (fd: FormData) => void; envoi: boolean }) {
  const M = useI18n().t.client.mail;
  const [fait, setFait] = useState(false);
  return (
    <button
      type="button"
      disabled={envoi || fait || dernier.length === 0}
      onClick={() => {
        const fd = new FormData();
        for (const [k, v] of dernier) fd.set(k, v);
        setFait(true);
        startTransition(() => action(fd));
      }}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/25 bg-white px-5 text-base font-medium text-ink disabled:opacity-60"
    >
      <Icone nom={fait ? "coche" : "enveloppe"} className="h-5 w-5 shrink-0" />
      {M.renvoyer}
    </button>
  );
}

/** Déjà connecté, pas encore client : un bouton active le code sur ce compte. */
export function ActiverCode({ code, email }: { code: string; email: string }) {
  const [etat, action, envoi] = useActionState(activerAction, initial);
  const K = useI18n().t.client.connecte;
  const R = useI18n().t.client.rejoindre;
  const erreurCode = etat.champs?.code;
  return (
    <div className="space-y-5">
      <EtapesClient active={2} />
      <Carte>
        <header className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide" style={{ color: CORAIL }}>
            <Icone nom="cle" className="h-4 w-4 shrink-0" />
            {R.surtitre}
          </p>
          <h1 className="font-serif text-[30px] italic leading-tight">{K.titre}</h1>
          <p className="text-base text-ink">{K.texte(email)}</p>
        </header>
        <form action={action} className="space-y-4" noValidate>
          {code && !erreurCode ? (
            <>
              <input type="hidden" name="code" value={code} />
              <p className="flex items-center gap-2.5 rounded-xl border border-sage/30 bg-sage-soft px-3.5 py-2.5">
                <Icone nom="cle" className="h-5 w-5 shrink-0 text-sage" />
                <span className="truncate font-mono tracking-wider text-sage">{code}</span>
              </p>
            </>
          ) : (
            <Field label={R.codeLabel} htmlFor="code" hint={K.sansCode} error={erreurCode}>
              <Input id="code" name="code" defaultValue={code} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="font-mono uppercase tracking-wider" />
            </Field>
          )}
          <BoutonPlein disabled={envoi}>
            <Icone nom="coche" className="h-5 w-5 shrink-0" />
            {K.bouton}
          </BoutonPlein>
        </form>
        <form action={changerDeCompteAction} className="flex items-center justify-center gap-1.5 border-t border-line pt-4 text-[15px] text-ink-soft">
          <input type="hidden" name="code" value={code} />
          {K.pasToi}
          <button type="submit" className="min-h-11 font-medium text-link underline underline-offset-4">
            {K.deconnecter}
          </button>
        </form>
      </Carte>
    </div>
  );
}

/** Déjà client : rien à activer, on ouvre l'espace. */
export function DejaClient() {
  const K = useI18n().t.client.connecte;
  return (
    <Carte>
      <p className="flex items-center gap-2.5 text-lg text-ink">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage text-white" aria-hidden="true">
          <Icone nom="coche" className="h-5 w-5" />
        </span>
        {K.dejaClient}
      </p>
      <a href="/boussole-decision/mon-espace/" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-medium text-white" style={{ background: CORAIL }}>
        {K.ouvrir}
        <Icone nom="fleche" className="h-5 w-5 shrink-0" />
      </a>
    </Carte>
  );
}
