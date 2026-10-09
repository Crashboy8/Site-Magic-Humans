// Couverture des idées, pistes et identifiants de phrases. Aucune relance du modèle pour ces motifs.
import { normaliserPourComparer } from "./terrain";
import { TEXTES_QUALITE, textesQualite } from "./textesQualite";
import type { AutrePiste, IdIdee, IdPiste, Langue, Marche, Note5, NotesPressenties, PisteEsquisse } from "./types";

const IDS_PISTES: readonly IdPiste[] = ["p1", "p2", "p3", "p4", "p5", "p6"];

export const TEXTE_PISTE_LIGNE = TEXTES_QUALITE.fr.pisteLigne;
export const TEXTE_PISTE_RAISON = TEXTES_QUALITE.fr.pisteRaison;

type Piste = PisteEsquisse | AutrePiste;
type SortieIdees = {
  cibles: { depuisIdees: IdIdee[] }[];
  autresPistes: Piste[];
  hypotheses: string[];
};

function idIdee(index: number): IdIdee {
  return `i${index + 1}` as IdIdee;
}

function filtrerIds(ids: readonly string[], nIdees: number): { ids: IdIdee[]; retires: number } {
  const vus = new Set<string>();
  const gardes: IdIdee[] = [];
  let retires = 0;
  for (const id of ids) {
    const n = /^i([1-8])$/.test(id) ? Number(id.slice(1)) : 0;
    if (n < 1 || n > nIdees || vus.has(id)) {
      retires += 1;
      continue;
    }
    vus.add(id);
    gardes.push(id as IdIdee);
  }
  return { ids: gardes, retires };
}

function idLibre(pistes: readonly { id: string }[]): IdPiste | null {
  const pris = new Set(pistes.map((p) => p.id));
  return IDS_PISTES.find((id) => !pris.has(id)) ?? null;
}

function pistePourIdee(id: IdPiste, ideeId: IdIdee, nom: string, marche: Marche | "", avecNotes: boolean, langue: Langue): Piste {
  const T = textesQualite(langue);
  const base: PisteEsquisse = {
    id,
    nom: nom.slice(0, 80),
    marche: marche === "b2c" ? "b2c" : "b2b",
    enUneLigne: T.pisteLigne,
    raison: T.pisteRaison,
    depuisIdees: [ideeId],
  };
  if (!avecNotes) return base;
  const notes: NotesPressenties = { urgence: 3, paiement: 3, acces: 3, plaisir: 3 };
  return { ...base, notes };
}

function phraseHypothese(idee: string, langue: Langue): string {
  return textesQualite(langue).ideeNonEtudiee(idee);
}

/**
 * Chaque idée de la personne apparaît dans une cible ou une autre piste.
 * Les identifiants au-delà du nombre d'idées, et les doublons, sont retirés.
 */
export function couvrirIdees<T extends SortieIdees>(entree: T, idees: string[], marche: Marche | "", avecNotes: boolean, langue: Langue = "fr"): { sortie: T; ajoutees: number } {
  const sortie = structuredClone(entree);
  let ajoutees = 0;

  const nettoyer = (ids: IdIdee[]) => {
    const filtre = filtrerIds(ids, idees.length);
    ajoutees += filtre.retires;
    return filtre.ids;
  };
  for (const cible of sortie.cibles) cible.depuisIdees = nettoyer(cible.depuisIdees ?? []);
  for (const piste of sortie.autresPistes) piste.depuisIdees = nettoyer(piste.depuisIdees ?? []);

  const citees = new Set<string>();
  for (const cible of sortie.cibles) for (const id of cible.depuisIdees) citees.add(id);
  for (const piste of sortie.autresPistes) for (const id of piste.depuisIdees) citees.add(id);

  for (let i = 0; i < idees.length; i++) {
    const ideeId = idIdee(i);
    if (citees.has(ideeId)) continue;
    if (sortie.autresPistes.length < 6) {
      const id = idLibre(sortie.autresPistes);
      if (!id) continue;
      sortie.autresPistes.push(pistePourIdee(id, ideeId, idees[i] ?? "", marche, avecNotes, langue));
      citees.add(ideeId);
      ajoutees += 1;
      continue;
    }
    let index = -1;
    for (let j = sortie.autresPistes.length - 1; j >= 0; j--) {
      if (sortie.autresPistes[j].depuisIdees.length === 0) {
        index = j;
        break;
      }
    }
    if (index >= 0) {
      const id = sortie.autresPistes[index].id;
      sortie.autresPistes[index] = pistePourIdee(id, ideeId, idees[i] ?? "", marche, avecNotes, langue);
      citees.add(ideeId);
      ajoutees += 1;
      continue;
    }
    if (sortie.hypotheses.length < 4) {
      sortie.hypotheses.push(phraseHypothese(idees[i] ?? "", langue));
      citees.add(ideeId);
      ajoutees += 1;
    }
  }

  return { sortie, ajoutees };
}

type SortiePistes = {
  cibles: { nom: string; depuisIdees: IdIdee[] }[];
  autresPistes: Piste[];
  hypotheses: string[];
};

function aDesNotes(p: Piste): p is AutrePiste {
  return "notes" in p && p.notes !== undefined;
}

/** Identifiants p1 à p6, notes ramenées entre 1 et 5, pistes homonymes des cibles retirées, puis couverture des idées. */
export function qualitePistes<T extends SortiePistes>(entree: T, idees: string[], marche: Marche | "", avecNotes: boolean, langue: Langue = "fr"): { sortie: T; reparations: number } {
  const sortie = structuredClone(entree);
  let reparations = 0;
  if (sortie.autresPistes.length > 6) {
    sortie.autresPistes = sortie.autresPistes.slice(0, 6);
    reparations += 1;
  }

  const renumeroter = () => {
    let change = false;
    sortie.autresPistes.forEach((p, i) => {
      const id = IDS_PISTES[i];
      if (id && p.id !== id) {
        p.id = id;
        change = true;
      }
    });
    if (change) reparations += 1;
  };
  renumeroter();

  for (const piste of sortie.autresPistes) {
    if (!aDesNotes(piste)) continue;
    for (const cle of ["urgence", "paiement", "acces", "plaisir"] as const) {
      const n = piste.notes[cle];
      if (n < 1 || n > 5) {
        piste.notes[cle] = Math.min(5, Math.max(1, Math.round(n))) as Note5;
        reparations += 1;
      }
    }
  }

  const noms = new Set(sortie.cibles.map((c) => normaliserPourComparer(c.nom)));
  const gardees = sortie.autresPistes.filter((p) => !noms.has(normaliserPourComparer(p.nom)));
  if (gardees.length !== sortie.autresPistes.length) {
    reparations += sortie.autresPistes.length - gardees.length;
    sortie.autresPistes = gardees;
    renumeroter();
  }

  const couvert = couvrirIdees(sortie, idees, marche, avecNotes, langue);
  return { sortie: couvert.sortie, reparations: reparations + couvert.ajoutees };
}

/** Sans synthèse, les identifiants de phrases des cibles sont toujours vides. */
export function filtrerVerbatimsCibles<T extends { cibles: { verbatims: string[] }[] }>(
  entree: T,
  synthese: { verbatims: { id: string }[] } | null,
): { sortie: T; retires: number } {
  const sortie = structuredClone(entree);
  const connus = new Set(synthese?.verbatims.map((v) => v.id) ?? []);
  let retires = 0;
  for (const cible of sortie.cibles) {
    const source = Array.isArray(cible.verbatims) ? cible.verbatims : [];
    if (!synthese) {
      retires += source.length;
      cible.verbatims = [];
      continue;
    }
    const gardes: string[] = [];
    for (const id of source) {
      if (connus.has(id) && !gardes.includes(id) && gardes.length < 3) gardes.push(id);
      else retires += 1;
    }
    cible.verbatims = gardes;
  }
  return { sortie, retires };
}

/** Même filtre pour les douleurs d'un portrait : un identifiant inconnu devient "" (§9.4). */
export function filtrerVerbatimsPortrait<T extends { douleurs: { verbatim: string }[] }>(
  portrait: T,
  synthese: { verbatims: { id: string }[] } | null,
): { sortie: T; retires: number } {
  const sortie = structuredClone(portrait);
  const connus = new Set(synthese?.verbatims.map((v) => v.id) ?? []);
  let retires = 0;
  for (const d of sortie.douleurs) {
    if (d.verbatim && !connus.has(d.verbatim)) {
      d.verbatim = "";
      retires += 1;
    }
  }
  return { sortie, retires };
}
