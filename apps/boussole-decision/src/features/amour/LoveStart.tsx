"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button, ButtonLink, Card, Notice } from "@/components/ui";
import { amourPour } from "@/content/amourLangue";
import { lienQuizAmour } from "@/domain/editionAmour";
import { decodeLoveHash, parseLovePrefill, proposalStatus, type LovePrefill } from "@/domain/lovePrefill";
import { useI18n } from "@/i18n/client";
import { loveStatusAction, startLoveCompassAction } from "./actions";
import { LoveChrome } from "./LoveChrome";
import { QuizPick } from "./QuizPick";

function clearThemeHint() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `mh_theme=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  try {
    sessionStorage.removeItem("mh_theme");
  } catch {
    /* navigation privée */
  }
}

/** La charge du quiz est gardée le temps de l'onglet : un rechargement ne perd plus le préréglage. */
const PREFILL_KEY = "mh_amour_prefill";

function readPrefill(): unknown | null {
  const fromHash = decodeLoveHash(window.location.hash);
  try {
    if (fromHash) sessionStorage.setItem(PREFILL_KEY, JSON.stringify(fromHash));
    else {
      const kept = sessionStorage.getItem(PREFILL_KEY);
      if (kept) return JSON.parse(kept);
    }
  } catch {
    /* navigation privée */
  }
  return fromHash;
}

type Status = { tableau: string | null; labels: string[] };

/** Accueil de la Boussole Relation. Le mode normal de l'import quiz n'utilise pas ce composant. */
export function LoveStart() {
  const { locale } = useI18n();
  const S = amourPour(locale).texts.start;
  const P = amourPour(locale).texts.quizPick;
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<LovePrefill | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [sauver, setSauver] = useState(false);
  const [pending, startTransition] = useTransition();
  const rawRef = useRef<unknown>(undefined);

  useEffect(() => {
    const decoded = readPrefill();
    rawRef.current = decoded ?? undefined;
    const parsed = decoded !== null ? parseLovePrefill(decoded) : null;
    const url = new URL(window.location.href);
    const wantsSave = url.searchParams.get("sauver") === "1";
    if (url.searchParams.get("theme") !== "amour") url.searchParams.set("theme", "amour");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    clearThemeHint();
    let alive = true;
    loveStatusAction().then((s) => {
      if (!alive) return;
      setStatus(s);
      setPrefill(parsed);
      setSauver(wantsSave);
      setChosen(new Set((parsed?.proposals ?? []).filter((p) => proposalStatus(p, s.labels) === "nouveau").map((p) => p.id)));
    });
    return () => {
      alive = false;
    };
  }, []);

  const proposals = useMemo(() => prefill?.proposals ?? [], [prefill]);
  const existing = status?.tableau ?? null;
  const newCount = proposals.filter((p) => chosen.has(p.id) && proposalStatus(p, status?.labels ?? []) === "nouveau").length;
  const anyNew = proposals.some((p) => proposalStatus(p, status?.labels ?? []) === "nouveau");

  function toggle(id: string) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function start() {
    startTransition(async () => {
      setError(null);
      try {
        sessionStorage.removeItem(PREFILL_KEY);
      } catch {
        /* navigation privée */
      }
      const r = await startLoveCompassAction(rawRef.current, [...chosen], { sauver });
      if (r?.error) setError(r.error);
    });
  }

  const label = pending ? S.creating : sauver ? P.saveButton : existing ? P.addButton(newCount) : S.button;

  return (
    <div className="space-y-6">
      <LoveChrome />
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">{S.eyebrow}</p>
        <h1 className="text-4xl italic sm:text-5xl">{S.heading}</h1>
        {!existing && proposals.length === 0 && <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{S.intro}</p>}
      </header>
      <Card className="max-w-3xl space-y-4">
        {!status && <p className="text-sm text-ink-soft">{S.loading}</p>}
        {existing && <Notice>{S.resumeIntro}</Notice>}
        {sauver && <Notice>{P.saveIntro}</Notice>}
        {status && prefill && proposals.length === 0 && <Notice>{S.prefilled}</Notice>}
        {status && proposals.length > 0 && (
          <QuizPick proposals={proposals} existingLabels={status.labels} chosen={chosen} onToggle={toggle} profil={prefill?.profil ?? ""} />
        )}
        {status && existing && proposals.length > 0 && !anyNew && <Notice tone="success">{P.nothingNew}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        {status && (existing && !sauver && newCount === 0 ? (
          <ButtonLink href={existing} className="w-full sm:w-auto">
            {S.resume}
          </ButtonLink>
        ) : (
          <Button type="button" disabled={pending} aria-busy={pending} onClick={start} className="w-full sm:w-auto">
            {label}
          </Button>
        ))}
        {status && existing && newCount > 0 && !sauver && (
          <p className="text-sm">
            <Link href={existing} className="font-medium text-link underline underline-offset-4">
              {S.resume}
            </Link>
          </p>
        )}
        {!existing && <p className="text-sm text-ink-soft">{S.note}</p>}
        <p className="text-sm">
          <a href={lienQuizAmour(locale)} className="font-medium text-link underline underline-offset-4">
            {S.backToQuiz}
          </a>
        </p>
      </Card>
    </div>
  );
}
