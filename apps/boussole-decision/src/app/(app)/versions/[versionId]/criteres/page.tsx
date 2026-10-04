import { redirect } from "next/navigation";

// Ancienne étape « Mes critères » : remplacée par le tableau de décision.
export default async function CriteriaPage({ params }: PageProps<"/versions/[versionId]/criteres">) {
  const { versionId } = await params;
  redirect(`/versions/${versionId}/tableau/`);
}
