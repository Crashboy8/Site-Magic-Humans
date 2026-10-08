"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button, Card, Notice } from "@/components/ui";
import { LOVE_TEXTS } from "@/content/amour";
import { decodeLoveHash, parseLovePrefill } from "@/domain/lovePrefill";
import { startLoveCompassAction } from "./actions";
import { LoveChrome } from "./LoveChrome";

function clearThemeHint() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `mh_theme=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  try {
    sessionStorage.removeItem("mh_theme");
  } catch {
    /* navigation privée */
  }
}

/** Accueil de la Boussole Relation. Le mode normal de l'import quiz n'utilise pas ce composant. */
export function LoveStart() {
  const S = LOVE_TEXTS.start;
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [pending, startTransition] = useTransition();
  const rawRef = useRef<unknown>(undefined);

  useEffect(() => {
    const decoded = decodeLoveHash(window.location.hash);
    rawRef.current = decoded;
    const show = decoded !== null && parseLovePrefill(decoded) !== null;
    const url = new URL(window.location.href);
    if (url.searchParams.get("theme") !== "amour") url.searchParams.set("theme", "amour");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    clearThemeHint();
    const id = window.setTimeout(() => setPrefilled(show), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="space-y-6">
      <LoveChrome />
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">{S.eyebrow}</p>
        <h1 className="text-4xl italic sm:text-5xl">{S.heading}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{S.intro}</p>
      </header>
      <Card className="max-w-3xl space-y-3">
        {prefilled && <Notice>{S.prefilled}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        <Button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const r = await startLoveCompassAction(rawRef.current ?? undefined);
              if (r?.error) setError(r.error);
            })
          }
          className="w-full sm:w-auto"
        >
          {pending ? S.creating : S.button}
        </Button>
        <p className="text-sm text-ink-soft">{S.note}</p>
        <p className="text-sm">
          <a href="/quiz-amour/" className="font-medium text-link underline underline-offset-4">
            {S.backToQuiz}
          </a>
        </p>
      </Card>
    </div>
  );
}
