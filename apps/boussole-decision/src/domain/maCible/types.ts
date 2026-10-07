// Types de Ma Cible : entrée (§5.1) et sortie de l'IA (§8.1).

export type Langue = "fr" | "en" | "es";
export type Marche = "b2b" | "b2c" | "les_deux" | "je_ne_sais_pas";
export type Format = "individuel" | "groupe" | "presentiel" | "distance" | "conference" | "formation" | "mission" | "produit";
export type Adresse = "tu" | "vous";
export type Style = "chaleureux" | "direct" | "expert" | "enjoue";
export type Source = "quiz" | "carte" | "boussole" | null;
export type IdCible = "c1" | "c2" | "c3";
export type Verdict = "oui" | "en_partie" | "non";

export interface Talent {
  nom: string;            // nom du talent (Carte) ou du profil (quiz), facultatif
  mecanisme: string;      // obligatoire
  contexte: string;       // Contexte Déclencheur, obligatoire
  benefice: string;       // Super bénéfice, obligatoire
  antiContexte: string;   // obligatoire
  reussite: string;       // contextes de réussite, facultatif
  sousTalents: string[];  // depuis la Carte ou le quiz, non affichés en champ
  pistes: string[];       // pistes visées de la Carte
  aDeleguer: string[];    // zone à déléguer de la Carte (indice d'Anti-Contexte)
}

export interface Terrain {
  offre: string;
  marche: Marche | "";
  experience: string;
  clientsPasses: string;
  formats: Format[];
  zone: string;
  prixActuel: string;
  adresse: Adresse;
  style: Style;
}

export interface Reponse { id: string; question: string; reponse: string }

export interface EntreeMaCible {
  v: 1;
  langue: Langue;         // langue de l'interface
  source: Source;
  talent: Talent;
  terrain: Terrain;
  reponses: Reponse[];    // réponses aux questions de clarification, tous tours confondus
}

export interface Corrections {
  offre: string;          // offre réécrite (ou celle de l'esquisse si inchangée)
  cibles: { id: IdCible; verdict: Verdict; commentaire: string }[];
  antiCible: { verdict: Verdict; commentaire: string };
  idee: string;           // cible suggérée par la personne, facultative
}

/** Corps de la requête POST (§10.1). */
export type Demande =
  | { etape: "cadrage"; tour: 1 | 2 | 3; entree: EntreeMaCible; esquissePrecedente?: Esquisse; corrections?: Corrections }
  | { etape: "resultat"; entree: EntreeMaCible; esquisse: Esquisse; corrections: Corrections };

export type Canal = "linkedin" | "email" | "instagram" | "facebook" | "tiktok" | "youtube" | "newsletter" | "contenu"
  | "presentiel" | "evenements" | "partenariats" | "bouche_a_oreille" | "telephone" | "autre";
export interface Note { note: 1 | 2 | 3 | 4 | 5; raison: string }

export interface Question { id: "q1" | "q2" | "q3"; question: string; pourquoi: string; type: "choix" | "texte"; options: string[]; exemple: string }
export interface Esquisse {
  offre: string;
  cibles: { id: IdCible; nom: string; marche: "b2b" | "b2c"; enUneLigne: string; pourquoi: string }[];
  antiCible: string;
  hypotheses: string[];
}
export interface Cadrage { statut: "questions" | "esquisse" | "hors_sujet"; message: string; questions: Question[]; esquisse: Esquisse }

export interface Cible {
  id: IdCible; nom: string; marche: "b2b" | "b2c";
  portrait: string; douleur: string; ancrage: string; promesse: string;
  offre: { nom: string; format: string; duree: string; contenu: string[] };
  prix: { min: number; max: number; unite: string; base: "HT" | "TTC"; justification: string };
  pitch: string; pourquoi: string; exemple: string;
  scores: { urgence: Note; paiement: Note; acces: Note; plaisir: Note };
  lieux: { type: string; pourquoi: string; recherche: string }[];
  canaux: { canal: Canal; priorite: 1 | 2 | 3; action: string; pourquoi: string }[];
  linkedin: { pertinence: "forte" | "moyenne" | "faible"; motsCles: string; intitules: string[]; secteurs: string[]; tailles: string[]; zone: string; autres: string[]; astuce: string };
  messages: { linkedin: string; emailObjet: string; emailCorps: string };
  testTerrain: { profils: string; questions: string[]; signauxPositifs: string[]; signauxNegatifs: string[] };
}
export interface Resultat {
  langue: Langue;
  offre: { phrase: string; avant: string; apres: string };
  cibles: Cible[];
  antiCible: { portrait: string; signaux: string[]; lienAntiContexte: string; commentDire: string };
  plan30: { semaine: 1 | 2 | 3 | 4; titre: string; actions: { texte: string; cible: IdCible | "toutes"; canal: Canal; minutes: number }[] }[];
  hypotheses: string[];
  motPourToi: string;
}
/** Ce que la route renvoie pour un résultat : la sortie IA + le classement calculé (§9). */
export interface ResultatClasse extends Resultat { classement: { id: IdCible; score: number; rang: "prioritaire" | "secondaire" | "tertiaire"; alertePlaisir: boolean }[] }
