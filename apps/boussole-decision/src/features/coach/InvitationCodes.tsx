"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Field, Input, Notice, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createInvitationCode, deleteInvitationCode } from "@/data/repository";
import { generateInvitationCode } from "@/domain/versions";
import type { InvitationCode } from "@/domain/types";

export function InvitationCodes({ coachId, codes, signupUrl }: { coachId: string; codes: InvitationCode[]; signupUrl: string }) {
  const router = useRouter();
  const db = supabaseBrowser();
  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await createInvitationCode(db, {
        code: generateInvitationCode(),
        coachId,
        label: label.trim(),
        maxUses: Math.max(1, maxUses),
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      });
      setLabel("");
      setMaxUses(1);
      setExpiresAt("");
      router.refresh();
    } catch {
      setError("Le code n'a pas pu être créé.");
    } finally {
      setPending(false);
    }
  }

  async function copy(code: string) {
    const link = `${signupUrl}?code=${encodeURIComponent(code)}`;
    await navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="grid gap-4 rounded-2xl border border-line bg-paper p-5 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <Field label="Pour qui ?" htmlFor="code-label">
          <Input id="code-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex. : Claire D." />
        </Field>
        <Field label="Utilisations" htmlFor="code-uses">
          <Input id="code-uses" type="number" min={1} max={500} value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} />
        </Field>
        <Field label="Expire le (facultatif)" htmlFor="code-exp">
          <Input id="code-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer un code"}
        </Button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}

      {codes.length === 0 ? (
        <p className="text-ink-soft">Aucun code pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {codes.map((c) => {
            const expired = c.expiresAt !== null && new Date(c.expiresAt) < new Date();
            const full = c.usedCount >= c.maxUses;
            return (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="space-y-1">
                  <p className="font-mono text-[15px] tracking-wider">{c.code}</p>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                    {c.label && <span>{c.label} ·</span>}
                    <span>
                      {c.usedCount} / {c.maxUses} utilisation{c.maxUses > 1 ? "s" : ""}
                    </span>
                    {c.expiresAt && <span>· jusqu&apos;au {formatDate(c.expiresAt)}</span>}
                    {expired ? <Badge>Expiré</Badge> : full ? <Badge>Épuisé</Badge> : <Badge tone="sage">Actif</Badge>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => copy(c.code)} disabled={expired || full}>
                    {copied === c.code ? "✓ Lien copié" : "Copier le lien d'inscription"}
                  </Button>
                  <Button
                    type="button"
                    variant="dangerGhost"
                    onClick={async () => {
                      if (!confirm(`Supprimer le code ${c.code} ? Les comptes déjà créés ne sont pas affectés.`)) return;
                      await deleteInvitationCode(db, c.code);
                      router.refresh();
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
