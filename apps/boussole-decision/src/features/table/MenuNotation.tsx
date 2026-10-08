"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/components/ui";
import { AIDE_POURCENTAGE, PAS_POURCENTAGE, auPas } from "@/domain/pourcentage";
import type { CriterionDirection, EvaluationValue } from "@/domain/types";
import { useI18n } from "@/i18n/client";
import { classePourcentage, evaluationClass } from "./styles";

const EVAL_ORDER: EvaluationValue[] = ["oui", "p75", "p50", "p25", "non", "inconnu"];

export function MenuNotation({
  value,
  percent,
  direction,
  readOnly,
  label,
  texts,
  onChange,
}: {
  value: EvaluationValue | null;
  percent?: number;
  direction: CriterionDirection;
  readOnly: boolean;
  label: string;
  texts: { percentOption: string; percentLegend: string; percentValidate: string };
  onChange: (saisie: { value: EvaluationValue; percent?: number } | null) => void;
}) {
  const labels = useI18n().m.evaluationLabels[direction];
  const [ouvert, setOuvert] = useState(false);
  const [curseur, setCurseur] = useState(false);
  const [brouillon, setBrouillon] = useState(percent ?? 50);
  const [saisie, setSaisie] = useState(String(percent ?? 50));
  const bouton = useRef<HTMLButtonElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const titre = useId();
  const enPourcentage = percent !== undefined;
  const texte = enPourcentage ? `${percent} %` : value ? labels[value] : "—";
  const cls = cx(
    "w-full max-w-[148px] rounded-[10px] px-2 py-2 text-center text-sm font-medium",
    enPourcentage ? classePourcentage(percent) : evaluationClass(value, direction),
  );

  useEffect(() => {
    if (!ouvert) return;
    const fermer = (event: MouseEvent) => {
      const cible = event.target as Node;
      if (panneau.current?.contains(cible) || bouton.current?.contains(cible)) return;
      setOuvert(false);
    };
    const touche = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", fermer);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", fermer);
      document.removeEventListener("keydown", touche);
    };
  }, [ouvert]);

  useEffect(() => {
    if (ouvert && curseur) champ.current?.focus();
  }, [ouvert, curseur]);

  if (readOnly) return <span className={cx("inline-block", cls)}>{texte}</span>;

  function ouvrirPourcentage() {
    const depart = percent ?? 50;
    setBrouillon(depart);
    setSaisie(String(depart));
    setCurseur(true);
  }

  function valider() {
    const n = auPas(Number(saisie));
    setBrouillon(n);
    setSaisie(String(n));
    onChange({ value: "p50", percent: n });
    setOuvert(false);
  }

  return (
    <div className="relative inline-block w-full max-w-[148px]">
      <button
        ref={bouton}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={ouvert}
        onClick={() => {
          setOuvert((v) => !v);
          setCurseur(enPourcentage);
        }}
        className={cx("min-h-11 cursor-pointer", cls)}
      >
        {texte}
      </button>
      {ouvert && (
        <div className="fixed inset-0 z-40 sm:contents" role="presentation">
          <button type="button" className="absolute inset-0 bg-ink/20 sm:hidden" onClick={() => setOuvert(false)} tabIndex={-1} aria-hidden />
          <div
            ref={panneau}
            role="dialog"
            aria-labelledby={titre}
            className="fixed inset-x-3 bottom-3 z-50 max-h-[80vh] overflow-auto rounded-2xl border border-line bg-paper p-3 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:z-50 sm:mt-2 sm:w-72 sm:-translate-x-1/2"
          >
            <p id={titre} className="sr-only">
              {label}
            </p>
            <ul className="space-y-1" role="listbox" aria-label={label}>
              <li>
                <Choix
                  actif={!value && !enPourcentage}
                  onClick={() => {
                    onChange(null);
                    setOuvert(false);
                  }}
                >
                  —
                </Choix>
              </li>
              {EVAL_ORDER.map((v) => (
                <li key={v}>
                  <Choix
                    actif={!enPourcentage && value === v}
                    onClick={() => {
                      onChange({ value: v });
                      setOuvert(false);
                    }}
                  >
                    {labels[v]}
                  </Choix>
                </li>
              ))}
            </ul>
            <div className="mt-2 border-t border-line pt-2">
              <Choix actif={enPourcentage || curseur} onClick={ouvrirPourcentage}>
                {texts.percentOption}
              </Choix>
              {curseur && (
                <div className="mt-3 space-y-3 px-1">
                  <p className="text-center font-serif text-3xl italic tabular-nums">{brouillon} %</p>
                  <p className="text-sm text-ink-soft">{AIDE_POURCENTAGE}</p>
                  <input
                    ref={champ}
                    type="range"
                    className="curseur-pourcentage w-full"
                    min={0}
                    max={100}
                    step={PAS_POURCENTAGE}
                    value={brouillon}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={brouillon}
                    aria-label={texts.percentLegend}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setBrouillon(n);
                      setSaisie(String(n));
                    }}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    step={PAS_POURCENTAGE}
                    value={saisie}
                    aria-label={texts.percentLegend}
                    onChange={(e) => {
                      setSaisie(e.target.value);
                      const n = Number(e.target.value);
                      if (Number.isFinite(n)) setBrouillon(auPas(n));
                    }}
                    className="min-h-11 w-full rounded-xl border border-ink/20 bg-paper px-3 text-base text-ink"
                  />
                  <button
                    type="button"
                    onClick={valider}
                    className="min-h-11 w-full rounded-full bg-accent-strong px-4 text-[15px] font-medium text-white hover:bg-accent-deep"
                  >
                    {texts.percentValidate}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Choix({ actif, onClick, children }: { actif: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={actif}
      onClick={onClick}
      className={cx(
        "min-h-11 w-full rounded-xl px-3 text-left text-[15px]",
        actif ? "bg-sand font-semibold text-ink" : "text-ink hover:bg-sand/70",
      )}
    >
      {children}
    </button>
  );
}
