"use client";

import { useEffect, useState } from "react";
import { formaterDureeEcoulee } from "./attenteTemps";

/** Chargeur d'un approfondissement (§15.4) : barre qui glisse, message tournant toutes les 6 s, temps écoulé. */
export function ChargeurEnLigne({ messages, tempsEcoule }: { messages: readonly string[]; tempsEcoule: (duree: string) => string }) {
  const [ecoule, setEcoule] = useState(0);
  useEffect(() => {
    const debut = Date.now();
    const id = window.setInterval(() => setEcoule(Date.now() - debut), 1000);
    return () => window.clearInterval(id);
  }, []);
  const index = Math.floor(ecoule / 6000) % Math.max(1, messages.length);
  return (
    <div className="space-y-3 rounded-xl bg-paper/80 p-4" aria-busy="true">
      <div className="h-1 overflow-hidden rounded-full bg-sand" aria-hidden="true">
        <div className="h-1 w-1/3 rounded-full bg-gradient-to-r from-lilas via-corail to-miel motion-safe:animate-[glisse_1.6s_ease-in-out_infinite]" />
      </div>
      <p className="text-[16px]" aria-live="polite">
        {messages[index]}
      </p>
      <p className="text-sm tabular-nums text-ink-soft">{tempsEcoule(formaterDureeEcoulee(ecoule))}</p>
    </div>
  );
}
