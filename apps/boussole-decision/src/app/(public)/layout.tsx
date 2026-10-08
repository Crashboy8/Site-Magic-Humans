import { PublicFrame } from "@/components/PublicFrame";
import { getI18n } from "@/i18n/server";

// Pages consultables sans compte (exemple, import du quiz).
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <PublicFrame edition brand={t.common.appName}>
      {children}
    </PublicFrame>
  );
}
