"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/components/ui";
import { amourPour } from "@/content/amourLangue";
import { useI18n } from "@/i18n/client";
import { COULEUR_RELATION, RELATION_COLORS, RELATION_ICONS, type RelationLook } from "@/domain/relationApparence";
import type { RelationColor, RelationIcon } from "@/domain/types";
import { IconeCrayon, IconeFermer, IconeRelation } from "./IconeRelation";

/** Bouton rond (icône colorée et crayon) qui ouvre le choix, fermé par défaut. */
export function BoutonApparence({
  nom,
  look,
  onChange,
}: {
  nom: string;
  look: RelationLook;
  onChange: (look: RelationLook) => void;
}) {
  const { locale } = useI18n();
  const LOVE_TABLE = amourPour(locale).table;
  const [ouvert, setOuvert] = useState(false);
  const bouton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const fermer = useCallback(() => setOuvert(false), [setOuvert]);
  return (
    <>
      <button
        ref={bouton}
        type="button"
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        aria-controls={ouvert ? id : undefined}
        aria-label={LOVE_TABLE.changeLook(nom)}
        onClick={() => setOuvert(true)}
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper hover:bg-sand"
      >
        <IconeRelation icone={look.icon} couleur={look.color} taille={20} />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cream ring-1 ring-line">
          <IconeCrayon />
        </span>
      </button>
      {ouvert && <PanneauChoix id={id} ancre={bouton} nom={nom} look={look} onChange={onChange} onClose={fermer} />}
    </>
  );
}

function PanneauChoix({
  id,
  ancre,
  nom,
  look,
  onChange,
  onClose,
}: {
  id: string;
  ancre: RefObject<HTMLButtonElement | null>;
  nom: string;
  look: RelationLook;
  onChange: (look: RelationLook) => void;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const LOVE_TABLE = amourPour(locale).table;
  const panneau = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const declencheur = ancre.current;
    const largeur = 300;
    const placer = () => {
      const rect = declencheur?.getBoundingClientRect();
      const mobile = window.matchMedia("(max-width: 639px)").matches;
      if (!rect || mobile) {
        setPlace(null);
        return;
      }
      const left = Math.max(8, Math.min(rect.left + rect.width / 2 - largeur / 2, window.innerWidth - largeur - 8));
      const haut = rect.bottom + 8;
      const bas = window.innerHeight - 8;
      setPlace({ top: Math.min(haut, Math.max(8, bas - 360)), left });
    };
    placer();
    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const noeud = panneau.current;
    const focusables = () =>
      [...(noeud?.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])") ?? [])];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const liste = focusables();
      if (liste.length === 0) return;
      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", placer);
    return () => {
      document.body.style.overflow = precedent;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", placer);
      declencheur?.focus();
    };
  }, [ancre, onClose]);

  return createPortal(
    <>
      <button type="button" aria-label={LOVE_TABLE.closeLook} className="fixed inset-0 z-40 cursor-default bg-ink/25" onClick={onClose} />
      <div
        ref={panneau}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={LOVE_TABLE.changeLook(nom)}
        data-choix-apparence
        className="fixed z-50 max-h-[80vh] overflow-y-auto border border-line bg-paper p-4 shadow-xl inset-x-0 bottom-0 rounded-t-3xl sm:inset-x-auto sm:bottom-auto sm:w-[300px] sm:rounded-2xl"
        style={place ? { top: place.top, left: place.left } : undefined}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">{LOVE_TABLE.changeLook(nom)}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={LOVE_TABLE.closeLook}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-sand"
          >
            <IconeFermer />
          </button>
        </div>
        <ChoixApparence look={look} onChange={onChange} />
      </div>
    </>,
    document.body,
  );
}

/** Grille d'icônes et de teintes. */
export function ChoixApparence({ look, onChange }: { look: RelationLook; onChange: (look: RelationLook) => void }) {
  const { locale } = useI18n();
  const T = amourPour(locale).table;
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <IconeRelation icone={look.icon} couleur={look.color} taille={14} />
          <span>{T.iconLegend}</span>
        </p>
        <div role="group" aria-label={T.chooseIcon} className="flex flex-wrap gap-1">
          {RELATION_ICONS.map((icone) => (
            <ChoixIcone key={icone} icone={icone} look={look} onChange={onChange} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-ink-soft">{T.colorLegend}</p>
        <div role="group" aria-label={T.chooseColor} className="flex flex-wrap gap-1.5">
          {RELATION_COLORS.map((couleur) => (
            <ChoixCouleur key={couleur} couleur={couleur} look={look} onChange={onChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChoixIcone({
  icone,
  look,
  onChange,
}: {
  icone: RelationIcon;
  look: RelationLook;
  onChange: (look: RelationLook) => void;
}) {
  const { locale } = useI18n();
  const LOVE_TABLE = amourPour(locale).table;
  const actif = look.icon === icone;
  return (
    <button
      type="button"
      aria-pressed={actif}
      aria-label={LOVE_TABLE.icons[icone]}
      onClick={() => onChange({ ...look, icon: icone })}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream",
        actif ? "ring-2 ring-ink ring-offset-2" : "hover:bg-sand",
      )}
    >
      <IconeRelation icone={icone} couleur={look.color} taille={18} />
    </button>
  );
}

function ChoixCouleur({
  couleur,
  look,
  onChange,
}: {
  couleur: RelationColor;
  look: RelationLook;
  onChange: (look: RelationLook) => void;
}) {
  const { locale } = useI18n();
  const LOVE_TABLE = amourPour(locale).table;
  const actif = look.color === couleur;
  return (
    <button
      type="button"
      aria-pressed={actif}
      aria-label={LOVE_TABLE.colors[couleur]}
      title={LOVE_TABLE.colors[couleur]}
      onClick={() => onChange({ ...look, color: couleur })}
      className={cx("h-8 w-8 rounded-full", actif && "ring-2 ring-ink ring-offset-2")}
      style={{ background: COULEUR_RELATION[couleur] }}
    />
  );
}
