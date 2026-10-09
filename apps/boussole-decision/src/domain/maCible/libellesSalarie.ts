// Libellés français de la voie salarié (docs/cibleur-salarie-spec.md, §2.3).
// Utilisés dans les données envoyées à l'IA, et réutilisables par les écrans (PR S2).
import type {
  Contrat,
  Experience,
  SituationSalarie,
  TailleEntreprise,
  Valeur,
} from "./types";

export const LIBELLES_SALARIE = {
  situation: {
    en_poste: "En poste, je veux changer",
    recherche: "Je cherche un poste",
    reconversion: "Je change de métier",
    retour: "Je reviens après une pause",
    etudes: "Je sors des études",
  } satisfies Record<SituationSalarie, string>,
  experience: {
    moins3: "moins de 3 ans",
    "3a10": "3 à 10 ans",
    "10a20": "10 à 20 ans",
    plus20: "plus de 20 ans",
  } satisfies Record<Exclude<Experience, "">, string>,
  contrats: {
    cdi: "CDI",
    cdd_mission: "CDD ou mission",
    temps_partiel: "Temps partiel",
    portage_transition: "Portage ou management de transition",
    peu_importe: "Peu importe",
  } satisfies Record<Contrat, string>,
  tailles: {
    tpe: "Très petite (moins de 10)",
    pme: "PME",
    grande: "Grande entreprise",
    asso_public: "Association ou secteur public",
    peu_importe: "Peu importe",
  } satisfies Record<TailleEntreprise, string>,
  valeurs: {
    autonomie: "Autonomie",
    sens: "Sens",
    exigence: "Exigence",
    bienveillance: "Bienveillance",
    transparence: "Transparence",
    apprentissage: "Apprentissage",
    equilibre: "Équilibre de vie",
    reconnaissance: "Reconnaissance",
    equipe: "Esprit d'équipe",
    impact: "Impact sur le terrain",
    creativite: "Créativité",
    stabilite: "Stabilité",
  } satisfies Record<Valeur, string>,
} as const;

/** « 45 000 à 55 000 euros brut par an », « à partir de 45 000 euros… », ou chaîne vide. */
export function salaireVise(min: number | null, max: number | null): string {
  const f = (n: number) =>
    n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
  if (min !== null && max !== null)
    return min === max
      ? `${f(min)} euros brut par an`
      : `${f(min)} à ${f(max)} euros brut par an`;
  if (min !== null) return `à partir de ${f(min)} euros brut par an`;
  if (max !== null) return `jusqu'à ${f(max)} euros brut par an`;
  return "";
}
