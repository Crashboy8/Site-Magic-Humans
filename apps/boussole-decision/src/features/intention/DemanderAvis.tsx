"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, cx, Input, Textarea } from "@/components/ui";
import { longueur, QUESTION_MAX, type OutilIntention } from "@/domain/intention";
import { useI18n } from "@/i18n/client";
import { BASE_PATH } from "@/lib/config";
import { cleErreur, type CleErreur } from "./erreurs";

const API = `${BASE_PATH}/api/intention/`;

/** Bulle de dialogue : l'icône du bouton, sur la même ligne que le texte. */
export function IconeAvis({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cx("flex-none", className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4.5 19.5l1.4-4.1A7.5 7.5 0 1 1 20 11.5z" />
      <path d="M9 10.5h6M9 13.5h4" />
    </svg>
  );
}

/**
 * Bouton discret « Demander l'avis de Pierre » et son court formulaire (question, mail sans compte, accord pour une
 * réponse par mail). La demande part par api/intention, avec l'outil et l'écran d'où elle est envoyée.
 */
export function DemanderAvis({ outil, etape, className }: { outil: OutilIntention; etape: string; className?: string }) {
  const { t } = useI18n();
  const [ouvert, setOuvert] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-haspopup="dialog"
        className={cx(
          "inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-accent-strong/30 bg-paper px-4 py-2 text-[15px] font-medium text-accent-deep transition-colors hover:border-accent-strong/60 hover:bg-blush",
          className,
        )}
      >
        <IconeAvis />
        <span className="whitespace-nowrap">{t.intention.bouton}</span>
      </button>
      {ouvert && <Formulaire outil={outil} etape={etape} onClose={() => setOuvert(false)} />}
    </>
  );
}

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

type Phase = "chargement" | "pret" | "envoi" | "envoye";

function Formulaire({ outil, etape, onClose }: { outil: OutilIntention; etape: string; onClose: () => void }) {
  const F = useI18n().t.intention.formulaire;
  const id = useId();
  const [phase, setPhase] = useState<Phase>("chargement");
  const [compte, setCompte] = useState(false);
  const [jeton, setJeton] = useState("");
  const [question, setQuestion] = useState("");
  const [erreur, setErreur] = useState<CleErreur | null>(null);

  // Ouverture : la route dit si un compte est connecté et donne le jeton qui porte l'heure d'ouverture.
  useEffect(() => {
    let actif = true;
    fetch(API, { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { compte?: unknown; jeton?: unknown }) => {
        if (!actif) return;
        setCompte(j.compte === true);
        setJeton(typeof j.jeton === "string" ? j.jeton : "");
        setPhase("pret");
      })
      .catch(() => {
        if (!actif) return;
        setErreur("indisponible");
        setPhase("pret");
      });
    return () => {
      actif = false;
    };
  }, []);

  async function envoyer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErreur(null);
    setPhase("envoi");
    try {
      const r = await fetch(API, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outil,
          etape,
          question,
          mail: compte ? "" : String(fd.get("mail") ?? ""),
          accord: fd.get("accord") === "oui",
          site: String(fd.get("site") ?? ""),
          jeton,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: unknown; erreur?: unknown };
      if (r.ok && j.ok === true) {
        setPhase("envoye");
        return;
      }
      setErreur(cleErreur(j.erreur));
    } catch {
      setErreur("indisponible");
    }
    setPhase("pret");
  }

  const n = longueur(question);
  return (
    <Fenetre titreId={`${id}-titre`} onClose={onClose}>
      <h2 id={`${id}-titre`} className="flex items-center gap-2 text-2xl italic">
        <IconeAvis className="h-6 w-6 text-accent-strong" />
        {F.titre}
      </h2>
      {phase === "envoye" ? (
        <>
          <p role="status" className="rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-[15px]">
            {F.envoye}
          </p>
          <Button type="button" variant="secondary" onClick={onClose}>
            {F.fermer}
          </Button>
        </>
      ) : (
        <form onSubmit={envoyer} className="space-y-4">
          <p className="text-[15px] text-ink-soft">{F.intro}</p>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-q`} className="block text-[15px] font-medium">
              {F.question}
            </label>
            <Textarea
              id={`${id}-q`}
              name="question"
              required
              maxLength={QUESTION_MAX}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              aria-describedby={`${id}-n`}
              disabled={phase === "chargement"}
            />
            <p id={`${id}-n`} className="text-right text-sm text-ink-soft" aria-live="polite">
              {F.compteur(n, QUESTION_MAX)}
            </p>
          </div>
          {!compte && phase !== "chargement" && (
            <div className="space-y-1.5">
              <label htmlFor={`${id}-m`} className="block text-[15px] font-medium">
                {F.mail}
              </label>
              <Input id={`${id}-m`} name="mail" type="email" required autoComplete="email" inputMode="email" maxLength={254} aria-describedby={`${id}-ma`} />
              <p id={`${id}-ma`} className="text-sm text-ink-soft">
                {F.mailAide}
              </p>
            </div>
          )}
          {/* Pot de miel : caché aux personnes, rempli par les robots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={`${id}-s`}>{F.piege}</label>
            <input id={`${id}-s`} name="site" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <label className="flex items-start gap-3 text-[15px]">
            <input type="checkbox" name="accord" value="oui" defaultChecked={false} className="mt-1 h-5 w-5 flex-none accent-accent-strong" />
            <span>{F.accord}</span>
          </label>
          {erreur && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[15px] text-danger">
              {F.erreurs[erreur]}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={phase !== "pret" || !jeton || n === 0}>
              {phase === "envoi" ? F.envoi : phase === "chargement" ? F.chargement : F.envoyer}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              {F.fermer}
            </Button>
          </div>
          <p className="text-sm text-ink-soft">
            {F.donnees}{" "}
            <a href={`${BASE_PATH}/tes-donnees/`} className="text-link underline">
              {F.lienDonnees}
            </a>
          </p>
        </form>
      )}
    </Fenetre>
  );
}
