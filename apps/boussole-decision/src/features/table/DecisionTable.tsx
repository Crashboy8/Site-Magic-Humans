"use client";

import { useMemo, useState } from "react";
import { SaveIndicator, SaveStatusProvider, useAutosavedValue, useSaveTracker } from "@/components/autosave";
import { Button, Input, Notice, cx } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  createCategory,
  createCriterion,
  createOpportunity,
  deleteCategory,
  deleteCriterion,
  deleteOpportunity,
  setEvaluation,
  updateCategory,
  updateCriterion,
  updateOpportunity,
  type CriterionInput,
} from "@/data/repository";
import {
  CATEGORY_BY_KEY,
  DIRECTION_LABELS,
  EVALUATION_LABELS,
  IMPORTANCE_BY_VALUE,
  IMPORTANCE_LEVELS,
  NON_NEGOTIABLE_HINT,
  type CriterionTemplate,
} from "@/domain/methodology";
import { formatScore, rankOpportunities, type OpportunityResult } from "@/domain/scoring";
import type { Category, CoachComment, Criterion, Evaluation, EvaluationValue, Opportunity } from "@/domain/types";
import { InlineComments, type CommentViewer } from "@/features/comments/CommentThread";
import { IMPORTANCE_CLASS, evaluationClass } from "./styles";

interface Props {
  versionId: string;
  categories: Category[];
  criteria: Criterion[];
  opportunities: Opportunity[];
  evaluations: Evaluation[];
  readOnly: boolean;
  comments: CoachComment[];
  commentViewer: CommentViewer | null;
}

export function DecisionTable(props: Props) {
  return (
    <SaveStatusProvider>
      <Table {...props} />
    </SaveStatusProvider>
  );
}

const EVAL_ORDER: EvaluationValue[] = ["oui", "p75", "p50", "p25", "non", "inconnu"];
const key = (criterionId: string, opportunityId: string) => `${criterionId}:${opportunityId}`;

function Table({ versionId, readOnly, comments, commentViewer, ...initial }: Props) {
  const db = supabaseBrowser();
  const { track } = useSaveTracker();
  const [categories, setCategories] = useState(initial.categories);
  const [criteria, setCriteria] = useState(initial.criteria);
  const [opportunities, setOpportunities] = useState(initial.opportunities);
  const [cells, setCells] = useState(() => new Map(initial.evaluations.map((e) => [key(e.criterionId, e.opportunityId), e.value])));
  const [mobileIndex, setMobileIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const evaluations = useMemo<Evaluation[]>(
    () =>
      [...cells.entries()].map(([k, value]) => {
        const [criterionId, opportunityId] = k.split(":");
        return { criterionId, opportunityId, value };
      }),
    [cells],
  );
  const ranking = useMemo(() => rankOpportunities(opportunities, criteria, evaluations), [opportunities, criteria, evaluations]);
  const resultById = new Map(ranking.map((r, i) => [r.opportunity.id, { result: r, rank: i + 1 }]));

  const byCategory = useMemo(() => {
    const map = new Map<string, Criterion[]>(categories.map((c) => [c.id, []]));
    for (const c of [...criteria].sort((a, b) => a.position - b.position)) map.get(c.categoryId)?.push(c);
    return map;
  }, [categories, criteria]);

  const sortedOpps = [...opportunities].sort((a, b) => a.position - b.position);
  const activeOpp = sortedOpps[Math.min(mobileIndex, sortedOpps.length - 1)];
  const colClass = (o: Opportunity) => (o.id === activeOpp?.id ? "" : "hidden sm:table-cell");

  async function guarded<T>(promise: Promise<T>): Promise<T | undefined> {
    setError(null);
    try {
      return await track(promise);
    } catch {
      setError("La dernière modification n'a pas pu être enregistrée. Vérifie ta connexion et réessaie.");
      return undefined;
    }
  }

  // --- Critères -------------------------------------------------------------------
  async function addCriterion(category: Category, template: Omit<CriterionTemplate, "label"> & { label: string }) {
    const list = byCategory.get(category.id) ?? [];
    const created = await guarded(
      createCriterion(db, versionId, {
        categoryId: category.id,
        label: template.label,
        importance: template.importance,
        nonNegotiable: template.nonNegotiable,
        direction: template.direction,
        position: list.length ? Math.max(...list.map((c) => c.position)) + 1 : 0,
      }),
    );
    if (created) setCriteria((cs) => [...cs, created]);
  }

  function patchCriterion(c: Criterion, patch: Partial<CriterionInput>, alreadyTracked = false) {
    setCriteria((cs) => cs.map((x) => (x.id === c.id ? ({ ...x, ...patch } as Criterion) : x)));
    const save = updateCriterion(db, c.id, patch);
    return alreadyTracked ? save : guarded(save).then(() => undefined);
  }

  async function removeCriterion(c: Criterion) {
    if (!confirm(`Supprimer le critère « ${c.label} » et ses évaluations ?`)) return;
    setCriteria((cs) => cs.filter((x) => x.id !== c.id));
    await guarded(deleteCriterion(db, c.id));
  }

  async function moveCriterion(c: Criterion, delta: -1 | 1) {
    const list = byCategory.get(c.categoryId) ?? [];
    const i = list.findIndex((x) => x.id === c.id);
    const other = list[i + delta];
    if (!other) return;
    setCriteria((cs) =>
      cs.map((x) => (x.id === c.id ? { ...x, position: other.position } : x.id === other.id ? { ...x, position: c.position } : x)),
    );
    await guarded(
      Promise.all([updateCriterion(db, c.id, { position: other.position }), updateCriterion(db, other.id, { position: c.position })]),
    );
  }

  // --- Opportunités ----------------------------------------------------------------
  async function addOpportunity() {
    const position = opportunities.length ? Math.max(...opportunities.map((o) => o.position)) + 1 : 0;
    const created = await guarded(createOpportunity(db, versionId, `Opportunité ${opportunities.length + 1}`, position));
    if (created) {
      setOpportunities((os) => [...os, created]);
      setMobileIndex(opportunities.length);
    }
  }

  async function removeOpportunity(o: Opportunity) {
    if (!confirm(`Supprimer l'opportunité « ${o.name} » et toutes ses cases ?`)) return;
    setOpportunities((os) => os.filter((x) => x.id !== o.id));
    setMobileIndex(0);
    await guarded(deleteOpportunity(db, o.id));
  }

  // --- Cases --------------------------------------------------------------------------
  async function setCell(criterionId: string, opportunityId: string, value: EvaluationValue | null) {
    setCells((m) => {
      const next = new Map(m);
      if (value === null) next.delete(key(criterionId, opportunityId));
      else next.set(key(criterionId, opportunityId), value);
      return next;
    });
    await guarded(setEvaluation(db, versionId, criterionId, opportunityId, value));
  }

  // --- Catégories ---------------------------------------------------------------------
  async function addCategory(label: string) {
    const created = await guarded(createCategory(db, versionId, label, Math.max(4, ...categories.map((c) => c.position)) + 1));
    if (created) setCategories((cs) => [...cs, created]);
  }

  const colSpan = sortedOpps.length + 1 + (readOnly ? 0 : 1);
  const commentsFor = (type: "criterion" | "opportunity", id: string) =>
    comments.filter((c) => c.targetType === type && c.targetId === id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-ink-soft" aria-live="polite">
          <strong className="font-medium text-ink">{criteria.length}</strong> critère{criteria.length > 1 ? "s" : ""} ·{" "}
          <strong className="font-medium text-ink">{opportunities.length}</strong> opportunité{opportunities.length > 1 ? "s" : ""}
        </p>
        {!readOnly && <SaveIndicator />}
      </div>
      {error && <Notice tone="error">{error}</Notice>}

      {sortedOpps.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:hidden" role="tablist" aria-label="Opportunité affichée">
          {sortedOpps.map((o, i) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={o.id === activeOpp?.id}
              onClick={() => setMobileIndex(i)}
              className={cx(
                "shrink-0 rounded-full px-4 py-2 text-sm",
                o.id === activeOpp?.id ? "bg-ink text-cream" : "bg-paper text-ink-soft border border-line",
              )}
            >
              {o.name.length > 22 ? `${o.name.slice(0, 22)}…` : o.name}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full border-separate border-spacing-0 text-[15px]">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-20 w-[45%] min-w-[180px] border-b border-r border-line bg-paper px-3 py-3 text-left font-medium sm:min-w-[300px]">
                Critère <span className="font-normal text-ink-soft">· importance</span>
              </th>
              {sortedOpps.map((o) => (
                <th key={o.id} scope="col" className={cx("min-w-[150px] border-b border-l border-line px-3 py-3 text-left align-top font-normal", colClass(o))}>
                  <OpportunityHeader
                    opportunity={o}
                    readOnly={readOnly}
                    onRename={(name) => {
                      setOpportunities((os) => os.map((x) => (x.id === o.id ? { ...x, name } : x)));
                      return updateOpportunity(db, o.id, { name });
                    }}
                    onDelete={() => removeOpportunity(o)}
                  />
                  {commentViewer && (
                    <div className="mt-2">
                      <InlineComments
                        versionId={versionId}
                        targetType="opportunity"
                        targetId={o.id}
                        initial={commentsFor("opportunity", o.id)}
                        viewer={commentViewer}
                      />
                    </div>
                  )}
                </th>
              ))}
              {!readOnly && (
                <th scope="col" className="border-b border-l border-line px-3 py-3 text-left font-normal">
                  <button type="button" onClick={addOpportunity} className="whitespace-nowrap text-[15px] font-medium text-link hover:underline">
                    + Opportunité
                  </button>
                </th>
              )}
            </tr>
          </thead>

          {categories.map((category) => {
            const definition = category.key ? CATEGORY_BY_KEY[category.key] : null;
            const list = byCategory.get(category.id) ?? [];
            const existing = new Set(list.map((c) => c.label.trim().toLowerCase()));
            const ideas = definition?.examples.filter((e) => !existing.has(e.label.toLowerCase())).slice(0, 6) ?? [];
            if (readOnly && list.length === 0) return null;
            return (
              <tbody key={category.id}>
                <tr>
                  <th scope="rowgroup" colSpan={colSpan} className="border-b border-line bg-sand px-3 py-2.5 text-left">
                    <span className="sticky left-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {definition || readOnly ? (
                        <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink-soft">{category.label}</span>
                      ) : (
                        <CustomCategoryName
                          category={category}
                          canDelete={list.length === 0}
                          onRename={(label) => {
                            setCategories((cs) => cs.map((c) => (c.id === category.id ? { ...c, label } : c)));
                            guarded(updateCategory(db, category.id, { label }));
                          }}
                          onDelete={() => {
                            setCategories((cs) => cs.filter((c) => c.id !== category.id));
                            guarded(deleteCategory(db, category.id));
                          }}
                        />
                      )}
                      {definition && <span className="text-[13px] font-normal text-ink-soft">{definition.subtitle}</span>}
                    </span>
                  </th>
                </tr>
                {list.map((c, i) => (
                  <tr key={c.id} className="group">
                    <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-paper px-3 py-2.5 text-left align-top font-normal">
                      <CriterionCell
                        criterion={c}
                        readOnly={readOnly}
                        isFirst={i === 0}
                        isLast={i === list.length - 1}
                        onPatch={(patch, tracked) => patchCriterion(c, patch, tracked)}
                        onMove={(d) => moveCriterion(c, d)}
                        onDelete={() => removeCriterion(c)}
                      />
                      {commentViewer && (
                        <div className="mt-2">
                          <InlineComments
                            versionId={versionId}
                            targetType="criterion"
                            targetId={c.id}
                            initial={commentsFor("criterion", c.id)}
                            viewer={commentViewer}
                          />
                        </div>
                      )}
                    </th>
                    {sortedOpps.map((o) => {
                      const value = cells.get(key(c.id, o.id)) ?? null;
                      return (
                        <td key={o.id} className={cx("border-b border-l border-line px-2 py-2.5 text-center align-middle", colClass(o))}>
                          <EvaluationSelect
                            value={value}
                            direction={c.direction}
                            readOnly={readOnly}
                            label={`${o.name} — ${c.label}`}
                            onChange={(v) => setCell(c.id, o.id, v)}
                          />
                        </td>
                      );
                    })}
                    {!readOnly && <td className="border-b border-l border-line" />}
                  </tr>
                ))}
                {!readOnly && (
                  <tr>
                    <td colSpan={colSpan} className="border-b border-line px-3 py-2">
                      <AddCriterion
                        categoryLabel={category.label}
                        ideas={ideas}
                        onAdd={(label) =>
                          addCriterion(category, {
                            label,
                            ...(definition?.defaults ?? { importance: "important", nonNegotiable: false, direction: "TOWARDS" }),
                          })
                        }
                        onAddIdea={(idea) => addCriterion(category, idea)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            );
          })}

          {!readOnly && (
            <tbody>
              <tr>
                <td colSpan={colSpan} className="border-b border-line bg-cream/60 px-3 py-2">
                  <div className="sticky left-3 max-w-[calc(100vw-4rem)] sm:max-w-3xl">
                    <NewCategory onAdd={addCategory} />
                  </div>
                </td>
              </tr>
            </tbody>
          )}

          <tfoot>
            <tr>
              <th scope="row" className="sticky left-0 z-10 border-t-2 border-ink bg-paper px-3 py-4 text-left align-top">
                <span className="block font-medium">Score d&apos;alignement</span>
                <span className="block text-[13px] font-normal text-ink-soft">Une boussole, pas un verdict.</span>
              </th>
              {sortedOpps.map((o) => {
                const entry = resultById.get(o.id);
                return (
                  <td key={o.id} className={cx("border-l border-t-2 border-line border-t-ink px-2 py-4 text-center align-top", colClass(o))}>
                    {entry && <ScoreCell result={entry.result} rank={entry.rank} />}
                  </td>
                );
              })}
              {!readOnly && <td className="border-l border-t-2 border-line border-t-ink" />}
            </tr>
          </tfoot>
        </table>
      </div>

      {opportunities.length === 0 && !readOnly && (
        <Notice>
          Ajoute une première opportunité avec le bouton <strong className="font-medium">« + Opportunité »</strong> en haut à droite du
          tableau (par exemple : « Salariée chez… », « Me lancer en indépendante »).
        </Notice>
      )}


      <Legend />
    </div>
  );
}

function OpportunityHeader({
  opportunity,
  readOnly,
  onRename,
  onDelete,
}: {
  opportunity: Opportunity;
  readOnly: boolean;
  onRename: (name: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [name, setName] = useAutosavedValue(opportunity.name, (v) => onRename(v.trim() || opportunity.name));
  if (readOnly) return <span className="block font-serif text-[19px] italic leading-tight">{opportunity.name}</span>;
  return (
    <div className="flex items-start gap-1">
      <textarea
        aria-label="Nom de l'opportunité"
        value={name}
        rows={1}
        maxLength={120}
        onChange={(e) => setName(e.target.value)}
        className="field-sizing-content w-full min-w-0 flex-1 resize-none rounded-md bg-transparent px-1 font-serif text-[19px] italic leading-tight hover:bg-sand focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Supprimer l'opportunité « ${opportunity.name} »`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-danger-soft hover:text-danger"
      >
        ✕
      </button>
    </div>
  );
}

function CriterionCell({
  criterion,
  readOnly,
  isFirst,
  isLast,
  onPatch,
  onMove,
  onDelete,
}: {
  criterion: Criterion;
  readOnly: boolean;
  isFirst: boolean;
  isLast: boolean;
  onPatch: (patch: Partial<CriterionInput>, alreadyTracked?: boolean) => Promise<void> | undefined;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useAutosavedValue(criterion.label, (v) => onPatch({ label: v.trim() || criterion.label }, true) as Promise<void>);
  const importance = IMPORTANCE_BY_VALUE[criterion.importance];

  if (readOnly) {
    return (
      <div className="space-y-1.5">
        <p className="leading-snug">{criterion.label}</p>
        <div className="flex flex-wrap gap-1.5">
          <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-medium", IMPORTANCE_CLASS[criterion.importance])}>{importance.label}</span>
          {criterion.nonNegotiable && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs text-danger">🔒 non négociable</span>}
          {criterion.direction === "AWAY_FROM" && <span className="rounded-full bg-blush px-2 py-0.5 text-xs text-accent-deep">↩ à éviter</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-start">
        <textarea
          aria-label="Intitulé du critère"
          value={label}
          rows={1}
          maxLength={200}
          onChange={(e) => setLabel(e.target.value)}
          className="field-sizing-content w-full min-w-0 flex-1 resize-none rounded-md bg-transparent px-1.5 py-1 leading-snug hover:bg-sand focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <select
          aria-label={`Importance de « ${criterion.label} »`}
          title={importance.hint || undefined}
          value={criterion.importance}
          onChange={(e) => onPatch({ importance: e.target.value as Criterion["importance"] })}
          className={cx("w-full shrink-0 cursor-pointer appearance-none rounded-full sm:w-[132px] px-2 py-1.5 text-center text-xs font-medium", IMPORTANCE_CLASS[criterion.importance])}
        >
          {IMPORTANCE_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-1">
        <Toggle
          on={criterion.nonNegotiable}
          onClick={() => onPatch({ nonNegotiable: !criterion.nonNegotiable })}
          onClass="bg-danger-soft text-danger border-transparent"
          title={NON_NEGOTIABLE_HINT}
        >
          🔒 non négociable
        </Toggle>
        <Toggle
          on={criterion.direction === "AWAY_FROM"}
          onClick={() => onPatch({ direction: criterion.direction === "AWAY_FROM" ? "TOWARDS" : "AWAY_FROM" })}
          onClass="bg-blush text-accent-deep border-transparent"
          title={DIRECTION_LABELS.AWAY_FROM.hint}
        >
          ↩ à éviter
        </Toggle>
        <span className="ml-auto flex gap-0.5 opacity-60 transition group-focus-within:opacity-100 group-hover:opacity-100">
          <IconButton label="Monter" disabled={isFirst} onClick={() => onMove(-1)}>
            ↑
          </IconButton>
          <IconButton label="Descendre" disabled={isLast} onClick={() => onMove(1)}>
            ↓
          </IconButton>
          <IconButton label={`Supprimer « ${criterion.label} »`} onClick={onDelete} danger>
            ✕
          </IconButton>
        </span>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  onClass,
  title,
  children,
}: {
  on: boolean;
  onClick: () => void;
  onClass: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={title}
      onClick={onClick}
      className={cx("min-h-7 rounded-full border px-2.5 text-xs transition", on ? onClass : "border-line text-ink-soft/80 hover:text-ink")}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-soft disabled:opacity-30",
        danger ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-sand hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function EvaluationSelect({
  value,
  direction,
  readOnly,
  label,
  onChange,
}: {
  value: EvaluationValue | null;
  direction: Criterion["direction"];
  readOnly: boolean;
  label: string;
  onChange: (v: EvaluationValue | null) => void;
}) {
  const labels = EVALUATION_LABELS[direction];
  const cls = cx("w-full max-w-[130px] rounded-[10px] px-2 py-2 text-center text-sm font-medium", evaluationClass(value, direction));
  if (readOnly) return <span className={cx("inline-block", cls)}>{value ? labels[value] : "—"}</span>;
  return (
    <select
      aria-label={label}
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || null) as EvaluationValue | null)}
      className={cx("cursor-pointer appearance-none", cls)}
    >
      <option value="">—</option>
      {EVAL_ORDER.map((v) => (
        <option key={v} value={v}>
          {labels[v]}
        </option>
      ))}
    </select>
  );
}

function ScoreCell({ result, rank }: { result: OpportunityResult; rank: number }) {
  const first = rank === 1 && result.status !== "non_conforme" && result.score !== null;
  return (
    <div className="space-y-1">
      <p className="font-serif text-[34px] italic leading-none">{formatScore(result.score)}</p>
      {result.score !== null && (
        <span className={cx("inline-block rounded-full px-2 py-0.5 text-xs", first ? "bg-sage-soft text-sage" : "bg-sand text-ink-soft")}>
          {rank}
          {rank === 1 ? "er" : "e"}
        </span>
      )}
      {result.status === "non_conforme" && (
        <p className="text-xs font-medium text-danger">⚠️ Ne respecte pas tes non-négociables</p>
      )}
      {result.antiContextAlerts.length > 0 && (
        <p className="text-xs font-medium text-danger">
          ⚡ {result.antiContextAlerts.some((a) => a.severity === "ligne_rouge") ? "Ligne rouge franchie" : "Anti-Contexte présent"}
        </p>
      )}
      {result.toVerify.length > 0 && result.evaluatedCount > 0 && (
        <p className="text-xs text-ink-soft">
          {result.toVerify.length} à vérifier
          {result.status === "a_verifier" && " (dont un non-négociable)"}
        </p>
      )}
    </div>
  );
}

function AddCriterion({
  categoryLabel,
  ideas,
  onAdd,
  onAddIdea,
}: {
  categoryLabel: string;
  ideas: CriterionTemplate[];
  onAdd: (label: string) => Promise<void>;
  onAddIdea: (idea: CriterionTemplate) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [pending, setPending] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  return (
    <div className="sticky left-3 max-w-[calc(100vw-4rem)] space-y-2 sm:max-w-3xl">
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!label.trim()) return;
          setPending(true);
          await onAdd(label.trim());
          setLabel("");
          setPending(false);
        }}
      >
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={200}
          aria-label={`Nouveau critère : ${categoryLabel}`}
          placeholder="+ Ajouter un critère (puis Entrée)"
          className="border-dashed bg-transparent py-2 text-[15px]"
        />
        {label.trim() ? (
          <Button type="submit" variant="secondary" disabled={pending} className="shrink-0">
            Ajouter
          </Button>
        ) : (
          ideas.length > 0 && (
            <button
              type="button"
              aria-expanded={showIdeas}
              onClick={() => setShowIdeas((v) => !v)}
              className="shrink-0 rounded-full px-3 text-sm text-ink-soft hover:bg-sand hover:text-ink"
            >
              💡 Idées
            </button>
          )
        )}
      </form>
      {showIdeas && ideas.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {ideas.map((idea) => (
            <button
              key={idea.label}
              type="button"
              onClick={() => onAddIdea(idea)}
              className="rounded-full border border-line bg-cream px-2.5 py-1 text-xs text-ink-soft hover:border-ink/30 hover:text-ink"
            >
              + {idea.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomCategoryName({
  category,
  canDelete,
  onRename,
  onDelete,
}: {
  category: Category;
  canDelete: boolean;
  onRename: (label: string) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(category.label);
  return (
    <span className="flex items-center gap-2">
      <input
        aria-label="Nom de la catégorie"
        value={label}
        maxLength={60}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label.trim() && label.trim() !== category.label && onRename(label.trim())}
        className="rounded bg-transparent px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-ink-soft hover:bg-paper focus:bg-paper focus:outline-none"
      />
      {canDelete && (
        <button type="button" onClick={onDelete} className="text-xs font-normal normal-case text-danger hover:underline">
          Supprimer
        </button>
      )}
    </span>
  );
}

function NewCategory({ onAdd }: { onAdd: (label: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  if (!open)
    return (
      <Button type="button" variant="ghost" onClick={() => setOpen(true)} className="-ml-2 text-link">
        + Ajouter une catégorie de critères
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
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        maxLength={60}
        placeholder="Ex. : Formation, Famille, Créativité…"
        aria-label="Nom de la nouvelle catégorie"
        autoFocus
      />
      <Button type="submit" variant="secondary" disabled={!label.trim()} className="shrink-0">
        Créer
      </Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="shrink-0">
        Annuler
      </Button>
    </form>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-soft">
      {IMPORTANCE_LEVELS.filter((l) => l.weight > 0).map((l) => (
        <span key={l.value}>
          <b className="font-medium text-ink">{l.label}</b> ×{l.weight}
        </span>
      ))}
      <span>
        <b className="font-medium text-ink">Bonus</b> : ajoute des points si c&apos;est là, n&apos;en enlève jamais
      </span>
      <span>
        <b className="font-medium text-ink">🔒 Non négociable</b> : s&apos;il n&apos;est pas pleinement respecté, l&apos;opportunité est signalée et
        classée après les autres
      </span>
      <span>
        <b className="font-medium text-ink">↩ À éviter</b> : on évalue la présence du risque
      </span>
    </div>
  );
}
