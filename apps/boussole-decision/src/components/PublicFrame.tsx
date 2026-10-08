import Link from "next/link";
import type { ReactNode } from "react";
import { AppBrand } from "@/components/AppBrand";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";

/** Bandeau des pages publiques : marque à gauche, lien d'accueil et langues à droite. */
export async function PublicFrame({
  brand,
  tagline,
  mark,
  edition,
  children,
}: {
  brand: string;
  tagline?: string;
  mark?: ReactNode;
  /** Boussole : « Amour » ou « Pro » selon le thème. Ma Cible ne le passe pas. */
  edition?: boolean;
  children: ReactNode;
}) {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-dvh flex-col">
      <header data-chrome className="border-b border-line bg-cream/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 sm:py-3">
          {edition ? (
            <AppBrand name={brand} />
          ) : (
            <Link href="/" className="flex min-w-0 items-center gap-2.5">
              {mark}
              <span className="min-w-0">
                <span className="block font-serif text-xl italic leading-none sm:text-2xl">{brand}</span>
                {tagline && <span className="mt-1 block max-w-md text-xs leading-snug text-ink-soft sm:text-sm">{tagline}</span>}
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Link href="/" data-edition={edition ? "pro" : undefined} className="rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink sm:text-[15px]">
              {t.common.home}
            </Link>
            {edition && (
              <a href="/quiz-amour/" data-edition="amour" className="rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink sm:text-[15px]">
                ← Quiz Amour
              </a>
            )}
            <LanguageSwitch />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer data-chrome className="border-t border-line py-6 text-center text-sm text-ink-soft">{t.common.footer}</footer>
    </div>
  );
}
