"use client";

import { LOVE_TEXTS } from "@/content/amour";
import { proposalStatus, type LoveProposal, type LoveProposalGroup } from "@/domain/lovePrefill";

const GROUP_ORDER: LoveProposalGroup[] = ["profil", "besoins", "valeurs", "eviter"];

/** Une couleur vive et douce par famille de résultats (jamais de bleu foncé). */
const GROUP_TONE: Record<LoveProposalGroup, { box: string; title: string; dot: string }> = {
  profil: { box: "border-framboise/25 bg-framboise-soft", title: "text-framboise", dot: "bg-framboise" },
  besoins: { box: "border-eau/25 bg-eau-soft", title: "text-eau", dot: "bg-eau" },
  valeurs: { box: "border-miel/25 bg-miel-soft", title: "text-miel", dot: "bg-miel" },
  eviter: { box: "border-lilas/25 bg-lilas-soft", title: "text-lilas", dot: "bg-lilas" },
};

/** Les résultats du Quiz Amour, transformés en critères à cocher avant l'import. */
export function QuizPick({
  proposals,
  existingLabels,
  chosen,
  onToggle,
  profil,
}: {
  proposals: LoveProposal[];
  existingLabels: string[];
  chosen: Set<string>;
  onToggle: (id: string) => void;
  profil: string;
}) {
  const P = LOVE_TEXTS.quizPick;
  return (
    <section aria-labelledby="quiz-pick" className="space-y-4">
      <header className="space-y-1 text-center">
        <h2 id="quiz-pick" className="text-2xl italic sm:text-3xl">
          {P.title}
        </h2>
        {profil && <p className="font-script text-xl text-framboise">{P.profil(profil)}</p>}
        <p className="text-[15px] leading-relaxed text-ink-soft">{P.intro}</p>
      </header>
      {GROUP_ORDER.map((group) => {
        const items = proposals.filter((p) => p.group === group);
        if (items.length === 0) return null;
        const tone = GROUP_TONE[group];
        return (
          <fieldset key={group} className={`space-y-2 rounded-2xl border p-4 ${tone.box}`}>
            <legend className={`flex items-center gap-2 px-1 text-sm font-semibold ${tone.title}`}>
              <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-full ${tone.dot}`} />
              {P.groups[group]}
            </legend>
            {items.map((p) => {
              const status = proposalStatus(p, existingLabels);
              const disabled = status !== "nouveau";
              return (
                <label
                  key={p.id}
                  data-proposal={p.id}
                  className={`flex items-start gap-3 rounded-xl bg-paper/80 px-3 py-2.5 ${disabled ? "opacity-70" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent-strong)]"
                    checked={!disabled && chosen.has(p.id)}
                    disabled={disabled}
                    onChange={() => onToggle(p.id)}
                  />
                  <span className="space-y-1">
                    <span className="block text-[15px] leading-snug text-ink">{p.label}</span>
                    <span className="flex flex-wrap gap-1.5 text-xs">
                      {disabled ? (
                        <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">{P.already}</span>
                      ) : (
                        <>
                          <span className="rounded-full bg-sand px-2 py-0.5 text-sable">{P.families[p.category] ?? p.category}</span>
                          <span className="rounded-full bg-corail-soft px-2 py-0.5 text-corail">{P.importance[p.importance]}</span>
                          {p.nonNegotiable && <span className="rounded-full bg-framboise-soft px-2 py-0.5 text-framboise">🔒 {P.nonNegotiable}</span>}
                          {p.direction === "AWAY_FROM" && <span className="rounded-full bg-lilas-soft px-2 py-0.5 text-lilas">{P.avoid}</span>}
                        </>
                      )}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        );
      })}
    </section>
  );
}
