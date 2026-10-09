import { ESPACE } from "@/content/espace";
import { couper } from "@/domain/fiche/bornes";
import type { LectureFiche } from "@/data/fiche";
import { Icone } from "@/features/espace/Icones";

const PASTILLES = [
  { fond: "var(--color-miel-soft)", texte: "var(--color-miel)" },
  { fond: "var(--color-eau-soft)", texte: "var(--color-eau)" },
  { fond: "var(--color-lilas-soft)", texte: "var(--color-lilas)" },
];

const lienSite = (chemin: string) => `/boussole-decision${chemin}`;

/** Carte du haut de Mon espace (E.4) : bientôt, sans fiche, ou « Ton Talent Unique ». */
export function CarteFiche({ lecture }: { lecture: LectureFiche }) {
  const F = ESPACE.fiche;
  if (lecture.absente) {
    return (
      <p className="flex items-center gap-2 rounded-[14px] border border-sky-line bg-sky-soft px-4 py-3 text-base text-ink">
        <Icone nom="document" className="h-5 w-5 shrink-0 text-ciel" />
        {F.bientot}
      </p>
    );
  }
  const enregistree = lecture.fiche;
  if (!enregistree) {
    return (
      <section className="rounded-[14px] bg-[#FDECEC] p-5 sm:p-6" style={{ borderLeft: "4px solid #E5484D" }} aria-labelledby="carte-fiche">
        <h2 id="carte-fiche" className="flex items-center gap-2.5 font-serif text-[24px] italic leading-tight sm:text-[26px]">
          <Icone nom="document" className="h-6 w-6 shrink-0 text-[#C8333A]" />
          {F.videTitre}
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">{F.videTexte}</p>
        <a
          href={lienSite("/mon-espace/importer/")}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#C8333A] px-5 text-base font-medium text-white sm:w-auto"
        >
          <Icone nom="dossier" className="h-5 w-5" />
          {F.videBouton}
        </a>
        <p className="mt-3 text-base text-ink-soft">
          {F.pasDeFiche}{" "}
          <a href="/quiz/" className="font-medium text-link underline underline-offset-4">
            {F.lienQuiz}
          </a>
        </p>
      </section>
    );
  }
  const f = enregistree.fiche;
  return (
    <section className="rounded-[14px] border border-[#F8CFCF] bg-white p-5 sm:p-6" style={{ borderLeft: "4px solid #E5484D" }} aria-labelledby="carte-fiche">
      <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-[#C8333A]">
        <Icone nom="etoile" className="h-4 w-4 shrink-0" />
        {F.surtitre}
      </p>
      <h2 id="carte-fiche" className="mt-1 font-serif text-[26px] italic leading-tight">
        {f.titre || f.prenom || F.surtitre}
      </h2>
      {f.resume && <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">{couper(f.resume, 220)}</p>}
      {f.valeurs.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Tes trois premières valeurs">
          {f.valeurs.slice(0, 3).map((v, i) => (
            <li key={v} className="rounded-full px-3 py-1 text-sm font-medium" style={{ background: PASTILLES[i].fond, color: PASTILLES[i].texte }}>
              {v}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
        <a href={lienSite("/mon-espace/fiche/")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#C8333A] px-5 text-base font-medium text-white">
          <Icone nom="document" className="h-5 w-5" />
          {F.voir}
        </a>
        <a href={lienSite("/mon-espace/fiche/?modifier=1")} className="inline-flex min-h-11 items-center justify-center gap-2 font-medium text-link underline underline-offset-4">
          <Icone nom="crayon" className="h-5 w-5" />
          {F.modifier}
        </a>
      </div>
    </section>
  );
}
