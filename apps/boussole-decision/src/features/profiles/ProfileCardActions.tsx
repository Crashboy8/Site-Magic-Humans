"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, cx, Field, Input, Notice, Textarea } from "@/components/ui";
import { isLoveProfile } from "@/content/amour";
import { deleteProfile, updateProfile } from "@/data/repository";
import { avertissementsSuppression, descriptionModifiable, NOM_PROFIL_MAX, preparerModification } from "@/domain/profilActions";
import { useI18n } from "@/i18n/client";
import { supabaseBrowser } from "@/lib/supabase/client";

type CarteProfil = { id: string; name: string; description: string; sharedWithCoach: boolean };

/**
 * Carte d'un profil dans « Mes profils ». Le titre est le lien (étendu à toute la carte) ;
 * les boutons Modifier et Supprimer sont posés au-dessus, ils n'ouvrent donc pas le profil.
 */
export function ProfileCardView({
  profile,
  href,
  editable,
  children,
}: {
  profile: CarteProfil;
  href: string;
  editable: boolean;
  /** Pastilles du bas (versions, partage, date), rendues côté serveur. */
  children: ReactNode;
}) {
  const [courant, setCourant] = useState(profile);
  const [fenetre, setFenetre] = useState<"modifier" | "supprimer" | null>(null);
  const [supprime, setSupprime] = useState(false);
  const p = useI18n().t.profile;
  const amour = isLoveProfile(courant);

  if (supprime) return null;

  return (
    <article
      className={cx(
        "group relative flex h-full flex-col rounded-2xl border bg-paper p-6 transition hover:-translate-y-0.5 hover:shadow-md",
        amour ? "border-framboise/25 hover:border-framboise/50" : "border-line hover:border-ink/25",
      )}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 text-2xl italic">
          <Link
            href={href}
            className={cx(
              "inline-flex items-baseline gap-2 outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2",
              amour ? "group-hover:text-framboise focus-visible:after:ring-framboise" : "group-hover:text-accent-deep focus-visible:after:ring-accent-strong",
            )}
          >
            {amour ? (
              <CoeurIcone className="h-5 w-5 shrink-0 translate-y-0.5 text-framboise" />
            ) : (
              <MalletteIcone className="h-5 w-5 shrink-0 translate-y-0.5 text-ciel" />
            )}
            <span className="break-words">{courant.name}</span>
          </Link>
        </h3>
        {editable && (
          <div className="relative z-10 -mr-2 -mt-1.5 flex shrink-0 items-center gap-1">
            <BoutonIcone label={p.editAria(courant.name)} titre={p.editAction} ton="ciel" onClick={() => setFenetre("modifier")}>
              <CrayonIcone />
            </BoutonIcone>
            <BoutonIcone label={p.deleteAria(courant.name)} titre={p.deleteAction} ton="danger" onClick={() => setFenetre("supprimer")}>
              <CorbeilleIcone />
            </BoutonIcone>
          </div>
        )}
      </div>
      {courant.description && <p className="mt-2 line-clamp-2 text-[15px] text-ink-soft">{courant.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-sm text-ink-soft">{children}</div>

      {fenetre === "modifier" && (
        <FenetreModifier
          profile={courant}
          onClose={() => setFenetre(null)}
          onSaved={(maj) => {
            setCourant(maj);
            setFenetre(null);
          }}
        />
      )}
      {fenetre === "supprimer" && (
        <FenetreSupprimer profile={courant} onClose={() => setFenetre(null)} onDeleted={() => setSupprime(true)} />
      )}
    </article>
  );
}

function BoutonIcone({
  label,
  titre,
  ton,
  onClick,
  children,
}: {
  label: string;
  titre: string;
  ton: "ciel" | "danger";
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={titre}
      onClick={onClick}
      className={cx(
        "inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        ton === "ciel"
          ? "text-ciel hover:bg-sky-soft focus-visible:outline-ciel"
          : "text-danger hover:bg-danger-soft focus-visible:outline-danger",
      )}
    >
      <span
        className={cx(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border",
          ton === "ciel" ? "border-sky-line bg-sky-soft" : "border-danger/20 bg-danger-soft",
        )}
      >
        {children}
      </span>
    </button>
  );
}

/** Fenêtre native (<dialog>) : focus gardé à l'intérieur, Échap pour fermer. */
function Fenetre({ titreId, onClose, children }: { titreId: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titreId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-cream p-0 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <div className="space-y-4 p-6">{children}</div>
    </dialog>
  );
}

function FenetreModifier({
  profile,
  onClose,
  onSaved,
}: {
  profile: CarteProfil;
  onClose: () => void;
  onSaved: (maj: CarteProfil) => void;
}) {
  const router = useRouter();
  const p = useI18n().t.profile;
  const id = useId();
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amour = isLoveProfile(profile);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = preparerModification(profile, { name, description });
    if (!r.ok) return setError(p.nameRequired);
    if (Object.keys(r.patch).length === 0) return onClose();
    setPending(true);
    setError(null);
    try {
      await updateProfile(supabaseBrowser(), profile.id, r.patch);
      onSaved({ ...profile, ...r.patch });
      router.refresh();
    } catch {
      setError(p.saveFailed);
      setPending(false);
    }
  }

  return (
    <Fenetre titreId={`${id}-titre`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <h2 id={`${id}-titre`} className="flex items-center gap-2 text-2xl italic">
          {amour ? <CoeurIcone className="h-5 w-5 text-framboise" /> : <CrayonIcone className="h-5 w-5 text-ciel" />}
          {amour ? p.editTitleLove : p.editTitle}
        </h2>
        <Field label={p.profileName} htmlFor={`${id}-nom`} hint={amour ? p.loveNameOnly : undefined}>
          <Input id={`${id}-nom`} value={name} onChange={(e) => setName(e.target.value)} maxLength={NOM_PROFIL_MAX} required autoFocus />
        </Field>
        {descriptionModifiable(profile) && (
          <Field label={p.profileDescription} htmlFor={`${id}-desc`}>
            <Textarea
              id={`${id}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={p.profileDescriptionPlaceholder}
              className="min-h-20"
            />
          </Field>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {p.cancel}
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className={amour ? "bg-framboise hover:bg-framboise-deep" : undefined}
          >
            {pending ? p.saving : p.save}
          </Button>
        </div>
      </form>
    </Fenetre>
  );
}

function FenetreSupprimer({ profile, onClose, onDeleted }: { profile: CarteProfil; onClose: () => void; onDeleted: () => void }) {
  const router = useRouter();
  const p = useI18n().t.profile;
  const id = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { partage } = avertissementsSuppression(profile);

  async function supprimer() {
    setPending(true);
    setError(null);
    try {
      await deleteProfile(supabaseBrowser(), profile.id);
      onDeleted();
      router.refresh();
    } catch {
      setError(p.deleteFailed);
      setPending(false);
    }
  }

  return (
    <Fenetre titreId={`${id}-titre`} onClose={onClose}>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
          <CorbeilleIcone className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 id={`${id}-titre`} className="text-2xl italic leading-tight">
            {p.deleteTitle}
          </h2>
          <p className="font-medium text-ink">« {profile.name} »</p>
        </div>
      </div>
      <p className="text-[15px] text-ink-soft">{p.deleteBody}</p>
      {partage && (
        <p className="rounded-xl border border-sky-line bg-sky-soft px-4 py-3 text-[15px] text-ink">
          <span aria-hidden="true">🤝 </span>
          {p.deleteShared}
        </p>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} autoFocus>
          {p.cancel}
        </Button>
        <Button type="button" disabled={pending} onClick={supprimer} className="bg-danger text-white hover:bg-[#7f2c1f]">
          <CorbeilleIcone className="h-4 w-4" />
          {pending ? p.deleting : p.deleteYes}
        </Button>
      </div>
    </Fenetre>
  );
}

function CrayonIcone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CorbeilleIcone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function CoeurIcone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.6 4.5c2.1 0 3.6 1.1 4.4 2.6.8-1.5 2.3-2.6 4.4-2.6 3.6 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21Z" />
    </svg>
  );
}

/** Mallette, repère des profils pro (le cœur repère les Boussoles Relation). */
function MalletteIcone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="7" width="19" height="13" rx="2.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7" />
      <path d="M2.5 12.5h19" />
      <path d="M10.5 12.5v1.5h3v-1.5" />
    </svg>
  );
}
