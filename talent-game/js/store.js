/**
 * Couche de persistance — Supabase (table `players`, une ligne par joueur,
 * profil + progression en JSONB). `save()` reste volontairement synchrone
 * dans sa signature (écriture en tâche de fond, sans bloquer l'UI) pour ne
 * rien changer aux dizaines d'appels `Store.save(u); this.render();` déjà
 * présents dans app.js. Seul `load()` est asynchrone, et n'est appelé qu'une
 * fois, juste après authentification.
 */
const PLAYERS_TABLE = 'players';

const DEFAULT_BADGES_SEUILS = [
  { id: 'premier-pas', seuil: 1, label: 'Premier pas', emoji: '🌱' },
  { id: 'en-mouvement', seuil: 50, label: 'En mouvement', emoji: '🔥' },
  { id: 'sur-la-lancee', seuil: 150, label: 'Sur la lancée', emoji: '⚡' },
  { id: 'ancre', seuil: 300, label: 'Ancré·e', emoji: '👑' }
];

const Store = {
  async load() {
    if (!Auth.currentUser) return null;
    const { data, error } = await supabaseClient
      .from(PLAYERS_TABLE)
      .select('data')
      .eq('id', Auth.currentUser.id)
      .maybeSingle();
    if (error) {
      console.warn('Store.load: lecture impossible', error);
      return null;
    }
    return data ? this._normalize(data.data) : null;
  },

  /**
   * Ramène une sauvegarde existante au schéma courant. Nécessaire car cette
   * app n'a pas de backend de migration : une sauvegarde faite avant l'ajout
   * de la navigation libre dans l'onboarding n'a pas onboarding_answers, et
   * sans ce filet, la moindre évolution du schéma plante l'app pour de bon
   * chez un joueur qui a déjà commencé.
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
    supabaseClient
      .from(PLAYERS_TABLE)
      .upsert({ id: user.id, data: user, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error('Store.save: écriture impossible', error); });
    return user;
  },

  createUser(profilBrut, parsedSeed) {
    const user = {
      id: Auth.currentUser.id,
      email: Auth.currentUser.email,
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
