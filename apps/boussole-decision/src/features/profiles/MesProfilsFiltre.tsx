"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Button, cx, Notice } from "@/components/ui";
import { CLE_FILTRE, filtreActif, filtreUtile, filtreValide, type Categorie, type Filtre } from "@/domain/filtreProfils";
import { startLoveCompassAction } from "@/features/amour/actions";
import { useI18n } from "@/i18n/client";
import { CoeurIcone, MalletteIcone } from "./ProfileCardActions";

export interface CarteRangee {
  id: string;
  carte: ReactNode;
}

const GRILLE = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

function Grille({ cartes }: { cartes: CarteRangee[] }) {
  return (
    <ul className={GRILLE}>
      {cartes.map((c) => (
        <li key={c.id} className="empty:hidden">
          {c.carte}
        </li>
      ))}
    </ul>
  );
}

/**
 * « Mes profils » : filtre Tous, Pro, Amour (mémorisé dans l'adresse et le navigateur),
 * et en vue Tous deux rubriques, pro puis amour. Les cartes arrivent rendues et triées par le serveur.
 */
export function MesProfilsFiltre({
  pro,
  amour,
  depuisAdresse,
  nouveauProfil,
}: {
  pro: CarteRangee[];
  amour: CarteRangee[];
  depuisAdresse: Filtre | null;
  /** Le bouton « + Nouveau profil » habituel. */
  nouveauProfil: ReactNode;
}) {
  const p = useI18n().t.profile;
  const comptes: Record<Categorie, number> = { pro: pro.length, amour: amour.length };
  const [choix, setChoix] = useState<Filtre | null>(depuisAdresse);
  const filtre = filtreActif(choix, null, comptes);
  const utile = filtreUtile(comptes);

  // Sans filtre dans l'adresse, on reprend le dernier choix fait sur ce navigateur.
  useEffect(() => {
    if (depuisAdresse) return;
    let memorise: Filtre | null = null;
    try {
      memorise = filtreValide(window.localStorage.getItem(CLE_FILTRE));
    } catch {
      memorise = null;
    }
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- le choix mémorisé n'existe qu'après l'hydratation */
    if (memorise) setChoix(memorise);
  }, [depuisAdresse]);

  function choisir(f: Filtre) {
    setChoix(f);
    try {
      window.localStorage.setItem(CLE_FILTRE, f);
    } catch {
      // Navigation privée stricte : le choix vaut pour cette page seulement.
    }
    const url = new URL(window.location.href);
    if (f === "tous") url.searchParams.delete("filtre");
    else url.searchParams.set("filtre", f);
    window.history.replaceState(null, "", url);
  }

  const onglets: { f: Filtre; libelle: string; n: number; icone?: ReactNode; actif: string }[] = [
    { f: "tous", libelle: p.filterAll, n: pro.length + amour.length, actif: "border-accent-strong/50 bg-blush text-ink" },
    { f: "pro", libelle: p.filterPro, n: pro.length, icone: <MalletteIcone className="h-4 w-4 text-ciel" />, actif: "border-ciel/50 bg-sky-soft text-ink" },
    { f: "amour", libelle: p.filterLove, n: amour.length, icone: <CoeurIcone className="h-4 w-4 text-framboise" />, actif: "border-framboise/40 bg-framboise-soft text-ink" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="mes-profils" className="text-3xl italic">
          {p.myProfiles}
        </h2>
        {filtre === "amour" ? <NouvelleBoussoleRelation /> : nouveauProfil}
      </div>

      {utile && (
        <div role="group" aria-label={p.filterLabel} data-filtre-profils="" className="flex flex-wrap gap-1.5 sm:gap-2">
          {onglets.map((o) => (
            <button
              key={o.f}
              type="button"
              aria-pressed={filtre === o.f}
              data-filtre={o.f}
              onClick={() => choisir(o.f)}
              className={cx(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-[15px] font-medium transition-colors sm:gap-2 sm:px-4",
                filtre === o.f ? o.actif : "border-line bg-paper text-ink-soft hover:border-ink/25 hover:text-ink",
              )}
            >
              {o.icone}
              <span>{o.libelle}</span>
              <span className={cx("rounded-full px-1.5 text-sm tabular-nums sm:px-2", filtre === o.f ? "bg-paper/80" : "bg-sand")}>{o.n}</span>
            </button>
          ))}
        </div>
      )}

      {!utile ? (
        <Grille cartes={[...pro, ...amour]} />
      ) : filtre === "tous" ? (
        <div className="space-y-10">
          <Rubrique id="rubrique-pro" titre={p.sectionPro} icone={<MalletteIcone className="h-5 w-5 text-ciel" />} fond="bg-sky-soft" cartes={pro} n={pro.length} />
          <Rubrique id="rubrique-amour" titre={p.sectionLove} icone={<CoeurIcone className="h-5 w-5 text-framboise" />} fond="bg-framboise-soft" cartes={amour} n={amour.length} />
        </div>
      ) : (
        <Grille cartes={filtre === "pro" ? pro : amour} />
      )}
    </div>
  );
}

function Rubrique({ id, titre, icone, fond, cartes, n }: { id: string; titre: string; icone: ReactNode; fond: string; cartes: CarteRangee[]; n: number }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h3 id={id} className="flex items-center gap-2.5 text-2xl italic">
        <span className={cx("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full", fond)}>{icone}</span>
        <span>{titre}</span>
        <span className="font-sans text-base not-italic text-ink-soft tabular-nums">({n})</span>
      </h3>
      <Grille cartes={cartes} />
    </section>
  );
}

/** Crée une autre Boussole Relation et ouvre son tableau (sans reprendre la plus récente). */
function NouvelleBoussoleRelation() {
  const p = useI18n().t.profile;
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        disabled={pending}
        data-nouvelle-relation=""
        className="bg-framboise hover:bg-framboise-deep"
        onClick={() =>
          startTransition(async () => {
            setErreur(null);
            const r = await startLoveCompassAction(undefined, undefined, { nouvelle: true });
            if (r?.error) setErreur(p.newLoveCompassFailed);
          })
        }
      >
        {pending ? p.newLoveCompassPending : p.newLoveCompass}
      </Button>
      {erreur && <Notice tone="error">{erreur}</Notice>}
    </div>
  );
}
