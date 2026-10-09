import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IMPORT_ACTIF } from "@/content/espace";
import { getFiche } from "@/data/fiche";
import type { FicheTalent } from "@/domain/fiche/types";
import { Icone } from "@/features/espace/Icones";
import { GROUPES, rempli, type ChampEcran } from "@/features/fiche/champs";
import { SupprimerFiche } from "@/features/fiche/SupprimerFiche";
import { Verification } from "@/features/fiche/Verification";
import { getI18n } from "@/i18n/server";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.espace.pageFiche.titre };
}

const COULEURS = { essentiel: "#C8333A", outils: "#0E7490", reste: "#8A6516" } as const;
const ICONES = { essentiel: "etoile", outils: "mallette", reste: "document" } as const;
/** Listes de mots courts : en pastilles plutôt qu'en puces. */
const PASTILLES: readonly ChampEcran[] = ["valeurs", "qualites", "defauts", "antiValeurs", "autresTitres", "metiersParfaits", "metiersTres", "metiersCondition"];
const TEINTES = [
  ["var(--color-miel-soft)", "var(--color-miel)"],
  ["var(--color-eau-soft)", "var(--color-eau)"],
  ["var(--color-lilas-soft)", "var(--color-lilas)"],
  ["var(--color-corail-soft)", "var(--color-corail)"],
  ["var(--color-sky-soft)", "var(--color-ciel)"],
] as const;
/** Déjà affichés en tête de page. */
const EN_TETE: readonly ChampEcran[] = ["titre", "resume"];

function Valeur({ fiche, champ }: { fiche: FicheTalent; champ: ChampEcran }) {
  if (champ === "enneagramme") {
    return <p>{[fiche.enneagramme.base, fiche.enneagramme.sousType].filter(Boolean).join(", ")}</p>;
  }
  if (champ === "avatars") {
    return (
      <ul className="grid gap-2 sm:grid-cols-3">
        {fiche.avatars.map((a, i) => (
          <li key={i} className="rounded-xl border border-line bg-cream/60 p-3 text-[15px] leading-snug">
            <p className="font-medium">{a.profil}</p>
            {a.besoins && <p className="mt-1 text-ink-soft">{a.besoins}</p>}
            {a.apport && <p className="mt-1">{a.apport}</p>}
          </li>
        ))}
      </ul>
    );
  }
  const v = fiche[champ];
  if (Array.isArray(v) && PASTILLES.includes(champ)) {
    return (
      <ul className="flex flex-wrap gap-2">
        {v.map((x, i) => (
          <li key={x} className="rounded-full px-3 py-1 text-[15px] font-medium" style={{ background: TEINTES[i % TEINTES.length][0], color: TEINTES[i % TEINTES.length][1] }}>
            {x}
          </li>
        ))}
      </ul>
    );
  }
  if (Array.isArray(v)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {v.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    );
  }
  return <p className="whitespace-pre-line first-letter:uppercase">{v}</p>;
}

export default async function FichePage({ searchParams }: PageProps<"/mon-espace/fiche">) {
  const user = await requireUser();
  const ESPACE = (await getI18n()).t.espace;
  const V = ESPACE.verification;
  if (!IMPORT_ACTIF) redirect("/mon-espace/");
  const lecture = await getFiche(await supabaseServer(), user.id);
  if (lecture.absente) redirect("/mon-espace/");
  if (!lecture.fiche) redirect("/mon-espace/importer/");
  const { fiche, source, methode } = lecture.fiche;

  if ((await searchParams).modifier === "1") {
    return (
      <div className="mx-auto max-w-3xl">
        <Verification fiche={fiche} rapport={null} source={source} methode={methode} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <a href="/boussole-decision/mon-espace/" className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-link underline underline-offset-4">
        <Icone nom="fleche" className="h-4 w-4 rotate-180" />
        {V.annuler}
      </a>
      <header className="space-y-1">
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-[#C8333A]">
          <Icone nom="etoile" className="h-4 w-4 shrink-0" />
          {ESPACE.pageFiche.titre}
        </p>
        <h1 className="font-serif text-[32px] italic leading-tight sm:text-4xl">{fiche.titre || fiche.prenom || ESPACE.pageFiche.titre}</h1>
        {fiche.resume && <p className="max-w-2xl pt-2 text-base leading-relaxed text-ink">{fiche.resume}</p>}
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href="/boussole-decision/mon-espace/fiche/?modifier=1"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#C8333A] px-5 text-base font-medium text-white"
        >
          <Icone nom="crayon" className="h-5 w-5" />
          {ESPACE.pageFiche.modifier}
        </a>
      </div>

      {GROUPES.map((g) => {
        const champs = g.champs.filter((c) => rempli(fiche, c) && !EN_TETE.includes(c));
        if (!champs.length) return null;
        return (
          <section key={g.cle} className="space-y-4 rounded-[14px] border border-line bg-white p-5" style={{ borderLeft: `4px solid ${COULEURS[g.cle]}` }} aria-labelledby={`groupe-${g.cle}`}>
            <h2 id={`groupe-${g.cle}`} className="flex items-center gap-2 font-serif text-[24px] italic leading-tight" style={{ color: COULEURS[g.cle] }}>
              <Icone nom={ICONES[g.cle]} className="h-5 w-5 shrink-0" />
              {V.groupes[g.cle]}
            </h2>
            {champs.map((c) => (
              <div key={c} className="text-base leading-relaxed text-ink">
                <p className="mb-1.5 text-[15px] font-semibold leading-snug text-ink-soft">
                  {c === "enneagramme" ? V.champs.enneagrammeBase : (V.champs[c as keyof typeof V.champs] as string)}
                </p>
                <Valeur fiche={fiche} champ={c} />
              </div>
            ))}
          </section>
        );
      })}

      <div className="border-t border-line pt-4">
        <SupprimerFiche />
      </div>
    </div>
  );
}
