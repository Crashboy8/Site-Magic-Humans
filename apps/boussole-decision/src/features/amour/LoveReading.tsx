import { LOVE_RESULTS, LOVE_TEXTS } from "@/content/amour";
import { Card, Notice, buttonClass } from "@/components/ui";
import { espacesFins, lignesBesoins, type RelationLook } from "@/domain/relationApparence";
import { loveReadingOf } from "@/domain/loveReading";
import type { OpportunityResult } from "@/domain/scoring";
import { IconeCalendrier, IconeEtat, NomRelation } from "./IconeRelation";

const fill = (tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

/** Lecture mode amour : le titre de la relation, ses besoins essentiels, ses alertes, la tranche et l'appel. */
export function LoveReading({ ranking, lookDe }: { ranking: OpportunityResult[]; lookDe: (id: string) => RelationLook }) {
  const T = LOVE_TEXTS;
  return (
    <section aria-labelledby="lecture-amour" className="space-y-5">
      <div className="titre-section">
        <h2 id="lecture-amour" className="text-center text-balance text-3xl italic">
          {T.readingTitle}
        </h2>
        <p className="mx-auto mt-1 max-w-3xl text-center text-pretty text-ink-soft">{espacesFins(T.readingIntro)}</p>
      </div>

      {ranking.map((r) => {
        const lr = loveReadingOf(r);
        if (lr.score === null || lr.band === null) {
          return (
            <p key={r.opportunity.id} className="text-center text-pretty">
              {T.noScore}
            </p>
          );
        }
        const band = T.bands[lr.band];
        const score = Math.round(lr.score);
        const look = lookDe(r.opportunity.id);
        const lignes = lignesBesoins(r);
        const besoins = lignes.filter((l) => l.genre === "besoin");
        const risques = lignes.filter((l) => l.genre === "risque");
        return (
          <div key={r.opportunity.id} className="space-y-4">
            <div className="eviter-coupure space-y-2">
              <p className="text-center text-balance font-serif text-2xl italic">
                <NomRelation nom={r.opportunity.name} look={look} className="font-sans text-[0.72em] font-semibold not-italic" />
                {espacesFins(` : ${score} % d'alignement`)}
              </p>
              {besoins.length > 0 && (
                <>
                  <h3 className="text-center font-serif text-xl italic">{LOVE_RESULTS.needsTitle}</h3>
                  <ul className="mx-auto max-w-3xl space-y-2">
                    {besoins.map((ligne) => (
                      <li key={ligne.criterionId} className="flex items-start gap-2 text-pretty text-[16px] leading-snug">
                        <IconeEtat etat={ligne.etat} />
                        <span>{ligne.phrase}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {risques.length > 0 && (
                <ul className="mx-auto max-w-3xl space-y-2">
                  {risques.map((ligne) => (
                    <li key={ligne.criterionId} className="flex items-start gap-2 text-pretty text-[16px] leading-snug">
                      <IconeEtat etat={ligne.etat} />
                      <span>{ligne.phrase}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lr.alerts.length > 0 && (
              <Notice tone="error">
                <p className="font-semibold">{T.alertsTitle}</p>
                <p className="mt-1 text-pretty">{espacesFins(fill(T.alertIntro, { score }))}</p>
                {lr.alerts.map((a) => (
                  <p key={`${a.kind}-${a.criterionId}`} className="mt-2 text-pretty">
                    {a.text}
                  </p>
                ))}
              </Notice>
            )}
            {lr.provisional && <Notice>{fill(T.provisional, { n: lr.missing })}</Notice>}
            <Card className="eviter-coupure space-y-3">
              <h3 className="text-balance font-serif text-2xl italic">{band.title}</h3>
              <p className="text-pretty">{espacesFins(band.text)}</p>
              <h4 className="font-medium">{T.questionsTitle}</h4>
              <ul className="list-disc space-y-1 pl-5">
                {band.questions.map((q) => (
                  <li key={q} className="text-pretty">
                    {espacesFins(q)}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        );
      })}

      <Card data-cta-place="boussole_relation" className="eviter-coupure space-y-3">
        <h3 className="font-serif text-2xl italic">{T.cta.title}</h3>
        <p className="text-pretty">{T.cta.text}</p>
        <a href={T.cta.url} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
          {T.cta.button}
        </a>
      </Card>

      <p className="text-center">
        <a
          href={LOVE_RESULTS.discoveryUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-appel-decouverte
          className="inline-flex max-w-xl items-center gap-2 rounded-full border border-corail/40 bg-paper px-4 py-2.5 text-left text-[15px] leading-snug text-corail hover:bg-corail-soft"
        >
          <IconeCalendrier />
          <span className="text-pretty">{espacesFins(LOVE_RESULTS.discoveryCta)}</span>
        </a>
      </p>
    </section>
  );
}
