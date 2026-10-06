"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button, Card, Notice } from "@/components/ui";
import { LOVE_TEXTS } from "@/content/amour";
import { setLocaleAction } from "@/i18n/actions";
import { useI18n } from "@/i18n/client";
import { startLoveCompassAction } from "./actions";

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
  const { locale } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const langApplied = useRef(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("theme") !== "amour") {
      url.searchParams.set("theme", "amour");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
    clearThemeHint();
  }, []);

  useEffect(() => {
    if (langApplied.current) return;
    langApplied.current = true;
    if (locale !== "fr") void setLocaleAction("fr").then(() => router.refresh());
  }, [locale, router]);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">{S.eyebrow}</p>
        <h1 className="text-4xl italic sm:text-5xl">{S.heading}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{S.intro}</p>
      </header>
      <Card className="max-w-3xl space-y-3">
        {error && <Notice tone="error">{error}</Notice>}
        <Button
          type="button"
          disabled={pending}
          aria-busy={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const r = await startLoveCompassAction();
              if (r?.error) setError(r.error);
            })
          }
          className="w-full sm:w-auto"
        >
          {S.button}
        </Button>
        <p className="text-sm text-ink-soft">{S.note}</p>
      </Card>
    </div>
  );
}
