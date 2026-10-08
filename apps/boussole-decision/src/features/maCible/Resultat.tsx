"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, buttonClass } from "@/components/ui";
import type { ResultatClasse } from "@/domain/maCible/types";
import { iconeCible } from "@/domain/maCible/iconeCible";
import { alertePlaisirPressenti, scorePressenti } from "@/domain/maCible/scores";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BoutonCopier } from "./BoutonCopier";
import { CarteCible } from "./CarteCible";
import { AvertissementIA } from "./Confidentialite";
import { IndicateurEtapes } from "./IndicateurEtapes";
import { AnneauScore, CLASSE_CARTE, PastilleIcone, Separateur, TEINTE, TitreIcone } from "./Habillage";
import { Plan30 } from "./Plan30";
import { BarreSommaire, ColonneSommaire, type EntreeSommaire } from "./SommaireResultat";
import type { EtapeBarre, Etat } from "./etat";
import { exporterResultat, nomFichierExport } from "./export";
import { URL_OUTILS, urlAppel, urlBoussole } from "./liens";

const SOUS = [
  ["qui", ""],
  ["douleur", "-douleur"],
  ["offre", "-offre"],
  ["lieux", "-lieux"],
  ["linkedin", "-linkedin"],
  ["messages", "-messages"],
  ["test", "-test"],
] as const;

function clesAncre(id: string): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  const parent = id.match(/^(cible-\d+)/);
  if (parent) o[parent[1]] = true;
  if (!parent || id !== parent[1]) o[id] = true;
  return o;
}

function ouvertsDepart(lignes: { ligne: { rang: string } }[]): Record<string, boolean> {
  const o: Record<string, boolean> = {};
  lignes.forEach(({ ligne }, i) => {
    o[`cible-${i + 1}`] = ligne.rang === "prioritaire";
  });
  return o;
}

export function Resultat({
  resultat,
  fait,
  etat,
  prenom,
  coches,
  locale,
  M,
  nbHistorique,
  lecture = false,
  bandeauLecture,
  onCoche,
  onModifier,
  onEffacer,
  onAller,
  onHistorique,
  onReprendre,
  onSupprimer,
}: {
  resultat: ResultatClasse;
  fait: string;
  etat: Etat;
  prenom: string;
  coches: boolean[];
  locale: string;
  M: MaCibleMessages;
  nbHistorique: number;
  lecture?: boolean;
  bandeauLecture?: string;
  onCoche: (index: number) => void;
  onModifier: () => void;
  onEffacer: () => void;
  onAller: (etape: EtapeBarre) => void;
  onHistorique: () => void;
  onReprendre?: () => void;
  onSupprimer?: () => void;
}) {
  const R = M.resultat;
  const impressionRef = useRef(false);
  const [impression, setImpression] = useState(false);
  const lignes = resultat.classement
    .map((ligne) => ({ ligne, cible: resultat.cibles.find((c) => c.id === ligne.id) }))
    .filter((x) => x.cible !== undefined);
  const [ouverts, setOuverts] = useState<Record<string, boolean>>(() => ouvertsDepart(lignes));
  const prioritaire = lignes.findIndex(({ ligne }) => ligne.rang === "prioritaire");
  const rangPrioritaire = (prioritaire >= 0 ? prioritaire : 0) + 1;
  const [actif, setActif] = useState(`cible-${rangPrioritaire}`);
  const [barre, setBarre] = useState(false);
  const [haut, setHaut] = useState(false);

  const date = useMemo(
    () => new Date(fait).toLocaleDateString(locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric" }),
    [fait, locale],
  );

  useEffect(() => {
    const avant = () => {
      impressionRef.current = true;
      setImpression(true);
    };
    const apres = () => {
      impressionRef.current = false;
      setImpression(false);
    };
    window.addEventListener("beforeprint", avant);
    window.addEventListener("afterprint", apres);
    return () => {
      window.removeEventListener("beforeprint", avant);
      window.removeEventListener("afterprint", apres);
    };
  }, []);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id) return;
    /* eslint-disable react-hooks/set-state-in-effect -- l'ancre n'existe qu'après l'hydratation */
    setOuverts((s) => ({ ...s, ...clesAncre(id) }));
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const entete = document.querySelector("[data-entete-resultat]");
    if (!entete) return;
    const io = new IntersectionObserver(([e]) => setBarre(!e.isIntersecting), { threshold: 0 });
    io.observe(entete);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const noeuds = Array.from(document.querySelectorAll<HTMLElement>("[data-ancre]"));
    const visibles = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visibles.set(e.target, e.intersectionRatio);
          else visibles.delete(e.target);
        }
        const meilleur = [...visibles.entries()].sort((a, b) => b[1] - a[1] || a[0].getBoundingClientRect().top - b[0].getBoundingClientRect().top)[0];
        if (meilleur) setActif(meilleur[0].id);
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] },
    );
    noeuds.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lignes.length]);

  useEffect(() => {
    const onScroll = () => setHaut(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function onOuvert(id: string, ouvert: boolean) {
    if (impressionRef.current) return;
    setOuverts((s) => ({ ...s, [id]: ouvert }));
  }
  function estOuvert(id: string) {
    return impression || Boolean(ouverts[id]);
  }
  function basculerTout(ouvert: boolean) {
    const o: Record<string, boolean> = {};
    lignes.forEach((_, i) => {
      const r = i + 1;
      for (const cle of [`cible-${r}`, `cible-${r}-lieux`, `cible-${r}-linkedin`, `cible-${r}-messages`, `cible-${r}-test`, `cible-${r}-grille`]) o[cle] = ouvert;
    });
    setOuverts(o);
  }
  function allerAncre(id: string) {
    setOuverts((s) => ({ ...s, ...clesAncre(id) }));
    const url = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, "", url);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  const cibleActive = actif.match(/^(cible-\d+)/)?.[1] ?? "";
  const entrees: EntreeSommaire[] = [
    { id: "offre", libelle: R.sommaireOffre },
    ...lignes.map(({ ligne, cible }, i) => {
      const rang = i + 1;
      const id = `cible-${rang}`;
      return {
        id,
        libelle: R.sommaireCible(rang, cible!.nom, R.score(ligne.score)),
        sous:
          cibleActive === id
            ? SOUS.map(([cle, suffixe]) => ({
                id: suffixe ? `${id}${suffixe}` : id,
                libelle: R.sousEntrees[cle],
              }))
            : undefined,
      };
    }),
    ...(resultat.autresPistes.length > 0 ? [{ id: "pistes", libelle: R.sommairePistes }] : []),
    { id: "anti-cible", libelle: R.sommaireAnti },
    { id: "plan", libelle: R.sommairePlan },
    { id: "hypotheses", libelle: R.sommaireHypotheses },
  ];

  const exporte = exporterResultat(resultat, prenom);
  function telecharger() {
    const blob = new Blob([exporte.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomFichierExport(fait);
    a.click();
    URL.revokeObjectURL(url);
  }

  const sommaireProps = {
    entrees,
    actif,
    onAller: allerAncre,
    urlPierre: urlAppel("resultat-sommaire"),
    parlerPierre: R.parlerPierre,
    allerA: R.sommaire,
  };

  return (
    <div data-resultat lang={resultat.langue} className="ma-cible-resultat">
      <BarreSommaire {...sommaireProps} barreVisible={barre} fermer={R.fermer} />
      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <ColonneSommaire {...sommaireProps} />
        <div className="min-w-0 space-y-6">
          <header data-entete-resultat className="space-y-3">
            {!lecture && (
              <div data-ecran-seul>
                <IndicateurEtapes etat={etat} M={M} onAller={onAller} />
              </div>
            )}
            <p data-ecran-seul className="text-sm">
              <a className="text-link underline" href={URL_OUTILS}>
                {M.commun.tousLesOutils}
              </a>
              {" · "}
              <button type="button" className="text-link underline" onClick={onHistorique}>
                {R.historiqueLien(nbHistorique)}
              </button>
            </p>
            <p className="font-script text-2xl text-accent-strong">{R.surtitre}</p>
            <h1 tabIndex={-1} data-titre-etape className="flex items-center gap-3 text-4xl italic focus:outline-none sm:text-5xl">
              <PastilleIcone nom="cible" teinte="corail" />
              <span className="min-w-0">{R.titre}</span>
            </h1>
            <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{R.intro}</p>
            <p className="text-sm text-ink-soft">{R.faitLe(date)}</p>
          </header>

          {lecture && bandeauLecture && (
            <div role="status" className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-blush p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[16px]">{bandeauLecture}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onReprendre}>
                  {R.reprendre}
                </Button>
                <Button type="button" variant="secondary" onClick={onSupprimer}>
                  {R.supprimer}
                </Button>
              </div>
            </div>
          )}

          <AvertissementIA M={M} />

          <div data-ecran-seul className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => window.print()}>
              {R.imprimer}
            </Button>
            <BoutonCopier texte={exporte.texte} M={M} libelle={R.copierTout} />
            <Button type="button" variant="secondary" onClick={telecharger}>
              {R.telecharger}
            </Button>
            <Button type="button" variant="secondary" onClick={() => basculerTout(true)}>
              {R.toutDeplier}
            </Button>
            <Button type="button" variant="secondary" onClick={() => basculerTout(false)}>
              {R.toutReplier}
            </Button>
            {!lecture && (
              <>
                <Button type="button" variant="secondary" onClick={onModifier}>
                  {R.modifier}
                </Button>
                <button type="button" className="min-h-11 px-2 text-[15px] text-ink-soft underline" onClick={onEffacer}>
                  {R.effacer}
                </button>
              </>
            )}
          </div>

          <Card id="offre" data-ancre="" className={`${CLASSE_CARTE} scroll-mt-20 space-y-4 rounded-2xl border-l-4 border-l-corail p-6 sm:p-8`}>
            <TitreIcone icone="cadeau" teinte="corail" className="rounded-xl bg-gradient-to-r from-corail-soft to-transparent px-3 py-2 text-[22px] italic">
              {R.offreTitre}
            </TitreIcone>
            <p className="font-serif text-[26px] leading-snug">{resultat.offre.phrase}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-[17px] font-medium">
                  <PastilleIcone nom="fleche" teinte="miel" taille="sm" />
                  <span>{R.avant}</span>
                </h3>
                <p className="text-[16px] text-ink-soft">{resultat.offre.avant}</p>
              </div>
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-[17px] font-medium">
                  <PastilleIcone nom="etincelles" teinte="eau" taille="sm" />
                  <span>{R.apres}</span>
                </h3>
                <p className="text-[16px] text-ink-soft">{resultat.offre.apres}</p>
              </div>
            </div>
          </Card>

          {lignes.map(({ ligne, cible }, i) => (
            <div key={ligne.id} className="space-y-6">
              <CarteCible
                cible={cible!}
                ligne={ligne}
                rang={i + 1}
                prenom={prenom}
                M={M}
                corpsOuvert={estOuvert(`cible-${i + 1}`)}
                ouvert={estOuvert}
                onOuvert={onOuvert}
              />
              {ligne.rang === "prioritaire" && (
                <section data-ecran-seul className="space-y-2 rounded-2xl border border-[#F3C1CF] bg-[#FFF0F4] p-6 sm:p-8">
                  <h2 className="text-[22px] italic">{R.appelApres.titre}</h2>
                  <p className="text-[16px] font-semibold">{R.appelApres.sousTitre}</p>
                  <a className={buttonClass("primary", "mt-2 max-sm:w-full")} href={urlAppel("resultat-apres-cible")} target="_blank" rel="noopener">
                    {R.appelApres.bouton}
                  </a>
                </section>
              )}
            </div>
          ))}

          {resultat.autresPistes.length > 0 && (
            <section id="pistes" data-ancre="" className={`${CLASSE_CARTE} scroll-mt-20 space-y-4 rounded-2xl border-l-4 border-miel bg-gradient-to-br from-miel-soft to-paper p-5 sm:p-6`}>
              <Separateur />
              <TitreIcone icone="couches" teinte="miel" className="font-serif text-[26px] italic">
                {R.pistesTitre}
              </TitreIcone>
              <p className="text-[16px] text-ink-soft">{R.pistesIntro}</p>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...resultat.autresPistes]
                  .sort((a, b) => scorePressenti(b.notes) - scorePressenti(a.notes))
                  .map((p) => (
                    <li key={p.id} className="space-y-3 rounded-2xl border border-line bg-paper p-4 shadow-[0_8px_20px_rgba(58,47,36,0.06)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="flex items-center gap-2 text-[18px] font-medium">
                          <PastilleIcone nom={iconeCible(p.nom, p.enUneLigne)} teinte="miel" taille="sm" />
                          <span className="min-w-0">{p.nom}</span>
                        </h3>
                        <span className="inline-flex min-h-11 items-center rounded-full bg-sand px-3 text-xs font-medium">{R.marche[p.marche]}</span>
                        {p.depuisIdees.length > 0 && <span className="inline-flex min-h-11 items-center rounded-full bg-miel px-3 text-xs font-medium text-white">{R.tonIdee}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <AnneauScore valeur={scorePressenti(p.notes)} affiche={R.score(scorePressenti(p.notes))} couleur={TEINTE.miel.anneau} libelle={R.scorePressenti} />
                        <span className="inline-flex min-h-11 items-center rounded-full bg-sand px-3 text-xs font-medium">{R.pastilleEstimation}</span>
                      </div>
                      <p className="text-[16px]">{p.enUneLigne}</p>
                      <p className="text-[16px]">
                        <span className="font-medium">{M.esquisse.pourquoiPas}</span> {p.raison}
                      </p>
                      <ul className="space-y-2">
                        {(["urgence", "paiement", "acces", "plaisir"] as const).map((cle) => {
                          const couleur = { urgence: "bg-framboise", paiement: "bg-miel", acces: "bg-eau", plaisir: "bg-sage" }[cle];
                          return (
                            <li key={cle} className="flex items-center gap-2 text-[14px]">
                              <span className="w-36 shrink-0">{R.criteres[cle]}</span>
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                                <span className={`block h-1.5 rounded-full ${couleur}`} style={{ width: `${(p.notes[cle] / 5) * 100}%` }} />
                              </span>
                              <span className="w-8 text-right tabular-nums">{p.notes[cle]}/5</span>
                            </li>
                          );
                        })}
                      </ul>
                      {alertePlaisirPressenti(p.notes) && <p className="rounded-xl border border-accent/30 bg-blush px-3 py-2 text-[15px]">{R.alertePlaisirPiste}</p>}
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <Separateur />
          <section id="anti-cible" data-ancre="" aria-labelledby="anti-titre" className={`${CLASSE_CARTE} scroll-mt-20 space-y-4 rounded-2xl border border-[#F3C1CF] border-l-4 border-l-framboise bg-blush p-6 sm:p-8`}>
            <TitreIcone as="h2" id="anti-titre" icone="interdit" teinte="framboise" className="text-[26px] italic">
              {R.anti.titre}
            </TitreIcone>
            <p className="text-[16px] text-ink-soft">{R.anti.intro}</p>
            <p className="text-[17px] leading-relaxed">{resultat.antiCible.portrait}</p>
            <div className="space-y-1">
              <TitreIcone as="h3" icone="eclair" teinte="framboise" taille="sm" className="text-[18px] italic">
                {R.anti.signaux}
              </TitreIcone>
              <ul className="list-disc space-y-1 pl-5 text-[16px]">
                {resultat.antiCible.signaux.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <TitreIcone as="h3" icone="bouclier" teinte="framboise" taille="sm" className="text-[18px] italic">
                {R.anti.lien}
              </TitreIcone>
              <p className="text-[16px]">{resultat.antiCible.lienAntiContexte}</p>
            </div>
            <div className="space-y-1">
              <TitreIcone as="h3" icone="bulle" teinte="framboise" taille="sm" className="text-[18px] italic">
                {R.anti.commentDire}
              </TitreIcone>
              <p className="text-[16px]">{resultat.antiCible.commentDire}</p>
            </div>
          </section>

          <Plan30 resultat={resultat} coches={coches} onCoche={lecture ? () => {} : onCoche} M={M} lecture={lecture} />

          <Separateur />
          <Card id="hypotheses" data-ancre="" className={`${CLASSE_CARTE} scroll-mt-20 space-y-2 rounded-2xl border-l-4 border-l-lilas p-6 sm:p-8`}>
            <TitreIcone icone="ampoule" teinte="lilas" className="text-[22px] italic">
              {R.hypothesesTitre}
            </TitreIcone>
            {resultat.hypotheses.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-[16px]">
                {resultat.hypotheses.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[16px] text-ink-soft">{"L'IA s'est appuyée sur tes réponses, sans supposition en plus."}</p>
            )}
          </Card>
          <Card className={`${CLASSE_CARTE} space-y-2 rounded-2xl border-l-4 border-l-miel p-6 sm:p-8`}>
            <TitreIcone icone="etoile" teinte="miel" className="text-[22px] italic">
              {R.motPourToi}
            </TitreIcone>
            <p className="text-[17px] leading-relaxed">{resultat.motPourToi}</p>
          </Card>

          <section id="appel" data-ancre="" aria-labelledby="appel-titre" className="scroll-mt-20 space-y-2 rounded-2xl border border-[#F3C1CF] bg-[#FFF0F4] p-6 sm:p-8">
            <TitreIcone as="h2" id="appel-titre" icone="telephone" teinte="framboise" className="text-[22px] italic">
              {R.appel.titre}
            </TitreIcone>
            <p className="text-[16px] font-semibold">{R.appel.sousTitre}</p>
            <p className="text-[16px]">{R.appel.texte}</p>
            <a data-ecran-seul className={buttonClass("primary", "mt-2 max-sm:w-full")} href={urlAppel("resultat-fin")} target="_blank" rel="noopener">
              {R.appel.bouton}
            </a>
            <p data-impression-seule className="text-[15px]">
              {R.appel.impression(urlAppel("resultat-fin"))}
            </p>
          </section>

          <section data-ecran-seul aria-labelledby="boussole-titre" className="space-y-3 rounded-2xl border border-sky-line bg-sky-soft p-6 sm:p-8">
            <TitreIcone as="h2" id="boussole-titre" icone="boussole" teinte="eau" className="text-[22px] italic">
              {R.boussole.titre}
            </TitreIcone>
            <p className="text-[16px]">{R.boussole.texte}</p>
            <a className={buttonClass("secondary", "max-sm:w-full")} href={urlBoussole()}>
              {R.boussole.bouton}
            </a>
          </section>

          <AvertissementIA M={M} />
          <p data-impression-seule className="text-center text-sm text-ink-soft">
            {R.piedImpression}
          </p>
        </div>
      </div>
      {haut && (
        <button
          type="button"
          data-ecran-seul
          className="fixed bottom-4 right-4 z-40 min-h-11 rounded-full bg-accent-strong px-4 text-[15px] text-white shadow-lg"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {R.hautDePage}
        </button>
      )}
    </div>
  );
}
