"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Notice, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createVersion, deleteVersion, duplicateVersion, updateVersion } from "@/data/repository";
import { nextVersionName } from "@/domain/versions";
import type { Version } from "@/domain/types";
import { InlineName } from "./InlineName";

export function VersionList({ profileId, versions, readOnly }: { profileId: string; versions: Version[]; readOnly: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const db = supabaseBrowser();
  const byId = new Map(versions.map((v) => [v.id, v]));
  const ordered = [...versions].reverse(); // la plus récente en premier

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch {
      setError("L'opération n'a pas abouti. Réessaie dans un instant.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== null}
            onClick={() =>
              run("new", async () => {
                const id = await createVersion(db, profileId, nextVersionName(versions));
                router.push(`/versions/${id}/`);
              })
            }
          >
            + Version vierge
          </Button>
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <ol className="space-y-3">
        {ordered.map((v) => {
          const source = v.sourceVersionId ? byId.get(v.sourceVersionId) : undefined;
          return (
            <li key={v.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="space-y-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl italic">
                      <InlineName
                        value={v.name}
                        label="Nom de la version"
                        maxLength={80}
                        readOnly={readOnly}
                        onSave={(name) => updateVersion(db, v.id, { name })}
                      />
                    </h3>
                    {v.status === "finalisee" ? <Badge tone="sage">✓ Finalisée</Badge> : <Badge>Brouillon</Badge>}
                  </div>
                  <p className="text-sm text-ink-soft">
                    Créée le {formatDate(v.createdAt)}
                    {source && <> · à partir de « {source.name} »</>}
                    {v.status === "finalisee" && v.finalizedAt ? <> · finalisée le {formatDate(v.finalizedAt)}</> : <> · modifiée le {formatDate(v.updatedAt, true)}</>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/versions/${v.id}/`}
                    className="inline-flex min-h-11 items-center rounded-full bg-accent-strong px-5 text-[15px] font-medium text-white hover:bg-accent-deep"
                  >
                    {readOnly || v.status === "finalisee" ? "Consulter" : "Ouvrir"}
                  </Link>
                  {!readOnly && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busy !== null}
                        onClick={() =>
                          run(`dup-${v.id}`, async () => {
                            const id = await duplicateVersion(db, v.id, nextVersionName(versions));
                            router.push(`/versions/${id}/`);
                          })
                        }
                        title="Créer la version suivante à partir de celle-ci"
                      >
                        {busy === `dup-${v.id}` ? "Duplication…" : "Dupliquer"}
                      </Button>
                      {v.status === "brouillon" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy !== null}
                          onClick={() => run(`fin-${v.id}`, () => updateVersion(db, v.id, { status: "finalisee" }))}
                        >
                          Marquer finalisée
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busy !== null}
                          onClick={() => run(`open-${v.id}`, () => updateVersion(db, v.id, { status: "brouillon" }))}
                        >
                          Rouvrir
                        </Button>
                      )}
                      {versions.length > 1 && (
                        <Button
                          type="button"
                          variant="dangerGhost"
                          disabled={busy !== null}
                          onClick={() => {
                            if (confirm(`Supprimer définitivement la version « ${v.name} » ?`)) run(`del-${v.id}`, () => deleteVersion(db, v.id));
                          }}
                        >
                          Supprimer
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
