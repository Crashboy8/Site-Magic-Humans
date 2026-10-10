import Link from "next/link";
import { CompassMark } from "@/components/ui";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/supabase/server";

// « Tes données » : page publique, commune à tous les outils. Bandeau Magic Humans, Mon espace quand on est connecté.
export default async function DonneesLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  const user = await getCurrentUser();
  const lien = "inline-flex min-h-11 items-center rounded-full px-3 text-[15px] text-ink-soft hover:bg-sand hover:text-ink";
  return (
    <div className="flex min-h-dvh flex-col bg-cream text-ink">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
        {t.common.skipToContent}
      </a>
      <header className="border-b border-line bg-cream/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <a href="https://www.magichumans.com/" className="flex min-w-0 items-center gap-2.5">
            <CompassMark className="h-8 w-8 shrink-0 text-ink" />
            <span className="font-serif text-xl italic leading-none">Magic Humans</span>
          </a>
          <nav aria-label={t.common.mainNav} className="flex flex-wrap items-center gap-0.5">
            {user ? (
              <Link href="/mon-espace/" className={lien}>
                {t.espace.entete.nom}
              </Link>
            ) : (
              <Link href="/connexion/?suite=%2Ftes-donnees%2F" className={lien}>
                {t.vip.donnees.connexion.bouton}
              </Link>
            )}
            <LanguageSwitch className="ml-1" />
          </nav>
        </div>
      </header>
      <main id="contenu" className="typo-soignee mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
