"use client";

import { useState } from "react";
import { Button, Notice, Textarea, cx, formatDate } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { addComment, deleteComment } from "@/data/repository";
import type { CoachComment, CommentTarget } from "@/domain/types";

export type CommentViewer = "coach" | "owner";

/**
 * Fil de commentaires du coach sur une version, un critère ou une opportunité.
 * Le coach écrit ; le coaché lit (les nouveaux commentaires sont signalés).
 */
export function CommentThread({
  versionId,
  targetType,
  targetId,
  initial,
  viewer,
  compact = false,
}: {
  versionId: string;
  targetType: CommentTarget;
  targetId: string;
  initial: CoachComment[];
  viewer: CommentViewer;
  compact?: boolean;
}) {
  const [comments, setComments] = useState(initial);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const db = supabaseBrowser();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setPending(true);
    setError(false);
    try {
      const created = await addComment(db, versionId, targetType, targetId, draft.trim());
      setComments((c) => [...c, created]);
      setDraft("");
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    await deleteComment(db, id);
    setComments((c) => c.filter((x) => x.id !== id));
  }

  if (viewer === "owner" && comments.length === 0) return null;

  return (
    <div className={cx("space-y-3", !compact && "rounded-2xl border border-accent/25 bg-blush/50 p-5")}>
      {!compact && (
        <h3 className="font-serif text-2xl italic">{viewer === "coach" ? "Tes commentaires pour ton coaché" : "Commentaires de ton coach"}</h3>
      )}
      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-paper px-4 py-3 text-[15px] shadow-[0_1px_2px_rgba(58,47,36,0.05)]">
              <p className="mb-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <span aria-hidden="true">💬</span>
                <span>{viewer === "coach" ? "Toi" : "Ton coach"}</span>
                <span>· {formatDate(c.createdAt, true)}</span>
                {viewer === "owner" && !c.readAt && (
                  <span className="rounded-full bg-accent-strong px-2 py-0.5 font-medium text-white">Nouveau</span>
                )}
              </p>
              <p className="whitespace-pre-line leading-relaxed">{c.body}</p>
              {viewer === "coach" && (
                <button type="button" onClick={() => remove(c.id)} className="mt-1 text-xs text-ink-soft underline-offset-2 hover:text-danger hover:underline">
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {viewer === "coach" && (
        <form onSubmit={submit} className="space-y-2">
          <label htmlFor={`comment-${targetType}-${targetId}`} className="sr-only">
            Nouveau commentaire
          </label>
          <Textarea
            id={`comment-${targetType}-${targetId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={2000}
            placeholder="Une question, un encouragement, une piste à creuser…"
            className="min-h-20"
          />
          {error && <Notice tone="error">Le commentaire n&apos;a pas pu être envoyé.</Notice>}
          <Button type="submit" variant="secondary" disabled={pending || !draft.trim()}>
            {pending ? "Envoi…" : "Envoyer au coaché"}
          </Button>
        </form>
      )}
    </div>
  );
}

/** Bouton discret qui déplie le fil de commentaires d'un critère ou d'une opportunité. */
export function InlineComments(props: Parameters<typeof CommentThread>[0]) {
  const unread = props.initial.filter((c) => !c.readAt).length;
  const [open, setOpen] = useState(props.viewer === "owner" && unread > 0);
  if (props.viewer === "owner" && props.initial.length === 0) return null;
  const count = props.initial.length;
  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm",
          props.viewer === "owner" && unread > 0 ? "bg-accent-strong text-white" : "bg-sand text-ink-soft hover:text-ink",
        )}
      >
        💬 {count > 0 ? `${count} commentaire${count > 1 ? "s" : ""}` : "Commenter"}
        {props.viewer === "owner" && unread > 0 && <span className="sr-only">, dont {unread} nouveau(x)</span>}
      </button>
      {open && <CommentThread {...props} compact />}
    </div>
  );
}
