"use client";

import { useState } from "react";
import { Button, Card, Input, Textarea } from "@/components/ui";
import type { Question } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { RappelConfidentialite } from "./Confidentialite";
import { BarreBoutons } from "./Champs";

const AUTRE = "__autre__";
interface Saisie {
  choix: string;
  texte: string;
  passee: boolean;
}
const VIDE: Saisie = { choix: "", texte: "", passee: false };

/** Réponse de la personne à une question, ou `null` tant qu'elle n'a rien dit (et n'a pas passé la question). */
export function reponseDe(q: Question, s: Saisie, passee: string): string | null {
  if (s.passee) return passee;
  if (q.type === "texte") return s.texte.trim() || null;
  if (s.choix === AUTRE) return s.texte.trim() || null;
  return s.choix || null;
}

export function EtapeQuestions({
  questions,
  tour,
  fournisseur,
  M,
  onRetour,
  onContinuer,
}: {
  questions: Question[];
  tour: number;
  fournisseur: string;
  M: MaCibleMessages;
  onRetour: () => void;
  onContinuer: (reponses: { id: string; question: string; reponse: string }[]) => void;
}) {
  const Q = M.questions;
  const [saisies, setSaisies] = useState<Record<string, Saisie>>({});
  const [essaye, setEssaye] = useState(false);
  const de = (id: string) => saisies[id] ?? VIDE;
  const maj = (id: string, patch: Partial<Saisie>) => setSaisies((s) => ({ ...s, [id]: { ...(s[id] ?? VIDE), ...patch } }));

  function envoyer() {
    const reponses = questions.map((q) => ({ id: q.id, question: q.question, reponse: reponseDe(q, de(q.id), Q.reponsePassee) }));
    if (reponses.some((r) => r.reponse === null)) {
      setEssaye(true);
      return;
    }
    onContinuer(reponses as { id: string; question: string; reponse: string }[]);
  }

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        envoyer();
      }}
    >
      {tour >= 2 && <p className="text-[15px] text-ink-soft">{Q.dernierTour}</p>}
      {questions.map((q) => {
        const s = de(q.id);
        const manque = essaye && reponseDe(q, s, Q.reponsePassee) === null;
        const idErr = `question-${q.id}-erreur`;
        return (
          <Card key={q.id} className={`space-y-4 rounded-2xl p-6 sm:p-8 ${s.passee ? "opacity-70" : ""}`}>
            <h2 className="text-[22px] leading-snug">{q.question}</h2>
            <p className="text-[15px] text-ink-soft">
              {Q.pourquoi}
              {q.pourquoi}
            </p>
            <fieldset disabled={s.passee} className="space-y-2" aria-describedby={manque ? idErr : undefined}>
              <legend className="sr-only">{q.question}</legend>
              {q.type === "choix" ? (
                <>
                  {[...q.options, AUTRE].map((o) => (
                    <label
                      key={o}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-ink/20 p-4 has-[:checked]:border-accent-strong has-[:checked]:bg-blush has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-strong/40"
                    >
                      <input type="radio" name={`q-${q.id}`} value={o} checked={s.choix === o} onChange={() => maj(q.id, { choix: o })} className="h-5 w-5 shrink-0 accent-accent-strong" />
                      <span>{o === AUTRE ? Q.autre : o}</span>
                    </label>
                  ))}
                  {s.choix === AUTRE && (
                    <Input type="text" aria-label={Q.autre} placeholder={Q.autrePlaceholder} maxLength={300} value={s.texte} onChange={(e) => maj(q.id, { texte: e.target.value })} />
                  )}
                </>
              ) : (
                <>
                  <Textarea rows={2} aria-label={q.question} maxLength={300} value={s.texte} onChange={(e) => maj(q.id, { texte: e.target.value })} />
                  {q.exemple && (
                    <p className="text-[15px] italic text-ink-soft">
                      {M.commun.exemplePrefix}
                      {q.exemple}
                    </p>
                  )}
                </>
              )}
            </fieldset>
            <button
              type="button"
              className="min-h-11 text-[15px] text-link underline"
              aria-pressed={s.passee}
              onClick={() => maj(q.id, { passee: !s.passee })}
            >
              {Q.passer}
            </button>
            {manque && (
              <p id={idErr} role="alert" className="text-sm text-danger">
                {Q.reponseRequise}
              </p>
            )}
          </Card>
        );
      })}
      <RappelConfidentialite M={M} fournisseur={fournisseur} />
      <BarreBoutons>
        <Button type="button" variant="secondary" onClick={onRetour}>
          {M.commun.retour}
        </Button>
        <Button type="submit">{M.commun.continuer}</Button>
      </BarreBoutons>
    </form>
  );
}
