"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button, Card, Notice } from "@/components/ui";
import { decodeQuizHash, type QuizResult } from "@/domain/quizImport";
import { setLocaleAction } from "@/i18n/actions";
import { useI18n } from "@/i18n/client";
import { importQuizAction } from "./actions";
import { clearPendingQuiz, savePendingQuiz, useLocationHash } from "./storage";

/** Page d'arrivée du lien du quiz : aperçu du profil qui sera créé, puis création en un clic. */
export function QuizImport({ signedIn }: { signedIn: boolean }) {
  const { locale, t, m } = useI18n();
  const Q = t.quiz;
  const router = useRouter();
  const hash = useLocationHash();
  const quiz = useMemo(() => (hash === null ? undefined : decodeQuizHash(hash)), [hash]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // La Boussole s'ouvre dans la langue où le quiz a été passé (une seule fois : le sélecteur reste libre ensuite).
  const langApplied = useRef(false);
  useEffect(() => {
    if (!quiz || langApplied.current) return;
    langApplied.current = true;
    if (quiz.lang !== locale) void setLocaleAction(quiz.lang).then(() => router.refresh());
  }, [quiz, locale, router]);

  if (quiz === undefined) return <p className="text-ink-soft">{Q.loading}</p>;
  if (quiz === null)
    return (
      <Card className="max-w-2xl space-y-3">
        <Notice tone="error">{Q.invalid}</Notice>
        <a href="/quiz/" className="font-medium text-link underline underline-offset-4">
          {Q.retakeQuiz}
        </a>
      </Card>
    );

  const raw = JSON.stringify({ v: 1, ...quiz });
  const create = (startTrial: boolean) =>
    startTransition(async () => {
      setError(null);
      clearPendingQuiz();
      const res = await importQuizAction(raw, startTrial);
      if (res?.error) setError(res.error);
    });

  return (
    <div className="space-y-6">
      <Preview
        quiz={quiz}
        sentence={m.talentSentence({ mecanisme: quiz.mecanisme, contexteDeclencheur: quiz.contexte, superBenefice: quiz.benefice })}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <Card className="max-w-3xl space-y-3 border-accent/30 bg-blush/50">
        {signedIn ? (
          <Button type="button" disabled={pending} onClick={() => create(false)} className="w-full sm:w-auto">
            {pending ? Q.creating : Q.create}
          </Button>
        ) : (
          <>
            <Button type="button" disabled={pending} onClick={() => create(true)} className="w-full sm:w-auto">
              {pending ? Q.creating : Q.tryWithout}
            </Button>
            <div>
              <Link
                href="/connexion/"
                onClick={() => savePendingQuiz(raw)}
                className="inline-flex min-h-11 items-center rounded-full border border-ink/25 bg-paper px-5 text-[15px] font-medium hover:bg-sand"
              >
                {Q.haveAccount}
              </Link>
              <p className="mt-2 text-sm text-ink-soft">{Q.afterSignIn}</p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function Preview({ quiz, sentence }: { quiz: QuizResult; sentence: string | null }) {
  const Q = useI18n().t.quiz;
  return (
    <div className="grid max-w-3xl gap-4">
      <Card className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-soft">{Q.profileName}</p>
          <p className="font-serif text-2xl italic">{quiz.name}</p>
        </div>
        {sentence && (
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-soft">{Q.talent}</p>
            <p className="font-serif text-xl italic leading-snug">{sentence}</p>
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-soft">{Q.anti}</p>
          <p className="text-[15px]">{quiz.antiContexte}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-sage-soft/60 p-3 text-[15px]">
            <p className="mb-1 font-medium">{Q.success}</p>
            <p>{quiz.success}</p>
          </div>
          <div className="rounded-xl bg-danger-soft/50 p-3 text-[15px]">
            <p className="mb-1 font-medium">{Q.failure}</p>
            <p>{quiz.failure}</p>
          </div>
        </div>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-serif text-2xl italic">{Q.criteriaTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-medium">{Q.towards}</p>
            <ul className="list-disc space-y-1 pl-5 text-[15px]">
              {quiz.fertile.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">{Q.away}</p>
            <ul className="list-disc space-y-1 pl-5 text-[15px]">
              {quiz.toxic.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
