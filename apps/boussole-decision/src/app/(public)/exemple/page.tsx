import type { Metadata } from "next";
import { ButtonLink, Card } from "@/components/ui";
import {
  CAMILLE,
  CAMILLE_CATEGORIES,
  CAMILLE_CRITERIA,
  CAMILLE_EVALUATIONS,
  CAMILLE_INSIGHT,
  CAMILLE_OPPORTUNITIES,
} from "@/content/exemple-camille";
import { talentSentence } from "@/domain/methodology";
import { TrialButton } from "@/features/auth/forms";
import { DecisionTable } from "@/features/table/DecisionTable";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Un exemple" };

export default async function ExamplePage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">Exemple fictif</p>
        <h1 className="text-4xl italic sm:text-5xl">Le tableau de Camille</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">
          Camille, 34 ans, chargée de communication, hésite entre trois opportunités. Voici le tableau qu&apos;elle a rempli : ses
          critères en lignes, hiérarchisés de Critique à Bonus, ses opportunités en colonnes, et le score qui en découle.
        </p>
        <blockquote className="max-w-3xl rounded-xl bg-blush/70 px-5 py-4">
          <p className="text-sm font-medium text-ink-soft">Son Talent Unique</p>
          <p className="mt-1 font-serif text-xl italic">{talentSentence(CAMILLE.talent)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            <span className="font-medium text-ink">Anti-Contexte :</span> {CAMILLE.talent.antiContexte}
          </p>
        </blockquote>
      </header>

      <DecisionTable
        versionId="exemple"
        categories={CAMILLE_CATEGORIES}
        criteria={CAMILLE_CRITERIA}
        opportunities={CAMILLE_OPPORTUNITIES}
        evaluations={CAMILLE_EVALUATIONS}
        readOnly
        comments={[]}
        commentViewer={null}
      />

      <section aria-labelledby="ressenti" className="max-w-3xl space-y-2">
        <h2 id="ressenti" className="text-3xl italic">
          Son ressenti
        </h2>
        <p className="font-serif text-xl italic leading-relaxed text-ink">« {CAMILLE_INSIGHT} »</p>
        <p className="text-ink-soft">
          La mieux payée (la banque) arrive dernière : l&apos;Anti-Contexte y est très présent. Le freelance est proche de la tête, mais
          deux points restent à vérifier, dont son revenu minimum, qui est non négociable pour elle.
        </p>
      </section>

      <Card className="max-w-3xl space-y-3 bg-blush/50">
        <h2 className="text-3xl italic">À toi de jouer</h2>
        <p className="text-ink-soft">Construis ton propre tableau avec tes critères et tes opportunités.</p>
        <div className="max-w-sm">
          {user ? <ButtonLink href="/">Retrouver mes boussoles</ButtonLink> : <TrialButton label="Commencer mon tableau" />}
        </div>
      </Card>
    </div>
  );
}
