import { useState, type CSSProperties } from "react";
import { cx } from "@/components/ui";
import { bilanEtape, questionsEcran, type Ecran, type Question } from "@/domain/parcours/position";
import type { Profil } from "@/domain/parcours/profil";
import { REPONSES, type ParcoursPublic, type Reponse } from "@/domain/parcours/types";
import type { StatutCompte } from "@/features/espace/barre";
import { Icone, type NomIcone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { CarteCompte } from "./Compte";
import { Barre, Compteur, Confettis, Info, Pastille, Rayons } from "./Habillage";
import { iconeEtape, styleBranche, TEINTES } from "./theme";

const REPONSE: Record<Reponse, { actif: string; icone: NomIcone }> = {
  oui: { actif: "border-[#1A7A6D] bg-[#1A7A6D] text-white", icone: "coche" },
  en_partie: { actif: "border-[#F2C14E] bg-[#F2C14E] text-ink", icone: "demi" },
  pas_encore: { actif: "border-[#5C4632] bg-[#5C4632] text-white", icone: "horloge" },
};

/** La barre du haut : retour, progression, points. */
export function Hud({ T, pourcent, points, onRetour }: { T: ParcoursMessages; pourcent: number; points: number; onRetour: () => void }) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-line/60 bg-(--oj-page)/90 px-4 py-2 backdrop-blur-md sm:top-3 sm:mx-0 sm:rounded-2xl sm:border sm:bg-white/90 sm:px-2 sm:py-1.5 sm:shadow-[0_10px_30px_-22px_rgba(58,47,36,0.6)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRetour}
          aria-label={T.quete.retour}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-sand hover:text-ink"
        >
          <Icone nom="fleche" className="h-5 w-5 rotate-180" />
        </button>
        <Barre pourcent={pourcent} label={T.quete.progression} className="flex-1" />
        <span className="inline-flex shrink-0 items-center gap-1 pr-1 text-[18px] font-bold text-[#7A5200]">
          <Icone nom="etoile" className="h-5 w-5" />
          <Compteur valeur={points} depart={points} />
          <span className="sr-only">{T.quete.points(points)}</span>
        </span>
      </div>
    </div>
  );
}

/** 4) Une étape par écran (deux en voie E pour Le terrain et Le réseau), avec ses questions dans l'ordre. */
export function EcranQuete({
  data,
  T,
  profil,
  ecran,
  numero,
  total,
  points,
  onRepondre,
  onValider,
  onRetour,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  profil: Profil;
  ecran: Ecran;
  numero: number;
  total: number;
  points: number;
  onRepondre: (criteres: string[], reponse: Reponse) => void;
  onValider: () => void;
  onRetour: () => void;
}) {
  const questions = questionsEcran(data, ecran);
  const etapes = ecran.etapes.map((id) => data.etapes[id]);
  const principale = etapes[0];
  const reponseDe = (q: Question) => profil.reponses[q.criteres[0].id] ?? null;
  const repondues = questions.filter((q) => reponseDe(q) !== null).length;
  const restent = questions.length - repondues;
  const pourcent = total > 0 ? ((numero - 1 + repondues / Math.max(1, questions.length)) / total) * 100 : 0;
  const [envol, setEnvol] = useState<{ cle: string; reponse: Reponse; n: number } | null>(null);

  const choisir = (q: Question, r: Reponse) => {
    onRepondre(
      q.criteres.map((c) => c.id),
      r,
    );
    setEnvol((e) => ({ cle: q.cle, reponse: r, n: (e?.n ?? 0) + 1 }));
  };

  return (
    <div className="mx-auto max-w-2xl" style={styleBranche(principale.branche)}>
      <Hud T={T} pourcent={pourcent} points={points} onRetour={onRetour} />

      <header className="oj-apparait relative overflow-hidden rounded-[28px] border border-(--oj-claire) bg-[linear-gradient(140deg,var(--oj-fond)_0%,#FFFFFF_85%)] p-5 sm:p-7">
        <span className="pointer-events-none absolute -right-8 -top-8 text-(--oj-forte) opacity-[0.08] [&_svg]:h-44 [&_svg]:w-44">
          <Icone nom={iconeEtape(principale.id)} />
        </span>
        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1">
          <Info icone="drapeau" className="text-[13px] font-bold uppercase tracking-[0.12em] text-(--oj-texte)">
            {T.quete.surtitre(numero, total)}
          </Info>
          {ecran.piste === "parallele" && (
            <Info icone="coeur" className="text-[13px]" >
              <span style={{ color: TEINTES.soi.texte }}>{T.quete.parallele}</span>
            </Info>
          )}
          {ecran.paire && (
            <Info icone="bifurcation" className="text-[13px] text-ink-soft">
              {T.quete.deuxBranches}
            </Info>
          )}
        </div>
        {ecran.paire ? (
          <>
            <h2 data-titre-vue tabIndex={-1} className="relative mt-4 font-serif text-[30px] italic leading-tight outline-none sm:text-[36px]">
              {ecran.paire.nom}
            </h2>
            <p className="relative mt-2 text-[16px] leading-relaxed text-ink">{ecran.paire.texte}</p>
            <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
              {etapes.map((e) => (
                <div key={e.id} className="flex items-start gap-3 border-l-4 border-(--oj-forte) pl-3" style={styleBranche(e.branche)}>
                  <Pastille nom={iconeEtape(e.id)} taille="sm" plein />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-(--oj-texte)">
                      {e.code} · {e.brancheNom}
                    </p>
                    <p className="font-serif text-[18px] italic leading-snug">{e.nom}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="relative mt-4 flex items-start gap-4">
              <Pastille nom={iconeEtape(principale.id)} taille="lg" plein className="oj-pop" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-(--oj-texte)">
                  {principale.code} · {principale.brancheNom}
                </p>
                <h2 data-titre-vue tabIndex={-1} className="font-serif text-[28px] italic leading-tight outline-none sm:text-[34px]">
                  {principale.nom}
                </h2>
              </div>
            </div>
            <p className="relative mt-4 font-serif text-[21px] italic leading-snug text-ink">«&nbsp;{principale.question}&nbsp;»</p>
            <p className="relative mt-2 text-[16px] leading-relaxed text-ink-soft">{principale.objectif}</p>
          </>
        )}
      </header>

      <ol className="mt-5 space-y-3">
        {questions.map((q, i) => {
          const valeur = reponseDe(q);
          return (
            <li
              key={q.cle}
              className={cx(
                "oj-apparait rounded-[22px] border bg-white p-4 transition duration-300 sm:p-5",
                valeur ? "border-(--oj-claire) shadow-[0_12px_26px_-22px_var(--oj-forte)]" : "border-line",
              )}
              style={{ "--i": i + 1 } as CSSProperties}
            >
              <fieldset>
                <legend className="w-full">
                  <span aria-hidden="true" className={cx("flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em]", valeur ? "text-[#1A7A6D]" : "text-(--oj-texte)")}>
                    {valeur && <Icone nom="coche" className="h-4 w-4" />}
                    {T.quete.question(i + 1, questions.length)}
                  </span>
                  <span className="mt-1 block text-[18px] leading-snug text-ink">
                    {q.texte}
                    <span className="sr-only">, {T.quete.question(i + 1, questions.length)}</span>
                  </span>
                </legend>
                {ecran.etapes.length > 1 && (
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {q.criteres.map((c) => {
                      const e = data.etapes[c.etape];
                      return (
                        <span key={c.id} className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: TEINTES[e.branche].texte }}>
                          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px]" style={{ background: TEINTES[e.branche].forte }} />
                          {e.code} · {e.brancheNom}
                        </span>
                      );
                    })}
                  </p>
                )}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {REPONSES.map((r) => {
                    const coche = valeur === r;
                    return (
                      <label key={r} className="relative">
                        <input type="radio" name={q.cle} value={r} checked={coche} onChange={() => choisir(q, r)} className="peer sr-only" />
                        <span
                          className={cx(
                            "flex min-h-[54px] cursor-pointer select-none flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 py-2 text-center text-[14px] font-medium leading-tight transition duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-(--oj-forte) peer-focus-visible:ring-offset-2 sm:flex-row sm:gap-1.5 sm:text-[15px]",
                            coche
                              ? cx(REPONSE[r].actif, "scale-[1.03] shadow-md")
                              : "border-ink/25 bg-white text-ink shadow-[0_3px_0_0_rgba(58,47,36,0.16)] hover:border-ink/45 active:translate-y-[2px] active:shadow-none",
                          )}
                        >
                          <Icone nom={REPONSE[r].icone} className="h-5 w-5 shrink-0" />
                          {T.quete.reponses[r]}
                        </span>
                        {envol && envol.cle === q.cle && envol.reponse === r && data.points[r] > 0 && (
                          <span key={envol.n} aria-hidden="true" className="oj-gain text-[17px] font-extrabold text-[#7A5200] [text-shadow:0_1px_0_#fff,0_0_6px_#fff]">
                            +{data.points[r]}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-0 z-20 -mx-4 mt-4 bg-[linear-gradient(to_top,var(--oj-page)_65%,transparent)] px-4 pb-4 pt-8 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={onValider}
          disabled={restent > 0}
          className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-(--oj-bouton) px-6 text-[17px] font-semibold text-(--oj-bouton-texte) shadow-[0_16px_32px_-16px_var(--oj-forte)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-soft disabled:shadow-none"
        >
          {restent > 0 ? (
            T.quete.restent(restent)
          ) : (
            <>
              <Icone nom="drapeau" className="h-5 w-5" />
              {T.quete.valider}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/** Une étape franchie : médaille, confettis, points gagnés, et le niveau quand l'étape en fait atteindre un. */
export function EcranFete({
  data,
  T,
  etapes: ids,
  gain,
  total,
  derniere,
  statut,
  onSuivant,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  etapes: string[];
  gain: number;
  total: number;
  derniere: boolean;
  statut: StatutCompte;
  onSuivant: () => void;
}) {
  const etapes = ids.map((id) => data.etapes[id]);
  const premiere = etapes[0];
  const niveaux = etapes.flatMap((e) => {
    const n = e.niveau.effet === "atteint" ? data.niveaux.find((x) => x.code === e.niveau.codes[0]) : undefined;
    return n ? [n] : [];
  });
  return (
    <section
      aria-labelledby="fete-titre"
      className="relative mx-auto max-w-xl overflow-hidden rounded-[32px] border border-(--oj-claire) bg-[radial-gradient(120%_80%_at_50%_0%,var(--oj-fond)_0%,#FFFFFF_68%)] px-6 pb-9 pt-10 text-center shadow-[0_30px_70px_-40px_rgba(58,47,36,0.55)]"
      style={styleBranche(premiere.branche)}
    >
      <Confettis />
      <div className="relative mx-auto h-36 w-36">
        <Rayons className="oj-tourne absolute inset-0 h-full w-full" couleur="var(--oj-claire)" />
        <span className="oj-pop absolute inset-5 flex items-center justify-center rounded-full bg-(--oj-forte) text-white shadow-[0_18px_40px_-14px_var(--oj-forte)] ring-[10px] ring-white">
          <Icone nom={iconeEtape(premiere.id)} className="h-12 w-12" />
        </span>
        <span className="oj-pop absolute right-1 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2C14E] text-ink shadow" style={{ "--d": "350ms" } as CSSProperties}>
          <Icone nom="etincelle" className="h-5 w-5" />
        </span>
      </div>
      <p className="oj-apparait mt-6 font-script text-[46px] leading-none text-(--oj-texte)">{ids.length > 1 ? T.fete.titreDeux : T.fete.titre}</p>
      <p className="mt-3 text-[16px] text-ink-soft">{T.fete.franchie}</p>
      <h2 id="fete-titre" data-titre-vue tabIndex={-1} className="mt-1 font-serif text-[26px] italic leading-tight outline-none sm:text-[30px]">
        {etapes.map((e) => (
          <span key={e.id} className="block">
            <span className="font-sans text-[0.72em] font-semibold not-italic text-(--oj-texte)">{e.code}</span> · {e.nom}
          </span>
        ))}
      </h2>
      <p className="oj-pop mt-5 inline-flex items-center gap-2 text-[28px] font-bold text-[#7A5200]" style={{ "--d": "250ms" } as CSSProperties}>
        <Icone nom="etoile" className="h-7 w-7" />
        {T.fete.gain(gain)}
      </p>
      <p className="mt-2 text-[15px] text-ink-soft">{T.fete.total(total)}</p>
      {niveaux.map((n) => (
        <div
          key={n.code}
          className="oj-pop mx-auto mt-5 max-w-sm rounded-2xl border border-[#F5E1AE] bg-[linear-gradient(135deg,#FFF5D9,#FFFFFF)] p-4"
          style={{ "--d": "500ms" } as CSSProperties}
        >
          <p className="flex items-center justify-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-[#7A5200]">
            <Icone nom="trophee" className="h-4 w-4" />
            {T.fete.niveau}
          </p>
          <p className="mt-1 font-serif text-[24px] italic leading-tight">{n.titre}</p>
          <p className="mt-0.5 text-[15px] text-ink-soft">{n.sousTitre}</p>
        </div>
      ))}
      <div>
        <button
          type="button"
          onClick={onSuivant}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-(--oj-bouton) px-8 text-[17px] font-semibold text-(--oj-bouton-texte) shadow-[0_16px_32px_-16px_var(--oj-forte)] transition active:scale-[0.98] sm:w-auto"
        >
          {derniere ? T.fete.resultat : T.fete.suivante}
          <Icone nom="fleche" className="h-5 w-5" />
        </button>
      </div>
      <CarteCompte T={T} statut={statut} compte={null} compact />
    </section>
  );
}

/** Points gagnés sur un écran : la somme de ses étapes. */
export function pointsEcran(data: ParcoursPublic, ecran: Ecran, reponses: Profil["reponses"]): number {
  return ecran.etapes.reduce((t, id) => t + bilanEtape(data, data.etapes[id], reponses).points, 0);
}
