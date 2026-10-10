// « Où j'en suis ? » : types du parcours accompagné (parcours.json).
// Deux formes : le fichier brut, lu seulement sur le serveur, et le contenu public envoyé au navigateur (contenu.ts).

export const VOIES = ["A", "B", "C", "D", "E", "K"] as const;
export type VoieId = (typeof VOIES)[number];

/** Réponse à la question de voie : une voie, ou « Je ne sais pas encore ». */
export type ChoixVoie = VoieId | "inconnue";

export type Branche = "tronc" | "passerelle" | "entrepreneur" | "salarie" | "soi" | "aboutissement" | "module";

/** Effet d'une étape sur l'échelle Réussir dans le Plaisir. */
export type EffetNiveau = "vers" | "atteint" | "garde" | "transversal";

/** Réponse à un critère : Oui (2 points), En partie (1), Pas encore (0). Les points viennent de regle_position.reponses. */
export const REPONSES = ["oui", "en_partie", "pas_encore"] as const;
export type Reponse = (typeof REPONSES)[number];

// Fichier brut ------------------------------------------------------------------------------------

export interface CritereBrut {
  id: string;
  texte: string;
  question: string;
  essentiel: boolean;
}

export interface ActionBrute {
  id: string;
  texte: string;
  outil: string | null;
  url?: string;
}

export interface SeanceBrute {
  id: string;
  nom: string;
  prix: string;
  duree: string;
}

export interface EtapeBrute {
  id: string;
  code: string;
  branche: Branche;
  branche_nom: string;
  nom: string;
  question: string;
  objectif: string;
  criteres: CritereBrut[];
  seances: SeanceBrute[];
  actions: ActionBrute[];
  blocages: string[];
  niveau_reussir_dans_le_plaisir: { effet: EffetNiveau; niveaux: { code: string; titre: string }[]; note: string };
  themes: { valeurs: boolean; remuneration: boolean };
}

export interface MutualisableBrut {
  etapes: string[];
  nom: string;
  texte: string;
}

export interface PointAttentionBrut {
  id: string;
  nom: string;
  texte: string;
}

/** Le point d'attention qui en remplace un autre dans un cas précis (voie E : freelance qui cherche un poste). */
export interface PointAttentionVarianteBrut extends PointAttentionBrut {
  remplace: string;
}

export interface VoieBrute {
  id: VoieId;
  nom: string;
  pro: boolean;
  choix: string;
  description: string;
  etapes: string[];
  offres: string[];
  modules_transversaux?: string[];
  etapes_paralleles?: { entrepreneur: string[]; salarie: string[] };
  aboutissement?: string;
  mutualisables?: MutualisableBrut[];
  points_attention?: PointAttentionBrut[];
  /** Voie E, quand la personne est freelance et cherche un poste : remplace le point d'attention « remplace ». */
  point_attention_freelance?: PointAttentionVarianteBrut;
}

export interface ParcoursBrut {
  version: string;
  promesse: string;
  structure: {
    tronc_commun: string[];
    modules_transversaux: { etape: string; nom: string; autodiagnostic: { question: string; echelle: number[]; seuil_module: number } }[];
  };
  question_voie: { texte: string; choix: { voie: VoieId | null; libelle: string }[] };
  regle_position: { reponses: Record<Reponse, number>; seuil_pourcentage: number };
  voies: VoieBrute[];
  etapes: EtapeBrute[];
  outils: { id: string; nom: string; url: string }[];
  offres: { id: string; nom: string; prix: string; duree: string; contenu: string; url?: string }[];
  niveaux_reussir_dans_le_plaisir: { niveaux: { code: string; titre: string; libelle: string; sous_titre: string; conseil: string | null }[] };
}

// Contenu public ----------------------------------------------------------------------------------

export interface Critere {
  id: string;
  texte: string;
  question: string;
  essentiel: boolean;
}

/** Un outil ou une offre, avec son adresse : l'identifiant choisit l'icône du bouton. */
export interface Lien {
  id: string;
  nom: string;
  url: string;
}

export interface ActionType {
  id: string;
  texte: string;
  /** Lien vers l'outil (outils[].url) ou vers l'offre (Appel Découverte) ; null pour une action à faire de son côté. */
  lien: Lien | null;
  /** Critères que l'action aide à passer à Oui (voir actionsCriteres.ts). */
  debloque: string[];
}

export interface Etape {
  id: string;
  code: string;
  branche: Branche;
  brancheNom: string;
  nom: string;
  question: string;
  objectif: string;
  criteres: Critere[];
  actions: ActionType[];
  blocages: string[];
  niveau: { effet: EffetNiveau; codes: string[]; note: string };
  /** L'étape porte un critère valeurs (themes.valeurs). */
  valeurs: boolean;
}

export interface Mutualisable {
  etapes: string[];
  nom: string;
  texte: string;
}

export interface PointAttention {
  id: string;
  nom: string;
  texte: string;
}

export interface Voie {
  id: VoieId;
  nom: string;
  pro: boolean;
  choix: string;
  description: string;
  etapes: string[];
  offres: string[];
  /** Le module Argent est proposé dans cette voie. */
  argent: boolean;
  /** Voie hybride : les deux branches suivies en même temps, puis l'aboutissement. */
  paralleles: { entrepreneur: string[]; salarie: string[]; fin: string } | null;
  mutualisables: Mutualisable[];
  pointsAttention: PointAttention[];
  /** Les mêmes points d'attention, pour qui est freelance et cherche un poste (voie E) ; égaux aux autres dans les autres voies. */
  pointsAttentionFreelance: PointAttention[];
}

export interface Offre {
  id: string;
  nom: string;
  /** null quand le fichier dit « non indiqué ». */
  prix: string | null;
  duree: string | null;
  contenu: string;
  url: string | null;
}

export interface Niveau {
  code: string;
  titre: string;
  libelle: string;
  sousTitre: string;
  conseil: string | null;
}

export interface ModuleArgent {
  nom: string;
  objectif: string;
  question: string;
  min: number;
  max: number;
  /** À cette note ou moins, le module est proposé. */
  seuil: number;
  actions: ActionType[];
  seances: { id: string; nom: string; prix: string; duree: string }[];
}

export interface ParcoursPublic {
  promesse: string;
  questionVoie: { texte: string; choix: { voie: ChoixVoie; libelle: string }[] };
  points: Record<Reponse, number>;
  /** Seuil d'une étape atteinte, en pourcentage du maximum. */
  seuil: number;
  tronc: string[];
  voies: Record<VoieId, Voie>;
  etapes: Record<string, Etape>;
  offres: Record<string, Offre>;
  /** L'échelle Réussir dans le Plaisir, du niveau 0 au niveau 7. */
  niveaux: Niveau[];
  argent: ModuleArgent;
  outils: Record<string, Lien>;
}
