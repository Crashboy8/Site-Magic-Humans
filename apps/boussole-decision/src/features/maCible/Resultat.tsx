"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, buttonClass } from "@/components/ui";
import { lienBoussoleCibles } from "@/domain/boussoleCibles";
import {
  EXTRAS_VIDES,
  type AutrePiste,
  type Cible,
  type EntreeMaCible,
  type Extras,
  type IdCible,
  type IdPiste,
  type ResultatClasse,
  type SyntheseTerrain,
} from "@/domain/maCible/types";
import { iconeCible } from "@/domain/maCible/iconeCible";
import {
  alertePlaisirPressenti,
  scorePressenti,
} from "@/domain/maCible/scores";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BoutonCopierIA, IconeCopier } from "./BoutonCopier";
import { ChargeurEnLigne } from "./ChargeurEnLigne";
import { BlocPortrait, type EtatAppel } from "./Portrait";
import { CarteCible } from "./CarteCible";
import { AvertissementIA } from "./Confidentialite";
import { IndicateurEtapes } from "./IndicateurEtapes";
import {
  AnneauScore,
  CLASSE_CARTE,
  PastilleFine,
  PastilleIcone,
  Separateur,
  TEINTE,
  TitreIcone,
} from "./Habillage";
import { Icone } from "./Icones";
import { Plan30 } from "./Plan30";
import {
  BarreSommaire,
  ColonneSommaire,
  type EntreeSommaire,
} from "./SommaireResultat";
import { PISTES_CREUSEES_MAX, type EtapeBarre, type Etat } from "./etat";
import { exporterResultat, markdownPartie, markdownPartieCible, nomFichierExport, pourMonIA, type PartieResultat } from "./export";
import { URL_OUTILS, urlAppel } from "./liens";

/** Appel d'approfondissement en cours, ou dernier arrivé (§6.4). */
export type AppelApprofondi =
  { mode: "portrait"; id: IdCible } | { mode: "piste"; id: IdPiste };
export interface Approfondir {
  appel: AppelApprofondi | null;
  /** Un appel IA est en cours (synthèse comprise) : tous les boutons d'appel sont désactivés. */
  occupe: boolean;
  erreur: { cle: string; message: string; reessai: boolean } | null;
  nouveau: string | null;
  max: number;
  onPortrait: (cible: Cible) => void;
  onCreuser: (piste: AutrePiste) => void;
}

const cleAppel = (a: AppelApprofondi) => `${a.mode}-${a.id}`;
const virgule = (n: number, locale: string) =>
  n.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

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
  const parent = id.match(/^(cible-\d+|piste-p\d)/);
  if (parent) o[parent[1]] = true;
  if (!parent || id !== parent[1]) o[id] = true;
  return o;
}

function ouvertsDepart(
  lignes: { ligne: { rang: string } }[],
): Record<string, boolean> {
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
  M,
  nbHistorique,
  synthese,
  entree,
  extras = EXTRAS_VIDES,
  approfondir,
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
  synthese: SyntheseTerrain | null;
  /** Réponses qui ont produit ce résultat : le talent part vers la Boussole (jamais le prénom). */
  entree: EntreeMaCible;
  extras?: Extras;
  /** Absent en lecture seule : les boutons d'appel sont masqués (§4.9). */
  approfondir?: Approfondir;
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
    .map((ligne) => ({
      ligne,
      cible: resultat.cibles.find((c) => c.id === ligne.id),
    }))
    .filter((x) => x.cible !== undefined);
  const creusees = (
    Object.entries(extras.pistes) as [IdPiste, Extras["pistes"][IdPiste]][]
  )
    .flatMap(([pisteId, p]) => (p ? [{ pisteId, ...p }] : []))
    .sort((a, b) => b.ligne.score - a.ligne.score);
  const scorePrioritaire =
    resultat.classement.find((l) => l.rang === "prioritaire")?.score ?? 0;
  const [ouverts, setOuverts] = useState<Record<string, boolean>>(() =>
    ouvertsDepart(lignes),
  );
  const prioritaire = lignes.findIndex(
    ({ ligne }) => ligne.rang === "prioritaire",
  );
  const rangPrioritaire = (prioritaire >= 0 ? prioritaire : 0) + 1;
  const [actif, setActif] = useState(`cible-${rangPrioritaire}`);
  const [barre, setBarre] = useState(false);
  const [haut, setHaut] = useState(false);

  const date = useMemo(
    () =>
      new Date(fait).toLocaleDateString(M.commun.locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [fait, M.commun.locale],
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
    const t = window.setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const entete = document.querySelector("[data-entete-resultat]");
    if (!entete) return;
    const io = new IntersectionObserver(([e]) => setBarre(!e.isIntersecting), {
      threshold: 0,
    });
    io.observe(entete);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const noeuds = Array.from(
      document.querySelectorAll<HTMLElement>("[data-ancre]"),
    );
    const visibles = new Map<Element, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visibles.set(e.target, e.intersectionRatio);
          else visibles.delete(e.target);
        }
        const meilleur = [...visibles.entries()].sort(
          (a, b) =>
            b[1] - a[1] ||
            a[0].getBoundingClientRect().top - b[0].getBoundingClientRect().top,
        )[0];
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

  const nouveau = approfondir?.nouveau ?? null;
  useEffect(() => {
    if (!nouveau?.startsWith("piste-")) return;
    /* eslint-disable react-hooks/set-state-in-effect -- une piste creusée qui arrive s'ouvre, puis on y descend */
    setOuverts((s) => ({ ...s, [nouveau]: true }));
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = window.setTimeout(() => {
      document
        .getElementById(nouveau)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      document
        .getElementById(`${nouveau}-titre`)
        ?.focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(t);
  }, [nouveau]);

  const etatAppel = (cle: string): EtatAppel => {
    const ici = Boolean(
      approfondir?.appel && cleAppel(approfondir.appel) === cle,
    );
    return {
      enCours: ici,
      bloque: Boolean(approfondir?.occupe) && !ici,
      erreur:
        approfondir?.erreur?.cle === cle ? approfondir.erreur.message : null,
      reessai:
        approfondir?.erreur?.cle === cle ? approfondir.erreur.reessai : true,
    };
  };
  const blocPortrait = (cible: Cible, base: string) => (
    <BlocPortrait
      id={`${base}-portrait`}
      portrait={extras.portraits[cible.id]}
      synthese={synthese}
      M={M}
      appel={etatAppel(`portrait-${cible.id}`)}
      lecture={!approfondir}
      maxApprofondir={approfondir?.max ?? 20}
      nouveau={nouveau === `portrait-${cible.id}`}
      onFaire={() => approfondir?.onPortrait(cible)}
      texteCopie={markdownPartieCible(cible, prenom, "portrait", { portrait: extras.portraits[cible.id], synthese, M })}
    />
  );
  const creuseePour = (id: IdPiste) => creusees.find((p) => p.pisteId === id);
  const pistesPleines = creusees.length >= PISTES_CREUSEES_MAX;

  function onOuvert(id: string, ouvert: boolean) {
    if (impressionRef.current) return;
    setOuverts((s) => ({ ...s, [id]: ouvert }));
  }
  function estOuvert(id: string) {
    return impression || Boolean(ouverts[id]);
  }
  function basculerTout(ouvert: boolean) {
    const o: Record<string, boolean> = {};
    const bases = [
      ...lignes.map((_, i) => `cible-${i + 1}`),
      ...creusees.map((p) => `piste-${p.pisteId}`),
    ];
    for (const b of bases) {
      for (const cle of [
        b,
        `${b}-lieux`,
        `${b}-linkedin`,
        `${b}-messages`,
        `${b}-test`,
        `${b}-grille`,
      ])
        o[cle] = ouvert;
    }
    setOuverts(o);
  }
  function allerAncre(id: string) {
    setOuverts((s) => ({ ...s, ...clesAncre(id) }));
    const url = `${window.location.pathname}${window.location.search}#${id}`;
    window.history.replaceState(null, "", url);
    window.setTimeout(
      () =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      30,
    );
  }

  const cibleActive = actif.match(/^(cible-\d+|piste-p\d)/)?.[1] ?? "";
  const sousEntrees = (id: string, cible: Cible) =>
    cibleActive === id
      ? [
          ...SOUS.map(([cle, suffixe]) => ({
            id: suffixe ? `${id}${suffixe}` : id,
            libelle: R.sousEntrees[cle],
          })),
          ...((synthese?.verbatims ?? []).some((v) =>
            cible.verbatims.includes(v.id),
          )
            ? [{ id: `${id}-clients`, libelle: R.sousEntrees.clients }]
            : []),
          ...(extras.portraits[cible.id]
            ? [{ id: `${id}-portrait`, libelle: R.sousEntrees.portrait }]
            : []),
        ]
      : undefined;
  const entrees: EntreeSommaire[] = [
    { id: "offre", libelle: R.sommaireOffre },
    ...lignes.map(({ ligne, cible }, i) => {
      const rang = i + 1;
      const id = `cible-${rang}`;
      return {
        id,
        libelle: R.sommaireCible(rang, cible!.nom, R.score(ligne.score)),
        sous: sousEntrees(id, cible!),
      };
    }),
    ...(resultat.autresPistes.length > 0
      ? [{ id: "pistes", libelle: R.sommairePistes }]
      : []),
    ...creusees.map((p, i) => ({
      id: `piste-${p.pisteId}`,
      libelle: R.sommaireCible(
        lignes.length + i + 1,
        p.cible.nom,
        R.score(p.ligne.score),
      ),
      sous: sousEntrees(`piste-${p.pisteId}`, p.cible),
    })),
    { id: "anti-cible", libelle: R.sommaireAnti },
    { id: "plan", libelle: R.sommairePlan },
    { id: "hypotheses", libelle: R.sommaireHypotheses },
  ];

  const optionsExport = { synthese, extras, M };
  const exporte = exporterResultat(resultat, prenom, optionsExport);
  const pourIA = pourMonIA(exporte.markdown, M);
  /** Icône « Copier » d'une grande partie, sur la ligne de son titre. */
  const copierPartie = (partie: PartieResultat, titre: string, teinte: Parameters<typeof IconeCopier>[0]["teinte"]) => (
    <IconeCopier texte={markdownPartie(resultat, prenom, partie, optionsExport)} titre={titre} M={M} teinte={teinte} />
  );
  /** Le PDF passe par l'impression du navigateur ; le nom proposé est celui de l'export, sans « .md ». */
  function telechargerPdf() {
    const avant = document.title;
    document.title = nomFichierExport(fait, M).replace(/\.md$/, "");
    const remettre = () => {
      document.title = avant;
      window.removeEventListener("afterprint", remettre);
    };
    window.addEventListener("afterprint", remettre);
    window.print();
  }
  const boutonsExport = (ou: "haut" | "bas") => (
    <>
      <Button type="button" data-pdf={ou} title={R.pdfAide} className="w-fit px-4 py-2" onClick={telechargerPdf}>
        <Icone nom="telecharger" className="size-4 shrink-0" />
        {R.telechargerPdf}
      </Button>
      <BoutonCopierIA texte={pourIA} M={M} />
    </>
  );
  const lienBoussole = lienBoussoleCibles(resultat, extras, entree);
  function telecharger() {
    const blob = new Blob([exporte.markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomFichierExport(fait, M);
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
      <BarreSommaire
        {...sommaireProps}
        barreVisible={barre}
        fermer={R.fermer}
      />
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
              <button
                type="button"
                className="text-link underline"
                onClick={onHistorique}
              >
                {R.historiqueLien(nbHistorique)}
              </button>
            </p>
            <p className="font-script text-2xl text-accent-strong">
              {R.surtitre}
            </p>
            <h1
              tabIndex={-1}
              data-titre-etape
              className="flex items-center gap-3 text-4xl italic focus:outline-none sm:text-5xl"
            >
              <PastilleIcone nom="cible" teinte="corail" />
              <span className="min-w-0">{R.titre}</span>
            </h1>
            <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">
              {R.intro}
            </p>
            <p className="text-sm text-ink-soft">{R.faitLe(date)}</p>
          </header>

          {lecture && bandeauLecture && (
            <div
              role="status"
              className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-blush p-4 sm:flex-row sm:items-center sm:justify-between"
            >
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

          <div data-ecran-seul className="flex flex-wrap items-center gap-2">
            {boutonsExport("haut")}
            <Button
              type="button"
              variant="secondary"
              className="w-fit px-3 py-1.5 text-sm"
              onClick={telecharger}
            >
              <Icone nom="telecharger" className="size-4 shrink-0" />
              {R.telecharger}
            </Button>
            <a
              className={buttonClass("secondary", "w-fit px-3 py-1.5 text-sm")}
              href={lienBoussole}
            >
              <Icone nom="boussole" className="size-4 shrink-0" />
              {R.comparerBoussole}
            </a>
            <Button
              type="button"
              variant="secondary"
              className="w-fit px-3 py-1.5 text-sm"
              onClick={() => basculerTout(true)}
            >
              <Icone nom="deplier" className="size-4 shrink-0" />
              {R.toutDeplier}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-fit px-3 py-1.5 text-sm"
              onClick={() => basculerTout(false)}
            >
              <Icone nom="replier" className="size-4 shrink-0" />
              {R.toutReplier}
            </Button>
            {!lecture && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-fit px-3 py-1.5 text-sm"
                  onClick={onModifier}
                >
                  <Icone nom="crayon" className="size-4 shrink-0" />
                  {R.modifier}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-fit px-3 py-1.5 text-sm"
                  onClick={onEffacer}
                >
                  <Icone nom="poubelle" className="size-4 shrink-0" />
                  {R.effacer}
                </Button>
              </>
            )}
          </div>

          <Card
            id="offre"
            data-ancre=""
            className={`${CLASSE_CARTE} scroll-mt-20 space-y-4 rounded-2xl border-l-4 border-l-corail p-6 sm:p-8`}
          >
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-corail-soft to-transparent pr-1">
              <TitreIcone icone="cadeau" teinte="corail" className="min-w-0 flex-1 px-3 py-2 text-[22px] italic">
                {R.offreTitre}
              </TitreIcone>
              {copierPartie("offre", R.offreTitre, "corail")}
            </div>
            <p className="font-serif text-[26px] leading-snug">
              {resultat.offre.phrase}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-[17px] font-medium">
                  <PastilleIcone nom="fleche" teinte="miel" taille="sm" />
                  <span>{R.avant}</span>
                </h3>
                <p className="text-[16px] text-ink-soft">
                  {resultat.offre.avant}
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 text-[17px] font-medium">
                  <PastilleIcone nom="etincelles" teinte="eau" taille="sm" />
                  <span>{R.apres}</span>
                </h3>
                <p className="text-[16px] text-ink-soft">
                  {resultat.offre.apres}
                </p>
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
                synthese={synthese}
                M={M}
                corpsOuvert={estOuvert(`cible-${i + 1}`)}
                ouvert={estOuvert}
                onOuvert={onOuvert}
                portrait={extras.portraits[cible!.id]}
                blocPortrait={blocPortrait(cible!, `cible-${i + 1}`)}
              />
              {ligne.rang === "prioritaire" && (
                <section
                  data-ecran-seul
                  className="space-y-2 rounded-2xl border border-[#F3C1CF] bg-[#FFF0F4] p-6 sm:p-8"
                >
                  <h2 className="text-[22px] italic">{R.appelApres.titre}</h2>
                  <p className="text-[16px] font-semibold">
                    {R.appelApres.sousTitre}
                  </p>
                  <a
                    className={buttonClass("primary", "mt-2 max-sm:w-full")}
                    href={urlAppel("resultat-apres-cible")}
                    target="_blank"
                    rel="noopener"
                  >
                    {R.appelApres.bouton}
                  </a>
                </section>
              )}
            </div>
          ))}

          {resultat.autresPistes.length > 0 && (
            <section
              id="pistes"
              data-ancre=""
              className={`${CLASSE_CARTE} scroll-mt-20 space-y-4 rounded-2xl border-l-4 border-miel bg-gradient-to-br from-miel-soft to-paper p-5 sm:p-6`}
            >
              <Separateur />
              <div className="flex items-center gap-2">
                <TitreIcone icone="couches" teinte="miel" className="min-w-0 flex-1 font-serif text-[26px] italic">
                  {R.pistesTitre}
                </TitreIcone>
                {copierPartie("pistes", R.pistesTitre, "miel")}
              </div>
              <p className="text-[16px] text-ink-soft">{R.pistesIntro}</p>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...resultat.autresPistes]
                  .sort(
                    (a, b) => scorePressenti(b.notes) - scorePressenti(a.notes),
                  )
                  .map((p) => (
                    <li
                      key={p.id}
                      className="space-y-3 rounded-2xl border border-line bg-paper p-4 shadow-[0_8px_20px_rgba(58,47,36,0.06)]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="flex items-center gap-2 text-[18px] font-medium">
                          <PastilleIcone
                            nom={iconeCible(p.nom, p.enUneLigne)}
                            teinte="miel"
                            taille="sm"
                          />
                          <span className="min-w-0">{p.nom}</span>
                        </h3>
                        <PastilleFine ton="neutre">
                          {R.marche[p.marche]}
                        </PastilleFine>
                        {p.depuisIdees.length > 0 && (
                          <PastilleFine ton="miel">{R.tonIdee}</PastilleFine>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <AnneauScore
                          valeur={scorePressenti(p.notes)}
                          affiche={R.score(scorePressenti(p.notes))}
                          couleur={TEINTE.miel.anneau}
                          libelle={R.scorePressenti}
                        />
                        <PastilleFine ton="neutre">
                          {R.pastilleEstimation}
                        </PastilleFine>
                      </div>
                      <p className="text-[16px]">{p.enUneLigne}</p>
                      <p className="text-[16px]">
                        <span className="font-medium">
                          {M.esquisse.pourquoiPas}
                        </span>{" "}
                        {p.raison}
                      </p>
                      <ul className="space-y-2">
                        {(
                          ["urgence", "paiement", "acces", "plaisir"] as const
                        ).map((cle) => {
                          const couleur = {
                            urgence: "bg-framboise",
                            paiement: "bg-miel",
                            acces: "bg-eau",
                            plaisir: "bg-sage",
                          }[cle];
                          return (
                            <li
                              key={cle}
                              className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1 text-[14px]"
                            >
                              <span className="min-w-0">{R.criteres[cle]}</span>
                              <span className="text-right tabular-nums">
                                {p.notes[cle]}/5
                              </span>
                              <span
                                className="col-span-2 h-1.5 overflow-hidden rounded-full bg-sand"
                                aria-hidden="true"
                              >
                                <span
                                  className={`block h-1.5 rounded-full ${couleur}`}
                                  style={{
                                    width: `${(p.notes[cle] / 5) * 100}%`,
                                  }}
                                />
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {alertePlaisirPressenti(p.notes) && (
                        <p className="rounded-xl border border-accent/30 bg-blush px-3 py-2 text-[15px]">
                          {R.alertePlaisirPiste}
                        </p>
                      )}
                      <PiedPiste
                        creusee={creuseePour(p.id)}
                        appel={etatAppel(`piste-${p.id}`)}
                        lecture={!approfondir}
                        pleines={pistesPleines}
                        scorePrioritaire={scorePrioritaire}
                        M={M}
                        onCreuser={() => approfondir?.onCreuser(p)}
                        onVoir={() => allerAncre(`piste-${p.id}`)}
                      />
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {creusees.length > 0 && (
            <section aria-labelledby="creusees-titre" className="space-y-6">
              <div className="flex items-center gap-2">
                <TitreIcone as="h2" id="creusees-titre" icone="couches" teinte="miel" className="min-w-0 flex-1 font-serif text-[26px] italic">
                  {M.approfondir.pistesCreusees}
                </TitreIcone>
                {copierPartie("creusees", M.approfondir.pistesCreusees, "miel")}
              </div>
              {creusees.map((p, i) => (
                <div
                  key={p.pisteId}
                  className={
                    nouveau === `piste-${p.pisteId}`
                      ? "motion-safe:animate-[apparaitre_300ms_ease-out]"
                      : undefined
                  }
                >
                  <CarteCible
                    cible={p.cible}
                    ligne={{
                      score: p.ligne.score,
                      alertePlaisir: p.ligne.alertePlaisir,
                      rang: "secondaire",
                    }}
                    rang={lignes.length + i + 1}
                    prenom={prenom}
                    synthese={synthese}
                    M={M}
                    corpsOuvert={estOuvert(`piste-${p.pisteId}`)}
                    ouvert={estOuvert}
                    onOuvert={onOuvert}
                    ancre={`piste-${p.pisteId}`}
                    rangLibelle={M.approfondir.pisteCreusee}
                    portrait={extras.portraits[p.cible.id]}
                    blocPortrait={blocPortrait(p.cible, `piste-${p.pisteId}`)}
                  />
                </div>
              ))}
            </section>
          )}

          <Separateur />
          <section
            id="anti-cible"
            data-ancre=""
            aria-labelledby="anti-titre"
            className={`${CLASSE_CARTE} scroll-mt-20 space-y-4 rounded-2xl border border-[#F3C1CF] border-l-4 border-l-framboise bg-blush p-6 sm:p-8`}
          >
            <div className="flex items-center gap-2">
              <TitreIcone as="h2" id="anti-titre" icone="interdit" teinte="framboise" className="min-w-0 flex-1 text-[26px] italic">
                {R.anti.titre}
              </TitreIcone>
              {copierPartie("anti", R.anti.titre, "framboise")}
            </div>
            <p className="text-[16px] text-ink-soft">{R.anti.intro}</p>
            <p className="text-[17px] leading-relaxed">
              {resultat.antiCible.portrait}
            </p>
            <div className="space-y-1">
              <TitreIcone
                as="h3"
                icone="eclair"
                teinte="framboise"
                taille="sm"
                className="text-[18px] italic"
              >
                {R.anti.signaux}
              </TitreIcone>
              <ul className="list-disc space-y-1 pl-5 text-[16px]">
                {resultat.antiCible.signaux.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-1">
              <TitreIcone
                as="h3"
                icone="bouclier"
                teinte="framboise"
                taille="sm"
                className="text-[18px] italic"
              >
                {R.anti.lien}
              </TitreIcone>
              <p className="text-[16px]">
                {resultat.antiCible.lienAntiContexte}
              </p>
            </div>
            <div className="space-y-1">
              <TitreIcone
                as="h3"
                icone="bulle"
                teinte="framboise"
                taille="sm"
                className="text-[18px] italic"
              >
                {R.anti.commentDire}
              </TitreIcone>
              <p className="text-[16px]">{resultat.antiCible.commentDire}</p>
            </div>
          </section>

          <Plan30
            resultat={resultat}
            coches={coches}
            onCoche={lecture ? () => {} : onCoche}
            M={M}
            lecture={lecture}
            action={copierPartie("plan", M.plan.titre, "sage")}
          />

          <Separateur />
          <Card
            id="hypotheses"
            data-ancre=""
            className={`${CLASSE_CARTE} scroll-mt-20 space-y-2 rounded-2xl border-l-4 border-l-sable p-6 sm:p-8`}
          >
            <div className="flex items-center gap-2">
              <TitreIcone icone="ampoule" teinte="sable" className="min-w-0 flex-1 text-[22px] italic">
                {R.hypothesesTitre}
              </TitreIcone>
              {copierPartie("hypotheses", R.hypothesesTitre, "sable")}
            </div>
            {resultat.hypotheses.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-[16px]">
                {resultat.hypotheses.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[16px] text-ink-soft">
                {R.sansHypothese}
              </p>
            )}
          </Card>
          <Card
            className={`${CLASSE_CARTE} space-y-2 rounded-2xl border-l-4 border-l-miel p-6 sm:p-8`}
          >
            <div className="flex items-center gap-2">
              <TitreIcone icone="etoile" teinte="miel" className="min-w-0 flex-1 text-[22px] italic">
                {R.motPourToi}
              </TitreIcone>
              {copierPartie("mot", R.motPourToi, "miel")}
            </div>
            <p className="text-[17px] leading-relaxed">{resultat.motPourToi}</p>
          </Card>

          <section
            id="appel"
            data-ancre=""
            aria-labelledby="appel-titre"
            className="scroll-mt-20 space-y-2 rounded-2xl border border-[#F3C1CF] bg-[#FFF0F4] p-6 sm:p-8"
          >
            <TitreIcone
              as="h2"
              id="appel-titre"
              icone="telephone"
              teinte="framboise"
              className="text-[22px] italic"
            >
              {R.appel.titre}
            </TitreIcone>
            <p className="text-[16px] font-semibold">{R.appel.sousTitre}</p>
            <p className="text-[16px]">{R.appel.texte}</p>
            <a
              data-ecran-seul
              className={buttonClass("primary", "mt-2 max-sm:w-full")}
              href={urlAppel("resultat-fin")}
              target="_blank"
              rel="noopener"
            >
              {R.appel.bouton}
            </a>
            <p data-impression-seule className="text-[15px]">
              {R.appel.impression(urlAppel("resultat-fin"))}
            </p>
          </section>

          <section
            data-ecran-seul
            aria-labelledby="boussole-titre"
            className="space-y-3 rounded-2xl border-l-4 border-sage bg-gradient-to-br from-sage-soft to-paper p-6 sm:p-8"
          >
            <TitreIcone
              as="h2"
              id="boussole-titre"
              icone="boussole"
              teinte="sage"
              className="text-[22px] italic"
            >
              {R.boussole.titre}
            </TitreIcone>
            <p className="text-[16px]">{R.boussole.texte}</p>
            <a
              className={buttonClass("primary", "max-sm:w-full")}
              href={lienBoussole}
            >
              <Icone nom="boussole" className="size-4 shrink-0" />
              {R.boussole.bouton}
            </a>
          </section>

          <section
            data-ecran-seul
            data-export-bas=""
            aria-labelledby="garder-titre"
            className="space-y-3 rounded-2xl border-l-4 border-lilas bg-gradient-to-br from-lilas-soft to-paper p-6 sm:p-8"
          >
            <TitreIcone as="h2" id="garder-titre" icone="telecharger" teinte="lilas" className="text-[22px] italic">
              {R.garderTitre}
            </TitreIcone>
            <p className="text-[16px]">{R.garderTexte}</p>
            <div className="flex flex-wrap items-center gap-2">{boutonsExport("bas")}</div>
          </section>

          <AvertissementIA M={M} />
          <p
            data-impression-seule
            className="text-center text-sm text-ink-soft"
          >
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

/** Bas d'une carte « D'autres pistes » : creuser, chargeur, ou lien vers la piste creusée (§4.8). */
function PiedPiste({
  creusee,
  appel,
  lecture,
  pleines,
  scorePrioritaire,
  M,
  onCreuser,
  onVoir,
}: {
  creusee: { ligne: { score: number } } | undefined;
  appel: EtatAppel;
  lecture: boolean;
  pleines: boolean;
  scorePrioritaire: number;
  M: MaCibleMessages;
  onCreuser: () => void;
  onVoir: () => void;
}) {
  const A = M.approfondir;
  if (creusee) {
    return (
      <div className="space-y-2">
        {creusee.ligne.score > scorePrioritaire && (
          <p className="rounded-xl bg-sage-soft px-3 py-2 text-[15px]">
            {A.mieuxQuePrioritaire(
              virgule(creusee.ligne.score, M.commun.locale),
              virgule(scorePrioritaire, M.commun.locale),
            )}
          </p>
        )}
        <Button
          type="button"
          variant="secondary"
          className="max-sm:w-full"
          onClick={onVoir}
        >
          <Icone nom="couches" className="size-4 shrink-0" />
          {A.voirPiste}
        </Button>
      </div>
    );
  }
  if (lecture) return null;
  if (appel.enCours)
    return (
      <ChargeurEnLigne messages={A.chargeurPiste} tempsEcoule={A.tempsEcoule} />
    );
  const bloque = appel.bloque || pleines;
  return (
    <div data-ecran-seul className="space-y-2">
      {appel.erreur && (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-[15px] text-danger">
          {appel.erreur}
        </p>
      )}
      {appel.reessai && (
        <Button
          type="button"
          className="max-sm:w-full"
          disabled={bloque}
          onClick={onCreuser}
        >
          <Icone nom="loupe" className="size-4 shrink-0" />
          {appel.erreur ? M.erreurs.reessayer : A.creuser}
        </Button>
      )}
      {appel.reessai && (
        <p className="text-sm text-ink-soft">
          {pleines
            ? A.maxPistes
            : appel.bloque
              ? A.dejaEnCours
              : A.creuserDuree}
        </p>
      )}
    </div>
  );
}
