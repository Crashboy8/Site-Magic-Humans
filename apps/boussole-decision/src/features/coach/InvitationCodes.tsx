"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Field, Input, Notice, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createInvitationCode, deleteInvitationCode, setInvitationCodeDisabled } from "@/data/repository";
import { generateInvitationCode } from "@/domain/versions";
import type { InvitationCode } from "@/domain/types";

export interface CodeUser {
  firstName: string;
  email: string;
}

type CodeState = "disponible" | "utilise" | "desactive" | "expire";

function stateOf(c: InvitationCode): CodeState {
  if (c.usedCount >= c.maxUses) return "utilise";
  if (c.disabledAt) return "desactive";
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return "expire";
  return "disponible";
}

/** Codes d'invitation à usage unique : un par coaché. */
export function InvitationCodes({
  coachId,
  codes,
  usersByCode,
  signupUrl,
}: {
  coachId: string;
  codes: InvitationCode[];
  usersByCode: Record<string, CodeUser[]>;
  signupUrl: string;
}) {
  const router = useRouter();
  const db = supabaseBrowser();
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch {
      setError("L'opération n'a pas abouti. Réessaie dans un instant.");
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await act(() =>
      createInvitationCode(db, {
        code: generateInvitationCode(),
        coachId,
        label: label.trim(),
        maxUses: 1,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      }),
    );
    setLabel("");
    setExpiresAt("");
    setPending(false);
  }

  async function copy(code: string) {
    await navigator.clipboard.writeText(`${signupUrl}?code=${encodeURIComponent(code)}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="grid gap-4 rounded-2xl border border-line bg-paper p-5 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <Field label="Pour qui ?" htmlFor="code-label" hint="Un code par coaché, utilisable une seule fois.">
          <Input id="code-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. : Claire D." maxLength={80} />
        </Field>
        <Field label="Expire le (facultatif)" htmlFor="code-exp">
          <Input id="code-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </Field>
        <Button type="submit" disabled={pending} className="sm:mb-7">
          {pending ? "Création…" : "Générer un code"}
        </Button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}

      {codes.length === 0 ? (
        <p className="text-ink-soft">Aucun code pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {codes.map((c) => {
            const state = stateOf(c);
            const users = usersByCode[c.code] ?? [];
            return (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className={state === "disponible" ? "font-mono tracking-wider" : "font-mono tracking-wider text-ink-soft line-through decoration-ink/30"}>
                      {c.code}
                    </span>
                    {state === "disponible" && <Badge tone="sage">Disponible</Badge>}
                    {state === "utilise" && <Badge>Utilisé</Badge>}
                    {state === "desactive" && <Badge tone="accent">Désactivé</Badge>}
                    {state === "expire" && <Badge>Expiré</Badge>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {c.label || "Sans libellé"}
                    {users.length > 0 && <> · utilisé par {users.map((u) => u.firstName || u.email).join(", ")}</>}
                    {c.maxUses > 1 && (
                      <>
                        {" "}
                        · {c.usedCount} / {c.maxUses} utilisations
                      </>
                    )}
                    {c.expiresAt && state !== "utilise" && <> · jusqu&apos;au {formatDate(c.expiresAt)}</>}
                    <> · créé le {formatDate(c.createdAt)}</>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state === "disponible" && (
                    <Button type="button" variant="secondary" onClick={() => copy(c.code)}>
                      {copied === c.code ? "✓ Lien copié" : "Copier le lien d'inscription"}
                    </Button>
                  )}
                  {state === "disponible" && (
                    <Button type="button" variant="ghost" onClick={() => act(() => setInvitationCodeDisabled(db, c.code, true))}>
                      Désactiver
                    </Button>
                  )}
                  {state === "desactive" && (
                    <Button type="button" variant="ghost" onClick={() => act(() => setInvitationCodeDisabled(db, c.code, false))}>
                      Réactiver
                    </Button>
                  )}
                  {c.usedCount === 0 && (
                    <Button
                      type="button"
                      variant="dangerGhost"
                      onClick={() => confirm(`Supprimer définitivement le code ${c.code} ?`) && act(() => deleteInvitationCode(db, c.code))}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
