import type { CSSProperties } from "react";
import { cx } from "@/components/ui";
import { etapesSoi } from "@/domain/parcours/position";
import type { Profil } from "@/domain/parcours/profil";
import type { ParcoursPublic } from "@/domain/parcours/types";
import { Icone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { Pastille } from "./Habillage";
import { iconeEtape, NOTES_ARGENT, styleBranche } from "./theme";

function Retour({ T, onRetour }: { T: ParcoursMessages; onRetour: () => void }) {
  return (
    <button type="button" onClick={onRetour} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] text-ink-soft hover:bg-sand hover:text-ink">
      <Icone nom="fleche" className="h-4 w-4 rotate-180" />
      {T.quete.retour}
    </button>
  );
}

/** 2) Autodiagnostic argent, de 1 à 5 (voies A à E). */
export function EcranArgent({
  data,
  T,
  profil,
  onNote,
  onContinuer,
  onRetour,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  profil: Profil;
  onNote: (n: number) => void;
  onContinuer: () => void;
  onRetour: () => void;
}) {
  const notes = Array.from({ length: data.argent.max - data.argent.min + 1 }, (_, i) => data.argent.min + i);
  return (
    <section aria-labelledby="question-argent" className="mx-auto max-w-2xl text-center" style={styleBranche("module")}>
      <div className="text-left">
        <Retour T={T} onRetour={onRetour} />
      </div>
      <div className="rounded-[30px] border border-(--oj-claire) bg-[linear-gradient(180deg,var(--oj-fond),#FFFFFF_70%)] px-5 py-8 sm:px-10">
        <Pastille nom="pieces" taille="lg" plein className="oj-pop mx-auto" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-(--oj-texte)">{T.argent.surtitre}</p>
        <h2 id="question-argent" data-titre-vue tabIndex={-1} className="mt-2 font-serif text-[26px] italic leading-snug outline-none sm:text-[32px]">
          {data.argent.question}
        </h2>
        <div role="radiogroup" aria-labelledby="question-argent" className="mx-auto mt-7 flex max-w-sm justify-between gap-2">
          {notes.map((n, i) => {
            const coche = profil.argent === n;
            const couleur = NOTES_ARGENT[i] ?? NOTES_ARGENT[NOTES_ARGENT.length - 1];
            return (
              <label key={n} className="relative">
                <input type="radio" name="argent" value={n} checked={coche} onChange={() => onNote(n)} className="peer sr-only" />
                <span
                  className={cx(
                    "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 text-[22px] font-semibold transition duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 sm:h-16 sm:w-16",
                    coche ? "scale-110 shadow-lg" : "bg-white shadow-[0_3px_0_0_rgba(58,47,36,0.16)] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none",
                  )}
                  style={coche ? { background: couleur.fond, borderColor: couleur.fond, color: couleur.texte } : { borderColor: couleur.fond, color: "#3A2F24" }}
                >
                  {n}
                  <span className="sr-only"> {T.argent.note(n)}</span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="mx-auto mt-2 flex max-w-sm justify-between gap-4 text-[14px] text-ink-soft">
          <span className="text-left">{T.argent.min}</span>
          <span className="text-right">{T.argent.max}</span>
        </div>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">{T.argent.aide}</p>
        <button
          type="button"
          onClick={onContinuer}
          disabled={profil.argent === null}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-(--oj-bouton) px-8 text-[17px] font-medium text-(--oj-bouton-texte) transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          {T.voie.continuer}
          <Icone nom="fleche" className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/** 3) « Tu veux aussi travailler ta connaissance de toi en parallèle ? » : un clic, et on avance. */
export function EcranParallele({
  data,
  T,
  profil,
  onChoix,
  onRetour,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  profil: Profil;
  onChoix: (oui: boolean) => void;
  onRetour: () => void;
}) {
  const etapes = etapesSoi(data).map((id) => data.etapes[id]);
  const bouton = "flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 px-5 text-[17px] font-medium transition duration-200 hover:-translate-y-0.5 active:scale-[0.98]";
  return (
    <section aria-labelledby="question-parallele" className="mx-auto max-w-2xl text-center" style={styleBranche("soi")}>
      <div className="text-left">
        <Retour T={T} onRetour={onRetour} />
      </div>
      <div className="rounded-[30px] border border-(--oj-claire) bg-[linear-gradient(180deg,var(--oj-fond),#FFFFFF_70%)] px-5 py-8 sm:px-10">
        <Pastille nom="coeur" taille="lg" plein className="oj-pop mx-auto" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-(--oj-texte)">{T.parallele.surtitre}</p>
        <h2 id="question-parallele" data-titre-vue tabIndex={-1} className="mt-2 font-serif text-[28px] italic leading-snug outline-none sm:text-[34px]">
          {T.parallele.titre}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-ink-soft">{data.voies.K.description}</p>
        <ol className="mx-auto mt-5 grid max-w-md gap-x-6 gap-y-2 text-left sm:grid-cols-2">
          {etapes.map((e, i) => (
            <li key={e.id} className="oj-apparait flex items-start gap-2 text-[15px] leading-snug text-ink" style={{ "--i": i } as CSSProperties}>
              <Icone nom={iconeEtape(e.id)} className="mt-0.5 h-5 w-5 shrink-0 text-(--oj-texte)" />
              <span>
                <span className="font-semibold text-(--oj-texte)">{e.code}</span> {e.nom}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onChoix(true)}
            aria-pressed={profil.parallele === true}
            className={cx(bouton, profil.parallele === true ? "border-(--oj-bouton) bg-(--oj-bouton) text-white" : "border-(--oj-claire) bg-white text-ink")}
          >
            <Icone nom="coeur" className="h-5 w-5" />
            {T.parallele.oui}
          </button>
          <button
            type="button"
            onClick={() => onChoix(false)}
            aria-pressed={profil.parallele === false}
            className={cx(bouton, profil.parallele === false ? "border-ink bg-ink text-white" : "border-line bg-white text-ink")}
          >
            {T.parallele.non}
            <Icone nom="fleche" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
