import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IMPORT_ACTIF } from "@/content/espace";
import { Icone } from "@/features/espace/Icones";
import { Importer } from "@/features/fiche/Importer";
import { getI18n } from "@/i18n/server";
import { requireUser } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getI18n()).t.espace.importer.titre };
}

export default async function ImporterPage() {
  await requireUser();
  const ESPACE = (await getI18n()).t.espace;
  if (!IMPORT_ACTIF) redirect("/mon-espace/");
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
