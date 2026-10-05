// Textes de la carte du talent, regroupés ici pour préparer la version anglaise.
import type { LieuStatut } from "@/domain/carte";

export const TEXTES = {
  titre: "Ta carte du talent",
  intro:
    "Chaque opportunité est un lieu de ton territoire. Plus elle te correspond, plus elle s'élève : les meilleures deviennent des sommets, les moins alignées restent au bord de l'eau.",
  exporter: "Exporter (fichier)",
  importer: "Importer un fichier",
  rechargerDemo: "Recharger la démo",
  confirmerDemo: "Remplacer ta carte par la carte de démonstration ?",
  importReussi: "Carte importée.",
  importEchoue: "Impossible de lire ce fichier.",
  stockage: "Ta carte est enregistrée dans ce navigateur. Exporte-la pour la garder ou la changer d'appareil.",
  tableauTitre: "Les lieux de ta carte",
  colonneLieu: "Lieu",
  colonneStatut: "Statut",
  colonneScore: "Score",
  nonEvalue: "—",
  carteAria: (nom: string) => `Carte du talent : ${nom}`,
  statuts: {
    a_explorer: "À explorer",
    en_cours: "En cours",
    conquis: "Conquis",
    ecarte: "Écarté",
  } satisfies Record<LieuStatut, string>,
};
