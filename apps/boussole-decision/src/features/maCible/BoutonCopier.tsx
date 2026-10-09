"use client";

import { useRef, useState } from "react";
import { Button, cx } from "@/components/ui";
import { TEINTE, type Teinte } from "./Habillage";
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

async function ecrire(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    return false;
  }
}

/** « Copié ✓ » pendant 2 secondes, ou le message d'échec. */
function useCopie() {
  const [etat, setEtat] = useState<"repos" | "copie" | "echec">("repos");
  const minuteur = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  async function copier(texte: string) {
    const ok = await ecrire(texte);
    setEtat(ok ? "copie" : "echec");
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setEtat("repos"), 2000);
  }
  return { etat, copier };
}

/** Bouton « Copier pour mon IA » : tout le résultat en Markdown, précédé de la consigne pour l'IA. */
export function BoutonCopierIA({ texte, M, className }: { texte: string; M: MaCibleMessages; className?: string }) {
  const { etat, copier } = useCopie();
  return (
    <span data-ecran-seul className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        data-copier-ia=""
        title={M.resultat.copierIAAide}
        className={cx(
          "inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium text-white transition-colors",
          etat === "copie" ? "bg-sage" : "bg-lilas hover:bg-[#4c3274]",
          className,
        )}
        onClick={() => copier(texte)}
      >
        <Icone nom="etincelles" className="size-4 shrink-0" />
        {etat === "copie" ? M.resultat.copieOk : M.resultat.copierIA}
      </button>
      <span className={cx("text-sm", etat === "echec" ? "text-danger" : "sr-only")} aria-live="polite">
        {etat === "copie" ? M.resultat.copieOk : etat === "echec" ? M.resultat.copieEchec : ""}
      </span>
    </span>
  );
}

/**
 * Petite icône « Copier » posée sur la ligne d'un titre : copie cette partie en Markdown.
 * Dans un <summary>, le clic ne replie pas la partie.
 */
export function IconeCopier({ texte, titre, M, teinte = "lilas" }: { texte: string; titre: string; M: MaCibleMessages; teinte?: Teinte }) {
  const { etat, copier } = useCopie();
  if (!texte) return null;
  return (
    <span data-ecran-seul data-copier-partie="" className="relative inline-flex shrink-0 items-center font-sans not-italic">
      {etat !== "repos" && (
        <span
          className={cx(
            "absolute right-0 top-full z-10 -mt-1 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm",
            etat === "copie" ? "bg-sage-soft text-sage" : "w-56 rounded-xl bg-danger-soft text-danger",
          )}
          // En style direct : la typographie soignée du Cibleur (text-wrap) passerait devant une classe.
          style={etat === "copie" ? { whiteSpace: "nowrap" } : undefined}
        >
          {etat === "copie" ? M.resultat.copieOk : M.resultat.copieEchec}
        </span>
      )}
      <button
        type="button"
        aria-label={M.resultat.copierPartie(titre)}
        title={M.resultat.copierPartie(titre)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void copier(texte);
        }}
        className="inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
      >
        <span
          className={cx(
            "flex size-8 items-center justify-center rounded-full border border-current/20 transition-transform hover:scale-110",
            etat === "copie" ? "bg-sage-soft text-sage" : TEINTE[teinte].pastille,
          )}
        >
          <Icone nom={etat === "copie" ? "coche" : "copier"} className="size-4" />
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {etat === "copie" ? M.resultat.copieOk : ""}
      </span>
    </span>
  );
}
