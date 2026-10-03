import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PageTitle, formatDate } from "@/components/ui";
import { listCoachees, listInvitationCodes, listProfilesOf } from "@/data/repository";
import { InvitationCodes } from "@/features/coach/InvitationCodes";
import { absoluteUrl } from "@/lib/config";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Espace coach" };

export default async function CoachPage() {
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const db = await supabaseServer();
  const [coachees, codes] = await Promise.all([listCoachees(db, user.id), listInvitationCodes(db)]);
  const profiles = await listProfilesOf(db, coachees.map((c) => c.id));
  const origin = (await headers()).get("origin") ?? undefined;

  return (
    <>
      <PageTitle eyebrow="Espace coach" title="Tes coachés">
        Tu vois les boussoles de chaque personne inscrite avec l&apos;un de tes codes, en lecture seule.
      </PageTitle>

      <section aria-labelledby="coaches" className="mb-14 space-y-4">
        <h2 id="coaches" className="sr-only">
          Coachés
        </h2>
        {coachees.length === 0 ? (
          <p className="text-ink-soft">Personne ne s&apos;est encore inscrit. Crée un code ci-dessous et envoie le lien d&apos;inscription.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coachees.map((c) => {
              const own = profiles.filter((p) => p.userId === c.id);
              const last = own[0]?.updatedAt;
              return (
                <li key={c.id}>
                  <Link
                    href={`/coach/${c.id}/`}
                    className="flex h-full flex-col rounded-2xl border border-line bg-paper p-5 transition hover:border-ink/25 hover:shadow-md"
                  >
                    <p className="font-serif text-2xl italic">{c.firstName || c.email}</p>
                    <p className="text-sm text-ink-soft">{c.email}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-sm text-ink-soft">
                      <Badge>
                        {own.length} profil{own.length > 1 ? "s" : ""}
                      </Badge>
                      {last ? <span>Activité le {formatDate(last)}</span> : <span>Inscrit·e le {formatDate(c.createdAt)}</span>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="codes" className="space-y-4">
        <div>
          <h2 id="codes" className="text-3xl italic">
            Codes d&apos;invitation
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Un code par personne, ou un code à plusieurs utilisations pour un groupe. Le lien copié pré-remplit le code sur la page
            d&apos;inscription.
          </p>
        </div>
        <InvitationCodes coachId={user.id} codes={codes} signupUrl={absoluteUrl("/inscription/", origin)} />
      </section>
    </>
  );
}
