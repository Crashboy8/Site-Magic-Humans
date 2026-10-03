"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, useState } from "react";
import { useAutosavedValue } from "@/components/autosave";
import { Badge, Input, Textarea, cx } from "@/components/ui";
import { DIRECTION_LABELS, KIND_LABELS, WEIGHT_LABELS } from "@/domain/methodology";
import type { Category, CoachComment, Criterion, CriterionDirection, CriterionKind, Weight } from "@/domain/types";
import { InlineComments, type CommentViewer } from "@/features/comments/CommentThread";

const WEIGHTS: Weight[] = [1, 2, 3, 4, 5];

export interface CriterionChange {
  label?: string;
  description?: string;
  kind?: CriterionKind;
  weight?: Weight | null;
  direction?: CriterionDirection;
  categoryId?: string;
}

/** Résumé visuel des paramètres d'un critère (type, poids, direction). */
export function CriterionBadges({ criterion }: { criterion: Pick<Criterion, "kind" | "weight" | "direction"> }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {criterion.kind === "DEALBREAKER" ? (
        <Badge tone="accent">⛔ Éliminatoire</Badge>
      ) : (
        <Badge>
          Poids {criterion.weight} · {WEIGHT_LABELS[criterion.weight ?? 3]}
        </Badge>
      )}
      {criterion.direction === "AWAY_FROM" ? <Badge tone="accent">↩ Pour éviter</Badge> : <Badge tone="sage">→ Pour aller vers</Badge>}
    </span>
  );
}

function Segmented<T extends string | number>({
  legend,
  value,
  options,
  onChange,
  hint,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (v: T) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <fieldset className="space-y-1.5" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="text-xs font-medium uppercase tracking-wider text-ink-soft">{legend}</legend>
      <div className="flex flex-wrap gap-1 rounded-full bg-sand p-1">
        {options.map((o) => (
          <label
            key={String(o.value)}
            title={o.title}
            className={cx(
              "cursor-pointer rounded-full px-3 py-1.5 text-sm transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-strong",
              value === o.value ? "bg-paper font-medium text-ink shadow-sm" : "text-ink-soft hover:text-ink",
            )}
          >
            <input type="radio" name={id} className="sr-only" checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
    </fieldset>
  );
}

export function CriterionRow({
  criterion,
  categories,
  readOnly,
  onChange,
  onDelete,
  comments,
  commentViewer,
}: {
  criterion: Criterion;
  categories: Category[];
  readOnly: boolean;
  onChange: (patch: CriterionChange, autosaved?: boolean) => Promise<void>;
  onDelete: () => void;
  comments: CoachComment[];
  commentViewer: CommentViewer | null;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: criterion.id,
    disabled: readOnly,
  });
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useAutosavedValue(criterion.label, (v) => onChange({ label: v.trim() || criterion.label }, true));
  const [description, setDescription] = useAutosavedValue(criterion.description, (v) => onChange({ description: v }, true));
  const detailsId = useId();

  const comment =
    commentViewer !== null ? (
      <InlineComments
        versionId={criterion.versionId}
        targetType="criterion"
        targetId={criterion.id}
        initial={comments}
        viewer={commentViewer}
      />
    ) : null;

  if (readOnly) {
    return (
      <li className="space-y-2 rounded-xl border border-line bg-paper px-4 py-3">
        <p className="text-[16px]">{criterion.label}</p>
        {criterion.description && <p className="text-sm text-ink-soft">{criterion.description}</p>}
        <CriterionBadges criterion={criterion} />
        {comment}
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        "rounded-xl border bg-paper px-3 py-3 sm:px-4",
        isDragging ? "z-10 border-accent shadow-lg" : "border-line",
        criterion.direction === "AWAY_FROM" && "border-l-4 border-l-accent",
        criterion.kind === "DEALBREAKER" && "ring-1 ring-accent/30",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Déplacer « ${criterion.label} »`}
          className="mt-1.5 flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded text-ink-soft hover:bg-sand active:cursor-grabbing"
        >
          <svg viewBox="0 0 12 20" className="h-5 w-3" aria-hidden="true">
            {[3, 9].map((x) => [4, 10, 16].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />))}
          </svg>
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor={`label-${criterion.id}`} className="sr-only">
            Intitulé du critère
          </label>
          <Input
            id={`label-${criterion.id}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={200}
            className="border-transparent bg-transparent px-2 py-1.5 hover:border-ink/15 focus:bg-paper"
          />
          <div className="flex flex-wrap items-center gap-2 px-2">
            <CriterionBadges criterion={criterion} />
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((o) => !o)}
              className="text-sm text-link underline-offset-4 hover:underline"
            >
              {open ? "Fermer les réglages" : "Régler"}
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Supprimer « ${criterion.label} »`}
          className="mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-danger-soft hover:text-danger"
        >
          ✕
        </button>
      </div>

      {open && (
        <div id={detailsId} className="mt-4 space-y-4 border-t border-line pt-4 sm:pl-9">
          <div className="grid gap-4 md:grid-cols-2">
            <Segmented
              legend="Type"
              value={criterion.kind}
              options={[
                { value: "WEIGHTED", label: KIND_LABELS.WEIGHTED.label },
                { value: "DEALBREAKER", label: `⛔ ${KIND_LABELS.DEALBREAKER.label}` },
              ]}
              hint={KIND_LABELS[criterion.kind].hint}
              onChange={(kind) => onChange({ kind, weight: kind === "DEALBREAKER" ? null : (criterion.weight ?? 3) })}
            />
            <Segmented
              legend="Direction"
              value={criterion.direction}
              options={[
                { value: "TOWARDS", label: `→ ${DIRECTION_LABELS.TOWARDS.label}` },
                { value: "AWAY_FROM", label: `↩ ${DIRECTION_LABELS.AWAY_FROM.label}` },
              ]}
              hint={DIRECTION_LABELS[criterion.direction].hint}
              onChange={(direction) => onChange({ direction })}
            />
          </div>
          {criterion.kind === "WEIGHTED" && (
            <Segmented
              legend="Poids"
              value={criterion.weight ?? 3}
              options={WEIGHTS.map((w) => ({ value: w, label: `${w} · ${WEIGHT_LABELS[w]}` }))}
              onChange={(weight) => onChange({ weight })}
            />
          )}
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-1.5">
              <label htmlFor={`desc-${criterion.id}`} className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                Précision (facultatif)
              </label>
              <Textarea
                id={`desc-${criterion.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ce que tu entends exactement par là, un seuil, un exemple…"
                className="min-h-16"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`cat-${criterion.id}`} className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                Catégorie
              </label>
              <select
                id={`cat-${criterion.id}`}
                value={criterion.categoryId}
                onChange={(e) => onChange({ categoryId: e.target.value })}
                className="w-full rounded-xl border border-ink/20 bg-paper px-3 py-2.5 text-[15px]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      {comment && <div className="mt-2 sm:pl-9">{comment}</div>}
    </li>
  );
}
