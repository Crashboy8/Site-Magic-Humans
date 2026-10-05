import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import { listCategories, listCriteria, listEvaluations, listOpportunities } from "@/data/repository";
import { ResultsView } from "@/features/results/ResultsView";
import { loadVersionContext } from "@/features/versions/context";
import { StepsNav } from "@/features/versions/StepsNav";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mes résultats" };

export default async function ResultsPage({ params }: PageProps<"/versions/[versionId]/resultats">) {
  const { versionId } = await params;
  const ctx = await loadVersionContext(versionId);
  const db = await supabaseServer();
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
        <h1 className="text-4xl italic sm:text-5xl">{ctx.isOwner ? "Mes résultats" : "Résultats"}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">
          Ton classement, ce qui allume ton talent et ce qui risque de l&apos;éteindre dans chaque opportunité, puis la place de ton
          ressenti. Tout se met à jour quand tu modifies ton tableau.
        </p>
        {ctx.isOwner && ctx.version.status === "finalisee" && (
          <Notice>
            Cette version est finalisée : tes réponses sont protégées. Rouvre-la ou crée une nouvelle version pour les modifier.
          </Notice>
        )}
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
      />
    </>
  );
}
