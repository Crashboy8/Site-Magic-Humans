"use client";

import { useState } from "react";
import { Button, Card, Textarea } from "@/components/ui";
import { validerCorrections } from "@/domain/maCible/entree";
import { iconeCible } from "@/domain/maCible/iconeCible";
import { LIMITES } from "@/domain/maCible/limites";
import type { Corrections, Esquisse, IdCible, Verdict } from "@/domain/maCible/types";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { AlerteSoumission, BarreBoutons, ChampTexte, Compteur, GroupeRadio } from "./Champs";
import { RappelConfidentialite } from "./Confidentialite";
import { defilerVersChamp } from "./defilement";
import { idChamp } from "./erreurs";
import { ecartEsquisse } from "./ecarts";
import { peutNouvelleEsquisse } from "./etat";
import { CLASSE_CARTE, PastilleFine, PastilleIcone, teinteCible, TEINTE, TitreIcone } from "./Habillage";

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
      if (ecart) defilerVersChamp(ecart.id);
      return;
    }
    apres(c);
  }

  const offreTropCourte = offre.trim().length < LIMITES.correctionOffre.min;
  const commentaireManque = (a: Avis) => (a.verdict === "en_partie" || a.verdict === "non") && a.commentaire.trim().length < LIMITES.commentaire.min;
  const ecart = ecartEsquisse(esquisse.cibles, offre, de, {
    manqueOffre: E.manqueOffre,
    manqueAvis: E.manqueAvis,
    manqueCommentaire: E.manqueCommentaire,
  });

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        soumettre(onContinuer);
      }}
    >
      <Card className={`${CLASSE_CARTE} space-y-3 rounded-2xl p-6 sm:p-8`}>
        <TitreIcone icone="cadeau" teinte="corail" className="rounded-xl bg-gradient-to-r from-corail-soft to-transparent px-3 py-2 text-[22px] italic">
          {E.offreTitre}
        </TitreIcone>
        <ChampTexte
          champ="esquisse.offre"
          label={E.offreTitre}
          aide={E.offreAide}
          value={offre}
          onChange={setOffre}
          rows={3}
          maxLength={LIMITES.correctionOffre.max}
          erreur={essaye && offreTropCourte ? { champ: "esquisse.offre", code: "trop_court", min: LIMITES.correctionOffre.min } : undefined}
          M={M}
        />
      </Card>

      <TitreIcone icone="cible" teinte="eau" className="text-[22px] italic">
        {E.ciblesTitre}
      </TitreIcone>
      {esquisse.cibles.map((c, index) => {
        const a = de(c.id);
        const idCom = `commentaire-${c.id}`;
        const teinte = teinteCible(index);
        return (
          <Card key={c.id} className={`${CLASSE_CARTE} space-y-4 rounded-2xl border-l-4 p-6 sm:p-8 ${TEINTE[teinte].bord}`}>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="flex items-center gap-3 text-[22px]">
                <PastilleIcone nom={iconeCible(c.nom, c.enUneLigne)} teinte={teinte} />
                <span className="min-w-0">{c.nom}</span>
              </h3>
              <span className="inline-flex items-center gap-1.5">
                <PastilleFine ton="neutre">{M.resultat.marche[c.marche]}</PastilleFine>
                {c.depuisIdees.length > 0 && <PastilleFine ton="miel">{M.resultat.tonIdee}</PastilleFine>}
              </span>
            </div>
            <p className="text-[17px]">{c.enUneLigne}</p>
            <p className="text-[15px] text-ink-soft">{c.pourquoi}</p>
            <GroupeRadio<Verdict>
              nom={`verdict-${c.id}`}
              id={`verdict-${c.id}`}
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
                  rows={4}
                  maxLength={LIMITES.commentaire.max}
                  placeholder={E.commentairePlaceholder}
                  value={a.commentaire}
                  aria-invalid={essaye && commentaireManque(a) ? true : undefined}
                  aria-describedby={essaye && commentaireManque(a) ? `${idCom}-erreur` : undefined}
                  onChange={(e) => setAvis((s) => ({ ...s, [c.id]: { ...de(c.id), commentaire: e.target.value } }))}
                />
                <Compteur id={`${idCom}-compteur`} longueur={a.commentaire.length} max={LIMITES.commentaire.max} M={M} />
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

      <Card className={`${CLASSE_CARTE} space-y-4 rounded-2xl border-l-4 border-l-framboise border-[#F3C1CF] bg-blush p-6 sm:p-8`}>
        <TitreIcone icone="interdit" teinte="framboise" className="text-[22px] italic">
          {E.antiTitre}
        </TitreIcone>
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
            <Textarea id="commentaire-anti" rows={3} maxLength={LIMITES.commentaire.max} value={anti.commentaire} onChange={(e) => setAnti((s) => ({ ...s, commentaire: e.target.value }))} />
            <Compteur id="commentaire-anti-compteur" longueur={anti.commentaire.length} max={LIMITES.commentaire.max} M={M} />
          </div>
        )}
      </Card>

      {esquisse.autresPistes.length > 0 && (
        <section className={`${CLASSE_CARTE} space-y-4 rounded-2xl border-l-4 border-miel bg-gradient-to-br from-miel-soft to-paper p-5 sm:p-6`}>
          <TitreIcone icone="couches" teinte="miel" className="font-serif text-[22px] italic">
            {E.pistesTitre}
          </TitreIcone>
          <p className="text-[16px] text-ink-soft">{E.pistesIntro}</p>
          <ul className="space-y-3">
            {esquisse.autresPistes.map((p) => (
              <li key={p.id} className="space-y-2 rounded-xl bg-paper p-4 shadow-[0_6px_16px_rgba(58,47,36,0.05)]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="flex items-center gap-2 font-medium">
                    <PastilleIcone nom={iconeCible(p.nom, p.enUneLigne)} teinte="miel" taille="sm" />
                    <span className="min-w-0">{p.nom}</span>
                  </p>
                  <span className="inline-flex items-center gap-1.5">
                    <PastilleFine ton="neutre">{M.resultat.marche[p.marche]}</PastilleFine>
                    {p.depuisIdees.length > 0 && <PastilleFine ton="miel">{M.resultat.tonIdee}</PastilleFine>}
                  </span>
                </div>
                <p className="text-[16px]">{p.enUneLigne}</p>
                <p className="text-[16px]">
                  <span className="font-medium">{E.pourquoiPas}</span> {p.raison}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIdee(E.prefererTexte(p.nom));
                    window.setTimeout(() => defilerVersChamp(idChamp("esquisse.idee")), 0);
                  }}
                >
                  {E.preferer}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {esquisse.hypotheses.length > 0 && (
        <Card className={`${CLASSE_CARTE} space-y-2 rounded-2xl p-6 sm:p-8`}>
          <TitreIcone icone="ampoule" teinte="lilas" className="text-[22px] italic">
            {E.hypothesesTitre}
          </TitreIcone>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {esquisse.hypotheses.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="rounded-2xl p-6 sm:p-8">
        <ChampTexte champ="esquisse.idee" label={E.ideeLabel} exemple={E.ideeExemple} value={idee} onChange={setIdee} facultatif rows={3} maxLength={LIMITES.idee.max} M={M} />
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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <AlerteSoumission message={essaye ? (ecart?.message ?? null) : null} />
          <Button type="submit" className="max-sm:w-full">
            {E.continuer}
          </Button>
        </div>
      </BarreBoutons>
    </form>
  );
}
