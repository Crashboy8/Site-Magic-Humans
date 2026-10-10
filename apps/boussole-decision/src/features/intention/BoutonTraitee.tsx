"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { marquerTraiteeAction } from "./actions";

/** « Traitée » sur une demande à traiter ; « Remettre à traiter » sur une demande déjà traitée. */
export function BoutonTraitee({ id, traitee }: { id: string; traitee: boolean }) {
  const K = useI18n().t.intention.coach;
  const [attente, demarrer] = useTransition();
  const [erreur, setErreur] = useState(false);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={traitee ? "ghost" : "secondary"}
        disabled={attente}
        onClick={() =>
          demarrer(async () => {
            const r = await marquerTraiteeAction(id, !traitee);
            setErreur(!r.ok);
          })
        }
      >
        {traitee ? K.rouvrir : K.traiter}
      </Button>
      {erreur && (
        <span role="alert" className="text-sm text-danger">
          {K.erreur}
        </span>
      )}
    </span>
  );
}
