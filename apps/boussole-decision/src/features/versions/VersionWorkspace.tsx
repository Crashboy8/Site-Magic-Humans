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
import { STEPS } from "./StepsNav";

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
      setError("L'opération n'a pas abouti. Réessaie dans un instant.");
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
              label="Nom de la version"
              maxLength={80}
              readOnly={readOnly}
              onSave={(name) => track(updateVersion(db, version.id, { name }))}
            />
          </h1>
          {version.status === "finalisee" ? <Badge tone="sage">✓ Finalisée</Badge> : <Badge>Brouillon</Badge>}
          {!readOnly && <SaveIndicator />}
        </div>

        {!readOnly && (
          <div className="flex flex-wrap gap-3">
            {version.status === "brouillon" ? (
              <Button type="button" variant="secondary" disabled={busy} onClick={() => act(() => updateVersion(db, version.id, { status: "finalisee" }))}>
                ✓ Marquer comme finalisée
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
                  Créer {nextName} à partir de celle-ci
                </Button>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => act(() => updateVersion(db, version.id, { status: "brouillon" }))}>
                  Rouvrir pour modifier
                </Button>
              </>
            )}
          </div>
        )}
        {version.status === "finalisee" && !readOnly && (
          <Notice>
            Cette version a été finalisée le {formatDate(version.finalizedAt)}. Elle est protégée : pour continuer ta réflexion, crée
            une nouvelle version à partir d&apos;elle, ou rouvre-la.
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}
      </header>

      <nav aria-label="Étapes">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const inner = (
              <>
                <p className="font-script text-3xl text-accent">{s.n}</p>
                <p className="font-serif text-xl italic">{s.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
                <p className="mt-3 text-xs uppercase tracking-wider text-ink-soft/80">
                  {s.available ? (locked ? "Consulter →" : "Commencer →") : "Bientôt disponible"}
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
        <CommentThread versionId={version.id} targetType="version" targetId={version.id} initial={comments.filter((c) => c.targetType === "version")} viewer={commentViewer} />
      )}

      <section aria-labelledby="ressenti" className="space-y-3">
        <div>
          <h2 id="ressenti" className="text-3xl italic">
            Ressenti / prise de conscience
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Note ici ce que tu ressens, ce qui te surprend, ce que tu découvres sur toi au fil de ta réflexion. C&apos;est enregistré
            automatiquement.
          </p>
        </div>
        <label htmlFor="insight" className="sr-only">
          Ressenti / prise de conscience
        </label>
        <Textarea
          id="insight"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          readOnly={locked}
          placeholder={locked ? "Aucune note." : "Ex. : en listant mes critères, je réalise que l'autonomie compte plus que le salaire…"}
          className="min-h-48 max-w-3xl"
        />
      </section>
    </div>
  );
}
