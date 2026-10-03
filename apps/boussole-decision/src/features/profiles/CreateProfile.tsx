"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, Notice, Textarea } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { createProfile } from "@/data/repository";

const SUGGESTIONS = ["Reconversion 2026", "Retour après congé parental", "Nouveau poste en interne", "Lancement en indépendant"];

export function CreateProfile({ startOpen = false }: { startOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(startOpen);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Nouveau profil
      </Button>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Donne un nom à ce profil.");
    setPending(true);
    setError(null);
    try {
      const id = await createProfile(supabaseBrowser(), name.trim(), description.trim());
      router.push(`/profils/${id}/`);
    } catch {
      setError("Le profil n'a pas pu être créé. Réessaie dans un instant.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-paper p-6">
      <div>
        <h2 className="text-2xl italic">Nouveau profil</h2>
        <p className="text-ink-soft">Un profil correspond à une période de ta vie professionnelle. Tu pourras y créer plusieurs versions.</p>
      </div>
      <Field label="Nom du profil" htmlFor="profile-name">
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoFocus />
      </Field>
      <div className="flex flex-wrap gap-2" aria-label="Suggestions de noms">
        {SUGGESTIONS.map((s) => (
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
      <Field label="Quelques mots sur ce moment (facultatif)" htmlFor="profile-desc">
        <Textarea
          id="profile-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex. : je quitte mon poste actuel en juin et j'hésite entre plusieurs pistes."
          className="min-h-20"
        />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Création…" : "Créer le profil"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
