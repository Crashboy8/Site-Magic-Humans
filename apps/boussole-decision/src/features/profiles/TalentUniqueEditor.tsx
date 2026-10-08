"use client";

import { SaveIndicator, SaveStatusProvider, useAutosavedValue } from "@/components/autosave";
import { Textarea } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { updateTalent } from "@/data/repository";
import { useI18n } from "@/i18n/client";
import type { TalentUnique } from "@/domain/types";
import { CarteDuTalentLink } from "@/features/carte/CarteDuTalentLink";
import { CibleurLink } from "@/features/carte/CibleurLink";

type EditorProps = {
  profileId: string;
  talent: TalentUnique;
  readOnly: boolean;
  /** Affiche, sous l'éditeur, le bouton vers la Carte du Talent (avec les valeurs en cours de saisie). */
  withCarteLink?: boolean;
};

export function TalentUniqueEditor(props: EditorProps) {
  return (
    <SaveStatusProvider>
      <Editor {...props} />
    </SaveStatusProvider>
  );
}

function Editor({ profileId, talent, readOnly, withCarteLink }: EditorProps) {
  const db = supabaseBrowser();
  const { t, m } = useI18n();
  const p = t.profile;
  const TALENT_TERMS = m.terms;
  const save = (field: keyof TalentUnique) => (value: string) => updateTalent(db, profileId, { [field]: value });
  const [mecanisme, setMecanisme] = useAutosavedValue(talent.mecanisme, save("mecanisme"));
  const [contexte, setContexte] = useAutosavedValue(talent.contexteDeclencheur, save("contexteDeclencheur"));
  const [benefice, setBenefice] = useAutosavedValue(talent.superBenefice, save("superBenefice"));
  const [anti, setAnti] = useAutosavedValue(talent.antiContexte, save("antiContexte"));
  const [success, setSuccess] = useAutosavedValue(talent.successSituations, save("successSituations"));
  const [failure, setFailure] = useAutosavedValue(talent.failureSituations, save("failureSituations"));
  const sentence = m.talentSentence({ mecanisme, contexteDeclencheur: contexte, superBenefice: benefice });

  const fields = [
    {
      id: "mecanisme",
      prefix: m.sentenceParts.mecanisme,
      term: TALENT_TERMS.mecanisme,
      def: TALENT_TERMS.mecanismeDefinition,
      value: mecanisme,
      set: setMecanisme,
      placeholder: p.placeholderMecanisme,
    },
    {
      id: "contexte",
      prefix: m.sentenceParts.contexte,
      term: TALENT_TERMS.contexteDeclencheur,
      def: TALENT_TERMS.contexteDeclencheurDefinition,
      value: contexte,
      set: setContexte,
      placeholder: p.placeholderContexte,
    },
    {
      id: "benefice",
      prefix: m.sentenceParts.benefice,
      term: TALENT_TERMS.superBenefice,
      def: TALENT_TERMS.superBeneficeDefinition,
      value: benefice,
      set: setBenefice,
      placeholder: p.placeholderBenefice,
    },
  ];

  const current: TalentUnique = {
    mecanisme,
    contexteDeclencheur: contexte,
    superBenefice: benefice,
    antiContexte: anti,
    successSituations: success,
    failureSituations: failure,
  };

  return (
    <>
      <section aria-labelledby="talent-unique" className="space-y-5 rounded-2xl border border-line bg-paper p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="talent-unique" className="text-3xl italic">
              {p.myTalent(TALENT_TERMS.talentUnique)}
            </h2>
            <p className="max-w-2xl text-ink-soft">
              {TALENT_TERMS.talentUniqueDefinition} {p.talentGuides}
            </p>
          </div>
          {!readOnly && <SaveIndicator />}
        </div>

        <blockquote className="rounded-xl bg-blush/70 px-5 py-4 font-serif text-xl italic leading-snug text-ink sm:text-2xl">
          {sentence ?? (
            <span className="text-ink-soft">
              {m.talentSentence({
                mecanisme: `[${TALENT_TERMS.mecanisme}]`,
                contexteDeclencheur: `[${TALENT_TERMS.contexteDeclencheur}]`,
                superBenefice: `[${TALENT_TERMS.superBenefice}]`,
              })}
            </span>
          )}
        </blockquote>

        {!readOnly && (
          <div className="grid gap-4 lg:grid-cols-3">
            {fields.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <label htmlFor={`talent-${f.id}`} className="block">
                  <span className="block font-script text-xl text-accent-strong">{f.prefix}</span>
                  <span className="block text-[15px] font-medium">{f.term}</span>
                </label>
                <Textarea
                  id={`talent-${f.id}`}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="min-h-20"
                  aria-describedby={`talent-${f.id}-def`}
                />
                <p id={`talent-${f.id}-def`} className="text-sm text-ink-soft">
                  {f.def}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="talent-anti" className="block text-[15px] font-medium">
            {p.myAnti(TALENT_TERMS.antiContexte)} <span className="font-normal text-ink-soft">({TALENT_TERMS.inhibition})</span>
          </label>
          <p id="talent-anti-def" className="text-sm text-ink-soft">
            {TALENT_TERMS.antiContexteDefinition}
          </p>
          <Textarea
            id="talent-anti"
            value={anti}
            onChange={(e) => setAnti(e.target.value)}
            readOnly={readOnly}
            aria-describedby="talent-anti-def"
            placeholder={readOnly ? p.notFilled : p.placeholderAnti}
            className="min-h-20"
          />
        </div>

        <div className="space-y-3 border-t border-line pt-5">
          <div>
            <h3 className="font-serif text-2xl italic">{p.livedTitle}</h3>
            <p className="max-w-3xl text-sm text-ink-soft">{p.livedIntro}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5 rounded-xl bg-sage-soft/60 p-4">
              <label htmlFor="talent-success" className="block text-[15px] font-medium">
                {p.successTitle}
              </label>
              <p id="talent-success-def" className="text-sm text-ink-soft">
                {p.successHint}
              </p>
              <Textarea
                id="talent-success"
                value={success}
                onChange={(e) => setSuccess(e.target.value)}
                readOnly={readOnly}
                aria-describedby="talent-success-def"
                placeholder={readOnly ? p.notFilled : p.successPlaceholder}
                className="min-h-24 bg-paper"
              />
            </div>
            <div className="space-y-1.5 rounded-xl bg-danger-soft/50 p-4">
              <label htmlFor="talent-failure" className="block text-[15px] font-medium">
                {p.failureTitle}
              </label>
              <p id="talent-failure-def" className="text-sm text-ink-soft">
                {p.failureHint}
              </p>
              <Textarea
                id="talent-failure"
                value={failure}
                onChange={(e) => setFailure(e.target.value)}
                readOnly={readOnly}
                aria-describedby="talent-failure-def"
                placeholder={readOnly ? p.notFilled : p.failurePlaceholder}
                className="min-h-24 bg-paper"
              />
            </div>
          </div>
        </div>
      </section>
      {withCarteLink && <CarteDuTalentLink talent={current} />}
      {withCarteLink && <CibleurLink talent={current} />}
    </>
  );
}
