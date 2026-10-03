"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { deleteProfile, updateProfile } from "@/data/repository";
import type { Profile } from "@/domain/types";
import { InlineName } from "@/features/versions/InlineName";

export function ProfileHeader({ profile, readOnly }: { profile: Profile; readOnly: boolean }) {
  const router = useRouter();
  const db = supabaseBrowser();
  return (
    <header className="mb-10 space-y-3">
      <p className="font-script text-2xl text-accent-strong">Profil</p>
      <h1 className="text-4xl italic sm:text-5xl">
        <InlineName
          value={profile.name}
          label="Nom du profil"
          maxLength={120}
          readOnly={readOnly}
          onSave={(name) => updateProfile(db, profile.id, { name })}
        />
      </h1>
      {profile.description && <p className="max-w-2xl text-[17px] text-ink-soft">{profile.description}</p>}
      {!readOnly && (
        <Button
          type="button"
          variant="dangerGhost"
          className="-ml-3 text-sm"
          onClick={async () => {
            if (!confirm(`Supprimer le profil « ${profile.name} » et toutes ses versions ? Cette action est définitive.`)) return;
            await deleteProfile(db, profile.id);
            router.push("/");
            router.refresh();
          }}
        >
          Supprimer ce profil
        </Button>
      )}
    </header>
  );
}
