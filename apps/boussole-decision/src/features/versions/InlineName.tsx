"use client";

import { useState } from "react";
import { cx } from "@/components/ui";

/** Titre renommable sur place (clic, puis Entrée pour valider ou Échap pour annuler). */
export function InlineName({
  value,
  onSave,
  label,
  maxLength,
  readOnly,
  className,
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
  label: string;
  maxLength: number;
  readOnly?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [current, setCurrent] = useState(value);
  const [error, setError] = useState(false);

  if (readOnly) return <span className={className}>{current}</span>;

  async function commit() {
    const next = draft.trim();
    setEditing(false);
    if (!next || next === current) return setDraft(current);
    const previous = current;
    setCurrent(next);
    try {
      await onSave(next);
      setError(false);
    } catch {
      setCurrent(previous);
      setDraft(previous);
      setError(true);
    }
  }

  if (editing) {
    return (
      <input
        aria-label={label}
        autoFocus
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setDraft(current);
            setEditing(false);
          }
        }}
        className={cx("w-full rounded-lg border border-accent-strong bg-paper px-2 py-0.5 focus:outline-none", className)}
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setDraft(current);
          setEditing(true);
        }}
        title="Cliquer pour renommer"
        className={cx("-mx-1 rounded-lg px-1 text-left hover:bg-sand/70", className)}
      >
        {current}
        <span className="sr-only"> (renommer)</span>
        <span aria-hidden="true" className="ml-2 align-middle text-base not-italic text-ink-soft/60">
          ✎
        </span>
      </button>
      {error && (
        <span role="alert" className="text-sm text-danger">
          Nom non enregistré
        </span>
      )}
    </span>
  );
}
