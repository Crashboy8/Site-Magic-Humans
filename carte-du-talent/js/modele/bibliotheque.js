/*
 * Bibliothèque de compétences : une cinquantaine d'idées classées par domaine.
 * « liens » : noms (sans accents, en minuscules) de compétences voisines, qui servent
 * à rapprocher une suggestion de ce qui existe déjà sur la carte.
 * « alias » : autres noms sous lesquels la compétence peut déjà figurer sur la carte.
 */
(function (CT) {
  'use strict';

  function e(id, nom, icone, domaine, liens, alias) {
    return { id, nom, icone, domaine, liens: liens || [], alias: alias || [] };
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
    e('evenements', 'Organiser des événements', 'calendar-check', 'organisation', ['creer une communaute', 'mettre en scene un evenement', 'accueillir'])
  ];

  CT.bibliotheque = { ENTREES, trouver: (id) => ENTREES.find((x) => x.id === id) || null };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
