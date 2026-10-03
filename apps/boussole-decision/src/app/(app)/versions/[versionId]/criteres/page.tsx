import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/ui";
import { listCategories, listCriteria } from "@/data/repository";
import { talentSentence } from "@/domain/methodology";
import { CriteriaEditor } from "@/features/criteria/CriteriaEditor";
import { loadVersionContext } from "@/features/versions/context";
import { StepsNav } from "@/features/versions/StepsNav";
import { VersionHeader } from "@/features/versions/VersionHeader";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mes critères" };

export default async function CriteriaPage({ params }: PageProps<"/versions/[versionId]/criteres">) {
  const { versionId } = await params;
  const ctx = await loadVersionContext(versionId);
  const db = await supabaseServer();
  const [categories, criteria] = await Promise.all([listCategories(db, versionId), listCriteria(db, versionId)]);
  const sentence = talentSentence(ctx.profile.talent);

  return (
    <>
      <VersionHeader ctx={ctx} />
      <StepsNav versionId={versionId} current="criteres" />

      <header className="mb-8 space-y-3">
        <p className="font-script text-2xl text-accent-strong">Étape 1</p>
        <h1 className="text-4xl italic sm:text-5xl">Mes critères</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">
          Pars de ton Talent Unique : ce qui l&apos;active (ton Contexte Déclencheur), ce qui l&apos;éteint (ton Anti-Contexte), puis tes
          valeurs, tes conditions de vie et ta viabilité financière. Pour chaque critère, choisis s&apos;il est{" "}
          <strong className="font-medium text-ink">pondéré</strong> (de 1 à 5) ou <strong className="font-medium text-ink">éliminatoire</strong>,
          et s&apos;il décrit ce que tu veux <strong className="font-medium text-ink">aller vers</strong> ou{" "}
          <strong className="font-medium text-ink">éviter</strong>.
        </p>
        {sentence ? (
          <blockquote className="max-w-3xl rounded-xl bg-blush/70 px-5 py-4 font-serif text-xl italic">
            {sentence}
            {ctx.profile.talent.antiContexte && (
              <p className="mt-2 font-sans text-sm not-italic text-ink-soft">
                <span className="font-medium text-ink">Anti-Contexte :</span> {ctx.profile.talent.antiContexte}
              </p>
            )}
          </blockquote>
        ) : (
          ctx.isOwner && (
            <Notice>
              Astuce : formule d&apos;abord ton Talent Unique sur{" "}
              <Link href={`/profils/${ctx.profile.id}/`} className="font-medium text-link underline underline-offset-4">
                la page du profil
              </Link>
              . Il t&apos;aidera à trouver tes critères de Contexte Déclencheur et d&apos;Anti-Contexte.
            </Notice>
          )
        )}
        {ctx.isOwner && ctx.version.status === "finalisee" && (
          <Notice>Cette version est finalisée : ses critères sont protégés. Rouvre-la ou crée une nouvelle version pour les modifier.</Notice>
        )}
      </header>

      <CriteriaEditor
        versionId={versionId}
        categories={categories}
        criteria={criteria}
        readOnly={ctx.readOnly}
        comments={ctx.comments}
        commentViewer={ctx.commentViewer}
      />
    </>
  );
}
