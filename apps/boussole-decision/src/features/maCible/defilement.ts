/** Amène le premier champ invalide au centre de l'écran et y place le focus. */
export function defilerVersChamp(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusable = el.matches("input, textarea, select, button") ? el : el.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled]), select, button");
  focusable?.focus({ preventScroll: true });
}
