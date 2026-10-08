"use client";

import { useRef, useState } from "react";
import { Button, cx } from "@/components/ui";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { Icone } from "./Icones";

/** Copie un texte dans le presse-papiers. Le libellé change 2 secondes, et la zone `aria-live` annonce le résultat. */
export function BoutonCopier({ texte, M, libelle, compact = false }: { texte: string; M: MaCibleMessages; libelle?: string; compact?: boolean }) {
  const [etat, setEtat] = useState<"repos" | "copie" | "echec">("repos");
  const minuteur = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function copier() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(texte);
      ok = true;
    } catch {
      ok = false;
    }
    setEtat(ok ? "copie" : "echec");
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setEtat("repos"), 2000);
  }

  return (
    <span data-ecran-seul className="inline-flex items-center gap-2">
      <Button type="button" variant="secondary" className={compact ? "w-fit px-3 py-1.5 text-sm" : undefined} onClick={copier}>
        <Icone nom="copier" className="size-4 shrink-0" />
        {etat === "copie" ? M.resultat.copie : (libelle ?? M.resultat.copier)}
      </Button>
      <span className={cx("text-sm text-ink-soft", compact && "sr-only")} aria-live="polite">
        {etat === "copie" ? M.resultat.copie : etat === "echec" ? M.resultat.copieEchec : ""}
      </span>
    </span>
  );
}
