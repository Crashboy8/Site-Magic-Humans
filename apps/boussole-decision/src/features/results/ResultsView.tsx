"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SaveIndicator, SaveStatusProvider, useAutosavedValue, useSaveTracker } from "@/components/autosave";
import { Card, Notice, Textarea, cx } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { updateVersion } from "@/data/repository";
import { EVALUATION_LABELS } from "@/domain/methodology";
import { ikigaiOf, insightOf, rankingStability, verdictOf, verificationQuestion, type OpportunityInsight } from "@/domain/results";
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
}

export function ResultsView(props: Props) {
  return (
    <SaveStatusProvider>
      <Results {...props} />
    </SaveStatusProvider>
  );
}

const ordinal = (n: number) => `${n}${n === 1 ? "er" : "e"}`;

function Results({ version, profileId, talent, categories, criteria, opportunities, evaluations, readOnly, isOwner }: Props) {
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

  if (verdict.kind === "vide") {
    return (
      <Card className="max-w-2xl space-y-3">
        <h2 className="font-serif text-2xl italic">Pas encore de résultats</h2>
        <p className="text-ink-soft">
          Ajoute au moins une opportunité et remplis quelques cases de ton tableau : tes résultats apparaîtront ici, avec ton classement, ce
          qui allume ton talent et ce qui risque de l&apos;éteindre.
        </p>
        <Link href={tableHref} className="inline-block font-medium text-link underline underline-offset-4">
          ← Retour à mon tableau
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
          Verdict
        </h2>
        <Card className="space-y-4 border-accent/30 bg-blush/50">
          <p className="font-serif text-2xl italic leading-snug sm:text-3xl">
            {verdict.kind === "seule" && (
              <>
                <b className="font-sans font-semibold not-italic">{leader.opportunity.name}</b> est la seule opportunité évaluée pour
                l&apos;instant : {formatScore(leader.score)} d&apos;alignement.
              </>
            )}
            {verdict.kind === "en_tete" && (
              <>
                <b className="font-sans font-semibold not-italic">{leader.opportunity.name}</b> arrive en tête ({formatScore(leader.score)}
                ), devant <b className="font-sans font-semibold not-italic">{verdict.runnerUp.opportunity.name}</b> (
                {formatScore(verdict.runnerUp.score)}).
              </>
            )}
            {verdict.kind === "coude_a_coude" && (
              <>
                <b className="font-sans font-semibold not-italic">{leader.opportunity.name}</b> et{" "}
                <b className="font-sans font-semibold not-italic">{verdict.runnerUp.opportunity.name}</b> sont au coude à coude (
                {formatScore(leader.score)} et {formatScore(verdict.runnerUp.score)}) : c&apos;est ton ressenti qui tranchera.
              </>
            )}
          </p>
          {allFail && (
            <Notice tone="error">
              Aucune opportunité ne respecte pour l&apos;instant tous tes non-négociables. Est-ce le moment d&apos;en chercher
              d&apos;autres, ou l&apos;un de ces critères est-il en réalité négociable ?
            </Notice>
          )}
          <p className="text-sm text-ink-soft">Le score est une boussole, pas un verdict : il éclaire ta décision, il ne la prend pas.</p>
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
                  {r.score === null ? "non évaluée" : ordinal(i + 1)}
                </span>
                <span className="font-serif text-3xl italic">{formatScore(r.score)}</span>
              </div>
              <p className="mt-1 font-semibold leading-snug">{r.opportunity.name}</p>
              <StatusBadges result={r} />
            </li>
          ))}
        </ol>
      </section>

      {/* 2. Contexte de réussite / contexte d'échec ----------------------------------------- */}
      <section aria-labelledby="contextes" className="space-y-4">
        <SectionTitle id="contextes" title="Réussite ou échec, opportunité par opportunité">
          Dans chaque opportunité, serais-tu dans ton <b className="font-medium text-ink">contexte de réussite</b> (ton Contexte
          Déclencheur) ou dans ton <b className="font-medium text-ink">contexte d&apos;échec</b> (ton Anti-Contexte) ?
        </SectionTitle>
        <div className="space-y-4">
          {insights
            .filter((ins) => ins.result.score !== null)
            .map((ins) => (
              <InsightCard key={ins.result.opportunity.id} insight={ins} />
            ))}
        </div>
      </section>

      {/* 3. Garde-fous ------------------------------------------------------------------------ */}
      <Guardrails
        insights={insights}
        leader={leader}
        chosenId={version.chosenOpportunityId}
        talent={talent}
        profileId={profileId}
        isOwner={isOwner}
      />

      {/* Ikigai ------------------------------------------------------------------------------- */}
      <section aria-labelledby="ikigai" className="space-y-4">
        <SectionTitle id="ikigai" title="L'ikigai de chaque opportunité">
          Quatre cercles qui comptent chacun pour 25 % : <b className="font-medium text-ink">ce que j&apos;aime</b> (ma qualité de vie, sans
          mon Anti-Contexte), <b className="font-medium text-ink">ce en quoi je suis doué·e</b> (mon Contexte Déclencheur),{" "}
          <b className="font-medium text-ink">ce dont le monde a besoin</b> (mes valeurs, mes choix) et{" "}
          <b className="font-medium text-ink">ce pour quoi je peux être payé·e</b> (ma rémunération). Plus les quatre sont réunis, plus le
          centre devient doré.
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
      </section>

      {/* 4. Radar ------------------------------------------------------------------------------ */}
      <section aria-labelledby="radar" className="space-y-4">
        <SectionTitle id="radar" title="Le radar de tes opportunités">
          Le score de chaque opportunité, catégorie par catégorie : plus la forme est grande, plus l&apos;opportunité te correspond. Sur
          l&apos;axe Anti-Contexte, un score élevé veut dire que le risque est évité.
        </SectionTitle>
        <Card>
          <Radar categories={categories} opportunities={opportunities} results={ranking} />
        </Card>
      </section>

      {/* 5. Questions à poser ------------------------------------------------------------------ */}
      <Questions ranking={ranking} />

      {/* 6. Solidité du classement ------------------------------------------------------------ */}
      {stability && (
        <section aria-labelledby="solidite" className="space-y-4">
          <SectionTitle id="solidite" title="Ton classement tient-il ?">
            On a refait le calcul en faisant compter chaque catégorie deux fois plus, puis deux fois moins.
          </SectionTitle>
          <Card className="space-y-3">
            {stability.flips.length === 0 ? (
              <p>
                ✅ <b className="font-medium">Ton classement est solide.</b> Même si une catégorie comptait deux fois plus ou deux fois
                moins pour toi, <b className="font-semibold">{stability.leader.name}</b> resterait en tête.
              </p>
            ) : (
              <>
                <p>
                  ⚖️ <b className="font-medium">Ton classement est sensible.</b> <b className="font-semibold">{stability.leader.name}</b>{" "}
                  est en tête, mais :
                </p>
                <ul className="list-disc space-y-1 pl-6">
                  {stability.flips.map((f) => (
                    <li key={`${f.categoryId}-${f.emphasis}`}>
                      si « {f.categoryLabel} » comptait <b className="font-medium">deux fois {f.emphasis}</b> pour toi,{" "}
                      <b className="font-semibold">{f.newLeader.name}</b> passerait devant.
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-ink-soft">
                  La vraie question devient : quelle place veux-tu donner à ces catégories ? Tu peux ajuster les niveaux d&apos;importance
                  et ton barème dans{" "}
                  <Link href={tableHref} className="text-link underline underline-offset-4">
                    ton tableau
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

function StatusBadges({ result }: { result: OpportunityResult }) {
  const redLine = result.antiContextAlerts.some((a) => a.severity === "ligne_rouge");
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
      {result.status === "non_conforme" && (
        <span className="rounded-full bg-danger-soft px-2 py-0.5 text-danger">🔒 Non-négociable non respecté</span>
      )}
      {result.antiContextAlerts.length > 0 && (
        <span className="rounded-full bg-danger-soft px-2 py-0.5 text-danger">
          ⚡ {redLine ? "Ligne rouge franchie" : "Anti-Contexte présent"}
        </span>
      )}
      {result.toVerify.length > 0 && (
        <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">{result.toVerify.length} à vérifier</span>
      )}
    </div>
  );
}

const valueLabel = (d: CriterionResult) => (d.value ? EVALUATION_LABELS[d.criterion.direction][d.value] : "");

function ItemList({ items, empty }: { items: CriterionResult[]; empty?: string }) {
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
  return (
    <article className="rounded-2xl border border-line bg-paper p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{result.opportunity.name}</h3>
        <span className="font-serif text-2xl italic">{formatScore(result.score)}</span>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-sage-soft/60 p-4">
          <h4 className="font-medium">🌱 Ce qui allume ton talent ici</h4>
          {insight.ignites.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Ton Contexte Déclencheur est là</p>
              <ItemList items={insight.ignites} />
            </div>
          )}
          {insight.assets.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Autres atouts</p>
              <ItemList items={insight.assets} />
            </div>
          )}
          {good === 0 && <p className="text-sm text-ink-soft">Rien de franchement favorable pour l&apos;instant.</p>}
        </div>
        <div className="space-y-3 rounded-xl bg-danger-soft/50 p-4">
          <h4 className="font-medium">⚡ Ce qui risque de t&apos;éteindre</h4>
          {failed.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-danger">Non-négociables non respectés</p>
              <ItemList items={failed} />
            </div>
          )}
          {insight.extinguishers.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Ton Anti-Contexte est présent</p>
              <ItemList items={insight.extinguishers} />
            </div>
          )}
          {insight.missing.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">Ce qui te manquerait</p>
              <ItemList items={insight.missing} />
            </div>
          )}
          {insight.watch.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-ink-soft">À surveiller</p>
              <ItemList items={insight.watch} />
            </div>
          )}
          {bad + insight.watch.length === 0 && <p className="text-sm text-ink-soft">Aucun signal de contexte d&apos;échec. 👍</p>}
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
  const target =
    insights.find((i) => i.result.opportunity.id === chosenId) ?? insights.find((i) => i.result.opportunity.id === leader.opportunity.id);
  if (!target) return null;
  const signals = [...target.extinguishers, ...target.watch];
  const failure = talent.failureSituations.trim();
  return (
    <section aria-labelledby="garde-fous" className="space-y-4">
      <SectionTitle id="garde-fous" title="Tes garde-fous">
        Même la meilleure opportunité a ses pièges. Si tu choisis <b className="font-semibold text-ink">{target.result.opportunity.name}</b>
        , voici les signaux à surveiller pour ne pas glisser dans ton contexte d&apos;échec.
      </SectionTitle>
      <Card className="space-y-4">
        {signals.length > 0 ? (
          <ul className="space-y-2">
            {signals.map((d) => (
              <li key={d.criterion.id} className="flex gap-2">
                <span aria-hidden>👁️</span>
                <span>
                  Surveille : <b className="font-medium">{d.criterion.label}</b>{" "}
                  <span className="text-sm text-ink-soft">({valueLabel(d).toLowerCase()} dans cette opportunité)</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun risque d&apos;Anti-Contexte repéré dans ton tableau pour cette opportunité.</p>
        )}
        {failure ? (
          <div className="rounded-xl bg-blush/70 p-4">
            <p className="text-xs uppercase tracking-wider text-ink-soft">Tes contextes d&apos;échec vécus</p>
            <p className="mt-1 whitespace-pre-line font-serif text-lg italic leading-snug">{failure}</p>
            <p className="mt-2 text-sm text-ink-soft">
              Pose-toi la question : dans cette opportunité, qu&apos;est-ce qui pourrait te faire glisser là-dedans ? Et qu&apos;est-ce qui
              t&apos;en protégera ?
            </p>
          </div>
        ) : (
          isOwner && (
            <p className="text-sm text-ink-soft">
              💡 Décris tes contextes d&apos;échec vécus (« quand je suis trop isolé, derrière un écran toute la journée… ») sur{" "}
              <Link href={`/profils/${profileId}/`} className="text-link underline underline-offset-4">
                ton profil
              </Link>{" "}
              : ils apparaîtront ici comme garde-fous.
            </p>
          )
        )}
      </Card>
    </section>
  );
}

function Questions({ ranking }: { ranking: OpportunityResult[] }) {
  const withQuestions = ranking.filter((r) => r.toVerify.length > 0);
  if (withQuestions.length === 0) return null;
  return (
    <section aria-labelledby="questions" className="space-y-4">
      <SectionTitle id="questions" title="Ce qu'il te reste à vérifier">
        Les cases « ? À vérifier » ou vides ne comptent pas dans le score. Voici les questions à poser (en entretien, à un futur collègue, à
        un client…) pour compléter ton tableau.
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
                    {verificationQuestion(d.criterion)}
                    {d.criterion.nonNegotiable && <span className="ml-1 text-xs font-medium text-danger">non négociable</span>}
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
  const [note, setNote] = useAutosavedValue(version.projectionNote, (projectionNote) => updateVersion(db, version.id, { projectionNote }));

  return (
    <section aria-labelledby="ressenti" className="space-y-4">
      <SectionTitle id="ressenti" title="Et ton ressenti ?">
        Les chiffres ne disent pas tout. C&apos;est souvent quand le classement surprend qu&apos;on découvre le critère qui compte vraiment.
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="font-medium">Ce classement correspond-il à ton ressenti ?</h3>
          <ChoiceButtons
            label="Ce classement correspond-il à ton ressenti ?"
            readOnly={readOnly}
            value={agreement}
            onChange={(v) => {
              setAgreement(v);
              track(updateVersion(db, version.id, { rankingAgreement: v })).catch(() => {});
            }}
            options={[
              { value: "oui", label: "👍 Oui" },
              { value: "pas_vraiment", label: "🤔 Pas vraiment" },
              { value: "non", label: "👎 Non" },
            ]}
          />
          {(agreement === "pas_vraiment" || agreement === "non" || feedback) && (
            <div className="space-y-1.5">
              <label htmlFor="feedback" className="block text-[15px]">
                Qu&apos;est-ce qui manque dans tes critères ? Qu&apos;est-ce que ton intuition sait que le tableau ignore ?
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                readOnly={readOnly}
                placeholder={readOnly ? "Aucune note." : "Ex. : je réalise que l'ambiance d'équipe compte plus que je ne le pensais…"}
                className="min-h-24"
              />
              {!readOnly && (
                <p className="text-sm text-ink-soft">
                  Si c&apos;est un critère, ajoute-le dans{" "}
                  <Link href={tableHref} className="text-link underline underline-offset-4">
                    ton tableau
                  </Link>{" "}
                  : le classement se mettra à jour.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h3 className="font-medium">
            Imagine : demain, tu as signé pour <b className="font-semibold">{leader.opportunity.name}</b>. Que ressens-tu en premier ?
          </h3>
          <ChoiceButtons
            label="Ce que tu ressens en premier"
            readOnly={readOnly}
            value={feeling}
            onChange={(v) => {
              setFeeling(v);
              track(updateVersion(db, version.id, { projectionFeeling: v })).catch(() => {});
            }}
            options={[
              { value: "soulagement", label: "😌 Du soulagement" },
              { value: "mitige", label: "😐 C'est mitigé" },
              { value: "deception", label: "😟 De la déception" },
            ]}
          />
          {feeling === "deception" && (
            <p className="text-sm text-ink-soft">
              Ton intuition te dit peut-être quelque chose que tes critères ne disent pas encore. Vers quelle autre opportunité ton cœur
              est-il parti ?
            </p>
          )}
          {feeling === "soulagement" && <p className="text-sm text-ink-soft">Ta tête et ton intuition vont dans le même sens. 🧭</p>}
          <label htmlFor="projection" className="sr-only">
            Ce que tu ressens
          </label>
          <Textarea
            id="projection"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            readOnly={readOnly}
            placeholder={readOnly ? "Aucune note." : "Note ce qui te vient, sans filtre…"}
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
  const placeholders = [
    "Ex. : appeler une personne qui fait déjà ce métier",
    "Ex. : demander une journée d'immersion",
    "Ex. : en parler à mon coach lors de la prochaine séance",
  ];

  if (readOnly && !version.nextSteps.length) return null;
  return (
    <section aria-labelledby="prochains-pas" className="space-y-4">
      <SectionTitle id="prochains-pas" title="Mes prochains pas">
        Une décision se construit en avançant. Note trois actions concrètes, petites et datées si possible.
      </SectionTitle>
      <Card className="max-w-3xl space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="chosen" className="block text-[15px] font-medium">
            Pour quelle opportunité ?
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
                Action {i + 1}
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
