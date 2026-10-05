import Link from "next/link";
import { CompassMark } from "@/components/ui";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { getI18n } from "@/i18n/server";

// Pages consultables sans compte (exemple).
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-cream/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6 sm:py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <CompassMark className="h-8 w-8 text-ink sm:h-9 sm:w-9" />
            <span className="font-serif text-xl italic leading-none sm:text-2xl">{t.common.appName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink sm:text-[15px]">
              {t.common.home}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-line py-6 text-center text-sm text-ink-soft">{t.common.footer}</footer>
    </div>
  );
}
