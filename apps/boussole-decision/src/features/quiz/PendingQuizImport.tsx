"use client";

import { useState, useTransition } from "react";
import { Button, Card, Notice } from "@/components/ui";
import { parseQuizResult } from "@/domain/quizImport";
import { useI18n } from "@/i18n/client";
import { importQuizAction } from "./actions";
import { clearPendingQuiz, savePendingQuiz, usePendingQuiz } from "./storage";

/** Après connexion : propose d'ajouter le résultat du quiz mis de côté. */
export function PendingQuizImport() {
  const Q = useI18n().t.quiz;
  const raw = usePendingQuiz();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  let quiz = null;
  try {
    quiz = raw ? parseQuizResult(JSON.parse(raw)) : null;
  } catch {
    quiz = null;
  }
  if (!raw || !quiz) return null;

  return (
    <Card className="mb-8 max-w-2xl space-y-3 border-accent/30 bg-blush/50">
      <h2 className="font-serif text-2xl italic">{Q.pendingTitle}</h2>
      <p className="text-[15px] text-ink-soft">{Q.pendingText(quiz.name)}</p>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              clearPendingQuiz();
              const res = await importQuizAction(raw, false);
              if (res?.error) {
                savePendingQuiz(raw);
                setError(res.error);
              }
            })
          }
        >
          {pending ? Q.creating : Q.pendingAdd}
        </Button>
        <Button type="button" variant="ghost" onClick={clearPendingQuiz}>
          {Q.pendingDismiss}
        </Button>
      </div>
    </Card>
  );
}
