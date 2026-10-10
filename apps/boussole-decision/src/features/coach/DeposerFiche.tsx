"use client";

import { useId, useRef, useState } from "react";
import { Button, Textarea } from "@/components/ui";
import type { FicheTalent, MethodeFiche } from "@/domain/fiche/types";
import { Icone } from "@/features/espace/Icones";
import { lireCollage, lireFichier } from "@/features/fiche/lireDocument";
import { useI18n } from "@/i18n/client";
import { lireFichePreparee } from "./fichePreparee";

export interface FicheDeposee {
  fiche: FicheTalent;
  methode: MethodeFiche;
}

/**
 * Dépôt d'une fiche préparée par Pierre (page coach/codes) : fichier Word, PDF, export Notion, ou page collée.
 * Tout est lu dans le navigateur ; seule la fiche reconnue est envoyée, et seulement à l'enregistrement du code.
 */
export function DeposerFiche({ valeur, onChange }: { valeur: FicheDeposee | null; onChange: (f: FicheDeposee | null) => void }) {
  const { t } = useI18n();
  const K = t.vip.codes;
  const E = t.espace.importer.erreurs;
  const id = useId();
  const fichier = useRef<HTMLInputElement>(null);
  const [texte, setTexte] = useState("");
  const [lecture, setLecture] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function garder(brut: string, ficheQcm?: FicheTalent) {
    const lue = lireFichePreparee(brut, ficheQcm);
    if (!lue.ok) {
      onChange(null);
      return setErreur(K.ficheManque(lue.manquants.map((c) => K.champs[c]).join(", ")));
    }
    setErreur(null);
    onChange({ fiche: lue.fiche, methode: lue.methode });
  }

  async function lireDepot(f: File | undefined) {
    if (!f) return;
    setErreur(null);
    setLecture(true);
    try {
      const r = await lireFichier(f);
      if (!r.ok) return setErreur(r.code === "lecture" ? K.ficheErreur : E[r.code]);
      garder(r.texte, r.ficheQcm);
    } catch {
      setErreur(K.ficheErreur);
    } finally {
      setLecture(false);
      if (fichier.current) fichier.current.value = "";
    }
  }

  function lireTexte(html = "", plain = texte) {
    const r = lireCollage(html, plain);
    if (!r.ok) return setErreur(r.code === "lecture" ? K.ficheErreur : E[r.code]);
    garder(r.texte);
  }

  if (valeur) {
    return (
      <p role="status" className="flex flex-wrap items-center gap-2 rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-[15px] text-ink">
        <Icone nom="coche" className="h-5 w-5 shrink-0 text-sage" />
        <span className="min-w-0 flex-1">{K.ficheLue(valeur.fiche.titre || valeur.fiche.prenom || K.ficheSansTitre)}</span>
        <Button type="button" variant="ghost" className="min-h-9 py-1" onClick={() => (onChange(null), setTexte(""))}>
          {K.ficheRetirer}
        </Button>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <input
        ref={fichier}
        id={`${id}-fichier`}
        type="file"
        accept=".docx,.pdf,.md,.html,.htm,.zip,.txt"
        className="sr-only"
        onChange={(e) => lireDepot(e.target.files?.[0])}
      />
      <Button type="button" variant="secondary" disabled={lecture} onClick={() => fichier.current?.click()}>
        <Icone nom="dossier" className="h-5 w-5 shrink-0" />
        {lecture ? K.ficheLecture : K.ficheChoisir}
      </Button>
      <label htmlFor={`${id}-texte`} className="block text-[15px] text-ink-soft">
        {K.ficheColler}
      </label>
      <Textarea
        id={`${id}-texte`}
        value={texte}
        rows={4}
        onChange={(e) => setTexte(e.target.value)}
        onPaste={(e) => {
          const html = e.clipboardData.getData("text/html");
          const plain = e.clipboardData.getData("text/plain");
          if (html.trim()) {
            e.preventDefault();
            setTexte(plain);
            lireTexte(html, plain);
          }
        }}
      />
      {texte.trim() && (
        <Button type="button" variant="secondary" onClick={() => lireTexte()}>
          {K.ficheLire}
        </Button>
      )}
      {erreur && (
        <p role="alert" className="text-sm text-danger">
          {erreur}
        </p>
      )}
    </div>
  );
}
