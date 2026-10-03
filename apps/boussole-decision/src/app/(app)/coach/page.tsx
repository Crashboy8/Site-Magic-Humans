import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PageTitle, formatDate } from "@/components/ui";
import { coachDashboard, listCoachees, listInvitationCodes } from "@/data/repository";
import { InvitationCodes, type CodeUser } from "@/features/coach/InvitationCodes";
import { absoluteUrl } from "@/lib/config";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Espace coach" };

export default async function CoachPage() {
  const user = await requireUser();
  if (user.role !== "coach") notFound();
  const db = await supabaseServer();
  const [dashboard, coachees, codes] = await Promise.all([coachDashboard(db), listCoachees(db, user.id), listInvitationCodes(db)]);
  const origin = (await headers()).get("origin") ?? undefined;

  const usersByCode: Record<string, CodeUser[]> = {};
  for (const c of coachees) {
    if (!c.invitationCode) continue;
    (usersByCode[c.invitationCode] ??= []).push({ firstName: c.firstName, email: c.email });
  }

  return (
    <>
      <PageTitle eyebrow="Espace coach" title="Tes coachés">
        Tu vois uniquement les profils que chaque coaché a choisi de partager avec toi, en lecture seule. Tu peux y laisser des
        commentaires.
      </PageTitle>

      <section aria-labelledby="coaches" className="mb-14 space-y-4">
        <h2 id="coaches" className="sr-only">
          Coachés
        </h2>
        {dashboard.length === 0 ? (
          <p className="text-ink-soft">Personne ne s&apos;est encore inscrit. Génère un code ci-dessous et envoie le lien d&apos;inscription.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
            <table className="w-full min-w-[560px] text-left text-[15px]">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Coaché·e</th>
                  <th scope="col" className="px-5 py-3 font-medium">Dernière activité</th>
                  <th scope="col" className="px-5 py-3 font-medium">Profils partagés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {dashboard.map((c) => (
                  <tr key={c.id} className="hover:bg-cream">
                    <td className="px-5 py-4">
                      <Link href={`/coach/${c.id}/`} className="font-serif text-xl italic text-ink hover:text-accent-deep hover:underline">
                        {c.firstName || c.email}
                      </Link>
                      <p className="text-sm text-ink-soft">{c.email}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{formatDate(c.lastActivityAt)}</td>
                    <td className="px-5 py-4">
                      {c.sharedProfiles > 0 ? (
                        <Badge tone="sage">
                          {c.sharedProfiles} profil{c.sharedProfiles > 1 ? "s" : ""} partagé{c.sharedProfiles > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge>Rien de partagé</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="codes" className="space-y-4">
        <div>
          <h2 id="codes" className="text-3xl italic">
            Codes d&apos;invitation
          </h2>
          <p className="max-w-2xl text-ink-soft">
            Génère un code par coaché. Le lien copié pré-remplit le code sur la page d&apos;inscription. Un code non utilisé peut être
            désactivé à tout moment.
          </p>
        </div>
        <InvitationCodes coachId={user.id} codes={codes} usersByCode={usersByCode} signupUrl={absoluteUrl("/inscription/", origin)} />
      </section>
    </>
  );
}
