import type { Metadata } from "next";
import { isLoveProfile } from "@/content/amour";
import { getI18n } from "@/i18n/server";
import { Notice } from "@/components/ui";
import { listCategories, listCriteria, listEvaluations, listOpportunities } from "@/data/repository";
import { ResultsView } from "@/features/results/ResultsView";
import { loadVersionContext } from "@/features/versions/context";
import { StepsNav } from "@/features/versions/StepsNav";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.results.titleResults };
}

export default async function ResultsPage({ params }: PageProps<"/versions/[versionId]/resultats">) {
  const { versionId } = await params;
  const ctx = await loadVersionContext(versionId);
  const db = await supabaseServer();
  const R = (await getI18n()).t.results;
  const [categories, criteria, opportunities, evaluations] = await Promise.all([
    listCategories(db, versionId),
    listCriteria(db, versionId),
    listOpportunities(db, versionId),
    listEvaluations(db, versionId),
  ]);

  return (
    <>
      <VersionHeader ctx={ctx} />
      <StepsNav versionId={versionId} current="resultats" />

      <header className="mb-8 space-y-3">
        <h1 className="text-4xl italic sm:text-5xl">{ctx.isOwner ? R.headingMine : R.heading}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{R.intro}</p>
        {ctx.isOwner && ctx.version.status === "finalisee" && <Notice>{R.finalizedNotice}</Notice>}
      </header>

      <ResultsView
        version={ctx.version}
        profileId={ctx.profile.id}
        talent={ctx.profile.talent}
        categories={categories}
        criteria={criteria}
        opportunities={opportunities}
        evaluations={evaluations}
        readOnly={ctx.readOnly}
        isOwner={ctx.isOwner}
        theme={isLoveProfile(ctx.profile) ? "amour" : undefined}
      />
    </>
  );
}
