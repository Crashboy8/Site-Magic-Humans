import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IMPORT_ACTIF } from "@/content/espace";
import { Etapes } from "@/features/client/Etapes";
import { lireAccesClient } from "@/features/client/acces";
import { Icone } from "@/features/espace/Icones";
import { Importer } from "@/features/fiche/Importer";
import { getI18n } from "@/i18n/server";
import { requireUser, supabaseServer } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.espace.importer.titre };
}

export default async function ImporterPage({ searchParams }: PageProps<"/mon-espace/importer">) {
  const user = await requireUser();
  const { t } = await getI18n();
  const ESPACE = t.espace;
  if (!IMPORT_ACTIF) redirect("/mon-espace/");
  const accueilClient = (await searchParams).accueil === "client";
  const acces = accueilClient ? await lireAccesClient(await supabaseServer(), user.invitationCode) : null;

  if (accueilClient) {
    // Arrivée par le lien de Pierre : bienvenue, étape 3 sur 3, puis les tuiles directes.
    const A = t.client.accueilImport;
    const E = t.client.etapes;
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Etapes active={3} libelles={E.liste} aria={E.aria} sur={E.sur(3)} />
        <header className="space-y-3 rounded-[18px] bg-cream p-5" style={{ borderLeft: "4px solid #B34716" }}>
          <h1 className="font-serif text-[32px] italic leading-tight sm:text-4xl">{A.bienvenue(user.firstName.trim())}</h1>
          {acces && (
            <p className="flex items-center gap-2 text-base font-medium text-sage">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-white" aria-hidden="true">
                <Icone nom="coche" className="h-4 w-4" />
              </span>
              {A.active}
            </p>
          )}
          <p className="text-base leading-relaxed text-ink">{A.texte}</p>
        </header>
        <Importer variante="client" lienInitial={acces?.lienFiche ?? null} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <a href="/boussole-decision/mon-espace/" className="inline-flex min-h-11 items-center gap-1.5 text-base font-medium text-link underline underline-offset-4">
        <Icone nom="fleche" className="h-4 w-4 rotate-180" />
        {ESPACE.verification.annuler}
      </a>
      <Importer />
    </div>
  );
}
