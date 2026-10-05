"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SaveIndicator, SaveStatusProvider, useAutosavedValue, useSaveTracker } from "@/components/autosave";
import { Badge, Button, Notice, Textarea, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { duplicateVersion, updateVersion } from "@/data/repository";
import type { CoachComment, Version } from "@/domain/types";
import { CommentThread, type CommentViewer } from "@/features/comments/CommentThread";
import { InlineName } from "./InlineName";
import { useI18n } from "@/i18n/client";
import { useSteps } from "./StepsNav";

interface Props {
  version: Version;
  readOnly: boolean;
  nextName: string;
  comments: CoachComment[];
  commentViewer: CommentViewer | null;
}

export function VersionWorkspace(props: Props) {
  return (
    <SaveStatusProvider>
      <Workspace {...props} />
    </SaveStatusProvider>
  );
}

function Workspace({ version, readOnly, nextName, comments, commentViewer }: Props) {
  const router = useRouter();
  const db = supabaseBrowser();
  const { track } = useSaveTracker();
  const { t, locale } = useI18n();
  const v_ = t.version;
  const STEPS = useSteps();
  const locked = readOnly || version.status === "finalisee";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [note, setNote] = useAutosavedValue(version.insightNote, (insightNote) => updateVersion(db, version.id, { insightNote }));

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch {
      setError(v_.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl italic sm:text-5xl">
            <InlineName
              value={version.name}
              label={v_.versionName}
              maxLength={80}
              readOnly={readOnly}
              onSave={(name) => track(updateVersion(db, version.id, { name }))}
            />
          </h1>
          {version.status === "finalisee" ? <Badge tone="sage">{v_.finalized}</Badge> : <Badge>{v_.draft}</Badge>}
          {!readOnly && <SaveIndicator />}
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-3">
            {version.status === "brouillon" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => act(() => updateVersion(db, version.id, { status: "finalisee" }))}
              >
                {v_.markAsFinalized}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    act(async () => {
                      const id = await duplicateVersion(db, version.id, nextName);
                      router.push(`/versions/${id}/`);
                    })
                  }
                >
                  {v_.createFrom(nextName)}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => act(() => updateVersion(db, version.id, { status: "brouillon" }))}
                >
                  {v_.reopenToEdit}
                </Button>
              </>
            )}
          </div>
        )}
        {version.status === "finalisee" && !readOnly && (
          <Notice>{v_.finalizedNotice(formatDate(version.finalizedAt, false, locale))}</Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}
      </header>

      <nav aria-label={v_.steps}>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s) => {
            const inner = (
              <>
                <p className="font-script text-3xl text-accent">{s.n}</p>
                <p className="font-serif text-xl italic">{s.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
                <p className="mt-3 text-xs uppercase tracking-wider text-ink-soft/80">
                  {s.available ? (locked ? v_.stepView : v_.stepStart) : v_.comingSoon}
                </p>
              </>
            );
            return (
              <li key={s.key}>
                {s.available ? (
                  <Link
                    href={`/versions/${version.id}/${s.key}/`}
                    className="block h-full rounded-2xl border border-line bg-paper p-5 transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full rounded-2xl border border-line bg-paper/60 p-5">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {commentViewer && (
        <CommentThread
          versionId={version.id}
          targetType="version"
          targetId={version.id}
          initial={comments.filter((c) => c.targetType === "version")}
          viewer={commentViewer}
        />
      )}

      <section aria-labelledby="ressenti" className="space-y-3">
        <div>
          <h2 id="ressenti" className="text-3xl italic">
            {v_.insightTitle}
          </h2>
          <p className="max-w-2xl text-ink-soft">{v_.insightIntro}</p>
        </div>
        <label htmlFor="insight" className="sr-only">
          {v_.insightTitle}
        </label>
        <Textarea
          id="insight"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          readOnly={locked}
          placeholder={locked ? v_.noNote : v_.insightPlaceholder}
          className="min-h-48 max-w-3xl"
        />
      </section>
    </div>
  );
}
