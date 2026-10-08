// Types de Ma Cible : entrée (§5.1) et sortie de l'IA (§8.1).

export type Langue = "fr" | "en" | "es";
export type Marche = "b2b" | "b2c" | "les_deux" | "je_ne_sais_pas";
export type Format = "individuel" | "groupe" | "presentiel" | "distance" | "conference" | "formation" | "mission" | "produit";
export type Adresse = "tu" | "vous";
export type Style = "chaleureux" | "direct" | "expert" | "enjoue";
export type Source = "quiz" | "carte" | "boussole" | null;
export type IdCible = "c1" | "c2" | "c3" | "c4" | "c5" | "c6";
export type IdCiblePrincipale = "c1" | "c2" | "c3";
export type IdIdee = "i1" | "i2" | "i3" | "i4" | "i5" | "i6" | "i7" | "i8";
export type IdPiste = "p1" | "p2" | "p3" | "p4" | "p5" | "p6";
export type IdNote = "n1" | "n2" | "n3" | "n4" | "n5";
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
  ciblesEnTete: string[];
}

export interface Reponse { id: string; question: string; reponse: string }

export type Frequence = "souvent" | "parfois" | "une_fois";
export type ThemeVerbatim = "douleur" | "declencheur" | "objection" | "resultat" | "autre";

export interface SyntheseTerrain {
  resume: string;
  profils: string[];
  douleurs: { texte: string; frequence: Frequence }[];
  verbatims: { id: string; note: IdNote; citation: string; theme: ThemeVerbatim }[];
  declencheurs: string[];
  objections: string[];
  motsCles: string[];
  nbNotes: number;
  faitLe: string;
}

export interface EntreeMaCible {
  v: 1;
  langue: Langue;         // langue de l'interface
  source: Source;
  talent: Talent;
  terrain: Terrain;
  reponses: Reponse[];    // réponses aux questions de clarification, tous tours confondus
  synthese: SyntheseTerrain | null;
}

export interface Corrections {
  offre: string;          // offre réécrite (ou celle de l'esquisse si inchangée)
  cibles: { id: IdCiblePrincipale; verdict: Verdict; commentaire: string }[];
  antiCible: { verdict: Verdict; commentaire: string };
  idee: string;           // cible suggérée par la personne, facultative
}

/** Corps de la requête POST (§10.1). */
export type Demande =
  | { etape: "cadrage"; tour: 1 | 2 | 3; entree: EntreeMaCible; esquissePrecedente?: Esquisse; corrections?: Corrections }
  | { etape: "resultat"; entree: EntreeMaCible; esquisse: Esquisse; corrections: Corrections };

export type Canal = "linkedin" | "email" | "instagram" | "facebook" | "tiktok" | "youtube" | "newsletter" | "contenu"
  | "presentiel" | "evenements" | "partenariats" | "bouche_a_oreille" | "telephone" | "autre";
export type Note5 = 1 | 2 | 3 | 4 | 5;
export interface Note { note: Note5; raison: string }
export interface NotesPressenties { urgence: Note5; paiement: Note5; acces: Note5; plaisir: Note5 }
export interface AutrePiste extends PisteEsquisse { notes: NotesPressenties }

export interface Question { id: "q1" | "q2" | "q3"; question: string; pourquoi: string; type: "choix" | "texte"; options: string[]; exemple: string }
export interface PisteEsquisse {
  id: IdPiste;
  nom: string;
  marche: "b2b" | "b2c";
  enUneLigne: string;
  raison: string;
  depuisIdees: IdIdee[];
}
export interface Esquisse {
  offre: string;
  cibles: { id: IdCiblePrincipale; nom: string; marche: "b2b" | "b2c"; enUneLigne: string; pourquoi: string; depuisIdees: IdIdee[] }[];
  antiCible: string;
  hypotheses: string[];
  autresPistes: PisteEsquisse[];
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
  depuisIdees: IdIdee[];
  verbatims: string[];
}
export interface Resultat {
  langue: Langue;
  offre: { phrase: string; avant: string; apres: string };
  cibles: Cible[];
  autresPistes: AutrePiste[];
  antiCible: { portrait: string; signaux: string[]; lienAntiContexte: string; commentDire: string };
  plan30: { semaine: 1 | 2 | 3 | 4; titre: string; actions: { texte: string; cible: IdCiblePrincipale | "toutes"; canal: Canal; minutes: number }[] }[];
  hypotheses: string[];
  motPourToi: string;
}

export type CategorieLieu = "salon" | "evenement" | "club" | "en_ligne" | "lieu" | "media";
export interface Portrait {
  prenom: string;
  age: string;
  situation: string;
  journee: string;
  declencheur: string;
  pourToi: string;
  dejaEssaye: string[];
  douleurs: { titre: string; detail: string; intensite: Note5; sesMots: string; verbatim: string }[];
  objections: { objection: string; reponse: string }[];
  criteresChoix: string[];
  sInforme: string[];
  lieux: { categorie: CategorieLieu; type: string; pourquoi: string; recherche: string }[];
}

export interface LignePiste { id: IdCible; score: number; alertePlaisir: boolean }
/** Ce qui s'ajoute à un résultat après coup. Gardé dans le navigateur avec le résultat. */
export interface Extras {
  portraits: Partial<Record<IdCible, Portrait>>;
  pistes: Partial<Record<IdPiste, { cible: Cible; ligne: LignePiste }>>;
}
export const EXTRAS_VIDES: Extras = { portraits: {}, pistes: {} };
/** Ce que la route renvoie pour un résultat : la sortie IA + le classement calculé (§9). */
export interface ResultatClasse extends Resultat { classement: { id: IdCible; score: number; rang: "prioritaire" | "secondaire" | "tertiaire"; alertePlaisir: boolean }[] }
