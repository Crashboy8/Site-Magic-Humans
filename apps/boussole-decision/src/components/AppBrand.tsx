import Link from "next/link";
import { CompassMark } from "@/components/ui";
import type { Locale } from "@/i18n/config";

const titleClass = "whitespace-nowrap font-serif text-xl italic leading-none sm:text-2xl";

function Mark() {
  return <CompassMark className="h-8 w-8 shrink-0 text-ink sm:h-9 sm:w-9" />;
}

/**
 * Titre de l'en-tête. Le thème amour (marque déjà posée sur la page) affiche « Amour »
 * (en anglais : « Relationship Compass ») et mène à l'accueil amour. Sinon « Pro », vers l'accueil inchangé.
 */
export function AppBrand({ name, locale = "fr" }: { name: string; locale?: Locale }) {
  return (
    <>
      <Link href="/" data-edition="pro" className="flex shrink-0 items-center gap-2.5">
        <Mark />
        <span className={titleClass}>
          {name} <span className="text-ciel">Pro</span>
        </span>
      </Link>
      <Link href="/importer-quiz/?theme=amour" data-edition="amour" className="flex shrink-0 items-center gap-2.5">
        <Mark />
        <span className={titleClass}>
          {locale === "en" ? (
            <>
              <span className="text-framboise">Relationship</span> Compass
            </>
          ) : (
            <>
              {name} <span className="text-framboise">Amour</span>
            </>
          )}
        </span>
      </Link>
    </>
  );
}
