"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SaveIndicator, SaveStatusProvider, useAutosavedValue, useSaveTracker } from "@/components/autosave";
import { Card, Notice, Textarea, cx } from "@/components/ui";
import { LOVE_TABLE } from "@/content/amour";
import { supabaseBrowser } from "@/lib/supabase/client";
import { updateVersion } from "@/data/repository";
import { useI18n } from "@/i18n/client";
import { ikigaiOf, insightOf, rankingStability, verdictOf, type OpportunityInsight } from "@/domain/results";
import { formatScore, rankOpportunities, type CriterionResult, type OpportunityResult } from "@/domain/scoring";
import type {
  Category,
  Criterion,
  Evaluation,
  Opportunity,
  ProjectionFeeling,
  RankingAgreement,
  TalentUnique,
  Version,
} from "@/domain/types";
import { LoveReading } from "@/features/amour/LoveReading";
import { CarteDuTalentLink } from "@/features/carte/CarteDuTalentLink";
import { CibleurLink } from "@/features/carte/CibleurLink";
import { IkigaiChart } from "./IkigaiChart";
import { Radar } from "./Radar";

interface Props {
  version: Version;
  profileId: string;
  talent: TalentUnique;
  categories: Category[];
  criteria: Criterion[];
  opportunities: Opportunity[];
  evaluations: Evaluation[];
  /** Lecture seule : coach, ou version finalisée. */
  readOnly: boolean;
  isOwner: boolean;
  /** Boussole Relation : masque les sections carrière et affiche la lecture amour. */
  theme?: "amour";
}

export function ResultsView(props: Props) {
  return (
    <SaveStatusProvider>
      <Results {...props} />
    </SaveStatusProvider>
  );
}

function Results({ version, profileId, talent, categories, criteria, opportunities, evaluations, readOnly, isOwner, theme }: Props) {
  const love = theme === "amour";
  const weights = version.importanceWeights;
  const ranking = useMemo(
    () => rankOpportunities(opportunities, criteria, evaluations, weights),
    [opportunities, criteria, evaluations, weights],
  );
  const verdict = verdictOf(ranking);
  const insights = useMemo(() => ranking.map((r) => insightOf(r, categories, weights)), [ranking, categories, weights]);
  const stability = useMemo(
    () => rankingStability(opportunities, criteria, evaluations, categories, weights),
    [opportunities, criteria, evaluations, categories, weights],
  );
  const tableHref = `/versions/${version.id}/tableau/`;
  const { t, m, locale } = useI18n();
  const R = t.results;
  const fmt = (s: number | null) => formatScore(s, locale);
  // Nom d'une catégorie : le libellé de la méthode pour les catégories par défaut, sinon celui saisi.
  const categoryName = (id: string) => {
    const c = categories.find((x) => x.id === id);
    return c?.key ? m.categoryByKey[c.key].label : (c?.label ?? "");
  };

  if (verdict.kind === "vide") {
    if (love) {
      return (
        <div className="space-y-12">
          <LoveReading ranking={ranking} />
        </div>
      );
    }
    return (
      <Card className="max-w-2xl space-y-3">
        <h2 className="font-serif text-2xl italic">{R.emptyTitle}</h2>
        <p className="text-ink-soft">{R.emptyText}</p>
        <Link href={tableHref} className="inline-block font-medium text-link underline underline-offset-4">
          {R.backToTable}
        </Link>
      </Card>
    );
  }

  const leader = verdict.leader;
  const allFail = ranking.every((r) => r.score === null || r.status === "non_conforme");

  return (
    <div className="space-y-12">
      {!readOnly && (
        <div className="flex justify-end">
          <SaveIndicator />
        </div>
      )}

      {/* 1. Le verdict ---------------------------------------------------------------------- */}
      <section aria-labelledby="verdict" className="space-y-5">
        <h2 id="verdict" className="sr-only">
          {R.verdict}
        </h2>
        <Card className="space-y-4 border-accent/30 bg-blush/50">
          <p className="font-serif text-2xl italic leading-snug sm:text-3xl">
            {verdict.kind === "seule" && (
              <>
                <b className="font-sans font-semibold not-italic">{leader.opportunity.name}</b>
                {R.onlyOne(fmt(leader.score))}
              </>
            )}
            {verdict.kind === "en_tete" && (
              <>
                <b className="font-sans font-semibold not-italic">{leader.opportunity.name}</b>
                {R.leads(fmt(leader.score))}
                <b className="font-sans font-semibold not-italic">{verdict.runnerUp.opportunity.name}</b>
                {R.leadsEnd(fmt(verdict.runnerUp.score))}
              </>
            )}
            {verdict.kind === "coude_a_coude" && (
              <>
                <b className="font-sans font-semibold not-italic">{leader.opportunity.name}</b>
                {R.and}
                <b className="font-sans font-semibold not-italic">{verdict.runnerUp.opportunity.name}</b>
                {R.tie(fmt(leader.score), fmt(verdict.runnerUp.score))}
              </>
            )}
          </p>
          {allFail && <Notice tone="error">{R.allFail}</Notice>}
          <p className="text-sm text-ink-soft">{R.compassNote}</p>
        </Card>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ranking.map((r, i) => (
            <li key={r.opportunity.id} className="rounded-2xl border border-line bg-paper p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={cx(
                    "rounded-full px-2 py-0.5 text-xs",
                    i === 0 && r.score !== null ? "bg-sage-soft text-sage" : "bg-sand text-ink-soft",
                  )}
                >
                  {r.score === null ? R.notRated : t.table.rank(i + 1)}
                </span>
                <span className="font-serif text-3xl italic">{fmt(r.score)}</span>
              </div>
              <p className="mt-1 font-semibold leading-snug">{r.opportunity.name}</p>
              <StatusBadges result={r} love={love} />
            </li>
          ))}
        </ol>
      </section>

      {love && <LoveReading ranking={ranking} />}

      {/* 2. Contexte de réussite / contexte d'échec ----------------------------------------- */}
      {!love && <section aria-labelledby="contextes" className="space-y-4">
        <SectionTitle id="contextes" title={R.contextsTitle}>
          {R.contextsIntroStart} <b className="font-medium text-ink">{R.contextsSuccess}</b> {R.contextsMiddle}{" "}
          <b className="font-medium text-ink">{R.contextsFailure}</b> {R.contextsEnd}
        </SectionTitle>
        <div className="space-y-4">
          {insights
            .filter((ins) => ins.result.score !== null)
            .map((ins) => (
              <InsightCard key={ins.result.opportunity.id} insight={ins} />
            ))}
        </div>
      </section>}

      {/* 3. Garde-fous ------------------------------------------------------------------------ */}
      {!love && (
        <Guardrails
          insights={insights}
          leader={leader}
          chosenId={version.chosenOpportunityId}
          talent={talent}
          profileId={profileId}
          isOwner={isOwner}
        />
      )}

      {/* Ikigai ------------------------------------------------------------------------------- */}
      {!love && <section aria-labelledby="ikigai" className="space-y-4">
        <SectionTitle id="ikigai" title={R.ikigaiTitle}>
          {R.ikigaiIntro}
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranking
            .filter((r) => r.score !== null)
            .map((r) => (
              <Card key={r.opportunity.id} className="space-y-2">
                <h3 className="text-center font-semibold">{r.opportunity.name}</h3>
                <IkigaiChart name={r.opportunity.name} ikigai={ikigaiOf(r, categories, weights)} />
              </Card>
            ))}
        </div>
      </section>}

      {/* 4. Radar ------------------------------------------------------------------------------ */}
      <section aria-labelledby="radar" className="space-y-4">
        <SectionTitle id="radar" title={R.radarTitle}>
          {R.radarIntro}
        </SectionTitle>
        <Card>
          <Radar categories={categories} opportunities={opportunities} results={ranking} />
        </Card>
      </section>

      {/* 5. Questions à poser ------------------------------------------------------------------ */}
      <Questions ranking={ranking} />

      {/* 6. Solidité du classement ------------------------------------------------------------ */}
      {!love && stability && (
        <section aria-labelledby="solidite" className="space-y-4">
          <SectionTitle id="solidite" title={R.stabilityTitle}>
            {R.stabilityIntro}
          </SectionTitle>
          <Card className="space-y-3">
            {stability.flips.length === 0 ? (
              <p>
                ✅ <b className="font-medium">{R.solid}</b>
                {R.solidText(stability.leader.name)}
              </p>
            ) : (
              <>
                <p>
                  ⚖️ <b className="font-medium">{R.sensitive}</b>
                  {R.sensitiveLeader(stability.leader.name)}
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  {stability.flips.map((f) => (
                    <li key={`${f.categoryId}-${f.emphasis}`}>{R.flip(categoryName(f.categoryId), f.emphasis, f.newLeader.name)}</li>
                  ))}
                </ul>
                <p className="text-sm text-ink-soft">
                  {R.stabilityHint}{" "}
                  <Link href={tableHref} className="text-link underline underline-offset-4">
                    {R.yourTable}
                  </Link>
                  .
                </p>
              </>
            )}
          </Card>
        </section>
      )}

      {/* 7. Le ressenti ------------------------------------------------------------------------- */}
      <Feelings version={version} leader={leader} readOnly={readOnly} tableHref={tableHref} />

      {/* 8. Prochains pas --------------------------------------------------------------------- */}
      <NextSteps version={version} ranking={ranking} readOnly={readOnly} />

      {/* 9. Pour aller plus loin : la Carte du Talent -------------------------------------- */}
      {!love && !readOnly && <CarteDuTalentLink talent={talent} />}
      {!love && !readOnly && <CibleurLink talent={talent} />}
    </div>
  );
}

function SectionTitle({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div>
      <h2 id={id} className="text-3xl italic">
        {title}
      </h2>
      {children && <p className="mt-1 max-w-3xl text-ink-soft">{children}</p>}
    </div>
  );
}

function StatusBadges({ result, love }: { result: OpportunityResult; love: boolean }) {
  const redLine = result.antiContextAlerts.some((a) => a.severity === "ligne_rouge");
  const R = useI18n().t.results;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
      {result.status === "non_conforme" && (
        <span className="rounded-full bg-danger-soft px-2 py-0.5 text-danger">{R.badgeNonNegotiable}</span>
      )}
      {result.antiContextAlerts.length > 0 && (
        <span className="rounded-full bg-danger-soft px-2 py-0.5 text-danger">
          ⚡ {redLine ? (love ? LOVE_TABLE.redLine : R.badgeRedLine) : R.badgeAnti}
        </span>
      )}
      {result.toVerify.length > 0 && (
        <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">{R.badgeToCheck(result.toVerify.length)}</span>
      )}
    </div>
  );
}

/** Libellé de la valeur évaluée, dans la langue choisie. */
function useValueLabel() {
  const { m } = useI18n();
  return (d: CriterionResult) => (d.value ? m.evaluationLabels[d.criterion.direction][d.value] : "");
}

function ItemList({ items, empty }: { items: CriterionResult[]; empty?: string }) {
  const valueLabel = useValueLabel();
  if (items.length === 0) return empty ? <p className="text-sm text-ink-soft">{empty}</p> : null;
  return (
    <ul className="space-y-1.5">
      {items.map((d) => (
        <li key={d.criterion.id} className="flex items-start justify-between gap-3 text-[15px]">
          <span className="leading-snug">
            {d.criterion.label}
            {d.criterion.nonNegotiable && <span className="ml-1 text-xs text-danger">🔒</span>}
          </span>
          <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-xs text-ink-soft">{valueLabel(d)}</span>
        </li>
      ))}
    </ul>
  );
}

function InsightCard({ insight }: { insight: OpportunityInsight }) {
  const { result } = insight;
  const failed = result.failedNonNegotiables.filter((d) => d.criterion.direction === "TOWARDS");
  const good = insight.ignites.length + insight.assets.length;
  const bad = insight.extinguishers.length + insight.missing.length + failed.length;
  const { t, locale } = useI18n();
  const R = t.results;
  return (
    <article className="rounded-2xl border border-line bg-paper p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{result.opportunity.name}</h3>
        <span className="font-serif text-2xl italic">{formatScore(result.score, locale)}</span>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-sage-soft/60 p-4">
          <h4 className="font-medium">{R.ignitesTitle}</h4>
          {insight.ignites.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">{R.triggerPresent}</p>
              <ItemList items={insight.ignites} />
            </div>
          )}
          {insight.assets.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">{R.otherAssets}</p>
              <ItemList items={insight.assets} />
            </div>
          )}
          {good === 0 && <p className="text-sm text-ink-soft">{R.nothingGood}</p>}
        </div>
        <div className="space-y-3 rounded-xl bg-danger-soft/50 p-4">
          <h4 className="font-medium">{R.extinguishTitle}</h4>
          {failed.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-danger">{R.failedNonNegotiables}</p>
              <ItemList items={failed} />
            </div>
          )}
          {insight.extinguishers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">{R.antiPresent}</p>
              <ItemList items={insight.extinguishers} />
            </div>
          )}
          {insight.missing.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">{R.missing}</p>
              <ItemList items={insight.missing} />
            </div>
          )}
          {insight.watch.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">{R.watch}</p>
              <ItemList items={insight.watch} />
            </div>
          )}
          {bad + insight.watch.length === 0 && <p className="text-sm text-ink-soft">{R.noFailureSignal}</p>}
        </div>
      </div>
    </article>
  );
}

function Guardrails({
  insights,
  leader,
  chosenId,
  talent,
  profileId,
  isOwner,
}: {
  insights: OpportunityInsight[];
  leader: OpportunityResult;
  chosenId: string | null;
  talent: TalentUnique;
  profileId: string;
  isOwner: boolean;
}) {
  const R = useI18n().t.results;
  const valueLabel = useValueLabel();
  const target =
    insights.find((i) => i.result.opportunity.id === chosenId) ?? insights.find((i) => i.result.opportunity.id === leader.opportunity.id);
  if (!target) return null;
  const signals = [...target.extinguishers, ...target.watch];
  const failure = talent.failureSituations.trim();
  return (
    <section aria-labelledby="garde-fous" className="space-y-4">
      <SectionTitle id="garde-fous" title={R.guardTitle}>
        {R.guardIntroStart} <b className="font-semibold text-ink">{target.result.opportunity.name}</b>
        {R.guardIntroEnd}
      </SectionTitle>
      <Card className="space-y-4">
        {signals.length > 0 ? (
          <ul className="space-y-2">
            {signals.map((d) => (
              <li key={d.criterion.id} className="flex gap-2">
                <span aria-hidden>👁️</span>
                <span>
                  {R.watchOut} <b className="font-medium">{d.criterion.label}</b>{" "}
                  <span className="text-sm text-ink-soft">{R.inThisOpportunity(valueLabel(d).toLowerCase())}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{R.noAntiRisk}</p>
        )}
        {failure ? (
          <div className="rounded-xl bg-blush/70 p-4">
            <p className="text-xs uppercase tracking-wider text-ink-soft">{R.livedFailures}</p>
            <p className="mt-1 whitespace-pre-line font-serif text-lg italic leading-snug">{failure}</p>
            <p className="mt-2 text-sm text-ink-soft">{R.askYourself}</p>
          </div>
        ) : (
          isOwner && (
            <p className="text-sm text-ink-soft">
              {R.describeFailuresStart}{" "}
              <Link href={`/profils/${profileId}/`} className="text-link underline underline-offset-4">
                {R.yourProfile}
              </Link>{" "}
              {R.describeFailuresEnd}
            </p>
          )
        )}
      </Card>
    </section>
  );
}

function Questions({ ranking }: { ranking: OpportunityResult[] }) {
  const withQuestions = ranking.filter((r) => r.toVerify.length > 0);
  const R = useI18n().t.results;
  const question = (c: { label: string; direction: "TOWARDS" | "AWAY_FROM" }) => {
    const label = c.label.trim().replace(/[.?!\s]+$/, "");
    return c.direction === "AWAY_FROM" ? R.questionAway(label) : R.questionTowards(label);
  };
  if (withQuestions.length === 0) return null;
  return (
    <section aria-labelledby="questions" className="space-y-4">
      <SectionTitle id="questions" title={R.questionsTitle}>
        {R.questionsIntro}
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {withQuestions.map((r) => (
          <Card key={r.opportunity.id} className="space-y-2">
            <h3 className="font-semibold">{r.opportunity.name}</h3>
            <ul className="space-y-1.5">
              {r.toVerify.map((d) => (
                <li key={d.criterion.id} className="flex gap-2 text-[15px]">
                  <span aria-hidden>❓</span>
                  <span>
                    {question(d.criterion)}
                    {d.criterion.nonNegotiable && <span className="ml-1 text-xs font-medium text-danger">{R.nonNegotiable}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ChoiceButtons<T extends string>({
  options,
  value,
  onChange,
  readOnly,
  label,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T | null) => void;
  readOnly: boolean;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={readOnly && !on}
            onClick={() => !readOnly && onChange(on ? null : o.value)}
            className={cx(
              "min-h-11 rounded-full border px-4 text-[15px] transition",
              on ? "border-ink bg-ink text-cream" : "border-line bg-paper hover:border-ink/40",
              readOnly && "cursor-default",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Feelings({
  version,
  leader,
  readOnly,
  tableHref,
}: {
  version: Version;
  leader: OpportunityResult;
  readOnly: boolean;
  tableHref: string;
}) {
  const db = supabaseBrowser();
  const { track } = useSaveTracker();
  const [agreement, setAgreement] = useState<RankingAgreement | null>(version.rankingAgreement);
  const [feeling, setFeeling] = useState<ProjectionFeeling | null>(version.projectionFeeling);
  const [feedback, setFeedback] = useAutosavedValue(version.rankingFeedback, (rankingFeedback) =>
    updateVersion(db, version.id, { rankingFeedback }),
  );
  const R = useI18n().t.results;
  const [note, setNote] = useAutosavedValue(version.projectionNote, (projectionNote) => updateVersion(db, version.id, { projectionNote }));

  return (
    <section aria-labelledby="ressenti" className="space-y-4">
      <SectionTitle id="ressenti" title={R.feelingsTitle}>
        {R.feelingsIntro}
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="font-medium">{R.agreementQuestion}</h3>
          <ChoiceButtons
            label={R.agreementQuestion}
            readOnly={readOnly}
            value={agreement}
            onChange={(v) => {
              setAgreement(v);
              track(updateVersion(db, version.id, { rankingAgreement: v })).catch(() => {});
            }}
            options={[
              { value: "oui", label: R.agreeYes },
              { value: "pas_vraiment", label: R.agreeNotReally },
              { value: "non", label: R.agreeNo },
            ]}
          />
          {(agreement === "pas_vraiment" || agreement === "non" || feedback) && (
            <div className="space-y-1.5">
              <label htmlFor="feedback" className="block text-[15px]">
                {R.missingQuestion}
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                readOnly={readOnly}
                placeholder={readOnly ? R.noNote : R.feedbackPlaceholder}
                className="min-h-24"
              />
              {!readOnly && (
                <p className="text-sm text-ink-soft">
                  {R.addAsCriterionStart}{" "}
                  <Link href={tableHref} className="text-link underline underline-offset-4">
                    {R.yourTable}
                  </Link>{" "}
                  {R.addAsCriterionEnd}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h3 className="font-medium">
            {R.projectionStart} <b className="font-semibold">{leader.opportunity.name}</b>
            {R.projectionEnd}
          </h3>
          <ChoiceButtons
            label={R.projectionLabel}
            readOnly={readOnly}
            value={feeling}
            onChange={(v) => {
              setFeeling(v);
              track(updateVersion(db, version.id, { projectionFeeling: v })).catch(() => {});
            }}
            options={[
              { value: "soulagement", label: R.relief },
              { value: "mitige", label: R.mixed },
              { value: "deception", label: R.disappointment },
            ]}
          />
          {feeling === "deception" && <p className="text-sm text-ink-soft">{R.disappointmentHint}</p>}
          {feeling === "soulagement" && <p className="text-sm text-ink-soft">{R.reliefHint}</p>}
          <label htmlFor="projection" className="sr-only">
            {R.whatYouFeel}
          </label>
          <Textarea
            id="projection"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            readOnly={readOnly}
            placeholder={readOnly ? R.noNote : R.projectionPlaceholder}
            className="min-h-24"
          />
        </Card>
      </div>
    </section>
  );
}

function NextSteps({ version, ranking, readOnly }: { version: Version; ranking: OpportunityResult[]; readOnly: boolean }) {
  const db = supabaseBrowser();
  const { track } = useSaveTracker();
  const leaderId = ranking.find((r) => r.score !== null)?.opportunity.id ?? null;
  const [chosen, setChosen] = useState(version.chosenOpportunityId ?? leaderId);
  const [steps, setSteps, flush] = useAutosavedValue<string[]>(
    [0, 1, 2].map((i) => version.nextSteps[i] ?? ""),
    (nextSteps) => updateVersion(db, version.id, { nextSteps: nextSteps.map((s) => s.trim()).filter(Boolean) }),
  );
  const chosenName = ranking.find((r) => r.opportunity.id === chosen)?.opportunity.name;
  const R = useI18n().t.results;
  const placeholders = R.stepPlaceholders;

  if (readOnly && !version.nextSteps.length) return null;
  return (
    <section aria-labelledby="prochains-pas" className="space-y-4">
      <SectionTitle id="prochains-pas" title={R.nextStepsTitle}>
        {R.nextStepsIntro}
      </SectionTitle>
      <Card className="max-w-3xl space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="chosen" className="block text-[15px] font-medium">
            {R.forWhich}
          </label>
          {readOnly ? (
            <p className="font-semibold">{chosenName ?? "—"}</p>
          ) : (
            <select
              id="chosen"
              value={chosen ?? ""}
              onChange={(e) => {
                const id = e.target.value || null;
                setChosen(id);
                track(updateVersion(db, version.id, { chosenOpportunityId: id })).catch(() => {});
              }}
              className="min-h-11 w-full rounded-xl border border-line bg-white px-3 font-semibold sm:w-auto"
            >
              {ranking.map((r) => (
                <option key={r.opportunity.id} value={r.opportunity.id}>
                  {r.opportunity.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <ol className="space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="font-script text-2xl text-accent">{i + 1}</span>
              <label htmlFor={`step-${i}`} className="sr-only">
                {R.action(i + 1)}
              </label>
              <input
                id={`step-${i}`}
                value={step}
                readOnly={readOnly}
                maxLength={200}
                onChange={(e) => setSteps(steps.map((s, j) => (j === i ? e.target.value : s)))}
                onBlur={flush}
                placeholder={readOnly ? "" : placeholders[i]}
                className="min-h-11 w-full rounded-xl border border-line bg-white px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
