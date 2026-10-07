/** Au-delà, on montre le message qui dit combien de temps ça peut prendre. */
export const SEUIL_PATIENCE_MS = 5_000;

export function patienceVisible(ecouleMs: number): boolean {
  return ecouleMs >= SEUIL_PATIENCE_MS;
}

/** Durée écoulée, courte : « 12 s » ou « 1 min 05 s ». */
export function formaterDureeEcoulee(ms: number): string {
  const secondes = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(secondes / 60);
  const reste = secondes % 60;
  if (minutes === 0) return `${reste} s`;
  return `${minutes} min ${String(reste).padStart(2, "0")} s`;
}
