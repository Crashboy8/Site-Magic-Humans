/*
 * Bibliothèque, suite (lot « orientation pro ») : environ 115 compétences de plus, pour les terres à découvrir
 * autour de la carte. Même format que bibliotheque.js : e(id, nom, icône, domaine, liens, alias).
 * Chargé juste après bibliotheque.js. Les noms anglais sont dans js/langues/en-orientation.js.
 */
(function (CT) {
  'use strict';

  const e = CT.bibliotheque.entree;

  CT.bibliotheque.ENTREES.push(
    // Communication
    e('relations-presse', 'Relations presse', 'newspaper', 'communication', ['journalisme', 'redaction', 'networking']),
    e('communication-interne', 'Communication interne', 'messages-square', 'communication', ['redaction', 'newsletter', 'travail en equipe']),
    e('communication-crise', 'Communication de crise', 'shield-alert', 'communication', ['relations presse', 'gestion des conflits', 'prise de decision']),
    e('relecture', 'Relecture et correction', 'spell-check', 'communication', ['redaction', 'ecrire pour le web', 'synthese']),
    e('presentations', 'Concevoir des présentations', 'presentation', 'communication', ['powerpoint', 'storytelling', 'prise de parole en public']),
    e('videos-courtes', 'Vidéos courtes (Reels, TikTok)', 'smartphone', 'communication', ['parler face camera', 'montage video', 'reseaux sociaux']),
    e('ecrire-linkedin', 'Écrire sur LinkedIn', 'pen-line', 'communication', ['ecrire pour le web', 'personal branding', 'social selling']),
    e('script-video', 'Écrire un script vidéo', 'scroll-text', 'communication', ['storytelling', 'ecriture de scenarios', 'parler face camera']),

    // Relation
    e('animer-cercle', 'Animer un cercle de parole', 'users-round', 'relation', ['ecoute active', 'animer un groupe', 'communication non violente']),
    e('accueil-public', 'Accueillir du public', 'hand-heart', 'relation', ['accueillir', 'hospitalite', 'relation client']),
    e('assertivite', 'Affirmation de soi', 'shield-check', 'relation', ['communication non violente', 'donner du feedback', 'negociation']),
    e('diplomatie', 'Diplomatie', 'handshake', 'relation', ['mediation', 'negociation', 'gestion des conflits']),
    e('interculturel', 'Communication interculturelle', 'globe', 'relation', ['anglais', 'espagnol', 'empathie']),
    e('accompagner-changement', 'Accompagner le changement', 'rotate-cw', 'relation', ['coaching', 'leadership', 'facilitation d\'ateliers']),
    e('animer-benevoles', 'Animer des bénévoles', 'heart-handshake', 'relation', ['benevolat', 'coordination d\'equipe', 'leadership']),
    e('entretien-individuel', 'Mener un entretien individuel', 'message-circle', 'relation', ['ecoute active', 'donner du feedback', 'recrutement']),
    e('ecoute-telephone', 'Écoute téléphonique', 'phone', 'relation', ['ecoute active', 'empathie', 'vente par telephone']),
    e('aide-personne', 'Aide à la personne', 'accessibility', 'relation', ['empathie', 'accompagnement individuel', 'hospitalite']),

    // Pédagogie
    e('animer-formation', 'Animer une formation', 'presentation', 'pedagogie', ['preparer une formation', 'animer un groupe', 'prise de parole en public', 'facilitation d\'ateliers', 'pedagogie']),
    e('evaluer-apprentissages', 'Évaluer des apprentissages', 'clipboard-check', 'pedagogie', ['concevoir un cours', 'preparer une formation', 'donner du feedback']),
    e('soutien-scolaire', 'Soutien scolaire', 'book-open-check', 'pedagogie', ['tutorat', 'enseigner aux enfants', 'vulgarisation']),
    e('enseigner-fle', 'Enseigner le français langue étrangère', 'languages', 'pedagogie', ['concevoir un cours', 'tutorat', 'anglais']),
    e('creer-quiz', 'Créer des quiz pédagogiques', 'circle-help', 'pedagogie', ['concevoir un cours', 'animer un quiz', 'ludopedagogie']),
    e('tutoriels', 'Créer des tutoriels', 'monitor-play', 'pedagogie', ['vulgarisation', 'montage video', 'parler face camera']),
    e('conseil-orientation', 'Conseil en orientation', 'compass', 'pedagogie', ['coaching', 'ecoute active', 'accompagnement individuel']),
    e('apprendre-a-apprendre', 'Apprendre à apprendre', 'brain', 'pedagogie', ['pedagogie', 'mentorat', 'tutorat']),

    // Scène
    e('conte', 'Conter des histoires', 'book-open', 'scene', ['storytelling', 'voix et diction', 'theatre']),
    e('voix-off', 'Doublage et voix off', 'mic-vocal', 'scene', ['voix et diction', 'podcast', 'theatre']),
    e('animation-radio', 'Animer une émission de radio', 'radio', 'scene', ['podcast', 'interviewer', 'voix et diction']),
    e('marionnettes', 'Marionnettes', 'hand', 'scene', ['theatre', 'animation pour enfants', 'conter des histoires']),
    e('mise-en-scene-theatre', 'Mise en scène de théâtre', 'drama', 'scene', ['theatre', 'mise en scene', 'improvisation']),
    e('jonglage', 'Jonglage', 'orbit', 'scene', ['jonglage (bolas)', 'arts du cirque', 'acrobatie']),
    e('violon', 'Violon', 'music', 'scene', ['guitare', 'piano', 'composition musicale']),

    // Animation
    e('animation-seniors', 'Animation pour seniors', 'heart-handshake', 'animation', ['animer un groupe', 'empathie', 'jeux de societe']),
    e('grands-jeux', 'Organiser de grands jeux', 'flag', 'animation', ['creation de jeux', 'animer un groupe', 'organiser des evenements']),
    e('animation-commerciale', 'Animation commerciale en magasin', 'store', 'animation', ['vente', 'demonstration de produit', 'animer']),
    e('atelier-creatif', 'Animer un atelier créatif', 'palette', 'animation', ['animer un groupe', 'dessin', 'facilitation d\'ateliers']),
    e('murder-party', 'Murder party', 'key-round', 'animation', ['escape game', 'ecriture de scenarios', 'theatre']),
    e('animation-sportive', 'Animation sportive', 'trophy', 'animation', ['coaching sportif', 'animer un groupe', 'sport d\'equipe']),
    e('blind-test', 'Blind test', 'music', 'animation', ['animer un quiz', 'animation de soiree', 'dj et mix']),
    e('atelier-numerique', 'Animer un atelier numérique', 'laptop', 'animation', ['vulgarisation', 'animer un groupe', 'ia generative']),

    // Création
    e('calligraphie', 'Calligraphie', 'pen-tool', 'creation', ['dessin', 'illustration']),
    e('bijoux', 'Création de bijoux', 'gem', 'creation', ['couture', 'sculpture', 'bricolage']),
    e('tricot', 'Tricot et crochet', 'scissors', 'creation', ['couture']),
    e('decoration-interieur', 'Décoration d\'intérieur', 'house', 'creation', ['dessin', 'bricolage', 'peinture']),
    e('stylisme', 'Stylisme', 'shirt', 'creation', ['couture', 'dessin', 'illustration']),
    e('bande-dessinee', 'Bande dessinée', 'book-open', 'creation', ['dessin', 'illustration', 'ecriture de scenarios']),
    e('animation-2d', 'Animation 2D', 'film', 'creation', ['illustration', 'dessin', 'montage video']),
    e('mao', 'Musique assistée par ordinateur', 'headphones', 'creation', ['composition musicale', 'dj et mix', 'podcast']),
    e('retouche-photo', 'Retouche photo', 'image', 'creation', ['photographie', 'design graphique (canva…)']),
    e('art-floral', 'Art floral', 'flower', 'creation', ['jardinage', 'decoration d\'interieur']),

    // Corps
    e('premiers-secours', 'Premiers secours', 'shield-plus', 'corps', ['respiration et gestion du stress', 'coaching sportif']),
    e('nutrition', 'Nutrition', 'apple', 'corps', ['cuisine', 'coaching sportif']),
    e('massage', 'Massage bien-être', 'hand', 'corps', ['yoga', 'respiration et gestion du stress', 'empathie']),
    e('sophrologie', 'Sophrologie', 'moon', 'corps', ['meditation', 'respiration et gestion du stress', 'accompagnement individuel']),
    e('pilates', 'Pilates', 'activity', 'corps', ['yoga', 'danse', 'coaching sportif']),
    e('marche-nordique', 'Marche nordique', 'footprints', 'corps', ['randonnee', 'course a pied']),
    e('qi-gong', 'Qi gong et tai-chi', 'wind', 'corps', ['yoga', 'meditation', 'arts martiaux']),
    e('sport-sante', 'Sport santé', 'heart-pulse', 'corps', ['coaching sportif', 'premiers secours', 'accompagnement individuel']),
    e('self-defense', 'Self-défense', 'shield', 'corps', ['arts martiaux', 'affirmation de soi']),

    // Numérique
    e('tableur', 'Tableur (Excel, Sheets)', 'sheet', 'numerique', ['excel avance', 'analyse de donnees', 'gerer un budget'], ['excel', 'google sheets']),
    e('bureautique', 'Bureautique (Word, PowerPoint)', 'file-text', 'numerique', ['concevoir des presentations', 'redaction'], ['word', 'powerpoint']),
    e('cybersecurite', 'Cybersécurité', 'lock', 'numerique', ['programmation', 'bases de donnees']),
    e('developpement-web', 'Développement web (HTML, CSS)', 'code', 'numerique', ['creer un site web', 'programmation']),
    e('appli-mobile', 'Créer une appli mobile', 'smartphone', 'numerique', ['programmation', 'design d\'interface (ux)', 'automatisation no-code']),
    e('agents-ia', 'Agents IA et automatisations', 'bot', 'numerique', ['ia generative', 'ecrire des prompts', 'automatisation no-code'], ['ia agentique']),
    e('outils-collaboratifs', 'Outils collaboratifs (Notion, Trello)', 'kanban', 'numerique', ['gestion de projet', 'planification'], ['notion', 'trello']),
    e('mesure-audience', 'Mesure d\'audience (Analytics)', 'chart-line', 'numerique', ['referencement (seo)', 'analyse de donnees', 'publicite en ligne']),
    e('sql', 'SQL', 'database', 'numerique', ['bases de donnees', 'analyse de donnees', 'python']),
    e('support-informatique', 'Support informatique', 'life-buoy', 'numerique', ['resolution de problemes', 'relation client']),
    e('jeu-video', 'Créer un jeu vidéo', 'gamepad-2', 'numerique', ['programmation', 'creation de jeux', 'ecriture de scenarios']),

    // Langues
    e('portugais', 'Portugais', 'languages', 'langues', ['espagnol', 'italien']),
    e('japonais', 'Japonais', 'languages', 'langues', ['chinois', 'anglais']),
    e('russe', 'Russe', 'languages', 'langues', ['allemand', 'anglais']),
    e('neerlandais', 'Néerlandais', 'languages', 'langues', ['allemand', 'anglais']),
    e('interpretariat', 'Interprétariat', 'headphones', 'langues', ['traduction', 'anglais', 'ecoute active']),
    e('francais-ecrit', 'Orthographe et français écrit', 'spell-check', 'langues', ['redaction', 'relecture et correction']),

    // Business
    e('business-plan', 'Business plan', 'file-text', 'business', ['entrepreneuriat', 'analyse financiere', 'strategie']),
    e('gestion-tpe', 'Gérer une petite entreprise', 'store', 'business', ['entrepreneuriat', 'gerer un budget', 'administratif']),
    e('marketing-contenu', 'Marketing de contenu', 'file-text', 'business', ['marketing', 'ecrire pour le web', 'storytelling']),
    e('tunnel-vente', 'Tunnel de vente', 'funnel', 'business', ['marketing', 'copywriting', 'automatisation no-code']),
    e('achats', 'Achats et négociation fournisseurs', 'shopping-bag', 'business', ['negociation', 'gerer un budget', 'logistique']),
    e('micro-entreprise', 'Statut d\'indépendant (micro-entreprise)', 'briefcase', 'business', ['administratif', 'comptabilite', 'entrepreneuriat']),
    e('merchandising', 'Merchandising', 'store', 'business', ['vente', 'decoration d\'interieur', 'marketing']),
    e('crowdfunding', 'Financement participatif', 'coins', 'business', ['pitch et levee de fonds', 'reseaux sociaux', 'storytelling']),

    // Organisation
    e('demarche-qualite', 'Démarche qualité', 'badge-check', 'organisation', ['audit et diagnostic', 'optimiser des processus']),
    e('gestion-stocks', 'Gestion des stocks', 'package', 'organisation', ['logistique', 'tableur (excel, sheets)']),
    e('methodes-agiles', 'Méthodes agiles (Scrum)', 'rotate-cw', 'organisation', ['gestion de projet', 'facilitation d\'ateliers', 'priorisation']),
    e('gestion-risques', 'Gestion des risques', 'shield-alert', 'organisation', ['gestion de projet', 'audit et diagnostic', 'prise de decision']),
    e('paie', 'Paie et gestion RH', 'receipt', 'organisation', ['administratif', 'comptabilite', 'recrutement']),
    e('facturation', 'Facturation', 'receipt', 'organisation', ['administratif', 'comptabilite', 'rediger un devis']),
    e('organiser-voyages', 'Organiser des voyages', 'plane', 'organisation', ['logistique', 'planification', 'organiser des evenements']),
    e('rangement', 'Rangement et organisation de la maison', 'archive', 'organisation', ['planification', 'priorisation']),

    // Analyse
    e('bases-juridiques', 'Bases juridiques (contrats)', 'gavel', 'analyse', ['administratif', 'esprit critique', 'redaction']),
    e('fiscalite', 'Fiscalité de base', 'landmark', 'analyse', ['comptabilite', 'analyse financiere', 'administratif']),
    e('etude-marche', 'Étude de marché', 'target', 'analyse', ['recherche et documentation', 'marketing', 'statistiques']),
    e('pensee-systemique', 'Pensée systémique', 'network', 'analyse', ['strategie', 'modelisation', 'resolution de problemes']),
    e('cartes-mentales', 'Cartes mentales', 'brain', 'analyse', ['synthese', 'facilitation graphique', 'apprendre a apprendre']),
    e('psychologie', 'Psychologie', 'brain', 'analyse', ['ecoute active', 'intelligence emotionnelle', 'coaching']),
    e('enneagramme', 'Ennéagramme', 'shapes', 'analyse', ['psychologie', 'coaching', 'intelligence emotionnelle']),
    e('enquete-terrain', 'Enquête de terrain', 'clipboard-list', 'analyse', ['interviewer', 'recherche et documentation', 'statistiques']),

    // Nature
    e('maraichage', 'Maraîchage', 'carrot', 'nature', ['jardinage', 'permaculture']),
    e('soins-animaux', 'Soins aux animaux', 'dog', 'nature', ['empathie', 'observation de la nature']),
    e('equitation', 'Équitation', 'footprints', 'nature', ['soins aux animaux', 'randonnee']),
    e('compostage', 'Compostage', 'recycle', 'nature', ['jardinage', 'ecologie et transition']),
    e('botanique', 'Botanique', 'leaf', 'nature', ['cueillette et plantes', 'jardinage', 'observation de la nature']),
    e('astronomie', 'Astronomie', 'telescope', 'nature', ['observation de la nature', 'vulgarisation']),
    e('bushcraft', 'Vie en pleine nature (bushcraft)', 'tent', 'nature', ['randonnee', 'cueillette et plantes', 'bricolage']),

    // Technique
    e('impression-3d', 'Impression 3D', 'box', 'technique', ['electronique', 'bricolage', 'design graphique (canva…)']),
    e('soudure', 'Soudure', 'flame', 'technique', ['mecanique', 'bricolage']),
    e('plomberie', 'Plomberie', 'droplet', 'technique', ['bricolage', 'reparation']),
    e('electricite', 'Électricité du bâtiment', 'zap', 'technique', ['electronique', 'bricolage']),
    e('renovation', 'Rénovation', 'hammer', 'technique', ['bricolage', 'menuiserie', 'peinture en batiment']),
    e('reparation-velo', 'Réparation de vélos', 'bike', 'technique', ['mecanique', 'reparation', 'velo']),
    e('domotique', 'Domotique', 'house', 'technique', ['electronique', 'automatisation no-code']),
    e('regie-son-lumiere', 'Régie son et lumière', 'sliders-horizontal', 'technique', ['electronique', 'mettre en scene un evenement', 'dj et mix']),
    e('peinture-batiment', 'Peinture en bâtiment', 'paint-roller', 'technique', ['bricolage', 'renovation'])
  );

  // « Préparer un cours » (exemple de Pierre) doit retrouver « Concevoir un cours ».
  const cours = CT.bibliotheque.trouver('conception-cours');
  if (cours && !cours.alias.includes('preparer un cours')) cours.alias.push('preparer un cours');
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
