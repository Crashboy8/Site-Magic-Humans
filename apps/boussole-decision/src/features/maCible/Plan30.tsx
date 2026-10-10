"use client";

import { useMemo, useState } from "react";
import { Card, cx } from "@/components/ui";
import {
  ajouterAction,
  ajouterTitre,
  basculerFait,
  changerTexte,
  deplacerBloc,
  enTexteBrut,
  planDepuisResultat,
  supprimerBloc,
  type Bloc,
  type PlanEdite,
} from "@/domain/maCible/planEdite";
import type { Resultat } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { EditeurPlan } from "./EditeurPlan";
import { CLASSE_CARTE, TitreIcone } from "./Habillage";
import { Icone, type NomIcone } from "./Icones";
import { TexteMarkdown } from "./TexteMarkdown";

interface Section {
  titre: Extract<Bloc, { type: "titre" }> | null;
  actions: Extract<Bloc, { type: "action" }>[];
}

function sections(blocs: Bloc[]): Section[] {
  const liste: Section[] = [];
  for (const b of blocs) {
    if (b.type === "titre") liste.push({ titre: b, actions: [] });
    else {
      if (liste.length === 0) liste.push({ titre: null, actions: [] });
      liste[liste.length - 1].actions.push(b);
    }
  }
  return liste;
}

const extrait = (b: Bloc, vide: string) => {
  const brut = enTexteBrut(b.texte).replace(/\s+/g, " ").trim();
  return brut ? (brut.length > 40 ? `${brut.slice(0, 40)}…` : brut) : vide;
};

const BOUTON_ICONE =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-sand hover:text-ink focus-visible:ring-2 focus-visible:ring-accent-strong/40 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

export function Plan30({
  resultat,
  coches,
  onCoche,
  plan,
  resultatLe,
  onPlan,
  onPlanOrigine,
  M,
  lecture = false,
  action,
}: {
  resultat: Resultat;
  coches: boolean[];
  onCoche: (index: number) => void;
  /** Plan modifié par la personne, ou `null` : la proposition de l'IA. */
  plan: PlanEdite | null;
  resultatLe: string | null;
  onPlan: (plan: PlanEdite) => void;
  onPlanOrigine: () => void;
  M: MaCibleMessages;
  lecture?: boolean;
  /** Icône « Copier », sur la ligne du titre. */
  action?: React.ReactNode;
}) {
  const P = M.plan;
  const [edition, setEdition] = useState<{ id: string; nouveau: boolean } | null>(null);
  const [annonce, setAnnonce] = useState("");

  const courant = useMemo(
    () => plan ?? planDepuisResultat(resultat, coches, { titreSemaine: (n, t) => `${P.semaine(n)}${M.commun.dp}${t}` }, resultatLe, new Date(0)),
    [plan, resultat, coches, P, M.commun.dp, resultatLe],
  );
  const parties = useMemo(() => sections(courant.blocs), [courant]);
  const actions = courant.blocs.filter((b): b is Extract<Bloc, { type: "action" }> => b.type === "action");
  const total = actions.length;
  const faites = actions.filter((a) => a.fait).length;
  const nomCible = (id: string) => resultat.cibles.find((c) => c.id === id)?.nom ?? P.cibleToutes;

  const maintenant = () => new Date();
  const modifier = (suivant: PlanEdite, message: string) => {
    onPlan(suivant);
    setAnnonce(message);
  };

  function basculer(b: Extract<Bloc, { type: "action" }>) {
    if (plan === null && b.origine !== null) onCoche(b.origine);
    else onPlan(basculerFait(courant, b.id, maintenant()));
  }
  function valider(b: Bloc, texte: string) {
    const vide = texte.trim() === "";
    if (vide && edition?.nouveau) modifier(supprimerBloc(courant, b.id, maintenant()), P.annonce.supprime);
    else if (texte !== b.texte) modifier(changerTexte(courant, b.id, texte, maintenant()), P.annonce.modifie);
    setEdition(null);
  }
  function annuler(b: Bloc) {
    if (edition?.nouveau && b.texte.trim() === "") modifier(supprimerBloc(courant, b.id, maintenant()), P.annonce.supprime);
    setEdition(null);
  }
  function supprimer(b: Bloc) {
    if (!window.confirm(b.type === "titre" ? P.confirmSupprimerTitre : P.confirmSupprimerAction)) return;
    modifier(supprimerBloc(courant, b.id, maintenant()), P.annonce.supprime);
  }
  function deplacer(b: Bloc, sens: -1 | 1) {
    modifier(deplacerBloc(courant, b.id, sens, maintenant()), P.annonce.deplace);
    // Le focus suit le bouton pressé (ou son opposé quand le bloc arrive en bout de liste), une fois l'écran à jour.
    const voulu = sens === -1 ? "haut" : "bas";
    requestAnimationFrame(() => {
      const bouton = (cle: string) => document.querySelector<HTMLButtonElement>(`[data-plan-bouton="${b.id}|${cle}"]:not(:disabled)`);
      (bouton(voulu) ?? bouton(voulu === "haut" ? "bas" : "haut"))?.focus();
    });
  }
  function ajouter(apresId: string | null) {
    const r = ajouterAction(courant, apresId, maintenant());
    if (!r) return setAnnonce(P.annonce.plein);
    onPlan(r.plan);
    setEdition({ id: r.id, nouveau: true });
    setAnnonce(P.annonce.ajoute);
  }
  function ajouterSection() {
    const r = ajouterTitre(courant, maintenant());
    if (!r) return setAnnonce(P.annonce.plein);
    onPlan(r.plan);
    setEdition({ id: r.id, nouveau: true });
    setAnnonce(P.annonce.ajoute);
  }
  function revenir() {
    if (!window.confirm(P.confirmRevenir)) return;
    setEdition(null);
    onPlanOrigine();
    setAnnonce(P.annonce.revenu);
  }

  const index = (id: string) => courant.blocs.findIndex((b) => b.id === id);
  const commandes = (b: Bloc) => {
    const i = index(b.id);
    const nom = extrait(b, P.vide);
    const bouton = (icone: NomIcone, libelle: string, onClick: () => void, extra?: { disabled?: boolean; cle?: string; danger?: boolean }) => (
      <button
        type="button"
        className={cx(BOUTON_ICONE, extra?.danger && "hover:bg-danger-soft hover:text-danger")}
        aria-label={libelle}
        title={libelle}
        disabled={extra?.disabled}
        data-plan-bouton={extra?.cle ? `${b.id}|${extra.cle}` : undefined}
        onClick={onClick}
      >
        <Icone nom={icone} className="size-[18px] shrink-0" />
      </button>
    );
    return (
      <div data-ecran-seul className="flex flex-wrap items-center">
        {bouton("crayon", P.modifier(nom), () => setEdition({ id: b.id, nouveau: false }))}
        {bouton("haut", P.monter(nom), () => deplacer(b, -1), { disabled: i <= 0, cle: "haut" })}
        {bouton("bas", P.descendre(nom), () => deplacer(b, 1), { disabled: i >= courant.blocs.length - 1, cle: "bas" })}
        {bouton("poubelle", P.supprimer(nom), () => supprimer(b), { danger: true })}
      </div>
    );
  };

  const boutonTexte =
    "inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/25 bg-paper px-4 py-2 text-[15px] font-medium text-ink hover:border-ink/50 hover:bg-sand";

  return (
    <Card className={`${CLASSE_CARTE} space-y-5 rounded-2xl border-l-4 border-l-sage p-6 sm:p-8`}>
      <section id="plan" data-ancre aria-labelledby="plan-titre" className="scroll-mt-20 space-y-5">
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sage-soft to-transparent pr-1">
          <TitreIcone as="h2" id="plan-titre" icone="calendrier" teinte="sage" className="min-w-0 flex-1 px-3 py-2 text-[26px] italic">
            {P.titre}
          </TitreIcone>
          {action}
        </div>
        <p className="text-[17px] font-semibold text-ink">{P.consigne}</p>
        <div className="space-y-1.5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-soft" aria-live="polite">
            <span>{P.progression(faites, total)}</span>
            {plan && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-2.5 py-0.5 text-sm font-medium text-sage">
                <Icone nom="crayon" className="size-3.5 shrink-0" />
                {P.modifieTag}
              </span>
            )}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-sand" aria-hidden="true">
            <div className="h-full rounded-full bg-sage" style={{ width: `${total ? (faites / total) * 100 : 0}%` }} />
          </div>
          {total > 0 && faites === total && <p className="text-[16px] font-medium text-ink">{P.fini}</p>}
        </div>
        <p className="sr-only" role="status">
          {annonce}
        </p>

        {parties.map((s, si) => {
          const idTitre = s.titre ? `plan-section-${s.titre.id}` : undefined;
          const dernier = s.actions.length > 0 ? s.actions[s.actions.length - 1].id : (s.titre?.id ?? null);
          return (
            <div key={s.titre?.id ?? `debut-${si}`} role="group" aria-labelledby={idTitre} className="space-y-2">
              {s.titre &&
                (edition?.id === s.titre.id && !lecture ? (
                  <EditeurPlan valeur={s.titre.texte} titre M={M} onValider={(t) => valider(s.titre!, t)} onAnnuler={() => annuler(s.titre!)} />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-x-3">
                    <h3 id={idTitre} className="min-w-0 flex-1 basis-full text-[17px] font-medium sm:basis-0">
                      {s.titre.texte.trim() ? <span className="font-sans [&_strong]:font-bold"><TexteMarkdown texte={s.titre.texte} /></span> : <span className="text-ink-soft">{P.vide}</span>}
                    </h3>
                    {!lecture && commandes(s.titre)}
                  </div>
                ))}
              {s.actions.map((a) => {
                const id = `plan-${a.id}`;
                const detail = a.detail;
                return (
                  <div key={a.id} className="rounded-xl border border-line p-3 has-[:checked]:bg-sage-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-strong/40">
                    {edition?.id === a.id && !lecture ? (
                      <EditeurPlan valeur={a.texte} titre={false} M={M} onValider={(t) => valider(a, t)} onAnnuler={() => annuler(a)} />
                    ) : (
                      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                        <div className="flex min-h-11 min-w-0 flex-1 basis-60 items-start gap-3">
                          <input
                            id={id}
                            type="checkbox"
                            checked={a.fait}
                            disabled={lecture}
                            onChange={() => basculer(a)}
                            aria-labelledby={`${id}-texte`}
                            className="mt-1 size-5 shrink-0 cursor-pointer accent-accent-strong disabled:cursor-default"
                          />
                          <label htmlFor={id} id={`${id}-texte`} className="min-w-0 flex-1 cursor-pointer break-words py-0.5 text-[16px]">
                            {a.texte.trim() ? <TexteMarkdown texte={a.texte} /> : <span className="text-ink-soft">{P.vide}</span>}
                            {detail && (
                              <span className="block text-sm text-ink-soft">
                                {detail.cible === "toutes" ? P.cibleToutes : nomCible(detail.cible)} · {M.canaux[detail.canal]} · {P.minutes(detail.minutes)}
                              </span>
                            )}
                          </label>
                        </div>
                        {!lecture && commandes(a)}
                      </div>
                    )}
                  </div>
                );
              })}
              {!lecture && (
                <div data-ecran-seul>
                  <button type="button" className={boutonTexte} onClick={() => ajouter(dernier)}>
                    <Icone nom="plus" className="size-4 shrink-0" />
                    {P.ajouterAction}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!lecture && (
          <div data-ecran-seul className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button type="button" className={boutonTexte} onClick={ajouterSection}>
              <Icone nom="plus" className="size-4 shrink-0" />
              {P.ajouterSection}
            </button>
            {plan && (
              <button type="button" className={boutonTexte} onClick={revenir}>
                <Icone nom="annuler" className="size-4 shrink-0" />
                {P.revenir}
              </button>
            )}
          </div>
        )}
      </section>
    </Card>
  );
}
