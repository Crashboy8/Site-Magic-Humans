"use client";

import { useEffect, useState } from "react";

/**
 * Mode « séance » : plein écran, sans menus, texte agrandi, pour travailler à deux sur grand écran.
 * Échap (ou le bouton) pour en sortir.
 */
export function SeanceMode() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.toggleAttribute("data-seance", on);
    if (on && !document.fullscreenElement) root.requestFullscreen?.().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    return () => root.removeAttribute("data-seance");
  }, [on]);

  useEffect(() => {
    const onChange = () => !document.fullscreenElement && setOn(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOn(false);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/20 bg-paper px-4 text-sm text-ink hover:bg-sand"
    >
      <span aria-hidden="true">{on ? "⤡" : "⤢"}</span>
      {on ? "Quitter le mode séance" : "Mode séance"}
    </button>
  );
}
