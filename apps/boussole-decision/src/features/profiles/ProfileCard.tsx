import Link from "next/link";
import { Badge, formatDate } from "@/components/ui";
import type { Profile, Version } from "@/domain/types";

export function ProfileCard({ profile, versions, href }: { profile: Profile; versions: Version[]; href?: string }) {
  const latest = [...versions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const finalized = versions.filter((v) => v.status === "finalisee").length;
  return (
    <Link
      href={href ?? `/profils/${profile.id}/`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-paper p-6 transition hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md"
    >
      <h3 className="text-2xl italic group-hover:text-accent-deep">{profile.name}</h3>
      {profile.description && <p className="mt-2 line-clamp-2 text-[15px] text-ink-soft">{profile.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-sm text-ink-soft">
        <Badge>
          {versions.length} version{versions.length > 1 ? "s" : ""}
        </Badge>
        {finalized > 0 && <Badge tone="sage">{finalized} finalisée{finalized > 1 ? "s" : ""}</Badge>}
        {latest && <span>· modifié le {formatDate(latest.updatedAt)}</span>}
      </div>
    </Link>
  );
}
