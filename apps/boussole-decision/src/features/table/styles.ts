import type { CriterionDirection, EvaluationValue, Importance } from "@/domain/types";

/** Couleur des pastilles d'importance (contraste AA). */
export const IMPORTANCE_CLASS: Record<Importance, string> = {
  critique: "bg-ink text-white",
  tres_important: "bg-accent-strong text-white",
  important: "bg-[#f0a27f] text-ink",
  moyen: "bg-[#f6d3bf] text-ink",
  bof: "bg-sand text-ink-soft",
  bonus: "bg-sage-soft text-sage border border-dashed border-sage",
};

const SATISFACTION_CLASS: Record<EvaluationValue, string> = {
  oui: "bg-[#cfe3c7] text-[#2f4a2b]",
  p75: "bg-[#e3eedc] text-[#3d5a37]",
  p50: "bg-[#f6ecd0] text-[#6b5418]",
  p25: "bg-[#f8dccb] text-[#8a3d17]",
  non: "bg-[#f2c9c0] text-[#7a2414]",
  inconnu: "bg-paper text-ink-soft border border-dashed border-ink/25",
};

const FLIP: Partial<Record<EvaluationValue, EvaluationValue>> = { oui: "non", p75: "p25", p25: "p75", non: "oui" };

/** Couleur d'une case : verte quand c'est favorable. Pour un critère « à éviter », « Présent » est donc rouge. */
export function evaluationClass(value: EvaluationValue | null, direction: CriterionDirection): string {
  if (!value) return "bg-cream text-ink-soft";
  const key = direction === "AWAY_FROM" ? (FLIP[value] ?? value) : value;
  return SATISFACTION_CLASS[key];
}
