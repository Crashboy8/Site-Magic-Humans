"use client";

import { useState } from "react";
import { cx } from "@/components/ui";
import { iconeCanal, iconeCible, iconeLieu } from "@/domain/maCible/iconeCible";
import { GRILLE, type CleCritere, type LigneClassement } from "@/domain/maCible/scores";
import type { Cible, Portrait, SyntheseTerrain } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BoutonCopier, IconeCopier } from "./BoutonCopier";
import { AnneauScore, CLASSE_CARTE, PastilleFine, PastilleIcone, PastillePriorite, TEINTE, teinteCible, teintePriorite, type Teinte } from "./Habillage";
import { Icone, type NomIcone } from "./Icones";
import { EncartAnnuaires, LiensLieu } from "./LiensLieu";
import { markdownPartieCible, texteCible, type PartieCopiable } from "./export";
import { remplacerPrenom } from "./liens";

const CRITERES: CleCritere[] = ["urgence", "paiement", "acces", "plaisir"];
const ICONE_CRITERE: Record<CleCritere, NomIcone> = {
  urgence: "eclair",
  paiement: "euro",
  acces: "porte",
  plaisir: "coeur",
};
const RANG_STYLE = {
  prioritaire: "bg-accent-strong text-white",
  secondaire: "bg-sand text-ink",
  tertiaire: "border border-line text-ink",
} as const;

const nombre = (n: number, locale: string) => n.toLocaleString(locale);

function Pastille({ libelle, aide }: { libelle: string; aide: string }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <span className="relative inline-flex align-middle" onMouseEnter={() => setOuvert(true)} onMouseLeave={() => setOuvert(false)}>
      <button
        type="button"
        className="inline-flex min-h-11 items-center rounded-full bg-sand px-3 text-xs font-medium text-ink"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
      >
        {libelle}
      </button>
      {ouvert && (
        <span role="tooltip" className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl bg-ink px-3 py-2 text-left text-sm font-normal text-white shadow-lg">
          {aide}
        </span>
      )}
    </span>
  );
}

function Bloc({
  id,
  titre,
  pastille,
  icone,
  teinte,
  action,
  children,
}: {
  id?: string;
  titre: string;
  pastille?: { libelle: string; aide: string };
  icone?: NomIcone;
  teinte: Teinte;
  /** Icône « Copier », sur la ligne du titre. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div id={id} data-ancre={id ? "" : undefined} className="bloc-cible scroll-mt-20 space-y-1.5">
      <div className="flex items-center gap-2">
        <h3 className="flex min-w-0 flex-1 items-center gap-2 text-[19px] italic">
          {icone && <PastilleIcone nom={icone} teinte={teinte} taille="sm" />}
          <span className="min-w-0">{titre}</span>
          {pastille && <Pastille libelle={pastille.libelle} aide={pastille.aide} />}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Detail({
  id,
  titre,
  ouvert,
  onOuvert,
  icone,
  teinte,
  action,
  children,
}: {
  id: string;
  titre: string;
  ouvert: boolean;
  onOuvert: (id: string, ouvert: boolean) => void;
  icone: NomIcone;
  teinte: Teinte;
  /** Icône « Copier », sur la ligne du titre (le clic ne replie pas la partie). */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details
      id={id}
      data-ancre=""
      open={ouvert}
      onToggle={(e) => onOuvert(id, e.currentTarget.open)}
      className="scroll-mt-20 rounded-xl border border-line px-4 py-2"
    >
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 py-1.5 font-serif text-[19px] italic">
        <span className="inline-flex min-w-0 flex-1 items-center gap-2">
          <PastilleIcone nom={icone} teinte={teinte} taille="sm" />
          <span>{titre}</span>
        </span>
        {action}
      </summary>
      <div className="space-y-4 pb-3 pt-1">{children}</div>
    </details>
  );
}

function Liste({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-[16px]">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

function ClientsCible({
  base,
  cible,
  synthese,
  libelle,
  tire,
  citer,
  action,
}: {
  base: string;
  cible: Cible;
  synthese: SyntheseTerrain | null;
  libelle: string;
  tire: string;
  citer: (t: string) => string;
  action?: React.ReactNode;
}) {
  const phrases = (synthese?.verbatims ?? []).filter((v) => cible.verbatims.includes(v.id));
  if (phrases.length === 0) return null;
  return (
    <section id={`${base}-clients`} data-ancre="" className="scroll-mt-20 space-y-3 rounded-2xl border border-line border-l-4 border-l-lilas bg-paper p-4">
      <div className="flex items-center gap-2">
        <h3 className="flex min-w-0 flex-1 items-start gap-3 font-serif text-[20px] italic">
          <PastilleIcone nom="bulle" teinte="lilas" taille="sm" />
          <span>{libelle}</span>
        </h3>
        {action}
      </div>
      <ul className="space-y-3">
        {phrases.map((v) => (
          <li key={v.id} className="space-y-2">
            <blockquote className="text-[17px] italic leading-relaxed">{citer(v.citation)}</blockquote>
            <span className="inline-flex rounded-full bg-lilas-soft px-2 py-1 text-xs font-medium text-lilas">{tire}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CarteCible({
  cible,
  ligne,
  rang,
  prenom,
  synthese,
  M,
  corpsOuvert,
  ouvert,
  onOuvert,
  ancre,
  rangLibelle,
  portrait,
  blocPortrait,
}: {
  cible: Cible;
  ligne: Pick<LigneClassement, "score" | "rang" | "alertePlaisir">;
  rang: number;
  prenom: string;
  synthese: SyntheseTerrain | null;
  M: MaCibleMessages;
  corpsOuvert: boolean;
  ouvert: (id: string) => boolean;
  onOuvert: (id: string, ouvert: boolean) => void;
  /** Base des ancres : `cible-1` pour une cible, `piste-p2` pour une piste creusée. */
  ancre?: string;
  /** Remplace « Cible prioritaire » (par exemple « Piste creusée »). */
  rangLibelle?: string;
  /** Portrait déjà fait, inclus dans « Copier cette cible ». */
  portrait?: Portrait;
  /** Bloc « Son portrait complet », affiché en dernier dans la carte (§4.6). */
  blocPortrait?: React.ReactNode;
}) {
  const R = M.resultat;
  const base = ancre ?? `cible-${rang}`;
  const idTitre = `${base}-titre`;
  const cleCorps = `${base}`;
  const voir = (s: string) => remplacerPrenom(s, prenom);
  const corps = voir(cible.messages.emailCorps);
  const objetEmail = R.objet(cible.messages.emailObjet);
  const lin = cible.linkedin;
  const canaux = cible.canaux.slice().sort((a, b) => a.priorite - b.priorite);
  const estimation = { libelle: R.pastilleEstimation, aide: R.pastilleAide };
  const teinte = teinteCible(rang - 1);
  const accent = TEINTE[teinte];
  const copier = (partie: PartieCopiable, titre: string, t: Teinte = teinte) => (
    <IconeCopier texte={markdownPartieCible(cible, prenom, partie, { portrait, synthese, M })} titre={`${cible.nom} · ${titre}`} M={M} teinte={t} />
  );
  const filtres: [string, string[]][] = [
    [R.intitules, lin.intitules],
    [R.secteurs, lin.secteurs],
    [R.tailles, lin.tailles],
    [R.zone, lin.zone ? [lin.zone] : []],
    [R.autres, lin.autres],
  ];

  return (
    <section
      id={cleCorps}
      data-ancre=""
      aria-labelledby={idTitre}
      className={cx("carte-cible scroll-mt-20 space-y-4 rounded-2xl border border-line border-l-4 bg-paper p-6 sm:p-8", CLASSE_CARTE, accent.bord)}
    >
      <header className="space-y-3">
        <div className={cx("flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r to-transparent px-3 py-3", accent.bandeau)}>
          <div className="min-w-0 space-y-2">
            <span className={cx("inline-flex rounded-full px-3 py-1 text-sm font-medium", rangLibelle ? "bg-miel text-white" : RANG_STYLE[ligne.rang])}>{rangLibelle ?? R.rangs[ligne.rang]}</span>
            <div className="flex items-start gap-2">
              <h2 id={idTitre} className="flex min-w-0 flex-1 items-start gap-3 text-[22px] leading-tight sm:text-[28px]">
                <PastilleIcone nom={iconeCible(cible.nom, `${cible.portrait} ${cible.promesse}`)} teinte={teinte} taille="lg" />
                <span className="min-w-0 pt-2 sm:pt-1.5">{cible.nom}</span>
              </h2>
              <IconeCopier texte={texteCible(cible, prenom, R.score(ligne.score), true, portrait, synthese, M)} titre={cible.nom} M={M} teinte={teinte} />
            </div>
            <p className="flex flex-wrap items-center gap-1.5">
              <PastilleFine ton="neutre">{R.marche[cible.marche]}</PastilleFine>
              {cible.depuisIdees.length > 0 && <PastilleFine ton="miel">{R.tonIdee}</PastilleFine>}
            </p>
          </div>
          <AnneauScore valeur={ligne.score} affiche={R.score(ligne.score)} couleur={accent.anneau} libelle={R.scoreTitre} />
        </div>
        <p className="flex items-start gap-2 font-serif text-[22px] italic leading-snug">
          <PastilleIcone nom="etincelles" teinte={teinte} taille="sm" />
          <span className="min-w-0">{voir(cible.promesse)}</span>
        </p>
        {ligne.alertePlaisir && <p className="rounded-xl border border-accent/30 bg-blush px-4 py-3 text-[15px]">{R.alertePlaisir}</p>}
        <div data-ecran-seul>
          <BoutonCopier texte={texteCible(cible, prenom, R.score(ligne.score), false, portrait, synthese, M)} M={M} libelle={R.copierCible} />
        </div>
      </header>

      <details open={corpsOuvert} onToggle={(e) => onOuvert(cleCorps, e.currentTarget.open)} className="space-y-6">
        <summary data-ecran-seul className="min-h-11 cursor-pointer py-2 text-[15px] text-link underline">
          {R.detail}
        </summary>
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <p className="text-[13px] text-ink-soft">{R.estimationsIa}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {CRITERES.map((k) => {
                const n = cible.scores[k];
                return (
                  <li key={k} className="space-y-1">
                    <div className="flex items-start justify-between gap-2 text-[15px]">
                      <span className="inline-flex min-w-0 items-center gap-1.5 font-medium">
                        <Icone nom={ICONE_CRITERE[k]} className={cx("size-4 shrink-0", accent.texte)} />
                        <span className="min-w-0">{R.criteres[k]}</span>
                      </span>
                      <span className="shrink-0 tabular-nums font-semibold">{n.note}/5</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                      <div className={cx("h-full rounded-full", accent.barre)} style={{ width: `${n.note * 20}%` }} />
                    </div>
                    <p className="text-sm text-ink-soft">{n.raison}</p>
                  </li>
                );
              })}
            </ul>
          </div>
          <details className="grille-score text-[15px]" open={ouvert(`${base}-grille`)} onToggle={(e) => onOuvert(`${base}-grille`, e.currentTarget.open)}>
            <summary className="min-h-11 cursor-pointer py-2 text-link underline">{R.grilleLien}</summary>
            <div className="space-y-2 pb-2">
              <p className="text-ink-soft">{R.grilleTexte}</p>
              <dl className="space-y-1.5 text-sm">
                {GRILLE.map((g) => (
                  <div key={g.cle}>
                    <dt className="font-medium">
                      {R.criteres[g.cle]} ({g.poids}{M.commun.locale === "fr-FR" ? " %" : "%"})
                    </dt>
                    <dd className="text-ink-soft">
                      1{M.commun.dp}{R.grille[g.cle].un} / 3{M.commun.dp}{R.grille[g.cle].trois} / 5{M.commun.dp}{R.grille[g.cle].cinq}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>

          <Bloc titre={R.blocs.portrait} icone="personne" teinte="lilas">
            <p className="text-[17px] leading-relaxed">{voir(cible.portrait)}</p>
          </Bloc>
          <Bloc id={`${base}-douleur`} titre={R.blocs.douleur} icone="eclair" teinte="framboise" pastille={{ libelle: R.pastilleHypothese, aide: R.pastilleAide }}>
            <p className="text-[17px] leading-relaxed">{voir(cible.douleur)}</p>
          </Bloc>
          <ClientsCible
            base={base}
            cible={cible}
            synthese={synthese}
            libelle={R.blocs.clients}
            tire={M.notes.tire}
            citer={M.commun.citation}
            action={copier("clients", R.blocs.clients, "lilas")}
          />
          <Bloc titre={R.blocs.ancrage} icone="boussole" teinte="sage">
            <p className="text-[17px] leading-relaxed">{cible.ancrage}</p>
          </Bloc>
          <Bloc id={`${base}-offre`} titre={R.blocs.offre} icone="cadeau" teinte="corail" action={copier("offre", R.blocs.offre, "corail")}>
            <p className="text-[17px] font-semibold">{cible.offre.nom}</p>
            <p className="text-[16px]">
              <span className="font-medium">{R.format}</span>{M.commun.dp}{cible.offre.format}
            </p>
            <p className="text-[16px]">
              <span className="font-medium">{R.duree}</span>{M.commun.dp}{cible.offre.duree}
            </p>
            <p className="text-[16px] font-medium">{R.contenu}</p>
            <Liste items={cible.offre.contenu} />
            <p className="flex flex-wrap items-center gap-2 text-[16px]">
              <span className="inline-flex items-center gap-2">
                <PastilleIcone nom="etiquette" teinte="corail" taille="sm" />
                <span>
                  <span className="font-medium">{R.prix}</span>{M.commun.dp}{R.prixValeur(nombre(cible.prix.min, M.commun.locale), nombre(cible.prix.max, M.commun.locale), cible.prix.base, cible.prix.unite)}
                </span>
              </span>
              <Pastille libelle={estimation.libelle} aide={estimation.aide} />
            </p>
            <p className="text-[15px] text-ink-soft">{cible.prix.justification}</p>
            <p className="text-sm italic text-ink-soft">{R.prixNote}</p>
          </Bloc>
          <Bloc titre={R.blocs.pitch} icone="micro" teinte="miel">
            <p className="text-[17px] leading-relaxed">{voir(cible.pitch)}</p>
          </Bloc>
          <Bloc titre={R.blocs.pourquoi} icone="etoile" teinte="sable">
            <p className="text-[17px] leading-relaxed">{cible.pourquoi}</p>
            <h4 className="flex items-center gap-2 pt-2 font-serif text-[17px] italic">
              <PastilleIcone nom="ampoule" teinte="sable" taille="sm" />
              <span>{R.blocs.exemple}</span>
            </h4>
            <p className="text-[16px] leading-relaxed text-ink-soft">{cible.exemple}</p>
          </Bloc>

          <Detail id={`${base}-lieux`} titre={R.blocs.lieux} icone="epingle" teinte="eau" ouvert={ouvert(`${base}-lieux`)} onOuvert={onOuvert} action={copier("lieux", R.blocs.lieux, "eau")}>
            <ul className="space-y-3">
              {cible.lieux.map((l) => (
                <li key={l.type} className="flex flex-col items-start gap-2 text-[16px] sm:flex-row sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2">
                      <PastilleIcone nom={iconeLieu(l.type)} teinte="eau" taille="sm" />
                      <strong className="min-w-0">{l.type}</strong>
                    </p>
                    <p className="mt-1 text-ink-soft">{l.pourquoi}</p>
                    <p className="mt-1 text-[15px]">{R.recherche(l.recherche)}</p>
                  </div>
                  <LiensLieu recherche={l.recherche} M={M} />
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2 text-[16px] font-medium">
              <PastilleIcone nom="megaphone" teinte="lilas" taille="sm" />
              <span>{R.canaux}</span>
            </p>
            <ul className="space-y-3">
              {canaux.map((c) => (
                <li key={c.canal + c.action} className="flex items-start gap-2 text-[16px]">
                      <PastilleIcone nom={iconeCanal(c.canal)} teinte={teintePriorite(c.priorite)} taille="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-start gap-2">
                      <span className="min-w-0 pt-1 font-medium">{M.canaux[c.canal]}</span>
                      <span className="mt-1.5">
                        <PastillePriorite niveau={c.priorite} libelle={R.priorite(c.priorite)} />
                      </span>
                    </p>
                    <p className="mt-1">{c.action}</p>
                    <p className="mt-1 text-ink-soft">{c.pourquoi}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-sm italic text-ink-soft">{R.lieuxNote}</p>
            <EncartAnnuaires M={M} />
          </Detail>

          <Detail id={`${base}-linkedin`} titre={R.blocs.linkedin} icone="in" teinte="miel" ouvert={ouvert(`${base}-linkedin`)} onOuvert={onOuvert} action={copier("linkedin", R.blocs.linkedin, "miel")}>
            <p className="text-[16px]">{R.pertinence[lin.pertinence]}</p>
            <p className="text-[15px] font-medium">{R.motsCles}</p>
            <div className="overflow-x-auto rounded-xl bg-sand p-3">
              <code className="whitespace-pre text-[14px]">{lin.motsCles}</code>
            </div>
            <BoutonCopier texte={lin.motsCles} M={M} />
            {filtres.map(([titre, items]) =>
              items.length > 0 ? (
                <div key={titre} className="space-y-1">
                  <p className="text-[15px] font-medium">{titre}</p>
                  <Liste items={items} />
                </div>
              ) : null,
            )}
            <p className="text-[15px]">
              <span className="font-medium">{R.astuce}</span>{M.commun.dp}{lin.astuce}
            </p>
          </Detail>

          <Detail id={`${base}-messages`} titre={R.blocs.messages} icone="enveloppe" teinte="corail" ouvert={ouvert(`${base}-messages`)} onOuvert={onOuvert} action={copier("messages", R.blocs.messages, "corail")}>
            <div className="space-y-2">
              <p className="text-[15px] font-medium">{R.messageLinkedin}</p>
              <p className="whitespace-pre-line rounded-xl bg-sand p-3 text-[16px] leading-relaxed">{voir(cible.messages.linkedin)}</p>
              <p className="text-sm text-ink-soft">{R.caracteres(cible.messages.linkedin.length)}</p>
              <BoutonCopier texte={voir(cible.messages.linkedin)} M={M} />
            </div>
            <div className="space-y-2">
              <p className="text-[15px] font-medium">{R.email}</p>
              <p className="text-[16px] font-medium">{objetEmail}</p>
              <p className="whitespace-pre-line rounded-xl bg-sand p-3 text-[16px] leading-relaxed">{corps}</p>
              <BoutonCopier texte={`${objetEmail}\n\n${corps}`} M={M} />
            </div>
            <p className="text-sm italic text-ink-soft">{R.messagesNote}</p>
          </Detail>

          <Detail id={`${base}-test`} titre={R.blocs.test} icone="calendrier" teinte="sage" ouvert={ouvert(`${base}-test`)} onOuvert={onOuvert} action={copier("test", R.blocs.test, "sage")}>
            <p className="text-[17px] font-semibold">{R.testConsigne}</p>
            <p className="text-[16px]">
              <span className="font-medium">{R.aQui}</span>{M.commun.dp}{cible.testTerrain.profils}
            </p>
            <p className="text-[16px] font-medium">{R.questionsTest}</p>
            <ol className="list-decimal space-y-1 pl-5 text-[16px]">
              {cible.testTerrain.questions.map((q) => (
                <li key={q}>{voir(q)}</li>
              ))}
            </ol>
            <p className="text-[16px] font-medium">{R.signauxPositifs}</p>
            <Liste items={cible.testTerrain.signauxPositifs} />
            <p className="text-[16px] font-medium">{R.signauxNegatifs}</p>
            <Liste items={cible.testTerrain.signauxNegatifs} />
          </Detail>
          {blocPortrait}
        </div>
      </details>
    </section>
  );
}
