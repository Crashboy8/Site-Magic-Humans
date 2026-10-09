import type { Metadata } from "next";
import type { EspaceMessages } from "@/i18n/messages/espace";
import { IMPORT_ACTIF } from "@/content/espace";
import { getFiche, type LectureFiche } from "@/data/fiche";
import { contenuParcours } from "@/domain/parcours/contenu";
import { CarteFiche } from "@/features/fiche/CarteFiche";
import { BadgeClient, EncartMotDePasse, LienCodeClient, NoticeClient } from "@/features/client/BadgeClient";
import { MenuOutils } from "@/features/espace/MenuOutils";
import { outilsPour } from "@/features/espace/outils";
import { OuJenSuis } from "@/features/parcours/OuJenSuis";
import { etatDuCompte } from "@/features/parcours/serveur";
import { textesParcours } from "@/i18n/messages/parcours";
import { getI18n } from "@/i18n/server";
import { requireUser, supabaseServer } from "@/lib/supabase/server";
import "@/features/parcours/parcours.css";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.espace.meta.titre };
}

const LIEN_APPEL =
  "https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=mon-espace&utm_campaign=mon-espace";

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
  const { t, locale } = await getI18n();
  const ESPACE = t.espace;
  const T = textesParcours(locale);
  const outils = outilsPour(ESPACE.outils, locale);
  const lecture = IMPORT_ACTIF ? await lireFiche(user.id) : null;
  const fichePrenom = lecture && !lecture.absente ? (lecture.fiche?.fiche.prenom ?? "") : "";
  const prenom = user.firstName.trim() || fichePrenom;
  const params = await searchParams;
  const etat = params.fiche;
  const notice = etat === "ok" ? ESPACE.notices.ficheOk : etat === "supprimee" ? ESPACE.notices.ficheSupprimee : null;
  // « Où j'en suis ? » : la position gardée dans le compte (sans la table, le navigateur prend le relais).
  const data = contenuParcours(locale);
  const parcours = await etatDuCompte(user, data, Boolean(lecture && !lecture.absente && lecture.fiche));

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

      <NoticeClient etat={params.client} />

      {/* Deux colonnes sur ordinateur : les outils à gauche, « Ta voie, tu es ici » à droite. Sur téléphone, le parcours d'abord. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <OuJenSuis data={data} variante="panneau" initial={parcours.initial} majCompte={parcours.majCompte} compte={parcours.compte} ficheDeposee={parcours.ficheDeposee} />
        </div>
        <MenuOutils outils={outils} sections={ESPACE.sections} titre={T.espace.menu} className="lg:col-start-1 lg:row-start-1" />
      </div>

      {zoneFiche(lecture, ESPACE.fiche)}

      <LienCodeClient user={user} />
      <EncartMotDePasse user={user} />

      <aside id="appel" className="scroll-mt-6 rounded-[14px] border border-[#F0D2C6] bg-white p-5 text-center">
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
