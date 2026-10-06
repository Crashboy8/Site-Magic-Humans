/*
 * Données du lot « orientation pro » : temps d'apprentissage, premières actions, plan sur 30 jours,
 * bilan d'acquis, infos des pistes (statut, revenu indicatif, exemple) et lien vers l'appel découverte.
 * Textes écrits en français ; ils passent par T() au moment de l'affichage (traductions : js/langues/en-orientation.js).
 * Aucun accès au DOM.
 */
(function (CT) {
  'use strict';

  // Temps pour atteindre un premier niveau utilisable, à raison d'environ 3 h par semaine.
  const DUREES = {
    court: { heures: 15, libelle: 'environ 15 h, soit 4 à 6 semaines à 3 h par semaine', penalite: 0, effort: 1 },
    moyen: { heures: 40, libelle: 'environ 40 h, soit 2 à 4 mois à 3 h par semaine', penalite: 1, effort: 2 },
    long: { heures: 120, libelle: 'environ 120 h, soit 6 à 12 mois à 3 h par semaine', penalite: 2, effort: 3 },
    tres_long: { heures: 300, libelle: '300 h et plus, soit 1 à 2 ans de pratique régulière', penalite: 3, effort: 5 }
  };

  // Durée par défaut selon le domaine de la bibliothèque.
  const DUREE_DOMAINE = {
    communication: 'moyen', relation: 'moyen', pedagogie: 'moyen', scene: 'long', animation: 'court', creation: 'long', corps: 'moyen',
    numerique: 'moyen', langues: 'tres_long', business: 'moyen', organisation: 'moyen', analyse: 'moyen', nature: 'moyen', technique: 'long'
  };

  // Exceptions à la durée du domaine (id de la bibliothèque → durée).
  const DUREE = {
    // Court : quelques semaines suffisent pour un premier niveau.
    reseaux: 'court', newsletter: 'court', prompts: 'court', 'design-graphique': 'court', 'animer-visio': 'court', feedback: 'court',
    'quiz-animation': 'court', 'jeux-societe': 'court', devis: 'court', 'relance-commerciale': 'court', recommandations: 'court',
    'cold-emailing': 'court', crm: 'court', 'gestion-temps': 'court', priorisation: 'court', planification: 'court',
    'outils-collaboratifs': 'court', presentations: 'court', 'videos-courtes': 'court', 'ecrire-linkedin': 'court',
    'premiers-secours': 'court', 'creer-quiz': 'court', 'blind-test': 'court', compostage: 'court', facturation: 'court',
    'micro-entreprise': 'court', 'ia-generative': 'court', 'marche-nordique': 'court', rangement: 'court', 'mesure-audience': 'court',
    tableur: 'court', bureautique: 'court', 'face-camera': 'court', 'ecoute-active': 'court', networking: 'court', 'accueil-public': 'court',
    // Long : des mois de pratique régulière.
    programmation: 'long', python: 'long', 'bases-donnees': 'long', 'developpement-web': 'long', 'appli-mobile': 'long', 'ux-design': 'long',
    'analyse-financiere': 'long', comptabilite: 'long', strategie: 'long', coaching: 'long', mediation: 'long', journalisme: 'long',
    permaculture: 'long', apiculture: 'long', psychologie: 'long', fiscalite: 'long', 'bases-juridiques': 'long', 'jeu-video': 'long',
    massage: 'long', sophrologie: 'long', yoga: 'long', danse: 'long', cybersecurite: 'long', equitation: 'long', 'former-formateurs': 'long',
    leadership: 'long', entrepreneuriat: 'long', 'enseigner-fle': 'long', 'conseil-orientation': 'long', nutrition: 'long', 'qi-gong': 'long',
    'animation-2d': 'long', 'pensee-systemique': 'long', 'sport-sante': 'long',
    // Très long : un an et plus.
    traduction: 'tres_long', interpretariat: 'tres_long', 'arts-martiaux': 'tres_long', piano: 'tres_long', violon: 'tres_long',
    // Moyen dans un domaine plutôt long (ou plutôt court).
    escalade: 'moyen', 'retouche-photo': 'moyen', photographie: 'moyen', cuisine: 'moyen', 'impression-3d': 'moyen', 'reparation-velo': 'moyen',
    'peinture-batiment': 'moyen', 'voix-off': 'moyen', conte: 'moyen', jonglage: 'moyen', 'animation-radio': 'moyen', improvisation: 'moyen',
    'stand-up': 'moyen', sql: 'moyen', 'francais-ecrit': 'moyen', 'animation-soiree': 'moyen', 'maitre-ceremonie': 'moyen',
    'team-building': 'moyen', 'creation-jeux': 'moyen', 'escape-game': 'moyen', 'murder-party': 'moyen', 'grands-jeux': 'moyen', enneagramme: 'moyen'
  };

  // Trois premières actions concrètes, par domaine ({nom} = nom de la compétence).
  const ACTIONS_DOMAINE = {
    communication: [
      'Repère 3 personnes qui font très bien « {nom} » et note ce qui marche chez elles.',
      'Fais un premier essai court (10 minutes) et garde-le, même imparfait.',
      'Montre-le à une personne de confiance et demande-lui une seule chose à améliorer.'
    ],
    relation: [
      'Choisis une situation de ta semaine où « {nom} » peut servir, et décide comment tu vas t\'y prendre.',
      'Lis un article ou regarde une vidéo de référence (20 minutes), puis note 3 idées à tester.',
      'Teste une idée dans une vraie conversation, puis écris en 3 lignes ce qui s\'est passé.'
    ],
    pedagogie: [
      'Choisis un sujet que tu connais bien et un public précis (collègues, amis, enfants).',
      'Prépare 15 minutes de contenu avec un objectif clair et une petite activité.',
      'Anime-le pour 2 ou 3 personnes et demande-leur ce qu\'elles ont retenu.'
    ],
    scene: [
      'Trouve un cours d\'essai ou un atelier près de chez toi (souvent gratuit la première fois).',
      'Entraîne-toi 15 minutes par jour pendant une semaine, sans viser la perfection.',
      'Montre un petit extrait à un proche ou dans un lieu bienveillant (scène ouverte, groupe).'
    ],
    animation: [
      'Participe à une animation de ce type comme joueur et observe le déroulé.',
      'Prépare une version courte (30 minutes) pour des proches ou des collègues.',
      'Anime-la, puis note ce qui a fait rire, ce qui a coincé et ce que tu changes.'
    ],
    creation: [
      'Choisis un tutoriel débutant (vidéo ou livre) et rassemble le matériel de base.',
      'Réalise une première petite pièce en suivant le tutoriel pas à pas.',
      'Refais-la à ta façon, puis partage le résultat avec quelqu\'un.'
    ],
    corps: [
      'Réserve une séance découverte avec un club ou un professionnel.',
      'Bloque 2 créneaux fixes dans ta semaine pour pratiquer.',
      'Note après chaque séance ton énergie de 1 à 5 : ça te dira si c\'est pour toi.'
    ],
    numerique: [
      'Installe l\'outil (ou ouvre un compte gratuit) et suis un tutoriel débutant de 30 minutes.',
      'Applique-le à un vrai petit besoin de ta vie ou de ton travail.',
      'Note les 3 blocages rencontrés et cherche la réponse sur un forum ou auprès d\'un collègue.'
    ],
    langues: [
      'Installe une application d\'apprentissage et fais 10 minutes par jour.',
      'Regarde une série ou écoute un podcast dans cette langue, avec sous-titres.',
      'Trouve un partenaire d\'échange linguistique (en ligne ou dans ta ville) pour 30 minutes de conversation.'
    ],
    business: [
      'Interroge une personne qui pratique « {nom} » au quotidien : demande-lui ses 3 conseils de départ.',
      'Lis une ressource de référence (livre, guide, formation courte) et fais-en une fiche d\'une page.',
      'Teste-le pour de vrai sur une petite situation (un client, une offre, un rendez-vous).'
    ],
    organisation: [
      'Choisis un petit projet réel de ta vie (un repas, un week-end, un dossier) pour t\'entraîner.',
      'Teste une méthode ou un outil simple (liste, tableau, calendrier) sur ce projet.',
      'Fais le point en fin de semaine : ce qui a marché, ce que tu gardes.'
    ],
    analyse: [
      'Choisis une question concrète qui t\'intéresse vraiment.',
      'Suis une ressource d\'initiation (MOOC, livre, vidéo) pendant 1 heure.',
      'Applique-la à ta question et résume ce que tu as trouvé en 5 lignes.'
    ],
    nature: [
      'Rejoins une sortie, un jardin partagé ou une association près de chez toi.',
      'Procure-toi un guide débutant et pratique 30 minutes sur le terrain.',
      'Tiens un petit carnet : ce que tu as vu, fait ou appris à chaque sortie.'
    ],
    technique: [
      'Trouve un atelier partagé, un fablab ou un repair café pour pratiquer avec du matériel.',
      'Fais un premier petit projet guidé (réparer, assembler, fabriquer).',
      'Demande à quelqu\'un d\'expérimenté de regarder ton travail et de te donner un conseil.'
    ]
  };

  // Actions propres à quelques compétences très demandées (remplacent celles du domaine).
  const ACTIONS = {
    'animer-formation': [
      'Choisis un sujet que tu maîtrises et propose 30 minutes de formation à des collègues ou à une association.',
      'Prépare un déroulé simple : un objectif, une activité, une synthèse.',
      'Après la séance, demande à chacun ce qu\'il a retenu et ce qu\'il aurait voulu de plus.'
    ],
    'preparer-formation': [
      'Écris en une phrase ce que les participants sauront faire à la fin.',
      'Découpe ta formation en 3 étapes, avec une activité pratique pour chacune.',
      'Fais relire ton déroulé par quelqu\'un du public visé.'
    ],
    'conception-cours': [
      'Choisis une notion et trouve un exemple de la vie quotidienne pour l\'expliquer.',
      'Prépare un support d\'une page : l\'essentiel, un exemple, un exercice.',
      'Teste ton cours sur une personne et note où elle a décroché.'
    ],
    'prise-parole': [
      'Prépare une intervention de 3 minutes sur un sujet qui te passionne.',
      'Filme-toi une fois, regarde la vidéo et note une seule chose à améliorer.',
      'Prends la parole en réunion, en association ou dans un club (Toastmasters, scène ouverte).'
    ],
    'animer-groupe': [
      'Propose d\'animer un moment court : un tour de table, un jeu, une réunion.',
      'Prépare un début qui met tout le monde à l\'aise et une fin qui donne envie de revenir.',
      'Après, demande à deux participants ce qu\'ils ont aimé.'
    ],
    vente: [
      'Fais la liste de 3 choses que tu as déjà « vendues » sans le dire (une idée, un projet, un service).',
      'Lis ou écoute une ressource sur la vente conseil, puis note 3 questions à poser à un client.',
      'Mène une vraie conversation de découverte avec une personne qui pourrait avoir besoin de toi.'
    ],
    negociation: [
      'Avant ta prochaine discussion importante, écris ce que tu veux, ce que tu acceptes et ce que tu refuses.',
      'Entraîne-toi sur une petite négociation de la vie courante (un prix, un délai, un service).',
      'Après coup, note ce que l\'autre voulait vraiment : c\'est la clé de la prochaine fois.'
    ],
    prospection: [
      'Liste 20 personnes ou structures qui pourraient avoir besoin de ce que tu fais.',
      'Écris un message court et personnel, et envoie-le à 5 d\'entre elles.',
      'Note les réponses et relance gentiment une semaine plus tard.'
    ],
    'creation-offre': [
      'Décris en une phrase pour qui est ton offre et quel problème elle règle.',
      'Fixe un contenu, une durée et un prix de départ (tu pourras l\'ajuster).',
      'Présente-la à 3 personnes du public visé et note leurs réactions.'
    ],
    coaching: [
      'Découvre les bases : un livre d\'initiation ou une vidéo sur la posture de coach.',
      'Propose une séance gratuite de 45 minutes à une personne de ton entourage.',
      'Entraîne-toi à poser des questions ouvertes au lieu de donner des conseils.'
    ],
    facilitation: [
      'Participe à un atelier d\'intelligence collective et note les techniques utilisées.',
      'Choisis une technique simple (post-it, tour de parole, vote) et teste-la en réunion.',
      'Demande au groupe ce qui l\'a aidé à avancer.'
    ],
    redaction: [
      'Écris 300 mots par jour pendant une semaine, sur ce que tu veux.',
      'Relis un de tes textes à voix haute et coupe tout ce qui n\'est pas utile.',
      'Fais lire un texte à quelqu\'un et demande-lui ce qu\'il a retenu.'
    ],
    'ecrire-web': [
      'Choisis un sujet que tu connais et écris un article de 500 mots avec des intertitres.',
      'Commence par la réponse à la question du lecteur, puis donne les détails.',
      'Publie-le (blog, LinkedIn, site d\'une association) et regarde les réactions.'
    ],
    reseaux: [
      'Choisis un seul réseau, celui où se trouvent les personnes que tu veux toucher.',
      'Publie 3 fois cette semaine : un conseil, une histoire, une question.',
      'Réponds à chaque commentaire et commente 5 publications d\'autres personnes.'
    ],
    budget: [
      'Fais le budget d\'un vrai projet : un voyage, un événement, ton mois.',
      'Utilise un tableur simple avec trois colonnes : prévu, réel, écart.',
      'Fais le point en fin de mois et ajuste une ligne.'
    ],
    'gestion-projet': [
      'Choisis un projet réel et écris son objectif, sa date de fin et ses étapes.',
      'Mets les tâches dans un outil simple (tableau, liste, Trello).',
      'Fais un point de 15 minutes chaque semaine : fait, à faire, bloqué.'
    ],
    tableur: [
      'Suis un tutoriel débutant sur les formules SOMME, MOYENNE et SI.',
      'Crée un tableau utile pour toi (budget, suivi, inventaire).',
      'Ajoute un graphique et un filtre, puis montre-le à quelqu\'un.'
    ],
    'ia-generative': [
      'Ouvre un assistant IA et demande-lui de t\'aider sur une vraie tâche de ta semaine.',
      'Essaie 3 façons de formuler ta demande et compare les réponses.',
      'Note les usages qui te font vraiment gagner du temps.'
    ],
    anglais: [
      'Fais 10 minutes par jour sur une application, au même moment de la journée.',
      'Regarde un épisode de série en anglais avec sous-titres anglais.',
      'Trouve un échange linguistique (en ligne ou dans ta ville) pour parler 30 minutes.'
    ],
    storytelling: [
      'Raconte une anecdote de ta vie en 2 minutes : une situation, un problème, un dénouement.',
      'Repère la structure d\'une histoire qui t\'a marqué·e (film, pub, discours).',
      'Utilise une histoire dans ta prochaine présentation ou ton prochain post.'
    ],
    'ecoute-active': [
      'Pendant une conversation, reformule ce que l\'autre vient de dire avant de répondre.',
      'Pose une question ouverte de plus que d\'habitude, et laisse des silences.',
      'Le soir, note ce que tu as appris sur l\'autre grâce à ton écoute.'
    ],
    feedback: [
      'Repère une chose qu\'une personne a bien faite cette semaine et dis-le-lui précisément.',
      'Entraîne-toi à la formule : fait observé, effet sur toi, proposition.',
      'Demande toi-même un retour sur un de tes travaux.'
    ],
    'personal-branding': [
      'Écris en une phrase ce que tu fais, pour qui, et ce qui te rend différent·e.',
      'Mets à jour ton profil LinkedIn (titre, résumé, photo).',
      'Publie une histoire qui montre ce que tu sais faire.'
    ],
    'vente-conseil-independant': [
      'Écris la liste des problèmes que tu règles pour tes clients.',
      'Prépare 5 questions de découverte pour ton premier rendez-vous.',
      'Propose ton service à 3 personnes et demande-leur franchement ce qui les ferait dire oui.'
    ],
    prix: [
      'Calcule ce dont tu as besoin par mois et combien de jours tu peux vraiment vendre.',
      'Regarde les prix de 5 personnes qui proposent un service proche.',
      'Annonce ton nouveau prix à voix haute 10 fois, jusqu\'à ce qu\'il te paraisse normal.'
    ],
    'e-learning': [
      'Choisis un module court (10 minutes) sur un sujet que tu maîtrises.',
      'Écris le script, puis enregistre-le avec un outil simple (diaporama et voix).',
      'Fais-le tester par 3 personnes et corrige ce qui les a perdues.'
    ],
    'face-camera': [
      'Enregistre-toi 1 minute avec ton téléphone, sans couper.',
      'Regarde la vidéo et choisis une seule chose à améliorer (regard, rythme, sourire).',
      'Envoie ta troisième vidéo à une personne de confiance, ou publie-la.'
    ],
    networking: [
      'Repère un événement de ton secteur ou de ta ville ce mois-ci et inscris-toi.',
      'Prépare ta présentation en 30 secondes, simple et vraie.',
      'Recontacte dans les 48 heures deux personnes rencontrées.'
    ]
  };

  // Plan sur 30 jours : la semaine 1 reprend les trois premières actions de la compétence.
  const PLAN_SEMAINES = [
    { titre: 'Semaine 1 : découvrir', actions: null },
    { titre: 'Semaine 2 : pratiquer', actions: [
      'Pratique « {nom} » 2 fois cette semaine, 30 minutes chaque fois.',
      'Trouve une personne qui maîtrise « {nom} » et pose-lui 3 questions.',
      'Note ce qui te met dans le flow quand tu pratiques, et ce qui te freine.'
    ] },
    { titre: 'Semaine 3 : se lancer en vrai', actions: [
      'Utilise « {nom} » dans une vraie situation (travail, association, proches).',
      'Demande un retour honnête à une personne qui en a profité.',
      'Ajuste une chose à partir de ce retour et refais un essai.'
    ] },
    { titre: 'Semaine 4 : montrer et décider', actions: [
      'Montre ce que tu as fait : un post, une démo, un petit atelier, un exemple concret.',
      'Relis tes notes du mois : qu\'est-ce qui t\'a donné de l\'énergie ?',
      'Décide de la suite : tu continues, tu conquiers ce territoire ou tu passes à autre chose.'
    ] }
  ];

  // Bilan d'acquis : 30 compétences courantes, en 6 familles de 5 (ids de la bibliothèque).
  const BILAN = [
    { titre: 'Transmettre', icone: 'graduation-cap', ids: ['animer-groupe', 'prise-parole', 'animer-formation', 'conception-cours', 'vulgarisation'] },
    { titre: 'Être en relation', icone: 'heart-handshake', ids: ['ecoute-active', 'accompagnement-individuel', 'feedback', 'conflits', 'relation-client'] },
    { titre: 'Communiquer', icone: 'megaphone', ids: ['redaction', 'ecrire-web', 'reseaux', 'storytelling', 'anglais'] },
    { titre: 'Vendre et entreprendre', icone: 'handshake', ids: ['vente', 'negociation', 'prospection', 'creation-offre', 'networking'] },
    { titre: 'Organiser', icone: 'calendar-check', ids: ['gestion-projet', 'budget', 'evenements', 'planification', 'coordination-equipe'] },
    { titre: 'Numérique et analyse', icone: 'monitor', ids: ['tableur', 'design-graphique', 'ia-generative', 'synthese', 'resolution-problemes'] }
  ];

  const STATUTS_PISTE = {
    salarie: 'Salarié·e',
    independant: 'Indépendant·e',
    mixte: 'Mixte (salarié·e et indépendant·e)',
    a_cote: 'À côté (bénévole ou en complément)'
  };

  // Comment lire le revenu, selon le type de piste.
  const NOTES_REVENU = {
    metier: 'Net par mois, à temps plein, du début de carrière à l\'expérience confirmée.',
    activite: 'En complément d\'une autre activité, selon le temps que tu y consacres.',
    offre: 'Revenu net par mois d\'un·e indépendant·e installé·e, après charges : très variable selon tes prix et ton nombre de clients.'
  };
  const SOURCE_REVENU = 'Ordre de grandeur indicatif pour la France, estimé par Magic Humans à partir de repères publics (APEC, France Travail, Insee). À vérifier selon ta région, ton expérience et ton statut.';

  // id de la piste → [statut, revenu min, revenu max (net €/mois, null = bénévole), exemple de profil]
  const PISTES_INFOS = {
    formateur: ['mixte', 1900, 3500, 'Ancienne commerciale, elle forme des équipes à la vente deux jours par semaine et prépare ses modules le reste du temps.'],
    coach: ['independant', 1500, 4500, 'Ex-cadre en reconversion, il accompagne une dizaine de clients en séances individuelles, surtout en visio.'],
    facilitateur: ['independant', 1800, 4000, 'Il conçoit et anime des ateliers d\'intelligence collective pour des équipes qui doivent décider ensemble.'],
    mediateur: ['mixte', 1700, 3000, 'Après 15 ans en RH, elle intervient en médiation dans les entreprises et pour une association de quartier.'],
    'consultant-rh': ['salarie', 2300, 4000, 'Elle conseille des PME sur le recrutement et le management, entre missions courtes et suivi au long cours.'],
    educateur: ['salarie', 1600, 2300, 'Il accompagne des adolescents en foyer, avec beaucoup d\'écoute et des activités pour recréer du lien.'],
    enseignant: ['salarie', 2000, 3100, 'Elle fait classe en CE2 et adore inventer des jeux pour que chaque enfant progresse à son rythme.'],
    'prof-langues': ['mixte', 1700, 3000, 'Il donne des cours d\'anglais en entreprise le matin et des cours particuliers en ligne le soir.'],
    'animateur-enfants': ['salarie', 1400, 1900, 'Elle anime un centre de loisirs et crée des grands jeux à thème pendant les vacances.'],
    manager: ['salarie', 2500, 4500, 'Il encadre une équipe de huit personnes et passe beaucoup de temps à faire grandir chacun.'],
    'chef-projet': ['salarie', 2500, 4200, 'Elle pilote des projets de A à Z, du planning au budget, en gardant toute l\'équipe embarquée.'],
    evenementiel: ['mixte', 1800, 3200, 'Il organise des séminaires et des soirées d\'entreprise, de la recherche du lieu jusqu\'au jour J.'],
    assistant: ['salarie', 1800, 2800, 'Elle tient l\'agenda et l\'organisation d\'une direction : c\'est grâce à elle que tout tourne.'],
    comptable: ['salarie', 1900, 3200, 'Il tient la comptabilité de plusieurs petites entreprises dans un cabinet, avec des clients fidèles.'],
    'analyste-financier': ['salarie', 2600, 4500, 'Elle analyse les chiffres d\'un groupe et aide la direction à choisir où investir.'],
    auditeur: ['salarie', 2200, 3600, 'Il vérifie que les processus d\'une usine respectent les normes et propose des améliorations.'],
    'consultant-strategie': ['salarie', 3000, 6000, 'Elle aide des dirigeants à choisir leur cap, avec des analyses claires et des ateliers de décision.'],
    'charge-etudes': ['salarie', 2100, 3300, 'Il mène des enquêtes et transforme les résultats en recommandations faciles à lire.'],
    recrutement: ['salarie', 1900, 3000, 'Elle repère des talents, mène les entretiens et aime voir les gens trouver le bon poste.'],
    accueil: ['salarie', 1450, 1900, 'Il accueille les visiteurs d\'un grand hôtel en trois langues, avec le sourire en toute circonstance.'],
    'commercial-b2b': ['salarie', 2000, 4500, 'Elle vend des solutions à des entreprises, du premier rendez-vous jusqu\'à la signature.'],
    'business-dev': ['salarie', 2400, 4500, 'Il ouvre de nouveaux marchés pour une jeune entreprise et passe ses journées à créer des contacts.'],
    'relation-client': ['salarie', 2200, 3600, 'Elle dirige un service client et transforme les réclamations en clients fidèles.'],
    partenariats: ['salarie', 2500, 4200, 'Il monte des partenariats entre sa structure et des entreprises, en cherchant le gagnant-gagnant.'],
    marketing: ['salarie', 2600, 4500, 'Elle construit les campagnes d\'une marque, des messages jusqu\'aux résultats chiffrés.'],
    ecommercant: ['independant', 1000, 4000, 'Il vend des produits artisanaux sur sa boutique en ligne et gère tout, de la photo à l\'envoi.'],
    communication: ['salarie', 1900, 3000, 'Elle s\'occupe du site, des réseaux et de la newsletter d\'une association régionale.'],
    'community-manager': ['mixte', 1700, 2800, 'Il anime les réseaux sociaux de plusieurs marques locales, à mi-temps en agence et à mi-temps en freelance.'],
    redacteur: ['independant', 1400, 3000, 'Elle écrit des articles et des pages web pour des entreprises, depuis chez elle.'],
    journaliste: ['mixte', 1700, 3200, 'Il enquête et écrit pour un média régional, et réalise aussi des podcasts.'],
    traducteur: ['independant', 1500, 3000, 'Elle traduit des documents techniques de l\'anglais et de l\'espagnol vers le français.'],
    videaste: ['independant', 1500, 3500, 'Il filme et monte des vidéos pour des entreprises et des événements.'],
    graphiste: ['mixte', 1600, 3000, 'Elle crée des logos et des supports de communication, entre une agence et ses propres clients.'],
    illustrateur: ['independant', 1000, 2800, 'Il illustre des livres jeunesse et vend ses affiches sur des salons.'],
    photographe: ['independant', 1200, 3000, 'Elle photographie des mariages le week-end et des portraits d\'entrepreneurs en semaine.'],
    'ux-designer': ['salarie', 2500, 4200, 'Il observe comment les gens utilisent une appli et la rend plus simple.'],
    auteur: ['mixte', 300, 2500, 'Elle a publié deux romans et anime des ateliers d\'écriture pour compléter ses revenus.'],
    scenariste: ['independant', 1000, 4000, 'Il écrit des épisodes de séries et des scripts de vidéos pour des marques.'],
    developpeur: ['salarie', 2500, 4500, 'Elle développe des applications web dans une PME, avec une équipe soudée.'],
    nocode: ['independant', 2000, 5000, 'Il automatise les tâches répétitives de petites entreprises avec des outils no-code.'],
    'data-analyst': ['salarie', 2400, 4000, 'Elle transforme des tableaux de chiffres en tableaux de bord qui aident à décider.'],
    'consultant-ia': ['independant', 2500, 6000, 'Il forme et accompagne des équipes pour utiliser l\'IA au quotidien, sans jargon.'],
    comedien: ['mixte', 1200, 2800, 'Elle joue au théâtre, fait du doublage et anime des ateliers d\'improvisation en entreprise.'],
    humoriste: ['independant', 500, 3000, 'Il rode ses sketchs sur des scènes ouvertes et anime des soirées d\'entreprise.'],
    'musicien-intervenant': ['mixte', 1400, 2600, 'Elle fait chanter des classes et des chorales d\'entreprise, guitare à la main.'],
    'artiste-cirque': ['mixte', 1300, 2500, 'Il jongle dans des spectacles et donne des cours de cirque aux enfants.'],
    'prof-yoga': ['independant', 1200, 2800, 'Elle donne des cours collectifs dans un studio et des séances en entreprise.'],
    'coach-sportif': ['independant', 1400, 3200, 'Il accompagne des particuliers à domicile et anime des cours en plein air.'],
    'prof-danse': ['mixte', 1400, 2600, 'Elle enseigne la danse dans une école et monte un spectacle à chaque fin d\'année.'],
    'guide-nature': ['mixte', 1400, 2200, 'Il emmène des groupes en balade et leur fait découvrir les oiseaux et les plantes.'],
    permaculteur: ['independant', 900, 2200, 'Elle cultive une micro-ferme et forme des particuliers à la permaculture.'],
    'transition-ecologique': ['salarie', 2000, 3300, 'Il aide une collectivité à réduire son empreinte carbone, projet après projet.'],
    traiteur: ['independant', 1500, 3200, 'Elle cuisine pour des mariages et des séminaires, avec des produits locaux.'],
    menuisier: ['mixte', 1700, 3000, 'Il fabrique des meubles sur mesure dans son atelier et rénove du mobilier ancien.'],
    associatif: ['salarie', 1800, 2600, 'Elle monte des projets dans une association, de la demande de subvention jusqu\'à l\'événement final.'],
    conferencier: ['a_cote', 0, 1500, 'Il intervient quelques fois par mois en entreprise pour partager son parcours et ses idées.'],
    'maitre-ceremonie': ['a_cote', 200, 1500, 'Elle anime des mariages et des remises de prix, en plus de son emploi principal.'],
    'createur-contenu': ['a_cote', 0, 2000, 'Il publie des vidéos sur sa passion et commence à en tirer des revenus.'],
    podcasteur: ['a_cote', 0, 800, 'Elle interviewe chaque semaine des personnes inspirantes dans son podcast.'],
    'mentor-benevole': ['a_cote', null, null, 'Il accompagne bénévolement des jeunes dans leur orientation, une heure par semaine.'],
    meetups: ['a_cote', 0, 500, 'Elle organise chaque mois des rencontres entre indépendants de sa ville.'],
    'troupe-impro': ['a_cote', 0, 400, 'Il joue dans une troupe amateur et prend un plaisir fou à chaque spectacle.'],
    'jeux-escape': ['a_cote', 0, 1500, 'Elle invente des énigmes et des escape games pour des anniversaires et des entreprises.'],
    'cours-collectifs': ['a_cote', 300, 1500, 'Il donne deux cours de danse par semaine dans une association, en plus de son travail.'],
    chorale: ['a_cote', 0, 300, 'Elle chante dans une chorale et en a pris la direction depuis deux ans.'],
    'jardin-partage': ['a_cote', null, null, 'Il coordonne un jardin partagé et y organise des ateliers le samedi.'],
    'repair-cafe': ['a_cote', null, null, 'Elle répare des objets avec les habitants une fois par mois au repair café.'],
    'scene-ouverte': ['a_cote', 0, 200, 'Il slame ses textes dans des scènes ouvertes et anime parfois la soirée.'],
    'magie-animation': ['a_cote', 300, 2000, 'Elle fait de la magie de proximité dans les mariages et les soirées d\'entreprise.'],
    'offre-team-building': ['independant', 1500, 5000, 'Il vend des ateliers de cohésion clés en main à des entreprises de sa région.'],
    'offre-accompagnement': ['independant', 1200, 5000, 'Elle propose un programme de trois mois pour aider à changer de métier.'],
    'offre-formation-ligne': ['independant', 300, 5000, 'Il a créé une formation vidéo sur son expertise et la vend en ligne.'],
    'offre-retraite': ['independant', 800, 4000, 'Elle organise des retraites de yoga et d\'écriture de quatre jours à la campagne.'],
    'offre-communaute': ['independant', 200, 4000, 'Il anime une communauté payante d\'entrepreneurs, avec un direct chaque semaine.'],
    'offre-newsletter': ['independant', 100, 3000, 'Elle écrit une newsletter d\'expertise, gratuite pour tous et payante pour les analyses détaillées.'],
    'offre-ateliers-enfants': ['independant', 800, 2500, 'Il propose des ateliers de sciences ludiques pour enfants le mercredi et pendant les vacances.'],
    'offre-conference-entreprise': ['independant', 1500, 6000, 'Elle vend aux entreprises des conférences et des ateliers sur la confiance en soi.'],
    'offre-assistance': ['independant', 1400, 3200, 'Il gère à distance l\'administratif de plusieurs indépendants débordés.'],
    'offre-stages-nature': ['independant', 700, 2500, 'Elle organise des stages de survie douce et des balades botaniques le week-end.'],
    'offre-boutique': ['independant', 200, 2500, 'Il vend ses illustrations et ses objets en ligne et sur les marchés de créateurs.'],
    'offre-audit-flash': ['independant', 1500, 5000, 'Elle réalise en deux jours un diagnostic des forces et des blocages de petites entreprises.'],
    'offre-prise-parole': ['independant', 1200, 4500, 'Il entraîne des dirigeants à prendre la parole en public avec aisance.'],
    'offre-cuisine': ['independant', 800, 2800, 'Elle anime des ateliers de cuisine du monde chez des particuliers et en entreprise.']
  };

  // Appel découverte (même agenda que le site et le quiz) ; utm_content est ajouté selon l'endroit du clic.
  const APPEL_DECOUVERTE = 'https://calendly.com/pierre-j-sarazin?utm_source=site&utm_medium=carte-du-talent&utm_campaign=orientation-pro';

  CT.orientationDonnees = {
    DUREES, DUREE_DOMAINE, DUREE, ACTIONS_DOMAINE, ACTIONS, PLAN_SEMAINES, BILAN,
    STATUTS_PISTE, NOTES_REVENU, SOURCE_REVENU, PISTES_INFOS, APPEL_DECOUVERTE
  };
})(globalThis.CarteTalent = globalThis.CarteTalent || {});
