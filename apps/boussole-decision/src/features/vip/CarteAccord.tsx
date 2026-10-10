"use client";

import { useActionState } from "react";
import { Icone } from "@/features/espace/Icones";
import { useI18n } from "@/i18n/client";
import { accordFicheAction } from "./actions";

/**
 * La case d'accord, jamais cochée d'avance. En haut de Mon espace à la première connexion,
 * et sur la page Tes données tant que l'accord n'est pas donné.
 * ficheEnAttente : Pierre a déposé une fiche pour ce compte, elle arrive dès que la case est cochée.
 */
export function CarteAccord({ retour, ficheEnAttente = false }: { retour: "espace" | "donnees"; ficheEnAttente?: boolean }) {
  const [etat, action, envoi] = useActionState(accordFicheAction, {});
  const A = useI18n().t.vip.accord;
  return (
    <section aria-labelledby="accord-fiche" className="rounded-[14px] border border-sage/30 bg-sage-soft p-5 sm:p-6">
      <h2 id="accord-fiche" className="flex items-center gap-2.5 font-serif text-[24px] italic leading-tight sm:text-[26px]">
        <Icone nom="cadenas" className="h-6 w-6 shrink-0 text-sage" />
        {A.titre}
      </h2>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">{A.texte}</p>
      {ficheEnAttente && (
        <p className="mt-2 flex max-w-2xl items-start gap-2 text-base font-medium leading-relaxed text-ink">
          <Icone nom="document" className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
          {A.prete}
        </p>
      )}
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="retour" value={retour} />
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-sage/30 bg-white px-4 py-3 text-base text-ink">
          <input type="checkbox" name="accord" value="oui" className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-sage)]" />
          <span>
            <span className="font-medium">{A.case}</span>
            <span className="mt-0.5 block text-[15px] text-ink-soft">{A.aide}</span>
          </span>
        </label>
        {etat.erreur && (
          <p role="alert" className="text-sm text-danger">
            {etat.erreur}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            disabled={envoi}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent-strong px-6 text-base font-medium text-white disabled:opacity-60 sm:w-auto"
          >
            {envoi ? A.envoi : A.bouton}
          </button>
          {retour === "espace" && (
            <a href="/boussole-decision/tes-donnees/" className="text-base font-medium text-link underline underline-offset-4">
              {A.enSavoirPlus}
            </a>
          )}
        </div>
      </form>
    </section>
  );
}
