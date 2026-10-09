import { Icone } from "./Icones";
import type { Outil } from "./outils";

const ENCRE = "#3A2F24";

/** Carte d'un outil : lien complet depuis la racine, même onglet (pas next/link). */
export function CarteOutil({ outil }: { outil: Outil }) {
  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-[14px] bg-white p-3.5 pb-4"
      style={{ border: `1px solid ${outil.claire}`, borderLeft: `4px solid ${outil.forte}` }}
    >
      <div className="mb-2 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: outil.fond, color: outil.forte }}
          aria-hidden="true"
        >
          <Icone nom={outil.icone} className="h-[22px] w-[22px]" />
        </span>
        <h3 className="min-w-0 font-serif text-[22px] italic leading-tight">{outil.titre}</h3>
      </div>
      <p className="mb-3 flex-1 text-base leading-snug text-ink-soft">{outil.phrase}</p>
      <a
        href={outil.lien}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full px-4 text-center text-base font-medium leading-tight sm:w-auto sm:self-start"
        style={{ background: outil.couleurBouton, color: outil.encre ? ENCRE : "#fff" }}
      >
        {outil.bouton}
      </a>
    </article>
  );
}
