// « Où j'en suis ? » : une teinte par branche, une icône par étape, par voie et par outil.
// Fonds blanc et crème, beaucoup de couleurs, pas de bleu foncé (le Salarié est en bleu ciel).
import type { CSSProperties } from "react";
import type { Branche, ChoixVoie } from "@/domain/parcours/types";
import type { NomIcone } from "@/features/espace/Icones";

export interface Teinte {
  /** Couleur vive : pastilles, traits, remplissages. */
  forte: string;
  claire: string;
  fond: string;
  /** Texte sur blanc, crème ou fond : contraste AA (vérifié par les tests). */
  texte: string;
  /** Bouton plein et sa couleur de texte : contraste AA. */
  bouton: string;
  boutonTexte: string;
}

const BLANC = "#FFFFFF";
const ENCRE = "#3A2F24";

export const TEINTES: Record<Branche, Teinte> = {
  tronc: { forte: "#D4532C", claire: "#F6D2C6", fond: "#FDE8E1", texte: "#A8431A", bouton: "#B8441F", boutonTexte: BLANC },
  entrepreneur: { forte: "#1F9E8C", claire: "#BFE8E1", fond: "#E5F6F3", texte: "#14665B", bouton: "#1A7A6D", boutonTexte: BLANC },
  salarie: { forte: "#2A9AD8", claire: "#C6E6F8", fond: "#EEF8FE", texte: "#155F8C", bouton: "#1A6FA3", boutonTexte: BLANC },
  passerelle: { forte: "#8A63BC", claire: "#E4D6F0", fond: "#F3ECF8", texte: "#5F3F8F", bouton: "#6E4E96", boutonTexte: BLANC },
  soi: { forte: "#D13B72", claire: "#F6CFDE", fond: "#FCE7EF", texte: "#9C1E4E", bouton: "#B4235A", boutonTexte: BLANC },
  aboutissement: { forte: "#E0A526", claire: "#F5E1AE", fond: "#FFF5D9", texte: "#7A5200", bouton: "#F2C14E", boutonTexte: ENCRE },
  module: { forte: "#3C9A63", claire: "#C9EBD7", fond: "#EAF7EF", texte: "#22673F", bouton: "#2B7A4E", boutonTexte: BLANC },
};

/** Les variables CSS d'une teinte, lues par les classes bg-(--oj-fond), text-(--oj-texte)… */
export function styleTeinte(t: Teinte): CSSProperties {
  return {
    "--oj-forte": t.forte,
    "--oj-claire": t.claire,
    "--oj-fond": t.fond,
    "--oj-texte": t.texte,
    "--oj-bouton": t.bouton,
    "--oj-bouton-texte": t.boutonTexte,
  } as CSSProperties;
}

export const styleBranche = (b: Branche) => styleTeinte(TEINTES[b]);

/** Une couleur #RRGGBB avec de la transparence (halo qui pulse autour de l'étape actuelle). */
export function transparence(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(n.slice(i, i + 2), 16));
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** La teinte d'une voie : sa branche principale. */
export const BRANCHE_DE_LA_VOIE: Record<ChoixVoie, Branche> = {
  A: "entrepreneur",
  B: "salarie",
  C: "passerelle",
  D: "passerelle",
  E: "entrepreneur",
  K: "soi",
  inconnue: "tronc",
};

export const ICONE_VOIE: Record<ChoixVoie, NomIcone> = {
  A: "fusee",
  B: "mallette",
  C: "pont",
  D: "retour",
  E: "bifurcation",
  K: "coeur",
  inconnue: "interrogation",
};

/** Fond de la pastille d'une voie : la voie hybride mêle les deux branches. */
export function fondVoie(voie: ChoixVoie): string {
  if (voie === "E") return `linear-gradient(135deg, ${TEINTES.entrepreneur.forte} 0%, ${TEINTES.entrepreneur.forte} 48%, ${TEINTES.salarie.forte} 52%, ${TEINTES.salarie.forte} 100%)`;
  return TEINTES[BRANCHE_DE_LA_VOIE[voie]].forte;
}

export const ICONE_ETAPE: Readonly<Record<string, NomIcone>> = {
  connaitre: "ampoule",
  nommer: "etiquette",
  cap: "boussole",
  transition: "pont",
  valoriser: "trophee",
  e_cible: "cibleur",
  e_terrain: "loupe",
  e_offre: "cadeau",
  e_reseau: "reseau",
  e_vendre: "megaphone",
  e_vivre: "plante",
  s_cible: "cibleur",
  s_terrain: "loupe",
  s_reseau: "reseau",
  s_supports: "document",
  s_strategie: "drapeau",
  s_epanouir: "plante",
  k_connaitre: "coeur",
  k_defauts: "balance",
  k_qualites: "etoile",
  k_explorer: "carte",
  ikigai: "soleil",
};

export const iconeEtape = (id: string): NomIcone => ICONE_ETAPE[id] ?? "etoile";

const ICONE_OUTIL: Record<string, NomIcone> = {
  qcm: "qcm",
  quiz_amour: "amour",
  carte: "carte",
  carte_pistes: "carte",
  cibleur: "cibleur",
  boussole: "boussole",
  boussole_relation: "coeur",
  mon_espace: "dossier",
  appel_decouverte: "horloge",
};

export const iconeOutil = (id: string): NomIcone => ICONE_OUTIL[id] ?? "fleche";

/** Les points d'attention de la voie hybride. */
export const ICONE_ATTENTION: Record<string, NomIcone> = {
  temps: "horloge",
  energie: "eclair",
  positionnement: "boussole",
  contrat: "document",
};

/** Autodiagnostic argent, de 1 à 5 : du rose au vert, texte lisible sur chaque bulle. */
export const NOTES_ARGENT: readonly { fond: string; texte: string }[] = [
  { fond: "#B4235A", texte: BLANC },
  { fond: "#C2512B", texte: BLANC },
  { fond: "#F2C14E", texte: ENCRE },
  { fond: "#A7D38A", texte: ENCRE },
  { fond: "#2B7A4E", texte: BLANC },
];

/** Les couleurs des confettis : toutes les branches. */
export const COULEURS_FETE = (Object.keys(TEINTES) as Branche[]).map((b) => TEINTES[b].forte);
