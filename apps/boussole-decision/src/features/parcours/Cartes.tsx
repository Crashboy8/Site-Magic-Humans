import type { CSSProperties } from "react";
import { cx } from "@/components/ui";
import { ACTION_SEANCE_ARGENT, type ActionProposee, type InfoArgent, type InfoValeurs, type Quete, type Resultat } from "@/domain/parcours/position";
import type { Branche, Mutualisable, Offre, ParcoursPublic, PointAttention, Reponse } from "@/domain/parcours/types";
import { Icone, type NomIcone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { MiniFrise } from "./Frise";
import { Pastille, Puce } from "./Habillage";
import { capitale, lienSortant } from "./liens";
import { ICONE_ATTENTION, iconeEtape, iconeOutil, styleBranche } from "./theme";

const ETAT_REPONSE: Record<Reponse | "aucune", { icone: NomIcone; classe: string }> = {
  oui: { icone: "coche", classe: "bg-[#1A7A6D] text-white" },
  en_partie: { icone: "demi", classe: "bg-[#FFF1C2] text-[#7A5200]" },
  pas_encore: { icone: "horloge", classe: "bg-[#F1E9DC] text-[#5C4632]" },
  aucune: { icone: "cadenas", classe: "bg-[#F1E9DC] text-ink-soft" },
};

const titreCarte = "flex items-center gap-2 font-serif text-[22px] italic leading-tight sm:text-[24px]";

/** La quête du moment : la jauge (avec le repère du seuil), les objectifs et les objectifs clés. */
export function QueteDuMoment({ data, T, quete, compact = false }: { data: ParcoursPublic; T: ParcoursMessages; quete: Quete; compact?: boolean }) {
  const { etape, bilan, objectifs, manque } = quete;
  const pourcent = bilan.max > 0 ? (bilan.points / bilan.max) * 100 : 0;
  return (
    <article className="relative overflow-hidden rounded-[26px] border border-(--oj-claire) bg-white p-5 sm:p-6" style={styleBranche(etape.branche)}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-(--oj-forte)" />
      <header className="flex items-start gap-3">
        <Pastille nom={iconeEtape(etape.id)} plein />
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-(--oj-texte)">
            {etape.code} · {etape.brancheNom}
          </p>
          <h4 className="font-serif text-[22px] italic leading-tight">{etape.nom}</h4>
        </div>
      </header>
      <p className="mt-3 font-serif text-[18px] italic leading-snug text-ink-soft">«&nbsp;{etape.question}&nbsp;»</p>
      <div className="mt-4">
        <div className="relative h-3 rounded-full bg-sand" role="img" aria-label={`${T.resultat.jauge(bilan.points, bilan.max)}. ${T.resultat.seuil(bilan.requis)}.`}>
          <span className="oj-barre-entree absolute inset-y-0 left-0 rounded-full bg-(--oj-forte)" style={{ width: `${pourcent}%` }} />
          <span aria-hidden="true" className="absolute -top-1.5 h-6 w-1 -translate-x-1/2 rounded-full bg-ink" style={{ left: `${data.seuil}%` }} />
        </div>
        <p className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[14px]">
          <span className="font-semibold text-ink">{T.resultat.jauge(bilan.points, bilan.max)}</span>
          <span className="text-ink-soft">{T.resultat.seuil(bilan.requis)}</span>
        </p>
        <p className="mt-1 text-[14px] font-semibold text-(--oj-texte)">
          {T.resultat.cles(bilan.essentielsOui, bilan.essentiels)} · {T.resultat.manque(manque.points)}
        </p>
      </div>
      <h5 className="mt-5 text-[13px] font-bold uppercase tracking-[0.1em] text-ink-soft">{T.resultat.objectifs}</h5>
      <ul className="mt-2 space-y-2.5">
        {objectifs.map(({ critere, reponse }) => {
          const e = ETAT_REPONSE[reponse ?? "aucune"];
          return (
            <li key={critere.id} className="flex items-start gap-2.5">
              <span aria-hidden="true" className={cx("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full [&_svg]:h-3.5 [&_svg]:w-3.5", e.classe)}>
                <Icone nom={e.icone} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] leading-snug text-ink">
                {critere.texte}
                {reponse && <span className="sr-only"> : {T.resultat.reponseCourte[reponse]}</span>}
              </span>
              {critere.essentiel && (
                <span className="mt-0.5 shrink-0 rounded-full bg-(--oj-fond) px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-(--oj-texte)">{T.resultat.cle}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[13px] leading-snug text-ink-soft">{T.resultat.cleAide}</p>
      {!compact && etape.blocages.length > 0 && (
        <details className="group mt-4 rounded-2xl bg-paper px-4 py-3">
          <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <Icone nom="eclair" className="h-4 w-4 shrink-0 text-(--oj-texte)" />
            {T.resultat.pieges}
            <Icone nom="fleche" className="h-4 w-4 shrink-0 rotate-90 transition group-open:-rotate-90" />
          </summary>
          <ul className="mt-2 space-y-1.5">
            {etape.blocages.map((b) => (
              <li key={b} className="text-[15px] leading-snug text-ink-soft">
                {b}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}

function BoutonOutil({ lien, emplacement }: { lien: NonNullable<ActionProposee["action"]["lien"]>; emplacement: string }) {
  return (
    <a
      href={lienSortant(lien.url, emplacement)}
      className="mt-3 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-(--oj-bouton) px-4 py-2 text-left text-[15px] font-medium leading-tight text-(--oj-bouton-texte) transition hover:brightness-95 active:scale-[0.98]"
    >
      <Icone nom={iconeOutil(lien.id)} className="h-5 w-5 shrink-0" />
      <span>{lien.nom}</span>
      <Icone nom="fleche" className="h-4 w-4 shrink-0" />
    </a>
  );
}

/** Une action proposée, avec le bouton vers son outil quand il existe. */
function CarteAction({ data, T, a, i, ancreAppel }: { data: ParcoursPublic; T: ParcoursMessages; a: ActionProposee; i: number; ancreAppel: string }) {
  const etape = a.etape === "argent" ? null : data.etapes[a.etape];
  return (
    <li
      className="oj-apparait relative flex gap-3.5 rounded-[22px] border border-(--oj-claire) bg-white p-4 shadow-[0_12px_28px_-24px_var(--oj-forte)] sm:p-5"
      style={{ ...styleBranche(a.branche), "--i": i } as CSSProperties}
    >
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-(--oj-forte) text-[18px] font-bold text-white">
        {i + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap gap-1.5">
          <Puce icone={etape ? iconeEtape(etape.id) : "pieces"} className="bg-(--oj-fond) text-(--oj-texte)">
            {etape ? `${etape.code} · ${etape.nom}` : data.argent.nom}
          </Puce>
          {a.cle && (
            <Puce icone="cle" className="bg-[#FFF1C2] text-[#7A5200]">
              {T.resultat.debloque}
            </Puce>
          )}
          {a.commune && (
            <Puce icone="bifurcation" className="bg-[#EEF8FE] text-[#155F8C]">
              {T.resultat.commune}
            </Puce>
          )}
        </p>
        <p className="mt-2 text-[16px] leading-snug text-ink">{a.action.texte}</p>
        {a.action.lien ? (
          <BoutonOutil lien={a.action.lien} emplacement="action" />
        ) : a.etape === "argent" ? (
          <a href={ancreAppel} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-link underline underline-offset-4">
            <Icone nom="horloge" className="h-4 w-4 shrink-0" />
            {T.resultat.seance} · {T.resultat.voirComment}
          </a>
        ) : (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-ink-soft">
            <Icone nom="crayon" className="h-4 w-4 shrink-0" />
            {T.resultat.deTonCote}
          </p>
        )}
      </div>
    </li>
  );
}

/** Les 3 prochaines actions (ou, tout franchi, de quoi garder le réglage). */
export function Actions({ data, T, resultat, ancreAppel }: { data: ParcoursPublic; T: ParcoursMessages; resultat: Resultat; ancreAppel: string }) {
  if (resultat.actions.length === 0) return null;
  return (
    <section aria-labelledby="actions-titre">
      <h3 id="actions-titre" className={cx(titreCarte, "text-[26px] sm:text-[28px]")}>
        <Icone nom="drapeau" className="h-6 w-6 shrink-0 text-accent-strong" />
        {resultat.position.etat === "termine" ? T.resultat.actionsReglage : T.resultat.actions}
      </h3>
      <ol className="mt-3 space-y-3">
        {resultat.actions.map((a, i) => (
          <CarteAction key={a.action.id} data={data} T={T} a={a} i={i} ancreAppel={ancreAppel} />
        ))}
      </ol>
    </section>
  );
}

/** Module Argent, estime de soi et savoir te vendre : une séance avec Pierre, jamais un lien d'outil. */
export function CarteArgent({ data, T, info, commune }: { data: ParcoursPublic; T: ParcoursMessages; info: InfoArgent | null; commune: Mutualisable | null }) {
  if (!info?.propose) return null;
  const enAttendant = data.argent.actions.filter((a) => a.id !== ACTION_SEANCE_ARGENT);
  return (
    <section aria-labelledby="argent-titre" className="relative overflow-hidden rounded-[26px] border border-(--oj-claire) bg-[linear-gradient(160deg,var(--oj-fond)_0%,#FFFFFF_72%)] p-5 sm:p-6" style={styleBranche("module")}>
      <div className="flex items-start gap-3">
        <Pastille nom="pieces" plein />
        <div className="min-w-0">
          {info.prioritaire && (
            <Puce icone="eclair" className="mb-1.5 bg-(--oj-bouton) text-(--oj-bouton-texte)">
              {T.resultat.argentPrioritaire}
            </Puce>
          )}
          <h3 id="argent-titre" className="font-serif text-[22px] italic leading-tight">
            {data.argent.nom}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink">{data.argent.objectif}</p>
      {info.note !== null && info.note <= data.argent.seuil && <p className="mt-3 text-[15px] font-semibold text-(--oj-texte)">{T.resultat.argentNote(info.note)}</p>}
      {info.criteres.length > 0 && (
        <>
          <p className="mt-3 text-[15px] font-semibold text-(--oj-texte)">{T.resultat.argentCriteres}</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px] leading-snug text-ink">
            {info.criteres.map((c) => (
              <li key={c.id}>{c.texte}</li>
            ))}
          </ul>
        </>
      )}
      {commune && (
        <p className="mt-3 rounded-2xl bg-white/85 px-4 py-3 text-[15px] leading-snug text-ink">
          <span className="font-semibold">{commune.nom} : </span>
          {commune.texte}
        </p>
      )}
      <p className="mt-4 text-[15px] font-semibold text-ink">{T.resultat.argentFacons}</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        {data.argent.seances.map((s) => (
          <li key={s.id} className="rounded-2xl border border-(--oj-claire) bg-white p-3">
            <p className="text-[15px] font-semibold leading-snug text-ink">{s.nom}</p>
            <p className="mt-1 text-[14px] leading-snug text-ink-soft">{capitale(s.prix)}</p>
          </li>
        ))}
      </ul>
      {enAttendant.length > 0 && (
        <>
          <p className="mt-4 text-[15px] font-semibold text-ink">{T.resultat.argentAvant}</p>
          <ul className="mt-1.5 space-y-1.5">
            {enAttendant.map((a) => (
              <li key={a.id} className="flex gap-2 text-[15px] leading-snug text-ink">
                <Icone nom="crayon" className="mt-0.5 h-4 w-4 shrink-0 text-(--oj-texte)" />
                {a.texte}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/** Un critère valeurs à Pas encore ou En partie : mis en avant, avec la Boussole. */
export function CarteValeurs({ T, info }: { T: ParcoursMessages; info: InfoValeurs | null }) {
  if (!info) return null;
  return (
    <section aria-labelledby="valeurs-titre" className="rounded-[26px] border border-(--oj-claire) bg-[linear-gradient(160deg,var(--oj-fond)_0%,#FFFFFF_72%)] p-5 sm:p-6" style={styleBranche("aboutissement")}>
      <div className="flex items-center gap-3">
        <Pastille nom="diamant" plein />
        <h3 id="valeurs-titre" className="font-serif text-[22px] italic leading-tight">
          {T.resultat.valeurs}
        </h3>
      </div>
      <p className="mt-3 text-[15px] font-semibold text-(--oj-texte)">{T.resultat.valeursTexte}</p>
      <ul className="mt-2 space-y-2">
        {info.criteres.map(({ critere, reponse }) => (
          <li key={critere.id} className="flex items-start gap-2.5 text-[15px] leading-snug text-ink">
            <span className="mt-0.5 shrink-0 rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-(--oj-texte) shadow-sm">{T.resultat.reponseCourte[reponse]}</span>
            <span className="min-w-0">{critere.texte}</span>
          </li>
        ))}
      </ul>
      {info.outil && <BoutonOutil lien={info.outil} emplacement="valeurs" />}
    </section>
  );
}

/** Voie E : ce qui se fait une seule fois pour les deux branches. */
export function Communes({ T, communes }: { T: ParcoursMessages; communes: Mutualisable[] }) {
  const paires = communes.filter((m) => m.etapes.length > 1);
  if (paires.length === 0) return null;
  return (
    <section aria-labelledby="communes-titre" className="rounded-[26px] border border-[#C6E6F8] bg-[linear-gradient(135deg,#E5F6F3_0%,#EEF8FE_100%)] p-5 sm:p-6">
      <h3 id="communes-titre" className={titreCarte}>
        <Icone nom="bifurcation" className="h-6 w-6 shrink-0 text-[#155F8C]" />
        {T.resultat.communes}
      </h3>
      <ul className="mt-3 space-y-2.5">
        {paires.map((m) => (
          <li key={m.nom} className="rounded-2xl bg-white/90 p-4">
            <p className="font-semibold text-ink">{m.nom}</p>
            <p className="mt-1 text-[15px] leading-snug text-ink-soft">{m.texte}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const COULEURS_ATTENTION: Branche[] = ["tronc", "aboutissement", "passerelle", "salarie"];

/** Voie E : les 4 points d'attention (temps, énergie, cohérence, contrat). */
export function Attention({ T, points }: { T: ParcoursMessages; points: PointAttention[] }) {
  if (points.length === 0) return null;
  return (
    <section aria-labelledby="attention-titre" className="rounded-[26px] border border-line bg-white p-5 sm:p-6">
      <h3 id="attention-titre" className={titreCarte}>
        <Icone nom="eclair" className="h-6 w-6 shrink-0 text-accent-strong" />
        {T.resultat.attention}
      </h3>
      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {points.map((p, i) => (
          <li key={p.id} className="flex gap-3 rounded-2xl bg-(--oj-fond) p-3.5" style={styleBranche(COULEURS_ATTENTION[i % COULEURS_ATTENTION.length])}>
            <Pastille nom={ICONE_ATTENTION[p.id] ?? "etoile"} taille="sm" plein />
            <div className="min-w-0">
              <p className="font-semibold leading-snug text-ink">{p.nom}</p>
              <p className="mt-0.5 text-[15px] leading-snug text-ink-soft">{p.texte}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** La connaissance de toi, menée en parallèle : sa petite frise, son étape et deux actions. */
export function PisteParallele({ data, T, resultat }: { data: ParcoursPublic; T: ParcoursMessages; resultat: Resultat }) {
  const piste = resultat.position.parallele;
  if (!piste) return null;
  const quete = resultat.queteParallele;
  return (
    <section aria-labelledby="parallele-titre" className="rounded-[26px] border border-(--oj-claire) bg-[linear-gradient(160deg,var(--oj-fond)_0%,#FFFFFF_72%)] p-5 sm:p-6" style={styleBranche("soi")}>
      <h3 id="parallele-titre" className={titreCarte}>
        <Icone nom="coeur" className="h-6 w-6 shrink-0 text-(--oj-texte)" />
        {T.resultat.queteParallele}
      </h3>
      <div className="mt-4">
        <MiniFrise data={data} T={T} piste={piste} />
      </div>
      {quete ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-(--oj-texte)">
            <Icone nom="pin" className="h-3.5 w-3.5 shrink-0" />
            {quete.etape.code} · {T.resultat.tuEsIci}
          </p>
          <p className="mt-0.5 font-serif text-[20px] italic leading-snug">{quete.etape.nom}</p>
          <p className="mt-1 text-[15px] italic leading-snug text-ink-soft">«&nbsp;{quete.etape.question}&nbsp;»</p>
          <ul className="mt-3 space-y-3">
            {resultat.actionsParallele.map((a) => (
              <li key={a.action.id} className="rounded-2xl bg-white p-3.5">
                <p className="text-[15px] leading-snug text-ink">{a.action.texte}</p>
                {a.action.lien && <BoutonOutil lien={a.action.lien} emplacement="parallele" />}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-[15px] font-semibold text-(--oj-texte)">{T.resultat.paralleleFinie}</p>
      )}
    </section>
  );
}

/** « Envie d'avancer plus vite ? » : l'Appel Découverte offert et l'offre de la voie (rien si elle n'est pas définie). */
export function Avancer({ T, offres }: { T: ParcoursMessages; offres: { appel: Offre; voie: Offre | null } }) {
  const { appel, voie } = offres;
  return (
    <section
      id="avancer"
      aria-labelledby="avancer-titre"
      className="relative scroll-mt-24 overflow-hidden rounded-[30px] border border-[#F0D2C6] bg-[linear-gradient(135deg,#FFF1EA_0%,#FFF9EA_55%,#EEF8FE_100%)] px-5 py-8 sm:px-10 sm:py-10"
    >
      <span aria-hidden="true" className="oj-flotte pointer-events-none absolute right-5 top-5 hidden text-[#E0A526] opacity-60 sm:block [&_svg]:h-10 [&_svg]:w-10">
        <Icone nom="etincelle" />
      </span>
      <h2 id="avancer-titre" className="text-center font-serif text-[32px] italic leading-tight sm:text-[40px]">
        {T.resultat.avancer}
      </h2>
      <div className={cx("mx-auto mt-6 grid max-w-3xl gap-4", voie && "md:grid-cols-2")}>
        <article className="flex flex-col rounded-[22px] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(58,47,36,0.6)]">
          <p className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-accent-deep">
            <Icone nom="horloge" className="h-4 w-4 shrink-0" />
            {appel.nom}
          </p>
          <p className="mt-2 text-[22px] font-semibold leading-tight text-ink">{[appel.prix ? capitale(appel.prix) : null, appel.duree].filter(Boolean).join(" · ")}</p>
          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-soft">{appel.contenu}</p>
          {appel.url && (
            <a
              href={lienSortant(appel.url, "avancer")}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-6 text-center text-[16px] font-semibold text-white shadow-[0_14px_28px_-14px_rgba(179,71,22,0.9)] transition hover:bg-accent-deep active:scale-[0.98]"
            >
              {T.resultat.appelBouton}
              <Icone nom="fleche" className="h-5 w-5 shrink-0" />
            </a>
          )}
        </article>
        {voie && (
          <article className="flex flex-col rounded-[22px] border border-white bg-white/75 p-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-soft">{T.resultat.plusLoin}</p>
            <p className="mt-2 font-serif text-[24px] italic leading-tight">{voie.nom}</p>
            {(voie.prix || voie.duree) && <p className="mt-1 text-[15px] font-semibold leading-snug text-ink">{[voie.prix, voie.duree].filter(Boolean).join(" · ")}</p>}
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{voie.contenu}</p>
          </article>
        )}
      </div>
    </section>
  );
}
