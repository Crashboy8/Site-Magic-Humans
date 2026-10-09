import Link from "next/link";
import { contenuParcours } from "@/domain/parcours/contenu";
import { MarqueParcours } from "@/features/parcours/Marque";
import { textesParcours } from "@/i18n/messages/parcours";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/supabase/server";
import "@/features/parcours/parcours.css";

// « Où j'en suis ? » : page publique, sans compte. Son propre bandeau, et Mon espace quand on est connecté.
export default async function OuJenSuisLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n();
  const T = textesParcours(locale);
  const user = await getCurrentUser();
  const { promesse } = contenuParcours(locale);
  const lien = "inline-flex min-h-11 items-center rounded-full px-3 text-[15px] transition hover:bg-sand";
  return (
    <div className="flex min-h-dvh flex-col bg-cream text-ink">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
        {t.common.skipToContent}
      </a>
      <header data-chrome className="border-b border-line bg-cream/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/ou-j-en-suis/" className="flex min-w-0 items-center gap-2.5">
            <MarqueParcours className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
            <span className="min-w-0">
              <span className="block font-serif text-[22px] italic leading-none sm:text-2xl">{T.marque.nom}</span>
              <span className="mt-1 hidden text-sm leading-snug text-ink-soft sm:block">{T.marque.sousTitre}</span>
            </span>
          </Link>
          <nav aria-label={t.common.mainNav} className="flex shrink-0 items-center gap-0.5">
            <a href="/outils/" className={`${lien} text-ink-soft hover:text-ink`}>
              {T.nav.outils}
            </a>
            {user && (
              <Link href="/mon-espace/" className={`${lien} font-medium text-link`}>
                {T.nav.monEspace}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main id="contenu" className="typo-soignee mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer data-chrome className="border-t border-line px-4 py-6 text-center text-sm text-ink-soft">
        <span className="font-serif text-[16px] italic">«&nbsp;{promesse}&nbsp;»</span>
        <span aria-hidden="true"> · </span>
        {T.pied}
      </footer>
    </div>
  );
}
