// Contenu public du parcours : ce que le navigateur reçoit, tiré de parcours.json.
// Le fichier brut reste sur le serveur (server-only) : on n'envoie que les champs affichés,
// sans les notes de travail (seance_detail, livrables, correspondances, statuts, sources).
import "server-only";
import type { Locale } from "@/i18n/config";
import { typographier } from "@/i18n/typo";
import { ACTIONS_CRITERES } from "./actionsCriteres";
import fichier from "./parcours.json";
import type { ActionBrute, ActionType, Etape, EtapeBrute, Offre, ParcoursBrut, ParcoursPublic, Voie, VoieBrute, VoieId } from "./types";

const BRUT = fichier as unknown as ParcoursBrut;

/** Le parcours n'existe qu'en français pour ce premier lot : l'anglais et l'espagnol viendront avec leur propre fichier. */
const FICHIERS: Partial<Record<Locale, ParcoursBrut>> = { fr: BRUT };

/** Outil pas encore proposé à l'écran : pas de bouton tant qu'il n'existe pas (Cibleur, voie salarié). */
const OUTILS_SANS_BOUTON = new Set(["cibleur_salarie"]);

/** Notes de travail glissées en fin de texte dans certaines offres : jamais affichées. */
const NOTES_INTERNES = [/\s*Source\s*:[\s\S]*$/, /\s*Précisé par Pierre[^.]*\./g];
const NON_INDIQUE = /^non indiqu/i;

function sansNotes(texte: string): string {
  return NOTES_INTERNES.reduce((t, motif) => t.replace(motif, ""), texte).trim();
}

function lienAction(brut: ParcoursBrut, action: ActionBrute): ActionType["lien"] {
  if (!action.outil || OUTILS_SANS_BOUTON.has(action.outil)) return null;
  const outil = brut.outils.find((o) => o.id === action.outil);
  if (outil) return { id: outil.id, nom: outil.nom, url: outil.url };
  const offre = brut.offres.find((o) => o.id === action.outil);
  return offre?.url ? { id: offre.id, nom: offre.nom, url: offre.url } : null;
}

function actionPublique(brut: ParcoursBrut, action: ActionBrute): ActionType {
  const duFichier = (action as ActionBrute & { debloque?: string[] }).debloque;
  return {
    id: action.id,
    texte: action.texte,
    lien: lienAction(brut, action),
    debloque: [...(duFichier ?? ACTIONS_CRITERES[action.id] ?? [])],
  };
}

function etapePublique(brut: ParcoursBrut, e: EtapeBrute): Etape {
  const n = e.niveau_reussir_dans_le_plaisir;
  return {
    id: e.id,
    code: e.code,
    branche: e.branche,
    brancheNom: e.branche_nom,
    nom: e.nom,
    question: e.question,
    objectif: e.objectif,
    criteres: e.criteres.map(({ id, texte, question, essentiel }) => ({ id, texte, question, essentiel })),
    actions: e.actions.map((a) => actionPublique(brut, a)),
    blocages: [...e.blocages],
    niveau: { effet: n.effet, codes: n.niveaux.map((x) => x.code), note: n.note },
    valeurs: e.themes.valeurs,
  };
}

function voiePublique(v: VoieBrute): Voie {
  return {
    id: v.id,
    nom: v.nom,
    pro: v.pro,
    choix: v.choix,
    description: v.description,
    etapes: [...v.etapes],
    offres: [...v.offres],
    argent: (v.modules_transversaux ?? []).includes("argent"),
    paralleles: v.etapes_paralleles
      ? { entrepreneur: [...v.etapes_paralleles.entrepreneur], salarie: [...v.etapes_paralleles.salarie], fin: v.aboutissement ?? "ikigai" }
      : null,
    mutualisables: (v.mutualisables ?? []).map(({ etapes, nom, texte }) => ({ etapes: [...etapes], nom, texte })),
    pointsAttention: (v.points_attention ?? []).map(({ id, nom, texte }) => ({ id, nom, texte })),
  };
}

function offrePublique(o: ParcoursBrut["offres"][number]): Offre {
  return {
    id: o.id,
    nom: o.nom,
    prix: NON_INDIQUE.test(o.prix) ? null : o.prix,
    duree: NON_INDIQUE.test(o.duree) ? null : o.duree,
    contenu: sansNotes(o.contenu),
    url: o.url ?? null,
  };
}

/** Projection du fichier brut (exportée pour les tests). */
export function projeter(brut: ParcoursBrut): ParcoursPublic {
  const moduleArgent = brut.structure.modules_transversaux.find((m) => m.etape === "argent");
  const etapeArgent = brut.etapes.find((e) => e.id === "argent");
  if (!moduleArgent || !etapeArgent) throw new Error("parcours.json : module Argent introuvable");
  const [min, max] = moduleArgent.autodiagnostic.echelle;

  const contenu: ParcoursPublic = {
    promesse: brut.promesse,
    questionVoie: {
      texte: brut.question_voie.texte,
      choix: brut.question_voie.choix.map((c) => ({ voie: c.voie ?? "inconnue", libelle: c.libelle })),
    },
    points: { ...brut.regle_position.reponses },
    seuil: brut.regle_position.seuil_pourcentage,
    tronc: [...brut.structure.tronc_commun],
    voies: Object.fromEntries(brut.voies.map((v) => [v.id, voiePublique(v)])) as Record<VoieId, Voie>,
    etapes: Object.fromEntries(brut.etapes.filter((e) => e.branche !== "module").map((e) => [e.id, etapePublique(brut, e)])),
    offres: Object.fromEntries(brut.offres.map((o) => [o.id, offrePublique(o)])),
    niveaux: brut.niveaux_reussir_dans_le_plaisir.niveaux.map((n) => ({
      code: n.code,
      titre: n.titre,
      libelle: n.libelle,
      sousTitre: n.sous_titre,
      conseil: n.conseil,
    })),
    argent: {
      nom: moduleArgent.nom,
      objectif: etapeArgent.objectif,
      question: moduleArgent.autodiagnostic.question,
      min,
      max,
      seuil: moduleArgent.autodiagnostic.seuil_module,
      actions: etapeArgent.actions.map((a) => actionPublique(brut, a)),
      seances: etapeArgent.seances.map(({ id, nom, prix, duree }) => ({ id, nom, prix, duree })),
    },
    outils: Object.fromEntries(brut.outils.filter((o) => !OUTILS_SANS_BOUTON.has(o.id)).map((o) => [o.id, { id: o.id, nom: o.nom, url: o.url }])),
  };
  return typographier(contenu);
}

const CACHE = new Map<Locale, ParcoursPublic>();

/** Le parcours dans la langue demandée (le français tant qu'aucune traduction n'existe). */
export function contenuParcours(locale: Locale = "fr"): ParcoursPublic {
  const deja = CACHE.get(locale);
  if (deja) return deja;
  const contenu = projeter(FICHIERS[locale] ?? BRUT);
  CACHE.set(locale, contenu);
  return contenu;
}
