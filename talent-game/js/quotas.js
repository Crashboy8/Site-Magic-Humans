/**
 * Catégories de vie & quotas — structure clé/valeur libre (pas un schéma
 * fixe), co-construite avec l'utilisateur. Cette liste n'est qu'un point de
 * départ proposé (cf. questionnaire-initial.md Q4) ; l'utilisateur peut
 * ajouter/retirer/renommer à volonté, dès l'onboarding et ensuite dans les
 * paramètres.
 */
const DEFAULT_CATEGORIES = [
  { id: 'corps', label: 'Corps', couleur: '#ff5470' },
  { id: 'sport', label: 'Sport', couleur: '#ff9f1c' },
  { id: 'psyche', label: 'Psyché', couleur: '#8338ec' },
  { id: 'foi', label: 'Foi / Spiritualité', couleur: '#3a86ff' },
  { id: 'divertissement', label: 'Divertissement', couleur: '#ffbe0b' },
  { id: 'artistique', label: 'Artistique / Hobbies', couleur: '#fb5607' },
  { id: 'lieux_voyages', label: 'Lieux et Voyages', couleur: '#06d6a0' },
  { id: 'productivite', label: 'Productivité', couleur: '#118ab2' }
];

const PALETTE_LIBRE = ['#ff006e', '#fb5607', '#ffbe0b', '#3a86ff', '#8338ec', '#06d6a0', '#ff5470', '#118ab2'];

const Quotas = {
  slugify(label) {
    return label
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'categorie';
  },

  buildFromSelection(selection) {
    // selection: [{id, label, couleur}] déjà choisi/édité par l'utilisateur
    const quotaEach = Math.round(100 / (selection.length || 1));
    const result = {};
    selection.forEach(cat => {
      result[cat.id] = { label: cat.label, couleur: cat.couleur, quota_points: quotaEach };
    });
    return result;
  },

  addCategory(quotas, label, couleur) {
    const id = this.slugify(label);
    quotas[id] = {
      label,
      couleur: couleur || PALETTE_LIBRE[Object.keys(quotas).length % PALETTE_LIBRE.length],
      quota_points: 10
    };
    return id;
  },

  removeCategory(quotas, id) {
    delete quotas[id];
  },

  renameCategory(quotas, id, newLabel) {
    if (quotas[id]) quotas[id].label = newLabel;
  },

  guessCategory(text, quotas, fallbackId) {
    const lower = (text || '').toLowerCase();
    const keywordMap = {
      corps: ['corps', 'santé', 'sommeil', 'énergie', 'physique'],
      sport: ['sport', 'courir', 'muscu', 'entraîn', 'marche'],
      psyche: ['calme', 'mental', 'stress', 'méditer', 'tête', 'émotion'],
      foi: ['spiritu', 'prière', 'foi', 'méditation'],
      divertissement: ['plaisir', 'jouer', 'film', 'détente'],
      artistique: ['écrire', 'carnet', 'créa', 'art', 'musique'],
      lieux_voyages: ['voyage', 'nature', 'forêt', 'dehors'],
      productivite: ['travail', 'organis', 'projet', 'productiv']
    };
    for (const [id, keywords] of Object.entries(keywordMap)) {
      if (quotas[id] && keywords.some(k => lower.includes(k))) return id;
    }
    return fallbackId && quotas[fallbackId] ? fallbackId : Object.keys(quotas)[0];
  }
};
