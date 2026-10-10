import { lienCompte, lienConnexion, type StatutCompte } from "@/features/espace/barre";
import { Icone } from "@/features/espace/Icones";
import type { ParcoursMessages } from "@/i18n/messages/parcours";

/**
 * Garder son progrès : un appel clair, jamais bloquant (le parcours marche sans compte).
 * Complet dans le résultat, en une ligne sur l'écran « Quête accomplie ».
 */
export function CarteCompte({ T, statut, compte, compact = false }: { T: ParcoursMessages; statut: StatutCompte; compte: "table" | "sans_table" | null; compact?: boolean }) {
  const C = T.compte;
  if (statut === "connecte") {
    // Sans la table, la progression reste dans le navigateur : on ne promet rien de plus.
    if (compact || compte !== "table") return null;
    return (
      <p className="flex items-center gap-2 text-[15px] font-medium text-sage">
        <Icone nom="coche" className="h-5 w-5 shrink-0" />
        {C.ok}
      </p>
    );
  }
  const invite = statut === "invite";
  if (compact) {
    return (
      <p className="mt-5 text-[15px] leading-snug text-ink-soft">
        {C.fete}{" "}
        <a href={lienCompte(statut)} className="font-semibold text-link underline underline-offset-4">
          {invite ? C.sauvegarder : C.creer}
        </a>
      </p>
    );
  }
  return (
    <section aria-labelledby="compte-titre" className="rounded-[26px] border border-[#F0D2C6] bg-[linear-gradient(135deg,#FFF1EA_0%,#FFF9EA_100%)] p-5 sm:p-6">
      <h3 id="compte-titre" className="flex items-center gap-2 font-serif text-[24px] italic leading-tight">
        <Icone nom="cadeau" className="h-6 w-6 shrink-0 text-accent-strong" />
        {C.titre}
      </h3>
      <p className="mt-2 text-[16px] leading-relaxed text-ink">{invite ? C.inviteTexte : C.texte}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <a
          href={lienCompte(statut)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent-strong px-6 text-[16px] font-semibold text-white shadow-[0_3px_0_0_rgba(143,56,16,0.6)] transition hover:bg-accent-deep active:translate-y-px active:shadow-none"
        >
          {invite ? C.sauvegarder : C.creer}
        </a>
        {!invite && (
          <a href={lienConnexion()} className="inline-flex min-h-11 items-center justify-center text-[15px] font-medium text-link underline underline-offset-4">
            {C.connecter}
          </a>
        )}
      </div>
    </section>
  );
}
