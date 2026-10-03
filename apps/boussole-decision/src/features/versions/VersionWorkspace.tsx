"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SaveIndicator, SaveStatusProvider, useAutosavedValue, useSaveTracker } from "@/components/autosave";
import { Badge, Button, Notice, Textarea, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { duplicateVersion, updateVersion } from "@/data/repository";
import type { Version } from "@/domain/types";
import { InlineName } from "./InlineName";

const STEPS = [
  { key: "criteres", n: 1, title: "Mes critères", text: "Ce qui compte pour toi, catégorie par catégorie." },
  { key: "opportunites", n: 2, title: "Mes opportunités", text: "Les pistes que tu veux comparer." },
  { key: "evaluation", n: 3, title: "Évaluation", text: "Chaque opportunité face à chaque critère." },
  { key: "resultats", n: 4, title: "Résultats", text: "Classement, radar, points forts et faibles." },
] as const;

export function VersionWorkspace(props: { version: Version; readOnly: boolean; nextName: string }) {
  return (
    <SaveStatusProvider>
      <Workspace {...props} />
    </SaveStatusProvider>
  );
}

function Workspace({ version, readOnly, nextName }: { version: Version; readOnly: boolean; nextName: string }) {
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
          {STEPS.map((s) => (
            <li key={s.key} className="rounded-2xl border border-line bg-paper p-5">
              <p className="font-script text-3xl text-accent">{s.n}</p>
              <p className="font-serif text-xl italic">{s.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
              <p className="mt-3 text-xs uppercase tracking-wider text-ink-soft/80">Bientôt disponible</p>
            </li>
          ))}
        </ol>
      </nav>

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
