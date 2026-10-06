import { CompassMark } from "@/components/ui";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="relative flex min-h-dvh flex-col items-center px-4 py-10 sm:py-16">
      <nav aria-label={t.common.language} className="absolute right-4 top-4">
        <LanguageSwitch />
      </nav>
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        <CompassMark className="h-12 w-12 text-ink" />
        <p className="font-serif text-3xl italic">{t.common.appName}</p>
        <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">{t.common.tagline}</p>
      </header>
      <main className="w-full max-w-md">{children}</main>
      <footer className="mt-auto pt-10 text-center text-sm text-ink-soft">
        <a className="underline-offset-4 hover:underline" href="https://www.magichumans.com/">
          {t.common.backToSite}
        </a>
      </footer>
    </div>
  );
}
