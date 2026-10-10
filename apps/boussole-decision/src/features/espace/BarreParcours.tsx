"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cx } from "@/components/ui";
import { CLE_INSTANTANE, lireInstantane } from "@/features/parcours/instantane";
import { MarqueParcours } from "@/features/parcours/Marque";
import { useI18n } from "@/i18n/client";
import { lienCompte, lienConnexion, lienParcours, outilCourant, type StatutCompte } from "./barre";
import { Icone } from "./Icones";
import { outilsPour, type CleOutil, type SectionOutil } from "./outils";

const ORDRE: Record<SectionOutil, CleOutil[]> = {
  pro: ["qcm", "boussole", "cibleur", "carte"],
  coeur: ["amour", "relation"],
};
const SECTIONS: SectionOutil[] = ["pro", "coeur"];

const abonner = (rappel: () => void) => {
  window.addEventListener("storage", rappel);
  return () => window.removeEventListener("storage", rappel);
};
const lireInstantaneBrut = () => {
  try {
    return window.localStorage.getItem(CLE_INSTANTANE);
  } catch {
    return null;
  }
};
const rien = () => () => {};

/**
 * La barre posée en haut de chaque outil : « Mon parcours » (en un geste, où que l'on soit) et « Mes outils » (passer
 * de l'un à l'autre), avec de quoi garder son travail. Seuls les boutons ont un fond plein et un relief : l'étape
 * et les points sont du texte.
 */
export function BarreParcours({ statut, outil }: { statut: StatutCompte; outil?: CleOutil | null }) {
  const { t, locale } = useI18n();
  const B = t.espace.barre;
  const pathname = usePathname();
  const search = useSyncExternalStore(rien, () => window.location.search, () => "");
  const courant = outil === undefined ? outilCourant(pathname, search) : outil;
  const instantane = lireInstantane(useSyncExternalStore(abonner, lireInstantaneBrut, () => null));
  const outils = useMemo(() => outilsPour(t.espace.outils, locale), [t.espace.outils, locale]);
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const idListe = useId();

  // Ferme au clic ailleurs et sur Échap (le focus revient sur le bouton).
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => {
      if (racine.current && !racine.current.contains(e.target as Node)) setOuvert(false);
    };
    const echap = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOuvert(false);
      bouton.current?.focus();
    };
    document.addEventListener("pointerdown", dehors);
    document.addEventListener("keydown", echap);
    return () => {
      document.removeEventListener("pointerdown", dehors);
      document.removeEventListener("keydown", echap);
    };
  }, [ouvert]);

  const etat = instantane
    ? [instantane.fin ? B.fini : instantane.etape ? B.etape(instantane.etape) : null, B.points(instantane.points)].filter(Boolean).join(" · ")
    : B.aucun;

  return (
    <nav aria-label={B.aria} data-chrome className="border-b border-[#EADFC9] bg-[#FFFBF2]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-1.5 sm:px-6">
        <a
          href={lienParcours(statut)}
          className="group flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-[#F0D9A0] bg-[#FFF5D9] py-1 pl-2.5 pr-3 text-left shadow-[0_2px_0_0_rgba(184,130,20,0.3)] transition hover:bg-[#FFEDB8] active:translate-y-px active:shadow-none"
        >
          <Icone nom="fleche" className="h-4 w-4 shrink-0 rotate-180 text-[#7A5200]" />
          <MarqueParcours className="hidden h-7 w-7 shrink-0 min-[420px]:block" />
          <span className="min-w-0 leading-tight">
            <span className="block text-[15px] font-bold text-[#4A3300]">{B.parcours}</span>
            <span className="block truncate text-[12.5px] text-[#6B4E00]">{etat}</span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2">
          {statut !== "connecte" && (
            <a
              href={lienCompte(statut)}
              className="hidden min-h-11 items-center rounded-xl border-2 border-accent-strong bg-white px-3.5 text-[14.5px] font-semibold text-accent-strong shadow-[0_2px_0_0_rgba(179,71,22,0.25)] transition hover:bg-[#FFF1EA] active:translate-y-px active:shadow-none sm:inline-flex"
            >
              {statut === "invite" ? B.sauvegarder : B.creer}
            </a>
          )}
          <div ref={racine} className="relative">
            <button
              ref={bouton}
              type="button"
              aria-expanded={ouvert}
              aria-controls={idListe}
              onClick={() => setOuvert((o) => !o)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-ink/25 bg-white px-3 text-[15px] font-semibold text-ink shadow-[0_2px_0_0_rgba(58,47,36,0.16)] transition hover:border-ink/45 active:translate-y-px active:shadow-none"
            >
              {B.outils}
              <Icone nom="fleche" className={cx("h-4 w-4 shrink-0 transition", ouvert ? "-rotate-90" : "rotate-90")} />
            </button>
            {ouvert && (
              <div
                id={idListe}
                className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh-5rem)] w-[min(23rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-line bg-white p-3 shadow-[0_24px_60px_-24px_rgba(58,47,36,0.55)]"
              >
                {SECTIONS.map((section) => (
                  <section key={section} aria-label={t.espace.sections[section]} className="mb-2">
                    <h2 className="px-1 pb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-soft">{t.espace.sections[section]}</h2>
                    <ul className="space-y-1.5">
                      {ORDRE[section].map((cle) => {
                        const o = outils.find((x) => x.cle === cle);
                        if (!o) return null;
                        const ici = cle === courant;
                        return (
                          <li key={cle}>
                            <a
                              href={o.lien}
                              aria-current={ici ? "page" : undefined}
                              className={cx(
                                "flex min-h-12 items-center gap-3 rounded-xl border p-2 transition hover:shadow-[0_8px_18px_-12px_rgba(58,47,36,0.5)]",
                                ici ? "border-transparent bg-sand" : "border-line bg-white hover:border-ink/30",
                              )}
                            >
                              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: o.fond, color: o.forte }}>
                                <Icone nom={o.icone} className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1 leading-tight">
                                <span className="block font-serif text-[18px] italic text-ink">{o.titre}</span>
                                {ici && (
                                  <span className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold text-ink-soft">
                                    <Icone nom="pin" className="h-3.5 w-3.5" />
                                    {B.ici}
                                  </span>
                                )}
                              </span>
                              {!ici && <Icone nom="fleche" className="h-4 w-4 shrink-0 text-ink-soft" />}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
                <CompteBloc statut={statut} B={B} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Garder son travail : créer un compte, sauvegarder l'essai, ou rouvrir Mon espace. */
function CompteBloc({ statut, B }: { statut: StatutCompte; B: ReturnType<typeof useI18n>["t"]["espace"]["barre"] }) {
  if (statut === "connecte") {
    return (
      <div className="mt-1 rounded-xl bg-sage-soft px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-sage">
          <Icone nom="coche" className="h-4 w-4 shrink-0" />
          {B.compteOk}
        </p>
        <a href={lienCompte(statut)} className="mt-1 inline-flex min-h-9 items-center text-[14px] font-medium text-link underline underline-offset-4">
          {B.espace}
        </a>
      </div>
    );
  }
  return (
    <div className="mt-1 rounded-xl bg-blush px-3 py-3">
      <p className="font-serif text-[19px] italic leading-tight text-ink">{B.compteTitre}</p>
      <p className="mt-1 text-[14px] leading-snug text-ink-soft">{statut === "invite" ? B.compteInvite : B.compteTexte}</p>
      <a
        href={lienCompte(statut)}
        className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-accent-strong px-4 text-[15px] font-semibold text-white shadow-[0_3px_0_0_rgba(143,56,16,0.6)] transition hover:bg-accent-deep active:translate-y-px active:shadow-none"
      >
        {statut === "invite" ? B.sauvegarder : B.creer}
      </a>
      {statut === "visiteur" && (
        <a href={lienConnexion()} className="mt-1 flex min-h-10 items-center justify-center text-[14px] font-medium text-link underline underline-offset-4">
          {B.connecter}
        </a>
      )}
    </div>
  );
}
