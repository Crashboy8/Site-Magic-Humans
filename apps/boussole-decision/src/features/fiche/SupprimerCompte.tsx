"use client";

import { useActionState } from "react";
import { Button, Input } from "@/components/ui";
import { ESPACE } from "@/content/espace";
import { supprimerCompteAction } from "./actions";

/** Zone « Supprimer mon compte » de /compte/ (cachée pour un coach). */
export function SupprimerCompte() {
  const [etat, action, attente] = useActionState(supprimerCompteAction, undefined);
  const C = ESPACE.compte;
  return (
    <form action={action} className="space-y-3">
      <h2 className="text-2xl italic text-danger">{C.titre}</h2>
      <p className="text-[15px] text-ink">{C.texte}</p>
      <label htmlFor="confirmation" className="sr-only">
        SUPPRIMER
      </label>
      <Input id="confirmation" name="confirmation" placeholder="SUPPRIMER" autoComplete="off" autoCapitalize="characters" spellCheck={false} required aria-invalid={etat?.error ? true : undefined} />
      {etat?.error && (
        <p className="text-sm text-danger" role="alert">
          {etat.error}
        </p>
      )}
      <Button type="submit" variant="danger" disabled={attente}>
        {C.bouton}
      </Button>
    </form>
  );
}
