"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { SaveIndicator, SaveStatusProvider, useSaveTracker } from "@/components/autosave";
import { Button, Input, Notice, cx } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  createCategory,
  createCriterion,
  deleteCategory,
  deleteCriterion,
  reorderCriteria,
  updateCategory,
  updateCriterion,
} from "@/data/repository";
import { CATEGORY_BY_KEY, type CriterionTemplate } from "@/domain/methodology";
import type { Category, CoachComment, Criterion } from "@/domain/types";
import type { CommentViewer } from "@/features/comments/CommentThread";
import { CriterionRow, type CriterionChange } from "./CriterionRow";

interface Props {
  versionId: string;
  categories: Category[];
  criteria: Criterion[];
  readOnly: boolean;
  comments: CoachComment[];
  commentViewer: CommentViewer | null;
}

export function CriteriaEditor(props: Props) {
  return (
    <SaveStatusProvider>
      <Editor {...props} />
    </SaveStatusProvider>
  );
}

const announcements = {
  onDragStart: () => `Critère saisi. Utilise les flèches pour le déplacer.`,
  onDragOver: () => `Critère déplacé.`,
  onDragEnd: ({ over }: { over: { id: string | number } | null }) => (over ? `Critère déposé.` : `Déplacement annulé.`),
  onDragCancel: () => `Déplacement annulé.`,
};

function Editor({ versionId, categories: initialCategories, criteria: initialCriteria, readOnly, comments, commentViewer }: Props) {
  const db = supabaseBrowser();
  const { track } = useSaveTracker();
  const [categories, setCategories] = useState(initialCategories);
  const [criteria, setCriteria] = useState(initialCriteria);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, Criterion[]>();
    for (const c of categories) map.set(c.id, []);
    for (const c of [...criteria].sort((a, b) => a.position - b.position)) map.get(c.categoryId)?.push(c);
    return map;
  }, [categories, criteria]);

  const stats = {
    total: criteria.length,
    dealbreakers: criteria.filter((c) => c.kind === "DEALBREAKER").length,
    awayFrom: criteria.filter((c) => c.direction === "AWAY_FROM").length,
  };

  async function guarded<T>(promise: Promise<T>): Promise<T | undefined> {
    setError(null);
    try {
      return await track(promise);
    } catch {
      setError("La dernière modification n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.");
      return undefined;
    }
  }

  async function addCriterion(categoryId: string, template: Omit<CriterionTemplate, "label"> & { label: string }) {
    const list = byCategory.get(categoryId) ?? [];
    const created = await guarded(
      createCriterion(db, versionId, {
        categoryId,
        label: template.label,
        kind: template.kind,
        weight: template.weight,
        direction: template.direction,
        position: list.length ? Math.max(...list.map((c) => c.position)) + 1 : 0,
      }),
    );
    if (created) setCriteria((cs) => [...cs, created]);
  }

  async function changeCriterion(criterion: Criterion, patch: CriterionChange, autosaved = false) {
    const next = { ...patch };
    if (patch.categoryId && patch.categoryId !== criterion.categoryId) {
      const target = byCategory.get(patch.categoryId) ?? [];
      Object.assign(next, { position: target.length ? Math.max(...target.map((c) => c.position)) + 1 : 0 });
    }
    setCriteria((cs) => cs.map((c) => (c.id === criterion.id ? ({ ...c, ...next } as Criterion) : c)));
    const save = updateCriterion(db, criterion.id, next);
    if (autosaved) return save; // déjà suivi par l'enregistrement automatique
    await guarded(save);
  }

  async function removeCriterion(criterion: Criterion) {
    if (!confirm(`Supprimer le critère « ${criterion.label} » ? Ses évaluations seront aussi supprimées.`)) return;
    setCriteria((cs) => cs.filter((c) => c.id !== criterion.id));
    await guarded(deleteCriterion(db, criterion.id));
  }

  async function onDragEnd(categoryId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const list = byCategory.get(categoryId) ?? [];
    const from = list.findIndex((c) => c.id === active.id);
    const to = list.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(list, from, to).map((c, position) => ({ ...c, position }));
    setCriteria((cs) => cs.map((c) => reordered.find((r) => r.id === c.id) ?? c));
    await guarded(reorderCriteria(db, reordered.map((c) => ({ id: c.id, categoryId, position: c.position }))));
  }

  async function addCategory(label: string) {
    const created = await guarded(createCategory(db, versionId, label, Math.max(4, ...categories.map((c) => c.position)) + 1));
    if (created) setCategories((cs) => [...cs, created]);
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-[68px] z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur sm:top-[69px] sm:mx-0 sm:rounded-2xl sm:border">
        <p className="text-[15px] text-ink-soft" aria-live="polite">
          <strong className="font-medium text-ink">{stats.total}</strong> critère{stats.total > 1 ? "s" : ""}
          {stats.dealbreakers > 0 && <> · dont {stats.dealbreakers} éliminatoire{stats.dealbreakers > 1 ? "s" : ""}</>}
          {stats.awayFrom > 0 && <> · {stats.awayFrom} pour éviter</>}
        </p>
        {!readOnly && <SaveIndicator />}
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {categories.map((category, index) => {
        const definition = category.key ? CATEGORY_BY_KEY[category.key] : null;
        const list = byCategory.get(category.id) ?? [];
        const existing = new Set(list.map((c) => c.label.trim().toLowerCase()));
        const suggestions = definition?.examples.filter((e) => !existing.has(e.label.toLowerCase())) ?? [];
        return (
          <section key={category.id} aria-labelledby={`cat-title-${category.id}`} className="space-y-4">
            <header className="space-y-2">
              <p className="font-script text-2xl text-accent-strong">
                {String.fromCharCode(97 + index)}) {definition?.subtitle ?? "Catégorie personnelle"}
              </p>
              {definition || readOnly ? (
                <h2 id={`cat-title-${category.id}`} className="text-3xl italic">
                  {category.label}
                </h2>
              ) : (
                <CustomCategoryTitle
                  category={category}
                  isEmpty={list.length === 0}
                  onRename={(label) => {
                    setCategories((cs) => cs.map((c) => (c.id === category.id ? { ...c, label } : c)));
                    return guarded(updateCategory(db, category.id, { label })).then(() => undefined);
                  }}
                  onDelete={() => {
                    setCategories((cs) => cs.filter((c) => c.id !== category.id));
                    guarded(deleteCategory(db, category.id));
                  }}
                />
              )}
              {definition && (
                <p className="max-w-3xl rounded-xl bg-blush/60 px-4 py-3 text-[15px] leading-relaxed text-ink">
                  <span aria-hidden="true">💡 </span>
                  {definition.question}
                </p>
              )}
            </header>

            {list.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => onDragEnd(category.id, e)}
                accessibility={{
                  announcements,
                  screenReaderInstructions: {
                    draggable:
                      "Pour déplacer un critère, appuie sur Espace ou Entrée, utilise les flèches haut et bas, puis Espace ou Entrée pour le déposer. Échap annule.",
                  },
                }}
              >
                <SortableContext items={list.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {list.map((criterion) => (
                      <CriterionRow
                        key={criterion.id}
                        criterion={criterion}
                        categories={categories}
                        readOnly={readOnly}
                        onChange={(patch, autosaved) => changeCriterion(criterion, patch, autosaved)}
                        onDelete={() => removeCriterion(criterion)}
                        comments={comments.filter((c) => c.targetType === "criterion" && c.targetId === criterion.id)}
                        commentViewer={commentViewer}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-[15px] italic text-ink-soft">Aucun critère dans cette catégorie pour l&apos;instant.</p>
            )}

            {!readOnly && (
              <div className="space-y-3">
                <NewCriterionForm
                  onAdd={(label) => addCriterion(category.id, { label, ...(definition?.defaults ?? { kind: "WEIGHTED", weight: 3, direction: "TOWARDS" }) })}
                />
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-ink-soft">Idées :</span>
                    {suggestions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => addCriterion(category.id, s)}
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-left text-sm transition hover:border-ink/40 hover:text-ink",
                          s.direction === "AWAY_FROM" ? "border-accent/30 bg-blush/60 text-ink-soft" : "border-line bg-paper text-ink-soft",
                        )}
                      >
                        + {s.label}
                        {s.kind === "DEALBREAKER" && <span className="ml-1 text-accent-deep">· éliminatoire</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}

      {!readOnly && <NewCategoryForm onAdd={addCategory} />}
    </div>
  );
}

function NewCriterionForm({ onAdd }: { onAdd: (label: string) => Promise<void> }) {
  const [label, setLabel] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!label.trim()) return;
        setPending(true);
        await onAdd(label.trim());
        setLabel("");
        setPending(false);
      }}
      className="flex gap-2"
    >
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        maxLength={200}
        placeholder="Écris un critère avec tes mots, puis Entrée"
        aria-label="Nouveau critère"
      />
      <Button type="submit" variant="secondary" disabled={pending || !label.trim()} className="shrink-0">
        Ajouter
      </Button>
    </form>
  );
}

function NewCategoryForm({ onAdd }: { onAdd: (label: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  if (!open)
    return (
      <Button type="button" variant="ghost" onClick={() => setOpen(true)}>
        + Créer ma propre catégorie
      </Button>
    );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!label.trim()) return;
        await onAdd(label.trim());
        setLabel("");
        setOpen(false);
      }}
      className="flex max-w-xl gap-2"
    >
      <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Nom de la catégorie" aria-label="Nom de la nouvelle catégorie" autoFocus />
      <Button type="submit" variant="secondary" disabled={!label.trim()} className="shrink-0">
        Créer
      </Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="shrink-0">
        Annuler
      </Button>
    </form>
  );
}

function CustomCategoryTitle({
  category,
  isEmpty,
  onRename,
  onDelete,
}: {
  category: Category;
  isEmpty: boolean;
  onRename: (label: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(category.label);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        id={`cat-title-${category.id}`}
        value={label}
        maxLength={60}
        aria-label="Nom de la catégorie"
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label.trim() && label.trim() !== category.label && onRename(label.trim())}
        className="max-w-md border-transparent bg-transparent px-2 font-serif text-3xl italic hover:border-ink/15"
      />
      {isEmpty && (
        <Button type="button" variant="dangerGhost" onClick={onDelete} className="text-sm">
          Supprimer la catégorie
        </Button>
      )}
    </div>
  );
}
