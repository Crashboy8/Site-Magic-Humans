import { buttonClass } from "@/components/ui";
import { ANNUAIRES_SALONS, urlRechercheGoogle } from "@/domain/maCible/annuaires";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { Icone } from "./Icones";

/** Recherche Google et annuaires de salons, masqués à l'impression. */
export function LiensLieu({ recherche, M }: { recherche: string; M: MaCibleMessages }) {
  const R = M.resultat;
  return (
    <div data-ecran-seul className="flex flex-col gap-2 sm:items-end">
      <a className={buttonClass("secondary", "motion-safe:hover:-translate-y-px max-sm:w-full")} href={urlRechercheGoogle(recherche)} target="_blank" rel="noopener noreferrer">
        <Icone nom="loupe" className="size-4 shrink-0" />
        {R.chercherGoogle}
      </a>
      <a className={buttonClass("secondary", "motion-safe:hover:-translate-y-px max-sm:w-full")} href={ANNUAIRES_SALONS.france} target="_blank" rel="noopener noreferrer">
        <Icone nom="chapiteau" className="size-4 shrink-0" />
        {R.annuaireSalons}
      </a>
      <a className={buttonClass("secondary", "min-h-11 px-3 text-[13px] motion-safe:hover:-translate-y-px max-sm:w-full")} href={ANNUAIRES_SALONS.international} target="_blank" rel="noopener noreferrer">
        <Icone nom="boussole" className="size-4 shrink-0" />
        {R.salonsInternational}
      </a>
    </div>
  );
}
