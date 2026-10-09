import type { Metadata } from "next";
import type { EspaceMessages } from "@/i18n/messages/espace";
import { IMPORT_ACTIF } from "@/content/espace";
import { getFiche, type LectureFiche } from "@/data/fiche";
import { CarteFiche } from "@/features/fiche/CarteFiche";
import { BadgeClient, EncartMotDePasse, LienCodeClient, NoticeClient } from "@/features/client/BadgeClient";
import { CarteOutil } from "@/features/espace/CarteOutil";
import { Icone } from "@/features/espace/Icones";
import { outilsPour, type SectionOutil } from "@/features/espace/outils";
import { getI18n } from "@/i18n/server";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.espace.meta.titre };
}

const LIEN_APPEL =
  "https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=mon-espace&utm_campaign=mon-espace";

const SECTIONS: { cle: SectionOutil; icone: "mallette" | "coeur"; couleur: string }[] = [
  { cle: "pro", icone: "mallette", couleur: "#0E7490" },
  { cle: "coeur", icone: "coeur", couleur: "#C8333A" },
];

/** Lecture de la fiche ; une erreur inattendue ne doit pas casser l'accueil. */
async function lireFiche(userId: string): Promise<LectureFiche> {
  try {
    return await getFiche(await supabaseServer(), userId);
  } catch {
    return { absente: true };
  }
}

/** La carte fiche (E.4) : masquée tant que l'import n'est pas actif. */
function zoneFiche(lecture: LectureFiche | null, F: EspaceMessages["fiche"]) {
  if (!IMPORT_ACTIF || !lecture) return null;
  return <CarteFiche lecture={lecture} F={F} />;
}

export default async function MonEspacePage({ searchParams }: PageProps<"/mon-espace">) {
  const user = await requireUser();
  const ESPACE = (await getI18n()).t.espace;
  const outils = outilsPour(ESPACE.outils);
  const lecture = IMPORT_ACTIF ? await lireFiche(user.id) : null;
  const fichePrenom = lecture && !lecture.absente ? (lecture.fiche?.fiche.prenom ?? "") : "";
  const prenom = user.firstName.trim() || fichePrenom;
  const etat = (await searchParams).fiche;
  const notice = etat === "ok" ? ESPACE.notices.ficheOk : etat === "supprimee" ? ESPACE.notices.ficheSupprimee : null;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-4xl italic leading-tight">{ESPACE.bonjour(prenom)}</h1>
        <BadgeClient user={user} />
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">{ESPACE.intro}</p>
      </header>

      {notice && (
        <p role="status" className="rounded-xl border border-sage/30 bg-sage-soft px-4 py-3 text-base text-ink">
          {notice}
        </p>
      )}

      <NoticeClient etat={(await searchParams).client} />

      {zoneFiche(lecture, ESPACE.fiche)}

      {SECTIONS.map((section) => (
        <section key={section.cle} className="space-y-3" aria-labelledby={`section-${section.cle}`}>
          <h2 id={`section-${section.cle}`} className="flex items-center gap-2 font-serif text-[26px] italic leading-tight" style={{ color: section.couleur }}>
            <Icone nom={section.icone} className="h-6 w-6 shrink-0" />
            {ESPACE.sections[section.cle]}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {outils.filter((outil) => outil.section === section.cle).map((outil) => (
              <li key={outil.cle} className="min-w-0">
                <CarteOutil outil={outil} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <LienCodeClient user={user} />
      <EncartMotDePasse user={user} />

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
