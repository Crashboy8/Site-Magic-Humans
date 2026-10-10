// « Où j'en suis ? » et le bloc « Ton aventure » sont deux composants de Mon espace : un événement de la page suffit
// pour que le bloc relise la progression du compte après chaque enregistrement.

export const EVENEMENT_PROGRESSION = "mh:progression";

export function signalerProgression(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENEMENT_PROGRESSION));
}
