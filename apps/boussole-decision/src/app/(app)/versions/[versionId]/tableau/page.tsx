import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { isLoveProfile } from "@/content/amour";
import { amourPour } from "@/content/amourLangue";
import { LoveChrome } from "@/features/amour/LoveChrome";
import { listCategories, listCriteria, listEvaluations, listOpportunities } from "@/data/repository";
import { LoveGuide } from "@/features/amour/LoveGuide";
import { QuizRepris } from "@/features/amour/QuizRepris";
import { getI18n } from "@/i18n/server";
import { DecisionTable } from "@/features/table/DecisionTable";
import { loadVersionContext } from "@/features/versions/context";
import { StepsNav } from "@/features/versions/StepsNav";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.table.titleTable };
}

export default async function TablePage({ params, searchParams }: PageProps<"/versions/[versionId]/tableau">) {
  const { versionId } = await params;
  const repris = Number((await searchParams).repris) || 0;
  const ctx = await loadVersionContext(versionId);
  const db = await supabaseServer();
  const [categories, criteria, opportunities, evaluations] = await Promise.all([
    listCategories(db, versionId),
    listCriteria(db, versionId),
    listOpportunities(db, versionId),
    listEvaluations(db, versionId),
  ]);
  const { t, m, locale } = await getI18n();
  const T = t.table;
  const LOVE = amourPour(locale);
  const sentence = m.talentSentence(ctx.profile.talent);
  const love = isLoveProfile(ctx.profile);

  return (
    <>
      {love && <LoveChrome />}
      <VersionHeader ctx={ctx} />
      <StepsNav versionId={versionId} current="tableau" />

      <header className="mb-6 space-y-3">
        <h1 className="text-4xl italic sm:text-5xl">{T.heading}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">
          {T.introStart} <strong className="font-medium text-ink">{T.introRows}</strong>
          {T.introMiddle} <strong className="font-medium text-ink">{love ? LOVE.table.introCols : T.introCols}</strong>
          {T.introEnd}
        </p>
        {love ? (
          <>
            <QuizRepris criteria={criteria} added={repris} locale={locale} />
            <Notice>{LOVE.texts.tableNotice}</Notice>
            <LoveGuide criteria={criteria} locale={locale} />
          </>
        ) : (
          <>
            {sentence && (
              <details className="max-w-3xl rounded-xl bg-blush/70 px-5 py-3">
                <summary className="cursor-pointer text-sm font-medium text-ink">{T.talentReminder}</summary>
                <p className="mt-2 font-serif text-xl italic">{sentence}</p>
                {ctx.profile.talent.antiContexte && (
                  <p className="mt-1 text-sm text-ink-soft">
                    <span className="font-medium text-ink">{T.antiLabel}</span> {ctx.profile.talent.antiContexte}
                  </p>
                )}
              </details>
            )}
            {!sentence && ctx.isOwner && (
              <Notice>
                {T.tipStart}{" "}
                <Link href={`/profils/${ctx.profile.id}/`} className="font-medium text-link underline underline-offset-4">
                  {T.tipLink}
                </Link>{" "}
                {T.tipEnd}
              </Notice>
            )}
          </>
        )}
        {ctx.isOwner && ctx.version.status === "finalisee" && <Notice>{T.finalizedNotice}</Notice>}
      </header>

      <DecisionTable
        versionId={versionId}
        categories={categories}
        criteria={criteria}
        opportunities={opportunities}
        evaluations={evaluations}
        weights={ctx.version.importanceWeights}
        resultsHref={`/versions/${versionId}/resultats/`}
        readOnly={ctx.readOnly}
        comments={ctx.comments}
        commentViewer={ctx.commentViewer}
        theme={love ? "amour" : undefined}
      />
    </>
  );
}
