import Link from "next/link";
import { CompassMark } from "@/components/ui";
import { countUnreadComments } from "@/data/repository";
import { requireUser, supabaseServer } from "@/lib/supabase/server";
import { signOutAction } from "@/features/auth/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await countUnreadComments(await supabaseServer(), user.id).catch(() => 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <header data-chrome className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <CompassMark className="h-9 w-9 text-ink" />
            <span className="font-serif text-2xl italic leading-none">Boussole de décision</span>
          </Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-1 text-[15px]">
            <Link href="/" className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
              Mes profils
            </Link>
            {user.role !== "coach" && (
            <Link
              href="/commentaires/"
              className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink"
            >
              Commentaires
              {unread > 0 && (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent-strong px-1.5 text-xs font-semibold text-white">
                  {unread}
                  <span className="sr-only"> non lu{unread > 1 ? "s" : ""}</span>
                </span>
              )}
            </Link>
            )}
            {user.role === "coach" && (
              <Link href="/coach/" className="rounded-full px-3 py-2 font-medium text-link hover:bg-sand">
                Espace coach
              </Link>
            )}
            <Link href="/compte/" className="rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
              {user.firstName || "Mon compte"}
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="min-h-10 rounded-full px-3 py-2 text-ink-soft hover:bg-sand hover:text-ink">
                Déconnexion
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="contenu" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer data-chrome className="border-t border-line py-6 text-center text-sm text-ink-soft">
        Le score est une boussole, pas un verdict. · Magic Humans
      </footer>
    </div>
  );
}
