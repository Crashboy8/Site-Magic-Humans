import type { Metadata } from "next";
import { ButtonLink, Card } from "@/components/ui";
import { CAMILLE_CATEGORIES, CAMILLE_EVALUATIONS, camilleFor } from "@/content/exemple-camille";
import { getI18n } from "@/i18n/server";
import { TrialButton } from "@/features/auth/forms";
import { DecisionTable } from "@/features/table/DecisionTable";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.example.title };
}

export default async function ExamplePage() {
  const user = await getCurrentUser();
  const { t, m, locale } = await getI18n();
  const x = t.example;
  const camille = camilleFor(locale);
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">{x.eyebrow}</p>
        <h1 className="text-4xl italic sm:text-5xl">{x.heading}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{x.intro}</p>
        <blockquote className="max-w-3xl rounded-xl bg-blush/70 px-5 py-4">
          <p className="text-sm font-medium text-ink-soft">{x.herTalent}</p>
          <p className="mt-1 font-serif text-xl italic">{m.talentSentence(camille.talent)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            <span className="font-medium text-ink">{x.antiLabel}</span> {camille.talent.antiContexte}
          </p>
        </blockquote>
      </header>

      <DecisionTable
        versionId="exemple"
        categories={CAMILLE_CATEGORIES}
        criteria={camille.criteria}
        opportunities={camille.opportunities}
        evaluations={CAMILLE_EVALUATIONS}
        readOnly
        comments={[]}
        commentViewer={null}
      />

      <section aria-labelledby="ressenti" className="max-w-3xl space-y-2">
        <h2 id="ressenti" className="text-3xl italic">
          {x.herFeeling}
        </h2>
        <p className="font-serif text-xl italic leading-relaxed text-ink">
          {locale === "en" ? `“${camille.insight}”` : `« ${camille.insight} »`}
        </p>
        <p className="text-ink-soft">{x.feelingText}</p>
      </section>

      <Card className="max-w-3xl space-y-3 bg-blush/50">
        <h2 className="text-3xl italic">{x.yourTurn}</h2>
        <p className="text-ink-soft">{x.yourTurnText}</p>
        <div className="max-w-sm">{user ? <ButtonLink href="/">{x.goToCompasses}</ButtonLink> : <TrialButton label={x.startTable} />}</div>
      </Card>
    </div>
  );
}
