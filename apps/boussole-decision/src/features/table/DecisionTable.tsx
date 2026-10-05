"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { SaveIndicator, SaveStatusProvider, useAutosavedValue, useSaveTracker } from "@/components/autosave";
import { Button, ButtonLink, Input, Notice, cx } from "@/components/ui";
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
  updateVersion,
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
import { DEFAULT_WEIGHTS, MAX_WEIGHT, formatScore, rankOpportunities, type OpportunityResult } from "@/domain/scoring";
import type {
  Category,
  CoachComment,
  Criterion,
  Evaluation,
  EvaluationValue,
  Importance,
  ImportanceWeights,
  Opportunity,
} from "@/domain/types";
import { InlineComments, type CommentViewer } from "@/features/comments/CommentThread";
import { IMPORTANCE_CLASS, evaluationClass } from "./styles";

interface Props {
  versionId: string;
  categories: Category[];
  criteria: Criterion[];
  opportunities: Opportunity[];
  evaluations: Evaluation[];
  /** Barème de la version (par défaut : Critique ×5 … Bof ×1, Bonus +1). */
  weights?: ImportanceWeights;
  /** Lien vers la page Résultats (absent pour l'exemple public). */
  resultsHref?: string;
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

function Table({
  versionId,
  readOnly,
  comments,
  commentViewer,
  resultsHref,
  weights: initialWeights = DEFAULT_WEIGHTS,
  ...initial
}: Props) {
  const db = supabaseBrowser();
  const { track } = useSaveTracker();
  const [categories, setCategories] = useState(initial.categories);
  const [criteria, setCriteria] = useState(initial.criteria);
  const [opportunities, setOpportunities] = useState(initial.opportunities);
  const [cells, setCells] = useState(() => new Map(initial.evaluations.map((e) => [key(e.criterionId, e.opportunityId), e.value])));
  const [weights, setWeights] = useState(initialWeights);
  const scrollRef = useRef<HTMLDivElement>(null);
  const theadRef = useRef<HTMLTableSectionElement>(null);
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
  const ranking = useMemo(
    () => rankOpportunities(opportunities, criteria, evaluations, weights),
    [opportunities, criteria, evaluations, weights],
  );
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

  // --- Barème -------------------------------------------------------------------------
  function changeWeights(next: ImportanceWeights) {
    setWeights(next);
    guarded(updateVersion(db, versionId, { importanceWeights: next }));
  }

  const colSpan = sortedOpps.length + 1 + (readOnly ? 0 : 1);
  const commentsFor = (type: "criterion" | "opportunity", id: string) => comments.filter((c) => c.targetType === type && c.targetId === id);

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

      {/* Grand écran : le tableau prend toute la largeur de la fenêtre, le barème se range dans la marge de gauche. */}
      <div className="grid gap-4 xl:mx-[max(calc(50%-50vw+2rem),calc(50%-56rem))] xl:grid-cols-[230px_minmax(0,1fr)] xl:items-start">
        <WeightsPanel weights={weights} readOnly={readOnly} onChange={changeWeights} />
        <div className="min-w-0 space-y-4">
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
                    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
                    o.id === activeOpp?.id ? "bg-ink text-cream" : "bg-paper text-ink-soft border border-line",
                  )}
                >
                  {o.name.length > 22 ? `${o.name.slice(0, 22)}…` : o.name}
                </button>
              ))}
            </div>
          )}

          <FrozenHeader scrollRef={scrollRef} theadRef={theadRef} />
          <div ref={scrollRef} className="overflow-x-auto rounded-2xl border border-line bg-paper">
            <table className="w-full border-separate border-spacing-0 text-[15px]">
              <thead ref={theadRef}>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 w-[45%] min-w-[180px] border-b border-r border-line bg-paper px-3 py-3 text-left font-medium sm:min-w-[300px]"
                  >
                    Critère <span className="font-normal text-ink-soft">· importance</span>
                  </th>
                  {sortedOpps.map((o) => (
                    <th
                      key={o.id}
                      scope="col"
                      className={cx("min-w-[150px] border-b border-l border-line px-3 py-3 text-center align-top font-normal", colClass(o))}
                    >
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
                      <button
                        type="button"
                        onClick={addOpportunity}
                        className="whitespace-nowrap text-[15px] font-medium text-link hover:underline"
                      >
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
                        <th
                          scope="row"
                          className="sticky left-0 z-10 border-b border-r border-line bg-paper px-3 py-2.5 text-left align-top font-normal"
                        >
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
                            <td
                              key={o.id}
                              className={cx("border-b border-l border-line px-2 py-2.5 text-center align-middle", colClass(o))}
                            >
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
                      <td
                        key={o.id}
                        className={cx("border-l border-t-2 border-line border-t-ink px-2 py-4 text-center align-top", colClass(o))}
                      >
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
        </div>
      </div>

      <Legend />

      {resultsHref && opportunities.length > 0 && (
        <div className="flex justify-end">
          <ButtonLink href={resultsHref}>{readOnly ? "Voir les résultats →" : "Voir mes résultats →"}</ButtonLink>
        </div>
      )}
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
  if (readOnly)
    return (
      <span data-opp-name className="block text-center text-[16px] font-semibold leading-snug">
        {opportunity.name}
      </span>
    );
  return (
    <div className="relative">
      <textarea
        aria-label="Nom de l'opportunité"
        value={name}
        rows={1}
        maxLength={120}
        onChange={(e) => setName(e.target.value)}
        className="field-sizing-content w-full min-w-0 resize-none rounded-md bg-transparent px-6 text-center text-[16px] font-semibold leading-snug hover:bg-sand focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Supprimer l'opportunité « ${opportunity.name} »`}
        className="absolute -right-2 -top-1 flex h-7 w-7 items-center justify-center rounded-full text-sm text-ink-soft hover:bg-danger-soft hover:text-danger"
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
  const [label, setLabel] = useAutosavedValue(
    criterion.label,
    (v) => onPatch({ label: v.trim() || criterion.label }, true) as Promise<void>,
  );
  const importance = IMPORTANCE_BY_VALUE[criterion.importance];

  if (readOnly) {
    return (
      <div className="space-y-1.5">
        <p className="leading-snug">{criterion.label}</p>
        <div className="flex flex-wrap gap-1.5">
          <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-medium", IMPORTANCE_CLASS[criterion.importance])}>
            {importance.label}
          </span>
          {criterion.nonNegotiable && (
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs text-danger">🔒 non négociable</span>
          )}
          {criterion.direction === "AWAY_FROM" && (
            <span className="rounded-full bg-blush px-2 py-0.5 text-xs text-accent-deep">↩ à éviter</span>
          )}
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
          className={cx(
            "w-full shrink-0 cursor-pointer appearance-none rounded-full sm:w-[132px] px-2 py-1.5 text-center text-xs font-medium",
            IMPORTANCE_CLASS[criterion.importance],
          )}
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
      {result.status === "non_conforme" && <p className="text-xs font-medium text-danger">⚠️ Ne respecte pas tes non-négociables</p>}
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

/**
 * Ligne des opportunités figée, comme une ligne figée dans un tableur : quand l'en-tête du tableau
 * sort de l'écran, une copie reste collée sous le bandeau du site, alignée sur les colonnes
 * (y compris quand on fait défiler le tableau sur le côté).
 */
function FrozenHeader({
  scrollRef,
  theadRef,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  theadRef: RefObject<HTMLTableSectionElement | null>;
}) {
  const [layout, setLayout] = useState<{
    top: number;
    left: number;
    width: number;
    scrollLeft: number;
    cells: { width: number; label: string }[];
  } | null>(null);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const box = scrollRef.current;
      const row = theadRef.current?.rows[0];
      if (!box || !row) return;
      const chrome = document.querySelector<HTMLElement>("header[data-chrome]");
      const top = chrome && getComputedStyle(chrome).position === "sticky" ? chrome.getBoundingClientRect().height : 0;
      const head = row.getBoundingClientRect();
      const boxRect = box.getBoundingClientRect();
      // Visible seulement quand l'en-tête est passé sous le bandeau et que le tableau occupe encore l'écran.
      if (head.bottom > top || boxRect.bottom < top + 120) {
        setLayout(null);
        return;
      }
      const cells = Array.from(row.cells).map((cell) => ({
        width: cell.getBoundingClientRect().width,
        // Nom de l'opportunité (champ modifiable ou texte en lecture seule) ; vide pour la colonne « + Opportunité ».
        label: cell.querySelector("textarea")?.value ?? cell.querySelector("[data-opp-name]")?.textContent ?? "",
      }));
      setLayout({ top, left: boxRect.left, width: boxRect.width, scrollLeft: box.scrollLeft, cells });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const box = scrollRef.current;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    box?.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    if (theadRef.current) observer.observe(theadRef.current);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      box?.removeEventListener("scroll", schedule);
      observer.disconnect();
    };
  }, [scrollRef, theadRef]);

  if (!layout) return null;
  const [first, ...rest] = layout.cells;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-20 overflow-hidden rounded-b-xl border border-line bg-paper shadow-md"
      style={{ top: layout.top, left: layout.left, width: layout.width }}
    >
      <div className="flex" style={{ transform: `translateX(${-layout.scrollLeft}px)` }}>
        <div className="shrink-0" style={{ width: first.width }} />
        {rest.map((cell, i) =>
          cell.width === 0 ? null : (
            <div
              key={i}
              className="line-clamp-2 shrink-0 border-l border-line px-3 py-2 text-center text-[15px] font-semibold leading-tight"
              style={{ width: cell.width }}
            >
              {cell.label}
            </div>
          ),
        )}
      </div>
      <div
        className="absolute inset-y-0 left-0 flex items-center border-r border-line bg-paper px-3 text-[15px] font-medium"
        style={{ width: first.width }}
      >
        Critère <span className="ml-1 font-normal text-ink-soft">· importance</span>
      </div>
    </div>
  );
}

/** Barème : poids de chaque niveau d'importance, modifiable par la personne. */
function WeightsPanel({
  weights,
  readOnly,
  onChange,
}: {
  weights: ImportanceWeights;
  readOnly: boolean;
  onChange: (next: ImportanceWeights) => void;
}) {
  const [open, setOpen] = useState(false);
  const isDefault = IMPORTANCE_LEVELS.every((l) => weights[l.value] === DEFAULT_WEIGHTS[l.value]);
  const summary = IMPORTANCE_LEVELS.map((l) => `${l.label} ${l.value === "bonus" ? "+" : "×"}${weights[l.value]}`).join(" · ");
  const set = (level: Importance, value: number) => onChange({ ...weights, [level]: Math.min(MAX_WEIGHT, Math.max(0, value)) });

  return (
    <aside aria-labelledby="bareme-titre" className="rounded-2xl border border-line bg-paper p-4 xl:sticky xl:top-24">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="bareme-contenu"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left xl:pointer-events-none"
      >
        <span>
          <span id="bareme-titre" className="block font-serif text-xl italic">
            ⚖️ {readOnly ? "Barème" : "Mon barème"}
          </span>
          <span className="block text-xs text-ink-soft xl:hidden">{summary}</span>
        </span>
        <span aria-hidden className="text-ink-soft xl:hidden">
          {open ? "▴" : "▾"}
        </span>
      </button>

      <div id="bareme-contenu" className={cx("mt-3 space-y-3", open ? "block" : "hidden", "xl:block")}>
        <p className="text-[13px] leading-snug text-ink-soft">
          Le poids de chaque niveau dans le score. {readOnly ? "" : "Ajuste-le à ta façon : le score se recalcule aussitôt."}
        </p>
        <ul className="space-y-1.5">
          {IMPORTANCE_LEVELS.map((l) => {
            const w = weights[l.value];
            const prefix = l.value === "bonus" ? "+" : "×";
            return (
              <li key={l.value} className="flex items-center justify-between gap-2">
                <span className={cx("rounded-full px-2.5 py-1 text-xs font-medium", IMPORTANCE_CLASS[l.value])}>{l.label}</span>
                {readOnly ? (
                  <span className="text-sm font-medium tabular-nums">
                    {prefix}
                    {w}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <IconButton label={`Baisser le poids de « ${l.label} »`} disabled={w <= 0} onClick={() => set(l.value, w - 1)}>
                      −
                    </IconButton>
                    <span className="w-7 text-center text-sm font-medium tabular-nums" aria-live="polite">
                      {prefix}
                      {w}
                    </span>
                    <IconButton
                      label={`Augmenter le poids de « ${l.label} »`}
                      disabled={w >= MAX_WEIGHT}
                      onClick={() => set(l.value, w + 1)}
                    >
                      +
                    </IconButton>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-[12px] leading-snug text-ink-soft">
          <b className="font-medium text-ink">Bonus</b> : ajoute jusqu&apos;à ce nombre de points si c&apos;est là, n&apos;en enlève jamais.
          Un niveau à 0 ne compte pas.
        </p>
        {!readOnly && !isDefault && (
          <button type="button" onClick={() => onChange({ ...DEFAULT_WEIGHTS })} className="text-sm text-link underline underline-offset-4">
            Revenir au barème conseillé
          </button>
        )}
      </div>
    </aside>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink-soft">
      <span>
        <b className="font-medium text-ink">🔒 Non négociable</b> : s&apos;il n&apos;est pas pleinement respecté, l&apos;opportunité est
        signalée et classée après les autres
      </span>
      <span>
        <b className="font-medium text-ink">↩ À éviter</b> : on évalue la présence du risque
      </span>
    </div>
  );
}
