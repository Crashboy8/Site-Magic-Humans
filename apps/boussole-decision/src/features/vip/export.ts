import type { SupabaseClient } from "@supabase/supabase-js";

// Export « Tes données » : tout ce qui est gardé pour le compte connecté, en un seul fichier JSON.
// Chaque lecture passe par les règles de la base (RLS) et se limite aux lignes de la personne.
// Une table absente (SQL pas encore collé) ou illisible donne null, sans faire échouer l'export.

type Ligne = Record<string, unknown>;

interface Source {
  cle: string;
  table: string;
  colonne: string;
  /** Ordre stable pour lire page par page. */
  ordre: string[];
  /** Une seule ligne par compte. */
  une?: boolean;
}

const SOURCES: Source[] = [
  { cle: "ficheTalent", table: "talent_fiches", colonne: "user_id", ordre: ["user_id"], une: true },
  { cle: "profils", table: "profiles", colonne: "user_id", ordre: ["created_at", "id"] },
  { cle: "versions", table: "versions", colonne: "user_id", ordre: ["created_at", "id"] },
  { cle: "categories", table: "categories", colonne: "user_id", ordre: ["id"] },
  { cle: "criteres", table: "criteria", colonne: "user_id", ordre: ["id"] },
  { cle: "pistes", table: "opportunities", colonne: "user_id", ordre: ["id"] },
  { cle: "evaluations", table: "evaluations", colonne: "user_id", ordre: ["criterion_id", "opportunity_id"] },
  { cle: "commentairesRecus", table: "comments", colonne: "owner_id", ordre: ["created_at", "id"] },
  { cle: "parcours", table: "parcours_positions", colonne: "user_id", ordre: ["user_id"], une: true },
  { cle: "progression", table: "progression", colonne: "user_id", ordre: ["user_id"], une: true },
  { cle: "demandeGroupeM3", table: "demandes_groupe_m3", colonne: "user_id", ordre: ["user_id"], une: true },
];

/** Taille d'une page de lecture (sous le plafond par défaut de l'API Supabase). */
export const PAGE_EXPORT = 500;

async function lireTout(db: SupabaseClient, s: Source, userId: string): Promise<Ligne[] | null> {
  const lignes: Ligne[] = [];
  for (let debut = 0; ; debut += PAGE_EXPORT) {
    let requete = db.from(s.table).select("*").eq(s.colonne, userId);
    for (const o of s.ordre) requete = requete.order(o, { ascending: true });
    const { data, error } = await requete.range(debut, debut + PAGE_EXPORT - 1);
    if (error) return null;
    const page = (data ?? []) as Ligne[];
    lignes.push(...page);
    if (page.length < PAGE_EXPORT) return lignes;
  }
}

async function rpcLignes(db: SupabaseClient, nom: string): Promise<Ligne[] | null> {
  try {
    const { data, error } = await db.rpc(nom);
    if (error) return null;
    return Array.isArray(data) ? (data as Ligne[]) : [];
  } catch {
    return null;
  }
}

/** Le contenu du fichier téléchargé. */
export async function exporterMesDonnees(db: SupabaseClient, userId: string, maintenant: Date): Promise<Record<string, unknown>> {
  const [compte, accesClient, niveau, ...tables] = await Promise.all([
    db
      .from("app_users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => (error ? null : (data as Ligne | null))),
    rpcLignes(db, "mon_acces_client"),
    rpcLignes(db, "mon_niveau_acces"),
    ...SOURCES.map((s) => lireTout(db, s, userId).catch(() => null)),
  ]);
  const contenu: Record<string, unknown> = {
    format: "magic-humans-mes-donnees",
    version: 1,
    exporteLe: maintenant.toISOString(),
    compte,
    accesClient: accesClient ? (accesClient[0] ?? null) : null,
    niveauAcces: niveau ? (niveau[0] ?? null) : null,
  };
  SOURCES.forEach((s, i) => {
    const lignes = tables[i] as Ligne[] | null;
    contenu[s.cle] = s.une ? (lignes ? (lignes[0] ?? null) : null) : lignes;
  });
  return contenu;
}

/** Nom du fichier : magic-humans-mes-donnees-AAAA-MM-JJ.json */
export function nomFichierExport(maintenant: Date): string {
  return `magic-humans-mes-donnees-${maintenant.toISOString().slice(0, 10)}.json`;
}
