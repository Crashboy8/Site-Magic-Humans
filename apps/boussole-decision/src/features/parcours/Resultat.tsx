import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Resultat as ResultatParcours } from "@/domain/parcours/position";
import type { Branche, ParcoursPublic } from "@/domain/parcours/types";
import { Icone, type NomIcone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { Actions, Attention, Avancer, CarteArgent, CarteValeurs, Communes, PisteParallele, QueteDuMoment } from "./Cartes";
import { Frise } from "./Frise";
import { Compteur, Pastille } from "./Habillage";
import { Echelle } from "./Niveau";
import { fondVoie, ICONE_VOIE, iconeEtape, styleBranche, TEINTES } from "./theme";

/** Ce qu'on retient d'un point pour mesurer le chemin parcouru au point suivant. */
export interface Resume {
  points: number;
  franchies: number;
}

function Stat({ icone, label, children }: { icone: NomIcone; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white/90 px-2 py-3 text-center shadow-[0_10px_24px_-20px_rgba(58,47,36,0.6)] sm:px-4">
      <dt className="flex flex-col items-center gap-1 text-[11px] font-bold uppercase leading-tight tracking-[0.08em] text-ink-soft sm:flex-row sm:gap-1.5 sm:text-[12px]">
        <Icone nom={icone} className="h-4 w-4 shrink-0 text-[#B7791F]" />
        {label}
      </dt>
      <dd className="mt-1.5 font-sans text-[26px] font-semibold leading-none tracking-tight text-ink tabular-nums sm:text-[32px]">{children}</dd>
    </div>
  );
}

/** Le grand bloc du haut : ta voie, ton étape (ou tes deux étapes), tes points, tes étapes, ton niveau. */
function Ici({ data, T, resultat, page, onChoisirVoie }: { data: ParcoursPublic; T: ParcoursMessages; resultat: ResultatParcours; page: boolean; onChoisirVoie: () => void }) {
  const { position, voie, niveau } = resultat;
  const actuelles = position.actuelles.map((id) => data.etapes[id]);
  const fin = position.etat === "termine";
  const choisir = position.etat === "voie_a_choisir";
  const branche: Branche = fin ? "aboutissement" : choisir ? "tronc" : (actuelles[0]?.branche ?? "tronc");
  const Titre = page ? "h1" : "h3";
  const titreClasse = "relative mt-1 font-serif text-[34px] italic leading-[1.05] outline-none sm:text-[46px]";
  return (
    <section
      className="oj-apparait relative overflow-hidden rounded-[30px] border border-(--oj-claire) p-5 shadow-[0_30px_70px_-50px_rgba(58,47,36,0.6)] sm:p-8"
      style={{ ...styleBranche(branche), background: `radial-gradient(90% 120% at 100% 0%, ${TEINTES[branche].fond} 0%, #FFFFFF 72%)` }}
    >
      <span aria-hidden="true" className="oj-flotte pointer-events-none absolute -right-8 -top-8 text-(--oj-forte) opacity-[0.1] [&_svg]:h-52 [&_svg]:w-52">
        <Icone nom={fin ? "soleil" : iconeEtape(actuelles[0]?.id ?? "cap")} />
      </span>
      {!page && (
        <h2 data-titre-vue tabIndex={-1} className="relative mb-3 font-serif text-[30px] italic leading-tight outline-none">
          {T.espace.titre}
        </h2>
      )}
      <div className="relative flex items-center gap-3">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white [&_svg]:h-5 [&_svg]:w-5" style={{ background: fondVoie(position.voie) }}>
          <Icone nom={ICONE_VOIE[position.voie]} />
        </span>
        <p className="min-w-0 leading-tight">
          <span className="block text-[12px] font-bold uppercase tracking-[0.12em] text-ink-soft">{T.resultat.voie}</span>
          <span className="block text-[16px] font-medium text-ink">{voie ? voie.nom : T.resultat.tronc}</span>
        </p>
      </div>

      <div className="relative mt-6">
        {choisir ? (
          <>
            <Titre data-titre-vue={page ? "" : undefined} tabIndex={-1} className={titreClasse}>
              {T.resultat.voieAChoisir}
            </Titre>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-ink">{T.resultat.voieAChoisirTexte}</p>
            <button
              type="button"
              onClick={onChoisirVoie}
              className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-(--oj-bouton) px-6 text-[17px] font-semibold text-(--oj-bouton-texte) shadow-[0_14px_28px_-14px_var(--oj-forte)] active:scale-[0.98]"
            >
              {T.resultat.choisirVoie}
              <Icone nom="fleche" className="h-5 w-5" />
            </button>
          </>
        ) : fin ? (
          <>
            <Titre data-titre-vue={page ? "" : undefined} tabIndex={-1} className={titreClasse}>
              {T.resultat.termine}
            </Titre>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-ink">{data.etapes.ikigai.objectif}</p>
          </>
        ) : actuelles.length > 1 ? (
          <>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-(--oj-bouton) px-3 py-1 text-[13px] font-bold text-(--oj-bouton-texte)">
              <Icone nom="pin" className="h-4 w-4" />
              {T.resultat.tuEsIci}
            </p>
            <Titre data-titre-vue={page ? "" : undefined} tabIndex={-1} className={titreClasse}>
              {T.resultat.deuxQuetes}
            </Titre>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {actuelles.map((e) => (
                <div key={e.id} className="flex items-start gap-3 rounded-2xl border border-(--oj-claire) bg-white/90 p-3.5" style={styleBranche(e.branche)}>
                  <Pastille nom={iconeEtape(e.id)} taille="sm" plein />
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-(--oj-texte)">
                      {e.code} · {e.brancheNom}
                    </p>
                    <p className="font-serif text-[20px] italic leading-snug">{e.nom}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-(--oj-bouton) px-3 py-1 text-[13px] font-bold text-(--oj-bouton-texte)">
                <Icone nom="pin" className="h-4 w-4" />
                {T.resultat.tuEsIci}
              </span>
              <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-(--oj-texte)">
                {actuelles[0].code} · {actuelles[0].brancheNom}
              </span>
            </p>
            <Titre data-titre-vue={page ? "" : undefined} tabIndex={-1} className={titreClasse}>
              {actuelles[0].nom}
            </Titre>
            <p className="mt-3 max-w-xl font-serif text-[21px] italic leading-snug text-ink-soft">«&nbsp;{actuelles[0].question}&nbsp;»</p>
          </>
        )}
      </div>

      <dl className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat icone="etoile" label={T.resultat.stats.points}>
          <Compteur valeur={resultat.points.gagnes} />
        </Stat>
        <Stat icone="drapeau" label={T.resultat.stats.etapes}>
          {resultat.franchies.nombre}
          <span className="text-[0.55em] font-medium text-ink-soft">/{resultat.franchies.total}</span>
        </Stat>
        <Stat icone="trophee" label={T.resultat.stats.niveau}>
          {niveau.actuel ? niveau.actuel.code : <span className="text-[0.7em]">{T.resultat.departCourt}</span>}
        </Stat>
      </dl>
    </section>
  );
}

function Delta({ T, avant, resultat }: { T: ParcoursMessages; avant: Resume | null; resultat: ResultatParcours }) {
  if (!avant) return null;
  const points = resultat.points.gagnes - avant.points;
  const etapes = resultat.franchies.nombre - avant.franchies;
  if (points <= 0 && etapes <= 0) return null;
  return (
    <p role="status" className="oj-pop flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl border border-[#F5E1AE] bg-[#FFF5D9] px-4 py-3 text-center text-[16px] text-ink">
      <Icone nom="etincelle" className="h-5 w-5 shrink-0 text-[#B7791F]" />
      <span className="font-semibold">{T.resultat.depuis}</span>
      {points > 0 && <span>{T.resultat.gainPoints(points)}</span>}
      {etapes > 0 && <span>{T.resultat.nouvelles(etapes)}</span>}
    </p>
  );
}

/** Le résultat : en page entière (page publique) ou en panneau (Mon espace). */
export function Resultat({
  data,
  T,
  resultat,
  variante,
  avant,
  onRefaire,
  onEffacer,
  onChoisirVoie,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  resultat: ResultatParcours;
  variante: "page" | "panneau";
  avant: Resume | null;
  onRefaire: () => void;
  onEffacer: () => void;
  onChoisirVoie: () => void;
}) {
  const page = variante === "page";
  const argentCommun = resultat.communes.find((m) => m.etapes.length === 1) ?? null;
  const quetes = resultat.quetes.length > 0 && (
    <section aria-labelledby="quete-titre" className="space-y-3">
      <h3 id="quete-titre" className="flex items-center gap-2 font-serif text-[26px] italic leading-tight sm:text-[28px]">
        <Icone nom="cibleur" className="h-6 w-6 shrink-0 text-accent-strong" />
        {resultat.quetes.length > 1 ? T.resultat.queteDeux : T.resultat.queteTitre}
      </h3>
      {resultat.quetes.map((q) => (
        <QueteDuMoment key={q.etape.id} data={data} T={T} quete={q} compact={!page} />
      ))}
    </section>
  );
  const bonus = (
    <>
      <CarteArgent data={data} T={T} info={resultat.argent} commune={argentCommun} />
      <CarteValeurs T={T} info={resultat.valeurs} />
      <Communes T={T} communes={resultat.communes} />
      <Attention T={T} points={resultat.attention} />
      <PisteParallele data={data} T={T} resultat={resultat} />
    </>
  );
  const pied = (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
      <button
        type="button"
        onClick={onRefaire}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-ink/80 bg-white px-6 text-[16px] font-semibold text-ink transition hover:bg-sand active:scale-[0.98] sm:w-auto"
      >
        <Icone nom="refaire" className="h-5 w-5" />
        {T.resultat.refaire}
      </button>
      {!page && (
        <Link href="/ou-j-en-suis/" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-link underline underline-offset-4">
          {T.espace.detail}
          <Icone nom="fleche" className="h-4 w-4" />
        </Link>
      )}
      <button type="button" onClick={onEffacer} className="min-h-11 px-2 text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink">
        {T.resultat.effacer}
      </button>
    </div>
  );

  if (!page) {
    return (
      <div className="space-y-5">
        <Delta T={T} avant={avant} resultat={resultat} />
        <Ici data={data} T={T} resultat={resultat} page={false} onChoisirVoie={onChoisirVoie} />
        <Frise data={data} T={T} resultat={resultat} taille="petite" />
        <Echelle T={T} niveau={resultat.niveau} compact />
        <Actions data={data} T={T} resultat={resultat} ancreAppel="#appel" />
        {quetes}
        {bonus}
        {pied}
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <Delta T={T} avant={avant} resultat={resultat} />
      <Ici data={data} T={T} resultat={resultat} page onChoisirVoie={onChoisirVoie} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        <div className="space-y-6">
          <Frise data={data} T={T} resultat={resultat} />
          <Echelle T={T} niveau={resultat.niveau} />
        </div>
        <div className="space-y-6" style={{ "--i": 2 } as CSSProperties}>
          <Actions data={data} T={T} resultat={resultat} ancreAppel="#avancer" />
          {quetes}
          {bonus}
        </div>
      </div>
      <Avancer T={T} offres={resultat.offres} />
      {pied}
    </div>
  );
}
