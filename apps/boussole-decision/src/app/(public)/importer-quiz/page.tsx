import type { Metadata } from "next";
import { QuizImport } from "@/features/quiz/QuizImport";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.quiz.title, robots: { index: false, follow: false } };
}

// Arrivée depuis le bouton du quiz Talent Unique : le résultat est dans l'ancre de l'adresse (#q=…).
export default async function QuizImportPage() {
  const user = await getCurrentUser();
  const Q = (await getI18n()).t.quiz;
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="font-script text-2xl text-accent-strong">{Q.eyebrow}</p>
        <h1 className="text-4xl italic sm:text-5xl">{Q.heading}</h1>
        <p className="max-w-3xl text-[17px] leading-relaxed text-ink-soft">{Q.intro}</p>
      </header>
      <QuizImport signedIn={Boolean(user)} />
    </div>
  );
}
