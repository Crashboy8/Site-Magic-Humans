"use client";

import { SaveIndicator, SaveStatusProvider, useAutosavedValue } from "@/components/autosave";
import { Textarea } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";
import { updateTalent } from "@/data/repository";
import { TALENT_TERMS, talentSentence } from "@/domain/methodology";
import type { TalentUnique } from "@/domain/types";

export function TalentUniqueEditor(props: { profileId: string; talent: TalentUnique; readOnly: boolean }) {
  return (
    <SaveStatusProvider>
      <Editor {...props} />
    </SaveStatusProvider>
  );
}

function Editor({ profileId, talent, readOnly }: { profileId: string; talent: TalentUnique; readOnly: boolean }) {
  const db = supabaseBrowser();
  const save = (field: keyof TalentUnique) => (value: string) => updateTalent(db, profileId, { [field]: value });
  const [mecanisme, setMecanisme] = useAutosavedValue(talent.mecanisme, save("mecanisme"));
  const [contexte, setContexte] = useAutosavedValue(talent.contexteDeclencheur, save("contexteDeclencheur"));
  const [benefice, setBenefice] = useAutosavedValue(talent.superBenefice, save("superBenefice"));
  const [anti, setAnti] = useAutosavedValue(talent.antiContexte, save("antiContexte"));
  const sentence = talentSentence({ mecanisme, contexteDeclencheur: contexte, superBenefice: benefice });

  const fields = [
    { id: "mecanisme", prefix: "Je…", term: TALENT_TERMS.mecanisme, def: TALENT_TERMS.mecanismeDefinition, value: mecanisme, set: setMecanisme, placeholder: "simplifie et clarifie les idées complexes" },
    { id: "contexte", prefix: "…dans un environnement où…", term: TALENT_TERMS.contexteDeclencheur, def: TALENT_TERMS.contexteDeclencheurDefinition, value: contexte, set: setContexte, placeholder: "il y a du chaos ou un manque de vision" },
    { id: "benefice", prefix: "…afin de…", term: TALENT_TERMS.superBenefice, def: TALENT_TERMS.superBeneficeDefinition, value: benefice, set: setBenefice, placeholder: "remettre du mouvement et de la sérénité dans le groupe" },
  ];

  return (
    <section aria-labelledby="talent-unique" className="space-y-5 rounded-2xl border border-line bg-paper p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="talent-unique" className="text-3xl italic">
            Mon {TALENT_TERMS.talentUnique}
          </h2>
          <p className="max-w-2xl text-ink-soft">{TALENT_TERMS.talentUniqueDefinition} Il guide le choix de tes critères.</p>
        </div>
        {!readOnly && <SaveIndicator />}
      </div>

      <blockquote className="rounded-xl bg-blush/70 px-5 py-4 font-serif text-xl italic leading-snug text-ink sm:text-2xl">
        {sentence ?? (
          <span className="text-ink-soft">
            « Je [{TALENT_TERMS.mecanisme}] dans un environnement où [{TALENT_TERMS.contexteDeclencheur}], afin de [{TALENT_TERMS.superBenefice}]. »
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
          Mon {TALENT_TERMS.antiContexte} <span className="font-normal text-ink-soft">(ou Contexte d&apos;Inhibition)</span>
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
          placeholder={readOnly ? "Non renseigné." : "Ex. : des réunions sans fin où rien ne se décide, un contrôle permanent de chaque détail…"}
          className="min-h-20"
        />
      </div>
    </section>
  );
}
