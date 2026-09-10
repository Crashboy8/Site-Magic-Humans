/**
 * Les 25 questions de questionnaire-initial.md, dans l'ordre, avec la
 * logique de pré-remplissage (à partir du profil importé) et de sauvegarde
 * dans profil_structure. Ce fichier ne touche pas au DOM : app.js s'occupe
 * du rendu, en s'appuyant sur `type` pour choisir le bon widget.
 *
 * Types de step :
 *  - 'textarea'         champ libre, avec prefill éventuel
 *  - 'categories'        éditeur de catégories de vie (Q4)
 *  - 'valeurs-editor'     liste éditable de valeurs + choix "la plus éprouvée" (Q8)
 *  - 'ressources-editor'  liste éditable de ressources (Q10)
 *  - 'choice'             boutons de choix (dynamiques ou fixes)
 */
const Onboarding = {
  TOTAL_STEPS: 25,

  STEPS: [
    // Étape 1 — Validation et reformulation du talent
    {
      id: 1, etape: 1, etapeLabel: 'Validation du talent',
      prompt: u => `D'après ce que tu m'as partagé, voici comment je résumerais ton talent unique :\n\n« ${u.profil_structure.talent_resume || '…'} »\n\nÇa te parle, ou il manque une nuance importante ?`,
      type: 'textarea',
      prefill: u => u.profil_structure.talent_resume || '',
      save: (u, v) => { u.profil_structure.talent_resume = v.trim(); }
    },
    {
      id: 2, etape: 1, etapeLabel: 'Validation du talent',
      prompt: () => `Quels sont les moments où tu ressens du flow ?`,
      type: 'textarea',
      prefill: u => u.parsed_seed.declencheur_brut || '',
      save: () => {}
    },
    {
      id: 3, etape: 1, etapeLabel: 'Validation du talent',
      prompt: () => `Qu'est-ce qui, dans ce talent, te fait le plus vibrer quand tu l'exprimes pleinement ?`,
      type: 'textarea',
      prefill: () => '',
      save: () => {}
    },

    // Étape 2 — Catégories de vie et journée idéale
    {
      id: 4, etape: 2, etapeLabel: 'Catégories de vie',
      prompt: () => `Voici une première proposition de catégories pour équilibrer ta vie. Tu veux en retirer, en renommer, en fusionner, ou en ajouter une qui te ressemble plus ?`,
      type: 'categories',
      save: (u, selection) => {
        u.profil_structure.quotas_categories = Quotas.buildFromSelection(selection);
      }
    },
    {
      id: 5, etape: 2, etapeLabel: 'Catégories de vie',
      prompt: () => `Si ta journée était parfaitement réussie, à quoi ressemblerait-elle ? Décris-la comme tu la vivrais.`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { u.journee_ideale = v.trim(); }
    },
    {
      id: 6, etape: 2, etapeLabel: 'Catégories de vie',
      prompt: () => `Sur ces catégories, laquelle est aujourd'hui la plus négligée dans ta vie réelle ?`,
      type: 'choice',
      options: u => Object.entries(u.profil_structure.quotas_categories).map(([id, c]) => ({ value: id, label: c.label })),
      save: (u, v) => { u.categorie_negligee = v; }
    },
    {
      id: 7, etape: 2, etapeLabel: 'Catégories de vie',
      prompt: () => `Laquelle est, pour toi, non-négociable — celle que tu ne veux jamais sacrifier ?`,
      type: 'choice',
      options: u => Object.entries(u.profil_structure.quotas_categories).map(([id, c]) => ({ value: id, label: c.label })),
      save: (u, v) => { u.categorie_non_negociable = v; }
    },

    // Étape 3 — Valeurs
    {
      id: 8, etape: 3, etapeLabel: 'Valeurs',
      prompt: () => `Parmi tes valeurs, laquelle est la plus souvent mise à l'épreuve dans ton quotidien actuel ?`,
      type: 'valeurs-editor',
      save: (u, { valeurs, plusEprouvee }) => {
        u.profil_structure.valeurs = valeurs;
        u._valeur_eprouvee = plusEprouvee;
      }
    },
    {
      id: 9, etape: 3, etapeLabel: 'Valeurs',
      prompt: u => `Quand tu agis en accord avec « ${u._valeur_eprouvee || 'cette valeur'} », qu'est-ce que ça change concrètement dans ta journée ?`,
      type: 'textarea',
      prefill: () => '',
      save: () => {}
    },

    // Étape 4 — Ressources
    {
      id: 10, etape: 4, etapeLabel: 'Ressources',
      prompt: () => `Quels sont les 3 lieux, personnes, activités ou objets qui te ressourcent le plus vraiment — pas ce qui devrait te faire du bien, ce qui te fait du bien réellement ?`,
      type: 'ressources-editor',
      save: (u, ressources) => {
        u.profil_structure.ressources = ressources.map(nom => ({
          id: crypto.randomUUID(),
          nom,
          type: Onboarding._guessResourceType(nom),
          frequence_suggeree: null,
          dernier_moment: null
        }));
      }
    },
    {
      id: 11, etape: 4, etapeLabel: 'Ressources',
      prompt: () => `À quelle fréquence aurais-tu besoin d'y avoir accès pour te sentir bien ?`,
      type: 'choice',
      options: () => [
        { value: 'quotidien', label: 'Quotidien' },
        { value: 'hebdomadaire', label: 'Hebdomadaire' },
        { value: 'mensuel', label: 'Mensuel' }
      ],
      save: (u, v) => { u.profil_structure.ressources.forEach(r => { r.frequence_suggeree = v; }); }
    },
    {
      id: 12, etape: 4, etapeLabel: 'Ressources',
      prompt: () => `Qu'est-ce qui t'empêche aujourd'hui d'y accéder aussi souvent que tu le voudrais ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { u.profil_structure.ressources_obstacle = v.trim(); }
    },

    // Étape 5 — Bonnes habitudes (Atomic Habits)
    {
      id: 13, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `Si ta nouvelle habitude réussissait parfaitement, quel type de personne serais-tu en train de devenir ?\n(ex : pas « je veux courir » mais « je deviens quelqu'un qui prend soin de son corps »)`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { Onboarding._habitDraft(u).identite_visee = v.trim(); }
    },
    {
      id: 14, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `À quel moment précis de ta journée cette habitude aurait-elle le plus de sens (juste après quoi, à quel endroit) ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { Onboarding._habitDraft(u).signal_declencheur = v.trim(); }
    },
    {
      id: 15, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `Qu'est-ce qui rendrait cette habitude vraiment désirable pour toi, pas juste utile ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { Onboarding._habitDraft(u).desirabilite = v.trim(); }
    },
    {
      id: 16, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `Quelle serait la version la plus minime, presque ridiculement facile, de cette habitude pour commencer (moins de 2 minutes) ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { Onboarding._habitDraft(u).version_minimale = v.trim(); }
    },
    {
      id: 17, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `Comment aimerais-tu te sentir récompensé·e juste après l'avoir faite ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { Onboarding._habitDraft(u).recompense = v.trim(); }
    },
    {
      id: 18, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `Quelle habitude actuelle te semble déjà bien ancrée et alignée avec ton talent ?`,
      type: 'textarea',
      prefill: u => (u.parsed_seed.habitudes || [])[0] || '',
      save: (u, v) => {
        if (v.trim()) {
          u.profil_structure.habitudes.push({
            id: crypto.randomUUID(),
            nom: v.trim(),
            ancree: true,
            categorie_vie: u.categorie_non_negociable
          });
        }
      }
    },
    {
      id: 19, etape: 5, etapeLabel: 'Bonnes habitudes',
      prompt: () => `Qu'est-ce qui, dans ton environnement, pourrait rendre cette nouvelle habitude plus facile à déclencher ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => {
        const draft = Onboarding._habitDraft(u);
        draft.appui_environnemental = v.trim();
        draft.id = crypto.randomUUID();
        draft.ancree = false;
        draft.nom = draft.version_minimale || draft.identite_visee || 'Nouvelle habitude';
        draft.categorie_vie = Quotas.guessCategory(
          `${draft.identite_visee} ${draft.nom}`,
          u.profil_structure.quotas_categories,
          u.categorie_non_negociable
        );
        u.profil_structure.habitudes.push(draft);
        delete u._habitDraft;
      }
    },

    // Étape 6 — Contexte déclencheur
    {
      id: 20, etape: 6, etapeLabel: 'Contexte déclencheur',
      prompt: () => `Dans quel contexte précis (lieu, moment, situation, personnes présentes) te sens-tu le plus naturellement poussé·e à agir dans ton talent ?`,
      type: 'textarea',
      prefill: u => u.parsed_seed.declencheur_brut || '',
      save: (u, v) => { u.profil_structure.declencheur_contexte.favorable = v.trim(); }
    },
    {
      id: 21, etape: 6, etapeLabel: 'Contexte déclencheur',
      prompt: () => `À l'inverse, quel contexte te bloque ou t'éteint le plus souvent ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => { u.profil_structure.declencheur_contexte.defavorable = v.trim(); }
    },

    // Étape 7 — Détection des modules à activer
    {
      id: 22, etape: 7, etapeLabel: 'Ton style',
      prompt: () => `Est-ce que les autres personnes — les relations, ton entourage, ton réseau — jouent un rôle central dans l'expression de ton talent, ou est-ce plutôt quelque chose que tu vis/construis seul·e ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => {
        if (ModuleDetector.detectCRM(v) && !u.profil_structure.modules_actifs.includes('crm')) {
          u.profil_structure.modules_actifs.push('crm');
        }
      }
    },
    {
      id: 23, etape: 7, etapeLabel: 'Ton style',
      prompt: () => `Es-tu quelqu'un qui a besoin de visualiser (images, ambiance, vision) pour avancer, ou plutôt quelqu'un qui avance à l'instinct/à l'action directe ?`,
      type: 'textarea',
      prefill: () => '',
      save: (u, v) => {
        if (ModuleDetector.detectMoodboard(v) && !u.profil_structure.modules_actifs.includes('moodboard')) {
          u.profil_structure.modules_actifs.push('moodboard');
        }
      }
    },

    // Étape 8 — Cadrage du jeu
    {
      id: 24, etape: 8, etapeLabel: 'Cadrage du jeu',
      prompt: () => `Tu préfères des quêtes plutôt ambitieuses et rares, ou plutôt petites et fréquentes ?`,
      type: 'choice',
      options: () => [
        { value: 'ambitieuses_rares', label: 'Ambitieuses et rares' },
        { value: 'petites_frequentes', label: 'Petites et fréquentes' }
      ],
      save: (u, v) => { u.reglages_jeu.rythme_quetes = v; }
    },
    {
      id: 25, etape: 8, etapeLabel: 'Cadrage du jeu',
      prompt: () => `Tu es plus motivé·e par la compétition avec les autres, ou par ta propre progression individuelle ?`,
      type: 'choice',
      options: () => [
        { value: 'competition', label: 'La compétition' },
        { value: 'individuelle', label: 'Ma progression perso' }
      ],
      save: (u, v) => { u.reglages_jeu.motivation = v; }
    }
  ],

  _habitDraft(u) {
    if (!u._habitDraft) u._habitDraft = {};
    return u._habitDraft;
  },

  _guessResourceType(nom) {
    const lower = nom.toLowerCase();
    if (/\b(marche|forêt|parc|maison|plage|montagne|bureau|café)\b/.test(lower)) return 'lieu';
    if (/\b(ami|amie|conjoint|famille|frère|sœur|maman|papa|julien|collègue)\b/.test(lower)) return 'personne';
    if (/\b(carnet|livre|guitare|vélo|casque|objet)\b/.test(lower)) return 'objet';
    return 'activité';
  },

  getStep(index) {
    return this.STEPS[index] || null;
  },

  logAndSave(user, index, rawValueForLog, saveArgs) {
    const step = this.getStep(index);
    if (!step) return;
    Store.logAnswer(user, step.id, step.prompt(user), rawValueForLog);
    step.save(user, saveArgs !== undefined ? saveArgs : rawValueForLog);
  },

  /** Construit les quêtes de départ une fois l'onboarding terminé. */
  finalize(user) {
    user.onboarding_complete = true;
    user.progression.quetes = QuestGenerator.generateStarterQuests(user);
    Store.save(user);
  }
};
