import { ButtonLink, CompassMark } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <CompassMark className="h-14 w-14 text-ink" />
      <h1 className="text-4xl italic">{t.common.notFoundTitle}</h1>
      <p className="max-w-md text-ink-soft">{t.common.notFoundText}</p>
      <ButtonLink href="/">{t.common.notFoundBack}</ButtonLink>
    </main>
  );
}
