"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { rubriqueActive, versionOuverte, type Rubrique } from "./menuLateral";

/** Rubrique où se trouve la personne : fond corail vif, barre orange sur le côté, texte en gras. */
const ACTIVE = "border-accent bg-corail-soft font-bold text-accent-deep shadow-[inset_0_0_0_1px_rgb(226_104_58/0.25)]";
const LIEN = "flex min-h-11 items-center rounded-r-lg border-l-4 px-3 py-2 text-[15px]";
const REPOS = "border-transparent text-ink-soft hover:bg-sand hover:text-ink";

/**
 * Menu latéral de la Boussole (ordinateur seulement, à partir de 1024 px). Mêmes rubriques que le bandeau du haut,
 * qui reste la navigation sur téléphone : rien ne change là-bas.
 */
export function MenuLateral({
  profilsHref,
  commentaires,
  coach,
  invite,
  prenom,
}: {
  profilsHref: string;
  commentaires: boolean;
  coach: boolean;
  invite: boolean;
  prenom: string;
}) {
  const { t } = useI18n();
  const c = t.common;
  const v = t.version;
  const chemin = usePathname() ?? "/";
  const actif = rubriqueActive(chemin);
  const version = versionOuverte(chemin);

  const rubrique = (cle: Rubrique, href: string, libelle: string) => {
    // Dans une étape de version, c'est l'étape qui est surlignée ; sa rubrique reste simplement en évidence.
    const parent = cle === "profils" && Boolean(version?.etape);
    return (
    <li key={cle}>
      <Link href={href} aria-current={actif === cle && !parent ? "page" : undefined} className={cx(LIEN, parent ? "border-transparent font-medium text-ink hover:bg-sand" : actif === cle ? ACTIVE : REPOS)}>
        {libelle}
      </Link>
    </li>
    );
  };

  return (
    <aside data-chrome className="hidden lg:block">
      <nav aria-label={c.sideNav} className="sticky top-24 max-h-[calc(100vh-7rem)] w-[220px] overflow-y-auto pr-2">
        <ul className="space-y-1">
          {rubrique("espace", "/mon-espace/", c.mySpace)}
          {rubrique("profils", profilsHref, c.myProfiles)}
          {version && (
            <li>
              <ul className="ml-3 space-y-0.5 border-l border-line" aria-label={v.steps}>
                {([
                  ["tableau", v.stepTable],
                  ["resultats", v.stepResults],
                ] as const).map(([etape, libelle]) => (
                  <li key={etape}>
                    <Link
                      href={`/versions/${version.id}/${etape}/`}
                      aria-current={version.etape === etape ? "page" : undefined}
                      className={cx("flex min-h-11 items-center rounded-r-lg border-l-4 px-3 py-1.5 text-[14px]", version.etape === etape ? ACTIVE : REPOS)}
                    >
                      {libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}
          {commentaires && rubrique("commentaires", "/commentaires/", c.comments)}
          {coach && rubrique("coach", "/coach/", c.coachSpace)}
          {invite ? rubrique("sauvegarder", "/sauvegarder/", c.saveShort) : rubrique("compte", "/compte/", prenom || c.myAccount)}
        </ul>
      </nav>
    </aside>
  );
}
