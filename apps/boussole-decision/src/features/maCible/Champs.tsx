"use client";

import { useState, type ReactNode } from "react";
import { Input, Textarea, Notice, cx } from "@/components/ui";
import { detecterFlou, type ErreurChamp } from "@/domain/maCible/entree";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { compteurVisible } from "./compteur";
import { idChamp, messageChamp } from "./erreurs";

/** Pied d'étape : bouton principal à droite, « Retour » à gauche. Collant en bas de l'écran sous 640 px. */
export function BarreBoutons({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-3 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-4 max-sm:border-t max-sm:border-line max-sm:bg-cream max-sm:px-4 max-sm:py-3 sm:flex-row sm:items-center sm:justify-between [&>button]:max-sm:w-full">
      {children}
    </div>
  );
}

/** Résumé des erreurs en haut de l'étape. Le focus et le défilement vont au premier champ, pas ici. */
export function ResumeErreurs({ erreurs, M, libelles }: { erreurs: ErreurChamp[]; M: MaCibleMessages; libelles: Record<string, string> }) {
  if (erreurs.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[15px] text-danger">
      <p className="font-medium">{M.commun.erreursResume(erreurs.length)}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {erreurs.map((e) => (
          <li key={e.champ}>
            <a
              href={`#${idChamp(e.champ)}`}
              className="underline"
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById(idChamp(e.champ))?.focus();
              }}
            >
              {libelles[e.champ] ?? e.champ}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ChampTexteProps {
  champ: string;
  label: string;
  aide?: string;
  exemple?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  erreur?: ErreurChamp;
  M: MaCibleMessages;
  /** Clé testée par `detecterFlou` (benefice, offre, clientsPasses). */
  flou?: string;
  facultatif?: boolean;
  multiligne?: boolean;
  rows?: number;
  maxLength?: number;
}

/** Compteur vivant, visible seulement près du plafond. */
export function Compteur({ id, longueur, max, M }: { id: string; longueur: number; max: number; M: MaCibleMessages }) {
  if (!compteurVisible(longueur, max)) return null;
  const atteint = longueur >= max;
  return (
    <p id={id} className={cx("text-right text-sm tabular-nums", atteint ? "font-medium text-danger" : "text-ink-soft")}>
      {M.commun.compteur(longueur, max)}
    </p>
  );
}

/** Phrase d'erreur collée au bouton de validation. */
export function AlerteSoumission({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="text-sm font-medium text-danger sm:text-right">{message}</p>;
}

/** Libellé, aide, exemple en gris, champ, compteur près de la limite, indice de flou et message d'erreur. */
export function ChampTexte({ champ, label, aide, exemple, placeholder, value, onChange, erreur, M, flou, facultatif, multiligne = true, rows = 3, maxLength }: ChampTexteProps) {
  const id = idChamp(champ);
  const [flouVisible, setFlouVisible] = useState(false);
  const compteur = maxLength !== undefined && compteurVisible(value.length, maxLength);
  const decrit = [aide && `${id}-aide`, exemple && `${id}-exemple`, compteur && `${id}-compteur`, flouVisible && `${id}-flou`, erreur && `${id}-erreur`].filter(Boolean).join(" ") || undefined;
  const commun = {
    id,
    value,
    placeholder,
    maxLength,
    "aria-invalid": erreur ? true : undefined,
    "aria-describedby": decrit,
    onBlur: () => setFlouVisible(flou ? detecterFlou(flou, value) : false),
  };
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[15px] font-medium text-ink">
        {label} {facultatif && <span className="font-normal text-ink-soft">{M.commun.facultatif}</span>}
      </label>
      {aide && (
        <p id={`${id}-aide`} className="text-sm text-ink-soft">
          {aide}
        </p>
      )}
      {multiligne ? (
        <Textarea rows={rows} {...commun} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input type="text" {...commun} onChange={(e) => onChange(e.target.value)} />
      )}
      {maxLength !== undefined && <Compteur id={`${id}-compteur`} longueur={value.length} max={maxLength} M={M} />}
      {exemple && (
        <p id={`${id}-exemple`} className="text-[15px] italic text-ink-soft">
          {M.commun.exemplePrefix}
          {exemple}
        </p>
      )}
      {flouVisible && (
        <div id={`${id}-flou`}>
          <Notice tone="info">{M.terrain.flou}</Notice>
        </div>
      )}
      {erreur && (
        <p id={`${id}-erreur`} className="text-sm text-danger">
          {messageChamp(erreur, M)}
        </p>
      )}
    </div>
  );
}

const carteChoix =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-ink/20 p-4 text-[16px] has-[:checked]:border-accent-strong has-[:checked]:bg-blush has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-strong/40";

interface GroupeProps<T extends string> {
  nom: string;
  legende: string;
  aide?: string;
  options: { valeur: T; label: string }[];
  valeur: T | "" | null;
  onChange: (v: T) => void;
  erreur?: string;
  idErreur?: string;
  /** Cible du défilement quand ce groupe est le premier invalide. */
  id?: string;
  colonnes?: boolean;
}

/** Boutons radio en cartes cliquables, dans un `fieldset`. Le vrai `input` reste visible. */
export function GroupeRadio<T extends string>({ nom, legende, aide, options, valeur, onChange, erreur, idErreur, id, colonnes = true }: GroupeProps<T>) {
  return (
    <fieldset id={id} className="space-y-2 scroll-mt-6" aria-describedby={idErreur && erreur ? idErreur : undefined}>
      <legend className="text-[15px] font-medium text-ink">{legende}</legend>
      {aide && <p className="text-sm text-ink-soft">{aide}</p>}
      <div className={cx("grid gap-2", colonnes && "sm:grid-cols-2")}>
        {options.map((o) => (
          <label key={o.valeur} className={carteChoix}>
            <input type="radio" name={nom} value={o.valeur} checked={valeur === o.valeur} onChange={() => onChange(o.valeur)} className="h-5 w-5 shrink-0 accent-accent-strong" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {erreur && (
        <p id={idErreur} className="text-sm text-danger">
          {erreur}
        </p>
      )}
    </fieldset>
  );
}

/** Cases à cocher en pastilles (plusieurs choix). */
export function GroupePastilles<T extends string>({
  legende,
  aide,
  options,
  valeurs,
  onChange,
}: {
  legende: string;
  aide?: string;
  options: { valeur: T; label: string }[];
  valeurs: T[];
  onChange: (v: T[]) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-[15px] font-medium text-ink">{legende}</legend>
      {aide && <p className="text-sm text-ink-soft">{aide}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const coche = valeurs.includes(o.valeur);
          return (
            <label
              key={o.valeur}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-[15px] has-[:checked]:border-accent-strong has-[:checked]:bg-blush has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-strong/40"
            >
              <input
                type="checkbox"
                checked={coche}
                onChange={() => onChange(coche ? valeurs.filter((v) => v !== o.valeur) : [...valeurs, o.valeur])}
                className="h-4 w-4 accent-accent-strong"
              />
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
