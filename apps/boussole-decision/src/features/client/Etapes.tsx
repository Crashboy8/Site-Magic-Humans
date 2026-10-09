import { Icone } from "@/features/espace/Icones";

const CORAIL = "#B34716";
const SAUGE = "#55704F";

/** Les 3 étapes de l'accès client, sur une seule ligne : faites (coche sauge), en cours (corail), à venir. */
export function Etapes({ active, libelles, aria, sur }: { active: 1 | 2 | 3; libelles: readonly string[]; aria: string; sur: string }) {
  return (
    <nav aria-label={aria} className="space-y-1.5">
      <p className="sr-only">{sur}</p>
      <ol className="flex items-center gap-1.5">
        {libelles.map((libelle, i) => {
          const n = i + 1;
          const fait = n < active;
          const enCours = n === active;
          return (
            <li key={libelle} className="flex min-w-0 flex-1 items-center gap-1.5" aria-current={enCours ? "step" : undefined}>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  background: fait ? SAUGE : enCours ? CORAIL : "#fff",
                  color: fait || enCours ? "#fff" : "#6B5D4E",
                  border: fait || enCours ? "none" : "1.5px solid rgb(58 47 36 / 0.25)",
                }}
                aria-hidden="true"
              >
                {fait ? <Icone nom="coche" className="h-4 w-4" /> : n}
              </span>
              <span className={`min-w-0 truncate text-[13px] leading-tight ${enCours ? "font-semibold text-ink" : "text-ink-soft"}`}>{libelle}</span>
              {n < libelles.length && <span className="h-px min-w-2 flex-1 bg-ink/15" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
