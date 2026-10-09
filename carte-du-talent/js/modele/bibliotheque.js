/*
 * Bibliothèque de compétences : environ 150 idées classées par domaine.
 * « liens » : noms (sans accents, en minuscules) de compétences voisines, qui servent
 * à rapprocher une suggestion de ce qui existe déjà sur la carte.
 * « alias » : autres noms sous lesquels la compétence peut déjà figurer sur la carte.
 */
(function (CT) {
  'use strict';

  const T = CT.i18n.T;

  const N = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // En anglais ou en espagnol, les liens et alias (écrits en français, sans accents) reçoivent aussi leur traduction,
  // pour rapprocher les suggestions d'une carte dans cette langue. Le nom français reste un alias.
  let versLangue = null;
  function traduits(liste) {
    const dico = CT.i18n.dictionnaire();
    if (!dico) return [];
    if (!versLangue) {
      versLangue = new Map();
      Object.keys(dico).forEach((fr) => versLangue.set(N(fr), N(dico[fr])));
    }
    return liste.map((l) => versLangue.get(l)).filter(Boolean);
  }

  // Les traductions d'un libellé français, dans toutes les langues (une compétence enregistrée dans une langue
  // se retrouve dans l'autre).
  function traductions(nomFr) {
    return [CT.EN, CT.ES].map((dico) => dico && dico[CT.i18n.cle(nomFr)]).filter(Boolean);
  }

  function e(id, nom, icone, domaine, liens, alias) {
    const l = liens || [];
    const a = alias || [];
    const affiche = T(nom);
    // nomFr : le libellé d'origine, pour réafficher la compétence dans la langue courante.
    return { id, nom: affiche, nomFr: nom, icone, domaine, liens: l.concat(traduits(l)), alias: a.concat(traduits(a), affiche !== nom ? [N(nom)] : []) };
  }

  const ENTREES = [
    // Communication
    e('prise-parole', 'Prise de parole en public', 'mic', 'communication', ['construire un message impactant', 'mise en scene', 'animer', 'pedagogie']),
    e('storytelling', 'Storytelling', 'book-open', 'communication', ['construire un message impactant', 'mise en scene', 'improviser']),
    e('face-camera', 'Parler face caméra', 'video', 'communication', ['prise de parole en public', 'improviser', 'reseaux sociaux / communaute en ligne']),
    e('podcast', 'Podcast', 'podcast', 'communication', ['discussions passionnantes', 'reseaux sociaux / communaute en ligne', 'chanter']),
    e('newsletter', 'Newsletter', 'mail', 'communication', ['redaction', 'creer une communaute', 'reseaux sociaux / communaute en ligne']),
    e('ecrire-web', 'Écrire pour le web', 'pen-tool', 'communication', ['redaction', 'construire un message impactant', 'reseaux sociaux / communaute en ligne']),
    e('reseaux', 'Réseaux sociaux', 'share-2', 'communication', ['creer une communaute', 'dynamiser'], ['reseaux sociaux / communaute en ligne']),

    // Relation
    e('cnv', 'Communication non violente', 'heart', 'relation', ['ecouter pour aider', 'coacher', 'discussions passionnantes']),
    e('mediation', 'Médiation', 'heart-handshake', 'relation', ['ecouter pour aider', 'coacher', 'negociation']),
    e('conflits', 'Gestion des conflits', 'shield', 'relation', ['ecouter pour aider', 'etre tres ouvert', 'coacher']),
    e('networking', 'Networking', 'network', 'relation', ['creer une communaute', 'accueillir', 'vente']),
    e('intelligence-emotionnelle', 'Intelligence émotionnelle', 'heart-pulse', 'relation', ['ecouter pour aider', 'coacher', 'sourire']),
    e('leadership', 'Leadership', 'flag', 'relation', ['dynamiser', 'creer une troupe', 'coacher']),

    // Pédagogie
    e('facilitation', 'Facilitation d\'ateliers', 'lightbulb', 'pedagogie', ['pedagogie', 'animer', 'ecouter pour aider'], ['facilitation']),
    e('ludopedagogie', 'Ludopédagogie', 'dices', 'pedagogie', ['pedagogie', 'animer', 'faire rire']),
    e('e-learning', 'Concevoir un e-learning', 'monitor-play', 'pedagogie', ['preparer une formation', 'powerpoint', 'preparation pedagogique']),
    e('mentorat', 'Mentorat', 'sprout', 'pedagogie', ['coacher', 'pedagogie', 'modeliser le talent de quelqu\'un']),
    e('design-pedagogique', 'Design pédagogique', 'pencil-ruler', 'pedagogie', ['preparation pedagogique', 'preparer une formation']),
    e('former-formateurs', 'Former des formateurs', 'graduation-cap', 'pedagogie', ['pedagogie', 'preparer une formation', 'coacher']),
    e('animer-visio', 'Animer en visio', 'monitor', 'pedagogie', ['animer', 'pedagogie', 'powerpoint']),

    // Scène
    e('clown', 'Clown', 'smile-plus', 'scene', ['faire rire', 'improviser', 'theatre d\'improvisation']),
    e('stand-up', 'Stand-up', 'mic', 'scene', ['faire rire', 'improviser', 'prise de parole en public']),
    e('sketchs', 'Écriture de sketchs', 'scroll-text', 'scene', ['rimer', 'faire rire', 'storytelling']),
    e('slam', 'Slam', 'audio-lines', 'scene', ['rimer', 'chanter']),
    e('voix', 'Voix et diction', 'mic-vocal', 'scene', ['chanter', 'prise de parole en public']),
    e('direction-choeur', 'Diriger une chorale', 'music-2', 'scene', ['chanter', 'animer', 'creer une troupe']),
    e('mise-en-scene-evenements', 'Mettre en scène un événement', 'calendar-heart', 'scene', ['mise en scene', 'animer', 'creer une troupe']),

    // Animation
    e('team-building', 'Team building', 'users-round', 'animation', ['dynamiser', 'animer', 'creer une troupe']),
    e('animation-soiree', 'Animation de soirée', 'party-popper', 'animation', ['animer', 'faire rire', 'dynamiser']),
    e('creation-jeux', 'Création de jeux', 'puzzle', 'animation', ['animer', 'ludopedagogie', 'improviser']),
    e('maitre-ceremonie', 'Maître de cérémonie', 'mic', 'animation', ['animer', 'accueillir', 'prise de parole en public']),

    // Création
    e('ecriture-creative', 'Écriture créative', 'pencil', 'creation', ['rimer', 'storytelling', 'redaction']),
    e('composition', 'Composition musicale', 'music-4', 'creation', ['chanter', 'musical improvise']),
    e('facilitation-graphique', 'Facilitation graphique', 'palette', 'creation', ['facilitation d\'ateliers', 'storytelling', 'powerpoint']),
    e('photographie', 'Photographie', 'camera', 'creation', ['edition video', 'reseaux sociaux / communaute en ligne']),

    // Corps
    e('yoga', 'Yoga', 'flower-2', 'corps', ['danse', 'calisthenie']),
    e('course', 'Course à pied', 'person-standing', 'corps', ['calisthenie', 'etre dynamique']),
    e('escalade', 'Escalade', 'mountain', 'corps', ['calisthenie', 'arts martiaux']),
    e('acrobatie', 'Acrobatie', 'rotate-cw', 'corps', ['jonglage (bolas)', 'danse', 'calisthenie']),
    e('meditation', 'Méditation', 'flower', 'corps', ['yoga', 'ecouter pour aider']),
    e('respiration', 'Respiration et gestion du stress', 'wind', 'corps', ['meditation', 'coacher', 'arts martiaux']),

    // Numérique
    e('nocode', 'Automatisation no-code', 'cog', 'numerique', ['ia agentique', 'excel'], ['automatisation no-code']),
    e('site-web', 'Créer un site web', 'layout-template', 'numerique', ['powerpoint', 'reseaux sociaux / communaute en ligne']),
    e('prompts', 'Écrire des prompts', 'message-square-code', 'numerique', ['ia (llm)', 'ia agentique']),
    e('design-graphique', 'Design graphique (Canva…)', 'pen-tool', 'numerique', ['powerpoint', 'reseaux sociaux / communaute en ligne']),
    e('analyse-donnees', 'Analyse de données', 'chart-line', 'numerique', ['excel', 'ia (llm)']),

    // Langues
    e('italien', 'Italien', 'languages', 'langues', ['espagnol']),
    e('allemand', 'Allemand', 'languages', 'langues', ['anglais']),
    e('langue-signes', 'Langue des signes', 'hand', 'langues', ['ecouter pour aider', 'anglais']),

    // Business
    e('vente', 'Vente', 'handshake', 'business', ['negociation', 'networking']),
    e('negociation', 'Négociation', 'scale', 'business', ['vente', 'ecouter pour aider']),
    e('prospection', 'Prospection', 'search', 'business', ['vente', 'networking', 'reseaux sociaux / communaute en ligne']),
    e('personal-branding', 'Personal branding', 'badge-check', 'business', ['reseaux sociaux / communaute en ligne', 'storytelling', 'vente']),
    e('creation-offre', 'Créer une offre', 'package', 'business', ['vente', 'preparer une formation']),
    e('prix', 'Fixer ses prix', 'tag', 'business', ['vente', 'negociation', 'comptabilite']),
    e('entrepreneuriat', 'Entrepreneuriat', 'rocket', 'business', ['vente', 'creer une communaute', 'creer une troupe']),

    // Organisation
    e('gestion-projet', 'Gestion de projet', 'kanban', 'organisation', ['preparer une formation', 'creer une troupe', 'administratif']),
    e('gestion-temps', 'Gestion du temps', 'clock', 'organisation', ['administratif', 'preparer une formation']),
    e('evenements', 'Organiser des événements', 'calendar-check', 'organisation', ['creer une communaute', 'mettre en scene un evenement', 'accueillir']),
    // Corps et sport (suite)
    e('natation', 'Natation', 'waves', 'corps', ['course', 'calisthenie']),
    e('velo', 'Vélo', 'bike', 'corps', ['course', 'etre dynamique']),
    e('danse', 'Danse', 'footprints', 'corps', ['acrobatie', 'yoga', 'musical improvise']),
    e('arts-martiaux', 'Arts martiaux', 'swords', 'corps', ['escalade', 'respiration']),
    e('musculation', 'Musculation', 'dumbbell', 'corps', ['calisthenie', 'course']),
    e('randonnee', 'Randonnée', 'mountain-snow', 'corps', ['course', 'escalade', 'jardinage']),
    e('sports-equipe', 'Sport d\'équipe', 'trophy', 'corps', ['course', 'creer une troupe', 'leadership']),
    e('coaching-sportif', 'Coaching sportif', 'medal', 'corps', ['coacher', 'musculation', 'course']),

    // Scène et musique (suite)
    e('theatre', 'Théâtre', 'drama', 'scene', ['theatre d\'improvisation', 'mise en scene', 'voix']),
    e('magie', 'Magie', 'wand-sparkles', 'scene', ['jonglage (bolas)', 'faire rire', 'prise de parole en public']),
    e('guitare', 'Guitare', 'music', 'scene', ['chanter', 'composition']),
    e('piano', 'Piano', 'piano', 'scene', ['chanter', 'composition']),
    e('percussions', 'Percussions', 'drum', 'scene', ['chanter', 'danse']),
    e('dj-mix', 'DJ et mix', 'disc-3', 'scene', ['composition', 'animation de soiree']),
    e('cirque', 'Arts du cirque', 'tent', 'scene', ['jonglage (bolas)', 'acrobatie', 'clown']),

    // Création et arts (suite)
    e('dessin', 'Dessin', 'pencil', 'creation', ['facilitation graphique', 'photographie']),
    e('peinture', 'Peinture', 'paintbrush', 'creation', ['dessin', 'photographie']),
    e('illustration', 'Illustration', 'brush', 'creation', ['dessin', 'design graphique (canva…)']),
    e('sculpture', 'Sculpture', 'shapes', 'creation', ['dessin', 'ceramique']),
    e('ceramique', 'Céramique', 'shapes', 'creation', ['sculpture', 'dessin']),
    e('couture', 'Couture', 'scissors', 'creation', ['dessin', 'bricolage']),
    e('cuisine', 'Cuisine', 'chef-hat', 'creation', ['accueillir', 'animer']),
    e('patisserie', 'Pâtisserie', 'cake', 'creation', ['cuisine', 'accueillir']),
    e('montage-video', 'Montage vidéo', 'clapperboard', 'creation', ['edition video', 'face camera', 'podcast']),
    e('scenario', 'Écriture de scénarios', 'scroll-text', 'creation', ['storytelling', 'ecriture creative', 'sketchs']),
    e('poesie', 'Poésie', 'feather', 'creation', ['rimer', 'slam', 'ecriture creative']),

    // Relation (suite)
    e('ecoute-active', 'Écoute active', 'ear', 'relation', ['ecouter pour aider', 'cnv']),
    e('empathie', 'Empathie', 'heart-pulse', 'relation', ['ecouter pour aider', 'intelligence emotionnelle']),
    e('accompagnement-individuel', 'Accompagnement individuel', 'hand-heart', 'relation', ['coacher', 'mentorat', 'ecouter pour aider']),
    e('hospitalite', 'Hospitalité', 'house-heart', 'relation', ['accueillir', 'cuisine']),
    e('benevolat', 'Bénévolat', 'heart-handshake', 'relation', ['creer une communaute', 'accueillir']),
    e('travail-equipe', 'Travail en équipe', 'users', 'relation', ['federer', 'creer une troupe']),
    e('feedback', 'Donner du feedback', 'message-circle', 'relation', ['coacher', 'cnv']),
    e('relation-client', 'Relation client', 'smile', 'relation', ['accueillir', 'vente', 'ecouter pour aider']),

    // Pédagogie (suite)
    e('tutorat', 'Tutorat', 'book-open-check', 'pedagogie', ['pedagogie', 'mentorat']),
    e('vulgarisation', 'Vulgarisation', 'lightbulb', 'pedagogie', ['pedagogie', 'storytelling', 'prise de parole en public']),
    e('enseigner-enfants', 'Enseigner aux enfants', 'graduation-cap', 'pedagogie', ['pedagogie', 'ludopedagogie']),
    e('conception-cours', 'Concevoir un cours', 'notebook-pen', 'pedagogie', ['preparer une formation', 'design pedagogique']),

    // Analyse et réflexion (nouveau domaine)
    e('recherche', 'Recherche et documentation', 'search', 'analyse', ['redaction', 'veille']),
    e('synthese', 'Synthèse', 'list-checks', 'analyse', ['redaction', 'preparer une formation']),
    e('veille', 'Veille', 'radar', 'analyse', ['recherche et documentation', 'reseaux sociaux / communaute en ligne']),
    e('resolution-problemes', 'Résolution de problèmes', 'puzzle', 'analyse', ['gestion de projet', 'analyse de donnees']),
    e('esprit-critique', 'Esprit critique', 'scan-search', 'analyse', ['discussions passionnantes', 'recherche et documentation']),
    e('statistiques', 'Statistiques', 'chart-bar', 'analyse', ['analyse de donnees', 'excel']),
    e('audit', 'Audit et diagnostic', 'clipboard-check', 'analyse', ['analyse de donnees', 'gestion de projet']),
    e('strategie', 'Stratégie', 'chess-knight', 'analyse', ['gestion de projet', 'leadership', 'vente']),
    e('modelisation', 'Modélisation', 'workflow', 'analyse', ['modeliser le talent de quelqu\'un', 'analyse de donnees']),
    e('prise-decision', 'Prise de décision', 'git-fork', 'analyse', ['strategie', 'coacher']),
    e('analyse-financiere', 'Analyse financière', 'trending-up', 'analyse', ['comptabilite', 'excel', 'budget']),

    // Organisation (suite)
    e('planification', 'Planification', 'calendar-days', 'organisation', ['gestion de projet', 'gestion du temps']),
    e('logistique', 'Logistique', 'truck', 'organisation', ['organiser des evenements', 'gestion de projet']),
    e('budget', 'Gérer un budget', 'wallet', 'organisation', ['comptabilite', 'administratif']),
    e('comptabilite', 'Comptabilité', 'calculator', 'organisation', ['administratif', 'budget'], ['compta']),
    e('priorisation', 'Priorisation', 'list-ordered', 'organisation', ['gestion du temps', 'gestion de projet']),
    e('processus', 'Optimiser des processus', 'workflow', 'organisation', ['gestion de projet', 'automatisation no-code']),
    e('recrutement', 'Recrutement', 'user-search', 'organisation', ['ecouter pour aider', 'networking']),
    e('delegation', 'Déléguer', 'share', 'organisation', ['leadership', 'gestion de projet']),
    e('coordination-equipe', 'Coordination d\'équipe', 'users', 'organisation', ['leadership', 'gestion de projet', 'creer une troupe']),

    // Nature (nouveau domaine)
    e('jardinage', 'Jardinage', 'sprout', 'nature', ['randonnee', 'cuisine']),
    e('permaculture', 'Permaculture', 'leaf', 'nature', ['jardinage', 'ecologie']),
    e('ecologie', 'Écologie et transition', 'recycle', 'nature', ['permaculture', 'creer une communaute']),
    e('ornithologie', 'Observation de la nature', 'bird', 'nature', ['randonnee', 'photographie']),
    e('apiculture', 'Apiculture', 'flower', 'nature', ['jardinage', 'permaculture']),
    e('cueillette', 'Cueillette et plantes', 'leaf', 'nature', ['jardinage', 'cuisine', 'randonnee']),
    e('education-nature', 'Éducation à la nature', 'trees', 'nature', ['pedagogie', 'randonnee', 'animer']),

    // Technique (nouveau domaine)
    e('bricolage', 'Bricolage', 'hammer', 'technique', ['couture', 'jardinage']),
    e('menuiserie', 'Menuiserie', 'ruler', 'technique', ['bricolage', 'sculpture']),
    e('mecanique', 'Mécanique', 'wrench', 'technique', ['bricolage', 'electronique']),
    e('electronique', 'Électronique', 'cpu', 'technique', ['code', 'bricolage']),
    e('reparation', 'Réparation', 'wrench', 'technique', ['bricolage', 'mecanique']),

    // Numérique (suite)
    e('programmation', 'Programmation', 'code', 'numerique', ['code', 'nocode', 'automatisation no-code']),
    e('python', 'Python', 'terminal', 'numerique', ['programmation', 'analyse de donnees']),
    e('excel-avance', 'Excel avancé', 'sheet', 'numerique', ['excel', 'analyse de donnees']),
    e('seo', 'Référencement (SEO)', 'search', 'numerique', ['creer un site web', 'ecrire pour le web']),
    e('dataviz', 'Visualisation de données', 'chart-pie', 'numerique', ['analyse de donnees', 'design graphique (canva…)']),
    e('bases-donnees', 'Bases de données', 'database', 'numerique', ['excel', 'analyse de donnees']),
    e('ia-generative', 'IA générative', 'bot', 'numerique', ['ia (llm)', 'ecrire des prompts']),
    e('ux-design', 'Design d\'interface (UX)', 'layout-template', 'numerique', ['creer un site web', 'design graphique (canva…)']),

    // Langues (suite)
    e('anglais', 'Anglais', 'languages', 'langues', ['espagnol', 'allemand']),
    e('espagnol', 'Espagnol', 'languages', 'langues', ['anglais', 'italien']),
    e('chinois', 'Chinois', 'languages', 'langues', ['anglais']),
    e('arabe', 'Arabe', 'languages', 'langues', ['anglais', 'espagnol']),
    e('traduction', 'Traduction', 'book-a', 'langues', ['anglais', 'espagnol', 'redaction']),

    // Business (suite)
    e('marketing', 'Marketing', 'megaphone', 'business', ['vente', 'reseaux sociaux / communaute en ligne', 'storytelling']),
    e('copywriting', 'Copywriting', 'pen-line', 'business', ['redaction', 'vente', 'newsletter']),
    e('publicite', 'Publicité en ligne', 'target', 'business', ['marketing', 'reseaux sociaux / communaute en ligne']),
    e('partenariats', 'Partenariats', 'handshake', 'business', ['networking', 'negociation']),
    e('ecommerce', 'E-commerce', 'shopping-cart', 'business', ['vente', 'creer un site web']),
    e('pitch', 'Pitch et levée de fonds', 'presentation', 'business', ['prise de parole en public', 'entrepreneuriat']),

    // Vente (suite) : le métier de vendre, de la découverte au suivi
    e('vente-conseil', 'Vente conseil', 'lightbulb', 'business', ['vente', 'ecouter pour aider', 'relation client']),
    e('decouverte-client', 'Découverte des besoins du client', 'search', 'business', ['vente', 'ecouter pour aider', 'relation client']),
    e('argumentaire', 'Argumentaire de vente', 'message-square-text', 'business', ['vente', 'storytelling', 'copywriting']),
    e('objections', 'Traiter les objections', 'shield-check', 'business', ['vente', 'negociation', 'cnv']),
    e('closing', 'Conclure une vente', 'check-check', 'business', ['vente', 'negociation']),
    e('devis', 'Rédiger un devis', 'file-text', 'business', ['vente', 'fixer ses prix', 'administratif']),
    e('rdv-commercial', 'Mener un rendez-vous commercial', 'calendar-check', 'business', ['vente', 'ecouter pour aider', 'relation client']),
    e('vente-telephone', 'Vente par téléphone', 'phone', 'business', ['vente', 'prospection', 'voix et diction']),
    e('vente-visio', 'Vendre en visioconférence', 'video', 'business', ['vente', 'animer en visio', 'parler face camera']),
    e('cold-emailing', 'Prospection par e-mail', 'mail', 'business', ['prospection', 'copywriting', 'newsletter']),
    e('social-selling', 'Social selling', 'share-2', 'business', ['prospection', 'reseaux sociaux / communaute en ligne', 'personal branding']),
    e('crm', 'Suivi commercial (CRM)', 'contact', 'business', ['vente', 'excel', 'gestion de projet']),
    e('fidelisation', 'Fidélisation client', 'heart', 'business', ['relation client', 'vente', 'newsletter']),
    e('vente-additionnelle', 'Vente additionnelle', 'circle-plus', 'business', ['vente', 'relation client']),
    e('demonstration', 'Démonstration de produit', 'presentation', 'business', ['vente', 'prise de parole en public', 'pedagogie']),
    e('vente-b2b', 'Vente aux entreprises (B2B)', 'building-2', 'business', ['vente', 'prospection', 'networking']),
    e('appel-offres', 'Répondre à un appel d\'offres', 'file-check', 'business', ['redaction', 'vente', 'gestion de projet']),
    e('relance-commerciale', 'Relance commerciale', 'bell-ring', 'business', ['vente', 'prospection', 'relation client']),
    e('vente-salon', 'Vendre sur un salon', 'store', 'business', ['vente', 'networking', 'accueillir']),
    e('recommandations', 'Obtenir des recommandations', 'thumbs-up', 'business', ['networking', 'relation client', 'vente']),
    e('vente-conseil-independant', 'Vendre ses services d\'indépendant', 'briefcase', 'business', ['vente', 'creer une offre', 'personal branding']),

    // Compétences de base souvent citées (pistes métiers)
    e('coaching', 'Coaching', 'compass', 'relation', ['ecouter pour aider', 'coacher', 'accompagnement individuel'], ['coacher']),
    e('redaction', 'Rédaction', 'pen-line', 'communication', ['ecrire pour le web', 'copywriting', 'recherche et documentation']),
    e('administratif', 'Administratif', 'folder-open', 'organisation', ['comptabilite', 'gestion du temps', 'planification']),
    e('preparer-formation', 'Préparer une formation', 'notebook-pen', 'pedagogie', ['conception cours', 'design pedagogique', 'facilitation d\'ateliers']),
    e('animer-groupe', 'Animer un groupe', 'users-round', 'animation', ['animer', 'facilitation d\'ateliers', 'dynamiser']),
    e('improvisation', 'Improvisation', 'sparkles', 'scene', ['improviser', 'theatre', 'faire rire']),
    e('chant', 'Chant', 'mic-vocal', 'scene', ['chanter', 'voix et diction', 'direction chorale']),

    // Communication (suite)
    e('journalisme', 'Journalisme', 'newspaper', 'communication', ['redaction', 'recherche et documentation']),
    e('interview', 'Interviewer', 'mic', 'communication', ['podcast', 'ecouter pour aider', 'discussions passionnantes']),
    e('discours', 'Rédiger des discours', 'scroll-text', 'communication', ['prise de parole en public', 'storytelling']),
    e('debat', 'Débat et argumentation', 'messages-square', 'communication', ['discussions passionnantes', 'esprit critique']),

    // Animation (suite)
    e('escape-game', 'Escape game', 'key-round', 'animation', ['creation de jeux', 'animer']),
    e('jeux-societe', 'Jeux de société', 'dices', 'animation', ['creation de jeux', 'animer']),
    e('quiz-animation', 'Animer un quiz', 'circle-help', 'animation', ['animer', 'maitre de ceremonie']),
    e('animation-enfants', 'Animation pour enfants', 'baby', 'animation', ['animer', 'faire rire', 'ludopedagogie']),

  ];

  function trouver(id) {
    return ENTREES.find((x) => x.id === id) || null;
  }

  // Index des libellés officiels (français et anglais), construit au premier affichage
  // (la suite de la bibliothèque est ajoutée après ce fichier).
  let indexLibelles = null;
  function parLibelle() {
    if (indexLibelles) return indexLibelles;
    indexLibelles = new Map();
    const poser = (cle, entree) => { if (cle && !indexLibelles.has(cle)) indexLibelles.set(cle, entree); };
    ENTREES.forEach((entree) => {
      if (!entree.nomFr) return;
      poser(N(entree.nomFr), entree);
      poser(N(entree.nom), entree);
      traductions(entree.nomFr).forEach((t) => poser(N(t), entree));
    });
    return indexLibelles;
  }

  function estLibelle(n, entree) {
    if (!entree || !entree.nomFr) return false;
    if (n === N(entree.nomFr) || n === N(entree.nom)) return true;
    return traductions(entree.nomFr).some((t) => n === N(t));
  }

  /*
   * Nom à montrer pour une compétence de la carte.
   * Une entrée de la bibliothèque (cochée au bilan, suggérée, posée depuis l'horizon)
   * s'affiche dans la langue courante, même si elle a été enregistrée dans l'autre.
   * Un nom tapé librement reste tel quel, y compris s'il a seulement été rapproché d'une entrée.
   */
  function nomAffiche(c) {
    if (!c) return '';
    const stocke = typeof c === 'string' ? c : (c.nom || '');
    if (!stocke) return '';
    const n = N(stocke);
    const parId = c.bibliothequeId ? trouver(c.bibliothequeId) : null;
    if (parId) return estLibelle(n, parId) ? parId.nom : stocke;
    const connu = parLibelle().get(n);
    return connu && estLibelle(n, connu) ? connu.nom : stocke;
  }

  CT.bibliotheque = { ENTREES, entree: e, trouver, nomAffiche };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
