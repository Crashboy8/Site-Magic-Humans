"use client";

import { useState } from "react";
import { ESPACE } from "@/content/espace";
import { Icone } from "@/features/espace/Icones";
import { supprimerFicheAction } from "./actions";

/** Suppression en deux temps (E.5). */
export function SupprimerFiche() {
  const [confirmer, setConfirmer] = useState(false);
  const P = ESPACE.pageFiche;
  if (!confirmer) {
    return (
      <button type="button" onClick={() => setConfirmer(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-base font-medium text-danger hover:bg-danger-soft">
        <Icone nom="poubelle" className="h-5 w-5" />
        {P.supprimer}
      </button>
    );
  }
  return (
    <form action={supprimerFicheAction} role="alert" className="space-y-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-4 text-base text-ink">
      <p>{P.confirmer}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-danger px-5 font-medium text-white">
          <Icone nom="poubelle" className="h-5 w-5" />
          {P.oui}
        </button>
        <button type="button" onClick={() => setConfirmer(false)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 bg-white px-5 font-medium text-ink">
          {P.non}
        </button>
      </div>
    </form>
  );
}
