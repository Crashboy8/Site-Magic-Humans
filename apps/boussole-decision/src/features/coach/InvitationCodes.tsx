"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, Button, Field, Input, Notice, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { deposerFichePreparee, retirerFichePreparee, type FichePrepareeResume } from "@/data/fichesPreparees";
import { createInvitationCode, deleteInvitationCode, setInvitationCodeDisabled } from "@/data/repository";
import { generateInvitationCode } from "@/domain/versions";
import { CODE_CLIENT_RE, LIEN_FICHE_RE, codeClient, lienActivation, lienClient, messageClient } from "@/domain/client";
import { NIVEAUX, accesActif, dureeParDefaut, estNiveau, finAcces, type DureeAcces } from "@/domain/niveaux";
import { sansInsecables } from "@/i18n/typo";
import type { InvitationCode, NiveauAcces } from "@/domain/types";
import { useI18n } from "@/i18n/client";
import { DeposerFiche, type FicheDeposee } from "./DeposerFiche";

export interface CodeUser {
  firstName: string;
  email: string;
}

type CodeState = "disponible" | "utilise" | "desactive" | "expire";

const selectClass =
  "min-h-11 w-full rounded-xl border border-ink/20 bg-paper px-4 py-2.5 text-[16px] text-ink focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/25";

function stateOf(c: InvitationCode): CodeState {
  if (c.usedCount >= c.maxUses) return "utilise";
  if (c.disabledAt) return "desactive";
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return "expire";
  return "disponible";
}

const DUREES: DureeAcces[] = ["1an", "vie", "date"];

/**
 * Codes clients : un par client (ou un pour un groupe). Le lien copié mène à la page /client/,
 * le message copié est prêt à coller dans un mail ou un SMS, le lien d'activation porte le code déjà rempli.
 * Niveau VIP (pionnier, vip12, membre) et durée de l'accès ; fiche préparée pour un code à une seule personne.
 * fiches : null tant que le SQL des accès VIP n'est pas collé (niveau et fiche masqués).
 */
export function InvitationCodes({
  coachId,
  codes,
  usersByCode,
  siteUrl,
  fiches,
}: {
  coachId: string;
  codes: InvitationCode[];
  usersByCode: Record<string, CodeUser[]>;
  siteUrl: string;
  fiches: Record<string, FichePrepareeResume> | null;
}) {
  const router = useRouter();
  const db = supabaseBrowser();
  const [label, setLabel] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [combien, setCombien] = useState("1");
  const [lienFiche, setLienFiche] = useState("");
  const [codePerso, setCodePerso] = useState("");
  const [niveau, setNiveau] = useState<NiveauAcces | "">("");
  const [duree, setDuree] = useState<DureeAcces>("1an");
  const [dateFin, setDateFin] = useState("");
  const [fiche, setFiche] = useState<FicheDeposee | null>(null);
  const [panneau, setPanneau] = useState<string | null>(null);
  const [ficheCode, setFicheCode] = useState<FicheDeposee | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { t, locale } = useI18n();
  const k = t.coach;
  const K = t.client.coach;
  const V = t.vip.codes;
  const vipDisponible = fiches !== null;
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
    const acces = niveau ? finAcces(duree, dateFin, new Date()) : ({ ok: true, fin: null } as const);
    if (!acces.ok) return setError(V.dureeInvalide);
    const ficheAGarder = nombre === 1 && vipDisponible ? fiche : null;
    setPending(true);
    const code = perso || generateInvitationCode(Math.random, "MH");
    const fin: { resultat: Awaited<ReturnType<typeof createInvitationCode>> | null; ficheOk: boolean } = { resultat: null, ficheOk: true };
    await act(async () => {
      fin.resultat = await createInvitationCode(db, {
        code,
        coachId,
        label: label.trim(),
        maxUses: nombre,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        lienFiche: lien || null,
        niveau: niveau || null,
        accesJusquAu: acces.fin,
      });
      if (fin.resultat.resultat === "ok" && ficheAGarder) {
        try {
          await deposerFichePreparee(db, { code, coachId, fiche: ficheAGarder.fiche, methode: ficheAGarder.methode });
        } catch {
          fin.ficheOk = false;
        }
      }
    });
    setPending(false);
    if (fin.resultat === null) return;
    if (fin.resultat.resultat === "existe") return setError(K.codeExiste);
    const sans = fin.resultat.sans;
    const infos = [
      sans.includes("lien_fiche") ? K.lienFicheIndisponible : null,
      sans.includes("niveau") ? V.sansSql : null,
      fin.ficheOk ? null : V.ficheNonEnregistree,
    ].filter(Boolean);
    if (infos.length) setInfo(infos.join(" "));
    setLabel("");
    setExpiresAt("");
    setCombien("1");
    setLienFiche("");
    setCodePerso("");
    setNiveau("");
    setDuree("1an");
    setDateFin("");
    setFiche(null);
  }

  function choisirNiveau(v: string) {
    const n = estNiveau(v) ? v : "";
    setNiveau(n);
    if (n) setDuree(dureeParDefaut(n));
  }

  async function enregistrerFiche(code: string) {
    if (!ficheCode) return;
    const f = ficheCode;
    await act(() => deposerFichePreparee(db, { code, coachId, fiche: f.fiche, methode: f.methode }));
    setPanneau(null);
    setFicheCode(null);
  }

  async function copy(cle: string, texte: string) {
    await navigator.clipboard.writeText(texte);
    setCopied(cle);
    setTimeout(() => setCopied(null), 2000);
  }

  const lien = (code: string) => lienClient(code, siteUrl);
  const maintenant = new Date();
  const niveauTexte = (c: InvitationCode) => {
    if (!c.niveau) return "";
    if (!accesActif(c, maintenant)) return V.liste.echu;
    return c.accesJusquAu ? V.liste.jusquau(formatDate(c.accesJusquAu, false, locale)) : V.liste.aVie;
  };
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
        {vipDisponible && (
          <Field label={V.niveau} htmlFor="code-niveau" hint={V.niveauAide}>
            <select id="code-niveau" value={niveau} onChange={(e) => choisirNiveau(e.target.value)} className={selectClass}>
              <option value="">{V.niveaux.aucun}</option>
              {NIVEAUX.map((n) => (
                <option key={n} value={n}>
                  {V.niveaux[n]}
                </option>
              ))}
            </select>
          </Field>
        )}
        {vipDisponible && niveau && (
          <fieldset className="space-y-1.5">
            <legend className="text-[15px] font-medium text-ink">{V.duree}</legend>
            <div className="flex flex-wrap gap-2">
              {DUREES.map((d) => (
                <label key={d} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[15px] ${duree === d ? "border-accent-strong bg-blush text-ink" : "border-ink/20 bg-paper text-ink-soft"}`}>
                  <input type="radio" name="code-duree" value={d} checked={duree === d} onChange={() => setDuree(d)} className="accent-[var(--color-accent-strong)]" />
                  {V.durees[d]}
                </label>
              ))}
            </div>
            {duree === "date" && (
              <div className="pt-2">
                <label htmlFor="code-fin" className="mb-1 block text-sm text-ink-soft">
                  {V.dateFin}
                </label>
                <Input id="code-fin" type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
              </div>
            )}
          </fieldset>
        )}
        {vipDisponible && nombre === 1 && (
          <div className="space-y-1.5 sm:col-span-2">
            <p className="text-[15px] font-medium text-ink">{V.fiche}</p>
            <p className="text-sm text-ink-soft">{V.ficheAide}</p>
            <DeposerFiche valeur={fiche} onChange={setFiche} />
          </div>
        )}
        {!vipDisponible && <p className="text-sm text-ink-soft sm:col-span-2">{V.sansSql}</p>}
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
            const preparee = fiches?.[c.code];
            const ficheOuverte = panneau === c.code;
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
                    {c.niveau && <Badge tone={accesActif(c, maintenant) ? "accent" : "neutral"}>{V.niveaux[c.niveau]}</Badge>}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {c.label || k.noLabel}
                    {users.length > 0 && k.usedBy(users.map((u) => u.firstName || u.email).join(", "))}
                    {c.maxUses > 1 && k.uses(c.usedCount, c.maxUses)}
                    {c.lienFiche && K.avecFiche}
                    {niveauTexte(c)}
                    {preparee && (preparee.copieeLe ? V.liste.ficheCopiee(formatDate(preparee.copieeLe, false, locale)) : V.liste.fichePrete)}
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
                    <Button type="button" variant="secondary" onClick={() => copy(`a-${c.code}`, lienActivation(c.code, siteUrl))}>
                      {copied === `a-${c.code}` ? V.liste.activationCopiee : V.liste.copierActivation}
                    </Button>
                  )}
                  {vipDisponible && c.maxUses === 1 && !preparee?.copieeLe && (
                    <Button
                      type="button"
                      variant="secondary"
                      aria-expanded={ficheOuverte}
                      onClick={() => (setPanneau(ficheOuverte ? null : c.code), setFicheCode(null))}
                    >
                      {preparee ? V.liste.remplacer : V.liste.deposer}
                    </Button>
                  )}
                  {preparee && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => confirm(V.liste.retirerConfirmer(c.code)) && act(() => retirerFichePreparee(db, c.code))}
                    >
                      {V.liste.retirer}
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
                {ficheOuverte && (
                  <div className="w-full space-y-3 rounded-xl border border-line bg-cream p-4">
                    <p className="text-sm text-ink-soft">{V.ficheAide}</p>
                    <DeposerFiche valeur={ficheCode} onChange={setFicheCode} />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" disabled={!ficheCode} onClick={() => enregistrerFiche(c.code)}>
                        {V.liste.enregistrer}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => (setPanneau(null), setFicheCode(null))}>
                        {V.liste.fermer}
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
