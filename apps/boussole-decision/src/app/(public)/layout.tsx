import { PublicFrame } from "@/components/PublicFrame";
import { CompassMark } from "@/components/ui";
import { getI18n } from "@/i18n/server";

// Pages consultables sans compte (exemple, import du quiz).
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <PublicFrame brand={t.common.appName} mark={<CompassMark className="h-8 w-8 text-ink sm:h-9 sm:w-9" />}>
      {children}
    </PublicFrame>
  );
}
