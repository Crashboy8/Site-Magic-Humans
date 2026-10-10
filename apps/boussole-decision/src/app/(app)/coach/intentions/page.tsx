import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, PageTitle, formatDate } from "@/components/ui";
import { estOutil, OUTILS_INTENTION } from "@/domain/intention";
import { BoutonTraitee } from "@/features/intention/BoutonTraitee";
import { intentionsCoach } from "@/features/intention/serveur";
import { getI18n } from "@/i18n/server";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.intention.coach.meta };
}

/**
 * coach/intentions : les demandes « Demander l'avis de Pierre », la plus récente en haut, avec un filtre par outil.
 * Chaque question est affichée comme du texte, telle qu'elle a été écrite.
 */
export default async function CoachIntentionsPage({ searchParams }: PageProps<"/coach/intentions">) {
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const brut = (await searchParams).outil;
  const outil = estOutil(brut) ? brut : null;
  const db = await supabaseServer();
  const [demandes, { t, locale }] = await Promise.all([intentionsCoach(db, outil), getI18n()]);
  const I = t.intention;
  const K = I.coach;

  return (
    <>
      <p className="mb-4 text-[15px]">
        <Link href="/coach/" className="text-ink-soft hover:text-ink hover:underline">
          {K.retour}
        </Link>
      </p>
      <PageTitle eyebrow={t.coach.eyebrow} title={K.titre}>
        {K.intro}
      </PageTitle>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="outil" className="block text-[15px] font-medium">
            {K.filtre}
          </label>
          <select
            id="outil"
            name="outil"
            defaultValue={outil ?? ""}
            className="min-h-11 rounded-xl border border-ink/20 bg-paper px-4 py-2 text-[16px] text-ink focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/25"
          >
            <option value="">{K.tous}</option>
            {OUTILS_INTENTION.map((o) => (
              <option key={o} value={o}>
                {I.outils[o]}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary">
          {K.filtrer}
        </Button>
      </form>

      {demandes.length === 0 ? (
        <p className="text-ink-soft">{outil ? K.videFiltre : K.vide}</p>
      ) : (
        <ul className="space-y-3">
          {demandes.map((d) => (
            <li key={d.id} className={`rounded-2xl border border-line p-5 ${d.traiteeLe ? "bg-cream" : "bg-paper"}`}>
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                <Badge tone="accent">{I.outils[d.outil]}</Badge>
                <span>{K.etape(d.etape)}</span>
                <span aria-hidden="true">·</span>
                <span>{K.le(formatDate(d.le, true, locale))}</span>
                {d.traiteeLe && <Badge tone="sage">{K.traiteeLe(formatDate(d.traiteeLe, false, locale))}</Badge>}
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-relaxed text-ink">{d.question}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px]">
                  {d.userId ? (
                    <Link href={`/coach/${d.userId}/`} className="font-medium text-link hover:underline">
                      {d.prenom || d.mail}
                    </Link>
                  ) : (
                    <span className="text-ink-soft">{K.sansCompte}</span>
                  )}{" "}
                  <span className="break-all text-ink-soft">{d.mail}</span>
                  <span className="block text-sm text-ink-soft">{d.accord ? K.accordOui : K.accordNon}</span>
                </p>
                <BoutonTraitee id={d.id} traitee={Boolean(d.traiteeLe)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
