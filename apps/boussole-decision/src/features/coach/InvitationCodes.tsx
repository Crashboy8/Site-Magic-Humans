"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Field, Input, Notice, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createInvitationCode, deleteInvitationCode, setInvitationCodeDisabled } from "@/data/repository";
import { generateInvitationCode } from "@/domain/versions";
import type { InvitationCode } from "@/domain/types";
import { useI18n } from "@/i18n/client";

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
  const { t, locale } = useI18n();
  const k = t.coach;

  async function act(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch {
      setError(k.actionFailed);
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
        <Field label={k.forWhom} htmlFor="code-label" hint={k.forWhomHint}>
          <Input
            id="code-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={k.forWhomPlaceholder}
            maxLength={80}
          />
        </Field>
        <Field label={k.expiresOn} htmlFor="code-exp">
          <Input id="code-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </Field>
        <Button type="submit" disabled={pending} className="sm:mb-7">
          {pending ? k.creating : k.generate}
        </Button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}

      {codes.length === 0 ? (
        <p className="text-ink-soft">{k.noCode}</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {codes.map((c) => {
            const state = stateOf(c);
            const users = usersByCode[c.code] ?? [];
            return (
              <li key={c.code} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        state === "disponible"
                          ? "font-mono tracking-wider"
                          : "font-mono tracking-wider text-ink-soft line-through decoration-ink/30"
                      }
                    >
                      {c.code}
                    </span>
                    {state === "disponible" && <Badge tone="sage">{k.available}</Badge>}
                    {state === "utilise" && <Badge>{k.used}</Badge>}
                    {state === "desactive" && <Badge tone="accent">{k.disabled}</Badge>}
                    {state === "expire" && <Badge>{k.expired}</Badge>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {c.label || k.noLabel}
                    {users.length > 0 && k.usedBy(users.map((u) => u.firstName || u.email).join(", "))}
                    {c.maxUses > 1 && k.uses(c.usedCount, c.maxUses)}
                    {c.expiresAt && state !== "utilise" && k.until(formatDate(c.expiresAt, false, locale))}
                    {k.createdOn(formatDate(c.createdAt, false, locale))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state === "disponible" && (
                    <Button type="button" variant="secondary" onClick={() => copy(c.code)}>
                      {copied === c.code ? k.linkCopied : k.copyLink}
                    </Button>
                  )}
                  {state === "disponible" && (
                    <Button type="button" variant="ghost" onClick={() => act(() => setInvitationCodeDisabled(db, c.code, true))}>
                      {k.disable}
                    </Button>
                  )}
                  {state === "desactive" && (
                    <Button type="button" variant="ghost" onClick={() => act(() => setInvitationCodeDisabled(db, c.code, false))}>
                      {k.enable}
                    </Button>
                  )}
                  {c.usedCount === 0 && (
                    <Button
                      type="button"
                      variant="dangerGhost"
                      onClick={() => confirm(k.deleteCodeConfirm(c.code)) && act(() => deleteInvitationCode(db, c.code))}
                    >
                      {k.delete}
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
