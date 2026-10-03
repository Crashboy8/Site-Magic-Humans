/**
 * Détection de l'activation des modules CRM / Moodboard à partir des
 * réponses qualitatives Q22/Q23 — jamais une case à cocher directe
 * ("veux-tu le module X ?"). Heuristique par mots-clés pour le MVP ; le
 * point de bascule vers une vraie inférence par l'IA reste ce fichier.
 */
const ModuleDetector = {
  CRM_KEYWORDS: ['entourage', 'réseau', 'relation', 'famille', 'ami', 'équipe', 'ensemble', 'les autres', 'collectif', 'communauté'],
  SOLO_KEYWORDS: ['seul', 'moi-même', 'individuel', 'autonome', 'solitaire'],
  VISUAL_KEYWORDS: ['image', 'visualiser', 'vision', 'ambiance', 'moodboard', 'visuel', 'dessiner', 'photo'],
  INSTINCT_KEYWORDS: ['instinct', 'action directe', 'directement', 'terrain', 'spontané'],

  detectCRM(answerQ22) {
    const text = (answerQ22 || '').toLowerCase();
    const relScore = this.CRM_KEYWORDS.filter(k => text.includes(k)).length;
    const soloScore = this.SOLO_KEYWORDS.filter(k => text.includes(k)).length;
    return relScore > soloScore;
  },

  detectMoodboard(answerQ23) {
    const text = (answerQ23 || '').toLowerCase();
    const visScore = this.VISUAL_KEYWORDS.filter(k => text.includes(k)).length;
    const insScore = this.INSTINCT_KEYWORDS.filter(k => text.includes(k)).length;
    return visScore > insScore;
  }
};
