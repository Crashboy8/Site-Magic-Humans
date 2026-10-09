import { useState, type CSSProperties } from "react";
import { cx } from "@/components/ui";
import { basculer, cochesDeLaVoie, freelanceCherchePoste, voieDesCoches } from "@/domain/parcours/choix";
import { raccourciPossible } from "@/domain/parcours/position";
import type { Profil } from "@/domain/parcours/profil";
import type { ChoixVoie, ParcoursPublic } from "@/domain/parcours/types";
import { Icone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { DecorParcours } from "./Habillage";
import { BRANCHE_DE_LA_VOIE, fondVoie, ICONE_VOIE, styleBranche, TEINTES } from "./theme";

const COULEURS_ETAPES = [TEINTES.tronc, TEINTES.entrepreneur, TEINTES.aboutissement];

/** L'accueil de la page publique : la promesse, le chemin, et comment ça marche. */
export function Accueil({ data, T, connecte }: { data: ParcoursPublic; T: ParcoursMessages; connecte: boolean }) {
  const puces = connecte ? T.accueil.pucesConnecte : T.accueil.puces;
  return (
    <header className="oj-ciel relative overflow-hidden rounded-[32px] border border-line px-5 pb-8 pt-9 text-center shadow-[0_24px_60px_-40px_rgba(58,47,36,0.45)] sm:px-10 sm:pb-10 sm:pt-12">
      <p className="oj-apparait font-script text-[26px] leading-none text-accent-deep sm:text-[30px]">{T.accueil.surtitre}</p>
      <h1 data-titre-vue tabIndex={-1} className="oj-apparait mt-2 font-serif text-[48px] italic leading-[0.95] outline-none sm:text-[72px]" style={{ "--i": 1 } as CSSProperties}>
        {T.accueil.titre}
      </h1>
      <p className="oj-apparait mx-auto mt-4 max-w-xl font-serif text-[21px] italic leading-snug text-ink-soft sm:text-[24px]" style={{ "--i": 2 } as CSSProperties}>
        «&nbsp;{data.promesse}&nbsp;»
      </p>
      <DecorParcours className="oj-flotte mx-auto mt-5 w-full max-w-lg" />
      <p className="oj-apparait mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-ink" style={{ "--i": 3 } as CSSProperties}>
        {T.accueil.intro}
      </p>
      <p className="oj-apparait mx-auto mt-2 max-w-xl text-[17px] leading-relaxed text-ink" style={{ "--i": 4 } as CSSProperties}>
        {T.accueil.jeu}
      </p>
      <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {puces.map((p) => (
          <li key={p} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink">
            <Icone nom="coche" className="h-5 w-5 shrink-0 text-sage" />
            {p}
          </li>
        ))}
      </ul>
      <h2 className="sr-only">{T.accueil.commentTitre}</h2>
      <ol className="mx-auto mt-7 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
        {T.accueil.comment.map((etape, i) => (
          <li
            key={etape.titre}
            className="oj-apparait flex items-start gap-3 border-l-4 py-0.5 pl-3"
            style={{ "--i": 5 + i, borderColor: COULEURS_ETAPES[i].forte } as CSSProperties}
          >
            <span aria-hidden="true" className="w-5 shrink-0 text-center font-serif text-[34px] italic leading-[0.9]" style={{ color: COULEURS_ETAPES[i].texte }}>
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-medium leading-snug text-ink">{etape.titre}</span>
              <span className="mt-0.5 block text-[15px] leading-snug text-ink-soft">{etape.texte}</span>
            </span>
          </li>
        ))}
      </ol>
    </header>
  );
}

/** 1) « Quelle est ta situation, ton projet ? » : les 7 choix de question_voie. */
export function EcranVoie({
  data,
  T,
  profil,
  accueil,
  connecte,
  ficheDeposee,
  reposer,
  onVoie,
  onRaccourci,
  onContinuer,
  onRetour,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  profil: Profil;
  /** Page publique, avant toute réponse : l'accueil s'affiche au-dessus. */
  accueil: boolean;
  connecte: boolean;
  ficheDeposee: boolean;
  /** « Je ne sais pas encore » et tronc commun franchi : on repose la question. */
  reposer: boolean;
  /** freelance : « entrepreneur » et « redevenir salarié » cochés ensemble (voie E, sans contrat de travail à vérifier). */
  onVoie: (voie: ChoixVoie | null, freelance: boolean) => void;
  onRaccourci: (oui: boolean) => void;
  onContinuer: () => void;
  onRetour: (() => void) | null;
}) {
  const choisie = profil.voie;
  // Les cases cochées : une, ou deux quand on mène deux projets (un côté entrepreneur, un côté salarié) : cela donne la voie E.
  const [coches, setCoches] = useState<ChoixVoie[]>(() => cochesDeLaVoie(profil.voie, profil.freelance));
  const cocher = (voie: ChoixVoie) => {
    const suite = basculer(coches, voie);
    setCoches(suite);
    onVoie(voieDesCoches(suite), freelanceCherchePoste(suite));
  };
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {accueil && <Accueil data={data} T={T} connecte={connecte} />}
      {reposer && (
        <p role="status" className="oj-pop flex items-center justify-center gap-2 rounded-2xl border border-[#F5E1AE] bg-[#FFF5D9] px-4 py-3 text-center text-[17px] text-ink">
          <Icone nom="etincelle" className="h-5 w-5 shrink-0 text-[#7A5200]" />
          <span>
            <strong className="font-semibold">{T.voie.reposerTitre}</strong> {T.voie.reposerTexte}
          </span>
        </p>
      )}
      <section aria-labelledby="question-voie" className="mx-auto max-w-3xl">
        {onRetour && (
          <button type="button" onClick={onRetour} className="mb-3 inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] text-ink-soft hover:bg-sand hover:text-ink">
            <Icone nom="fleche" className="h-4 w-4 rotate-180" />
            {T.quete.retour}
          </button>
        )}
        <h2
          id="question-voie"
          data-titre-vue={accueil ? undefined : ""}
          tabIndex={-1}
          className="text-center font-serif text-[30px] italic leading-tight outline-none sm:text-[40px]"
        >
          {data.questionVoie.texte}
        </h2>
        <p className="mt-2 text-center text-[16px] text-ink-soft">{T.voie.aide}</p>
        <p id="aide-deux" className="mx-auto mt-2 flex max-w-xl items-start justify-center gap-2 text-center text-[16px] leading-snug text-ink">
          <Icone nom="bifurcation" className="mt-0.5 h-5 w-5 shrink-0 text-[#155F8C]" />
          <span>{T.voie.aideDeux}</span>
        </p>
        <div role="group" aria-labelledby="question-voie" aria-describedby="aide-deux" className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.questionVoie.choix.map((c, i) => {
            const coche = coches.includes(c.voie);
            const description = c.voie === "inconnue" ? null : data.voies[c.voie].description;
            return (
              <label
                key={c.voie}
                className={cx(
                  "oj-apparait group relative flex cursor-pointer items-start gap-3.5 rounded-[20px] border-2 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(58,47,36,0.45)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-(--oj-forte) has-[:focus-visible]:ring-offset-2",
                  coche ? "border-(--oj-forte) bg-(--oj-fond) shadow-[0_14px_30px_-18px_var(--oj-forte)]" : "border-line",
                  c.voie === "inconnue" && "sm:col-span-2",
                )}
                style={{ ...styleBranche(BRANCHE_DE_LA_VOIE[c.voie]), "--i": i } as CSSProperties}
              >
                <input type="checkbox" name="voie" value={c.voie} checked={coche} onChange={() => cocher(c.voie)} className="sr-only" />
                <span
                  className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300", coche && "scale-110 rotate-[-6deg]")}
                  style={{ background: fondVoie(c.voie) }}
                  aria-hidden="true"
                >
                  <Icone nom={ICONE_VOIE[c.voie]} className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-medium leading-snug text-ink">{c.libelle}</span>
                  {description && <span className="mt-1 block text-[15px] leading-snug text-ink-soft">{description}</span>}
                </span>
                <span
                  aria-hidden="true"
                  className={cx(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition",
                    coche ? "border-(--oj-bouton) bg-(--oj-bouton) text-(--oj-bouton-texte)" : "border-ink/25 bg-white",
                  )}
                >
                  {coche && <Icone nom="coche" className="h-4 w-4" />}
                </span>
              </label>
            );
          })}
        </div>
        {coches.length === 2 && (
          <div role="status" className="oj-pop mt-4 flex items-start gap-3 rounded-2xl border border-[#C6E6F8] bg-[linear-gradient(135deg,#E5F6F3_0%,#EEF8FE_100%)] p-4">
            <Icone nom="bifurcation" className="mt-0.5 h-6 w-6 shrink-0 text-[#155F8C]" />
            <span className="min-w-0">
              <span className="block font-semibold leading-snug text-ink">{T.voie.deuxTitre}</span>
              <span className="mt-0.5 block text-[15px] leading-snug text-ink-soft">{T.voie.deuxTexte}</span>
            </span>
          </div>
        )}
        {choisie !== null && raccourciPossible(data, choisie) && (
          <label className="oj-apparait mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#F5E1AE] bg-[#FFF9EA] p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#B8441F]">
            <input type="checkbox" checked={profil.raccourci} onChange={(e) => onRaccourci(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#B8441F]" />
            <span className="min-w-0">
              <span className="block font-medium leading-snug text-ink">{T.voie.raccourci}</span>
              <span className="mt-0.5 block text-[15px] leading-snug text-ink-soft">{ficheDeposee ? T.voie.raccourciFiche : T.voie.raccourciAide}</span>
            </span>
          </label>
        )}
        <div className="mt-7 flex justify-center">
          <button
            type="button"
            onClick={onContinuer}
            disabled={choisie === null}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-strong px-8 text-[17px] font-medium text-white shadow-[0_12px_28px_-14px_rgba(179,71,22,0.9)] transition hover:bg-accent-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none sm:w-auto"
          >
            {T.voie.continuer}
            <Icone nom="fleche" className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
