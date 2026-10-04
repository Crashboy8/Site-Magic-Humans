import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, formatDate } from "@/components/ui";
import { listUnreadComments } from "@/data/repository";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Commentaires" };

const TARGET_LABELS = { version: "sur la version", criterion: "sur un critère", opportunity: "sur une opportunité" } as const;

export default async function CommentsPage() {
  const user = await requireUser();
  const comments = await listUnreadComments(await supabaseServer(), user.id);

  return (
    <>
      <PageTitle eyebrow="Ton coach t'a écrit" title="Commentaires">
        Les nouveaux commentaires de ton coach sur les profils que tu partages avec lui. Ouvre la version concernée pour les lire en
        contexte : ils seront alors marqués comme lus.
      </PageTitle>
      {comments.length === 0 ? (
        <p className="text-ink-soft">Aucun nouveau commentaire. ✓</p>
      ) : (
        <ul className="max-w-3xl space-y-3">
          {comments.map((c) => (
            <li key={c.id}>
              <Link
                href={`/versions/${c.versionId}/${c.targetType === "version" ? "" : "tableau/"}`}
                className="block rounded-2xl border border-line bg-paper p-5 transition hover:border-ink/25 hover:shadow-md"
              >
                <p className="mb-1 text-sm text-ink-soft">
                  {c.profileName} · {c.versionName} · {TARGET_LABELS[c.targetType]} · {formatDate(c.createdAt, true)}
                </p>
                <p className="line-clamp-3 whitespace-pre-line">{c.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
