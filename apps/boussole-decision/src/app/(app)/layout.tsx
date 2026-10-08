import Link from "next/link";
import { AppBrand } from "@/components/AppBrand";
import { countUnreadComments } from "@/data/repository";
import { requireUser, supabaseServer } from "@/lib/supabase/server";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await countUnreadComments(await supabaseServer(), user.id).catch(() => 0);
  const { t } = await getI18n();
  const c = t.common;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2"
      >
        {c.skipToContent}
      </a>
      <header data-chrome className="z-30 border-b border-line bg-cream/90 backdrop-blur sm:sticky sm:top-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 sm:py-3">
          <AppBrand name={c.appName} />
          <nav aria-label={c.mainNav} className="-mx-2 flex flex-wrap items-center gap-0.5 text-sm sm:mx-0 sm:gap-1 sm:text-[15px]">
            <Link href="/mon-espace/" className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
              {c.mySpace}
            </Link>
            <Link href="/" className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
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
      <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer data-chrome className="border-t border-line py-6 text-center text-sm text-ink-soft">
        {c.footer}
      </footer>
    </div>
  );
}
