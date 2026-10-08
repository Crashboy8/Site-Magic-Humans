import type { Canal } from "./types";

type Icone =
  | "cible"
  | "medaille"
  | "trophee"
  | "ampoule"
  | "boussole"
  | "cle"
  | "fusee"
  | "outil"
  | "fleche"
  | "mallette"
  | "chapiteau"
  | "groupe"
  | "ecran"
  | "poignee"
  | "calendrier"
  | "journal"
  | "epingle"
  | "bulle"
  | "bulles"
  | "badge"
  | "enveloppe"
  | "stylo"
  | "telephone"
  | "etincelles"
  | "in"
  | "appareil"
  | "note"
  | "lecture"
  | "lien";

/** Icône d'une cible ou d'une piste, d'après les mots du nom et de la description. */
export function iconeCible(nom: string, description = ""): Icone {
  const texte = plat(`${nom} ${description}`);
  const regles: [string[], Icone][] = [
    [["militaire", "armee", "soldat"], "medaille"],
    [["athlete", "sportif", "sportive"], "trophee"],
    [["hpi", "haut potentiel", "multi-potentiel", "multipotentiel", "multi potentiel"], "ampoule"],
    [["senior", "pse", "plan social"], "boussole"],
    [["entrepreneur", "fondateur", "fondatrice"], "fusee"],
    [["repreneur"], "cle"],
    [["artisan", "artisane"], "outil"],
    [["reconversion"], "fleche"],
    [["cadre", "directeur", "directrice", "dirigeant", "dirigeante", "manager"], "mallette"],
  ];
  for (const [mots, icone] of regles) {
    if (mots.some((mot) => texte.includes(mot))) return icone;
  }
  return "cible";
}

/** Icône d'un lieu, d'après les mots de son type. */
export function iconeLieu(type: string): Icone {
  const texte = plat(type);
  const regles: [string[], Icone][] = [
    [["salon", "foire"], "chapiteau"],
    [["club", "reseau"], "groupe"],
    [["en ligne", "linkedin", "internet", "web"], "ecran"],
    [["association"], "poignee"],
    [["evenement", "conference", "congres"], "calendrier"],
    [["media", "presse", "journal"], "journal"],
  ];
  for (const [mots, icone] of regles) {
    if (mots.some((mot) => texte.includes(mot))) return icone;
  }
  return "epingle";
}

const ICONE_CANAL: Record<Canal, Icone> = {
  bouche_a_oreille: "bulles",
  linkedin: "in",
  evenements: "badge",
  presentiel: "poignee",
  email: "enveloppe",
  newsletter: "journal",
  contenu: "stylo",
  instagram: "appareil",
  facebook: "groupe",
  tiktok: "note",
  youtube: "lecture",
  partenariats: "lien",
  telephone: "telephone",
  autre: "etincelles",
};

/** Icône d'un canal de prospection. */
export function iconeCanal(canal: Canal): Icone {
  return ICONE_CANAL[canal];
}

function plat(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
