"use client";

import { useI18n } from "@/i18n/client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveTracker {
  status: SaveStatus;
  track: <T>(promise: Promise<T>) => Promise<T>;
}

const SaveContext = createContext<SaveTracker | null>(null);

/** Regroupe l'état d'enregistrement de tous les champs d'une page pour un indicateur unique. */
export function SaveStatusProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0);
  const [lastError, setLastError] = useState(false);
  const [touched, setTouched] = useState(false);

  const track = useCallback(async <T,>(promise: Promise<T>) => {
    setTouched(true);
    setPending((n) => n + 1);
    try {
      const result = await promise;
      setLastError(false);
      return result;
    } catch (error) {
      setLastError(true);
      throw error;
    } finally {
      setPending((n) => n - 1);
    }
  }, []);

  const status: SaveStatus = pending > 0 ? "saving" : lastError ? "error" : touched ? "saved" : "idle";
  const value = useMemo(() => ({ status, track }), [status, track]);

  // Prévenir avant de quitter la page pendant un enregistrement.
  useEffect(() => {
    if (pending === 0) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pending]);

  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
}

export function useSaveTracker(): SaveTracker {
  const ctx = useContext(SaveContext);
  if (!ctx) throw new Error("useSaveTracker doit être utilisé dans <SaveStatusProvider>");
  return ctx;
}

export function SaveIndicator() {
  const { status } = useSaveTracker();
  const { t } = useI18n();
  const content: Record<SaveStatus, ReactNode> = {
    idle: t.common.saved,
    saving: t.common.saving,
    saved: t.common.saved,
    error: t.common.saveError,
  };
  return (
    <p
      role="status"
      aria-live="polite"
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm " +
        (status === "error" ? "bg-danger-soft text-danger" : status === "saving" ? "bg-sand text-ink-soft" : "bg-sage-soft text-sage")
      }
    >
      {content[status]}
    </p>
  );
}

/**
 * Valeur locale enregistrée automatiquement après une pause de frappe.
 * L'écran se met à jour immédiatement ; l'enregistrement suit (« mise à jour optimiste »).
 */
export function useAutosavedValue<T>(initial: T, save: (value: T) => Promise<void>, delay = 800) {
  const { track } = useSaveTracker();
  const [value, setValue] = useState(initial);
  const savedRef = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(value);
  const saveRef = useRef(save);
  const flushRef = useRef<() => void>(() => {});

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const next = latest.current;
    if (Object.is(next, savedRef.current)) return;
    savedRef.current = next;
    track(saveRef.current(next)).catch(() => {
      // Échec (connexion perdue…) : nouvel essai automatique dans quelques secondes.
      savedRef.current = Symbol("échec") as unknown as T;
      if (!timer.current) timer.current = setTimeout(() => flushRef.current(), 5000);
    });
  }, [track]);
  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const update = useCallback(
    (next: T) => {
      latest.current = next;
      setValue(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush],
  );

  // Enregistrer ce qui reste en attente quand le composant disparaît.
  useEffect(() => () => flush(), [flush]);

  return [value, update, flush] as const;
}
