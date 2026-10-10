"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui";

export interface EntreeSommaire {
  id: string;
  libelle: string;
  sous?: { id: string; libelle: string }[];
}

/** Étape où se trouve la personne : fond corail vif, barre orange sur le côté, texte en gras. */
const ACTIVE = "border-accent bg-corail-soft font-bold text-accent-deep shadow-[inset_0_0_0_1px_rgb(226_104_58/0.25)]";
const ENTREE = "min-h-11 w-full rounded-r-lg border-l-4 px-3 py-2 text-left text-[15px]";

function Liste({
  entrees,
  actif,
  onAller,
  urlPierre,
  parlerPierre,
  appelVisible,
}: {
  entrees: EntreeSommaire[];
  actif: string;
  onAller: (id: string) => void;
  urlPierre: string;
  parlerPierre: string;
  appelVisible: boolean;
}) {
  return (
    <ol className="space-y-1">
      {entrees.map((entree) => (
        <li key={entree.id}>
          <button
            type="button"
            aria-current={actif === entree.id ? "true" : undefined}
            onClick={() => onAller(entree.id)}
            className={cx(ENTREE, actif === entree.id ? ACTIVE : "border-transparent hover:bg-sand")}
          >
            {entree.libelle}
          </button>
          {entree.sous && entree.sous.length > 0 && (
            <ul className="ml-3 space-y-0.5 border-l border-line">
              {entree.sous.map((sous) => (
                <li key={sous.id}>
                  <button
                    type="button"
                    aria-current={actif === sous.id ? "true" : undefined}
                    onClick={() => onAller(sous.id)}
                    className={cx("min-h-11 w-full rounded-r-lg border-l-4 px-3 py-1.5 text-left text-[14px]", actif === sous.id ? ACTIVE : "border-transparent text-ink-soft hover:bg-sand hover:text-ink")}
                  >
                    {sous.libelle}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
      <li>
        <a
          href={urlPierre}
          target="_blank"
          rel="noopener"
          aria-current={appelVisible ? "true" : undefined}
          className={cx(ENTREE, "flex items-center", appelVisible ? ACTIVE : "border-transparent hover:bg-sand")}
        >
          {parlerPierre}
        </a>
      </li>
    </ol>
  );
}

type PropsSommaire = {
  entrees: EntreeSommaire[];
  actif: string;
  onAller: (id: string) => void;
  urlPierre: string;
  parlerPierre: string;
  allerA: string;
};

/** Colonne collante, visible à partir de 1024 px. */
export function ColonneSommaire(props: PropsSommaire) {
  return (
    <aside className="hidden lg:block">
      <nav aria-label={props.allerA} className="sticky top-4 max-h-[calc(100vh-2rem)] w-[270px] overflow-y-auto pr-2">
        <Liste entrees={props.entrees} actif={props.actif} onAller={props.onAller} urlPierre={props.urlPierre} parlerPierre={props.parlerPierre} appelVisible={props.actif === "appel"} />
      </nav>
    </aside>
  );
}

/** Barre « Aller à » sous 1024 px, et son panneau plein écran. */
export function BarreSommaire({
  barreVisible,
  fermer,
  ...props
}: PropsSommaire & { barreVisible: boolean; fermer: string }) {
  const [panneau, setPanneau] = useState(false);
  useEffect(() => {
    if (!panneau) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanneau(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panneau]);
  const aller = (id: string) => {
    setPanneau(false);
    props.onAller(id);
  };
  return (
    <>
      {barreVisible && (
        <div data-ecran-seul className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper px-4 py-2 lg:hidden">
          <button type="button" className="min-h-11 rounded-full border border-ink/20 px-4 text-[15px]" onClick={() => setPanneau(true)}>
            {props.allerA}
          </button>
        </div>
      )}
      {panneau && (
        <div role="dialog" aria-modal="true" aria-label={props.allerA} className="fixed inset-0 z-50 overflow-y-auto bg-paper p-4 lg:hidden">
          <div className="mb-3 flex justify-end">
            <button type="button" className="min-h-11 px-3 text-[15px] underline" onClick={() => setPanneau(false)}>
              {fermer}
            </button>
          </div>
          <nav aria-label={props.allerA}>
            <Liste entrees={props.entrees} actif={props.actif} onAller={aller} urlPierre={props.urlPierre} parlerPierre={props.parlerPierre} appelVisible={props.actif === "appel"} />
          </nav>
        </div>
      )}
    </>
  );
}
