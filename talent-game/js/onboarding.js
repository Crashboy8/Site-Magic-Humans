/**
 * Les 25 questions de questionnaire-initial.md, dans l'ordre.
 *
 * Architecture : chaque réponse brute est stockée telle quelle dans
 * `user.onboarding_answers[index]`. profil_structure (et tout le reste :
 * journee_ideale, catégories négligée/non-négociable, réglages du jeu,
 * interview_log) est **recalculé en entier** à partir de ce tableau par
 * `rebuildProfile()`, plutôt que muté pas à pas au fil de l'avancée. C'est
 * ce qui permet de revenir en arrière, de sauter à une question déjà
 * répondue et de corriger une réponse sans dupliquer ou corrompre l'état
 * (ex. les habitudes construites sur plusieurs questions, 13 à 19).
 *
 * Types de step :
 *  - 'textarea'           champ libre, avec pré-remplissage éventuel
 *  - 'categories'          éditeur de catégories de vie (Q4)
 *  - 'valeurs-editor'       liste éditable de valeurs + choix "la plus éprouvée" (Q8)
 *  - 'ressources-editor'    liste éditable de ressources (Q10)
 *  - 'choice'               boutons de choix (dynamiques ou fixes)
 */
const Onboarding = {
  TOTAL_STEPS: 25,

  STEPS: [
    // Étape 1 — Validation et reformulation du talent
    {
      id: 1, etape: 1, etapeLabel: 'Validation du talent', recapLabel: 'Résumé du talent',
      prompt: u => `D'après ce que tu m'as partagé, voici comment je résumerais ton talent unique :\n\n« ${u.profil_structure.talent_resume || '…'} »\n\nÇa te parle, ou il manque une nuance importante ?`,
      type: 'textarea',
      prefill: u => u.profil_structure.talent_resume || ''
    },
    {
      id: 2, etape: 1, etapeLabel: 'Validation du talent', recapLabel: 'Moments de flow',
      prompt: () => `Quels sont les moments où tu ressens du flow ?`,
      type: 'textarea',
      prefill: u => u.parsed_seed.declencheur_brut || ''
    },
    {
      id: 3, etape: 1, etapeLabel: 'Validation du talent', recapLabel: 'Ce qui fait vibrer',
      prompt: () => `Qu'est-ce qui, dans ce talent, te fait le plus vibrer quand tu l'exprimes pleinement ?`,
      type: 'textarea',
      prefill: () => ''
    },

    // Étape 2 — Catégories de vie et journée idéale
    {
      id: 4, etape: 2, etapeLabel: 'Catégories de vie', recapLabel: 'Catégories de vie',
      prompt: () => `Voici une première proposition de catégories pour équilibrer ta vie. Tu veux en retirer, en renommer, en fusionner, ou en ajouter une qui te ressemble plus ?`,
      type: 'categories'
    },
    {
      id: 5, etape: 2, etapeLabel: 'Catégories de vie', recapLabel: 'Journée idéale',
      prompt: () => `Si ta journée était parfaitement réussie, à quoi ressemblerait-elle ? Décris-la comme tu la vivrais.`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 6, etape: 2, etapeLabel: 'Catégories de vie', recapLabel: 'Catégorie négligée',
      prompt: () => `Sur ces catégories, laquelle est aujourd'hui la plus négligée dans ta vie réelle ?`,
      type: 'choice',
      options: u => Object.entries(u.profil_structure.quotas_categories).map(([id, c]) => ({ value: id, label: c.label }))
    },
    {
      id: 7, etape: 2, etapeLabel: 'Catégories de vie', recapLabel: 'Catégorie non-négociable',
      prompt: () => `Laquelle est, pour toi, non-négociable — celle que tu ne veux jamais sacrifier ?`,
      type: 'choice',
      options: u => Object.entries(u.profil_structure.quotas_categories).map(([id, c]) => ({ value: id, label: c.label }))
    },

    // Étape 3 — Valeurs
    {
      id: 8, etape: 3, etapeLabel: 'Valeurs', recapLabel: 'Valeur la plus éprouvée',
      prompt: () => `Parmi tes valeurs, laquelle est la plus souvent mise à l'épreuve dans ton quotidien actuel ?`,
      type: 'valeurs-editor'
    },
    {
      id: 9, etape: 3, etapeLabel: 'Valeurs', recapLabel: 'Effet de cette valeur',
      prompt: u => `Quand tu agis en accord avec « ${u._valeur_eprouvee || 'cette valeur'} », qu'est-ce que ça change concrètement dans ta journée ?`,
      type: 'textarea',
      prefill: () => ''
    },

    // Étape 4 — Ressources
    {
      id: 10, etape: 4, etapeLabel: 'Ressources', recapLabel: 'Tes ressources',
      prompt: () => `Quels sont les 3 lieux, personnes, activités ou objets qui te ressourcent le plus vraiment — pas ce qui devrait te faire du bien, ce qui te fait du bien réellement ?`,
      type: 'ressources-editor'
    },
    {
      id: 11, etape: 4, etapeLabel: 'Ressources', recapLabel: 'Fréquence souhaitée',
      prompt: () => `À quelle fréquence aurais-tu besoin d'y avoir accès pour te sentir bien ?`,
      type: 'choice',
      options: () => [
        { value: 'quotidien', label: 'Quotidien' },
        { value: 'hebdomadaire', label: 'Hebdomadaire' },
        { value: 'mensuel', label: 'Mensuel' }
      ]
    },
    {
      id: 12, etape: 4, etapeLabel: 'Ressources', recapLabel: "Obstacle d'accès",
      prompt: () => `Qu'est-ce qui t'empêche aujourd'hui d'y accéder aussi souvent que tu le voudrais ?`,
      type: 'textarea',
      prefill: () => ''
    },

    // Étape 5 — Bonnes habitudes (Atomic Habits)
    {
      id: 13, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Identité visée',
      prompt: () => `Si ta nouvelle habitude réussissait parfaitement, quel type de personne serais-tu en train de devenir ?\n(ex : pas « je veux courir » mais « je deviens quelqu'un qui prend soin de son corps »)`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 14, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Signal déclencheur',
      prompt: () => `À quel moment précis de ta journée cette habitude aurait-elle le plus de sens (juste après quoi, à quel endroit) ?`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 15, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Ce qui la rend désirable',
      prompt: () => `Qu'est-ce qui rendrait cette habitude vraiment désirable pour toi, pas juste utile ?`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 16, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Version minimale (2 min)',
      prompt: () => `Quelle serait la version la plus minime, presque ridiculement facile, de cette habitude pour commencer (moins de 2 minutes) ?`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 17, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Récompense ressentie',
      prompt: () => `Comment aimerais-tu te sentir récompensé·e juste après l'avoir faite ?`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 18, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Habitude déjà ancrée',
      prompt: () => `Quelle habitude actuelle te semble déjà bien ancrée et alignée avec ton talent ?`,
      type: 'textarea',
      prefill: u => (u.parsed_seed.habitudes || [])[0] || ''
    },
    {
      id: 19, etape: 5, etapeLabel: 'Bonnes habitudes', recapLabel: 'Appui environnemental',
      prompt: () => `Qu'est-ce qui, dans ton environnement, pourrait rendre cette nouvelle habitude plus facile à déclencher ?`,
      type: 'textarea',
      prefill: () => ''
    },

    // Étape 6 — Contexte déclencheur
    {
      id: 20, etape: 6, etapeLabel: 'Contexte déclencheur', recapLabel: 'Contexte favorable',
      prompt: () => `Dans quel contexte précis (lieu, moment, situation, personnes présentes) te sens-tu le plus naturellement poussé·e à agir dans ton talent ?`,
      type: 'textarea',
      prefill: u => u.parsed_seed.declencheur_brut || ''
    },
    {
      id: 21, etape: 6, etapeLabel: 'Contexte déclencheur', recapLabel: 'Contexte défavorable',
      prompt: () => `À l'inverse, quel contexte te bloque ou t'éteint le plus souvent ?`,
      type: 'textarea',
      prefill: () => ''
    },

    // Étape 7 — Détection des modules à activer
    {
      id: 22, etape: 7, etapeLabel: 'Ton style', recapLabel: 'Rôle des autres',
      prompt: () => `Est-ce que les autres personnes — les relations, ton entourage, ton réseau — jouent un rôle central dans l'expression de ton talent, ou est-ce plutôt quelque chose que tu vis/construis seul·e ?`,
      type: 'textarea',
      prefill: () => ''
    },
    {
      id: 23, etape: 7, etapeLabel: 'Ton style', recapLabel: 'Visualisation vs instinct',
      prompt: () => `Es-tu quelqu'un qui a besoin de visualiser (images, ambiance, vision) pour avancer, ou plutôt quelqu'un qui avance à l'instinct/à l'action directe ?`,
      type: 'textarea',
      prefill: () => ''
    },

    // Étape 8 — Cadrage du jeu
    {
      id: 24, etape: 8, etapeLabel: 'Cadrage du jeu', recapLabel: 'Rythme des quêtes',
      prompt: () => `Tu préfères des quêtes plutôt ambitieuses et rares, ou plutôt petites et fréquentes ?`,
      type: 'choice',
      options: () => [
        { value: 'ambitieuses_rares', label: 'Ambitieuses et rares' },
        { value: 'petites_frequentes', label: 'Petites et fréquentes' }
      ]
    },
    {
      id: 25, etape: 8, etapeLabel: 'Cadrage du jeu', recapLabel: 'Compétition vs progression perso',
      prompt: () => `Tu es plus motivé·e par la compétition avec les autres, ou par ta propre progression individuelle ?`,
      type: 'choice',
      options: () => [
        { value: 'competition', label: 'La compétition' },
        { value: 'individuelle', label: 'Ma progression perso' }
      ]
    }
  ],

  getStep(index) {
    return this.STEPS[index] || null;
  },

  _guessResourceType(nom) {
    const lower = nom.toLowerCase();
    if (/\b(marche|forêt|parc|maison|plage|montagne|bureau|café)\b/.test(lower)) return 'lieu';
    if (/\b(ami|amie|conjoint|famille|frère|sœur|maman|papa|julien|collègue)\b/.test(lower)) return 'personne';
    if (/\b(carnet|livre|guitare|vélo|casque|objet)\b/.test(lower)) return 'objet';
    return 'activité';
  },

  /**
   * Recalcule l'intégralité de profil_structure (+ journee_ideale, les
   * catégories négligée/non-négociable, reglages_jeu, interview_log) à
   * partir de user.onboarding_answers. Pure et idempotente : peut être
   * appelée à chaque rendu sans effet cumulatif, ce qui est ce qui permet
   * la navigation libre entre questions.
   */
  rebuildProfile(user) {
    const a = user.onboarding_answers;
    const get = i => a[i];
    const has = i => a[i] !== null && a[i] !== undefined && a[i] !== '';

    user.profil_structure.talent_resume = (has(0) ? get(0) : user.parsed_seed.talent_resume) || '';

    const catSelection = get(3);
    user.profil_structure.quotas_categories = Quotas.buildFromSelection(
      catSelection && catSelection.length ? catSelection : DEFAULT_CATEGORIES
    );

    user.journee_ideale = get(4) || '';
    user.categorie_negligee = get(5) || null;
    user.categorie_non_negociable = get(6) || null;

    const q8 = get(7);
    user.profil_structure.valeurs = q8 ? q8.valeurs : (user.parsed_seed.valeurs || []);
    user._valeur_eprouvee = q8 ? q8.plusEprouvee : '';

    const ressourceNoms = has(9) ? get(9) : (user.parsed_seed.ressources || []).slice(0, 3);
    const frequence = get(10) || null;
    user.profil_structure.ressources = ressourceNoms.map(nom => ({
      id: crypto.randomUUID(),
      nom,
      type: this._guessResourceType(nom),
      frequence_suggeree: frequence,
      dernier_moment: null
    }));
    user.profil_structure.ressources_obstacle = get(11) || '';

    const identite = get(12) || '';
    const signal = get(13) || '';
    const desirabilite = get(14) || '';
    const versionMinimale = get(15) || '';
    const recompense = get(16) || '';
    const habitudeAncreeNom = get(17) || '';
    const appuiEnvironnemental = get(18) || '';

    const habitudes = [];
    if (habitudeAncreeNom.trim()) {
      habitudes.push({
        id: crypto.randomUUID(),
        nom: habitudeAncreeNom.trim(),
        ancree: true,
        categorie_vie: user.categorie_non_negociable
      });
    }
    if (identite.trim() || versionMinimale.trim() || signal.trim()) {
      const nom = versionMinimale.trim() || identite.trim() || 'Nouvelle habitude';
      habitudes.push({
        id: crypto.randomUUID(),
        identite_visee: identite.trim(),
        signal_declencheur: signal.trim(),
        desirabilite: desirabilite.trim(),
        version_minimale: versionMinimale.trim(),
        recompense: recompense.trim(),
        appui_environnemental: appuiEnvironnemental.trim(),
        ancree: false,
        nom,
        categorie_vie: Quotas.guessCategory(
          `${identite} ${nom}`,
          user.profil_structure.quotas_categories,
          user.categorie_non_negociable
        )
      });
    }
    user.profil_structure.habitudes = habitudes;

    user.profil_structure.declencheur_contexte = {
      favorable: (has(19) ? get(19) : user.parsed_seed.declencheur_brut) || '',
      defavorable: get(20) || ''
    };

    const modules = ['objectifs', 'ressourcement', 'habitudes'];
    if (ModuleDetector.detectCRM(get(21) || '')) modules.push('crm');
    if (ModuleDetector.detectMoodboard(get(22) || '')) modules.push('moodboard');
    user.profil_structure.modules_actifs = modules;

    user.reglages_jeu = {
      rythme_quetes: get(23) || null,
      motivation: get(24) || null
    };

    user.interview_log = a
      .map((val, idx) => {
        if (val === null || val === undefined || val === '') return null;
        const step = this.getStep(idx);
        return {
          question_id: step.id,
          question: step.prompt(user),
          reponse: typeof val === 'string' ? val : JSON.stringify(val)
        };
      })
      .filter(Boolean);
  },

  /** Formatte une réponse brute pour l'affichage dans le tableau récapitulatif. */
  formatAnswer(index, user) {
    const step = this.getStep(index);
    const val = user.onboarding_answers[index];
    if (val === null || val === undefined || val === '') return '—';
    switch (step.type) {
      case 'choice': {
        const opt = step.options(user).find(o => o.value === val);
        return opt ? opt.label : val;
      }
      case 'categories':
        return val.map(c => c.label).join(', ');
      case 'valeurs-editor':
        return val.plusEprouvee
          ? `${val.valeurs.join(', ')} — la plus éprouvée : ${val.plusEprouvee}`
          : val.valeurs.join(', ');
      case 'ressources-editor':
        return val.join(', ');
      default:
        return val;
    }
  },

  /** Construit les quêtes de départ une fois l'onboarding validé. */
  finalize(user) {
    this.rebuildProfile(user);
    user.onboarding_complete = true;
    user.progression.quetes = QuestGenerator.generateStarterQuests(user);
    Store.save(user);
  }
};
