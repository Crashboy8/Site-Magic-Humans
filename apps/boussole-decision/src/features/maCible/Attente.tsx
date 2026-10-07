"use client";

import { useEffect, useState } from "react";
import { Button, Notice, buttonClass } from "@/components/ui";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import type { CodeErreur } from "./api";
import { SANS_REESSAI, messageApi } from "./erreurs";
import { urlAppel } from "./liens";

export interface ErreurAppel {
  code: CodeErreur;
  max?: number;
}

/** Écran d'attente (cadrage court, résultat long avec textes qui changent toutes les 8 s) ou d'erreur. */
export function Attente({
  type,
  erreur,
  M,
  onReessayer,
  onRetour,
}: {
  type: "cadrage" | "resultat";
  erreur: ErreurAppel | null;
  M: MaCibleMessages;
  onReessayer: () => void;
  onRetour: () => void;
}) {
  const [indice, setIndice] = useState(0);
  useEffect(() => {
    if (type !== "resultat" || erreur) return;
    const id = setInterval(() => setIndice((i) => Math.min(i + 1, M.attente.resultat.length - 1)), 8000);
    return () => clearInterval(id);
  }, [type, erreur, M.attente.resultat.length]);

  if (erreur) {
    return (
      <div className="space-y-5">
        <Notice tone="error">{messageApi(erreur.code, M, erreur.max)}</Notice>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="secondary" onClick={onRetour}>
            {M.commun.retour}
          </Button>
          {SANS_REESSAI.includes(erreur.code) ? (
            <a className={buttonClass("primary")} href={urlAppel("quota")} target="_blank" rel="noopener">
              {M.resultat.appel.bouton}
            </a>
          ) : (
            <Button type="button" onClick={onReessayer}>
              {M.erreurs.reessayer}
            </Button>
          )}
        </div>
      </div>
    );
  }

  const texte = type === "cadrage" ? M.attente.cadrage : M.attente.resultat[indice];
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-line bg-paper px-6 py-12 text-center">
      <span aria-hidden="true" className="h-4 w-4 rounded-full bg-accent motion-safe:animate-pulse" />
      <p className="text-[18px] text-ink" role="status" aria-live="polite">
        {texte}
      </p>
      {type === "resultat" && <p className="max-w-md text-[15px] text-ink-soft">{M.attente.dureeResultat}</p>}
    </div>
  );
}
