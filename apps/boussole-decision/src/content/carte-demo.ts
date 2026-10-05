// Carte de démonstration : Sam, 38 ans, coach et animateur, explore onze opportunités.
// Des critères personnalisés, des statuts variés : de quoi juger le relief tout de suite.
import { CARTE_SCHEMA_VERSION, type Carte, type CarteLieu, type LieuStatut } from "@/domain/carte";

const CRITERES = [
  { id: "lien", label: "Créer du lien humain", poids: 5 },
  { id: "cadre", label: "Un cadre et un objectif communs", poids: 4 },
  { id: "concret", label: "Du concret, peu d'écran", poids: 4 },
  { id: "revenus", label: "Des revenus suffisants", poids: 4 },
  { id: "liberte", label: "Liberté d'organisation", poids: 3 },
  { id: "apprendre", label: "Apprendre et grandir", poids: 2 },
];

// Scores dans l'ordre des critères : lien, cadre, concret, revenus, liberté, apprendre.
const LIEUX: [string, string, LieuStatut, number[], string][] = [
  ["coach", "Coach Talent Unique (indépendant)", "en_cours", [95, 70, 80, 60, 95, 85], "Premiers clients via le bouche-à-oreille."],
  ["ecole42", "Formateur soft skills à l'École 42", "en_cours", [90, 90, 75, 70, 60, 80], "Entretien prévu le mois prochain."],
  ["facilitateur", "Facilitateur d'intelligence collective", "a_explorer", [90, 85, 70, 85, 55, 75], ""],
  ["impro", "Créer une troupe d'improvisation", "a_explorer", [95, 80, 95, 25, 85, 90], "Le cœur y est, le modèle économique pas encore."],
  ["seminaires", "Animateur de séminaires d'équipe", "conquis", [90, 90, 85, 75, 60, 65], "Déjà trois missions réalisées."],
  ["rh", "Responsable RH en PME", "a_explorer", [70, 85, 60, 75, 40, 55], ""],
  ["benevoles", "Accompagner des bénévoles (association)", "a_explorer", [95, 80, 90, 30, 60, 60], ""],
  ["enseignant", "Enseignant en école de commerce", "a_explorer", [75, 85, 70, 60, 55, 60], ""],
  ["consultant", "Consultant en transformation (cabinet)", "a_explorer", [55, 70, 40, 95, 30, 70], "Bien payé, mais beaucoup de slides."],
  ["digital", "Chef de projet digital (CDI)", "ecarte", [40, 75, 15, 85, 35, 55], "Trop d'écran, trop seul."],
  ["video", "Créateur de contenu vidéo", "ecarte", [30, 30, 10, 45, 90, 60], "Mon contexte d'échec : seul devant un écran."],
];

export function carteDemo(): Carte {
  const lieux: CarteLieu[] = LIEUX.map(([id, nom, statut, scores, notes]) => ({
    id,
    nom,
    notes,
    statut,
    position: null,
    scores: Object.fromEntries(CRITERES.map((c, i) => [c.id, scores[i]])),
  }));
  return {
    schemaVersion: CARTE_SCHEMA_VERSION,
    nom: "La carte de Sam (démo)",
    criteres: CRITERES,
    lieux,
    modifieLe: new Date(0).toISOString(),
  };
}
