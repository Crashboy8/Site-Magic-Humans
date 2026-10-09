import { retourQuizAmour } from "@/domain/editionAmour";
import { getI18n } from "@/i18n/server";

/**
 * Pastille « ← Quiz Amour », au même endroit que « ← Accueil ».
 * Cachée tant que la page ne porte pas la marque amour. Le quiz s'ouvre dans la langue de l'interface.
 */
export async function LienQuizAmour() {
  const lien = retourQuizAmour((await getI18n()).locale);
  return (
    <a
      href={lien.href}
      data-edition="amour"
      className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-sand hover:text-ink sm:text-[15px]"
    >
      {lien.label}
    </a>
  );
}
