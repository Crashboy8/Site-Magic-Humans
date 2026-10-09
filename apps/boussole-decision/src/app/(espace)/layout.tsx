import Link from "next/link";
import { ESPACE } from "@/content/espace";
import { CompassMark } from "@/components/ui";
import { SignOutButton } from "@/features/auth/SignOutButton";
import { requireUser } from "@/lib/supabase/server";

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col bg-white text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
          <Link href="/mon-espace/" className="flex min-w-0 items-center gap-2.5">
            <CompassMark className="h-8 w-8 shrink-0 text-ink" />
            <span className="font-serif text-xl italic leading-none">{ESPACE.entete.nom}</span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-0.5 text-base">
            <Link href="/compte/" className="inline-flex min-h-11 items-center rounded-full px-3 text-ink-soft hover:bg-sand hover:text-ink">
              {ESPACE.entete.compte}
            </Link>
            {user.role === "coach" && (
              <Link href="/coach/" className="inline-flex min-h-11 items-center rounded-full px-3 font-medium text-link hover:bg-sand">
                {ESPACE.entete.coach}
              </Link>
            )}
            <SignOutButton isGuest={user.isGuest} />
          </nav>
        </div>
        {user.isGuest && (
          <div className="border-t border-accent/20 bg-blush px-4 py-2 text-center text-base text-ink">
            Mode essai&nbsp;: ton travail est gardé sur cet appareil pendant 30 jours.{" "}
            <Link href="/sauvegarder/" className="font-medium text-link underline underline-offset-4">
              Le sauvegarder avec mon email
            </Link>
          </div>
        )}
      </header>
      <main id="contenu" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
