/**
 * Couche de persistance. Interface volontairement minimale pour pouvoir être
 * remplacée par un client Supabase plus tard sans toucher au reste de l'app :
 * il suffira de réimplémenter load/save/clear en async et d'adapter les
 * quelques `await` dans app.js.
 */
const STORAGE_KEY = 'talentGame:user';

const DEFAULT_BADGES_SEUILS = [
  { id: 'premier-pas', seuil: 1, label: 'Premier pas', emoji: '🌱' },
  { id: 'en-mouvement', seuil: 50, label: 'En mouvement', emoji: '🔥' },
  { id: 'sur-la-lancee', seuil: 150, label: 'Sur la lancée', emoji: '⚡' },
  { id: 'ancre', seuil: 300, label: 'Ancré·e', emoji: '👑' }
];

const Store = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return this._normalize(JSON.parse(raw));
    } catch (e) {
      console.warn('Store.load: lecture impossible', e);
      return null;
    }
  },

  /**
   * Ramène une sauvegarde existante au schéma courant. Nécessaire car cette
   * app n'a pas de backend de migration : une sauvegarde faite avant l'ajout
   * de la navigation libre dans l'onboarding n'a pas onboarding_answers, et
   * sans ce filet, la moindre évolution du schéma plante l'app pour de bon
   * chez un joueur qui a déjà commencé (aucun moyen pour lui de vider le
   * localStorage depuis l'UI).
   */
  _normalize(user) {
    const validAnswers = Array.isArray(user.onboarding_answers) && user.onboarding_answers.length === Onboarding.TOTAL_STEPS;
    if (!validAnswers) {
      // Ancien format : on ne peut pas récupérer les réponses individuelles
      // déjà données, donc on relance le questionnaire proprement plutôt que
      // de laisser une app cassée — en gardant le profil déjà collé pour ne
      // pas le refaire saisir.
      user.onboarding_step = 0;
      user.onboarding_answers = new Array(Onboarding.TOTAL_STEPS).fill(null);
      user.onboarding_max_reached = 0;
      user.onboarding_at_recap = false;
    }
    if (typeof user.onboarding_max_reached !== 'number') user.onboarding_max_reached = user.onboarding_step || 0;
    if (typeof user.onboarding_at_recap !== 'boolean') user.onboarding_at_recap = false;
    return user;
  },

  save(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  createUser(profilBrut, parsedSeed) {
    const user = {
      id: crypto.randomUUID(),
      email: null,
      date_creation: new Date().toISOString(),
      profil_brut: profilBrut,
      parsed_seed: parsedSeed,
      journee_ideale: '',
      onboarding_step: 0,
      onboarding_answers: new Array(Onboarding.TOTAL_STEPS).fill(null),
      onboarding_max_reached: 0,
      onboarding_at_recap: false,
      onboarding_complete: false,
      categorie_negligee: null,
      categorie_non_negociable: null,
      profil_structure: {
        talent_resume: parsedSeed.talent_resume || '',
        valeurs: [],
        ressources: [],
        habitudes: [],
        declencheur_contexte: { favorable: '', defavorable: '' },
        quotas_categories: {},
        modules_actifs: ['objectifs', 'ressourcement', 'habitudes']
      },
      interview_log: [],
      reglages_jeu: { rythme_quetes: null, motivation: null },
      progression: {
        quetes: [],
        declarations: [],
        contacts: [],
        xp_total: 0,
        badges: []
      }
    };
    this.save(user);
    return user;
  },

  addDeclaration(user, quete) {
    const declaration = {
      id: crypto.randomUUID(),
      quete_id: quete.id,
      date: new Date().toISOString(),
      points_gagnes: quete.points
    };
    user.progression.declarations.push(declaration);
    quete.statut = 'complete';
    quete.date_completion = declaration.date;
    user.progression.xp_total += quete.points;

    const nouveauxBadges = DEFAULT_BADGES_SEUILS.filter(
      b => user.progression.xp_total >= b.seuil && !user.progression.badges.includes(b.id)
    );
    nouveauxBadges.forEach(b => user.progression.badges.push(b.id));

    this.save(user);
    return { declaration, nouveauxBadges };
  },

  restart(user) {
    // "Repartir à zéro" : remet la progression (quêtes, points, badges) à zéro
    // sans jamais toucher au profil, aux ressources ou aux contacts CRM.
    user.progression.quetes = [];
    user.progression.declarations = [];
    user.progression.xp_total = 0;
    user.progression.badges = [];
    this.save(user);
    return user;
  }
};
