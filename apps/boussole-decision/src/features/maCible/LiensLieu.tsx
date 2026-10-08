import { buttonClass } from "@/components/ui";
import { ANNUAIRES_SALONS, urlRechercheGoogle } from "@/domain/maCible/annuaires";
import type { MaCibleMessages } from "@/i18n/messages/maCible";
import { Icone } from "./Icones";

const lienCompact = buttonClass("secondary", "motion-safe:hover:-translate-y-px w-fit px-4");

/** Recherche Google propre à un lieu, masquée à l'impression. */
export function LiensLieu({ recherche, M }: { recherche: string; M: MaCibleMessages }) {
  return (
    <a data-ecran-seul className={lienCompact} href={urlRechercheGoogle(recherche)} target="_blank" rel="noopener noreferrer">
      <Icone nom="loupe" className="size-4 shrink-0" />
      {M.resultat.chercherGoogle}
    </a>
  );
}

/** Les deux annuaires, une seule fois en bas de « Où la rencontrer ». */
export function EncartAnnuaires({ M }: { M: MaCibleMessages }) {
  const R = M.resultat;
  return (
    <div data-ecran-seul className="space-y-2 rounded-xl bg-sand px-3 py-3">
      <p className="text-[15px]">{R.annuairesIntro}</p>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
        <a className={lienCompact} href={ANNUAIRES_SALONS.france} target="_blank" rel="noopener noreferrer">
          <Icone nom="chapiteau" className="size-4 shrink-0" />
          {R.annuaireSalons}
        </a>
        <a className={lienCompact} href={ANNUAIRES_SALONS.international} target="_blank" rel="noopener noreferrer">
          <Icone nom="boussole" className="size-4 shrink-0" />
          {R.salonsInternational}
        </a>
      </div>
    </div>
  );
}
