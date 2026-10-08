"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { normaliser, validerNotes } from "@/domain/maCible/entree";
import { LIMITES } from "@/domain/maCible/limites";
import { additionnerMasques, decrireMasques, masquerDonnees, MASQUES_VIDES, type CompteMasques } from "@/domain/maCible/masquage";
import { IDS_NOTES } from "@/domain/maCible/schemas";
import type { Frequence, NoteTerrain, SyntheseTerrain } from "@/domain/maCible/types";
import type { FournisseurNotes } from "@/domain/maCible/fournisseurNotes";
import { fournisseurGratuit } from "@/domain/maCible/fournisseurNotes";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import type { CodeErreur } from "./api";
import { formaterDureeEcoulee } from "./attenteTemps";
import { messageApi, SANS_REESSAI } from "./erreurs";
import { CLASSE_CARTE, PastilleIcone } from "./Habillage";
import { Icone } from "./Icones";

type Brouillon = { titre: string; texte: string };
const vide = (): Brouillon => ({ titre: "", texte: "" });

export type LectureNotes =
  | { ok: true; statut: "ok"; masques: CompteMasques }
  | { ok: true; statut: "inutilisable"; message: string; masques: CompteMasques }
  | { ok: false; code: CodeErreur; max?: number };

function fichierTexte(f: File): boolean {
  const nom = f.name.toLowerCase();
  if (!nom.endsWith(".txt") && !nom.endsWith(".md") && !nom.endsWith(".csv")) return false;
  if (!f.type) return true;
  return f.type.startsWith("text/") || f.type === "application/csv";
}

function pointsAvertissement(N: MaCibleMessages["notes"], fournisseur: FournisseurNotes): string[] {
  const nom = N.noms[fournisseur];
  const milieu = [N.point2, N.point3, N.point4, N.point5];
  if (fournisseurGratuit(fournisseur)) return [N.pointGratuit1(nom), ...milieu, N.point6];
  return [N.pointPayant(nom), ...milieu];
}

export function NotesTerrain({
  synthese,
  fournisseurNotes,
  maxSynthese,
  autreAppel,
  M,
  onLire,
  onRetirerVerbatim,
  onEffacer,
}: {
  synthese: SyntheseTerrain | null;
  fournisseurNotes: FournisseurNotes;
  maxSynthese: number;
  autreAppel: boolean;
  M: MaCibleMessages;
  onLire: (notes: NoteTerrain[]) => Promise<LectureNotes>;
  onRetirerVerbatim: (id: string) => void;
  onEffacer: () => void;
}) {
  const N = M.notes;
  const [ouvert, setOuvert] = useState(false);
  const [notes, setNotes] = useState<Brouillon[]>([vide()]);
  const [coche, setCoche] = useState(false);
  const [masques, setMasques] = useState<CompteMasques>(MASQUES_VIDES);
  const [erreur, setErreur] = useState<string | null>(null);
  const [codeErreur, setCodeErreur] = useState<CodeErreur | null>(null);
  const [messageIa, setMessageIa] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [depart, setDepart] = useState(0);
  const [maintenant, setMaintenant] = useState(0);
  const [vientDeLire, setVientDeLire] = useState(false);
  const fichier = useRef<HTMLInputElement>(null);
  const total = notes.reduce((n, note) => n + normaliser(note.texte).length, 0);
  const ligneMasques = decrireMasques(masques);
  const bloque = !coche || total < LIMITES.notes.totalMin || total > LIMITES.notes.total || chargement || autreAppel;

  useEffect(() => {
    if (!chargement) return;
    const id = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [chargement]);

  function flouter(i: number, champ: "titre" | "texte") {
    const actuel = notes[i]?.[champ] ?? "";
    const masque = masquerDonnees(actuel);
    if (masque.texte !== actuel) {
      setNotes((liste) => liste.map((n, j) => (j === i ? { ...n, [champ]: masque.texte } : n)));
    }
    if (masque.mails || masque.telephones || masque.liens) setMasques((m) => additionnerMasques(m, masque));
  }

  async function importer(liste: FileList | null) {
    if (!liste || chargement) return;
    let suivant = notes.some((n) => n.titre || n.texte) ? [...notes] : [];
    let reste = LIMITES.notes.total - suivant.reduce((n, note) => n + note.texte.length, 0);
    let message: string | null = null;
    for (const f of Array.from(liste)) {
      if (suivant.length >= LIMITES.notes.items) {
        message = N.maxNotes;
        break;
      }
      if (!fichierTexte(f)) {
        message = N.fichierRefuse;
        continue;
      }
      const brut = await f.text();
      if (brut.includes("\u0000")) {
        message = N.fichierRefuse;
        continue;
      }
      const masque = masquerDonnees(brut);
      if (masque.mails || masque.telephones || masque.liens) setMasques((m) => additionnerMasques(m, masque));
      let texte = masque.texte;
      if (texte.length > reste) {
        texte = texte.slice(0, Math.max(0, reste));
        message = N.fichierLong;
      }
      const titre = f.name.replace(/\.[^.]+$/, "").slice(0, LIMITES.notes.titre);
      suivant = [...suivant, { titre, texte }];
      reste -= texte.length;
      if (reste <= 0) break;
    }
    setNotes(suivant.length ? suivant.slice(0, LIMITES.notes.items) : [vide()]);
    setErreur(message);
    setCodeErreur(null);
    if (fichier.current) fichier.current.value = "";
  }

  async function analyser() {
    if (chargement || autreAppel) return;
    if (!coche) {
      setErreur(N.caseRequise);
      setCodeErreur(null);
      return;
    }
    const prepares = notes
      .map((n, i) => ({ id: IDS_NOTES[i], titre: n.titre, texte: n.texte }))
      .filter((n) => normaliser(n.texte))
      .map((n, i) => ({ ...n, id: IDS_NOTES[i] }));
    const v = validerNotes(prepares);
    if (!v.ok) {
      const totalErreur = v.erreurs.find((e) => e.champ === "notes");
      setErreur(totalErreur?.code === "trop_long" || total > LIMITES.notes.total ? N.tropLong : N.tropCourt);
      setCodeErreur(null);
      return;
    }
    if (synthese && !window.confirm(N.confirmerRemplacer)) return;
    setErreur(null);
    setCodeErreur(null);
    setMessageIa(null);
    const debut = Date.now();
    setDepart(debut);
    setMaintenant(debut);
    setChargement(true);
    const r = await onLire(v.notes);
    setChargement(false);
    if (!r.ok) {
      setCodeErreur(r.code);
      setErreur(r.code === "quota_ip" ? N.quotaIp(r.max ?? maxSynthese) : messageApi(r.code, M, r.max));
      return;
    }
    setMasques((m) => additionnerMasques(m, r.masques));
    if (r.statut === "inutilisable") {
      setMessageIa(r.message);
      setErreur(N.inutilisable);
      return;
    }
    setNotes([vide()]);
    setCoche(false);
    setOuvert(false);
    setVientDeLire(true);
  }

  function rouvrir() {
    setNotes([vide()]);
    setCoche(false);
    setErreur(null);
    setCodeErreur(null);
    setMessageIa(null);
    setMasques(MASQUES_VIDES);
    setVientDeLire(false);
    setOuvert(true);
  }

  function effacer() {
    if (!window.confirm(N.confirmerEffacer)) return;
    onEffacer();
    setVientDeLire(false);
    setMasques(MASQUES_VIDES);
  }

  if (!ouvert && synthese) {
    return (
      <SyntheseNotes
        synthese={synthese}
        M={M}
        vientDeLire={vientDeLire}
        ligneMasques={ligneMasques}
        onRelire={rouvrir}
        onEffacer={effacer}
        onRetirer={onRetirerVerbatim}
      />
    );
  }

  if (!ouvert) {
    return (
      <section className={`${CLASSE_CARTE} space-y-3 rounded-2xl border-l-4 border-lilas bg-gradient-to-br from-lilas-soft to-paper p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <PastilleIcone nom="carnet" teinte="lilas" />
          <h2 className="font-serif text-[22px] italic leading-snug">
            {N.titre} <span className="font-sans text-[15px] font-normal not-italic text-ink-soft">{M.commun.facultatif}</span>
          </h2>
        </div>
        <p className="text-[16px] text-ink-soft">{N.texte}</p>
        <Button type="button" variant="secondary" className="max-sm:w-full" onClick={() => setOuvert(true)}>
          {N.ajouter}
        </Button>
      </section>
    );
  }

  const ecoule = chargement ? maintenant - depart : 0;
  const messageChargeur = N.chargeur[Math.floor(ecoule / 6000) % N.chargeur.length];

  return (
    <section className={`${CLASSE_CARTE} space-y-4 rounded-2xl border-l-4 border-lilas bg-gradient-to-br from-lilas-soft to-paper p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <PastilleIcone nom="carnet" teinte="lilas" />
        <h2 className="font-serif text-[22px] italic leading-snug">
          {N.titre} <span className="font-sans text-[15px] font-normal not-italic text-ink-soft">{M.commun.facultatif}</span>
        </h2>
      </div>

      <div className="space-y-3 rounded-2xl border border-sky-line border-l-4 border-l-ciel bg-paper p-4">
        <h3 className="flex items-start gap-3 font-serif text-[20px] italic">
          <PastilleIcone nom="cadenas" teinte="ciel" taille="sm" />
          <span>{N.avertissementTitre}</span>
        </h3>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-ink">
          {pointsAvertissement(N, fournisseurNotes).map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ol>
      </div>

      <ul className="space-y-4">
        {notes.map((note, i) => (
          <li key={i} className="space-y-2 rounded-xl border border-line bg-paper p-3">
            <label className="block space-y-1 text-[15px] font-medium">
              {N.titreNote}
              <input
                type="text"
                maxLength={LIMITES.notes.titre}
                value={note.titre}
                disabled={chargement}
                placeholder={N.titrePlaceholder}
                onChange={(e) => setNotes((liste) => liste.map((n, j) => (j === i ? { ...n, titre: e.target.value } : n)))}
                onBlur={() => flouter(i, "titre")}
                className="mt-1 min-h-11 w-full rounded-xl border border-ink/20 bg-paper px-3 text-[16px] font-normal"
              />
            </label>
            <textarea
              rows={8}
              value={note.texte}
              disabled={chargement}
              placeholder={N.textePlaceholder}
              onChange={(e) => setNotes((liste) => liste.map((n, j) => (j === i ? { ...n, texte: e.target.value } : n)))}
              onBlur={() => flouter(i, "texte")}
              className="max-h-96 min-h-44 w-full resize-y rounded-xl border border-ink/20 bg-paper px-3 py-2 text-[16px] leading-relaxed"
            />
            {notes.length > 1 && (
              <Button type="button" variant="secondary" className="max-sm:w-full" disabled={chargement} onClick={() => setNotes((liste) => liste.filter((_, j) => j !== i))}>
                {N.retirerNote}
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row">
        {notes.length < LIMITES.notes.items && (
          <Button type="button" variant="secondary" className="max-sm:w-full" disabled={chargement} onClick={() => setNotes((liste) => [...liste, vide()])}>
            {N.ajouterNote}
          </Button>
        )}
        <Button type="button" variant="secondary" className="max-sm:w-full" disabled={chargement} onClick={() => fichier.current?.click()}>
          {N.importer}
        </Button>
        <input
          ref={fichier}
          type="file"
          accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
          multiple
          className="sr-only"
          onChange={(e) => void importer(e.target.files)}
        />
      </div>

      <p className={`text-[15px] tabular-nums ${total > LIMITES.notes.total ? "font-medium text-danger" : "text-ink-soft"}`}>{N.compteur(total, LIMITES.notes.total)}</p>
      {ligneMasques && <p className="text-[15px]">{ligneMasques}</p>}

      <label className="flex min-h-11 items-start gap-3 text-[15px]">
        <input type="checkbox" className="mt-1 size-5 shrink-0" checked={coche} disabled={chargement} onChange={(e) => setCoche(e.target.checked)} />
        <span>{N.caseConfirme}</span>
      </label>

      {chargement && (
        <div className="space-y-2" aria-live="polite">
          <div className="h-1 overflow-hidden rounded-full bg-lilas-soft">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-lilas via-corail to-miel motion-safe:animate-[glisse_1.6s_linear_infinite]" />
          </div>
          <p className="text-[16px]">{messageChargeur}</p>
          <p className="text-[15px] text-ink-soft">
            {M.attente.ecoule(formaterDureeEcoulee(ecoule))}
          </p>
        </div>
      )}

      {erreur && (
        <p className="text-[15px] text-danger" role="alert">
          {erreur}
          {messageIa ? ` ${messageIa}` : ""}
        </p>
      )}
      {codeErreur && !SANS_REESSAI.includes(codeErreur) && (
        <Button type="button" variant="secondary" className="max-sm:w-full" onClick={() => void analyser()}>
          {M.erreurs.reessayer}
        </Button>
      )}

      <div className="space-y-1">
        <Button type="button" aria-disabled={bloque} className={`max-sm:w-full ${bloque ? "opacity-60" : ""}`} onClick={() => void analyser()}>
          <span className="inline-flex items-center justify-center gap-2">
            <Icone nom="etincelles" className="size-5" />
            {N.analyser}
          </span>
        </Button>
        <p className="text-[15px] text-ink-soft">{N.sousBouton(maxSynthese)}</p>
      </div>
    </section>
  );
}

function SyntheseNotes({
  synthese,
  M,
  vientDeLire,
  ligneMasques,
  onRelire,
  onEffacer,
  onRetirer,
}: {
  synthese: SyntheseTerrain;
  M: MaCibleMessages;
  vientDeLire: boolean;
  ligneMasques: string | null;
  onRelire: () => void;
  onEffacer: () => void;
  onRetirer: (id: string) => void;
}) {
  const N = M.notes;
  const date = new Date(synthese.faitLe).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <section className={`${CLASSE_CARTE} motion-safe:animate-[apparaitre_300ms_ease-out] space-y-4 rounded-2xl border-l-4 border-lilas bg-paper p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <PastilleIcone nom="carnet" teinte="lilas" />
        <div>
          <h2 tabIndex={-1} className="font-serif text-[22px] italic leading-snug">
            {N.carteTitre}
          </h2>
          <p className="text-[15px] text-ink-soft">{N.sousTitre(date, synthese.nbNotes)}</p>
        </div>
      </div>
      {vientDeLire && <p className="text-[16px]">{N.succes}</p>}
      {ligneMasques && <p className="text-[15px]">{ligneMasques}</p>}
      {synthese.resume.trim() && (
        <div className="space-y-1">
          <h3 className="text-[17px] font-medium">{N.enBref}</h3>
          <p className="text-[16px] leading-relaxed">{synthese.resume}</p>
        </div>
      )}
      {synthese.profils.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[17px] font-medium">{N.profils}</h3>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {synthese.profils.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {synthese.douleurs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[17px] font-medium">{N.douleurs}</h3>
          <ul className="space-y-2">
            {synthese.douleurs.map((d) => (
              <li key={`${d.frequence}-${d.texte}`} className="space-y-1">
                <p className="text-[16px]">{d.texte}</p>
                <span className="inline-flex rounded-full bg-framboise-soft px-2 py-1 text-xs font-medium text-framboise">{N.frequence[d.frequence as Frequence]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {synthese.verbatims.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[17px] font-medium">{N.mots}</h3>
          <ul className="space-y-3">
            {synthese.verbatims.map((v) => (
              <li key={v.id} className="space-y-2">
                <blockquote className="text-[17px] italic leading-relaxed">« {v.citation} »</blockquote>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-lilas-soft px-2 py-1 text-xs font-medium text-lilas">{N.tire}</span>
                  <button type="button" aria-label={N.retirerPhraseAide} onClick={() => onRetirer(v.id)} className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[15px] text-ink-soft hover:bg-sand">
                    <Icone nom="croix" className="size-4" />
                    {N.retirerPhrase}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {synthese.declencheurs.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[17px] font-medium">{N.declencheurs}</h3>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {synthese.declencheurs.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {synthese.objections.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[17px] font-medium">{N.objections}</h3>
          <ul className="list-disc space-y-1 pl-5 text-[16px]">
            {synthese.objections.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      {synthese.motsCles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[17px] font-medium">{N.motsCles}</h3>
          <ul className="flex flex-wrap gap-2">
            {synthese.motsCles.map((mot) => (
              <li key={mot} className="rounded-full bg-lilas-soft px-3 py-1 text-sm text-lilas">
                {mot}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" className="max-sm:w-full" onClick={onRelire}>
          {N.relire}
        </Button>
        <Button type="button" variant="secondary" className="max-sm:w-full" onClick={onEffacer}>
          {N.effacer}
        </Button>
      </div>
    </section>
  );
}
