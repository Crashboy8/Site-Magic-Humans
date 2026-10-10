"use client";

import { useEffect, useRef, useState } from "react";
import { Button, cx } from "@/components/ui";
import { nettoyerTexte, nettoyerTitre, TEXTE_ACTION_MAX, TEXTE_TITRE_MAX } from "@/domain/maCible/planEdite";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { Icone } from "./Icones";
import { TexteMarkdown } from "./TexteMarkdown";

const EMOJIS = ["✅", "🎯", "📞", "✉️", "🔥", "⭐"] as const;

/** Éditeur léger d'une action ou d'un titre : Markdown (gras, italique), émojis, aperçu. Rien n'est interprété comme du HTML. */
export function EditeurPlan({
  valeur,
  titre,
  M,
  onValider,
  onAnnuler,
}: {
  valeur: string;
  /** Un titre de section tient sur une ligne. */
  titre: boolean;
  M: MaCibleMessages;
  onValider: (texte: string) => void;
  onAnnuler: () => void;
}) {
  const P = M.plan;
  const max = titre ? TEXTE_TITRE_MAX : TEXTE_ACTION_MAX;
  const [texte, setTexte] = useState(valeur);
  const champ = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const selection = useRef<[number, number] | null>(null);

  // Remet le curseur là où l'insertion l'a placé, une fois le champ à jour.
  useEffect(() => {
    if (selection.current && champ.current) {
      champ.current.focus();
      champ.current.setSelectionRange(selection.current[0], selection.current[1]);
      selection.current = null;
    }
  }, [texte]);

  const nettoyer = (t: string) => (titre ? nettoyerTitre(t) : nettoyerTexte(t, max));

  function remplacer(debut: number, fin: number, insere: string, curseurDebut: number, curseurFin: number) {
    const suivant = nettoyer(texte.slice(0, debut) + insere + texte.slice(fin));
    selection.current = [Math.min(curseurDebut, suivant.length), Math.min(curseurFin, suivant.length)];
    setTexte(suivant);
  }
  function entourer(marque: string) {
    const c = champ.current;
    const debut = c?.selectionStart ?? texte.length;
    const fin = c?.selectionEnd ?? texte.length;
    const choisi = texte.slice(debut, fin);
    remplacer(debut, fin, `${marque}${choisi}${marque}`, debut + marque.length, debut + marque.length + choisi.length);
  }
  function inserer(emoji: string) {
    const c = champ.current;
    const debut = c?.selectionStart ?? texte.length;
    const fin = c?.selectionEnd ?? texte.length;
    remplacer(debut, fin, emoji, debut + emoji.length, debut + emoji.length);
  }
  function touche(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onAnnuler();
    } else if (e.key === "Enter" && (titre || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onValider(nettoyer(texte));
    }
  }

  const commun = {
    "aria-label": titre ? P.libelleTitre : P.libelleAction,
    placeholder: titre ? P.placeholderTitre : P.placeholderAction,
    value: texte,
    maxLength: max,
    autoFocus: true,
    onKeyDown: touche,
    className: "w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 text-[16px] leading-relaxed text-ink focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/25",
  };
  const bouton = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-ink/20 bg-paper px-3 text-[15px] hover:bg-sand";

  return (
    <div data-ecran-seul className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label={titre ? P.libelleTitre : P.libelleAction}>
        <button type="button" className={cx(bouton, "font-bold")} aria-label={P.gras} title={P.gras} onClick={() => entourer("**")}>
          <span aria-hidden="true">B</span>
        </button>
        <button type="button" className={cx(bouton, "italic")} aria-label={P.italique} title={P.italique} onClick={() => entourer("*")}>
          <span aria-hidden="true">I</span>
        </button>
        {EMOJIS.map((e) => (
          <button key={e} type="button" className={bouton} aria-label={P.emoji(e)} title={P.emoji(e)} onClick={() => inserer(e)}>
            <span aria-hidden="true">{e}</span>
          </button>
        ))}
      </div>
      {titre ? (
        <input ref={champ as React.RefObject<HTMLInputElement>} type="text" {...commun} onChange={(e) => setTexte(nettoyerTitre(e.target.value))} />
      ) : (
        <textarea ref={champ as React.RefObject<HTMLTextAreaElement>} rows={3} {...commun} onChange={(e) => setTexte(nettoyerTexte(e.target.value, max))} />
      )}
      <p className="text-sm text-ink-soft">
        {P.aide} <span aria-hidden="true">{M.commun.compteur(texte.length, max)}</span>
      </p>
      {texte.trim() !== "" && (
        <div className="rounded-xl bg-sand/60 px-3 py-2 text-[16px]">
          <span className="block text-xs font-medium uppercase tracking-wide text-ink-soft">{P.apercu}</span>
          <TexteMarkdown texte={texte} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" className="px-4 py-2" onClick={() => onValider(nettoyer(texte))}>
          <Icone nom="coche" className="size-4 shrink-0" />
          {P.valider}
        </Button>
        <Button type="button" variant="secondary" className="px-4 py-2" onClick={onAnnuler}>
          <Icone nom="croix" className="size-4 shrink-0" />
          {P.annuler}
        </Button>
      </div>
    </div>
  );
}
