import { Notice } from "@/components/ui";
import type { MaCibleMessages } from "@/i18n/messages/maCible";

/** Encart complet (accueil) : fond et bordure bleu ciel, jamais du texte bleu. */
export function EncartConfidentialite({ M, fournisseur }: { M: MaCibleMessages; fournisseur: string }) {
  return (
    <section aria-labelledby="confidentialite-titre" className="rounded-2xl border border-sky-line bg-sky-soft p-6">
      <h2 id="confidentialite-titre" className="text-[22px] italic">
        {M.confidentialite.titre}
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px] leading-relaxed">
        {M.confidentialite.points(fournisseur).map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="mt-3 text-[15px]">
        <a className="text-link underline" href="/confidentialite/">
          {M.confidentialite.lienPolitique}
        </a>
      </p>
    </section>
  );
}

/** Rappel d'une ligne au-dessus des boutons qui déclenchent un appel IA ; « En savoir plus » ouvre l'encart. */
export function RappelConfidentialite({ M, fournisseur }: { M: MaCibleMessages; fournisseur: string }) {
  return (
    <details className="rounded-xl border border-sky-line bg-sky-soft px-4 py-3 text-[15px]">
      <summary className="min-h-6 cursor-pointer">
        {M.confidentialite.rappel} <span className="underline">{M.confidentialite.lienDetail}</span>
      </summary>
      <div className="mt-3">
        <EncartConfidentialite M={M} fournisseur={fournisseur} />
      </div>
    </details>
  );
}

export function AvertissementIA({ M }: { M: MaCibleMessages }) {
  return <Notice tone="info">{M.confidentialite.avertissementIA}</Notice>;
}
