"use client";

import { useState } from "react";
import { Badge, Button, Card, Textarea } from "@/components/ui";
import { validerCorrections } from "@/domain/maCible/entree";
import { LIMITES } from "@/domain/maCible/limites";
import type { Corrections, Esquisse, IdCible, Verdict } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { BarreBoutons, ChampTexte, GroupeRadio } from "./Champs";
import { RappelConfidentialite } from "./Confidentialite";
import { peutNouvelleEsquisse } from "./etat";

interface Avis {
  verdict: Verdict | "";
  commentaire: string;
}
const VIDE: Avis = { verdict: "", commentaire: "" };

export function EtapeEsquisse({
  esquisse,
  corrections,
  nouvelleEsquisseFaite,
  fournisseur,
  M,
  onRetour,
  onContinuer,
  onNouvelleEsquisse,
}: {
  esquisse: Esquisse;
  corrections: Corrections | null;
  nouvelleEsquisseFaite: boolean;
  fournisseur: string;
  M: MaCibleMessages;
  onRetour: () => void;
  onContinuer: (c: Corrections) => void;
  onNouvelleEsquisse: (c: Corrections) => void;
}) {
  const E = M.esquisse;
  const [offre, setOffre] = useState(corrections?.offre ?? esquisse.offre);
  const [avis, setAvis] = useState<Record<string, Avis>>(() => Object.fromEntries((corrections?.cibles ?? []).map((c) => [c.id, { verdict: c.verdict, commentaire: c.commentaire }])));
  const [anti, setAnti] = useState<Avis>(corrections ? { verdict: corrections.antiCible.verdict, commentaire: corrections.antiCible.commentaire } : { verdict: "oui", commentaire: "" });
  const [idee, setIdee] = useState(corrections?.idee ?? "");
  const [essaye, setEssaye] = useState(false);

  const de = (id: IdCible) => avis[id] ?? VIDE;
  const verdicts = (Object.keys(E.verdicts) as Verdict[]).map((valeur) => ({ valeur, label: E.verdicts[valeur] }));
  const proposerAutre = peutNouvelleEsquisse(
    { nouvelleEsquisseFaite },
    { cibles: esquisse.cibles.map((c) => ({ id: c.id, verdict: de(c.id).verdict || "oui", commentaire: "" })) },
  );

  /** Corrections complètes, ou `null` s'il manque un verdict, un commentaire ou l'offre. */
  function construire(): Corrections | null {
    const brut = {
      offre,
      cibles: esquisse.cibles.map((c) => ({ id: c.id, verdict: de(c.id).verdict || "oui", commentaire: de(c.id).commentaire })),
      antiCible: { verdict: anti.verdict || "oui", commentaire: anti.commentaire },
      idee,
    };
    const manqueVerdict = esquisse.cibles.some((c) => !de(c.id).verdict);
    const v = validerCorrections(brut);
    if (manqueVerdict || !v.ok) return null;
    return v.corrections;
  }

  function soumettre(apres: (c: Corrections) => void) {
    const c = construire();
    if (!c) {
      setEssaye(true);
      return;
    }
    apres(c);
  }

  const offreTropCourte = offre.trim().length < LIMITES.correctionOffre.min;
  const commentaireManque = (a: Avis) => (a.verdict === "en_partie" || a.verdict === "non") && a.commentaire.trim().length < LIMITES.commentaire.min;

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        soumettre(onContinuer);
      }}
    >
      <Card className="space-y-3 rounded-2xl p-6 sm:p-8">
        <h2 className="text-[22px] italic">{E.offreTitre}</h2>
        <ChampTexte champ="esquisse.offre" label={E.offreTitre} aide={E.offreAide} value={offre} onChange={setOffre} rows={3} maxLength={LIMITES.correctionOffre.max} M={M} />
        {essaye && offreTropCourte && (
          <p role="alert" className="text-sm text-danger">
            {M.validation.tropCourt(LIMITES.correctionOffre.min)}
          </p>
        )}
      </Card>

      <h2 className="text-[22px] italic">{E.ciblesTitre}</h2>
      {esquisse.cibles.map((c) => {
        const a = de(c.id);
        const idCom = `commentaire-${c.id}`;
        return (
          <Card key={c.id} className="space-y-4 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-[22px]">{c.nom}</h3>
              <Badge tone="neutral">{M.resultat.marche[c.marche]}</Badge>
            </div>
            <p className="text-[17px]">{c.enUneLigne}</p>
            <p className="text-[15px] text-ink-soft">{c.pourquoi}</p>
            <GroupeRadio<Verdict>
              nom={`verdict-${c.id}`}
              legende={E.verdictLegende(c.nom)}
              options={verdicts}
              valeur={a.verdict}
              onChange={(v) => setAvis((s) => ({ ...s, [c.id]: { ...de(c.id), verdict: v } }))}
              erreur={essaye && !a.verdict ? E.verdictRequis : undefined}
              idErreur={`verdict-${c.id}-erreur`}
              colonnes={false}
            />
            {(a.verdict === "en_partie" || a.verdict === "non") && (
              <div className="space-y-1.5">
                <label htmlFor={idCom} className="block text-[15px] font-medium text-ink">
                  {E.commentaire}
                </label>
                <Textarea
                  id={idCom}
                  rows={2}
                  maxLength={LIMITES.commentaire.max}
                  placeholder={E.commentairePlaceholder}
                  value={a.commentaire}
                  aria-invalid={essaye && commentaireManque(a) ? true : undefined}
                  aria-describedby={essaye && commentaireManque(a) ? `${idCom}-erreur` : undefined}
                  onChange={(e) => setAvis((s) => ({ ...s, [c.id]: { ...de(c.id), commentaire: e.target.value } }))}
                />
                {essaye && commentaireManque(a) && (
                  <p id={`${idCom}-erreur`} role="alert" className="text-sm text-danger">
                    {E.commentaireRequis}
                  </p>
                )}
              </div>
            )}
          </Card>
        );
      })}

      <Card className="space-y-4 rounded-2xl border-[#F3C1CF] bg-blush p-6 sm:p-8">
        <h2 className="text-[22px] italic">{E.antiTitre}</h2>
        <p className="text-[17px]">{esquisse.antiCible}</p>
        <GroupeRadio<Verdict>
          nom="verdict-anti"
          legende={E.verdictLegende(E.antiTitre)}
          options={verdicts}
          valeur={anti.verdict}
          onChange={(v) => setAnti((s) => ({ ...s, verdict: v }))}
          colonnes={false}
        />
        {(anti.verdict === "en_partie" || anti.verdict === "non") && (
          <div className="space-y-1.5">
            <label htmlFor="commentaire-anti" className="block text-[15px] font-medium text-ink">
              {E.commentaire} <span className="font-normal text-ink-soft">{M.commun.facultatif}</span>
            </label>
            <Textarea id="commentaire-anti" rows={2} maxLength={LIMITES.commentaire.max} value={anti.commentaire} onChange={(e) => setAnti((s) => ({ ...s, commentaire: e.target.value }))} />
          </div>
        )}
      </Card>

      {esquisse.hypotheses.length > 0 && (
        <Card className="space-y-2 rounded-2xl p-6 sm:p-8">
          <h2 className="text-[22px] italic">{E.hypothesesTitre}</h2>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {esquisse.hypotheses.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="rounded-2xl p-6 sm:p-8">
        <ChampTexte champ="esquisse.idee" label={E.ideeLabel} exemple={E.ideeExemple} value={idee} onChange={setIdee} facultatif multiligne={false} maxLength={LIMITES.idee.max} M={M} />
      </Card>

      <RappelConfidentialite M={M} fournisseur={fournisseur} />
      <BarreBoutons>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onRetour}>
            {M.commun.retour}
          </Button>
          {proposerAutre && (
            <Button type="button" variant="secondary" onClick={() => soumettre(onNouvelleEsquisse)}>
              {E.nouvelleEsquisse}
            </Button>
          )}
        </div>
        <Button type="submit">{E.continuer}</Button>
      </BarreBoutons>
    </form>
  );
}
