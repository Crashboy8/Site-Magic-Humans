import { Card, PageTitle } from "@/components/ui";
import { listProfiles, listVersionsForUser } from "@/data/repository";
import { CreateProfile } from "@/features/profiles/CreateProfile";
import { ProfileCard } from "@/features/profiles/ProfileCard";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const user = await requireUser();
  const db = await supabaseServer();
  const [profiles, versions] = await Promise.all([listProfiles(db, user.id), listVersionsForUser(db, user.id)]);

  return (
    <>
      <PageTitle eyebrow={user.firstName ? `Bonjour ${user.firstName},` : "Bonjour,"} title="Tes boussoles">
        Chaque profil correspond à une période de ta vie professionnelle. À l&apos;intérieur, tu compares tes opportunités à partir de
        ce qui compte vraiment pour toi.
      </PageTitle>

      <section aria-labelledby="mes-profils" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="mes-profils" className="text-3xl italic">
            Mes profils
          </h2>
          {profiles.length > 0 && <CreateProfile />}
        </div>

        {profiles.length === 0 ? (
          <div className="max-w-2xl space-y-4">
            <p className="text-ink-soft">
              <span className="font-serif text-2xl italic text-ink">Tout commence ici.</span> Crée ton premier profil, par exemple
              « Reconversion 2026 ». Tu y définiras tes critères, puis tu y compareras tes opportunités.
            </p>
            <CreateProfile startOpen />
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <li key={p.id}>
                <ProfileCard profile={p} versions={versions.filter((v) => v.profileId === p.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="exemple" className="mt-14">
        <Card className="flex flex-col gap-3 border-dashed bg-sand/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="exemple" className="text-2xl italic">
              L&apos;exemple de Camille
            </h2>
            <p className="text-ink-soft">
              Chargée de communication, 34 ans, elle compare trois opportunités. Un modèle à consulter, puis à dupliquer.
            </p>
          </div>
          <p className="shrink-0 rounded-full bg-paper px-4 py-2 text-sm text-ink-soft">Bientôt disponible</p>
        </Card>
      </section>
    </>
  );
}
