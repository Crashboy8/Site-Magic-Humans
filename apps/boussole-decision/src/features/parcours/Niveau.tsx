import type { CSSProperties } from "react";
import { cx } from "@/components/ui";
import type { EtatNiveau, InfoNiveau } from "@/domain/parcours/position";
import { Icone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { titreCourt, titreNumero } from "./liens";

const MARCHE: Record<EtatNiveau, string> = {
  atteint: "bg-[#F2C14E] text-ink",
  actuel: "oj-pulse bg-[#E0A526] text-ink ring-2 ring-[#B7791F] ring-offset-2",
  depart: "bg-[#FCEFC7] text-[#7A5200]",
  vise: "border-2 border-dashed border-[#E0A526] bg-white text-[#7A5200]",
  a_venir: "bg-[#F1E9DC] text-ink-soft",
};

/** Le niveau Réussir dans le Plaisir : la médaille, le conseil, l'échelle en marches et ce que prépare la quête. */
export function Echelle({ T, niveau, compact = false }: { T: ParcoursMessages; niveau: InfoNiveau; compact?: boolean }) {
  const { actuel, depart, echelle } = niveau;
  const vus = new Set<string>();
  const prepares = niveau.prepares.filter((p) => {
    const cle = `${p.effet}|${p.niveau?.code ?? ""}|${p.note}`;
    if (vus.has(cle)) return false;
    vus.add(cle);
    return p.niveau !== null || p.note !== "";
  });
  return (
    <section aria-labelledby="niveau-titre" className="relative overflow-hidden rounded-[26px] border border-[#F5E1AE] bg-[linear-gradient(180deg,#FFF9EA_0%,#FFFFFF_80%)] p-5 sm:p-6">
      <h3 id="niveau-titre" className="flex items-center gap-2 font-serif text-[24px] italic leading-tight">
        <Icone nom="trophee" className="h-6 w-6 shrink-0 text-[#B7791F]" />
        {T.resultat.niveauTitre}
      </h3>
      <div className="mt-4 flex items-center gap-4">
        <span className="oj-pop relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_30%_25%,#FFF1C2_0%,#F2C14E_55%,#E0A526_100%)] text-[26px] font-bold leading-none text-ink shadow-[0_14px_30px_-14px_rgba(176,122,20,0.9)]">
          <span aria-hidden="true" className="oj-brillance absolute inset-0" />
          <span className="relative">{actuel ? actuel.code : T.resultat.departCourt}</span>
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#7A5200]">{actuel ? titreNumero(actuel.titre) : T.resultat.niveauDepart}</p>
          <p className="font-serif text-[24px] italic leading-tight">{actuel ? titreCourt(actuel.titre) : depart.map((n) => titreCourt(n.titre)).join(", ")}</p>
          <p className="mt-0.5 text-[15px] leading-snug text-ink-soft">{actuel ? actuel.sousTitre : T.resultat.niveauDepartTexte}</p>
        </div>
      </div>
      {actuel?.conseil && !compact && (
        <p className="mt-4 rounded-2xl bg-white/90 px-4 py-3 text-[15px] leading-snug text-ink">
          <span className="font-semibold text-[#7A5200]">{T.resultat.conseil} : </span>
          {actuel.conseil}
        </p>
      )}
      <ol aria-label={T.resultat.echelle} className="mt-5 flex items-end gap-1 sm:gap-1.5">
        {echelle.map(({ niveau: n, etat }, i) => (
          <li key={n.code} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            {etat === "actuel" ? <Icone nom="pin" className="h-4 w-4 shrink-0 text-[#B7791F]" /> : <span aria-hidden="true" className="h-4" />}
            <span
              title={n.titre}
              aria-hidden="true"
              className={cx("oj-apparait flex w-full items-start justify-center rounded-t-[10px] rounded-b-[4px] pt-1 text-[12px] font-bold leading-none", MARCHE[etat])}
              style={{ height: `${26 + i * 6}px`, "--i": i, "--oj-halo": "rgb(224 165 38 / 0.45)" } as CSSProperties}
            >
              {n.code}
            </span>
            <span className="sr-only">
              {n.titre} : {T.resultat.etatNiveau[etat]}
            </span>
          </li>
        ))}
      </ol>
      {prepares.length > 0 && (
        <ul className="mt-4 space-y-2">
          {prepares.map((p) => (
            <li key={`${p.etape}-${p.effet}`} className="flex items-start gap-2 text-[15px] leading-snug text-ink">
              <Icone nom={p.effet === "garde" || !p.niveau ? "boussole" : "fleche"} className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]" />
              <span className="min-w-0">
                {p.effet === "garde" || !p.niveau ? (
                  p.note
                ) : (
                  <>
                    <span className="font-semibold">{p.effet === "atteint" ? T.resultat.atteint : T.resultat.prepare} : </span>
                    {p.niveau.titre}
                    {p.note && !compact && <span className="mt-0.5 block text-ink-soft">{p.note}</span>}
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
