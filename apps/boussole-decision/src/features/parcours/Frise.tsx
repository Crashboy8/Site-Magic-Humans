import type { CSSProperties } from "react";
import { cx } from "@/components/ui";
import type { EtatEtape, Piste, Resultat } from "@/domain/parcours/position";
import type { Branche, ParcoursPublic } from "@/domain/parcours/types";
import { Icone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";
import { Info, Rayons } from "./Habillage";
import { iconeEtape, styleBranche, TEINTES, transparence } from "./theme";

type Taille = "normale" | "petite";
type Ligne = "pleine" | "pointillee" | null;

/** Le soleil de l'Ikigai, au bout de chaque voie. */
function Soleil({ statut, petit }: { statut: EtatEtape["statut"]; petit: boolean }) {
  return (
    <span aria-hidden="true" className={cx("relative z-10 flex shrink-0 items-center justify-center", petit ? "h-8 w-8" : "h-10 w-10")}>
      <Rayons className={cx("absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]", statut !== "a_venir" && "oj-tourne")} couleur="#F5E1AE" />
      <span
        className={cx(
          "relative flex h-full w-full items-center justify-center rounded-full [&_svg]:h-5 [&_svg]:w-5",
          statut === "franchie" ? "bg-[#E0A526] text-white" : "bg-[radial-gradient(circle_at_35%_30%,#FFF1C2,#F2C14E)] text-[#7A5200]",
          statut === "actuelle" && "oj-pulse ring-[3px] ring-[#E0A526]",
        )}
        style={statut === "actuelle" ? ({ "--oj-halo": transparence("#E0A526", 0.45) } as CSSProperties) : undefined}
      >
        <Icone nom={statut === "franchie" ? "coche" : "soleil"} />
      </span>
    </span>
  );
}

function Noeud({
  data,
  T,
  etat,
  i,
  ligne,
  restantes,
  taille,
}: {
  data: ParcoursPublic;
  T: ParcoursMessages;
  etat: EtatEtape;
  i: number;
  ligne: Ligne;
  restantes: number;
  taille: Taille;
}) {
  const etape = data.etapes[etat.id];
  const fin = etape.branche === "aboutissement";
  const { statut } = etat;
  const petit = taille === "petite";
  return (
    <li className={cx("oj-apparait relative flex gap-3", ligne && (petit ? "pb-3" : "pb-4"))} style={{ ...styleBranche(etape.branche), "--i": i } as CSSProperties}>
      {ligne && (
        <span
          aria-hidden="true"
          className={cx(
            "absolute bottom-0 w-[3px] -translate-x-1/2 rounded-full",
            petit ? "left-4 top-9" : "left-5 top-11",
            ligne === "pleine" ? "bg-(--oj-forte)" : "bg-[repeating-linear-gradient(to_bottom,#D9CDBB_0_5px,transparent_5px_10px)]",
          )}
        />
      )}
      {fin ? (
        <Soleil statut={statut} petit={petit} />
      ) : (
        <span
          aria-hidden="true"
          className={cx(
            "relative z-10 flex shrink-0 items-center justify-center rounded-full transition",
            petit ? "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4" : "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
            statut === "franchie" && "bg-(--oj-forte) text-white shadow-[0_6px_14px_-8px_var(--oj-forte)]",
            statut === "actuelle" && "oj-pulse bg-white text-(--oj-texte) ring-[3px] ring-(--oj-forte)",
            statut === "a_venir" && "border-2 border-dashed border-[#D9CDBB] bg-paper text-[#A39684]",
          )}
          style={statut === "actuelle" ? ({ "--oj-halo": transparence(TEINTES[etape.branche].forte, 0.45) } as CSSProperties) : undefined}
        >
          <Icone nom={statut === "franchie" ? "coche" : statut === "a_venir" ? "cadenas" : iconeEtape(etape.id)} />
        </span>
      )}
      <div className={cx("min-w-0 flex-1", petit ? "pt-0" : "pt-0.5")}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-bold uppercase tracking-[0.1em] text-(--oj-texte)">
          <span>{etape.code}</span>
          {etat.auto && <span className="font-medium normal-case tracking-normal text-ink-soft">{T.resultat.franchieOffice}</span>}
        </p>
        <p className={cx("font-serif italic leading-snug", petit ? "text-[15px] sm:text-[16px]" : "text-[19px]", statut === "a_venir" ? "text-ink-soft" : "text-ink")}>{etape.nom}</p>
        {statut === "actuelle" && !fin && (
          <Info icone="pin" className={cx("mt-1 whitespace-nowrap font-bold uppercase tracking-[0.1em] text-(--oj-texte)", petit ? "text-[11px]" : "text-[12px]")}>
            {T.resultat.tuEsIci}
          </Info>
        )}
        {fin && <p className="mt-0.5 text-[14px] font-semibold text-[#7A5200]">{T.resultat.restantes(restantes)}</p>}
        <span className="sr-only"> : {T.resultat.statut[statut]}</span>
      </div>
    </li>
  );
}

function liste(data: ParcoursPublic, T: ParcoursMessages, etats: EtatEtape[], restantes: number, taille: Taille, debut = 0, suite = false) {
  return etats.map((e, i) => {
    const derniere = i === etats.length - 1 && !suite;
    const ligne: Ligne = derniere ? null : e.statut === "franchie" ? "pleine" : "pointillee";
    return <Noeud key={e.id} data={data} T={T} etat={e} i={debut + i} ligne={ligne} restantes={restantes} taille={taille} />;
  });
}

function Couloir({ data, T, branche, piste, restantes, debut }: { data: ParcoursPublic; T: ParcoursMessages; branche: Branche; piste: Piste; restantes: number; debut: number }) {
  const nom = data.etapes[piste.etapes[0].id].brancheNom;
  return (
    <div className="min-w-0 rounded-2xl p-2.5 sm:p-3" style={{ ...styleBranche(branche), background: TEINTES[branche].fond }}>
      <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold leading-tight text-(--oj-texte)">
        <Icone nom={branche === "entrepreneur" ? "fusee" : "mallette"} className="h-4 w-4 shrink-0" />
        {nom}
      </p>
      <ol>{liste(data, T, piste.etapes, restantes, "petite", debut)}</ol>
      <p className="mt-2.5 text-[13px] font-semibold text-(--oj-texte)">{T.resultat.restantes(restantes)}</p>
    </div>
  );
}

/** « Ta voie, tu es ici » : étapes franchies cochées, étape actuelle mise en avant, Ton Ikigai au bout. */
export function Frise({ data, T, resultat, taille = "normale" }: { data: ParcoursPublic; T: ParcoursMessages; resultat: Resultat; taille?: Taille }) {
  const { position, restantes } = resultat;
  const h = position.hybride;
  const tronc = position.principale.etapes;
  return (
    <section aria-labelledby="frise-titre" className="rounded-[26px] border border-line bg-white p-5 sm:p-6">
      <h3 id="frise-titre" className="flex items-center gap-2 font-serif text-[24px] italic leading-tight">
        <Icone nom="carte" className="h-6 w-6 shrink-0 text-accent-strong" />
        {T.resultat.frise}
      </h3>
      <ol className="mt-4">{liste(data, T, tronc, restantes.total, taille, 0, Boolean(h))}</ol>
      {h && (
        <>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:gap-4">
            <Couloir data={data} T={T} branche="entrepreneur" piste={h.entrepreneur} restantes={restantes.entrepreneur ?? 0} debut={tronc.length} />
            <Couloir data={data} T={T} branche="salarie" piste={h.salarie} restantes={restantes.salarie ?? 0} debut={tronc.length} />
          </div>
          <ol className="mt-4">{liste(data, T, h.fin.etapes, restantes.total, taille, tronc.length + 6)}</ol>
        </>
      )}
    </section>
  );
}

/** Une petite frise en ligne : la connaissance de toi, menée en parallèle. */
export function MiniFrise({ data, T, piste }: { data: ParcoursPublic; T: ParcoursMessages; piste: Piste }) {
  return (
    <ol className="flex items-center">
      {piste.etapes.map((e, i) => {
        const etape = data.etapes[e.id];
        const derniere = i === piste.etapes.length - 1;
        return (
          <li key={e.id} className={cx("flex items-center", !derniere && "flex-1")}>
            <span
              title={`${etape.code} · ${etape.nom}`}
              aria-hidden="true"
              className={cx(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4",
                e.statut === "franchie" && "bg-(--oj-forte) text-white",
                e.statut === "actuelle" && "oj-pulse bg-white text-(--oj-texte) ring-[3px] ring-(--oj-forte)",
                e.statut === "a_venir" && "border-2 border-dashed border-[#D9CDBB] bg-paper text-[#A39684]",
              )}
              style={e.statut === "actuelle" ? ({ "--oj-halo": transparence(TEINTES.soi.forte, 0.45) } as CSSProperties) : undefined}
            >
              <Icone nom={e.statut === "franchie" ? "coche" : e.statut === "a_venir" ? "cadenas" : iconeEtape(e.id)} />
            </span>
            <span className="sr-only">
              {etape.code} {etape.nom} : {T.resultat.statut[e.statut]}
            </span>
            {!derniere && <span aria-hidden="true" className={cx("mx-1 h-[3px] flex-1 rounded-full", e.statut === "franchie" ? "bg-(--oj-forte)" : "bg-[#E7DDCD]")} />}
          </li>
        );
      })}
    </ol>
  );
}
