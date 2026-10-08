"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Card, Notice } from "@/components/ui";
import { DEPUIS_CIBLEUR as T } from "@/content/depuisCibleur";
import { decoderLienCibles, type LienCibles } from "@/domain/boussoleCibles";
import { startCiblesCompassAction } from "./actions";

const formatScore = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/10`;

/** Arrivée depuis Le Cibleur : la charge est dans l'ancre (#cibles=…), lue une fois puis retirée de l'adresse. */
export function CiblesStart() {
  const [charge, setCharge] = useState<LienCibles | null>(null);
  const [lu, setLu] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  useEffect(() => {
    const decode = decoderLienCibles(window.location.hash);
    if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    /* eslint-disable react-hooks/set-state-in-effect -- l'ancre n'existe qu'après l'hydratation */
    setCharge(decode);
    setLu(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function creer() {
    if (!charge) return;
    demarrer(async () => {
      setErreur(null);
      const r = await startCiblesCompassAction(charge);
      if (r?.error) setErreur(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">{T.surtitre}</p>
        <h1 className="text-4xl italic sm:text-5xl">{T.titre}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{T.intro}</p>
      </header>
      <Card className="max-w-3xl space-y-4">
        {lu && !charge && (
          <>
            <Notice tone="error">{T.invalide}</Notice>
            <p className="text-sm">
              <a href={T.urlRetour} className="font-medium text-link underline underline-offset-4">
                {T.retour}
              </a>
            </p>
          </>
        )}
        {charge && (
          <>
            <Notice tone="success">{T.recu(charge.cibles.length)}</Notice>
            <ol className="space-y-2">
              {charge.cibles.map((c, i) => (
                <li key={`${i}-${c.nom}`} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sage-soft text-[15px] font-semibold text-sage">{i + 1}</span>
                  <span className="min-w-0 flex-1 text-[16px]">{c.nom}</span>
                  <span className="shrink-0 text-[15px] tabular-nums text-ink-soft">{formatScore(c.score)}</span>
                </li>
              ))}
            </ol>
            {erreur && <Notice tone="error">{erreur}</Notice>}
            <Button type="button" disabled={enCours} aria-busy={enCours} onClick={creer} className="w-full sm:w-auto">
              {enCours ? T.creation : T.bouton}
            </Button>
            <p className="text-sm text-ink-soft">{T.note}</p>
            <p className="text-sm">
              <a href={T.urlRetour} className="font-medium text-link underline underline-offset-4">
                {T.retour}
              </a>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
