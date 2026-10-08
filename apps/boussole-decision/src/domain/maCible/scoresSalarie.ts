// Double note de la voie salarié (docs/cibleur-salarie-spec.md, §3). Fonctions pures, calculées par le code, jamais par l'IA.
import type {
  IdCiblePrincipale,
  LigneCorrespondance,
  NotesBesoin,
  NotesEnvie,
  PatronIdeal,
} from "./types";

/** Sous-notes de chaque côté, dans l'ordre d'affichage. */
export const SOUS_NOTES_BESOIN: readonly {
  cle: keyof NotesBesoin;
  libelle: string;
}[] = [
  { cle: "urgence", libelle: "Urgence de son problème" },
  { cle: "rarete", libelle: "Rareté de ton profil pour lui" },
  { cle: "paiement", libelle: "Capacité à embaucher et à payer" },
  { cle: "acces", libelle: "Facilité à le joindre" },
];
export const SOUS_NOTES_ENVIE: readonly {
  cle: keyof NotesEnvie;
  libelle: string;
}[] = [
  { cle: "management", libelle: "Style de management" },
  { cle: "valeurs", libelle: "Valeurs" },
  { cle: "declencheur", libelle: "Ton Contexte Déclencheur présent" },
  { cle: "cadre", libelle: "Cadre de vie (zone, contrat, salaire)" },
];

const auDixieme = (n: number) => Math.round(n * 10) / 10;
const moyenneSur10 = (notes: readonly number[]) =>
  auDixieme((notes.reduce((a, b) => a + b, 0) / notes.length) * 2);

/** « Il a besoin de toi », sur 10 : moyenne des 4 sous-notes × 2, au dixième. */
export function besoinSur10(b: NotesBesoin): number {
  return moyenneSur10([b.urgence, b.rarete, b.paiement, b.acces]);
}

/** « Tu as besoin de lui », sur 10. */
export function envieSur10(e: NotesEnvie): number {
  return moyenneSur10([e.management, e.valeurs, e.declencheur, e.cadre]);
}

/** La correspondance est la plus basse des deux notes : il faut les deux à la fois. */
export function correspondance(b: NotesBesoin, e: NotesEnvie): number {
  return Math.min(besoinSur10(b), envieSur10(e));
}

/** Note affichée avec une virgule : 7,5. */
export function noteAffichee(n: number): string {
  return auDixieme(n).toFixed(1).replace(".", ",");
}

const RANGS: readonly LigneCorrespondance["rang"][] = [
  "prioritaire",
  "secondaire",
  "tertiaire",
];

/**
 * Classe les patrons : correspondance décroissante, puis « tu as besoin de lui » (le plaisir passe avant),
 * puis « il a besoin de toi », enfin l'identifiant.
 */
export function classerPatrons(
  patrons: readonly Pick<PatronIdeal, "id" | "besoin" | "envie">[],
): LigneCorrespondance[] {
  const lignes = patrons.map((p) => {
    const besoin = besoinSur10(p.besoin);
    const envie = envieSur10(p.envie);
    return {
      id: p.id as IdCiblePrincipale,
      besoin,
      envie,
      correspondance: Math.min(besoin, envie),
    };
  });
  lignes.sort(
    (a, b) =>
      b.correspondance - a.correspondance ||
      b.envie - a.envie ||
      b.besoin - a.besoin ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
  return lignes.map((l, i) => ({ ...l, rang: RANGS[i] ?? "tertiaire" }));
}
