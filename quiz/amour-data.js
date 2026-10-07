/* Quiz Amour v1.4 (mode ?theme=amour) · Magic Humans · données et textes, FR uniquement.
   Fichier de données pur : aucune logique d'affichage. Lu par quiz/amour.js et par les tests. */
(function (root) {
const AMOUR_DATA = {
  "version": 4,
  "config": {
    // Appel Découverte habituel (Talent Unique), pas un coaching amour à part. utm_content est ajouté par bouton.
    "calendly": "https://calendly.com/pierre-j-sarazin?utm_source=sommet-love-connexion&utm_medium=quiz-amour&utm_campaign=sommet-amour",
    "site": "https://www.magichumans.com/",
    "quizUrl": "https://www.magichumans.com/quiz-amour/",
    "boussoleUrl": "/boussole-decision/importer-quiz/?theme=amour",
    "matchingEmail": "sommetamourconnexion@gmail.com"
  },
  "ui": {
    "pageTitle": "Découvre ton profil amoureux",
    "brand": "Magic Humans · Quiz Amour",
    "footer": "Magic Humans · Ce quiz propose des pistes de réflexion, pas un diagnostic. Tes réponses restent sur cet appareil pour que tu puisses reprendre. Rien n'est envoyé.",
    "footerSalle": "Magic Humans · Ce quiz propose des pistes de réflexion, pas un diagnostic. Tes réponses restent sur cet appareil pour que tu puisses reprendre. Seul ton profil anonyme est compté pour la photo de la salle.",
    "intro": {
      "eyebrow": "Sommet de l'Amour · Gratuit · 8 questions · environ 8 minutes",
      "h1": "Découvre ton <em>profil amoureux</em>",
      "lead": "Le coup de foudre ne suffit pas pour construire un couple heureux. En 8 minutes, fais le point sur ce qui te nourrit, ce qui te vide, et le genre de partenaire qui te va vraiment.",
      "bullets": [
        "Ce qui te nourrit en couple, et ce qui te vide",
        "Ce qui te recharge, pour ne plus t'épuiser dans une relation",
        "Tes langages de l'amour, tes valeurs et ta piste ennéagramme",
        "Ta façon de réagir quand ça chauffe, et ce qui te freine"
      ],
      "howto": "Réponds sans trop réfléchir, ta première idée est souvent la bonne. Il n'y a pas de bonne ou de mauvaise réponse.",
      "nameLabel": "Ton prénom",
      "nameHelp": "Il sert seulement à personnaliser tes résultats.",
      "start": "Commencer →"
    },
    "quiz": {
      "progress": "Question {i} sur {n}",
      "rankSuffix": " · Classer",
      "counter": "{label} : {x}/{min} minimum",
      "counterBare": "{x}/{min} minimum",
      "counterMax": "{label} : {x}/{max}, minimum {min}",
      "maxValues": "5 valeurs maximum. Retire-en une pour en changer.",
      "topCounter": "Tes 3 premières : {x}/{n}",
      "topSuffix": " · Tes 3 premières",
      "untap": "« {label} » retirée de tes 3 premières.",
      "counterOk": "✓",
      "rankHelp": "Fais glisser les cartes, ou utilise les flèches ↑ ↓.",
      "rankTapHelp": "Mets en premier celle qui te parle le plus. Touche les cartes dans l'ordre, ou fais-les glisser.",
      "rankCounter": "Classés : {x}/{min} minimum",
      "rankEmpty": "Touche une carte ci-dessous pour la placer.",
      "rankZone": "Ton classement",
      "rankOrder": "Ton ordre : {x}/{n}",
      "rankReset": "Recommencer",
      "rankUndo": "« {label} » retirée de ton ordre.",
      "rankCleared": "Ordre effacé.",
      "up": "Monter",
      "down": "Descendre",
      "remove": "Retirer du classement",
      "live": "{label}, position {pos} sur {total}.",
      "grabbed": "{label} saisi. Flèches pour déplacer, Espace pour déposer, Échap pour annuler.",
      "placed": "« {label} » placé en position {pos} sur {total}.",
      "unchecked": "« {label} » a été décochée.",
      "addOther": "+ Ajouter une autre valeur",
      "removeLine": "Retirer",
      "next": "Suivant →",
      "prev": "← Précédent",
      "skip": "Passer",
      "finish": "Voir mes résultats →",
      "more": "Encore {k} choix pour continuer.",
      "moreDown": "Coche encore {k} pour « {label} », plus bas ↓",
      "idea": "Idée : {antidote}",
      "timeAsk": "À quelle heure demain ?",
      "engagementCounter": "Écris ton engagement et choisis un moment",
      "resumeNotice": "On reprend où tu en étais",
      "resumeRestart": "Recommencer",
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
      "shareBtn": "Partager",
      "stickyCta": "Parler avec Pierre",
      "stickyClose": "Fermer",
      "salleH": "Photo de la salle ce soir",
      "salleWait": "La photo s'affiche dès 5 participants.",
      "salleRefresh": "Actualiser",
      "salleTotal": "{n} participants",
      "salleYou": "Toi",
      "salleCompat": "Le profil le plus compatible avec toi, {name}, représente {pct} % de la salle.",
      "boussoleNote": "Ta Boussole sera préréglée avec tes résultats.",
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
      "ressH": "Ce qui te recharge",
      "langH": "Tes langages de l'amour",
      "enneaH": "Ta piste ennéagramme",
      "instinctH": "Ton sous-type",
      "stressH": "Toi sous stress",
      "brakesH": "Tes freins",
      "partnerH": "Le partenaire qui te correspond",
      "partnerIntro": "Le partenaire qui te correspond, d'après tes réponses.",
      "completeLab": "Qui te complète",
      "frictionLab": "Avec qui ça risque de coincer (à négocier)",
      "criticalLab": "Incompatible pour toi (non négociable)",
      "gridH": "Comment lire les niveaux de risque",
      "keyH": "Ce qu'il faut retenir",
      "piegeLab": "Ton piège :",
      "pairPrefix": "Avec un partenaire {name} :",
      "pairsNote": "Ce ne sont que des tendances. Elles montrent où ça peut coincer, pour que vous en parliez tôt.",
      "tipsLab": "Concrètement",
      "rechargeRule": "La règle d'or : après un moment ensemble, tu dois avoir plus d'énergie qu'avant. Si une relation te vide pendant longtemps, ce n'est pas un détail : ça veut dire quelque chose.",
      "rechargeSame": "Ta façon de te recharger est claire : {title}.",
      "rechargeMixed": "Tu te recharges de deux façons : {soirTitle} en semaine, {weekendTitle} le week-end.",
      "boussoleLab": "La Boussole Relation",
      "boussoleP": "Tu es en couple, ou tu hésites sur une relation ? La Boussole Relation t'aide à l'évaluer calmement, critère par critère. Elle sera préréglée avec tes résultats : tes besoins, ce qui te vide, tes défauts acceptables et tes non-négociables. Une alerte s'affiche si un point essentiel est touché, quel que soit le score.",
      "boussoleBtn": "Évaluer ma relation avec la Boussole →",
      "ctaEyebrow": "Appel Découverte · offert",
      "ctaH": "Et si on en parlait ensemble ?",
      "ctaP": "Ton profil amoureux dit beaucoup de ton Talent Unique. On en parle 1 h, offert, pour que tu choisisses mieux, en amour comme dans ta vie pro.",
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
      "petitPasLabel": "Et toi, quel petit pas tu fais cette semaine ?",
      "petitPasPh": "Exemple : dire ce soir ce dont j'ai besoin.",
      "petitPasHint": "Facultatif. Ça reste sur cet appareil.",
      "petitPasExport": "Mon petit pas cette semaine : « {texte} »",
      "nowStep": "Ta prochaine étape",
      "nowStepEmpty": "Choisis un petit pas pour ta relation cette semaine.",
      "nowTest": "Teste ta relation",
      "nowTestP": "Vérifie si ton ou ta partenaire (actuel·le ou futur·e) te correspond vraiment, critère par critère.",
      "nowBoussole": "Ouvrir ma Boussole Relation",
      "nowPierre": "Fais le point avec Pierre",
      "nowCall": "Réserver mon Appel Découverte offert",
      "nowPdf": "Télécharger mon profil (PDF)",
      "nowGeneric": "En 1 h, offert, on relie ton profil amoureux à ton Talent Unique.",
      "nowStress": {
        "fight": "Quand ça chauffe vraiment, tu as tendance à contre-attaquer.",
        "flight": "Quand ça chauffe vraiment, tu as tendance à fuir.",
        "freeze": "Quand ça chauffe vraiment, tu as tendance à te figer.",
        "fawn": "Quand ça chauffe vraiment, tu as tendance à céder pour calmer le jeu."
      },
      "talentH": "Ce que ton profil dit de ton Talent Unique",
      "talent": {
        "securite": "En amour, tu as besoin de savoir sur qui tu peux compter. Et c'est sûrement pareil ailleurs : au travail comme dans tes projets, tu donnes le meilleur de toi quand les règles sont claires et que les gens tiennent parole. C'est ton Contexte Déclencheur. À l'inverse, le flou qui s'éternise t'éteint, c'est ton Anti-Contexte.",
        "profondeur": "Tu as besoin de vrai, de conversations qui vont au fond des choses. Ce besoin ne s'arrête pas au couple : ton talent se cache souvent là, dans ta façon de comprendre les gens mieux que la moyenne. Ton Contexte Déclencheur, ce sont les échanges sincères, sans masque. Ton Anti-Contexte, les relations qui restent en surface.",
        "admiration": "Tu as besoin que ce que tu donnes soit vu. Ce n'est pas de l'ego, c'est un moteur, et il marche aussi dans ta vie pro : quand on reconnaît ton travail, tu te dépasses avec plaisir. Ton Contexte Déclencheur, c'est un endroit où ce que tu apportes compte vraiment. Ton Anti-Contexte, rester dans l'ombre trop longtemps.",
        "liberte": "Tu aimes mieux quand tu restes libre de tes choix. Dans le reste de ta vie aussi, tu donnes le meilleur quand on te fait confiance et qu'on te laisse faire à ta façon. C'est ton Contexte Déclencheur. Ton Anti-Contexte, c'est d'être contrôlé·e ou de devoir rendre des comptes sans arrêt.",
        "harmonie": "Tu as besoin d'un climat doux pour aimer pleinement. Ça dit quelque chose de ton talent : tu sais apaiser, relier, faire que les gens se sentent bien ensemble. Ton Contexte Déclencheur, un cadre serein où l'on se parle avant que ça coince. Ton Anti-Contexte, les tensions qui traînent sans jamais se régler.",
        "complicite": "Pour toi, aimer, c'est faire équipe. Et tu fonctionnes sûrement pareil au boulot : seul·e, tu t'ennuies, à plusieurs, tu décolles. Ton Contexte Déclencheur, c'est un projet concret qu'on porte ensemble, dans la bonne humeur. Ton Anti-Contexte, c'est de tout porter seul·e, trop longtemps.",
        "intensite": "Tu as besoin que ça vibre. En amour comme ailleurs, la routine plate t'éteint, alors qu'un défi te réveille. C'est une vraie piste pour ton Talent Unique : tu donnes le meilleur quand il y a de l'enjeu et de la nouveauté, c'est ton Contexte Déclencheur. Ton Anti-Contexte, c'est le train-train sans surprise."
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
              "hint": "Des fous rires, des blagues que personne d'autre ne comprend.",
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
              "hint": "Il ou elle fait la tête pendant des jours.",
              "short": "les silences qui durent",
              "need": "profondeur",
              "conflict": true
            },
            {
              "id": "cris",
              "label": "Les cris et les piques",
              "hint": "Le ton monte vite, les petites phrases qui font mal.",
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
              "hint": "Chaque sortie entre amis devient toute une histoire.",
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
              "label": "Me sentir étouffé·e",
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
            "placeholder": "Écris ce qui te vide",
            "maxLength": 60,
            "max": 5,
            "multi": true,
            "addLabel": "+ Ajouter une autre ligne"
          }
        }
      ],
      "rank": {
        "mode": "step",
        "groups": [
          "nourrit",
          "vide"
        ],
        "title": "Mets en premier ce qui compte le plus pour toi.",
        "cta": "Classer mes choix →",
        "divider": {
          "group": "vide",
          "after": 1,
          "text": "En premier : ce que tu ne veux plus vivre."
        }
      }
    },
    {
      "id": "ressource",
      "type": "pick",
      "n": 2,
      "eyebrow": "Ce qui te recharge",
      "title": "Qu'est-ce qui te recharge vraiment ? Coche au moins 2 choses pour le soir et au moins 2 pour le week-end.",
      "help": "Une relation qui te va te donne de l'énergie. Elle ne t'en prend pas.",
      "groups": [
        {
          "id": "soir",
          "title": "Le soir, pour recharger les batteries",
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
              "label": "Raconter ma journée à l'autre",
              "hint": "Sur le canapé, sans écran.",
              "recharge": "relationnel",
              "short": "raconter ta journée à l'autre"
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
              "label": "Ne rien faire, tranquille",
              "hint": "Un bain, une bougie, ma playlist.",
              "recharge": "solitaire",
              "short": "ne rien faire, tranquille"
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
          "title": "Le week-end, pour repartir en forme le lundi",
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
              "label": "Du temps rien que pour moi",
              "hint": "Quelques heures seul·e, sans culpabiliser.",
              "recharge": "solitaire",
              "short": "du temps rien que pour toi"
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
              "hint": "Une journée rien qu'à nous deux, téléphones coupés.",
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
      "title": "Pour te sentir aimé·e, qu'est-ce qui compte le plus ?",
      "help": "Mets en premier ce qui te parle le plus. Deux suffisent. Tu peux toucher les cartes dans l'ordre, ou les faire glisser.",
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
          "hint": "Un petit mot, ta gourmandise préférée."
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
      "title": "Quelles phrases te ressemblent ? Coche celles qui te parlent, ou passe.",
      "help": "C'est un point de départ, pas un verdict.",
      "optional": true,
      "groups": [
        {
          "id": "types",
          "counter": "",
          "min": 0,
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
              "label": "« J'ai besoin de comprendre, et pour ça, il me faut mon espace. »",
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
              "hint": "Direct·e et protecteur·rice, j'ai du mal à montrer mes faiblesses."
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
        "title": "Mets en premier la phrase qui te ressemble le plus."
      }
    },
    {
      "id": "valeurs",
      "type": "pick",
      "n": 5,
      "eyebrow": "Tes valeurs",
      "title": "Choisis 3 à 5 valeurs qui comptent le plus pour toi.",
      "exclusive": [
        [
          "enfants",
          "sans_enfants"
        ]
      ],
      "groups": [
        {
          "id": "valeurs",
          "counter": "Valeurs",
          "min": 3,
          "max": 5,
          "items": [
            {
              "id": "honnetete",
              "label": "Honnêteté",
              "hint": "Se dire la vérité, sans cacher ce qui compte."
            },
            {
              "id": "fidelite",
              "label": "Fidélité",
              "hint": "Exclusivité, loyauté et engagement."
            },
            {
              "id": "respect",
              "label": "Respect",
              "hint": "Pas de mépris, pas de coups bas."
            },
            {
              "id": "famille",
              "label": "Famille",
              "hint": "Tes proches et tes racines comptent beaucoup."
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
              "hint": "Chacun garde sa vie, ses choix, son indépendance."
            },
            {
              "id": "ambition",
              "label": "Ambition",
              "hint": "Réussir, se dépasser, grandir."
            },
            {
              "id": "simplicite",
              "label": "Simplicité",
              "hint": "Une vie simple, sans courir après toujours plus."
            },
            {
              "id": "aventure",
              "label": "Aventure",
              "hint": "Voyager, bouger, changer d'air."
            },
            {
              "id": "humour",
              "label": "Humour",
              "hint": "Ne pas se prendre au sérieux."
            },
            {
              "id": "culture",
              "label": "Culture et curiosité",
              "hint": "Livres, expos, discussions, toujours apprendre."
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
        "mode": "tap",
        "top": 3,
        "groups": [
          "valeurs"
        ],
        "title": "Quelles sont tes 3 valeurs les plus importantes ?",
        "help": "Touche-les dans l'ordre, de la plus importante à la moins importante.",
        "cta": "Choisir mes 3 plus importantes →"
      }
    },
    {
      "id": "instinct",
      "type": "rank",
      "n": 6,
      "eyebrow": "Ton sous-type en couple",
      "title": "Quelle façon de vivre le couple te ressemble le plus ?",
      "help": "Touche les cartes dans l'ordre. La première devient ton n° 1. Touche-la à nouveau pour la retirer.",
      "minRanked": 3,
      "autoCompleteLast": false,
      "cardRank": true,
      "items": [
        {
          "id": "sp",
          "label": "Le foyer · je prends soin de notre chez-nous",
          "hint": "Un cocon tranquille, à la maison."
        },
        {
          "id": "so",
          "label": "Social · j'aime voir du monde",
          "hint": "Un dîner avec des amis."
        },
        {
          "id": "sx",
          "label": "Rien qu'à deux · je veux un lien fort",
          "hint": "Un long moment rien qu'à deux."
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
              "hint": "Je parle, je plaisante, j'essaie de détendre l'atmosphère."
            },
            {
              "id": "S",
              "label": "Je fais le dos rond",
              "hint": "J'attends que ça passe, j'évite de faire des vagues."
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
      "title": "Qu'est-ce qui te freine ou te met mal à l'aise en amour ?",
      "help": "Ce qui te bloque, ce qui te gêne, ou ce qui te donne moins envie d'avancer avec quelqu'un. Coche ce qui te parle.",
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
              "hint": "Je préfère me taire plutôt que de faire de la peine."
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
      "desc": "Tu as besoin de savoir où tu en es. Un partenaire qui tient parole, qui est là quand il le dit, avec qui l'avenir se construit sans montagnes russes. Ce n'est pas un manque d'audace : c'est là que tu peux enfin te détendre.",
      "partner": "De la constance, de la parole tenue, des projets clairs. Quelqu'un qui rassure par les actes, pas seulement par les mots.",
      "anti": "Tu ne sais jamais sur quel pied danser. Les promesses non tenues, les changements d'humeur imprévisibles et le flou sur l'avenir t'épuisent lentement. Dans ce contexte, tu deviens vigilant·e, inquiet·e, et tu perds ta légèreté.",
      "lower": "sécurité et fiabilité",
      "danger": "une relation où tu ne sais jamais sur quel pied danser"
    },
    "liberte": {
      "name": "Liberté et espace",
      "title": "Cœur Libre",
      "desc": "Tu as besoin de rester toi-même dans le couple : tes amis, tes projets, tes temps seuls. Ce n'est pas un manque d'amour. Au contraire, c'est en respirant que tu reviens vers l'autre avec envie.",
      "partner": "Quelqu'un qui te fait confiance, qui a sa propre vie, et qui te laisse partir quelques heures sans le vivre comme un abandon.",
      "anti": "Tu dois te justifier de tout. Les questions sur ton emploi du temps, la jalousie, les reproches quand tu vois tes amis t'éteignent. Dans ce contexte, tu te sens à l'étroit et tu finis par fuir, en pensée ou pour de vrai.",
      "lower": "liberté et espace",
      "danger": "une relation où tu dois te justifier de tout"
    },
    "reconnaissance": {
      "name": "Reconnaissance et admiration",
      "title": "Cœur Lumière",
      "desc": "Tu as besoin de te sentir choisi·e, admiré·e, mis·e en valeur. Ce n'est pas de la vanité : c'est le signe que l'autre te voit vraiment, avec ce que tu apportes.",
      "partner": "Quelqu'un qui est fier·e de toi, qui sait dire « merci » et « bravo », même devant les autres.",
      "anti": "Tes efforts passent inaperçus et l'on te prend pour acquis·e. Les moqueries, la comparaison, le manque de gratitude te ternissent. Dans ce contexte, tu doutes de toi et tu en fais trop pour être enfin vu·e.",
      "lower": "reconnaissance et admiration",
      "danger": "une relation où tes efforts passent inaperçus"
    },
    "profondeur": {
      "name": "Profondeur et intimité émotionnelle",
      "title": "Cœur Profond",
      "desc": "Tu as besoin de pouvoir tout dire et d'être compris·e jusque dans tes émotions. Les conversations vraies, la vulnérabilité partagée, le sentiment d'être connu·e en profondeur te relient plus que tout.",
      "partner": "Quelqu'un qui écoute, qui s'intéresse à ce que tu ressens, et qui ose parler de lui ou d'elle aussi.",
      "anti": "Les conversations restent en surface et les émotions sont tues. Un partenaire qui change de sujet, qui fuit les discussions importantes ou se moque de ta sensibilité t'isole. Dans ce contexte, tu te sens seul·e à deux.",
      "lower": "profondeur et intimité émotionnelle",
      "danger": "une relation qui reste en surface"
    },
    "legerete": {
      "name": "Complicité et légèreté",
      "title": "Cœur Joueur",
      "desc": "Tu as besoin de rire, de jouer, de découvrir. Le couple est pour toi une aventure, une complicité, un terrain de jeu. Sans légèreté, même une belle histoire finit par te sembler grise.",
      "partner": "Quelqu'un qui a de l'humour, qui aime essayer de nouvelles choses et ne prend pas tout au sérieux.",
      "anti": "Tout devient lourd, sérieux, routinier. Les reproches permanents, l'absence de projets, les soirées toujours identiques t'éteignent. Dans ce contexte, tu t'ennuies et tu cherches l'étincelle ailleurs, parfois sans le vouloir.",
      "lower": "complicité et légèreté",
      "danger": "une relation lourde et routinière"
    },
    "harmonie": {
      "name": "Douceur et harmonie",
      "title": "Cœur Paisible",
      "desc": "Tu as besoin d'un quotidien doux et apaisé. Ce n'est pas fuir les désaccords : c'est pouvoir les vivre sans cris, sans piques, sans tension qui dure. La paix est ton terreau.",
      "partner": "Quelqu'un de calme, gentil dans ses mots, qui sait se disputer sans blesser, puis se réconcilier.",
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
      "title": "Recharge à deux, en douceur",
      "short": "dans des moments doux à deux",
      "couple": "Tu reprends des forces juste en étant avec l'autre, tranquille, sans rien de prévu.",
      "fit": "Un partenaire disponible pour des soirées simples, téléphone rangé.",
      "risk": "Un partenaire toujours ailleurs, absorbé par son travail ou ses sorties."
    },
    "sensoriel": {
      "title": "Recharge par le corps et le concret",
      "short": "par le corps, la nature et le concret",
      "couple": "Tu te recharges en faisant : bouger, cuisiner, marcher, créer avec tes mains.",
      "fit": "Un partenaire partant pour faire des choses avec toi, ou qui te laisse les faire de ton côté.",
      "risk": "Un partenaire collé à ses écrans, qui trouve tes activités inutiles."
    },
    "evasion": {
      "title": "Recharge par l'évasion",
      "short": "en t'évadant dans les idées et les histoires",
      "couple": "Tu te recharges en explorant : lire, découvrir, rêver, parler d'idées.",
      "fit": "Un partenaire curieux, avec qui partager une découverte, ou qui respecte ta bulle.",
      "risk": "Un partenaire qui se moque de tes centres d'intérêt ou coupe sans cesse ta bulle."
    },
    "elan": {
      "title": "Recharge avec du monde",
      "short": "avec du monde et du mouvement",
      "couple": "Tu te recharges en voyant du monde : sorties, amis, soirées animées.",
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
        "Remarque les mots gentils quand ils arrivent, et dis merci : on a plus envie de recommencer quand c'est bien reçu.",
        "Si les reproches sont fréquents, demande qu'ils portent sur un fait précis, jamais sur ta personne."
      ],
      "partnerHint": "te dit ce qu'il ou elle ressent, et ce qu'il ou elle aime chez toi"
    },
    "moments": {
      "name": "Les moments de qualité",
      "lower": "les moments de qualité",
      "recv": "Pour toi, l'amour, c'est être là. Pas juste dans la même pièce : vraiment là, sans écran, à l'écoute. Une soirée où l'autre t'écoute pour de vrai vaut plus qu'un beau cadeau. Quand on te fait passer après, encore et encore, tu finis par douter de compter.",
      "tips": [
        "Propose un rendez-vous fixe, même court : 30 minutes par jour sans téléphone, ou une soirée par semaine rien qu'à deux.",
        "Dis ce qui compte : « Quand tu poses ton téléphone pour m'écouter, je me sens aimé·e. »",
        "Repère les moments partagés qui existent déjà (un café, un trajet) et profites-en vraiment."
      ],
      "partnerHint": "prend du temps pour toi et t'écoute vraiment, sans téléphone"
    },
    "cadeaux": {
      "name": "Les cadeaux",
      "lower": "les cadeaux et les attentions",
      "recv": "Ce n'est pas une question de prix. Ce qui te touche, c'est la preuve que l'autre a pensé à toi : un petit mot, un objet trouvé en route, une attention pour une date qui compte. Un oubli, surtout répété, peut te faire sentir invisible.",
      "tips": [
        "Explique que ce n'est pas matériel : « Un petit rien qui prouve que tu as pensé à moi me touche énormément. »",
        "Partage tes dates importantes et quelques idées simples : on ne devine pas toujours.",
        "Garde une trace des attentions reçues (une boîte, une photo) : ça fait du bien de les retrouver les jours difficiles."
      ],
      "partnerHint": "pense à toi et te le montre par de petites attentions"
    },
    "services": {
      "name": "Les services rendus",
      "lower": "les services rendus",
      "recv": "Pour toi, l'amour se voit dans les actes. Quand l'autre s'occupe d'une corvée sans qu'on le lui demande, pense à ce qui te pèse, partage vraiment le quotidien, tu te sens aimé·e. Les belles paroles sans actes, par contre, ça sonne creux.",
      "tips": [
        "Dis précisément ce qui t'aiderait : « Si tu t'occupes des courses le samedi, je me sens soutenu·e. »",
        "Dis merci pour les coups de main, et explique que c'est comme ça que tu te sens aimé·e.",
        "Si la charge est déséquilibrée depuis longtemps, mets le sujet sur la table calmement, liste à l'appui."
      ],
      "partnerHint": "met la main à la pâte et partage vraiment le quotidien"
    },
    "toucher": {
      "name": "Le toucher physique",
      "lower": "le toucher",
      "recv": "Pour toi, le contact physique passe avant tout : une main tenue, un câlin, une caresse en passant. Ça te rassure et te rapproche de l'autre, et pas seulement au lit. Un partenaire peu tactile peut te donner l'impression d'être rejeté·e, même s'il t'aime.",
      "tips": [
        "Dis-le simplement : « Un câlin le matin, ta main dans la mienne, c'est ce qui me rassure le plus. »",
        "Propose des gestes du quotidien, pas seulement des moments intimes.",
        "Si l'autre est peu tactile, cherche ensemble des gestes qui lui conviennent aussi, sans forcer."
      ],
      "partnerHint": "aime les câlins et en donne sans que tu aies à demander"
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
        "piege": "faire passer ton image ou ton travail avant ton couple"
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
        "couple": "En couple, tu apportes du calme, de la loyauté et un regard juste, et tu as besoin d'un partenaire qui respecte ton besoin d'être seul·e par moments.",
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
        "piege": "prendre trop de place, et croire que parler fort, c'est avoir raison"
      },
      "t9": {
        "n": 9,
        "name": "le Médiateur",
        "couple": "En couple, tu apportes de la douceur et de l'apaisement, et tu as besoin d'un partenaire qui s'intéresse vraiment à ce que tu veux.",
        "piege": "t'effacer pour éviter le conflit"
      }
    },
    "disclaimer": "L'ennéagramme est une hypothèse de départ, pas une étiquette. Trois écrans ne suffisent pas à trouver ton type avec certitude : prends ce résultat comme une piste à explorer, idéalement avec quelqu'un qui connaît bien l'ennéagramme.",
    "credit": "L'ennéagramme décrit 9 motivations de base et 3 instincts (conservation, social, tête-à-tête).",
    "stressHint": "Ta réaction sous stress fort va dans le même sens que ta piste.",
    "confidenceOne": "C'est ta piste principale, à confirmer avec le temps.",
    "confidenceMany": "Tu hésites entre {typeLabel} et {altLabel} : garde les deux pistes ouvertes."
  },
  "instincts": {
    "sp": {
      "name": "conservation",
      "desc": "Tu penses d'abord au confort, à la sécurité matérielle, au bien-être de tous les jours.",
      "couple": "En couple, tu construis un nid : un foyer, des habitudes, une sécurité concrète."
    },
    "so": {
      "name": "social",
      "desc": "Tu penses d'abord au groupe : faire partie d'un cercle, trouver ta place parmi les autres.",
      "couple": "En couple, tu as besoin que votre histoire fasse partie d'une vie plus large, avec des amis, de la famille, un entourage."
    },
    "sx": {
      "name": "tête-à-tête",
      "desc": "Tu cherches d'abord un lien fort avec une personne : l'attirance, l'étincelle.",
      "couple": "En couple, tu cherches l'attirance, la fusion et des échanges intenses, rien que vous deux."
    }
  },
  "instinctPairs": {
    "sp-sp": "Deux « conservation » : un foyer stable et rassurant. Le risque : que la routine et le confort remplacent le désir. Prévoyez de la nouveauté à deux.",
    "so-so": "Deux « social » : une vie riche d'amis et de projets communs. Le risque : ne plus avoir de temps rien qu'à deux. Protégez des moments intimes.",
    "sx-sx": "Deux « tête-à-tête » : un lien intense, presque magnétique. Le risque : les montagnes russes et la jalousie. Gardez des repères stables.",
    "sp-so": "Conservation et social : l'un rêve de cocon, l'autre de monde. Bien vécu, c'est un bel équilibre entre foyer et ouverture. Mal vécu, l'un se sent seul à la maison et l'autre enfermé.",
    "sp-sx": "Conservation et tête-à-tête : l'un cherche la sécurité, l'autre l'intensité. Ensemble, vous pouvez allier stabilité et passion, si l'un ne vit pas l'autre comme « trop calme » ou « trop intense ».",
    "so-sx": "Social et tête-à-tête : l'un s'épanouit en groupe, l'autre veut l'exclusivité. Le sujet qui fâche, c'est souvent les soirées entre amis. Un accord simple aide, par exemple une sortie à plusieurs, puis une soirée rien qu'à deux."
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
        "text": "Sous pression, tu passes à l'action et tu tranches. C'est une force, tant que l'autre a le temps de suivre.",
        "partner": "Un partenaire qui ose te dire « attends » sans s'écraser."
      },
      "I": {
        "short": "dédramatises",
        "text": "Tu détends l'atmosphère en parlant, en plaisantant. Attention à ne pas passer à côté de ce qui compte.",
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
        "partner": "Un partenaire qui entend tes arguments, et à qui tu laisses de la place pour ses émotions."
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
      "antidote": "Dire ce que tu ressens avec douceur, ce n'est pas blesser. Te taire, à la longue, fait plus de mal."
    },
    "moment": {
      "short": "attendre le bon moment",
      "antidote": "Choisis un jour cette semaine, et note-le maintenant. Le bon moment, c'est celui que tu décides."
    },
    "espoir": {
      "short": "espérer que l'autre change",
      "antidote": "Regarde ce que l'autre fait aujourd'hui, pas ce qu'il pourrait devenir. Fie-toi aux actes."
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
      "antidote": "Relis tes 3 non-négociables : quand tu doutes, ce sont eux qui te guident."
    },
    "regard": {
      "short": "le regard des autres",
      "antidote": "C'est toi qui vis ta relation, chaque jour. Demande-toi : « Qu'est-ce que je choisirais si personne ne savait ? »"
    },
    "contraintes": {
      "short": "les contraintes matérielles",
      "antidote": "D'abord tu décides, ensuite tu t'organises, étape par étape. Pas besoin de tout régler avant de choisir."
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
    "Le coup de cœur et l'attirance ne suffisent pas. Ils disent « tu me plais », pas « on peut être heureux ensemble ».",
    "On peut être amoureux·se et malheureux·se. Ce n'est pas un paradoxe : c'est le signe qu'il te manque quelque chose d'essentiel.",
    "On ne change pas quelqu'un. Lui demander de changer, c'est lui demander d'arrêter d'être lui-même.",
    "La bonne question : est-ce que tu peux vivre avec ses défauts sur le long terme ? Si oui, c'est qu'ils ne touchent pas à l'essentiel pour toi.",
    "Pareils sur le fond, différents dans la forme : les mêmes valeurs, mais des talents différents, c'est souvent la recette d'un couple qui dure."
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
AMOUR_DATA.profil = {
    "version": 1,
    "order": [
      "securite",
      "profondeur",
      "admiration",
      "liberte",
      "harmonie",
      "complicite",
      "intensite"
    ],
    "besoins": {
      "securite": {
        "name": "Sécurité",
        "key": "J'ai besoin de savoir sur qui je peux compter.",
        "noun": "Ancre",
        "adj": "Fidèle",
        "lower": "la sécurité",
        "de": "de sécurité",
        "color": "#1F7A7A",
        "ink": "#17605F",
        "tint": "#E6F2F2",
        "dark": "#5FC4C4",
        "icon": "anchor",
        "who": "quelqu'un de constant, qui tient parole et aime les repères",
        "s1": "aimes en construisant du solide, avec quelqu'un sur qui tu peux compter",
        "secNeed": "de pouvoir compter sur l'autre, dans la durée",
        "bloomShort": "l'autre tient parole et que vous faites des projets ensemble",
        "fadeShort": "le flou s'installe et que les promesses restent en l'air",
        "bloom": "Tu donnes le meilleur de toi dans une relation stable, où chacun fait ce qu'il dit. La régularité ne t'ennuie pas : elle te détend. Quand tu sais où vous allez, tu arrêtes d'être sur tes gardes et tu montres toute ta tendresse.",
        "bloomList": [
          "Un ou une partenaire qui prévient quand il ou elle a un empêchement, sans que tu aies à demander.",
          "Des projets décidés à deux : un voyage réservé, un appart, une date dans l'agenda.",
          "Des rituels qui reviennent : le message du soir, le dîner du dimanche."
        ],
        "secBloom": "tu as aussi besoin de repères, et que l'autre tienne parole",
        "fade": "Ce qui t'use, ce n'est pas un grand drame, c'est l'incertitude qui dure. Un message sans réponse, un projet repoussé, une humeur imprévisible, et tu te mets sur tes gardes. Tu poses des questions, tu surveilles, et l'autre peut croire que tu le contrôles, alors que tu as juste besoin d'être rassuré·e.",
        "fadeList": [
          "Les plans qui changent au dernier moment, sans explication.",
          "« On verra », comme seule réponse à « on va où, nous deux ? ».",
          "Un ou une partenaire chaleureux·se un jour, distant·e le lendemain."
        ],
        "alarm": "Si tu te surprends à vérifier, relancer ou deviner l'humeur de l'autre plusieurs fois par jour, ce n'est pas toi qui es « trop » : c'est ton besoin de sécurité qui tire la sonnette d'alarme.",
        "secFade": "le flou qui dure finit toujours par te peser",
        "rel": {
          "rythme": "Un rythme régulier, avec des rendez-vous qui reviennent. L'imprévu te va s'il reste l'exception.",
          "proximite": "Une proximité stable : se voir souvent, se donner des nouvelles, sans forcément tout faire ensemble.",
          "independance": "Chacun peut avoir sa vie, à condition que les règles soient claires : qui fait quoi, quand on se voit, ce qui reste à deux.",
          "conflits": "Tu as besoin que les conflits se terminent par une décision claire. Une dispute laissée en suspens te travaille des jours."
        },
        "secCond": "des engagements tenus, même petits",
        "partnerFond": "quelqu'un de constant, qui rassure par ses actes plus que par ses promesses",
        "sayPartner": [
          "« J'ai besoin de savoir que je peux compter sur toi. Quand tu fais ce que tu dis, je me détends. »",
          "« Si tu as un empêchement, préviens-moi, même d'un mot. Ça change tout pour moi. »",
          "« J'aimerais qu'on parle de nos projets pour l'année qui vient. »"
        ],
        "sayDate": [
          "« J'aime bien savoir où on va, sans se presser pour autant. »",
          "Une question à poser : « Qu'est-ce qui compte le plus pour toi dans une relation qui dure ? »"
        ],
        "trigger": "tu sens que le lien n'est plus sûr : un silence, un doute, une promesse oubliée",
        "calm": "une phrase qui te rassure sur vous deux, avant de chercher une solution"
      },
      "profondeur": {
        "name": "Profondeur",
        "key": "J'ai besoin qu'on me connaisse vraiment, pas seulement qu'on m'aime.",
        "noun": "Miroir",
        "adj": "Profond·e",
        "lower": "la profondeur",
        "de": "de profondeur",
        "color": "#5B4BA0",
        "ink": "#4A3C8A",
        "tint": "#EEEBF7",
        "dark": "#A99BE6",
        "icon": "waves",
        "who": "quelqu'un qui aime les vraies conversations et ose parler de ce qu'il ressent",
        "s1": "aimes en profondeur, avec de vraies conversations et le cœur ouvert",
        "secNeed": "de pouvoir tout dire, même ce qui te rend fragile",
        "bloomShort": "tu peux tout dire et que l'autre cherche vraiment à te comprendre",
        "fadeShort": "la relation reste en surface et qu'on ne parle pas de ce qu'on ressent",
        "bloom": "Tu t'épanouis quand tu peux tout dire à l'autre. Une soirée à parler de vos rêves et de vos peurs te fait plus de bien qu'un grand restaurant. Quand tu te sens compris·e, tu es d'une fidélité et d'une écoute rares.",
        "bloomList": [
          "Un ou une partenaire qui pose des questions et écoute la réponse jusqu'au bout.",
          "Des conversations qui durent tard, sans téléphone sur la table.",
          "Le droit d'être triste, inquiet·e ou ému·e sans être jugé·e."
        ],
        "secBloom": "tu as aussi besoin de vraies conversations, pas seulement de bons moments",
        "fade": "Ce qui t'éteint, c'est de te sentir seul·e à deux. Un ou une partenaire qui change de sujet, se moque de ta sensibilité ou a toujours la tête ailleurs, et tu restes seul·e avec ce que tu vis. Peu à peu, tu te tais, et la relation se vide sans bruit.",
        "fadeList": [
          "« Tu te prends la tête » en réponse à ce qui te touche.",
          "Des silences qui durent des jours après une dispute.",
          "Un ou une partenaire présent·e physiquement, absent·e dans sa tête."
        ],
        "alarm": "Si tu te surprends à garder pour toi ce qui compte le plus, parce que « de toute façon, il ou elle ne comprendra pas », ton besoin de profondeur n'est plus nourri.",
        "secFade": "une relation qui reste en surface finit par te laisser seul·e à deux",
        "rel": {
          "rythme": "Un rythme qui laisse le temps de se parler vraiment : moins de sorties, plus de vrais moments.",
          "proximite": "Être très proches dans le cœur : savoir ce que l'autre vit, ressent, espère.",
          "independance": "Tu acceptes la distance physique, pas la distance du cœur. Ton ou ta partenaire peut voyager, tant qu'il ou elle te raconte.",
          "conflits": "Tu as besoin de parler jusqu'à comprendre. Une dispute qu'on balaie sans s'expliquer, tu la gardes en toi."
        },
        "secCond": "des moments réguliers pour vraiment se parler",
        "partnerFond": "quelqu'un qui s'intéresse à ce qui se passe en toi, et qui ose parler de ce qui se passe en lui ou en elle",
        "sayPartner": [
          "« Ce soir, j'aimerais qu'on se parle vraiment. Pas de l'organisation : de nous. »",
          "« Quand je te raconte quelque chose qui me touche, j'ai juste besoin que tu m'écoutes jusqu'au bout. »",
          "« Dis-moi une chose que tu n'as encore jamais osé me dire. Je t'écoute, sans juger. »"
        ],
        "sayDate": [
          "« Je préfère une vraie conversation à dix sujets légers. »",
          "Une question à poser : « Qu'est-ce qui t'a le plus fait grandir ces dernières années ? »"
        ],
        "trigger": "tu te sens incompris·e, ou quand l'autre se ferme au lieu de parler",
        "calm": "être écouté·e sans être corrigé·e, même deux minutes"
      },
      "admiration": {
        "name": "Admiration",
        "key": "J'ai besoin de sentir que l'autre me remarque et me choisit.",
        "noun": "Étoile",
        "adj": "Brillant·e",
        "lower": "l'admiration",
        "de": "d'admiration",
        "color": "#C2417A",
        "ink": "#A2305F",
        "tint": "#F9E9F0",
        "dark": "#F08DB8",
        "icon": "sparkles",
        "who": "quelqu'un qui aime qu'on le ou la remarque, et qui sait faire des compliments en retour",
        "s1": "aimes avec chaleur, et tu t'illumines quand l'autre est fier·e de toi",
        "secNeed": "que l'autre soit fier·e de toi",
        "bloomShort": "l'autre est fier·e de toi et te le dit",
        "fadeShort": "personne ne remarque tes efforts et que tout ce que tu fais semble normal",
        "bloom": "Tu t'épanouis quand tu te sens choisi·e, chaque jour, et pas seulement au début. Un mot de fierté, un merci sincère, un compliment devant tes amis te donnent des ailes. Ce n'est pas de la vanité : c'est la preuve que l'autre te voit vraiment.",
        "bloomList": [
          "Un ou une partenaire qui remarque tes efforts, et qui le dit.",
          "Être soutenu·e dans tes projets, surtout quand tu doutes.",
          "Des attentions qui montrent que tu comptes, pas seulement des habitudes."
        ],
        "secBloom": "tu as aussi besoin de mots de fierté et de reconnaissance",
        "fade": "Ce qui te fait mal, c'est l'indifférence. Quand tout ce que tu fais devient normal, quand on te critique plus qu'on ne te remercie, tu en fais toujours plus pour qu'on te remarque enfin. Ou alors tu te fermes, blessé·e, sans rien dire.",
        "fadeList": [
          "Les critiques répétées, surtout devant les autres.",
          "Tes réussites accueillies par un « ah, bien » distrait.",
          "Porter seul·e la charge du quotidien, sans un merci."
        ],
        "alarm": "Si tu te surprends à en faire toujours plus en espérant un regard qui ne vient pas, ton besoin d'admiration est à sec.",
        "secFade": "l'indifférence finit par t'éteindre, même dans une relation stable",
        "rel": {
          "rythme": "Un rythme vivant, avec des moments où l'on se met en valeur : un dîner, une sortie, une fête.",
          "proximite": "Une proximité qui se voit : des gestes, des mots, une fierté affichée, y compris devant les autres.",
          "independance": "Tu aimes avoir tes projets, et que l'autre s'y intéresse. Tu as besoin d'un soutien, pas d'un public.",
          "conflits": "Tu as besoin qu'on critique un acte, jamais ta personne. Une remarque blessante devant les autres te marque longtemps."
        },
        "secCond": "des mots de fierté et de merci, souvent",
        "partnerFond": "quelqu'un qui sait dire « bravo » et « merci », et qui est fier·e de toi devant les autres",
        "sayPartner": [
          "« Ça me ferait du bien que tu me dises ce que tu apprécies chez moi. »",
          "« Quand tu remarques ce que j'ai fait, j'ai envie d'en faire encore plus pour nous. »",
          "« J'ai besoin que tu sois fier·e de moi, et que tu me le dises, même simplement. »"
        ],
        "sayDate": [
          "« Ce qui me touche le plus, c'est qu'on remarque les efforts, même petits. »",
          "Une question à poser : « De quoi es-tu le plus fier ou la plus fière en ce moment ? »"
        ],
        "trigger": "tu te sens critiqué·e, comparé·e ou oublié·e",
        "calm": "entendre ce qui a de la valeur en toi, avant d'entendre ce qui ne va pas"
      },
      "liberte": {
        "name": "Liberté",
        "key": "J'ai besoin d'air pour aimer pleinement.",
        "noun": "Oiseau",
        "adj": "Libre",
        "lower": "la liberté",
        "de": "de liberté",
        "color": "#2F80C0",
        "ink": "#1F5F96",
        "tint": "#E7F1F9",
        "dark": "#7DB9EA",
        "icon": "feather",
        "who": "quelqu'un qui a sa propre vie et laisse de l'air",
        "s1": "aimes en restant toi-même, avec de l'espace pour respirer",
        "secNeed": "de garder une vie à toi",
        "bloomShort": "l'autre te fait confiance et te laisse respirer",
        "fadeShort": "tu dois te justifier de tout et que la relation t'enferme",
        "bloom": "Tu t'épanouis dans une relation où chacun garde sa vie : tes amis, tes projets, tes moments seul·e. Plus tu te sens libre, plus tu reviens vers l'autre avec envie. Ce n'est pas un manque d'amour, c'est ta façon d'aimer sans t'éteindre.",
        "bloomList": [
          "Une soirée seul·e ou entre amis, sans culpabilité ni interrogatoire au retour.",
          "Un ou une partenaire qui a sa propre vie et ses propres passions.",
          "Des décisions prises à deux, sans contrôle ni comptes à rendre."
        ],
        "secBloom": "tu as aussi besoin de moments rien qu'à toi",
        "fade": "Ce qui t'éteint, c'est de te sentir surveillé·e ou retenu·e. Les « tu étais où ? », la jalousie, le « on fait tout ensemble » te serrent la gorge. Tu commences par t'éloigner en pensée, puis tu cherches une sortie, même si tu aimes l'autre.",
        "fadeList": [
          "Devoir rendre des comptes sur ton emploi du temps.",
          "La jalousie à chaque sortie entre amis.",
          "Un agenda rempli à deux, sans qu'on te demande ton avis."
        ],
        "alarm": "Si tu te surprends à rêver de soirées seul·e comme d'une évasion, ou à mentir sur des choses anodines pour avoir la paix, ton besoin de liberté étouffe.",
        "secFade": "une relation qui t'enferme finit par te faire fuir",
        "rel": {
          "rythme": "Un rythme souple, avec des temps forts ensemble et des temps pour toi, sans avoir à t'en excuser.",
          "proximite": "Être proches parce que vous en avez envie, pas par obligation : tu reviens vers l'autre parce que ça te fait plaisir.",
          "independance": "Forte : tes amis, tes projets, ton argent, ton temps. Tu veux un ou une partenaire, pas un emploi du temps partagé.",
          "conflits": "Tu as besoin de recul avant d'en parler. Coincé·e dans une discussion, tu t'échappes ; avec un peu d'air, tu reviens avec des solutions."
        },
        "secCond": "du temps pour toi, sans avoir à te justifier",
        "partnerFond": "quelqu'un qui a sa propre vie, qui te fait confiance et ne vit pas tes temps seuls comme un abandon",
        "sayPartner": [
          "« Quand je prends du temps pour moi, ce n'est pas contre toi. C'est comme ça que je reviens vers toi avec envie. »",
          "« J'ai besoin que tu me fasses confiance, sans que j'aie à tout expliquer. »",
          "« On peut se voir un peu moins, mais mieux. Qu'est-ce qui te ferait plaisir pour nos soirées à deux ? »"
        ],
        "sayDate": [
          "« J'aime les relations où chacun garde sa vie, et où l'on se retrouve parce qu'on en a envie. »",
          "Une question à poser : « Qu'est-ce que tu fais quand tu as une journée rien qu'à toi ? »"
        ],
        "trigger": "tu te sens coincé·e, contrôlé·e ou pressé·e de répondre",
        "calm": "un peu d'espace, et la certitude qu'on en reparlera plus tard"
      },
      "harmonie": {
        "name": "Harmonie",
        "key": "J'ai besoin de douceur et de paix entre nous.",
        "noun": "Oasis",
        "adj": "Paisible",
        "lower": "l'harmonie",
        "de": "d'harmonie",
        "color": "#5E8C4A",
        "ink": "#446A35",
        "tint": "#EDF4E9",
        "dark": "#9CCB84",
        "icon": "leaf",
        "who": "quelqu'un de doux, qui cherche la paix et la tendresse",
        "s1": "aimes avec douceur, et tu crées autour de toi un vrai cocon",
        "secNeed": "d'un quotidien doux, sans cris ni piques",
        "bloomShort": "le quotidien est doux et que les désaccords se disent sans cris",
        "fadeShort": "les piques et les tensions deviennent ordinaires",
        "bloom": "Tu t'épanouis dans une relation tendre et apaisée. Les petits gestes de tous les jours, une main dans le dos, une soirée tranquille, te font un bien fou. Dans ce climat-là, tu offres une douceur et une gentillesse qui font du bien à tout le monde.",
        "bloomList": [
          "Des soirées calmes, à deux, sans tension dans l'air.",
          "La tendresse au quotidien : un câlin en passant, un mot doux.",
          "Des désaccords qui se disent calmement, puis une vraie réconciliation."
        ],
        "secBloom": "tu as aussi besoin de calme et de tendresse au quotidien",
        "fade": "Ce qui t'épuise, ce sont les éclats de voix, l'ironie, les tensions qui durent. Pour éviter le conflit, tu arrondis les angles, tu te tais, tu t'adaptes. Les non-dits s'accumulent, jusqu'au jour où tu pars sans que l'autre ait rien vu venir.",
        "fadeList": [
          "Les cris, les piques, l'ironie qui blesse.",
          "Une ambiance tendue qui dure des jours.",
          "Devoir toujours céder pour que la paix revienne."
        ],
        "alarm": "Si tu te surprends à te taire pour éviter une dispute, encore et encore, ton besoin d'harmonie t'empêche de dire ce que tu penses.",
        "secFade": "les tensions qui durent finissent par t'épuiser",
        "rel": {
          "rythme": "Un rythme doux et prévisible, avec des soirées calmes et des moments de tendresse.",
          "proximite": "Une proximité tendre : des gestes, de la douceur, une présence qui apaise.",
          "independance": "Moyenne : tu aimes partager beaucoup de choses, sans être collé·e à l'autre, tant que l'ambiance reste paisible.",
          "conflits": "Tu as besoin de désaccords sans cris ni piques. Parler calmement, au bon moment, puis se réconcilier vraiment."
        },
        "secCond": "des désaccords sans cris ni piques",
        "partnerFond": "quelqu'un de calme et de doux, qui sait se disputer sans blesser, puis se réconcilier",
        "sayPartner": [
          "« J'ai besoin qu'on puisse être en désaccord sans hausser le ton. »",
          "« Un câlin en rentrant, ça change toute ma soirée. »",
          "« Je ne dis pas toujours quand quelque chose me gêne. Si tu me sens loin, demande-moi doucement. »"
        ],
        "sayDate": [
          "« Ce que j'aime le plus, c'est quand on se sent bien ensemble, simplement. »",
          "Une question à poser : « Comment fais-tu quand tu n'es pas d'accord avec quelqu'un que tu aimes ? »"
        ],
        "trigger": "le ton monte, ou quand tu sens une tension que personne ne nomme",
        "calm": "une voix calme et un geste doux, avant toute discussion"
      },
      "complicite": {
        "name": "Complicité",
        "key": "J'ai besoin de rire et de faire équipe avec toi.",
        "noun": "Équipe",
        "adj": "Joueur·euse",
        "lower": "la complicité",
        "de": "de complicité",
        "color": "#B87500",
        "ink": "#8F5D00",
        "tint": "#FBF1DF",
        "dark": "#F2B84B",
        "icon": "laugh",
        "who": "quelqu'un qui aime rire, faire équipe et partager le quotidien",
        "s1": "aimes en équipe, avec du rire et des projets partagés",
        "secNeed": "de rire et de faire équipe au quotidien",
        "bloomShort": "vous riez ensemble et que vous avancez comme une équipe",
        "fadeShort": "tout devient lourd et que tu portes seul·e le quotidien",
        "bloom": "Tu t'épanouis quand le couple est une équipe joyeuse. Des blagues que personne d'autre ne comprend, des petits projets, des tâches partagées sans compter : pour toi, c'est ça, l'amour. Dans une relation légère où l'on se serre les coudes, tu es un ou une partenaire plein·e d'énergie et de bonne humeur.",
        "bloomList": [
          "Des fous rires et des blagues que personne d'autre ne comprend.",
          "Des tâches partagées sans avoir à négocier.",
          "Des petits projets à deux : une recette, un week-end, un meuble à monter."
        ],
        "secBloom": "tu as aussi besoin de rire et de faire des choses ensemble",
        "fade": "Ce qui te plombe, c'est quand tout devient lourd. Les reproches permanents, le sérieux du matin au soir, la charge du quotidien qui repose sur toi te vident. Tu perds ta joie, tu deviens irritable, et tu finis par chercher la légèreté ailleurs.",
        "fadeList": [
          "Porter seul·e les courses, les rendez-vous, l'organisation.",
          "Un ou une partenaire qui ne rit plus à tes blagues.",
          "Des bouderies qui durent, au lieu de régler et de passer à autre chose."
        ],
        "alarm": "Si tu te surprends à préférer rire avec tes amis plutôt qu'avec ton ou ta partenaire, ton besoin de complicité est en panne.",
        "secFade": "un quotidien sans rire ni entraide finit par te vider",
        "rel": {
          "rythme": "Un rythme animé : des rires, des sorties, des idées, des petits projets à deux.",
          "proximite": "Être proches comme des coéquipiers : faire ensemble, partager les tâches, se raconter les petites choses.",
          "independance": "Tu aimes faire beaucoup à deux, mais pas tout. Chacun peut avoir ses amis, tant que vous restez une équipe.",
          "conflits": "Tu as besoin de régler vite et de passer à autre chose. Une bouderie qui dure te pèse plus que la dispute elle-même."
        },
        "secCond": "du rire et des choses faites ensemble",
        "partnerFond": "quelqu'un qui aime rire, qui fait sa part sans compter et qui se vit comme ton coéquipier ou ta coéquipière",
        "sayPartner": [
          "« On fait une super équipe quand on rit ensemble. On se garde un moment pour ça cette semaine ? »",
          "« J'aimerais qu'on se répartisse les tâches autrement, pour que ce ne soit plus un sujet de tension. »",
          "« Tu te souviens de notre dernier fou rire ? J'en veux d'autres. »"
        ],
        "sayDate": [
          "« Pour moi, un couple, c'est d'abord une équipe qui rit ensemble. »",
          "Une question à poser : « Quel est ton plus beau fou rire ? »"
        ],
        "trigger": "tu te sens seul·e face aux problèmes, ou quand la bonne humeur disparaît",
        "calm": "un geste d'équipe : « on regarde ça ensemble »"
      },
      "intensite": {
        "name": "Intensité",
        "key": "J'ai besoin que notre histoire vibre.",
        "noun": "Volcan",
        "adj": "Passionné·e",
        "lower": "l'intensité",
        "de": "d'intensité",
        "color": "#D64534",
        "ink": "#B0352A",
        "tint": "#FBEAE8",
        "dark": "#F28B7D",
        "icon": "flame",
        "who": "quelqu'un qui aime l'élan, la passion et la nouveauté",
        "s1": "aimes avec passion, en cherchant ce qui fait vibrer",
        "secNeed": "que ça vibre encore, longtemps après le début",
        "bloomShort": "la relation garde du désir, de l'élan et de la nouveauté",
        "fadeShort": "la routine s'installe et que le désir s'endort",
        "bloom": "Tu t'épanouis dans une relation vivante, où l'on se désire, où l'on se surprend, où l'on ose. L'aventure à deux te fait vibrer : un voyage improvisé, un projet un peu fou, une soirée qui ne ressemble à aucune autre. Quand ça vibre, tu donnes une énergie et une générosité incroyables.",
        "bloomList": [
          "Te sentir désiré·e, longtemps après le début.",
          "Des surprises, des découvertes, des week-ends improvisés.",
          "Un ou une partenaire qui ose, qui propose, qui te bouscule un peu."
        ],
        "secBloom": "tu as aussi besoin d'élan, de surprise et de désir",
        "fade": "Ton ennemi, c'est la routine sans surprise. Les mêmes soirées, les mêmes conversations, un désir qui s'endort : tu t'éteins à petit feu. Le risque, c'est de chercher l'étincelle ailleurs, ou de créer des drames pour sentir que ça vit encore.",
        "fadeList": [
          "Les mêmes soirées, encore et encore.",
          "Un ou une partenaire qui ne propose jamais rien de nouveau.",
          "Un désir qui s'endort sans qu'on en parle."
        ],
        "alarm": "Si tu te surprends à provoquer une dispute pour ressentir quelque chose, ou à rêver d'une autre vie, ton besoin d'intensité n'est plus nourri.",
        "secFade": "la routine finit par éteindre ta flamme",
        "rel": {
          "rythme": "Un rythme qui change : de la nouveauté, des surprises, des projets qui font vibrer.",
          "proximite": "Une proximité forte, physique et émotionnelle. Tu as besoin de te sentir désiré·e, longtemps après le début.",
          "independance": "Tu as besoin de vivre tes propres aventures, puis de les partager avec passion.",
          "conflits": "Tu t'enflammes vite et tu pardonnes vite. Il te faut un ou une partenaire qui ne fuit pas l'intensité, sans entrer dans l'escalade."
        },
        "secCond": "de la nouveauté et du désir, régulièrement",
        "partnerFond": "quelqu'un qui ose, qui propose, qui garde le désir vivant et ne craint pas l'intensité",
        "sayPartner": [
          "« J'ai envie qu'on se surprenne encore. On s'organise une soirée qui ne ressemble à aucune autre ? »",
          "« Me sentir désiré·e, c'est ce qui me fait me sentir aimé·e. »",
          "« Quand on ose des choses nouvelles ensemble, je retombe amoureux·se de toi. »"
        ],
        "sayDate": [
          "« Ce qui me fait vibrer, c'est découvrir, oser, ne pas m'ennuyer. »",
          "Une question à poser : « Quelle est la chose la plus folle que tu aies faite sur un coup de tête ? »"
        ],
        "trigger": "tu sens l'autre s'éloigner, ou quand la relation devient tiède",
        "calm": "un vrai contact, un regard, une main tenue, plutôt qu'un long discours"
      }
    },
    "alliages": {
      "securite+profondeur": "Tu veux du solide et du vrai. Tu t'engages lentement, mais quand tu t'engages, c'est en profondeur : tu veux connaître l'autre et pouvoir compter sur lui. Ton défi : accepter de ne pas avoir toutes les réponses tout de suite.",
      "securite+admiration": "Tu as besoin d'un lien fiable et d'un regard qui te valorise. Tu donnes beaucoup pour que la relation tienne, et tu as besoin que ce soit vu. Ton défi : demander la reconnaissance au lieu d'attendre qu'elle vienne seule.",
      "securite+liberte": "Tu veux un port d'attache et de l'air. C'est un mélange rare et précieux : une relation stable où chacun garde sa vie. Ton défi : dire clairement tes deux besoins, pour que l'autre ne croie pas que tu souffles le chaud et le froid.",
      "securite+harmonie": "Tu rêves d'un foyer doux et sûr. Tu apportes de la constance et de la paix, deux choses qui font du bien sur la durée. Ton défi : ne pas confondre paix et silence, et oser mettre les sujets sensibles sur la table.",
      "securite+complicite": "Tu veux une équipe solide qui rit ensemble. Pour toi, le couple, ce sont des projets et des fous rires, des rituels et des blagues. Ton défi : garder la légèreté, même quand l'organisation prend toute la place.",
      "securite+intensite": "Tu veux la flamme et le port d'attache. Tu as besoin que ça vibre, mais pas que ça tangue. Ton défi : accepter qu'une relation stable puisse aussi être intense, et qu'une relation intense ne soit pas forcément instable.",
      "profondeur+admiration": "Tu veux être vu·e vraiment, jusque dans ce que tu caches. Les compliments de surface ne te suffisent pas : tu veux être admiré·e pour qui tu es. Ton défi : te montrer aussi dans tes fragilités, c'est là que l'autre peut t'aimer en entier.",
      "profondeur+liberte": "Tu as une vie intérieure riche, et tu as besoin de temps seul·e pour en profiter. Tu aimes les conversations qui vont loin, puis te retrouver au calme. Ton défi : prévenir quand tu prends du recul, pour que l'autre ne le prenne pas pour un rejet.",
      "profondeur+harmonie": "Tu aimes avec douceur et sincérité. Tu écoutes, tu comprends, tu apaises. Ton défi : dire aussi ce qui te blesse, sans attendre que l'autre le devine.",
      "profondeur+complicite": "Tu veux pouvoir tout dire et tout rire avec la même personne. Tu passes d'une discussion profonde à un fou rire, et c'est ta force. Ton défi : ne pas utiliser l'humour pour esquiver ce qui fait mal.",
      "profondeur+intensite": "Tu aimes fort et en vrai. Tu cherches une connexion rare, des échanges qui marquent, une relation qui ne ressemble à aucune autre. Ton défi : laisser une place au calme, sans croire que l'amour faiblit.",
      "admiration+liberte": "Tu veux briller et rester libre. Tu as besoin d'un ou d'une partenaire fier·e de toi, qui ne te retient pas. Ton défi : offrir aussi ta présence, pour que l'autre ne se sente pas spectateur de ta vie.",
      "admiration+harmonie": "Tu as besoin de mots doux et d'un regard qui te valorise. Tu donnes beaucoup de gentillesse, et tu as besoin qu'elle te revienne. Ton défi : dire ce que tu attends, plutôt que de t'effacer en espérant être remarqué·e.",
      "admiration+complicite": "Tu veux un ou une partenaire qui t'encourage et qui rit avec toi. Tu mets de la vie et de la chaleur partout où tu passes. Ton défi : accepter les moments plus calmes sans croire que l'amour baisse.",
      "admiration+intensite": "Tu aimes avec panache. Tu veux te sentir désiré·e, choisi·e, admiré·e, et que ça se voie. Ton défi : te souvenir que la constance est aussi une preuve d'amour, même quand elle fait moins de bruit.",
      "liberte+harmonie": "Tu veux une relation légère, au bon sens du mot : sans pression, sans cris, sans contrôle. Tu laisses l'autre libre et tu attends la même chose. Ton défi : ne pas fuir les désaccords au nom de la paix.",
      "liberte+complicite": "Tu veux un ou une complice, pas quelqu'un qui te retient. Rire, partir, se retrouver : c'est ta façon d'aimer. Ton défi : accepter quelques règles, elles protègent votre liberté au lieu de la réduire.",
      "liberte+intensite": "Tu aimes l'aventure, la nouveauté, l'élan. Une relation, pour toi, c'est un voyage. Ton défi : rester quand l'excitation des débuts retombe, c'est souvent là que commence le plus beau.",
      "harmonie+complicite": "Tu veux un quotidien doux et joyeux. Tu crées une ambiance où l'on se sent bien, simplement. Ton défi : garder ta voix quand un sujet fâche, au lieu de tout arrondir.",
      "harmonie+intensite": "Tu veux la tendresse et la flamme. Tu as besoin de douceur au quotidien et de moments qui te font vibrer. Ton défi : accepter que l'intensité bouscule parfois la paix, et que ce n'est pas grave.",
      "complicite+intensite": "Tu veux une histoire vivante : rire, oser, surprendre. Avec toi, l'ennui n'a pas sa place. Ton défi : laisser aussi de la place aux moments simples et aux conversations sérieuses."
    },
    "couples": {
      "securite+complicite": {
        "type": "nourrit",
        "text": "Vous formez une vraie équipe : l'un pose les repères, l'autre met la bonne humeur. Les projets avancent, et on rit en chemin."
      },
      "admiration+complicite": {
        "type": "nourrit",
        "text": "Vous vous mettez en valeur l'un l'autre. Les encouragements, les rires et les sorties à deux vous font du bien à tous les deux."
      },
      "admiration+intensite": {
        "type": "nourrit",
        "text": "Vous vous admirez et vous vous désirez. Chacun se sent choisi, et la relation ne s'endort pas."
      },
      "liberte+intensite": {
        "type": "nourrit",
        "text": "Vous partagez le goût de l'aventure et le respect de l'espace de chacun. Personne ne retient l'autre, et c'est ce qui vous rapproche."
      },
      "liberte+harmonie": {
        "type": "nourrit",
        "text": "L'un a besoin d'air, l'autre de calme : vous vous laissez respirer sans tension. Les retrouvailles sont douces, sans reproches."
      },
      "profondeur+harmonie": {
        "type": "nourrit",
        "text": "Douceur et écoute : vous pouvez tout vous dire sans crainte. Le terrain idéal pour se confier et grandir ensemble."
      },
      "securite+profondeur": {
        "type": "nourrit",
        "text": "L'un veut du vrai, l'autre du solide : ensemble, vous construisez une confiance profonde. Les promesses sont tenues et les choses importantes sont dites."
      },
      "securite+liberte": {
        "type": "frotte",
        "text": "L'un cherche des repères, l'autre de l'air. Au début, ça s'équilibre. Puis viennent « tu n'es jamais là » et « tu m'étouffes ». À poser tôt : le rythme des rendez-vous et des nouvelles."
      },
      "admiration+liberte": {
        "type": "frotte",
        "text": "L'un vit sa vie, l'autre a besoin d'être regardé et célébré. Le risque : que l'un se sente oublié et l'autre surveillé. Ça marche avec des moments rien qu'à deux, annoncés et tenus."
      },
      "profondeur+admiration": {
        "type": "frotte",
        "text": "L'un a besoin de briller et d'être reconnu, l'autre de vérité et d'intimité. Le risque : que l'un trouve l'autre trop grave, et l'autre trop superficiel. Ça marche si chacun dit ce qu'il admire chez l'autre."
      },
      "profondeur+complicite": {
        "type": "frotte",
        "text": "L'un veut parler du fond, l'autre préfère alléger. Au début, c'est charmant. Puis viennent « tu fuis tout dans l'humour » et « tu dramatises ». Ça marche avec des temps pour rire et des temps pour parler, sans les mélanger."
      },
      "harmonie+complicite": {
        "type": "frotte",
        "text": "L'un veut de l'animation, l'autre de la tranquillité. Le soir, le week-end, les invitations deviennent des sujets. Ça marche si chacun garde ses sorties ou ses soirées calmes, sans culpabiliser."
      },
      "harmonie+intensite": {
        "type": "frotte",
        "text": "L'un cherche la paix, l'autre l'étincelle. Ce qui fait vibrer l'un épuise l'autre. Ça marche quand l'intensité passe par la passion et la nouveauté, jamais par les disputes."
      },
      "securite+intensite": {
        "type": "frotte",
        "text": "L'un veut que ça vibre, l'autre que ça tienne. Le premier trouve le second trop calme, le second trouve le premier trop instable. Ça marche si l'aventure se prévoit un peu, et si la routine accepte des surprises."
      },
      "securite+harmonie": {
        "type": "proche",
        "text": "Même besoin de paix et de stabilité : la vie à deux est simple. Veillez à ne pas laisser la routine endormir le désir."
      },
      "securite+admiration": {
        "type": "proche",
        "text": "L'un donne de la constance, l'autre de la chaleur dans les mots. Ça roule, à condition de se dire merci souvent."
      },
      "profondeur+liberte": {
        "type": "proche",
        "text": "Vous avez tous les deux besoin de temps à vous et d'une vie intérieure riche. Vous vous comprenez sans avoir à vous justifier. Veillez à garder des moments vraiment partagés."
      },
      "liberte+complicite": {
        "type": "proche",
        "text": "Légèreté et liberté : on se sent bien, sans pression. Veillez à poser quand même des projets communs."
      },
      "admiration+harmonie": {
        "type": "proche",
        "text": "Gentillesse et mots qui valorisent : vous savez vous faire du bien. Veillez à oser les désaccords."
      },
      "profondeur+intensite": {
        "type": "proche",
        "text": "Un lien fort, presque magnétique. Veillez à garder des repères stables pour éviter les montagnes russes."
      },
      "complicite+intensite": {
        "type": "proche",
        "text": "Une relation vivante, pleine d'idées et de fous rires. Veillez à garder une place pour le sérieux et le repos."
      },
      "securite+securite": {
        "type": "miroir",
        "text": "Deux profils Sécurité : un foyer solide, vite. Prévoyez de la nouveauté à deux, pour que le confort ne remplace pas le désir."
      },
      "profondeur+profondeur": {
        "type": "miroir",
        "text": "Deux profils Profondeur : des conversations sans fin, une intimité rare. Pensez aussi à vous amuser et à alléger."
      },
      "admiration+admiration": {
        "type": "miroir",
        "text": "Deux profils Admiration : vous savez vous valoriser. Attention à ne pas vous disputer la lumière."
      },
      "liberte+liberte": {
        "type": "miroir",
        "text": "Deux profils Liberté : aucune pression, beaucoup de respect. Attention à ne pas devenir colocataires."
      },
      "harmonie+harmonie": {
        "type": "miroir",
        "text": "Deux profils Harmonie : une douceur de chaque instant. Attention aux non-dits qui s'accumulent, parce que personne n'ose se disputer."
      },
      "complicite+complicite": {
        "type": "miroir",
        "text": "Deux profils Complicité : une équipe joyeuse. Attention à ne pas fuir les sujets sérieux."
      },
      "intensite+intensite": {
        "type": "miroir",
        "text": "Deux profils Intensité : une passion magnétique. Attention aux montagnes russes et à la jalousie."
      }
    },
    "encyclo": {
      "regle": "Les 7 familles sont les 7 besoins du profil : Sécurité, Profondeur, Admiration, Liberté, Harmonie, Complicité, Intensité. Une paire relie deux familles, y compris une famille avec elle-même : 21 paires mixtes et 7 paires miroir, donc 28. Le classement reprend le type déjà posé dans profil.couples, sans changer le score. nourrit : les deux besoins se nourrissent. proche : ils se ressemblent, avec un point à garder vivant. miroir : le même besoin des deux côtés, une belle résonance et un angle mort. Ces trois types vont dans « Avec qui ça coule de source ». frotte : les besoins tirent dans deux sens. Ce type va dans « Ce qui demande de l'attention ». Chaque paire a un conseil : quoi surveiller, et comment faire tenir le lien. On ne condamne jamais une rencontre.",
      "openAll": "Découvrir tous les profils",
      "close": "Fermer",
      "nourritLab": "Ce qui te nourrit",
      "videLab": "Ce qui te vide",
      "nuancesLab": "Les 6 couleurs de ce profil",
      "couleLab": "Avec qui ça coule de source",
      "attentionLab": "Ce qui demande de l'attention",
      "tipLab": "Le geste qui aide",
      "sameLab": "Même famille",
      "cards": {
        "securite": {
          "portrait": "Tu as besoin de savoir sur qui tu peux compter. Quand c'est clair, tu te détends, et c'est là que tu deviens vraiment tendre. Les habitudes ne t'enferment pas. Pour toi, elles prouvent que l'autre est là.",
          "nourrit": "Les promesses tenues, les petits rituels qui reviennent, parler ensemble de l'avenir.",
          "vide": "Ne pas savoir où on en est, les promesses qui restent des promesses, quelqu'un qui change d'humeur sans rien dire.",
          "nuances": {
            "profondeur": "Profond·e : tu veux du solide et du vrai. Tu t'engages quand tu connais vraiment la personne et que tu peux compter sur elle.",
            "admiration": "Brillant·e : on peut te faire confiance, et tu as besoin qu'on remarque tout ce que tu fais pour le couple.",
            "liberte": "Libre : tu veux une maison où revenir, et du temps pour toi. Une vie stable te va très bien, si chacun garde ses amis et ses activités.",
            "harmonie": "Paisible : tu rêves d'une maison douce et sûre. Le calme te fait du bien. Attention quand même, un silence ne veut pas toujours dire oui.",
            "complicite": "Joueur·euse : tu veux pouvoir compter sur l'autre, et rire avec. Les projets avancent mieux quand on ne se prend pas trop au sérieux.",
            "intensite": "Passionné·e : tu veux de la passion et de la stabilité. Que ce soit fort entre vous, oui, mais sans te demander chaque matin si l'autre va rester."
          }
        },
        "profondeur": {
          "portrait": "Tu aimes quand on peut tout se dire. Une vraie conversation te touche plus qu'un beau restaurant. Quand tu te sens compris·e, tu es d'une fidélité et d'une écoute rares.",
          "nourrit": "Qu'on t'écoute jusqu'au bout, pouvoir parler de ce qui te fait peur, sentir que l'autre cherche vraiment à te comprendre.",
          "vide": "Les conversations creuses, les sujets qu'on évite, te sentir seul·e alors que vous êtes deux.",
          "nuances": {
            "securite": "Fidèle : tu veux du vrai, et qui dure. Tu te confies plus facilement à quelqu'un qui tient parole.",
            "admiration": "Brillant·e : tu veux qu'on te voie vraiment, pas juste qu'on te fasse des compliments. Ce qui te touche, c'est qu'on admire qui tu es au fond.",
            "liberte": "Libre : tu as besoin de moments seul·e avec tes pensées. Quand tu peux t'isoler sans avoir à te justifier, tu reviens vers l'autre avec plaisir.",
            "harmonie": "Paisible : tu aimes parler vrai, mais sans crier. Quand l'autre reste doux, tu peux tout lui dire.",
            "complicite": "Joueur·euse : avec la même personne, tu peux parler de choses graves et finir en fou rire. L'humour te va, tant qu'il ne sert pas à éviter ce qui fait mal.",
            "intensite": "Passionné·e : tu aimes fort, et pour de vrai. Tu cherches une relation qui te marque, avec aussi des moments calmes."
          }
        },
        "admiration": {
          "portrait": "Tu t'épanouis quand l'autre te choisit, et pas seulement au début. Un vrai merci, un « je suis fier·e de toi », et tu te sens pousser des ailes. Ce n'est pas de la vanité, c'est ta façon de sentir que l'autre te voit.",
          "nourrit": "Qu'on remarque tes efforts, qu'on te dise bravo, qu'on soit fier·e de toi, même devant les autres.",
          "vide": "L'indifférence, les reproches à répétition, l'impression que plus personne ne remarque ce que tu fais.",
          "nuances": {
            "securite": "Fidèle : tu fais beaucoup pour que votre couple dure, et tu as besoin qu'on le remarque.",
            "profondeur": "Profond·e : les compliments faciles ne te suffisent pas. Tu veux qu'on t'admire pour qui tu es, même pour ce que tu montres peu.",
            "liberte": "Libre : tu veux briller sans qu'on te retienne. Ça te fait du bien qu'on soit fier·e de toi, à condition qu'on te laisse mener ta vie.",
            "harmonie": "Paisible : tu es gentil·le avec tout le monde, et tu as besoin qu'on te le rende avec des mots doux.",
            "complicite": "Joueur·euse : tu veux quelqu'un qui t'encourage et qui rit avec toi. Partout où tu passes, l'ambiance se réchauffe.",
            "intensite": "Passionné·e : tu aimes en grand. Te sentir désiré·e et choisi·e, et que ça se voie, c'est ce qui te fait vibrer."
          }
        },
        "liberte": {
          "portrait": "Tu aimes sans renoncer à ta vie. Voir tes amis, avoir tes projets, passer du temps seul·e, ça ne veut pas dire que tu aimes moins. Au contraire, plus tu te sens libre, plus tu as envie de revenir.",
          "nourrit": "La confiance, du temps pour toi, quelqu'un qui a aussi sa vie à côté.",
          "vide": "Devoir te justifier, la jalousie, un agenda rempli à deux sans qu'on t'ait demandé ton avis.",
          "nuances": {
            "securite": "Fidèle : tu veux ta liberté et un endroit où revenir. Ça marche mieux quand les rendez-vous importants sont respectés.",
            "profondeur": "Profond·e : tu as besoin de moments seul·e pour réfléchir, puis tu reviens avec des choses vraies à partager.",
            "admiration": "Brillant·e : tu veux qu'on soit fier·e de ton parcours, sans chercher à te garder pour soi.",
            "harmonie": "Paisible : tu aimes une relation simple, sans pression et sans cris. Pour toi, être en paix, c'est aussi pouvoir partir et revenir.",
            "complicite": "Joueur·euse : tu veux un ou une complice. Rire, partir, se retrouver, c'est ta façon d'aimer.",
            "intensite": "Passionné·e : tu aimes l'aventure et les coups de tête. Pour toi, l'amour, c'est un voyage, pas une salle d'attente."
          }
        },
        "harmonie": {
          "portrait": "Tu t'épanouis dans la douceur. Un geste tendre, une soirée tranquille, et tu recharges tes batteries. Quand l'ambiance est douce, ta gentillesse fait du bien à tout le monde. Ton défi, c'est d'oser dire quand quelque chose te dérange.",
          "nourrit": "Le calme, les petites tendresses du quotidien, pouvoir ne pas être d'accord sans se blesser.",
          "vide": "Les cris, les piques, les tensions qui traînent, devoir toujours céder pour avoir la paix.",
          "nuances": {
            "securite": "Fidèle : tu rêves d'une maison douce et sûre. Une vie régulière te rassure, si on peut aussi parler des sujets qui fâchent.",
            "profondeur": "Profond·e : tu dis les choses vraies avec douceur. Tu écoutes beaucoup, et tu as besoin qu'on t'écoute aussi quand quelque chose te blesse.",
            "admiration": "Brillant·e : les mots doux te font du bien. Tu es gentil·le, et tu as besoin qu'on le remarque.",
            "liberte": "Libre : tu veux la paix, pas une prison. Chacun a sa vie, et on se retrouve avec plaisir.",
            "complicite": "Joueur·euse : tu aimes une vie joyeuse et tranquille. Rire, oui, mais sans l'obligation d'être toujours de bonne humeur.",
            "intensite": "Passionné·e : tu veux de la tendresse et un peu de piment. L'intensité te plaît quand elle passe par le désir, pas par les disputes."
          }
        },
        "complicite": {
          "portrait": "Pour toi, aimer, c'est faire équipe. Les blagues que personne d'autre ne comprend, les corvées à deux, les petits projets. Dans une relation légère où on se serre les coudes, tu es dans ton élément.",
          "nourrit": "Les fous rires, s'aider sans compter, avancer ensemble sur des choses concrètes.",
          "vide": "Les ambiances lourdes, tout porter seul·e au quotidien, la bonne humeur qui s'en va.",
          "nuances": {
            "securite": "Fidèle : tu veux une équipe qui dure. Pour toi, les habitudes à deux et les fous rires vont ensemble.",
            "profondeur": "Profond·e : avec la même personne, tu peux rire de tout et tout lui dire. On blague, et on parle aussi de ce qui compte.",
            "admiration": "Brillant·e : tu veux un ou une partenaire qui te voit et t'encourage. Tu donnes beaucoup de chaleur, et tu as besoin qu'on t'en rende.",
            "liberte": "Libre : tu veux un ou une complice, pas quelqu'un qui te retient. On rit, on part chacun de son côté, on se retrouve.",
            "harmonie": "Paisible : tu aimes la bonne humeur sans les cris. Une équipe tranquille, où les tensions se règlent vite.",
            "intensite": "Passionné·e : tu veux une histoire où il se passe des choses. Rire, oser, se surprendre, sans oublier les moments tout simples."
          }
        },
        "intensite": {
          "portrait": "Tu t'épanouis quand ça bouge entre vous. Le désir, les surprises, un projet un peu fou. Quand c'est vivant, tu as une énergie incroyable. La routine sans envie, par contre, t'éteint petit à petit.",
          "nourrit": "Te sentir désiré·e, découvrir des choses nouvelles, quelqu'un qui ose et qui a des idées.",
          "vide": "Les soirées toutes pareilles, un désir qui s'endort, plus jamais de surprise.",
          "nuances": {
            "securite": "Fidèle : tu veux de la passion et de la stabilité. Une aventure, ça peut se préparer un peu, et une vie stable peut encore te surprendre.",
            "profondeur": "Profond·e : tu cherches une rencontre rare. Les conversations qui te marquent te font vibrer, et tu as aussi besoin de calme.",
            "admiration": "Brillant·e : tu veux te sentir choisi·e et désiré·e, et que ça se voie. Tu aimes les grands gestes, et les petites attentions de tous les jours aussi.",
            "liberte": "Libre : tu aimes vivre des aventures à deux, chacun libre de ses envies. Personne ne retient personne.",
            "harmonie": "Paisible : tu veux de la vie, pas la guerre. La passion passe par le désir et la nouveauté, pas par les cris.",
            "complicite": "Joueur·euse : tu veux rire et oser. Pas de place pour l'ennui, mais les conversations sérieuses ont aussi leur moment."
          }
        }
      },
      "paires": {
        "securite+securite": {
          "text": "Deux Ancres construisent vite un foyer solide. Chacun sait sur qui il peut compter, et ça repose.",
          "tip": "De temps en temps, on prévoit quelque chose de nouveau, pour que l'habitude ne remplace pas l'envie."
        },
        "profondeur+profondeur": {
          "text": "Deux Miroirs peuvent tout se dire. Une intimité comme ça, c'est rare.",
          "tip": "On garde aussi des moments légers. Une conversation n'a pas besoin d'être profonde pour être sincère."
        },
        "admiration+admiration": {
          "text": "Deux Étoiles savent se mettre en valeur et se faire du bien avec des mots.",
          "tip": "On laisse briller l'autre aussi souvent que soi. Chacun son tour d'être à l'honneur."
        },
        "liberte+liberte": {
          "text": "Deux Oiseaux se respectent sans se surveiller. Chacun a sa vie, et on est ensemble parce qu'on en a envie.",
          "tip": "On se fixe quelques rendez-vous importants. Sinon, à force de liberté, on finit par s'éloigner."
        },
        "harmonie+harmonie": {
          "text": "Deux Oasis, c'est une douceur rare. Le quotidien est calme, tendre, facile à vivre.",
          "tip": "On dit ce qui gêne, même si c'est un détail. On est mieux ensemble quand on ne garde pas tout pour soi."
        },
        "complicite+complicite": {
          "text": "Deux Équipes rient, s'entraident et avancent. La vie à deux a du rythme et de la joie.",
          "tip": "On garde un moment pour les sujets sérieux. On ne peut pas tout régler avec une blague."
        },
        "intensite+intensite": {
          "text": "Deux Volcans s'attirent et se réveillent l'un l'autre. La passion est là, forte, vivante.",
          "tip": "Quand ça s'enflamme, on se fixe quelques règles simples, par exemple ne jamais aller se coucher fâchés. La passion dure mieux comme ça."
        },
        "securite+profondeur": {
          "text": "L'Ancre est fiable, le Miroir parle vrai. Ensemble, on peut se faire confiance et tout se dire.",
          "tip": "On se laisse le temps. Pas besoin d'avoir toutes les réponses tout de suite pour être sincère."
        },
        "securite+admiration": {
          "text": "L'Ancre est là tous les jours, l'Étoile a les mots qui font chaud au cœur. Chacun se sent soutenu et apprécié.",
          "tip": "On se dit merci souvent, à voix haute. Ce que l'autre fait tous les jours se voit mieux quand on le dit."
        },
        "securite+liberte": {
          "text": "L'Ancre a besoin de savoir sur qui elle peut compter, l'Oiseau a besoin de liberté. Au début, ça s'équilibre. Avec le temps, l'un peut se sentir délaissé, l'autre étouffé.",
          "tip": "On décide tôt à quel rythme on se donne des nouvelles et on se voit. Chacun garde sa liberté, et personne ne reste dans le flou."
        },
        "securite+harmonie": {
          "text": "L'Ancre et l'Oasis aiment le calme et les histoires qui durent. La vie à deux est simple, douce, sans mauvaise surprise.",
          "tip": "De temps en temps, on aborde un sujet délicat. Être bien ensemble, ça ne veut pas dire se taire."
        },
        "securite+complicite": {
          "text": "L'Ancre garde le cap, l'Équipe apporte la bonne humeur. Les projets avancent, et on rigole en route.",
          "tip": "Quand l'organisation prend toute la place, on se garde un moment pour rire. Ça compte autant que la liste de courses."
        },
        "securite+intensite": {
          "text": "Le Volcan veut que ça bouge, l'Ancre veut que ça dure. L'un peut trouver l'autre trop calme, l'autre trop imprévisible.",
          "tip": "On prépare un peu les aventures, et on glisse des surprises dans le quotidien. Comme ça, chacun y trouve son compte."
        },
        "profondeur+admiration": {
          "text": "L'Étoile aime briller, le Miroir veut aller au fond des choses. L'un peut trouver l'autre trop sérieux, l'autre trop superficiel.",
          "tip": "On se dit ce qu'on admire vraiment l'un chez l'autre, pas seulement ce qui se voit de loin. Chacun s'y retrouve."
        },
        "profondeur+liberte": {
          "text": "Le Miroir et l'Oiseau ont tous les deux besoin de moments à eux. Ils se comprennent sans avoir à se justifier.",
          "tip": "On prévient quand on a besoin d'être seul·e, et on garde de vrais moments à deux. Prendre du recul, ce n'est pas rejeter l'autre."
        },
        "profondeur+harmonie": {
          "text": "L'Oasis apporte la douceur, le Miroir l'écoute. On peut se dire les choses sans avoir peur.",
          "tip": "On ose dire aussi ce qui blesse, avec la même douceur. L'autre ne peut pas tout deviner."
        },
        "profondeur+complicite": {
          "text": "Le Miroir veut aller au fond des choses, l'Équipe préfère en rire. Au début, c'est charmant. Puis l'un peut avoir l'impression que l'autre fuit, et l'autre se sentir écrasé.",
          "tip": "On sépare les moments. Un temps pour rire, un temps pour parler, sans tout mélanger."
        },
        "profondeur+intensite": {
          "text": "Le Miroir et le Volcan cherchent une relation forte. Leurs conversations marquent, et l'attirance est là.",
          "tip": "On garde quelques habitudes rassurantes. Pas besoin de montagnes russes pour que ce soit fort."
        },
        "admiration+liberte": {
          "text": "L'Oiseau vit sa vie, l'Étoile a besoin qu'on la regarde. L'un peut se sentir surveillé, l'autre oublié.",
          "tip": "On prévoit des moments rien qu'à deux, et on s'y tient. L'Oiseau garde sa liberté, et l'Étoile sait qu'elle compte."
        },
        "admiration+harmonie": {
          "text": "L'Oasis et l'Étoile savent se faire du bien. De la gentillesse, des mots doux, une ambiance tendre.",
          "tip": "On ose ne pas être d'accord de temps en temps. Se faire du bien, ce n'est pas toujours dire oui."
        },
        "admiration+complicite": {
          "text": "L'Étoile et l'Équipe se mettent en valeur l'une l'autre. On s'encourage, on rit, on sort beaucoup. Ça pétille.",
          "tip": "Quand la semaine est calme, un simple merci suffit. Pas besoin que chaque soir soit une fête."
        },
        "admiration+intensite": {
          "text": "L'Étoile et le Volcan se désirent et s'admirent. Chacun se sent choisi, et ce n'est jamais plat.",
          "tip": "On se rappelle qu'être là tous les jours, c'est aussi une preuve d'amour, même si ça se remarque moins."
        },
        "liberte+harmonie": {
          "text": "L'Oiseau a besoin de liberté, l'Oasis de calme. Chacun laisse l'autre vivre à sa façon, sans tension.",
          "tip": "Quand l'autre rentre, un geste tendre vaut mieux qu'un interrogatoire. Les retrouvailles restent légères."
        },
        "liberte+complicite": {
          "text": "L'Oiseau et l'Équipe aiment la légèreté. On est bien ensemble, sans pression, et on rigole beaucoup.",
          "tip": "On se lance quand même dans un projet à deux. Ça n'enlève rien à la liberté de chacun, au contraire."
        },
        "liberte+intensite": {
          "text": "L'Oiseau et le Volcan aiment l'aventure, et chacun laisse de la place à l'autre. Personne ne retient personne.",
          "tip": "On reste aussi quand l'excitation des débuts retombe. C'est souvent là que l'histoire commence vraiment."
        },
        "harmonie+complicite": {
          "text": "L'Équipe aime quand ça bouge, l'Oasis préfère la tranquillité. Les sorties et les invitations peuvent vite devenir un sujet.",
          "tip": "Chacun garde ses sorties ou ses soirées tranquilles, sans culpabiliser l'autre. Il y a de la place pour les deux rythmes."
        },
        "harmonie+intensite": {
          "text": "L'Oasis cherche la paix, le Volcan a besoin d'étincelles. Ce qui réveille l'un peut fatiguer l'autre.",
          "tip": "On met la passion dans le désir et les nouveautés, jamais dans les disputes. La passion aussi peut être douce."
        },
        "complicite+intensite": {
          "text": "L'Équipe et le Volcan veulent une histoire où il se passe des choses. Des idées, des fous rires, l'envie d'oser.",
          "tip": "On se garde aussi du temps pour souffler et pour parler sérieusement. Pas besoin de faire du bruit pour être heureux ensemble."
        }
      }
    },
    "pieges": {
      "fight": {
        "name": "l'escalade",
        "title": "L'escalade",
        "short": "tu montes dans les tours pour ne pas perdre",
        "mech": "Quand tu as peur de perdre l'autre ou de ne pas être entendu·e, tu montes dans les tours : le ton, les arguments, le dernier mot. Sur le moment, ça ressemble à de la force. En réalité, c'est de la peur, et l'autre n'entend plus que le bruit.",
        "exits": [
          "Repère le signal du corps (chaleur, voix qui monte) : c'est le moment de t'arrêter, pas d'accélérer.",
          "Dis « je fais une pause de 20 minutes et je reviens », puis reviens vraiment.",
          "Au retour, commence par ce que tu ressens, pas par ce que l'autre a fait : « J'ai eu peur que... »"
        ],
        "exitShort": "annonce une pause de 20 minutes, puis reviens vraiment"
      },
      "flight": {
        "name": "la porte de sortie",
        "title": "La porte de sortie",
        "short": "tu t'échappes pour ne pas exploser",
        "mech": "Quand la tension monte, tu pars : physiquement, dans ton téléphone, dans le travail. Tu crois protéger la relation. L'autre, lui, vit ton départ comme un abandon, et la tension revient plus fort la fois suivante.",
        "exits": [
          "Tu as le droit de faire une pause. Annonce-la, au lieu de disparaître.",
          "Fixe tout de suite le moment où vous en reparlez : « On en reparle ce soir, à 21 h. »",
          "Reviens avec une seule phrase vraie, même courte : c'est elle qui rassure."
        ],
        "exitShort": "annonce ta pause et fixe tout de suite l'heure où vous en reparlez"
      },
      "freeze": {
        "name": "le blanc",
        "title": "Le blanc",
        "short": "ta tête se vide et les mots ne viennent plus",
        "mech": "Quand ça devient trop fort, ta tête se vide. Plus de mots, plus d'idées. L'autre peut y voir de l'indifférence, alors que tu es submergé·e, et son insistance te fige encore plus.",
        "exits": [
          "Prépare à l'avance ta phrase de secours : « Je suis bloqué·e, laisse-moi un moment, je reviens vers toi. »",
          "Respire lentement, pose les pieds bien à plat : ton corps doit se calmer avant ta tête.",
          "Si parler est trop dur, écris ce que tu ressens, et donne-le ensuite."
        ],
        "exitShort": "dis ta phrase de secours, « je suis bloqué·e, je reviens vers toi », et reviens"
      },
      "fawn": {
        "name": "le oui qui coûte",
        "title": "Le oui qui coûte",
        "short": "tu cèdes pour que ça s'arrête",
        "mech": "Pour que la dispute s'arrête, tu dis oui, tu t'excuses, tu cèdes. Le calme revient vite, mais ton besoin, lui, passe à la trappe. À force, tu accumules, et tu finis par t'éloigner sans rien dire.",
        "exits": [
          "Remplace le oui réflexe par : « Je ne suis pas sûr·e, j'y réfléchis et je te dis. »",
          "Avant de céder, demande-toi : de quoi ai-je besoin, là, tout de suite ?",
          "Dis une chose vraie par jour, même petite. Ça se travaille, comme un muscle."
        ],
        "exitShort": "remplace le oui réflexe par « j'y réfléchis et je te dis »"
      }
    },
    "weights": {
      "nourrit": {
        "ecoute": {
          "p": "profondeur",
          "s": "harmonie"
        },
        "rire": {
          "p": "complicite"
        },
        "fiable": {
          "p": "securite"
        },
        "espace": {
          "p": "liberte"
        },
        "tendresse": {
          "p": "harmonie",
          "s": "complicite"
        },
        "admiration": {
          "p": "admiration"
        },
        "projets": {
          "p": "complicite",
          "s": "securite"
        },
        "aventure": {
          "p": "intensite",
          "s": "liberte"
        },
        "calme": {
          "p": "harmonie",
          "s": "securite"
        },
        "profondeur": {
          "p": "profondeur"
        },
        "rituels": {
          "p": "securite",
          "s": "complicite"
        },
        "soutien": {
          "p": "admiration",
          "s": "securite"
        },
        "desir": {
          "p": "intensite",
          "s": "complicite"
        },
        "partage": {
          "p": "complicite",
          "s": "harmonie"
        }
      },
      "vide": {
        "justifier": {
          "p": "liberte"
        },
        "critiques": {
          "p": "admiration",
          "s": "harmonie"
        },
        "silences": {
          "p": "profondeur",
          "s": "harmonie"
        },
        "cris": {
          "p": "harmonie"
        },
        "flou": {
          "p": "securite"
        },
        "charge": {
          "p": "complicite",
          "s": "admiration"
        },
        "ecrans": {
          "p": "profondeur",
          "s": "complicite"
        },
        "jalousie": {
          "p": "liberte"
        },
        "routine": {
          "p": "intensite",
          "s": "complicite"
        },
        "promesses": {
          "p": "securite"
        },
        "fusion": {
          "p": "liberte"
        },
        "indifference": {
          "p": "admiration",
          "s": "profondeur"
        }
      },
      "ressource": {
        "seul": "liberte",
        "raconter": "profondeur",
        "bouger": "intensite",
        "mains": "securite",
        "evader": "profondeur",
        "monde": "complicite",
        "tendresse": "harmonie",
        "douceur": "harmonie",
        "rien": "harmonie",
        "moi": "liberte",
        "nature": "liberte",
        "sport": "intensite",
        "adeux": "complicite",
        "proches": "securite",
        "sortir": "intensite",
        "decouvrir": "profondeur",
        "projet": "admiration"
      },
      "langages": {
        "paroles": {
          "p": "admiration"
        },
        "moments": {
          "p": "profondeur",
          "s": "complicite"
        },
        "cadeaux": {
          "p": "harmonie",
          "s": "admiration"
        },
        "services": {
          "p": "securite",
          "s": "complicite"
        },
        "toucher": {
          "p": "harmonie",
          "s": "intensite"
        }
      },
      "ennea": {
        "t1": {
          "p": "securite",
          "s": "admiration"
        },
        "t2": {
          "p": "admiration",
          "s": "harmonie"
        },
        "t3": {
          "p": "admiration",
          "s": "intensite"
        },
        "t4": {
          "p": "profondeur",
          "s": "intensite"
        },
        "t5": {
          "p": "liberte",
          "s": "profondeur"
        },
        "t6": {
          "p": "securite",
          "s": "complicite"
        },
        "t7": {
          "p": "intensite",
          "s": "complicite"
        },
        "t8": {
          "p": "liberte",
          "s": "intensite"
        },
        "t9": {
          "p": "harmonie",
          "s": "securite"
        }
      },
      "valeurs": {
        "honnetete": "profondeur",
        "fidelite": "securite",
        "respect": "harmonie",
        "famille": "complicite",
        "enfants": "securite",
        "sans_enfants": "liberte",
        "liberte": "liberte",
        "ambition": "admiration",
        "simplicite": "harmonie",
        "aventure": "intensite",
        "humour": "complicite",
        "culture": "profondeur",
        "sante": "intensite",
        "solidarite": "complicite",
        "creativite": "admiration"
      },
      "instinct": {
        "sp": {
          "p": "securite",
          "s": "harmonie"
        },
        "so": {
          "p": "complicite",
          "s": "admiration"
        },
        "sx": {
          "p": "intensite",
          "s": "profondeur"
        }
      },
      "stress": {
        "D": "admiration",
        "I": "complicite",
        "S": "harmonie",
        "C": "securite"
      }
    },
    "points": {
      "nourrit": {
        "p": [
          6,
          4,
          2
        ],
        "s": [
          3,
          2,
          1
        ]
      },
      "vide": {
        "p": [
          4,
          2
        ],
        "s": [
          2,
          1
        ]
      },
      "ressource": 1,
      "langages": {
        "p": [
          3,
          2,
          1,
          0
        ],
        "s": [
          1,
          1,
          0
        ]
      },
      "ennea": {
        "p": [
          4,
          2,
          0
        ],
        "s": [
          2,
          1,
          0
        ]
      },
      "valeurs": [
        3,
        3,
        3,
        1,
        1,
        1,
        1,
        1,
        0
      ],
      "instinct": {
        "p": [
          4,
          2,
          0
        ],
        "s": [
          2,
          1,
          0
        ]
      },
      "stress": 1
    },
    "boussoleBoost": {
      "securite": "frictions",
      "harmonie": "frictions",
      "liberte": "energie",
      "profondeur": "langage",
      "admiration": "langage",
      "complicite": "complementarite",
      "intensite": "complementarite"
    },
    "ui": {
      "eyebrowNamed": "{prenom}, ton profil amoureux (hypothèse) · 1 combinaison parmi 42",
      "eyebrowAnon": "Ton profil amoureux (hypothèse) · 1 combinaison parmi 42",
      "domSec": "Dominante {domName} ({domKey}) · Secondaire {secName} ({secKey})",
      "alliageLab": "Ton alliage",
      "barsLab": "Tes 7 besoins amoureux",
      "netLine": "Ton besoin dominant ressort très nettement.",
      "mixedLine": "Tes deux premiers besoins pèsent presque autant : tu te reconnaîtras peut-être aussi dans le profil {inverse}.",
      "whyLab": "Pourquoi ce profil ?",
      "whyIntro": "Ce qui a le plus pesé vers {domName} :",
      "whyNote": "Chaque réponse donne des points à un ou deux besoins. Ton profil réunit les deux besoins qui en ont le plus. C'est une hypothèse : vérifie-la avec ce que tu as vraiment vécu.",
      "toc": [
        "T'épanouir",
        "T'éteindre",
        "Ta relation",
        "Ton ou ta partenaire",
        "Les mots à dire",
        "Sous stress",
        "Et maintenant ?"
      ],
      "sentences": {
        "s1": "{prenom}, ton profil amoureux est {profil} : tu {s1}, et tu as besoin {secNeed}.",
        "s2": "Tu t'épanouis quand {bloomShort}, et tu t'éteins quand {fadeShort}.",
        "s3": "Sous stress fort, ton piège, c'est {trapName} : {trapShort}. Pour en sortir, {exitShort}."
      },
      "s1h": "Là où tu t'épanouis en amour",
      "s1top": "Ce que tu as classé en tête, « {short} », en dit long sur ton besoin {de}.",
      "s1recharge": "Côté énergie, {title} : {couple}",
      "s2h": "Là où tu t'éteins",
      "s2ownH": "Ce que tu ne veux plus vivre",
      "s2alarmLab": "Signal d'alerte",
      "s2noMore": "Ta bête noire, « {short} », touche directement ton besoin {de}.",
      "s2noMoreOwn": "Ta bête noire, « {short} », c'est ce que tu ne veux plus vivre. Note-la bien : c'est précieux pour bien choisir.",
      "s2test": "Le test des 10 ans : si un ou une partenaire te fait vivre ça, est-ce que tu pourrais le supporter pendant dix ans, et même en un peu pire ? Si la réponse est non, écoute-la, même si tu es amoureux·se.",
      "s3h": "Le type de relation qui te correspond",
      "s3rows": {
        "rythme": "Rythme",
        "proximite": "Proximité",
        "independance": "Indépendance",
        "conflits": "Conflits"
      },
      "s3sec": "Ton besoin secondaire ({name}) ajoute une condition : {cond}.",
      "s3instinct": "Ton sous-type ({name}) : {couple}",
      "s4h": "Le ou la partenaire compatible",
      "s4rule": "La règle : pareils sur le fond, différents dans la forme. Les mêmes besoins et les mêmes valeurs, mais chacun sa façon de les vivre.",
      "s4fond": "Au fond, il te faut {fond}.",
      "s4fondSec": "Et pour ton besoin secondaire : {fond}.",
      "s4lang": "Pour que tu te sentes aimé·e : quelqu'un qui {hint}.",
      "s4stress": "Quand ça chauffe : {partner}",
      "s4nourrit": "Ça nourrit",
      "s4proche": "Proches de toi (facile, à entretenir)",
      "s4frotte": "Ça peut coincer (à aborder tôt)",
      "s4critical": "Incompatible (non négociable)",
      "s4profileLine": "Un profil {name} ({who})",
      "s4mirrorLab": "Avec quelqu'un qui te ressemble",
      "s5h": "Les phrases à dire",
      "s5partner": "À ton ou ta partenaire",
      "s5date": "Lors d'un premier rendez-vous",
      "s6h": "Ton piège classique sous stress, et comment en sortir",
      "s6trigger": "Chez toi, ça se déclenche surtout quand {trigger}.",
      "s6early": "Avant d'en arriver là, sous stress modéré, tu {modere} : c'est le premier signe. C'est là qu'il faut agir.",
      "s6calm": "Ce dont tu as vraiment besoin à ce moment-là : {calm}.",
      "s6exitLab": "Pour en sortir, en 3 temps",
      "s6also": "Tu as aussi coché : {others}.",
      "why": {
        "nourrit": "« {short} », classé n° {rank} dans ce qui te nourrit",
        "vide": "« {short} », dans ce qui te vide",
        "ressource": "ta recharge « {short} »",
        "langages": "{lower}, ton langage de l'amour n° {rank}",
        "ennea": "ta piste ennéagramme (une hypothèse, pas un verdict)",
        "valeurs": "{short}, ta valeur n° {rank}",
        "instinct": "ton sous-type {name}",
        "stress": "ta façon de réagir sous stress"
      }
    },
    "icons": {
      "anchor": "<path d=\"M12 6v16\"/> <path d=\"m19 13 2-1a9 9 0 0 1-18 0l2 1\"/> <path d=\"M9 11h6\"/> <circle cx=\"12\" cy=\"4\" r=\"2\"/>",
      "waves": "<path d=\"M2 12q2.5 2 5 0t5 0 5 0 5 0\"/> <path d=\"M2 19q2.5 2 5 0t5 0 5 0 5 0\"/> <path d=\"M2 5q2.5 2 5 0t5 0 5 0 5 0\"/>",
      "sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/> <path d=\"M20 2v4\"/> <path d=\"M22 4h-4\"/> <circle cx=\"4\" cy=\"20\" r=\"2\"/>",
      "feather": "<path d=\"M14.086 18.412A2 2 0 0112.67 19H5v-7.672a2 2 0 01.586-1.414L11.75 3.75a6 6 0 118.49 8.49z\"/> <path d=\"M16 8 2 22\"/> <path d=\"M17.488 15H9\"/>",
      "leaf": "<path d=\"M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20\"/> <path d=\"M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13\"/>",
      "laugh": "<path d=\"M15 10V9\"/> <path d=\"M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302\"/> <path d=\"M9 10V9\"/> <circle cx=\"12\" cy=\"12\" r=\"10\"/>",
      "flame": "<path d=\"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4\"/>",
      "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/> <path d=\"M12 2v2\"/> <path d=\"M12 20v2\"/> <path d=\"m4.93 4.93 1.41 1.41\"/> <path d=\"m17.66 17.66 1.41 1.41\"/> <path d=\"M2 12h2\"/> <path d=\"M20 12h2\"/> <path d=\"m6.34 17.66-1.41 1.41\"/> <path d=\"m19.07 4.93-1.41 1.41\"/>",
      "cloud-rain": "<path d=\"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242\"/> <path d=\"M16 14v6\"/> <path d=\"M8 14v6\"/> <path d=\"M12 16v6\"/>",
      "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>",
      "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/> <circle cx=\"9\" cy=\"7\" r=\"4\"/>",
      "message-circle-heart": "<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/> <path d=\"M7.828 13.07A3 3 0 0 1 12 8.764a3 3 0 0 1 5.004 2.224 3 3 0 0 1-.832 2.083l-3.447 3.62a1 1 0 0 1-1.45-.001z\"/>",
      "life-buoy": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"m4.93 4.93 4.24 4.24\"/> <path d=\"m14.83 9.17 4.24-4.24\"/> <path d=\"m14.83 14.83 4.24 4.24\"/> <path d=\"m9.17 14.83-4.24 4.24\"/> <circle cx=\"12\" cy=\"12\" r=\"4\"/>",
      "compass": "<circle cx=\"12\" cy=\"12\" r=\"10\"/> <path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"/>"
    }
  };
if (typeof module !== "undefined" && module.exports) module.exports = AMOUR_DATA;
else root.AMOUR_DATA = AMOUR_DATA;
})(typeof window !== "undefined" ? window : globalThis);
