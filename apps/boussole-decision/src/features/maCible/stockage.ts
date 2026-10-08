// Stockage local de Ma Cible (§12.5). Clé `ma_cible_v1`. L'accès à `window.localStorage` est confiné à lire / ecrire / effacer.
import { validerCorrections } from "@/domain/maCible/entree";
import { classerCibles } from "@/domain/maCible/scores";
import { LIMITES } from "@/domain/maCible/limites";
import { EXTRAS_VIDES, type Extras, type ResultatClasse } from "@/domain/maCible/types";
import { validerCadrage, validerResultat } from "@/domain/maCible/validation";
import { ETAPES, NB_ACTIONS, TALENT_VIDE, TERRAIN_VIDE, etatInitial, type Etat } from "./etat";

export const CLE_STOCKAGE = "ma_cible_v1";

type Obj = Record<string, unknown>;
const objet = (v: unknown): Obj | null => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : null);
const chaine = (v: unknown) => (typeof v === "string" ? v : "");
const liste = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function lireEntree(brut: Obj | null): Etat["entree"] | null {
  const entree = brut;
  const talent = objet(entree?.talent);
  const terrain = objet(entree?.terrain);
  if (!entree || !talent || !terrain) return null;
  return {
    v: 1,
    langue: entree.langue === "en" || entree.langue === "es" ? entree.langue : "fr",
    source: entree.source === "quiz" || entree.source === "carte" || entree.source === "boussole" ? entree.source : null,
    talent: {
      ...TALENT_VIDE,
      nom: chaine(talent.nom),
      mecanisme: chaine(talent.mecanisme),
      contexte: chaine(talent.contexte),
      benefice: chaine(talent.benefice),
      antiContexte: chaine(talent.antiContexte),
      reussite: chaine(talent.reussite),
      sousTalents: liste(talent.sousTalents),
      pistes: liste(talent.pistes),
      aDeleguer: liste(talent.aDeleguer),
    },
    terrain: {
      ...TERRAIN_VIDE,
      offre: chaine(terrain.offre),
      marche: ["b2b", "b2c", "les_deux", "je_ne_sais_pas"].includes(chaine(terrain.marche)) ? (terrain.marche as Etat["entree"]["terrain"]["marche"]) : "",
      experience: chaine(terrain.experience),
      clientsPasses: chaine(terrain.clientsPasses),
      formats: liste(terrain.formats) as Etat["entree"]["terrain"]["formats"],
      zone: chaine(terrain.zone),
      prixActuel: chaine(terrain.prixActuel),
      adresse: terrain.adresse === "tu" ? "tu" : "vous",
      style: (["chaleureux", "direct", "expert", "enjoue"].includes(chaine(terrain.style)) ? terrain.style : "chaleureux") as Etat["entree"]["terrain"]["style"],
      ciblesEnTete: liste(terrain.ciblesEnTete).slice(0, LIMITES.ciblesEnTete.items).map((s) => s.slice(0, LIMITES.ciblesEnTete.max)),
    },
    reponses: Array.isArray(entree.reponses)
      ? entree.reponses.flatMap((r) => {
          const x = objet(r);
          return x ? [{ id: chaine(x.id), question: chaine(x.question), reponse: chaine(x.reponse) }] : [];
        })
      : [],
    synthese: null,
  };
}

/** Portraits et pistes creusées : absents ou non validés en V2b (1/3) → vides. */
function lireExtras(v: unknown): Extras {
  const o = objet(v);
  if (!o) return { portraits: {}, pistes: {} };
  return { portraits: {}, pistes: {} };
}

export function serialiser(etat: Etat): string {
  return JSON.stringify(etat);
}

/** `null` si le JSON est invalide, la version inconnue ou l'état incohérent. Ne lève jamais d'erreur. */
export function deserialiser(brut: string | null): Etat | null {
  if (!brut) return null;
  try {
    const o = objet(JSON.parse(brut));
    if (!o || o.v !== 1) return null;
    const etape = ETAPES.find((x) => x === o.etape);
    const entree = lireEntree(objet(o.entree));
    if (!etape || !entree) return null;
    if (!Array.isArray(o.coches) || o.coches.length !== NB_ACTIONS || o.coches.some((c) => typeof c !== "boolean")) return null;
    const tour = o.tour === 1 || o.tour === 2 || o.tour === 3 ? o.tour : null;
    if (!tour) return null;

    const base = etatInitial();
    let cadrage: Etat["cadrage"] = null;
    if (o.cadrage !== null && o.cadrage !== undefined) {
      const c = objet(o.cadrage);
      const v = validerCadrage(c, c?.statut === "questions" ? 1 : tour);
      if (!v.ok) return null;
      cadrage = v.valeur;
    }
    let resultat: ResultatClasse | null = null;
    if (o.resultat !== null && o.resultat !== undefined) {
      const { classement: _classement, ...sansClassement } = objet(o.resultat) ?? {};
      void _classement;
      const v = validerResultat(sansClassement);
      if (!v.ok) return null;
      resultat = { ...v.valeur, classement: classerCibles(v.valeur.cibles) };
    }
    // Étapes qui exigent des données.
    if (etape === "questions" && cadrage?.statut !== "questions") return null;
    if (etape === "esquisse" && cadrage?.statut !== "esquisse") return null;
    if (etape === "resultat" && !resultat) return null;

    const corr = o.corrections ? validerCorrections(o.corrections) : null;
    const plusLoinLu = ETAPES.find((x) => x === o.plusLoin) ?? etape;
    const plusLoin = ETAPES.indexOf(plusLoinLu) >= ETAPES.indexOf(etape) ? plusLoinLu : etape;
    return {
      ...base,
      maj: chaine(o.maj) || base.maj,
      etape,
      entree,
      prenom: chaine(o.prenom),
      cadrage,
      tour,
      nouvelleEsquisseFaite: o.nouvelleEsquisseFaite === true,
      corrections: corr?.ok ? corr.corrections : null,
      resultat,
      resultatLe: typeof o.resultatLe === "string" ? o.resultatLe : null,
      coches: o.coches as boolean[],
      plusLoin,
      resultatPerime: o.resultatPerime === true,
      entreeDuResultat: lireEntree(objet(o.entreeDuResultat)),
      extras: o.extras === undefined ? EXTRAS_VIDES : lireExtras(o.extras),
    };
  } catch {
    return null;
  }
}

export function lire(): Etat | null {
  if (typeof window === "undefined") return null;
  try {
    return deserialiser(window.localStorage.getItem(CLE_STOCKAGE));
  } catch {
    return null;
  }
}

export function ecrire(etat: Etat): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_STOCKAGE, serialiser(etat));
  } catch {
    // Stockage plein ou bloqué (navigation privée) : le travail reste en mémoire.
  }
}

export function effacer(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE_STOCKAGE);
  } catch {
    // rien à faire
  }
}
