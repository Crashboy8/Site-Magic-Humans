"use client";

import { useEffect, useMemo } from "react";
import { Button, Card, buttonClass } from "@/components/ui";
import type { ResultatClasse } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { CarteCible } from "./CarteCible";
import { AvertissementIA } from "./Confidentialite";
import { Plan30 } from "./Plan30";
import { URL_OUTILS, urlAppel, urlBoussole } from "./liens";

/** Ouvre tous les `details` avant l'impression (Ctrl+P compris) et referme ceux qui étaient fermés ensuite (§12.6). */
function useImpressionOuverte() {
  useEffect(() => {
    let fermes: HTMLDetailsElement[] = [];
    const avant = () => {
      fermes = Array.from(document.querySelectorAll<HTMLDetailsElement>("[data-resultat] details:not([open])"));
      fermes.forEach((d) => (d.open = true));
    };
    const apres = () => {
      fermes.forEach((d) => (d.open = false));
      fermes = [];
    };
    window.addEventListener("beforeprint", avant);
    window.addEventListener("afterprint", apres);
    return () => {
      window.removeEventListener("beforeprint", avant);
      window.removeEventListener("afterprint", apres);
    };
  }, []);
}

export function Resultat({
  resultat,
  fait,
  prenom,
  coches,
  locale,
  M,
  onCoche,
  onModifier,
  onEffacer,
}: {
  resultat: ResultatClasse;
  fait: string;
  prenom: string;
  coches: boolean[];
  locale: string;
  M: MaCibleMessages;
  onCoche: (index: number) => void;
  onModifier: () => void;
  onEffacer: () => void;
}) {
  const R = M.resultat;
  useImpressionOuverte();
  const date = useMemo(
    () => new Date(fait).toLocaleDateString(locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric" }),
    [fait, locale],
  );
  const lignes = resultat.classement.map((ligne) => ({ ligne, cible: resultat.cibles.find((c) => c.id === ligne.id) })).filter((x) => x.cible !== undefined);
  const anti = R.anti;

  return (
    <div data-resultat lang={resultat.langue} className="ma-cible-resultat space-y-6">
      <header className="space-y-3">
        <p data-ecran-seul className="text-sm">
          <a className="text-link underline" href={URL_OUTILS}>
            {M.commun.tousLesOutils}
          </a>
        </p>
        <p className="font-script text-2xl text-accent-strong">{R.surtitre}</p>
        <h1 tabIndex={-1} data-titre-etape className="text-4xl italic focus:outline-none sm:text-5xl">
          {R.titre}
        </h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{R.intro}</p>
        <p className="text-sm text-ink-soft">{R.faitLe(date)}</p>
      </header>

      <div data-ecran-seul className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => window.print()}>
          {R.imprimer}
        </Button>
        <Button type="button" variant="secondary" onClick={onModifier}>
          {R.modifier}
        </Button>
        <button type="button" className="min-h-11 px-2 text-[15px] text-ink-soft underline" onClick={onEffacer}>
          {R.effacer}
        </button>
      </div>

      <Card className="space-y-4 rounded-2xl p-6 sm:p-8">
        <h2 className="text-[22px] italic">{R.offreTitre}</h2>
        <p className="font-serif text-[26px] leading-snug">{resultat.offre.phrase}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <h3 className="text-[17px] font-medium">{R.avant}</h3>
            <p className="text-[16px] text-ink-soft">{resultat.offre.avant}</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-[17px] font-medium">{R.apres}</h3>
            <p className="text-[16px] text-ink-soft">{resultat.offre.apres}</p>
          </div>
        </div>
      </Card>

      <nav data-ecran-seul aria-label={R.sommaire} className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] text-ink-soft">{R.sommaire}</span>
        {lignes.map(({ ligne }, i) => (
          <a key={ligne.id} href={`#cible-${i + 1}`} className="inline-flex min-h-11 items-center rounded-full border border-ink/20 bg-paper px-4 text-[15px] hover:bg-sand">
            {R.rangs[ligne.rang]}
          </a>
        ))}
        <a href="#anti-cible" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 bg-paper px-4 text-[15px] hover:bg-sand">
          {anti.titre}
        </a>
        <a href="#plan" className="inline-flex min-h-11 items-center rounded-full border border-ink/20 bg-paper px-4 text-[15px] hover:bg-sand">
          {M.plan.titre}
        </a>
      </nav>

      {lignes.map(({ ligne, cible }, i) => (
        <CarteCible key={ligne.id} cible={cible!} ligne={ligne} rang={i + 1} prenom={prenom} M={M} />
      ))}

      <section id="anti-cible" aria-labelledby="anti-titre" className="scroll-mt-4 space-y-4 rounded-2xl border border-[#F3C1CF] bg-blush p-6 sm:p-8">
        <h2 id="anti-titre" className="text-[26px] italic">
          {anti.titre}
        </h2>
        <p className="text-[16px] text-ink-soft">{anti.intro}</p>
        <p className="text-[17px] leading-relaxed">{resultat.antiCible.portrait}</p>
        <div className="space-y-1">
          <h3 className="text-[18px] italic">{anti.signaux}</h3>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {resultat.antiCible.signaux.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-1">
          <h3 className="text-[18px] italic">{anti.lien}</h3>
          <p className="text-[16px]">{resultat.antiCible.lienAntiContexte}</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-[18px] italic">{anti.commentDire}</h3>
          <p className="text-[16px]">{resultat.antiCible.commentDire}</p>
        </div>
      </section>

      <Plan30 resultat={resultat} coches={coches} onCoche={onCoche} M={M} />

      {resultat.hypotheses.length > 0 && (
        <Card className="space-y-2 rounded-2xl p-6 sm:p-8">
          <h2 className="text-[22px] italic">{R.hypothesesTitre}</h2>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {resultat.hypotheses.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="space-y-2 rounded-2xl p-6 sm:p-8">
        <h2 className="text-[22px] italic">{R.motPourToi}</h2>
        <p className="text-[17px] leading-relaxed">{resultat.motPourToi}</p>
      </Card>

      <section data-ecran-seul aria-labelledby="boussole-titre" className="space-y-3 rounded-2xl border border-sky-line bg-sky-soft p-6 sm:p-8">
        <h2 id="boussole-titre" className="text-[22px] italic">
          {R.boussole.titre}
        </h2>
        <p className="text-[16px]">{R.boussole.texte}</p>
        <a className={buttonClass("secondary", "max-sm:w-full")} href={urlBoussole()}>
          {R.boussole.bouton}
        </a>
      </section>

      <section aria-labelledby="appel-titre" className="space-y-2 rounded-2xl border border-[#F3C1CF] bg-[#FFF0F4] p-6 sm:p-8">
        <h2 id="appel-titre" className="text-[22px] italic">
          {R.appel.titre}
        </h2>
        <p className="text-[16px] font-semibold">{R.appel.sousTitre}</p>
        <p className="text-[16px]">{R.appel.texte}</p>
        <a data-ecran-seul className={buttonClass("primary", "mt-2 max-sm:w-full")} href={urlAppel("resultat")} target="_blank" rel="noopener">
          {R.appel.bouton}
        </a>
        <p data-impression-seule className="text-[15px]">
          {R.appel.impression(urlAppel("resultat"))}
        </p>
      </section>

      <AvertissementIA M={M} />
      <p data-impression-seule className="text-center text-sm text-ink-soft">
        {R.piedImpression}
      </p>
    </div>
  );
}
