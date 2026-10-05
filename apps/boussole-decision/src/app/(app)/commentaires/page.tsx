import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import Link from "next/link";
import { PageTitle, formatDate } from "@/components/ui";
import { listUnreadComments } from "@/data/repository";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.coach.titleComments };
}

export default async function CommentsPage() {
  const user = await requireUser();
  const comments = await listUnreadComments(await supabaseServer(), user.id);
  const { t, locale } = await getI18n();
  const k = t.coach;

  return (
    <>
      <PageTitle eyebrow={k.commentsEyebrow} title={k.titleComments}>
        {k.commentsIntro}
      </PageTitle>
      {comments.length === 0 ? (
        <p className="text-ink-soft">{k.noNewComment}</p>
      ) : (
        <ul className="max-w-3xl space-y-3">
          {comments.map((c) => (
            <li key={c.id}>
              <Link
                href={`/versions/${c.versionId}/${c.targetType === "version" ? "" : "tableau/"}`}
                className="block rounded-2xl border border-line bg-paper p-5 transition hover:border-ink/25 hover:shadow-md"
              >
                <p className="mb-1 text-sm text-ink-soft">
                  {c.profileName} · {c.versionName} · {k.target[c.targetType]} · {formatDate(c.createdAt, true, locale)}
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
