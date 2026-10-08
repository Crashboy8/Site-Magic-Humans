import { LOVE_TEXTS } from "@/content/amour";
import { QUIZ_MARK, quizProfilFrom } from "@/domain/lovePrefill";
import type { Criterion } from "@/domain/types";
import { IconeRelation } from "./IconeRelation";

/** Encart coloré du tableau : les critères repris du Quiz Amour, et le chemin de retour vers le quiz. */
export function QuizRepris({ criteria, added }: { criteria: Criterion[]; added: number }) {
  const R = LOVE_TEXTS.repris;
  const repris = criteria.filter((c) => c.description.startsWith(QUIZ_MARK));
  if (repris.length === 0) return null;
  const profil = quizProfilFrom(repris.map((c) => c.description));
  return (
    <section
      aria-labelledby="quiz-repris"
      data-quiz-repris
      className="max-w-3xl space-y-3 rounded-2xl border border-framboise/25 bg-gradient-to-br from-framboise-soft via-paper to-miel-soft p-5 text-center"
    >
      <h2 id="quiz-repris" className="flex items-center justify-center gap-2 text-xl font-semibold text-framboise">
        <IconeRelation icone="coeur" couleur="framboise" taille={22} />
        {R.title}
      </h2>
      {profil && <p className="font-script text-xl text-framboise">{R.profil(profil)}</p>}
      {added > 0 && <p className="text-sm font-medium text-eau">{R.added(added)}</p>}
      <ul className="flex flex-wrap justify-center gap-2">
        {repris.map((c) => (
          <li key={c.id} className="rounded-full border border-framboise/20 bg-paper px-3 py-1 text-sm text-ink">
            {c.nonNegotiable && <span aria-hidden>🔒 </span>}
            {c.label}
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-soft">{R.redoHint}</p>
      <p>
        <a href="/quiz-amour/" className="text-sm font-medium text-link underline underline-offset-4">
          {R.backToQuiz}
        </a>
      </p>
    </section>
  );
}
