import { Badge, formatDate } from "@/components/ui";
import type { Profile, Version } from "@/domain/types";
import { getI18n } from "@/i18n/server";
import { ProfileCardView } from "./ProfileCardActions";

export async function ProfileCard({
  profile,
  versions,
  href,
  editable = false,
}: {
  profile: Profile;
  versions: Version[];
  href?: string;
  /** Boutons Modifier et Supprimer : seulement sur ses propres profils (« Mes profils »). */
  editable?: boolean;
}) {
  const latest = [...versions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const finalized = versions.filter((v) => v.status === "finalisee").length;
  const { t, locale } = await getI18n();
  const p = t.profile;
  return (
    <ProfileCardView
      profile={{ id: profile.id, name: profile.name, description: profile.description, sharedWithCoach: profile.sharedWithCoach }}
      href={href ?? `/profils/${profile.id}/`}
      editable={editable}
    >
      <Badge>{p.versionsCount(versions.length)}</Badge>
      {finalized > 0 && <Badge tone="sage">{p.finalizedCount(finalized)}</Badge>}
      {profile.sharedWithCoach && <Badge tone="accent">{p.sharedBadge}</Badge>}
      {latest && <span>{p.modifiedOn(formatDate(latest.updatedAt, false, locale))}</span>}
    </ProfileCardView>
  );
}
