/* Quiz Amour v1.3 (mode ?theme=amour) · Magic Humans · données et textes, FR uniquement.
   Fichier de données pur : aucune logique d'affichage. Lu par quiz/amour.js et par les tests. */
(function (root) {
const AMOUR_DATA = {
  "version": 3,
  "config": {
    "calendly": "https://calendly.com/pierre-j-sarazin?utm_source=sommet-love-connexion&utm_medium=quiz-amour&utm_campaign=amoureux-mais-malheureux",
    "site": "https://www.magichumans.com/",
    "quizUrl": "https://www.magichumans.com/quiz-amour/",
    "boussoleUrl": "/boussole-decision/importer-quiz/?theme=amour",
    "matchingEmail": "sommetamourconnexion@gmail.com"
  },
  "ui": {
    "pageTitle": "Quiz Amour : choisir un partenaire qui te correspond vraiment",
    "brand": "Magic Humans · Quiz Amour",
    "footer": "Magic Humans · Ce quiz propose des pistes de réflexion, pas un diagnostic. Tes réponses restent sur ton appareil : rien n'est enregistré ni envoyé.",
    "intro": {
      "eyebrow": "Sommet Love & Connexion · Gratuit · 10 questions · environ 6 minutes",
      "h1": "Amoureux, mais <em>malheureux</em> ?",
      "lead": "L'émotion et la chimie ne suffisent pas à faire un couple heureux. En 6 minutes, vois clair sur ce qui te nourrit, ce qui te vide, et le partenaire qui te correspond vraiment.",
      "bullets": [
        "Ce qui te nourrit en couple, et ce qui te vide",
        "Ton ressourcement, pour ne plus t'épuiser dans une relation",
        "Tes langages de l'amour, tes valeurs et ta piste ennéagramme",
        "Ta façon de réagir sous stress, ce qui te freine, et ta prochaine étape"
      ],
      "howto": "Réponds avec ton premier élan. Il n'y a ni bonne ni mauvaise réponse.",
      "nameLabel": "Ton prénom",
      "nameHelp": "Il sert seulement à personnaliser tes résultats.",
      "start": "Commencer →"
    },
    "quiz": {
      "progress": "Question {i} sur {n}",
      "rankSuffix": " · Classer",
      "counter": "{label} : {x}/{min} minimum",
      "counterBare": "{x}/{min} minimum",
      "counterOk": "✓",
      "rankHelp": "Fais glisser les cartes, ou utilise les flèches ↑ ↓.",
      "rankTapHelp": "Touche les cartes dans l'ordre : la 1re touchée devient ton n° 1. Tu peux aussi les faire glisser.",
      "rankCounter": "Classés : {x}/{min} minimum",
      "rankEmpty": "Touche une carte ci-dessous pour la placer.",
      "rankZone": "Ton classement",
      "up": "Monter",
      "down": "Descendre",
      "remove": "Retirer du classement",
      "live": "{label}, position {pos} sur {total}.",
      "grabbed": "{label} saisi. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.",
      "placed": "« {label} » placé en position {pos} sur {total}.",
      "unchecked": "« {label} » a été décochée.",
      "addOther": "+ Ajouter une autre valeur",
      "next": "Suivant →",
      "prev": "← Précédent",
      "finish": "Voir mes résultats →",
      "more": "Encore {k} choix pour continuer.",
      "moreDown": "Coche encore {k} pour « {label} », plus bas ↓",
      "idea": "Idée : {antidote}",
      "timeAsk": "À quelle heure demain ?",
      "engagementCounter": "Engagement + moment : {x}/{min} minimum",
      "engagementLabel": "Mon engagement",
      "shareBlock": "Partage-le à quelqu'un, et choisis un moment.",
      "whoLabel": "À qui ?",
      "whenLabel": "Quand ?",
      "chars": "{n}/{max}"
    },
    "results": {
      "headerNamed": "{prenom}, voici ton profil amoureux",
      "headerAnon": "Voici ton profil amoureux",
      "sentencesH": "Ton profil en 3 phrases",
      "glanceH": "Tes classements en un coup d'œil",
      "detailsSummary": "Voir mon profil détaillé",
      "copyShortBtn": "Copier mes 3 phrases",
      "boussoleNote": "Ta Boussole sera préréglée avec tes résultats. Ta réponse sur la sécurité n'est jamais transmise.",
      "nourritLab": "Ce qui te nourrit",
      "videLab": "Ce qui te vide",
      "langLab": "Tes langages de l'amour",
      "valuesLab": "Tes valeurs",
      "instinctLab": "Ton sous-type",
      "rechargeLab": "Ta recharge",
      "stressLab": "Sous stress",
      "brakeLab": "Ton frein n° 1",
      "demainLab": "Demain",
      "stepLab": "Ton engagement",
      "noMoreMark": "ce que tu ne veux plus vivre",
      "nnMark": "non-négociable",
      "shareWith": "à partager avec {who}",
      "icsBtn": "Ajouter le rappel à mon agenda",
      "discussPrefix": "À discuter :",
      "relive": "Un partenaire qui te fait revivre {short}.",
      "ownOpposite": "Un partenaire qui ne partage pas « {texte} ».",
      "needsH": "Ce qui te nourrit, ce qui te vide",
      "ressH": "Ton ressourcement",
      "langH": "Tes langages de l'amour",
      "enneaH": "Ta piste ennéagramme",
      "instinctH": "Ton sous-type",
      "stressH": "Toi sous stress",
      "brakesH": "Tes freins",
      "partnerH": "Le partenaire qui te correspond",
      "partnerIntro": "Le partenaire qui te correspond, d'après tes réponses.",
      "completeLab": "Qui te complète",
      "frictionLab": "Qui risque de frotter (à négocier)",
      "criticalLab": "Incompatibilité critique (à ne pas négocier)",
      "gridH": "Comment lire les niveaux de risque",
      "keyH": "Ce qu'il faut retenir",
      "piegeLab": "Ton piège :",
      "pairPrefix": "Avec un partenaire {name} :",
      "pairsNote": "Ces tendances ne décident de rien : elles éclairent les frictions possibles, pour en parler tôt.",
      "tipsLab": "Concrètement",
      "rechargeRule": "La règle d'or : après un moment ensemble, tu dois avoir plus d'énergie qu'avant. Si une relation te vide durablement, ce n'est pas un détail, c'est une information.",
      "rechargeSame": "Ton profil de recharge est net : {title}.",
      "rechargeMixed": "Tu te recharges de deux façons : {soirTitle} en semaine, {weekendTitle} le week-end.",
      "boussoleLab": "La Boussole Relation",
      "boussoleP": "Tu es en couple, ou tu hésites sur une relation ? La Boussole Relation t'aide à l'évaluer calmement, critère par critère. Elle sera préréglée avec tes résultats : tes besoins, ce qui te vide, tes défauts acceptables et tes non-négociables. Une alerte s'affiche si un point essentiel est touché, quel que soit le score.",
      "boussoleBtn": "Évaluer ma relation avec la Boussole →",
      "ctaEyebrow": "Appel Découverte · offert",
      "ctaH": "Et si on en parlait ensemble ?",
      "ctaP": "Tu viens d'écrire ta prochaine étape. Pendant un Appel Découverte offert, on regarde ensemble ta situation réelle : ce qui te nourrit, ce qui se répète, et comment tenir ton engagement. Tu repars avec des idées claires, que tu décides ou non d'aller plus loin avec moi.",
      "ctaSign": "Pierre Sarazin, coach Profileur de talent, Magic Humans",
      "ctaBtn": "Réserver mon Appel Découverte offert →",
      "siteBtn": "Découvrir Magic Humans",
      "exportH": "Garder mes résultats",
      "exportP": "Copie ce texte pour le garder dans tes notes, ou pour le relire avant ton Appel Découverte.",
      "copyBtn": "Copier mes résultats",
      "copied": "Copié !",
      "copyFallback": "Sélectionne le texte puis copie-le.",
      "matchingH": "Bientôt : des rencontres entre participants",
      "matchingP": "Un projet de mise en relation entre participants du Sommet est en préparation. Le principe est simple : aucune coordonnée n'est jamais échangée sans un double consentement, le tien et celui de l'autre personne. Ce quiz n'envoie rien. Si le projet t'intéresse, écris simplement à {email} avec ton prénom.",
      "restart": "Refaire le quiz",
      "ethicsH": "Une note importante",
      "ethicsP": "Ce quiz n'est pas un outil de diagnostic. Si tu vis de la peur, des humiliations, du contrôle ou de la violence dans ta relation, ce n'est pas un problème de compatibilité : parles-en à un professionnel. En France : 3919 (violences conjugales, gratuit et anonyme, 24h/24), 17 ou 112 en cas de danger immédiat, 114 par SMS. Hors de France, contacte les services d'urgence de ton pays.",
      "pastH": "Une relation passée",
      "nowH": "Et maintenant ?",
      "nowStep": "Ta prochaine étape",
      "nowStepEmpty": "Choisis un petit pas pour ta relation cette semaine.",
      "nowTest": "Teste ta relation",
      "nowTestP": "Vérifie si ton ou ta partenaire (actuel·le ou futur·e) te correspond vraiment, critère par critère.",
      "nowBoussole": "Ouvrir ma Boussole Relation",
      "nowPierre": "Fais le point avec Pierre",
      "nowCall": "Réserver mon Appel Découverte offert",
      "nowPdf": "Télécharger mon profil (PDF)",
      "nowGeneric": "En 1 h, on regarde comment ça joue dans tes choix amoureux.",
      "nowStress": {
        "fight": "Tu as tendance à contre-attaquer sous stress fort : en 1 h, on regarde comment ça joue dans tes choix amoureux.",
        "flight": "Tu as tendance à fuir sous stress fort : en 1 h, on regarde comment ça joue dans tes choix amoureux.",
        "freeze": "Tu as tendance à te figer sous stress fort : en 1 h, on regarde comment ça joue dans tes choix amoureux.",
        "fawn": "Tu as tendance à céder pour apaiser sous stress fort : en 1 h, on regarde comment ça joue dans tes choix amoureux."
      }
    }
  },
  "screens": [
    {
      "id": "nourrit",
      "type": "pick",
      "n": 1,
      "eyebrow": "Ce qui te nourrit, ce qui te vide",
      "title": "Coche au moins 3 choses qui te nourrissent, et au moins 2 qui te vident.",
      "splitGroups": true,
      "groups": [
        {
          "id": "nourrit",
          "title": "Ce qui me nourrit dans une relation",
          "stepTitle": "Coche au moins 3 choses qui te nourrissent.",
          "counter": "Ce qui me nourrit",
          "min": 3,
          "items": [
            {
              "id": "ecoute",
              "label": "Être écouté·e, vraiment",
              "hint": "Il ou elle pose son téléphone quand je parle.",
              "short": "être écouté·e",
              "need": "profondeur",
              "lang": "moments"
            },
            {
              "id": "rire",
              "label": "Rire ensemble",
              "hint": "Des fous rires, des blagues qu'on est seuls à comprendre.",
              "short": "rire ensemble",
              "need": "legerete"
            },
            {
              "id": "fiable",
              "label": "Pouvoir compter sur l'autre",
              "hint": "Ce qui est promis est fait, sans que j'aie à relancer.",
              "short": "pouvoir compter sur l'autre",
              "need": "securite"
            },
            {
              "id": "espace",
              "label": "Garder mon espace",
              "hint": "Mes soirées, mes amis, mes projets à moi.",
              "short": "garder ton espace",
              "need": "liberte"
            },
            {
              "id": "tendresse",
              "label": "La tendresse au quotidien",
              "hint": "Un câlin en passant, une main dans le dos.",
              "short": "la tendresse au quotidien",
              "need": "harmonie",
              "lang": "toucher"
            },
            {
              "id": "admiration",
              "label": "Me sentir admiré·e",
              "hint": "Il ou elle est fier·e de moi, et le dit.",
              "short": "te sentir admiré·e",
              "need": "reconnaissance",
              "lang": "paroles"
            },
            {
              "id": "projets",
              "label": "Construire des projets à deux",
              "hint": "Un voyage, une maison, un rêve commun.",
              "short": "construire des projets à deux",
              "need": "securite"
            },
            {
              "id": "aventure",
              "label": "L'aventure et la nouveauté",
              "hint": "Partir sur un coup de tête, tester un nouvel endroit.",
              "short": "l'aventure et la nouveauté",
              "need": "legerete"
            },
            {
              "id": "calme",
              "label": "Un quotidien calme et doux",
              "hint": "Des soirées tranquilles, sans tension.",
              "short": "un quotidien calme et doux",
              "need": "harmonie"
            },
            {
              "id": "profondeur",
              "label": "Des conversations profondes",
              "hint": "Parler de nos émotions, de nos peurs, jusque tard.",
              "short": "les conversations profondes",
              "need": "profondeur",
              "lang": "moments"
            },
            {
              "id": "rituels",
              "label": "Nos petits rituels",
              "hint": "Le café du matin, le film du dimanche soir.",
              "short": "vos petits rituels",
              "need": "securite",
              "lang": "moments"
            },
            {
              "id": "soutien",
              "label": "Être soutenu·e dans mes projets",
              "hint": "Il ou elle m'encourage quand je doute.",
              "short": "être soutenu·e",
              "need": "reconnaissance",
              "lang": "paroles"
            },
            {
              "id": "desir",
              "label": "Le désir et la complicité physique",
              "hint": "Se sentir désiré·e, longtemps après le début.",
              "short": "le désir et la complicité",
              "need": "profondeur",
              "lang": "toucher"
            },
            {
              "id": "partage",
              "label": "Partager les tâches sans compter",
              "hint": "Chacun fait sa part, sans avoir à négocier.",
              "short": "le partage des tâches",
              "need": "harmonie",
              "lang": "services"
            }
          ],
          "other": {
            "id": "autre",
            "label": "Autre",
            "placeholder": "Écris ce qui te nourrit",
            "maxLength": 60,
            "max": 1
          }
        },
        {
          "id": "vide",
          "title": "Ce qui me vide dans une relation",
          "stepTitle": "Coche au moins 2 choses qui te vident.",
          "counter": "Ce qui me vide",
          "min": 2,
          "items": [
            {
              "id": "justifier",
              "label": "Devoir me justifier de tout",
              "hint": "Où tu étais ? Avec qui ? Pourquoi si tard ?",
              "short": "devoir te justifier de tout",
              "need": "liberte",
              "energy": true
            },
            {
              "id": "critiques",
              "label": "Les critiques répétées",
              "hint": "Rien n'est jamais assez bien.",
              "short": "les critiques répétées",
              "need": "reconnaissance",
              "conflict": true
            },
            {
              "id": "silences",
              "label": "Les silences et les bouderies",
              "hint": "Il ou elle se ferme pendant des jours.",
              "short": "les silences qui durent",
              "need": "profondeur",
              "conflict": true
            },
            {
              "id": "cris",
              "label": "Les cris et les piques",
              "hint": "Le ton monte vite, l'ironie blesse.",
              "short": "les cris et les piques",
              "need": "harmonie",
              "energy": true,
              "conflict": true
            },
            {
              "id": "flou",
              "label": "Ne jamais savoir où on va",
              "hint": "Pas de projet, pas d'engagement clair.",
              "short": "ne jamais savoir où vous allez",
              "need": "securite"
            },
            {
              "id": "charge",
              "label": "Porter seul·e la charge du quotidien",
              "hint": "Courses, rendez-vous, ménage : tout repose sur moi.",
              "short": "porter seul·e la charge du quotidien",
              "need": "reconnaissance",
              "energy": true
            },
            {
              "id": "ecrans",
              "label": "Un partenaire absent, toujours sur son écran",
              "hint": "Là physiquement, ailleurs dans sa tête.",
              "short": "un partenaire absent",
              "need": "profondeur"
            },
            {
              "id": "jalousie",
              "label": "La jalousie",
              "hint": "Chaque sortie entre amis devient un sujet.",
              "short": "la jalousie",
              "need": "liberte",
              "conflict": true
            },
            {
              "id": "routine",
              "label": "La routine sans surprise",
              "hint": "Les mêmes soirées, encore et encore.",
              "short": "la routine sans surprise",
              "need": "legerete"
            },
            {
              "id": "promesses",
              "label": "Les promesses non tenues",
              "hint": "« On en reparle demain », et demain n'arrive jamais.",
              "short": "les promesses non tenues",
              "need": "securite"
            },
            {
              "id": "fusion",
              "label": "L'étouffement",
              "hint": "Tout faire à deux, tout le temps.",
              "short": "l'étouffement",
              "need": "liberte",
              "energy": true
            },
            {
              "id": "indifference",
              "label": "L'indifférence",
              "hint": "Mes efforts passent inaperçus.",
              "short": "l'indifférence",
              "need": "reconnaissance"
            }
          ],
          "other": {
            "id": "autre",
            "label": "Autre",
            "placeholder": "Écris ce qui te vide",
            "maxLength": 60,
            "max": 1
          }
        }
      ],
      "rank": {
        "mode": "step",
        "groups": [
          "nourrit",
          "vide"
        ],
        "title": "Classe tes choix : le plus important en haut.",
        "cta": "Classer mes choix →",
        "divider": {
          "group": "vide",
          "after": 1,
          "text": "En haut : ce que tu ne veux plus vivre."
        }
      }
    },
    {
      "id": "ressource",
      "type": "pick",
      "n": 2,
      "eyebrow": "Ton ressourcement",
      "title": "Qu'est-ce qui te recharge vraiment ? Coche au moins 2 choses pour le soir et au moins 2 pour le week-end.",
      "help": "Une relation qui te correspond te laisse plus d'énergie qu'avant, pas moins.",
      "groups": [
        {
          "id": "soir",
          "title": "En fin de journée, pour recharger mes batteries",
          "counter": "Le soir",
          "min": 2,
          "items": [
            {
              "id": "seul",
              "label": "Un moment seul·e, au calme",
              "hint": "Personne ne me demande rien pendant une demi-heure.",
              "recharge": "solitaire",
              "short": "un moment seul·e, au calme"
            },
            {
              "id": "raconter",
              "label": "Me raconter ma journée à deux",
              "hint": "Sur le canapé, sans écran.",
              "recharge": "relationnel",
              "short": "te raconter ta journée à deux"
            },
            {
              "id": "bouger",
              "label": "Bouger",
              "hint": "Une course, du yoga, une marche.",
              "recharge": "sensoriel",
              "short": "bouger"
            },
            {
              "id": "mains",
              "label": "Faire quelque chose de mes mains",
              "hint": "Cuisiner, bricoler, jardiner.",
              "recharge": "sensoriel",
              "short": "faire quelque chose de tes mains"
            },
            {
              "id": "evader",
              "label": "M'évader",
              "hint": "Un livre, une série, un podcast.",
              "recharge": "evasion",
              "short": "t'évader"
            },
            {
              "id": "monde",
              "label": "Voir du monde",
              "hint": "Un verre avec des amis, un appel qui fait du bien.",
              "recharge": "elan",
              "short": "voir du monde"
            },
            {
              "id": "tendresse",
              "label": "Un moment de tendresse",
              "hint": "Un long câlin, un massage.",
              "recharge": "relationnel",
              "short": "un moment de tendresse"
            },
            {
              "id": "douceur",
              "label": "La douceur, rien à faire",
              "hint": "Un bain, une bougie, ma playlist.",
              "recharge": "solitaire",
              "short": "la douceur, rien à faire"
            }
          ],
          "other": {
            "id": "autre",
            "label": "Autre",
            "placeholder": "Écris ce qui te recharge",
            "maxLength": 60,
            "max": 1
          }
        },
        {
          "id": "weekend",
          "title": "Le week-end, pour être plein·e d'énergie le lundi",
          "counter": "Le week-end",
          "min": 2,
          "items": [
            {
              "id": "rien",
              "label": "Rien de prévu",
              "hint": "Pas de réveil, pas de programme.",
              "recharge": "solitaire",
              "short": "rien de prévu"
            },
            {
              "id": "moi",
              "label": "Un temps rien que pour moi",
              "hint": "Quelques heures seul·e, sans culpabiliser.",
              "recharge": "solitaire",
              "short": "un temps rien que pour toi"
            },
            {
              "id": "nature",
              "label": "La nature",
              "hint": "Forêt, mer, montagne, un grand bol d'air.",
              "recharge": "sensoriel",
              "short": "la nature"
            },
            {
              "id": "sport",
              "label": "Du sport",
              "hint": "Rando, vélo, un match.",
              "recharge": "sensoriel",
              "short": "du sport"
            },
            {
              "id": "adeux",
              "label": "Un vrai temps à deux",
              "hint": "Une journée rien que nous, téléphones coupés.",
              "recharge": "relationnel",
              "short": "un vrai temps à deux"
            },
            {
              "id": "proches",
              "label": "Mes proches",
              "hint": "Un déjeuner de famille, les amis de toujours.",
              "recharge": "relationnel",
              "short": "tes proches"
            },
            {
              "id": "sortir",
              "label": "Sortir, faire la fête",
              "hint": "Un concert, un dîner, danser.",
              "recharge": "elan",
              "short": "sortir, faire la fête"
            },
            {
              "id": "decouvrir",
              "label": "Découvrir, apprendre",
              "hint": "Une expo, une ville, un atelier.",
              "recharge": "evasion",
              "short": "découvrir, apprendre"
            },
            {
              "id": "projet",
              "label": "Avancer sur un projet perso",
              "hint": "Écrire, créer, construire.",
              "recharge": "evasion",
              "short": "avancer sur un projet perso"
            }
          ],
          "other": {
            "id": "autre",
            "label": "Autre",
            "placeholder": "Écris ce qui te recharge",
            "maxLength": 60,
            "max": 1
          }
        }
      ]
    },
    {
      "id": "langages",
      "type": "rank",
      "n": 3,
      "eyebrow": "Tes langages de l'amour",
      "title": "Pour te sentir aimé·e, qu'est-ce qui compte le plus ? Classe au moins tes 2 premiers.",
      "help": "Touche les cartes dans l'ordre : la 1re touchée devient ton n° 1. Tu peux aussi les faire glisser.",
      "footnote": "D'après les 5 langages de l'amour de Gary Chapman.",
      "minRanked": 2,
      "autoCompleteLast": true,
      "items": [
        {
          "id": "paroles",
          "label": "Les paroles valorisantes",
          "hint": "« Je suis fier·e de toi. »"
        },
        {
          "id": "moments",
          "label": "Les moments de qualité",
          "hint": "Une soirée rien qu'à deux, téléphones rangés."
        },
        {
          "id": "cadeaux",
          "label": "Les attentions et les cadeaux",
          "hint": "Un petit mot, ta douceur préférée."
        },
        {
          "id": "services",
          "label": "Les services rendus",
          "hint": "Le dîner est prêt, la corvée est faite."
        },
        {
          "id": "toucher",
          "label": "Le toucher",
          "hint": "Un câlin, une main tenue."
        }
      ]
    },
    {
      "id": "ennea",
      "type": "pick",
      "n": 4,
      "eyebrow": "Ta piste ennéagramme",
      "title": "Laquelle de ces phrases te ressemble le plus ? Coche au moins 1 phrase, puis classe-les si tu en coches plusieurs.",
      "help": "C'est un point de départ, pas un verdict.",
      "groups": [
        {
          "id": "types",
          "counter": "",
          "min": 1,
          "items": [
            {
              "id": "t1",
              "label": "« Je vois tout de suite ce qui pourrait être mieux. »",
              "hint": "On me dit exigeant·e. Je le suis d'abord avec moi."
            },
            {
              "id": "t2",
              "label": "« Je sens ce dont les autres ont besoin, avant eux. »",
              "hint": "Je donne beaucoup, j'oublie parfois de demander."
            },
            {
              "id": "t3",
              "label": "« J'avance, je réussis, et j'aime que ça se voie. »",
              "hint": "Objectifs, efficacité : je déteste perdre du temps."
            },
            {
              "id": "t4",
              "label": "« Je ressens tout plus fort que les autres. »",
              "hint": "J'ai besoin de vrai, le superficiel m'ennuie."
            },
            {
              "id": "t5",
              "label": "« J'ai besoin de comprendre, et de mon espace pour ça. »",
              "hint": "Je réfléchis avant de parler, je me recharge seul·e."
            },
            {
              "id": "t6",
              "label": "« Je pense à ce qui pourrait mal tourner, pour protéger les miens. »",
              "hint": "La confiance se gagne, et je suis fidèle quand elle est là."
            },
            {
              "id": "t7",
              "label": "« La vie est trop courte pour s'ennuyer. »",
              "hint": "Projets, voyages, idées : j'ai horreur d'être enfermé·e."
            },
            {
              "id": "t8",
              "label": "« Je fonce, je dis les choses en face, et personne ne me contrôle. »",
              "hint": "Direct·e et protecteur·rice, j'ai du mal à montrer ma fragilité."
            },
            {
              "id": "t9",
              "label": "« Tant que tout le monde va bien, je vais bien. »",
              "hint": "Je m'adapte facilement, parfois au point de m'oublier."
            }
          ]
        }
      ],
      "rank": {
        "mode": "inline",
        "groups": [
          "types"
        ],
        "title": "Classe-les : la plus toi en haut."
      }
    },
    {
      "id": "valeurs",
      "type": "pick",
      "n": 5,
      "eyebrow": "Tes valeurs",
      "title": "Coche au moins 3 valeurs qui comptent vraiment pour toi dans un couple.",
      "exclusive": [
        [
          "enfants",
          "sans_enfants"
        ]
      ],
      "groups": [
        {
          "id": "valeurs",
          "counter": "",
          "min": 3,
          "items": [
            {
              "id": "honnetete",
              "label": "Honnêteté",
              "hint": "Se dire la vérité, même quand elle dérange."
            },
            {
              "id": "fidelite",
              "label": "Fidélité",
              "hint": "Exclusivité et loyauté."
            },
            {
              "id": "respect",
              "label": "Respect",
              "hint": "Pas de mépris, même en colère."
            },
            {
              "id": "engagement",
              "label": "Engagement",
              "hint": "Choisir l'autre chaque jour, pour longtemps."
            },
            {
              "id": "famille",
              "label": "Famille",
              "hint": "Les proches tiennent une grande place."
            },
            {
              "id": "enfants",
              "label": "Avoir des enfants",
              "hint": "Fonder une famille, ou l'agrandir."
            },
            {
              "id": "sans_enfants",
              "label": "Une vie sans enfants",
              "hint": "Le couple d'abord, sans projet d'enfant."
            },
            {
              "id": "liberte",
              "label": "Liberté",
              "hint": "Chacun garde sa vie et ses choix."
            },
            {
              "id": "securite_fin",
              "label": "Sécurité financière",
              "hint": "Épargner, prévoir, ne pas manquer."
            },
            {
              "id": "independance_fin",
              "label": "Indépendance financière",
              "hint": "Chacun ses comptes, chacun son autonomie."
            },
            {
              "id": "generosite",
              "label": "Générosité",
              "hint": "Donner, partager, recevoir."
            },
            {
              "id": "spiritualite",
              "label": "Spiritualité ou foi",
              "hint": "Une pratique, une quête de sens."
            },
            {
              "id": "ambition",
              "label": "Ambition",
              "hint": "Réussir, se dépasser, grandir."
            },
            {
              "id": "simplicite",
              "label": "Simplicité",
              "hint": "Une vie sobre, sans course au toujours plus."
            },
            {
              "id": "aventure",
              "label": "Aventure",
              "hint": "Voyager, bouger, changer d'air."
            },
            {
              "id": "ailleurs",
              "label": "Pouvoir partir vivre ailleurs",
              "hint": "Une autre ville, un autre pays."
            },
            {
              "id": "racines",
              "label": "Rester près de mes racines",
              "hint": "Ma ville, ma région, mes proches."
            },
            {
              "id": "nature",
              "label": "Respect de la nature",
              "hint": "Consommer moins, vivre plus vert."
            },
            {
              "id": "humour",
              "label": "Humour",
              "hint": "Ne pas se prendre au sérieux."
            },
            {
              "id": "culture",
              "label": "Culture et curiosité",
              "hint": "Livres, expos, débats, apprendre encore."
            },
            {
              "id": "sante",
              "label": "Santé et sport",
              "hint": "Prendre soin de son corps."
            },
            {
              "id": "solidarite",
              "label": "Solidarité",
              "hint": "S'engager pour les autres."
            },
            {
              "id": "transparence",
              "label": "Transparence",
              "hint": "Pas de secrets sur ce qui engage le couple."
            },
            {
              "id": "traditions",
              "label": "Traditions",
              "hint": "Fêtes, rituels, valeurs transmises."
            },
            {
              "id": "creativite",
              "label": "Créativité",
              "hint": "Créer, inventer, s'exprimer."
            }
          ],
          "other": {
            "id": "autre",
            "label": "Ma valeur à moi",
            "placeholder": "Ajoute ta valeur",
            "maxLength": 40,
            "max": 3
          }
        }
      ],
      "rank": {
        "mode": "step",
        "groups": [
          "valeurs"
        ],
        "title": "Classe toutes tes valeurs : la plus importante en haut.",
        "cta": "Classer mes valeurs →",
        "divider": {
          "group": "valeurs",
          "after": 3,
          "text": "Au-dessus de cette ligne : tes non-négociables."
        }
      }
    },
    {
      "id": "instinct",
      "type": "rank",
      "n": 6,
      "eyebrow": "Ton sous-type en couple",
      "title": "Classe ces 3 façons de vivre le couple : la plus toi en haut.",
      "help": "Pour t'aider, imagine un samedi libre en couple.",
      "minRanked": 2,
      "autoCompleteLast": true,
      "items": [
        {
          "id": "sp",
          "label": "Conservation · je sécurise",
          "hint": "Un samedi libre en couple, ton idéal c'est un cocon à la maison, tranquille et confortable."
        },
        {
          "id": "so",
          "label": "Social · je connecte",
          "hint": "Un samedi libre en couple, ton idéal c'est un dîner avec des amis, voir du monde ensemble."
        },
        {
          "id": "sx",
          "label": "Tête-à-tête · j'intensifie",
          "hint": "Un samedi libre en couple, ton idéal c'est un tête-à-tête intense, une longue discussion rien que vous deux."
        }
      ]
    },
    {
      "id": "stress",
      "type": "pick",
      "n": 7,
      "eyebrow": "Toi, sous stress",
      "title": "Comment réagis-tu quand ça chauffe ? Coche au moins 1 réaction pour chaque niveau de stress.",
      "groups": [
        {
          "id": "modere",
          "title": "Stress modéré",
          "help": "Un malentendu, un retard, une remarque qui pique.",
          "counter": "Stress modéré",
          "min": 1,
          "items": [
            {
              "id": "D",
              "label": "Je prends les choses en main",
              "hint": "Je tranche vite, je veux que ça avance."
            },
            {
              "id": "I",
              "label": "Je dédramatise",
              "hint": "Je parle, je plaisante, je cherche à alléger."
            },
            {
              "id": "S",
              "label": "Je fais le dos rond",
              "hint": "J'attends que ça passe, je garde la paix."
            },
            {
              "id": "C",
              "label": "J'analyse",
              "hint": "Je veux des faits, je cherche ce qui s'est vraiment passé."
            }
          ]
        },
        {
          "id": "fort",
          "title": "Stress fort",
          "help": "Une grosse dispute, la peur de perdre l'autre.",
          "counter": "Stress fort",
          "min": 1,
          "items": [
            {
              "id": "fight",
              "label": "Je contre-attaque",
              "hint": "Le ton monte, je veux avoir le dernier mot."
            },
            {
              "id": "flight",
              "label": "Je fuis",
              "hint": "Je claque la porte, je sors, je m'occupe ailleurs."
            },
            {
              "id": "freeze",
              "label": "Je me fige",
              "hint": "Je n'arrive plus à parler ni à penser."
            },
            {
              "id": "fawn",
              "label": "Je cède pour apaiser",
              "hint": "Je dis oui, je m'excuse, même quand je ne suis pas d'accord."
            }
          ]
        }
      ]
    },
    {
      "id": "freins",
      "type": "pick",
      "n": 8,
      "eyebrow": "Ce qui te freine",
      "title": "Qu'est-ce qui t'empêche d'agir dans ta vie amoureuse ? Coche au moins 1 frein.",
      "groups": [
        {
          "id": "freins",
          "counter": "",
          "min": 1,
          "items": [
            {
              "id": "rejet",
              "label": "La peur d'être rejeté·e",
              "hint": "Et si l'autre disait non ?"
            },
            {
              "id": "blesser",
              "label": "La peur de blesser l'autre",
              "hint": "Je préfère me taire que faire de la peine."
            },
            {
              "id": "moment",
              "label": "Attendre le bon moment",
              "hint": "Après les vacances, après son anniversaire..."
            },
            {
              "id": "espoir",
              "label": "Espérer que l'autre change",
              "hint": "Ça va s'arranger tout seul."
            },
            {
              "id": "habitude",
              "label": "Le confort de l'habitude",
              "hint": "Ce n'est pas parfait, mais c'est connu."
            },
            {
              "id": "seul",
              "label": "La peur d'être seul·e",
              "hint": "Plutôt mal accompagné·e que seul·e ?"
            },
            {
              "id": "flou",
              "label": "Ne pas savoir ce que je veux",
              "hint": "Un jour oui, un jour non."
            },
            {
              "id": "regard",
              "label": "Le regard des autres",
              "hint": "La famille, les amis, ce qu'ils vont dire."
            },
            {
              "id": "contraintes",
              "label": "Les contraintes matérielles",
              "hint": "Le logement, l'argent, les enfants, l'organisation."
            },
            {
              "id": "energie",
              "label": "Le manque de temps ou d'énergie",
              "hint": "Le soir, je n'ai plus la force."
            },
            {
              "id": "parfait",
              "label": "Attendre la personne parfaite",
              "hint": "Personne n'est jamais tout à fait assez bien."
            },
            {
              "id": "passe",
              "label": "Les blessures du passé",
              "hint": "J'ai déjà souffert, alors je me protège."
            }
          ],
          "other": {
            "id": "autre",
            "label": "Autre",
            "placeholder": "Écris ce qui te freine",
            "maxLength": 60,
            "max": 1
          }
        }
      ]
    },
    {
      "id": "demain",
      "type": "pick",
      "n": 9,
      "eyebrow": "Passer à l'action demain",
      "title": "Comment veux-tu passer à l'action dès demain ? Coche au moins 1 case.",
      "badge": "En test : dis-nous si ça t'aide.",
      "groups": [
        {
          "id": "actions",
          "counter": "",
          "min": 1,
          "items": [
            {
              "id": "a5",
              "label": "Une action de 5 minutes",
              "hint": "Envoyer le message, poser la question, réserver la soirée."
            },
            {
              "id": "voix",
              "label": "Un engagement dit à voix haute",
              "hint": "Je le dis maintenant, tout haut : « Demain, je... »"
            },
            {
              "id": "rappel",
              "label": "Un rappel à heure fixe",
              "hint": "Je choisis une heure, et je reçois un rappel dans mon agenda."
            }
          ]
        }
      ],
      "time": {
        "when": "rappel",
        "label": "À quelle heure demain ?",
        "options": [
          "08:00",
          "12:30",
          "18:00",
          "21:00"
        ]
      }
    },
    {
      "id": "etape",
      "type": "commit",
      "n": 10,
      "eyebrow": "Ta prochaine étape",
      "title": "Quelle est ta prochaine étape dans ta relation ? Écris ton engagement en une phrase.",
      "help": "Pour t'inspirer, touche un exemple : il se recopie dans ton engagement.",
      "examples": [
        {
          "id": "besoin",
          "label": "Dire clairement ce dont j'ai besoin"
        },
        {
          "id": "soiree",
          "label": "Proposer une soirée rien qu'à deux"
        },
        {
          "id": "question",
          "label": "Poser la question qui compte (enfants, projet, lieu de vie)"
        },
        {
          "id": "limite",
          "label": "Mettre une limite claire"
        },
        {
          "id": "boussole",
          "label": "Faire le point sur ma relation avec la Boussole"
        },
        {
          "id": "jetaime",
          "label": "Oser dire « je t'aime »"
        },
        {
          "id": "recul",
          "label": "Prendre quelques jours de recul"
        },
        {
          "id": "accompagner",
          "label": "Me faire accompagner"
        }
      ],
      "engagement": {
        "placeholder": "Cette semaine, je...",
        "minLength": 5,
        "maxLength": 140
      },
      "share": {
        "title": "Partage-le à quelqu'un, et choisis un moment.",
        "whoPlaceholder": "son prénom",
        "whoMaxLength": 40,
        "moments": [
          "soir",
          "demain",
          "weekend",
          "semaine"
        ]
      },
      "safety": {
        "text": "Une dernière chose : dans une relation, t'est-il arrivé d'avoir peur de l'autre, ou de te sentir rabaissé·e, contrôlé·e ou menacé·e ?",
        "options": [
          {
            "id": "non",
            "label": "Non, jamais"
          },
          {
            "id": "passe",
            "label": "Oui, par le passé"
          },
          {
            "id": "doute",
            "label": "Je ne suis pas sûr·e"
          },
          {
            "id": "present",
            "label": "Oui, aujourd'hui"
          }
        ],
        "note": "Cette réponse n'est ni enregistrée ni transmise."
      }
    }
  ],
  "order": {
    "need": [
      "securite",
      "profondeur",
      "reconnaissance",
      "liberte",
      "harmonie",
      "legerete"
    ],
    "ennea": [
      "t1",
      "t2",
      "t3",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "t9"
    ],
    "lang": [
      "paroles",
      "moments",
      "cadeaux",
      "services",
      "toucher"
    ],
    "instinct": [
      "sp",
      "so",
      "sx"
    ],
    "recharge": [
      "solitaire",
      "relationnel",
      "sensoriel",
      "evasion",
      "elan"
    ]
  },
  "needs": {
    "securite": {
      "name": "Sécurité et fiabilité",
      "title": "Cœur Ancre",
      "desc": "Tu as besoin de savoir où tu en es. Un partenaire qui tient parole, qui est là quand il le dit, avec qui l'avenir se construit sans montagnes russes. Ce n'est pas un manque d'audace : c'est le sol sur lequel tu peux enfin te détendre.",
      "partner": "De la constance, de la parole tenue, des projets clairs. Quelqu'un qui rassure par les actes, pas seulement par les mots.",
      "anti": "Tu ne sais jamais sur quel pied danser. Les promesses non tenues, les changements d'humeur imprévisibles et le flou sur l'avenir t'épuisent lentement. Dans ce contexte, tu deviens vigilant·e, inquiet·e, et tu perds ta légèreté.",
      "lower": "sécurité et fiabilité",
      "danger": "une relation où tu ne sais jamais sur quel pied danser"
    },
    "liberte": {
      "name": "Liberté et espace",
      "title": "Cœur Libre",
      "desc": "Tu as besoin de rester toi-même dans le couple : tes amis, tes projets, tes temps seuls. Ce n'est pas un manque d'amour. Au contraire, c'est en respirant que tu reviens vers l'autre avec envie.",
      "partner": "De la confiance, une vie à lui ou à elle, et la capacité de te laisser partir quelques heures sans le vivre comme un abandon.",
      "anti": "Tu dois te justifier de tout. Les questions sur ton emploi du temps, la jalousie, les reproches quand tu vois tes amis t'éteignent. Dans ce contexte, tu te sens à l'étroit et tu finis par fuir, en pensée ou pour de vrai.",
      "lower": "liberté et espace",
      "danger": "une relation où tu dois te justifier de tout"
    },
    "reconnaissance": {
      "name": "Reconnaissance et admiration",
      "title": "Cœur Lumière",
      "desc": "Tu as besoin de te sentir choisi·e, admiré·e, mis·e en valeur. Ce n'est pas de la vanité : c'est le signe que l'autre te voit vraiment, avec ce que tu apportes.",
      "partner": "Un regard qui te valorise, des mots de fierté, la capacité de dire « merci » et « bravo », y compris devant les autres.",
      "anti": "Tes efforts passent inaperçus et l'on te prend pour acquis·e. Les moqueries, la comparaison, le manque de gratitude te ternissent. Dans ce contexte, tu doutes de toi et tu en fais trop pour être enfin vu·e.",
      "lower": "reconnaissance et admiration",
      "danger": "une relation où tes efforts passent inaperçus"
    },
    "profondeur": {
      "name": "Profondeur et intimité émotionnelle",
      "title": "Cœur Profond",
      "desc": "Tu as besoin de pouvoir tout dire et d'être compris·e jusque dans tes émotions. Les conversations vraies, la vulnérabilité partagée, le sentiment d'être connu·e en profondeur te relient plus que tout.",
      "partner": "De l'écoute, de la curiosité pour ton monde intérieur, et le courage de parler de lui ou d'elle aussi.",
      "anti": "Les conversations restent en surface et les émotions sont tues. Un partenaire qui change de sujet, qui fuit les discussions importantes ou se moque de ta sensibilité t'isole. Dans ce contexte, tu te sens seul·e à deux.",
      "lower": "profondeur et intimité émotionnelle",
      "danger": "une relation qui reste en surface"
    },
    "legerete": {
      "name": "Complicité et légèreté",
      "title": "Cœur Joueur",
      "desc": "Tu as besoin de rire, de jouer, de découvrir. Le couple est pour toi une aventure, une complicité, un terrain de jeu. Sans légèreté, même une belle histoire finit par te sembler grise.",
      "partner": "De l'humour, de la curiosité, l'envie d'essayer de nouvelles choses, et la capacité de ne pas tout prendre au sérieux.",
      "anti": "Tout devient lourd, sérieux, routinier. Les reproches permanents, l'absence de projets, les soirées toujours identiques t'éteignent. Dans ce contexte, tu t'ennuies et tu cherches l'étincelle ailleurs, parfois sans le vouloir.",
      "lower": "complicité et légèreté",
      "danger": "une relation lourde et routinière"
    },
    "harmonie": {
      "name": "Douceur et harmonie",
      "title": "Cœur Paisible",
      "desc": "Tu as besoin d'un quotidien doux et apaisé. Ce n'est pas fuir les désaccords : c'est pouvoir les vivre sans cris, sans piques, sans tension qui dure. La paix est ton terreau.",
      "partner": "Du calme, de la gentillesse dans les mots, et la capacité de se disputer sans blesser, puis de se réconcilier.",
      "anti": "Les piques et les éclats de voix deviennent ordinaires. Les conflits qui s'enveniment, l'ironie, les tensions qui durent des jours t'épuisent. Dans ce contexte, tu te refermes et tu évites tout sujet sensible, ce qui finit par creuser la distance.",
      "lower": "douceur et harmonie",
      "danger": "une relation pleine de piques et de tensions"
    }
  },
  "recharge": {
    "solitaire": {
      "title": "Recharge solitaire",
      "short": "seul·e, au calme",
      "couple": "Tu as besoin de temps seul·e pour revenir vers l'autre avec envie. Ce n'est pas un rejet, c'est ton carburant.",
      "fit": "Un partenaire qui a sa propre vie et ne vit pas tes moments seuls comme un abandon.",
      "risk": "Un partenaire qui a besoin de toi tous les soirs, ou qui remplit l'agenda sans te demander."
    },
    "relationnel": {
      "title": "Recharge relationnelle douce",
      "short": "dans des moments doux à deux",
      "couple": "Tu te recharges dans la présence tranquille de l'autre, sans enjeu ni programme.",
      "fit": "Un partenaire disponible pour des soirées simples, téléphone rangé.",
      "risk": "Un partenaire toujours ailleurs, absorbé par son travail ou ses sorties."
    },
    "sensoriel": {
      "title": "Recharge sensorielle et ancrage",
      "short": "par le corps, la nature et le concret",
      "couple": "Tu te recharges en faisant : bouger, cuisiner, marcher, créer avec tes mains.",
      "fit": "Un partenaire partant pour des activités concrètes, ou qui te laisse les vivre.",
      "risk": "Un partenaire qui vit tout sur écran et trouve tes activités inutiles."
    },
    "evasion": {
      "title": "Recharge par l'évasion",
      "short": "en t'évadant dans les idées et les histoires",
      "couple": "Tu te recharges en explorant : lire, découvrir, rêver, parler d'idées.",
      "fit": "Un partenaire curieux, avec qui partager une découverte, ou qui respecte ta bulle.",
      "risk": "Un partenaire qui se moque de tes centres d'intérêt ou coupe sans cesse ta bulle."
    },
    "elan": {
      "title": "Recharge par l'élan social",
      "short": "avec du monde et du mouvement",
      "couple": "Tu te recharges dans le mouvement et la rencontre : sorties, amis, animation.",
      "fit": "Un partenaire qui aime sortir, ou qui te laisse sortir sans jalousie.",
      "risk": "Un partenaire très casanier qui vit tes sorties comme une trahison."
    }
  },
  "languages": {
    "paroles": {
      "name": "Les paroles valorisantes",
      "lower": "les paroles valorisantes",
      "recv": "Les mots comptent énormément pour toi. Un compliment sincère, un « je t'aime » dit au bon moment, un message qui reconnaît ce que tu fais te remplissent pour plusieurs jours. À l'inverse, une critique sèche ou un long silence peuvent te blesser plus que l'autre ne l'imagine.",
      "tips": [
        "Dis-le clairement à ton partenaire : « Ce qui me touche le plus, c'est quand tu me dis ce que tu apprécies chez moi. »",
        "Remarque les mots gentils quand ils arrivent, et dis merci : on répète ce qui est accueilli.",
        "Si les reproches sont fréquents, demande qu'ils soient formulés sur un fait précis, jamais sur ce que tu es."
      ],
      "partnerHint": "met des mots sur ce qu'il ou elle ressent et apprécie chez toi"
    },
    "moments": {
      "name": "Les moments de qualité",
      "lower": "les moments de qualité",
      "recv": "Pour toi, l'amour, c'est de la présence. Pas seulement être dans la même pièce : être vraiment là, attentif, sans écran, disponible. Une soirée où l'autre t'écoute pleinement vaut plus qu'un beau cadeau. Être remis·e à plus tard, encore et encore, te fait douter d'être important·e.",
      "tips": [
        "Propose un rendez-vous fixe, même court : 30 minutes par jour sans téléphone, ou une soirée par semaine rien qu'à deux.",
        "Dis ce qui compte : « Quand tu poses ton téléphone pour m'écouter, je me sens aimé·e. »",
        "Repère les moments partagés qui existent déjà (un café, un trajet) et donne-leur de la valeur."
      ],
      "partnerHint": "t'offre du temps et une attention pleine, sans distraction"
    },
    "cadeaux": {
      "name": "Les cadeaux",
      "lower": "les cadeaux et les attentions",
      "recv": "Ce n'est pas une question de prix. Ce qui te touche, c'est la preuve que l'autre a pensé à toi : un petit mot, un objet trouvé en route, une attention pour une date qui compte. Un oubli, surtout répété, peut te faire sentir invisible.",
      "tips": [
        "Explique que ce n'est pas matériel : « Un petit rien qui prouve que tu as pensé à moi me touche énormément. »",
        "Partage tes dates importantes et quelques idées simples : on ne devine pas toujours.",
        "Garde une trace des attentions reçues (une boîte, une photo) : elles nourrissent dans les jours plus difficiles."
      ],
      "partnerHint": "pense à toi et te le prouve par de petites attentions"
    },
    "services": {
      "name": "Les services rendus",
      "lower": "les services rendus",
      "recv": "Pour toi, aimer se voit dans les actes. Quand l'autre prend en charge une tâche, anticipe ce qui te pèse, partage vraiment la charge du quotidien, tu te sens aimé·e. Les belles paroles sans actes, en revanche, sonnent creux.",
      "tips": [
        "Nomme précisément ce qui te soulagerait : « Si tu t'occupes des courses le samedi, je me sens soutenu·e. »",
        "Remercie les gestes concrets : ils sont ton carburant, dis-le.",
        "Si la charge est déséquilibrée depuis longtemps, mets le sujet sur la table calmement, liste à l'appui."
      ],
      "partnerHint": "agit concrètement et partage vraiment la charge du quotidien"
    },
    "toucher": {
      "name": "Le toucher physique",
      "lower": "le toucher",
      "recv": "Le contact physique est ton langage le plus direct : une main tenue, un câlin, une caresse en passant. Il te rassure et te relie, bien au-delà de la sexualité. Un partenaire distant physiquement peut te donner le sentiment d'être rejeté·e, même s'il t'aime.",
      "tips": [
        "Dites-le simplement : « Un câlin le matin, ta main dans la mienne, c'est ce qui me rassure le plus. »",
        "Propose des gestes du quotidien, pas seulement des moments intimes.",
        "Si l'autre est peu tactile, cherche ensemble des gestes qui lui conviennent aussi, sans forcer."
      ],
      "partnerHint": "est à l'aise avec le contact physique et l'offre spontanément"
    }
  },
  "ennea": {
    "types": {
      "t1": {
        "n": 1,
        "name": "le Perfectionniste",
        "couple": "En couple, tu apportes de la fiabilité et du sérieux, et tu as besoin d'un partenaire qui respecte tes efforts sans se sentir corrigé en permanence.",
        "piege": "vouloir corriger l'autre au lieu de l'accepter tel qu'il est"
      },
      "t2": {
        "n": 2,
        "name": "l'Altruiste",
        "couple": "En couple, tu apportes de la chaleur et de l'attention, et tu as besoin d'un partenaire qui prend soin de toi aussi, sans que tu aies à le demander.",
        "piege": "t'oublier pour te rendre indispensable"
      },
      "t3": {
        "n": 3,
        "name": "le Battant",
        "couple": "En couple, tu apportes de l'élan et des projets, et tu as besoin d'un partenaire qui t'aime pour qui tu es, pas pour ce que tu réussis.",
        "piege": "faire passer l'image ou le travail avant le lien"
      },
      "t4": {
        "n": 4,
        "name": "le Romantique",
        "couple": "En couple, tu apportes de la profondeur et de la vérité, et tu as besoin d'un partenaire qui accueille tes émotions sans s'en effrayer.",
        "piege": "idéaliser ce qui manque et ne plus voir ce qui est là"
      },
      "t5": {
        "n": 5,
        "name": "l'Observateur",
        "couple": "En couple, tu apportes du calme, de la loyauté et un regard juste, et tu as besoin d'un partenaire qui respecte ton besoin de retrait.",
        "piege": "te retirer au lieu de partager ce que tu ressens"
      },
      "t6": {
        "n": 6,
        "name": "le Loyal",
        "couple": "En couple, tu apportes de l'engagement et de la fidélité, et tu as besoin d'un partenaire constant, qui rassure par ses actes.",
        "piege": "tester l'autre ou douter de lui même quand tout va bien"
      },
      "t7": {
        "n": 7,
        "name": "l'Épicurien",
        "couple": "En couple, tu apportes de la joie et de l'aventure, et tu as besoin d'un partenaire curieux, qui ne vit pas ton besoin de liberté comme une menace.",
        "piege": "fuir l'inconfort au lieu de traverser les moments difficiles"
      },
      "t8": {
        "n": 8,
        "name": "le Protecteur",
        "couple": "En couple, tu apportes de la force et de la protection, et tu as besoin d'un partenaire solide, qui ose te tenir tête avec douceur.",
        "piege": "prendre trop de place et confondre intensité et vérité"
      },
      "t9": {
        "n": 9,
        "name": "le Médiateur",
        "couple": "En couple, tu apportes de la douceur et de l'apaisement, et tu as besoin d'un partenaire qui s'intéresse vraiment à ce que tu veux.",
        "piege": "t'effacer pour éviter le conflit"
      }
    },
    "disclaimer": "L'ennéagramme est une hypothèse de départ, pas une étiquette. Trois écrans ne suffisent pas à trouver ton type avec certitude : prends ce résultat comme une piste à explorer, idéalement accompagné·e.",
    "credit": "L'ennéagramme décrit 9 motivations de base et 3 instincts (conservation, social, tête-à-tête).",
    "stressHint": "Ta réaction sous stress fort va dans le même sens que ta piste.",
    "confidenceOne": "C'est ta piste principale, à confirmer avec le temps.",
    "confidenceMany": "Tu hésites entre {typeLabel} et {altLabel} : garde les deux pistes ouvertes."
  },
  "instincts": {
    "sp": {
      "name": "conservation",
      "desc": "Ton énergie va d'abord vers le confort, la sécurité matérielle et le bien-être du quotidien.",
      "couple": "En couple, tu construis un nid : un foyer, des habitudes, une sécurité concrète."
    },
    "so": {
      "name": "social",
      "desc": "Ton énergie va d'abord vers le groupe, l'appartenance et la place que vous avez parmi les autres.",
      "couple": "En couple, tu as besoin que votre histoire s'inscrive dans une vie partagée, avec des amis, une famille, une communauté."
    },
    "sx": {
      "name": "tête-à-tête",
      "desc": "Ton énergie va d'abord vers l'intensité du lien avec une personne : la connexion, l'étincelle.",
      "couple": "En couple, tu cherches l'attirance, la fusion et des échanges intenses, rien que vous deux."
    }
  },
  "instinctPairs": {
    "sp-sp": "Deux « conservation » : un foyer stable et rassurant. Le risque : que la routine et le confort remplacent le désir. Prévoyez de la nouveauté à deux.",
    "so-so": "Deux « social » : une vie riche d'amis et de projets communs. Le risque : ne plus avoir de temps rien qu'à deux. Protégez des moments intimes.",
    "sx-sx": "Deux « tête-à-tête » : une connexion intense, magnétique. Le risque : les montagnes russes et la jalousie. Gardez des repères stables.",
    "sp-so": "Conservation et social : l'un rêve de cocon, l'autre de monde. Bien vécu, c'est un bel équilibre entre foyer et ouverture. Mal vécu, l'un se sent seul à la maison et l'autre enfermé.",
    "sp-sx": "Conservation et tête-à-tête : l'un cherche la sécurité, l'autre l'intensité. Ensemble, vous pouvez allier stabilité et passion, si l'un ne vit pas l'autre comme « trop calme » ou « trop intense ».",
    "so-sx": "Social et tête-à-tête : l'un s'épanouit en groupe, l'autre veut l'exclusivité. Friction classique : les soirées entre amis. Un accord simple aide, par exemple une sortie à plusieurs, puis une soirée rien qu'à deux."
  },
  "values": {
    "honnetete": {
      "short": "l'honnêteté",
      "opposite": "Un partenaire qui ment ou cache des choses importantes.",
      "direction": false
    },
    "fidelite": {
      "short": "la fidélité",
      "opposite": "Un partenaire qui ne veut pas d'exclusivité.",
      "direction": false
    },
    "respect": {
      "short": "le respect",
      "opposite": "Un partenaire méprisant, même « pour rire ».",
      "direction": false
    },
    "engagement": {
      "short": "l'engagement",
      "opposite": "Un partenaire qui refuse de s'engager.",
      "direction": true
    },
    "famille": {
      "short": "la famille",
      "opposite": "Un partenaire qui met les proches à distance.",
      "direction": false
    },
    "enfants": {
      "short": "avoir des enfants",
      "opposite": "Un partenaire qui ne veut pas d'enfants.",
      "direction": true
    },
    "sans_enfants": {
      "short": "une vie sans enfants",
      "opposite": "Un partenaire qui veut absolument des enfants.",
      "direction": true
    },
    "liberte": {
      "short": "la liberté",
      "opposite": "Un partenaire qui veut tout partager, tout le temps.",
      "direction": false
    },
    "securite_fin": {
      "short": "la sécurité financière",
      "opposite": "Un partenaire qui dépense sans compter.",
      "direction": true
    },
    "independance_fin": {
      "short": "l'indépendance financière",
      "opposite": "Un partenaire qui veut tout mettre en commun.",
      "direction": true
    },
    "generosite": {
      "short": "la générosité",
      "opposite": "Un partenaire qui compte tout.",
      "direction": false
    },
    "spiritualite": {
      "short": "la spiritualité ou la foi",
      "opposite": "Un partenaire qui rejette ta foi ou ta quête de sens.",
      "direction": false
    },
    "ambition": {
      "short": "l'ambition",
      "opposite": "Un partenaire qui freine tes projets.",
      "direction": true
    },
    "simplicite": {
      "short": "la simplicité",
      "opposite": "Un partenaire qui court toujours après plus.",
      "direction": true
    },
    "aventure": {
      "short": "l'aventure",
      "opposite": "Un partenaire qui refuse de bouger.",
      "direction": false
    },
    "ailleurs": {
      "short": "pouvoir partir vivre ailleurs",
      "opposite": "Un partenaire qui ne quittera jamais sa ville.",
      "direction": true
    },
    "racines": {
      "short": "rester près de tes racines",
      "opposite": "Un partenaire qui veut partir loin.",
      "direction": true
    },
    "nature": {
      "short": "le respect de la nature",
      "opposite": "Un partenaire indifférent à la planète.",
      "direction": false
    },
    "humour": {
      "short": "l'humour",
      "opposite": "Un partenaire qui prend tout au sérieux.",
      "direction": false
    },
    "culture": {
      "short": "la culture et la curiosité",
      "opposite": "Un partenaire qui n'a envie de rien découvrir.",
      "direction": false
    },
    "sante": {
      "short": "la santé et le sport",
      "opposite": "Un partenaire qui se néglige complètement.",
      "direction": false
    },
    "solidarite": {
      "short": "la solidarité",
      "opposite": "Un partenaire indifférent aux autres.",
      "direction": false
    },
    "transparence": {
      "short": "la transparence",
      "opposite": "Un partenaire qui garde des secrets sur ce qui vous engage.",
      "direction": false
    },
    "traditions": {
      "short": "les traditions",
      "opposite": "Un partenaire qui méprise tes traditions.",
      "direction": false
    },
    "creativite": {
      "short": "la créativité",
      "opposite": "Un partenaire qui trouve ta créativité inutile.",
      "direction": false
    }
  },
  "stress": {
    "modere": {
      "D": {
        "short": "prends les choses en main",
        "text": "Sous pression, tu passes à l'action et tu tranches. Précieux, tant que l'autre a le temps de suivre.",
        "partner": "Un partenaire qui ose te dire « attends » sans s'écraser."
      },
      "I": {
        "short": "dédramatises",
        "text": "Tu allèges l'ambiance par la parole et l'humour. Veille à ne pas glisser sur ce qui compte.",
        "partner": "Un partenaire qui rit avec toi, puis revient au sujet avec douceur."
      },
      "S": {
        "short": "fais le dos rond",
        "text": "Tu protèges la paix et tu attends que l'orage passe. Le risque : laisser les problèmes s'accumuler.",
        "partner": "Un partenaire patient, qui t'invite à parler sans te presser."
      },
      "C": {
        "short": "analyses",
        "text": "Tu cherches les faits et la logique. Le risque : avoir raison, mais rater l'émotion de l'autre.",
        "partner": "Un partenaire qui accepte les faits, et toi qui accueilles ses émotions."
      }
    },
    "fort": {
      "fight": {
        "short": "contre-attaquer",
        "text": "Sous stress fort, tu passes en mode combat : le ton monte et tu veux avoir le dernier mot.",
        "tip": "Dis « je fais une pause de 20 minutes et je reviens », puis reviens vraiment."
      },
      "flight": {
        "short": "fuir",
        "text": "Sous stress fort, tu t'échappes : tu sors, tu t'occupes, tu évites le sujet.",
        "tip": "Fixe un moment précis pour reparler du sujet, pour que ta pause ne devienne pas une fuite."
      },
      "freeze": {
        "short": "te figer",
        "text": "Sous stress fort, tu te figes : plus de mots, plus d'idées. Ce n'est pas de l'indifférence.",
        "tip": "Prépare une phrase simple : « Je suis bloqué·e, laisse-moi un moment, je reviens vers toi. »"
      },
      "fawn": {
        "short": "céder pour apaiser",
        "text": "Sous stress fort, tu cèdes pour que ça s'arrête, même quand tu n'es pas d'accord.",
        "tip": "Remplace le « oui » réflexe par : « Je ne suis pas sûr·e, j'y réfléchis et je te dis. »"
      }
    },
    "families": {
      "fight": [
        "t1",
        "t3",
        "t8"
      ],
      "flight": [
        "t4",
        "t5",
        "t7"
      ],
      "freeze": [
        "t5",
        "t6",
        "t9"
      ],
      "fawn": [
        "t2",
        "t6",
        "t9"
      ]
    }
  },
  "brakes": {
    "rejet": {
      "short": "la peur d'être rejeté·e",
      "antidote": "Commence petit : une demande simple, une réponse simple. Un non à une demande n'est pas un non à toi."
    },
    "blesser": {
      "short": "la peur de blesser l'autre",
      "antidote": "Dire ce que tu ressens avec douceur n'est pas blesser. Te taire, à la longue, blesse davantage."
    },
    "moment": {
      "short": "attendre le bon moment",
      "antidote": "Choisis un jour cette semaine, et note-le maintenant. Le bon moment, c'est celui que tu décides."
    },
    "espoir": {
      "short": "espérer que l'autre change",
      "antidote": "Regarde ce qui est là aujourd'hui, pas ce qui pourrait être. Choisis en fonction des actes."
    },
    "habitude": {
      "short": "le confort de l'habitude",
      "antidote": "Écris ce que cette situation te coûte vraiment, en énergie et en joie. Le confort a un prix."
    },
    "seul": {
      "short": "la peur d'être seul·e",
      "antidote": "Fais une liste de ce qui te nourrit hors du couple. Plus elle est longue, plus tu choisis librement."
    },
    "flou": {
      "short": "ne pas savoir ce que tu veux",
      "antidote": "Relis tes 3 non-négociables : ils sont ta boussole quand tu doutes."
    },
    "regard": {
      "short": "le regard des autres",
      "antidote": "C'est toi qui vis ta relation, chaque jour. Demande-toi : « Qu'est-ce que je choisirais si personne ne savait ? »"
    },
    "contraintes": {
      "short": "les contraintes matérielles",
      "antidote": "Sépare la décision et l'organisation. On peut décider d'abord, puis organiser pas à pas."
    },
    "energie": {
      "short": "le manque de temps ou d'énergie",
      "antidote": "Une action de 5 minutes suffit pour avancer. Pas besoin d'attendre d'avoir de l'énergie."
    },
    "parfait": {
      "short": "attendre la personne parfaite",
      "antidote": "Cherche la bonne personne pour toi, pas la personne parfaite. Tes non-négociables suffisent à trier."
    },
    "passe": {
      "short": "les blessures du passé",
      "antidote": "Ton passé explique ta prudence, il ne décide pas de ton avenir. Te faire accompagner peut aider."
    }
  },
  "actions": {
    "a5": "Demain, prends 5 minutes pour ta prochaine étape. Fais-la avant midi si tu peux.",
    "voix": "Dis ton engagement à voix haute, maintenant. Ce qu'on dit tout haut, on le tient plus souvent.",
    "rappel": "Ton rappel : demain à {heure}."
  },
  "times": [
    {
      "id": "08:00",
      "label": "8 h"
    },
    {
      "id": "12:30",
      "label": "12 h 30"
    },
    {
      "id": "18:00",
      "label": "18 h"
    },
    {
      "id": "21:00",
      "label": "21 h"
    }
  ],
  "nextSteps": [
    {
      "id": "besoin",
      "label": "Dire clairement ce dont j'ai besoin",
      "prefix": "Cette semaine, je dis clairement ce dont j'ai besoin."
    },
    {
      "id": "soiree",
      "label": "Proposer une soirée rien qu'à deux",
      "prefix": "Cette semaine, je propose une soirée rien qu'à deux."
    },
    {
      "id": "question",
      "label": "Poser la question qui compte (enfants, projet, lieu de vie)",
      "prefix": "Cette semaine, je pose la question qui compte pour moi."
    },
    {
      "id": "limite",
      "label": "Mettre une limite claire",
      "prefix": "Cette semaine, je pose une limite claire."
    },
    {
      "id": "boussole",
      "label": "Faire le point sur ma relation avec la Boussole",
      "prefix": "Cette semaine, je fais le point sur ma relation avec la Boussole."
    },
    {
      "id": "jetaime",
      "label": "Oser dire « je t'aime »",
      "prefix": "Cette semaine, j'ose dire « je t'aime »."
    },
    {
      "id": "recul",
      "label": "Prendre quelques jours de recul",
      "prefix": "Cette semaine, je prends quelques jours de recul."
    },
    {
      "id": "accompagner",
      "label": "Me faire accompagner",
      "prefix": "Cette semaine, je réserve un moment pour me faire accompagner."
    }
  ],
  "moments": [
    {
      "id": "soir",
      "label": "Ce soir"
    },
    {
      "id": "demain",
      "label": "Demain"
    },
    {
      "id": "weekend",
      "label": "Ce week-end"
    },
    {
      "id": "semaine",
      "label": "Cette semaine"
    }
  ],
  "safety": {
    "present": {
      "title": "Avant tout le reste",
      "text": "Tu as indiqué vivre de la peur, du rabaissement, du contrôle ou des menaces dans ta relation actuelle. Ce n'est pas une question de compatibilité ni de langage de l'amour, et ce n'est pas de ta faute. Tu mérites d'être en sécurité. Parles-en à un ou une professionnel·le ou à une personne de confiance. En France : 3919 (violences conjugales, gratuit et anonyme, 24h/24), 17 ou 112 en cas de danger immédiat, 114 par SMS si tu ne peux pas parler. Hors de France, contacte les services d'urgence de ton pays."
    },
    "doute": {
      "title": "Une question qui mérite d'être posée",
      "text": "Tu te demandes parfois si ce que tu vis est normal. Ce doute est important. Se sentir régulièrement rabaissé·e, surveillé·e ou avoir peur de la réaction de l'autre n'est jamais une simple différence de caractère. Tu peux en parler, sans engagement, à un ou une professionnel·le. En France, le 3919 écoute aussi les personnes qui doutent (gratuit et anonyme, 24h/24)."
    }
  },
  "pastAbuseNote": "Tu as indiqué avoir vécu de la peur ou du rabaissement dans une relation passée. Ce que tu as traversé n'était pas de ta faute. Si cela pèse encore, en parler à un ou une professionnel·le peut vraiment aider à ne pas le revivre.",
  "riskGrid": [
    {
      "level": "Faible",
      "label": "Différences de forme, gérables",
      "text": "Ordre, ponctualité, habitudes, goûts. Elles demandent de l'humour et quelques accords, et peuvent même te compléter."
    },
    {
      "level": "Fort",
      "label": "Frictions récurrentes, à négocier",
      "text": "Des sujets importants pour toi où l'écart reviendra souvent. Ils se négocient, à condition d'en parler tôt et de trouver un accord que chacun peut tenir."
    },
    {
      "level": "Critique",
      "label": "Non négociables",
      "text": "Enfants oui ou non, rythme de vie incompatible, besoin de liberté face à un besoin de fusion extrême, valeurs fondamentales opposées. Ici, l'un des deux finirait par renoncer à une part essentielle de lui-même. L'amour ne suffit pas à combler cet écart."
    },
    {
      "level": "Hors grille",
      "label": "Signaux d'alerte",
      "text": "Mépris, humiliation, contrôle, menaces, violence physique, psychologique ou économique, et toute atteinte au corps. Ce ne sont pas des incompatibilités : ce sont des signaux de danger, qui appellent l'aide d'un professionnel."
    }
  ],
  "universal": [
    "Être respecté·e, dans les mots comme dans les actes",
    "Pouvoir dire non sans avoir peur",
    "L'honnêteté sur les sujets qui engagent le couple",
    "Aucune forme de violence, de menace ou de contrôle"
  ],
  "universalCritical": "Un partenaire qui méprise, contrôle, menace ou violente. Ce n'est pas une incompatibilité : c'est un signal d'alerte, qui appelle l'aide d'un professionnel.",
  "keyMessages": [
    "L'émotion et la chimie ne suffisent pas. Elles disent « je suis attiré·e », pas « nous pouvons être heureux ensemble ».",
    "On peut être amoureux·se et malheureux·se. Ce n'est pas un paradoxe : c'est le signe que des besoins essentiels ne sont pas nourris.",
    "On ne change pas quelqu'un. Lui demander de changer, c'est lui demander d'arrêter d'être lui-même.",
    "Le bon critère : un partenaire dont tu peux accepter les défauts sur le long terme, parce qu'ils ne touchent pas tes besoins essentiels.",
    "Le même fond, des formes différentes : partager les valeurs profondes, et avoir des talents différents en surface, c'est souvent la recette d'un couple qui dure."
  ],
  "sentences": {
    "need": "{prenom}, ce qui te nourrit vraiment : {n1}, {n2} et {n3}. Tu te sens aimé·e surtout par {lang1} et {lang2}, et tu te recharges {rechargeShort}.",
    "danger": "Ce qui te met en danger : {v1} et {v2}, une relation qui ne respecte pas {val1}, et ton frein : {brake1}.",
    "ennea": "Ta piste ennéagramme : type {n} ({name}), sous-type {instinct}. Sous stress fort, tu as tendance à {stress}."
  },
  "shareTemplate": [
    "{s1}",
    "{s2}",
    "{s3}",
    "Fais le quiz : {quizUrl}"
  ],
  "exportTemplate": [
    "{s1}",
    "{s2}",
    "{s3}",
    "",
    "{glance}",
    "",
    "Appel Découverte offert avec Pierre Sarazin : {calendly}"
  ]
};
if (typeof module !== "undefined" && module.exports) module.exports = AMOUR_DATA;
else root.AMOUR_DATA = AMOUR_DATA;
})(typeof window !== "undefined" ? window : globalThis);
