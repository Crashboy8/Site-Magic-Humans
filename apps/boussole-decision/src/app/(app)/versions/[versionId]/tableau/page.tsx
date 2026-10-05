import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listCategories, listCriteria, listEvaluations, listOpportunities } from "@/data/repository";
import { talentSentence } from "@/domain/methodology";
import { DecisionTable } from "@/features/table/DecisionTable";
import { loadVersionContext } from "@/features/versions/context";
import { StepsNav } from "@/features/versions/StepsNav";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mon tableau" };

export default async function TablePage({ params }: PageProps<"/versions/[versionId]/tableau">) {
  const { versionId } = await params;
  const ctx = await loadVersionContext(versionId);
  const db = await supabaseServer();
  const [categories, criteria, opportunities, evaluations] = await Promise.all([
    listCategories(db, versionId),
    listCriteria(db, versionId),
    listOpportunities(db, versionId),
    listEvaluations(db, versionId),
  ]);
  const sentence = talentSentence(ctx.profile.talent);

  return (
    <>
      <VersionHeader ctx={ctx} />
      <StepsNav versionId={versionId} current="tableau" />

      <header className="mb-6 space-y-3">
        <h1 className="text-4xl italic sm:text-5xl">Mon tableau de décision</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">
          Comme une feuille de calcul : <strong className="font-medium text-ink">tes critères en lignes</strong>, hiérarchisés de
          Critique à Bonus, et <strong className="font-medium text-ink">tes opportunités en colonnes</strong>. Remplis chaque case : le
          score se calcule en direct en bas du tableau.
        </p>
        {sentence && (
          <details className="max-w-3xl rounded-xl bg-blush/70 px-5 py-3">
            <summary className="cursor-pointer text-sm font-medium text-ink">Rappel : ton Talent Unique</summary>
            <p className="mt-2 font-serif text-xl italic">{sentence}</p>
            {ctx.profile.talent.antiContexte && (
              <p className="mt-1 text-sm text-ink-soft">
                <span className="font-medium text-ink">Anti-Contexte :</span> {ctx.profile.talent.antiContexte}
              </p>
            )}
          </details>
        )}
        {!sentence && ctx.isOwner && (
          <Notice>
            Astuce : formule ton Talent Unique sur{" "}
            <Link href={`/profils/${ctx.profile.id}/`} className="font-medium text-link underline underline-offset-4">
              la page du profil
            </Link>{" "}
            : il t&apos;aidera à trouver tes critères de Contexte Déclencheur et d&apos;Anti-Contexte.
          </Notice>
        )}
        {ctx.isOwner && ctx.version.status === "finalisee" && (
          <Notice>Cette version est finalisée : son tableau est protégé. Rouvre-la ou crée une nouvelle version pour le modifier.</Notice>
        )}
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
      />
    </>
  );
}
