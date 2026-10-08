import { RETOUR_QUIZ_AMOUR } from "@/domain/editionAmour";

/**
 * Pastille « ← Quiz Amour », au même endroit que « ← Accueil ».
 * Cachée tant que la page ne porte pas la marque amour.
 */
export function LienQuizAmour() {
  return (
    <a
      href={RETOUR_QUIZ_AMOUR.href}
      data-edition="amour"
      className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink sm:text-[15px]"
    >
      {RETOUR_QUIZ_AMOUR.label}
    </a>
  );
}
