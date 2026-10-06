import type { Metadata } from "next";
import { LOVE_TEXTS } from "@/content/amour";
import { LoveOrQuiz } from "@/features/amour/LoveOrQuiz";
import { LoveStart } from "@/features/amour/LoveStart";
import { QuizImport } from "@/features/quiz/QuizImport";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata({ searchParams }: PageProps<"/importer-quiz">): Promise<Metadata> {
  const { theme } = await searchParams;
  const value = Array.isArray(theme) ? theme[0] : theme;
  if (value === "amour") return { title: LOVE_TEXTS.start.heading, robots: { index: false, follow: false } };
  return { title: (await getI18n()).t.quiz.title, robots: { index: false, follow: false } };
}

// Arrivée depuis le bouton du quiz Talent Unique : le résultat est dans l'ancre de l'adresse (#q=…).
// ?theme=amour ouvre à la place l'accueil de la Boussole Relation. Sans ce paramètre, rien ne change.
export default async function QuizImportPage({ searchParams }: PageProps<"/importer-quiz">) {
  const { theme } = await searchParams;
  const value = Array.isArray(theme) ? theme[0] : theme;
  if (value === "amour") return <LoveStart />;

  const user = await getCurrentUser();
  const Q = (await getI18n()).t.quiz;
  return (
    <LoveOrQuiz serverLove={false}>
      <div className="space-y-6">
        <header className="space-y-3">
          <p className="font-script text-2xl text-accent-strong">{Q.eyebrow}</p>
          <h1 className="text-4xl italic sm:text-5xl">{Q.heading}</h1>
          <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{Q.intro}</p>
        </header>
        <QuizImport signedIn={Boolean(user)} />
      </div>
    </LoveOrQuiz>
  );
}
