import { cx } from "@/components/ui";
import { Icone } from "./Icones";
import type { CleOutil, Outil, SectionOutil } from "./outils";

/** L'ordre du menu de Mon espace, comme sur la page Tes outils du site. */
const ORDRE: Record<SectionOutil, CleOutil[]> = {
  pro: ["qcm", "boussole", "cibleur", "carte"],
  coeur: ["amour", "relation"],
};

const SECTIONS = [
  { cle: "pro", icone: "mallette", couleur: "#0E7490" },
  { cle: "coeur", icone: "coeur", couleur: "#C8333A" },
] as const;

/** Le menu des outils (colonne de gauche sur ordinateur, sous le parcours sur téléphone). Liens complets, même onglet. */
export function MenuOutils({ outils, sections, titre, className }: { outils: Outil[]; sections: Record<SectionOutil, string>; titre: string; className?: string }) {
  return (
    <nav aria-labelledby="menu-outils" className={cx("min-w-0", className)}>
      <h2 id="menu-outils" className="font-serif text-[28px] italic leading-tight">
        {titre}
      </h2>
      <div className="mt-4 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.cle} aria-labelledby={`menu-${s.cle}`}>
            <h3 id={`menu-${s.cle}`} className="flex items-center gap-2 font-serif text-[22px] italic leading-tight" style={{ color: s.couleur }}>
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ background: s.couleur }}>
                <Icone nom={s.icone} className="h-[18px] w-[18px]" />
              </span>
              {sections[s.cle]}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {ORDRE[s.cle].map((cle) => {
                const o = outils.find((x) => x.cle === cle);
                if (!o) return null;
                return (
                  <li key={cle}>
                    <a
                      href={o.lien}
                      className="group flex min-h-16 items-center gap-3 rounded-2xl border bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(58,47,36,0.55)]"
                      style={{ borderColor: o.claire, borderLeft: `4px solid ${o.forte}` }}
                    >
                      <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105" style={{ background: o.fond, color: o.forte }}>
                        <Icone nom={o.icone} className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-[19px] italic leading-tight text-ink">{o.titre}</span>
                        <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">{o.phrase}</span>
                      </span>
                      <Icone nom="fleche" className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-ink" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
