import { Notice } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export async function ReadOnlyBanner({ ownerName }: { ownerName: string }) {
  const { t } = await getI18n();
  return (
    <div className="mb-6">
      <Notice>
        👀 {t.common.readOnlyIntro} <strong className="font-medium">{ownerName}</strong>
        {t.common.readOnlyEnd}
      </Notice>
    </div>
  );
}
