import { Badge, cx } from "@/components/ui";
import { GRILLE, type CleCritere, type LigneClassement } from "@/domain/maCible/scores";
import type { Cible } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BoutonCopier } from "./BoutonCopier";
import { remplacerPrenom } from "./liens";

const CRITERES: CleCritere[] = ["urgence", "paiement", "acces", "plaisir"];
const RANG_STYLE = {
  prioritaire: "bg-accent-strong text-white",
  secondaire: "bg-sand text-ink",
  tertiaire: "border border-line text-ink",
} as const;

const nombre = (n: number) => n.toLocaleString("fr-FR");

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-[19px] italic">{titre}</h3>
      {children}
    </div>
  );
}

function Repliable({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <details className="rounded-xl border border-line px-4 py-2">
      <summary className="min-h-11 cursor-pointer py-2.5 font-serif text-[19px] italic">{titre}</summary>
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

export function CarteCible({ cible, ligne, rang, prenom, M }: { cible: Cible; ligne: LigneClassement; rang: number; prenom: string; M: MaCibleMessages }) {
  const R = M.resultat;
  const idTitre = `cible-${rang}-titre`;
  const corps = remplacerPrenom(cible.messages.emailCorps, prenom);
  const objetEmail = R.objet(cible.messages.emailObjet);
  const lin = cible.linkedin;
  const canaux = cible.canaux.slice().sort((a, b) => a.priorite - b.priorite);
  const filtres: [string, string[]][] = [
    [R.intitules, lin.intitules],
    [R.secteurs, lin.secteurs],
    [R.tailles, lin.tailles],
    [R.zone, lin.zone ? [lin.zone] : []],
    [R.autres, lin.autres],
  ];

  return (
    <section
      id={`cible-${rang}`}
      aria-labelledby={idTitre}
      className="carte-cible scroll-mt-4 space-y-6 rounded-2xl border border-line bg-paper p-6 shadow-[0_1px_2px_rgba(58,47,36,0.04)] sm:p-8"
    >
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <span className={cx("inline-flex rounded-full px-3 py-1 text-sm font-medium", RANG_STYLE[ligne.rang])}>{R.rangs[ligne.rang]}</span>
              <h2 id={idTitre} className="text-[28px] leading-tight">
                {cible.nom}
              </h2>
              <Badge tone="neutral">{R.marche[cible.marche]}</Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink-soft">{R.scoreTitre}</p>
              <p className="font-serif text-[40px] leading-none text-accent-strong" aria-label={`${R.scoreTitre} ${R.score(ligne.score)}`}>
                {R.score(ligne.score)}
              </p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CRITERES.map((k) => {
              const n = cible.scores[k];
              return (
                <li key={k} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-[15px]">
                    <span className="font-medium">{R.criteres[k]}</span>
                    <span className="text-ink-soft">{R.noteSur5(n.note)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${n.note * 20}%` }} />
                  </div>
                  <p className="text-sm text-ink-soft">{n.raison}</p>
                </li>
              );
            })}
          </ul>
          <details className="text-[15px]">
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
          {ligne.alertePlaisir && <p className="rounded-xl border border-accent/30 bg-blush px-4 py-3 text-[15px]">{R.alertePlaisir}</p>}
        </header>

        <Bloc titre={R.blocs.portrait}>
          <p className="text-[17px] leading-relaxed">{cible.portrait}</p>
        </Bloc>
        <Bloc titre={R.blocs.douleur}>
          <p className="text-[17px] leading-relaxed">{cible.douleur}</p>
        </Bloc>
        <Bloc titre={R.blocs.ancrage}>
          <p className="text-[17px] leading-relaxed">{cible.ancrage}</p>
        </Bloc>
        <Bloc titre={R.blocs.promesse}>
          <p className="font-serif text-[22px] italic leading-snug">{cible.promesse}</p>
        </Bloc>
        <Bloc titre={R.blocs.offre}>
          <p className="text-[17px] font-semibold">{cible.offre.nom}</p>
          <p className="text-[16px]">
            <span className="font-medium">{R.format}</span> : {cible.offre.format}
          </p>
          <p className="text-[16px]">
            <span className="font-medium">{R.duree}</span> : {cible.offre.duree}
          </p>
          <p className="text-[16px] font-medium">{R.contenu}</p>
          <Liste items={cible.offre.contenu} />
          <p className="text-[16px]">
            <span className="font-medium">{R.prix}</span> : {R.prixValeur(nombre(cible.prix.min), nombre(cible.prix.max), cible.prix.base, cible.prix.unite)}
          </p>
          <p className="text-[15px] text-ink-soft">{cible.prix.justification}</p>
          <p className="text-sm italic text-ink-soft">{R.prixNote}</p>
        </Bloc>
        <Bloc titre={R.blocs.pitch}>
          <p className="text-[17px] leading-relaxed">{cible.pitch}</p>
        </Bloc>
        <Bloc titre={R.blocs.pourquoi}>
          <p className="text-[17px] leading-relaxed">{cible.pourquoi}</p>
          <h4 className="pt-2 font-serif text-[17px] italic">{R.blocs.exemple}</h4>
          <p className="text-[16px] leading-relaxed text-ink-soft">{cible.exemple}</p>
        </Bloc>

        <Repliable titre={R.blocs.lieux}>
          <ul className="space-y-3">
            {cible.lieux.map((l) => (
              <li key={l.type} className="text-[16px]">
                <strong>{l.type}</strong>
                <br />
                <span className="text-ink-soft">{l.pourquoi}</span>
                <br />
                <span className="text-[15px]">{R.recherche(l.recherche)}</span>
              </li>
            ))}
          </ul>
          <p className="text-[16px] font-medium">{R.canaux}</p>
          <ul className="space-y-3">
            {canaux.map((c) => (
              <li key={c.canal + c.action} className="text-[16px]">
                <strong>{M.canaux[c.canal]}</strong> <span className="text-sm text-ink-soft">({R.priorite(c.priorite)})</span>
                <br />
                {c.action}
                <br />
                <span className="text-ink-soft">{c.pourquoi}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm italic text-ink-soft">{R.lieuxNote}</p>
        </Repliable>

        <Repliable titre={R.blocs.linkedin}>
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
        </Repliable>

        <Repliable titre={R.blocs.messages}>
          <div className="space-y-2">
            <p className="text-[15px] font-medium">{R.messageLinkedin}</p>
            <p className="whitespace-pre-line rounded-xl bg-sand p-3 text-[16px] leading-relaxed">{remplacerPrenom(cible.messages.linkedin, prenom)}</p>
            <p className="text-sm text-ink-soft">{R.caracteres(cible.messages.linkedin.length)}</p>
            <BoutonCopier texte={remplacerPrenom(cible.messages.linkedin, prenom)} M={M} />
          </div>
          <div className="space-y-2">
            <p className="text-[15px] font-medium">{R.email}</p>
            <p className="text-[16px] font-medium">{objetEmail}</p>
            <p className="whitespace-pre-line rounded-xl bg-sand p-3 text-[16px] leading-relaxed">{corps}</p>
            <BoutonCopier texte={`${objetEmail}\n\n${corps}`} M={M} />
          </div>
          <p className="text-sm italic text-ink-soft">{R.messagesNote}</p>
        </Repliable>

        <Repliable titre={R.blocs.test}>
          <p className="text-[17px] font-semibold">{R.testConsigne}</p>
          <p className="text-[16px]">
            <span className="font-medium">{R.aQui}</span> : {cible.testTerrain.profils}
          </p>
          <p className="text-[16px] font-medium">{R.questionsTest}</p>
          <ol className="list-decimal space-y-1 pl-5 text-[16px]">
            {cible.testTerrain.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
          <p className="text-[16px] font-medium">{R.signauxPositifs}</p>
          <Liste items={cible.testTerrain.signauxPositifs} />
          <p className="text-[16px] font-medium">{R.signauxNegatifs}</p>
          <Liste items={cible.testTerrain.signauxNegatifs} />
        </Repliable>
    </section>
  );
}
