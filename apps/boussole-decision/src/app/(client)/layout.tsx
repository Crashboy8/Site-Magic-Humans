import { CompassMark } from "@/components/ui";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";

// Page publique de l'accès client (/client/) : fond crème, marque « Mon espace », langues en haut.
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-dvh flex-col bg-cream text-ink">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2">
          <CompassMark className="h-8 w-8 shrink-0 text-ink" />
          <span className="min-w-0">
            <span className="block font-serif text-xl italic leading-none">{t.client.marque}</span>
            <span className="block text-xs uppercase tracking-[0.12em] text-ink-soft">Magic Humans</span>
          </span>
        </span>
        <LanguageSwitch />
      </header>
      <main id="contenu" className="typo-soignee mx-auto w-full max-w-md flex-1 px-4 pb-10 pt-2">
        {children}
      </main>
      <footer className="pb-8 text-center text-sm text-ink-soft">
        <a className="underline-offset-4 hover:underline" href="https://www.magichumans.com/">
          {t.common.backToSite}
        </a>
      </footer>
    </div>
  );
}
