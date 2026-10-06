import { LOVE_TEXTS } from "@/content/amour";
import { Card, Notice, buttonClass } from "@/components/ui";
import { loveReadingOf } from "@/domain/loveReading";
import type { OpportunityResult } from "@/domain/scoring";

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

/** Lecture mode amour : alertes d'abord, puis le score, la tranche et l'appel à l'action. */
export function LoveReading({ ranking }: { ranking: OpportunityResult[] }) {
  const T = LOVE_TEXTS;
  return (
    <section aria-labelledby="lecture-amour" className="space-y-5">
      <div>
        <h2 id="lecture-amour" className="text-3xl italic">
          {T.readingTitle}
        </h2>
        <p className="mt-1 max-w-3xl text-ink-soft">{T.readingIntro}</p>
      </div>

      {ranking.map((r) => {
        const lr = loveReadingOf(r);
        if (lr.score === null || lr.band === null) {
          return <p key={r.opportunity.id}>{T.noScore}</p>;
        }
        const band = T.bands[lr.band];
        const score = Math.round(lr.score);
        return (
          <div key={r.opportunity.id} className="space-y-4">
            {lr.alerts.length > 0 && (
              <Notice tone="error">
                <p className="font-semibold">{T.alertsTitle}</p>
                <p className="mt-1">{fill(T.alertIntro, { score })}</p>
                {lr.alerts.map((a) => (
                  <p key={`${a.kind}-${a.criterionId}`} className="mt-2">
                    {a.text}
                  </p>
                ))}
              </Notice>
            )}
            <p className="font-serif text-2xl italic">{fill(T.scoreLine, { name: r.opportunity.name, score })}</p>
            {lr.provisional && <Notice>{fill(T.provisional, { n: lr.missing })}</Notice>}
            <Card className="space-y-3">
              <h3 className="font-serif text-2xl italic">{band.title}</h3>
              <p>{band.text}</p>
              <h4 className="font-medium">{T.questionsTitle}</h4>
              <ul className="list-disc space-y-1 pl-5">
                {band.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </Card>
          </div>
        );
      })}

      <Card data-cta-place="boussole_relation" className="space-y-3">
        <h3 className="font-serif text-2xl italic">{T.cta.title}</h3>
        <p>{T.cta.text}</p>
        <a href={T.cta.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
          {T.cta.button}
        </a>
      </Card>
    </section>
  );
}
