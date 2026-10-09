// Textes de la page /depuis-cibleur/ (§16). Recopiés tels quels du cahier des charges.
export const DEPUIS_CIBLEUR = {
  surtitre: "Depuis Le Cibleur",
  titre: "Compare tes cibles",
  intro:
    "Tes cibles et ton Talent Unique sont prêts. La Boussole les compare critère par critère : ce qui allume ton talent, ce qui l'éteint, l'urgence, le budget, l'accès. Les notes du Cibleur sont déjà reportées : tu n'as plus qu'à les ajuster.",
  recu: (n: number) => `On a bien reçu tes ${n} cibles et ton Talent Unique.`,
  bouton: "Créer ma comparaison",
  creation: "Création en cours…",
  note: "Pas besoin de compte pour commencer. Tes cibles sont enregistrées dans ton espace de la Boussole, et nulle part ailleurs.",
  invalide: "Ce lien est incomplet. Retourne dans Le Cibleur et clique à nouveau sur « Comparer mes cibles dans la Boussole ».",
  echec: "La création n'a pas marché. Réessaie dans un instant.",
  retour: "Retourner au Cibleur",
  urlRetour: "/boussole-decision/ma-cible/",
  nomProfil: "Mes cibles (Le Cibleur)",
  descriptionProfil: "Créé depuis Le Cibleur",
  nomVersion: "Choisir ma cible prioritaire",
} as const;
