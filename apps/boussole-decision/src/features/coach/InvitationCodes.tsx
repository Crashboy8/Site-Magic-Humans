"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Field, Input, Notice, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createInvitationCode, deleteInvitationCode, setInvitationCodeDisabled } from "@/data/repository";
import { generateInvitationCode } from "@/domain/versions";
import { CODE_CLIENT_RE, LIEN_FICHE_RE, codeClient, lienClient, messageClient } from "@/domain/client";
import { sansInsecables } from "@/i18n/typo";
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

/**
 * Codes clients : un par client (ou un pour un groupe). Le lien copié mène à la page /client/,
 * le message copié est prêt à coller dans un mail ou un SMS.
 */
export function InvitationCodes({
  coachId,
  codes,
  usersByCode,
  siteUrl,
}: {
  coachId: string;
  codes: InvitationCode[];
  usersByCode: Record<string, CodeUser[]>;
  siteUrl: string;
}) {
  const router = useRouter();
  const db = supabaseBrowser();
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [combien, setCombien] = useState("1");
  const [lienFiche, setLienFiche] = useState("");
  const [codePerso, setCodePerso] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { t, locale } = useI18n();
  const k = t.coach;
  const K = t.client.coach;
  const nombre = Math.min(500, Math.max(1, Math.floor(Number(combien) || 1)));

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
    setInfo(null);
    const perso = codePerso.trim() ? codeClient(codePerso) : "";
    if (codePerso.trim() && !CODE_CLIENT_RE.test(perso)) return setError(K.codePersoInvalide);
    const lien = nombre === 1 ? lienFiche.trim() : "";
    if (lien && !LIEN_FICHE_RE.test(lien)) return setError(K.lienFicheInvalide);
    setPending(true);
    const fin: { resultat: Awaited<ReturnType<typeof createInvitationCode>> | null } = { resultat: null };
    await act(async () => {
      fin.resultat = await createInvitationCode(db, {
        code: perso || generateInvitationCode(Math.random, "MH"),
        coachId,
        label: label.trim(),
        maxUses: nombre,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        lienFiche: lien || null,
      });
    });
    setPending(false);
    if (fin.resultat === "existe") return setError(K.codeExiste);
    if (fin.resultat === null) return;
    if (fin.resultat === "sans_lien") setInfo(K.lienFicheIndisponible);
    setLabel("");
    setExpiresAt("");
    setCombien("1");
    setLienFiche("");
    setCodePerso("");
  }

  async function copy(cle: string, texte: string) {
    await navigator.clipboard.writeText(texte);
    setCopied(cle);
    setTimeout(() => setCopied(null), 2000);
  }

  const lien = (code: string) => lienClient(code, siteUrl);
  const message = (c: InvitationCode) => sansInsecables(messageClient(t.client.message, c.maxUses === 1 ? c.label : "", lien(c.code), c.code));

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="grid gap-4 rounded-2xl border border-line bg-paper p-5 sm:grid-cols-2 sm:items-start">
        <Field label={k.forWhom} htmlFor="code-label" hint={k.forWhomHint}>
          <Input
            id="code-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={k.forWhomPlaceholder}
            maxLength={80}
          />
        </Field>
        <Field label={K.combien} htmlFor="code-combien" hint={K.combienAide}>
          <Input id="code-combien" type="number" inputMode="numeric" min={1} max={500} value={combien} onChange={(e) => setCombien(e.target.value)} />
        </Field>
        {nombre === 1 && (
          <Field label={K.lienFiche} htmlFor="code-fiche" hint={K.lienFicheAide}>
            <Input id="code-fiche" type="url" inputMode="url" spellCheck={false} value={lienFiche} onChange={(e) => setLienFiche(e.target.value)} placeholder="https://….notion.site/…" maxLength={500} />
          </Field>
        )}
        <Field label={K.codePerso} htmlFor="code-perso" hint={K.codePersoAide}>
          <Input id="code-perso" value={codePerso} onChange={(e) => setCodePerso(e.target.value)} autoCapitalize="characters" spellCheck={false} maxLength={40} className="font-mono uppercase tracking-wider" />
        </Field>
        <Field label={k.expiresOn} htmlFor="code-exp">
          <Input id="code-exp" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </Field>
        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:justify-self-start">
          {pending ? k.creating : k.generate}
        </Button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}

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
                    {c.lienFiche && K.avecFiche}
                    {c.expiresAt && state !== "utilise" && k.until(formatDate(c.expiresAt, false, locale))}
                    {k.createdOn(formatDate(c.createdAt, false, locale))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {state === "disponible" && (
                    <Button type="button" onClick={() => copy(`m-${c.code}`, message(c))}>
                      {copied === `m-${c.code}` ? K.messageCopie : K.copierMessage}
                    </Button>
                  )}
                  {state === "disponible" && (
                    <Button type="button" variant="secondary" onClick={() => copy(`l-${c.code}`, lien(c.code))}>
                      {copied === `l-${c.code}` ? K.lienCopie : K.copierLien}
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
