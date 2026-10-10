import Link from "next/link";
import { AppBrand } from "@/components/AppBrand";
import { countUnreadComments, listProfiles, listVersionsForUser } from "@/data/repository";
import { lienMesProfils, uniquementAmour } from "@/domain/editionAmour";
import type { Profile, Version } from "@/domain/types";
import { requireUser, supabaseServer } from "@/lib/supabase/server";
import { LienQuizAmour } from "@/features/amour/LienQuizAmour";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { BarreParcours } from "@/features/espace/BarreParcours";
import { MenuLateral } from "@/features/espace/MenuLateral";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";

/** Profils de la personne, ou vide si la base ne répond pas : l'en-tête pro reste alors le repli. */
async function editionUtilisateur(
  db: Awaited<ReturnType<typeof supabaseServer>>,
  userId: string,
): Promise<{ profiles: Profile[]; versions: Version[] }> {
  try {
    const [profiles, versions] = await Promise.all([listProfiles(db, userId), listVersionsForUser(db, userId)]);
    return { profiles, versions };
  } catch {
    return { profiles: [], versions: [] };
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const db = await supabaseServer();
  const [unread, edition] = await Promise.all([
    countUnreadComments(db, user.id).catch(() => 0),
    editionUtilisateur(db, user.id),
  ]);
  const { t, locale } = await getI18n();
  const c = t.common;
  // Marque posée dans l'en-tête, pas dans la page : « Mes profils » ne repasse pas par l'habillage Pro
  // le temps de la redirection vers le tableau.
  const amour = uniquementAmour(edition.profiles);

  return (
    <div className="flex min-h-dvh flex-col">
      {amour && <span data-mode-amour hidden />}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2"
      >
        {c.skipToContent}
      </a>
      <BarreParcours statut={user.isGuest ? "invite" : "connecte"} outil={amour ? "relation" : "boussole"} />
      <header data-chrome className="z-30 border-b border-line bg-cream/90 backdrop-blur sm:sticky sm:top-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 sm:py-3 lg:max-w-[1400px] lg:px-4">
          <AppBrand name={c.appName} locale={locale} />
          <nav aria-label={c.mainNav} className="-mx-2 flex flex-wrap items-center gap-0.5 text-sm sm:mx-0 sm:gap-1 sm:text-[15px]">
            <LienQuizAmour />
            <Link href="/mon-espace/" className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
              {c.mySpace}
            </Link>
            <Link href={lienMesProfils(edition.profiles, edition.versions)} className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
              {c.myProfiles}
            </Link>
            {user.role !== "coach" && !user.isGuest && (
              <Link
                href="/commentaires/"
                className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink"
              >
                {c.comments}
                {unread > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent-strong px-1.5 text-xs font-semibold text-white">
                    {unread}
                    <span className="sr-only">{c.unread(unread)}</span>
                  </span>
                )}
              </Link>
            )}
            {user.role === "coach" && (
              <Link href="/coach/" className="rounded-full px-3 py-2 font-medium text-link hover:bg-sand">
                {c.coachSpace}
              </Link>
            )}
            {user.isGuest ? (
              <Link
                href="/sauvegarder/"
                className="rounded-full bg-accent-strong px-3 py-1.5 font-medium text-white hover:bg-accent-deep sm:px-4 sm:py-2"
              >
                <span className="sm:hidden">{c.saveShort}</span>
                <span className="hidden sm:inline">{c.saveLong}</span>
              </Link>
            ) : (
              <Link href="/compte/" className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
                {user.firstName || c.myAccount}
              </Link>
            )}
            <SignOutButton isGuest={user.isGuest} />
            <LanguageSwitch className="ml-1" />
          </nav>
        </div>
        {user.isGuest && (
          <div className="hidden border-t border-accent/20 bg-blush px-4 py-2 text-center text-sm text-ink sm:block">
            {c.trialBanner}{" "}
            <Link href="/sauvegarder/" className="font-medium text-link underline underline-offset-4">
              {c.trialBannerLink}
            </Link>
          </div>
        )}
      </header>
      {/* Ordinateur : menu à gauche, contenu élargi jusqu'à 1400 px. Téléphone : le contenu seul, comme avant. */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 lg:gap-8 lg:px-4">
        <MenuLateral
          profilsHref={lienMesProfils(edition.profiles, edition.versions)}
          commentaires={user.role !== "coach" && !user.isGuest}
          coach={user.role === "coach"}
          invite={user.isGuest}
          prenom={user.firstName ?? ""}
        />
        <main id="contenu" className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:max-w-none lg:px-0">
          {children}
        </main>
      </div>
      <footer data-chrome className="border-t border-line py-6 text-center text-sm text-ink-soft">
        {c.footer}
      </footer>
    </div>
  );
}
