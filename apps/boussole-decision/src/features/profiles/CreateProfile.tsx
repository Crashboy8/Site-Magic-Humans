"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, Notice, Textarea } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createProfile } from "@/data/repository";
import { useI18n } from "@/i18n/client";

export function CreateProfile({ startOpen = false }: { startOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(startOpen);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = useI18n().t.profile;

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        {p.newProfileButton}
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(p.nameRequired);
    setPending(true);
    setError(null);
    try {
      const id = await createProfile(supabaseBrowser(), name.trim(), description.trim(), p.firstVersionName);
      router.push(`/profils/${id}/`);
    } catch {
      setError(p.createFailed);
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-paper p-6">
      <div>
        <h2 className="text-2xl italic">{p.newProfile}</h2>
        <p className="text-ink-soft">{p.newProfileIntro}</p>
      </div>
      <Field label={p.profileName} htmlFor="profile-name">
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus />
      </Field>
      <div className="flex flex-wrap gap-2" aria-label={p.nameSuggestions}>
        {p.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setName(s)}
            className="rounded-full border border-line bg-cream px-3 py-1.5 text-sm text-ink-soft hover:border-ink/30 hover:text-ink"
          >
            {s}
          </button>
        ))}
      </div>
      <Field label={p.profileDescription} htmlFor="profile-desc">
        <Textarea
          id="profile-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={p.profileDescriptionPlaceholder}
          className="min-h-20"
        />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? p.creating : p.create}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          {p.cancel}
        </Button>
      </div>
    </form>
  );
}
