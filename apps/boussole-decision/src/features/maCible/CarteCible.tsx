"use client";

import { useState } from "react";
import { Badge, cx } from "@/components/ui";
import { iconeCanal, iconeCible, iconeLieu } from "@/domain/maCible/iconeCible";
import { GRILLE, type CleCritere, type LigneClassement } from "@/domain/maCible/scores";
import type { Cible } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BoutonCopier } from "./BoutonCopier";
import { AnneauScore, CLASSE_CARTE, PastilleIcone, PastillePriorite, TEINTE, teinteCible, type Teinte } from "./Habillage";
import type { NomIcone } from "./Icones";
import { EncartAnnuaires, LiensLieu } from "./LiensLieu";
import { texteCible } from "./export";
import { remplacerPrenom } from "./liens";

const CRITERES: CleCritere[] = ["urgence", "paiement", "acces", "plaisir"];
const RANG_STYLE = {
  prioritaire: "bg-accent-strong text-white",
  secondaire: "bg-sand text-ink",
  tertiaire: "border border-line text-ink",
} as const;

const nombre = (n: number) => n.toLocaleString("fr-FR");

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

function Bloc({ id, titre, pastille, icone, teinte, children }: { id?: string; titre: string; pastille?: { libelle: string; aide: string }; icone?: NomIcone; teinte: Teinte; children: React.ReactNode }) {
  return (
    <div id={id} data-ancre={id ? "" : undefined} className="scroll-mt-20 space-y-1.5">
      <h3 className="flex items-center gap-2 text-[19px] italic">
        {icone && <PastilleIcone nom={icone} teinte={teinte} taille="sm" />}
        <span className="min-w-0">{titre}</span>
        {pastille && <Pastille libelle={pastille.libelle} aide={pastille.aide} />}
      </h3>
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
  children,
}: {
  id: string;
  titre: string;
  ouvert: boolean;
  onOuvert: (id: string, ouvert: boolean) => void;
  icone: NomIcone;
  teinte: Teinte;
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
      <summary className="min-h-11 cursor-pointer py-2.5 font-serif text-[19px] italic">
        <span className="inline-flex items-center gap-2">
          <PastilleIcone nom={icone} teinte={teinte} taille="sm" />
          <span>{titre}</span>
        </span>
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

export function CarteCible({
  cible,
  ligne,
  rang,
  prenom,
  M,
  corpsOuvert,
  ouvert,
  onOuvert,
}: {
  cible: Cible;
  ligne: LigneClassement;
  rang: number;
  prenom: string;
  M: MaCibleMessages;
  corpsOuvert: boolean;
  ouvert: (id: string) => boolean;
  onOuvert: (id: string, ouvert: boolean) => void;
}) {
  const R = M.resultat;
  const idTitre = `cible-${rang}-titre`;
  const cleCorps = `cible-${rang}`;
  const voir = (s: string) => remplacerPrenom(s, prenom);
  const corps = voir(cible.messages.emailCorps);
  const objetEmail = R.objet(cible.messages.emailObjet);
  const lin = cible.linkedin;
  const canaux = cible.canaux.slice().sort((a, b) => a.priorite - b.priorite);
  const estimation = { libelle: R.pastilleEstimation, aide: R.pastilleAide };
  const teinte = teinteCible(rang - 1);
  const accent = TEINTE[teinte];
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
            <span className={cx("inline-flex rounded-full px-3 py-1 text-sm font-medium", RANG_STYLE[ligne.rang])}>{R.rangs[ligne.rang]}</span>
            <h2 id={idTitre} className="flex items-center gap-3 text-[28px] leading-tight">
              <PastilleIcone nom={iconeCible(cible.nom, `${cible.portrait} ${cible.promesse}`)} teinte={teinte} />
              <span className="min-w-0">{cible.nom}</span>
            </h2>
            <Badge tone="neutral">{R.marche[cible.marche]}</Badge>
            {cible.depuisIdees.length > 0 && <span className="inline-flex min-h-11 items-center rounded-full bg-miel px-3 text-xs font-medium text-white">{R.tonIdee}</span>}
          </div>
          <AnneauScore valeur={ligne.score} affiche={R.score(ligne.score)} couleur={accent.anneau} libelle={R.scoreTitre} />
        </div>
        <p className="flex items-start gap-2 font-serif text-[22px] italic leading-snug">
          <PastilleIcone nom="etincelles" teinte={teinte} taille="sm" />
          <span className="min-w-0">{voir(cible.promesse)}</span>
        </p>
        {ligne.alertePlaisir && <p className="rounded-xl border border-accent/30 bg-blush px-4 py-3 text-[15px]">{R.alertePlaisir}</p>}
        <div data-ecran-seul>
          <BoutonCopier texte={texteCible(cible, prenom, R.score(ligne.score), false)} M={M} libelle={R.copierCible} />
        </div>
      </header>

      <details open={corpsOuvert} onToggle={(e) => onOuvert(cleCorps, e.currentTarget.open)} className="space-y-6">
        <summary className="min-h-11 cursor-pointer py-2 text-[15px] text-link underline">{R.detail}</summary>
        <div className="space-y-6 pt-2">
          <ul className="grid gap-3 sm:grid-cols-2">
            {CRITERES.map((k) => {
              const n = cible.scores[k];
              return (
                <li key={k} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                    <span className="inline-flex flex-wrap items-center gap-2 font-medium">
                      {R.criteres[k]}
                      <Pastille libelle={R.pastilleEstimation} aide={R.pastilleAide} />
                    </span>
                    <span className="text-ink-soft">{R.noteSur5(n.note)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                    <div className={cx("h-full rounded-full", accent.barre)} style={{ width: `${n.note * 20}%` }} />
                  </div>
                  <p className="text-sm text-ink-soft">{n.raison}</p>
                </li>
              );
            })}
          </ul>
          <details className="text-[15px]" open={ouvert(`cible-${rang}-grille`)} onToggle={(e) => onOuvert(`cible-${rang}-grille`, e.currentTarget.open)}>
            <summary className="min-h-11 cursor-pointer py-2 text-link underline">{R.grilleLien}</summary>
            <div className="space-y-2 pb-2">
              <p className="text-ink-soft">{R.grilleTexte}</p>
              <dl className="space-y-1.5 text-sm">
                {GRILLE.map((g) => (
                  <div key={g.cle}>
                    <dt className="font-medium">
                      {g.libelle} ({g.poids} %)
                    </dt>
                    <dd className="text-ink-soft">
                      1 : {g.un} / 3 : {g.trois} / 5 : {g.cinq}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>

          <Bloc titre={R.blocs.portrait} icone="personne" teinte={teinte}>
            <p className="text-[17px] leading-relaxed">{voir(cible.portrait)}</p>
          </Bloc>
          <Bloc id={`cible-${rang}-douleur`} titre={R.blocs.douleur} icone="eclair" teinte={teinte} pastille={{ libelle: R.pastilleHypothese, aide: R.pastilleAide }}>
            <p className="text-[17px] leading-relaxed">{voir(cible.douleur)}</p>
          </Bloc>
          <Bloc titre={R.blocs.ancrage} icone="boussole" teinte={teinte}>
            <p className="text-[17px] leading-relaxed">{cible.ancrage}</p>
          </Bloc>
          <Bloc id={`cible-${rang}-offre`} titre={R.blocs.offre} icone="cadeau" teinte={teinte}>
            <p className="text-[17px] font-semibold">{cible.offre.nom}</p>
            <p className="text-[16px]">
              <span className="font-medium">{R.format}</span> : {cible.offre.format}
            </p>
            <p className="text-[16px]">
              <span className="font-medium">{R.duree}</span> : {cible.offre.duree}
            </p>
            <p className="text-[16px] font-medium">{R.contenu}</p>
            <Liste items={cible.offre.contenu} />
            <p className="flex flex-wrap items-center gap-2 text-[16px]">
              <span className="inline-flex items-center gap-2">
                <PastilleIcone nom="etiquette" teinte={teinte} taille="sm" />
                <span>
                  <span className="font-medium">{R.prix}</span> : {R.prixValeur(nombre(cible.prix.min), nombre(cible.prix.max), cible.prix.base, cible.prix.unite)}
                </span>
              </span>
              <Pastille libelle={estimation.libelle} aide={estimation.aide} />
            </p>
            <p className="text-[15px] text-ink-soft">{cible.prix.justification}</p>
            <p className="text-sm italic text-ink-soft">{R.prixNote}</p>
          </Bloc>
          <Bloc titre={R.blocs.pitch} icone="micro" teinte={teinte}>
            <p className="text-[17px] leading-relaxed">{voir(cible.pitch)}</p>
          </Bloc>
          <Bloc titre={R.blocs.pourquoi} icone="etoile" teinte={teinte}>
            <p className="text-[17px] leading-relaxed">{cible.pourquoi}</p>
            <h4 className="flex items-center gap-2 pt-2 font-serif text-[17px] italic">
              <PastilleIcone nom="ampoule" teinte={teinte} taille="sm" />
              <span>{R.blocs.exemple}</span>
            </h4>
            <p className="text-[16px] leading-relaxed text-ink-soft">{cible.exemple}</p>
          </Bloc>

          <Detail id={`cible-${rang}-lieux`} titre={R.blocs.lieux} icone="epingle" teinte={teinte} ouvert={ouvert(`cible-${rang}-lieux`)} onOuvert={onOuvert}>
            <ul className="space-y-3">
              {cible.lieux.map((l) => (
                <li key={l.type} className="flex flex-col items-start gap-2 text-[16px] sm:flex-row sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2">
                      <PastilleIcone nom={iconeLieu(l.type)} teinte={teinte} taille="sm" />
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
              <PastilleIcone nom="couches" teinte={teinte} taille="sm" />
              <span>{R.canaux}</span>
            </p>
            <ul className="space-y-3">
              {canaux.map((c) => (
                <li key={c.canal + c.action} className="text-[16px]">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <PastilleIcone nom={iconeCanal(c.canal)} teinte={teinte} taille="sm" />
                      {M.canaux[c.canal]}
                    </span>
                    <PastillePriorite niveau={c.priorite} libelle={R.priorite(c.priorite)} />
                  </p>
                  <br />
                  {c.action}
                  <br />
                  <span className="text-ink-soft">{c.pourquoi}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm italic text-ink-soft">{R.lieuxNote}</p>
            <EncartAnnuaires M={M} />
          </Detail>

          <Detail id={`cible-${rang}-linkedin`} titre={R.blocs.linkedin} icone="groupe" teinte={teinte} ouvert={ouvert(`cible-${rang}-linkedin`)} onOuvert={onOuvert}>
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
              <span className="font-medium">{R.astuce}</span> : {lin.astuce}
            </p>
          </Detail>

          <Detail id={`cible-${rang}-messages`} titre={R.blocs.messages} icone="enveloppe" teinte={teinte} ouvert={ouvert(`cible-${rang}-messages`)} onOuvert={onOuvert}>
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

          <Detail id={`cible-${rang}-test`} titre={R.blocs.test} icone="calendrier" teinte={teinte} ouvert={ouvert(`cible-${rang}-test`)} onOuvert={onOuvert}>
            <p className="text-[17px] font-semibold">{R.testConsigne}</p>
            <p className="text-[16px]">
              <span className="font-medium">{R.aQui}</span> : {cible.testTerrain.profils}
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
        </div>
      </details>
    </section>
  );
}
