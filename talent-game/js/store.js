/**
 * Couche de persistance : tout le jeu est gardé dans ce navigateur (localStorage, clé talent_game_v1),
 * avec ou sans compte. Avec un compte Magic Humans, seuls les points, les badges et la série de jours partent
 * en plus dans le compte (voir js/progression.js) ; le profil, les quêtes, les habitudes et les contacts restent ici.
 * `save()` reste synchrone pour ne rien changer aux dizaines d'appels `Store.save(u); this.render();` de app.js.
 */
const STORE_KEY = 'talent_game_v1';

// Les badges et leurs seuils viennent de js/progression.js : les mêmes que dans l'application (Mon espace).
const DEFAULT_BADGES_SEUILS = MHProgression.BADGES;

const Store = {
  load() {
    let user = null;
    try {
      const brut = window.localStorage.getItem(STORE_KEY);
      user = brut ? JSON.parse(brut) : null;
    } catch (e) {
      console.warn('Store.load: lecture impossible', e);
      return null;
    }
    return user && typeof user === 'object' ? this._normalize(user) : null;
  },

  /**
   * Ramène une sauvegarde existante au schéma courant. Sans ce filet, la moindre évolution du schéma plante
   * l'app pour de bon chez un joueur qui a déjà commencé.
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
    if (user.compagnon === undefined) user.compagnon = null;
    return user;
  },

  save(user) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(user));
    } catch (e) {
      // Stockage plein ou refusé (navigation privée) : le jeu continue pour cette visite.
      console.error('Store.save: écriture impossible', e);
    }
    return user;
  },

  createUser(profilBrut, parsedSeed) {
    const user = {
      id: crypto.randomUUID(),
      date_creation: new Date().toISOString(),
      profil_brut: profilBrut,
      parsed_seed: parsedSeed,
      compagnon: null,
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
