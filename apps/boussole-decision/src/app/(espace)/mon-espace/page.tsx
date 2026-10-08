import type { Metadata } from "next";
import { ESPACE, IMPORT_ACTIF } from "@/content/espace";
import { CarteOutil } from "@/features/espace/CarteOutil";
import { Icone } from "@/features/espace/Icones";
import { OUTILS, type SectionOutil } from "@/features/espace/outils";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: ESPACE.meta.titre };

const LIEN_APPEL =
  "https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=mon-espace&utm_campaign=mon-espace";

const SECTIONS: { cle: SectionOutil; titre: string; icone: "mallette" | "coeur"; couleur: string }[] = [
  { cle: "pro", titre: ESPACE.sections.pro, icone: "mallette", couleur: "#0E7490" },
  { cle: "coeur", titre: ESPACE.sections.coeur, icone: "coeur", couleur: "#C8333A" },
];

/** La carte fiche (PR 2) reste masquée tant que l'import n'est pas actif. */
function zoneFiche(): null {
  if (!IMPORT_ACTIF) return null;
  return null;
}

export default async function MonEspacePage() {
  const user = await requireUser();
  const prenom = user.firstName.trim();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl italic leading-tight">{ESPACE.bonjour(prenom)}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">{ESPACE.intro}</p>
      </header>

      {zoneFiche()}

      {SECTIONS.map((section) => (
        <section key={section.cle} className="space-y-3" aria-labelledby={`section-${section.cle}`}>
          <h2 id={`section-${section.cle}`} className="flex items-center gap-2 font-serif text-[26px] italic leading-tight" style={{ color: section.couleur }}>
            <Icone nom={section.icone} className="h-6 w-6 shrink-0" />
            {section.titre}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {OUTILS.filter((outil) => outil.section === section.cle).map((outil) => (
              <li key={outil.cle} className="min-w-0">
                <CarteOutil outil={outil} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <aside className="rounded-[14px] border border-[#F0D2C6] bg-white p-5 text-center">
        <p className="font-serif text-[24px] italic leading-snug sm:text-[28px]">{ESPACE.appel.texte}</p>
        <p className="mb-4 mt-1 text-base text-ink-soft">{ESPACE.appel.detail}</p>
        <a
          href={LIEN_APPEL}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent-strong px-5 text-center text-base font-medium text-white sm:w-auto"
        >
          {ESPACE.appel.bouton}
        </a>
      </aside>
    </div>
  );
}
