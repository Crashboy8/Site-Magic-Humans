/* Quiz Amour v1.2 (mode ?theme=amour) · Magic Humans · données et textes, FR uniquement.
   Fichier de données pur : aucune logique d'affichage. Lu par quiz/amour.js et par les tests. */
(function (root) {
const AMOUR_DATA = {
  "version": 2,
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
      "eyebrow": "Sommet Love & Connexion · Gratuit · 11 étapes · 8 à 10 minutes",
      "h1": "Amoureux, mais <em>malheureux</em> ?",
      "lead": "L'émotion et la chimie ne suffisent pas à faire un couple heureux. Ce quiz t'aide à voir clair sur ce dont tu as vraiment besoin, sur ce qui t'éteint, et sur le type de partenaire qui te correspond, ou qui risque de te faire souffrir.",
      "bullets": [
        "Ce qui te nourrit en couple, et ce qui t'éteint",
        "Ton ressourcement, pour éviter une relation qui pompe ton énergie",
        "Tes langages de l'amour et ta piste ennéagramme, avec ton sous-type",
        "Les défauts que tu peux accepter, et tes vrais non-négociables"
      ],
      "howto": "Réponds avec ton premier élan, en pensant à ce que tu vis vraiment, pas à ce qui serait idéal. Il n'y a ni bonne ni mauvaise réponse.",
      "nameLabel": "Ton prénom",
      "nameHelp": "Il sert seulement à personnaliser tes résultats, il ne quitte pas ton appareil.",
      "nameErr": "Indique ton prénom pour personnaliser tes résultats.",
      "start": "Commencer le quiz →"
    },
    "quiz": {
      "count": "Étape {i} sur {n}",
      "prev": "← Retour",
      "next": "Suivant →",
      "last": "Voir mes résultats →",
      "firmnessLabel": "C'est...",
      "privacy": "Cette réponse n'est ni enregistrée ni transmise.",
      "hints": {
        "plusminus": "Mets 3 « + » et 2 « − ».",
        "blocks": "Réponds à chaque partie de l'écran.",
        "sort": "Range chaque défaut dans une colonne.",
        "values": "Complète chaque ligne.",
        "single": "Choisis la réponse qui te ressemble le plus."
      },
      "secondNone": "Pas de second choix",
      "plusLegend": "+ ce qui te nourrit",
      "minusLegend": "− ce qui t'éteint",
      "plusLeft": "« + » restants : {n}",
      "minusLeft": "« − » restants : {n}"
    },
    "results": {
      "eyebrow": "Résultats de {prenom}",
      "titlePrefix": "Ton profil amoureux :",
      "langH": "Tes langages de l'amour",
      "langCredit": "D'après le concept des 5 langages de l'amour de Gary Chapman.",
      "recvLab": "Ce dont tu as besoin pour te sentir aimé·e",
      "giveLab": "La façon dont tu donnes de l'amour",
      "secondaryLab": "En second :",
      "tipsLab": "Concrètement",
      "imagoH": "Le scénario qui se répète peut-être",
      "imagoCredit": "Inspiré de la thérapie Imago de Harville Hendrix : nous sommes souvent attirés par ce qui nous est familier, y compris par ce qui nous a blessés.",
      "imagoDisclaimer": "Ceci est une hypothèse de réflexion, pas un diagnostic. Toi seul·e sais si elle te parle.",
      "imagoQuestionsLab": "Trois questions à te poser",
      "reactiveLab": "Le type de partenaire qui réactive ce scénario",
      "healingLab": "Le type de partenaire avec qui tu peux en sortir",
      "needsPartnerLab": "Ce que cela demande à un partenaire",
      "antiIntro": "Ton Anti-Contexte, c'est l'environnement qui éteint ce qu'il y a de meilleur en toi. En couple, le voici :",
      "ressH": "Ton ressourcement",
      "nnH": "Mes non-négociables",
      "nnIntro": "Ce sont les points sur lesquels tu ne peux pas plier sans te trahir. Les connaître tôt évite des années de souffrance.",
      "nnCriticalLab": "Non-négociables (incompatibilité critique si l'autre est à l'opposé)",
      "nnStrongLab": "Très importants (frictions fortes, à aborder tôt)",
      "nnSoftLab": "Zones de souplesse",
      "nnUniversalLab": "Pour tout le monde, sans exception",
      "nnNoneCritical": "Tu n'as indiqué aucun point non négociable. C'est peut-être une vraie souplesse. Mais si tu as tendance à tout accepter, demande-toi : sur quoi ai-je déjà plié, et l'ai-je regretté ?",
      "partnerH": "Le partenaire qui te correspond",
      "partnerIntro": "Le bon critère n'est pas « quelqu'un sans défauts ». C'est quelqu'un dont tu peux accepter les défauts sur le long terme, parce qu'ils ne touchent pas tes besoins essentiels. Le même fond, des talents différents en surface.",
      "completeLab": "Qui te complète",
      "frictionLab": "Qui risque de frotter (à négocier)",
      "criticalLab": "Incompatibilité critique (à ne pas négocier)",
      "gridH": "Comment lire les niveaux de risque",
      "keyH": "Ce qu'il faut retenir",
      "boussoleLab": "La Boussole Relation",
      "boussoleP": "Tu es en couple, ou tu hésites sur une relation ? La Boussole Relation t'aide à l'évaluer calmement, critère par critère. Elle sera préréglée avec tes résultats : tes besoins, ce qui te vide, tes défauts acceptables et tes non-négociables. Une alerte s'affiche si un point essentiel est touché, quel que soit le score.",
      "boussoleBtn": "Évaluer ma relation avec la Boussole →",
      "ctaEyebrow": "Appel Découverte · offert",
      "ctaH": "Et si on en parlait ensemble ?",
      "ctaP": "Ce quiz pose des hypothèses. Pendant un Appel Découverte offert, nous regardons ta situation réelle : ce qui se répète, ce dont tu as besoin, et ce que tu veux construire. Tu repars avec des idées claires, que tu décides ou non d'aller plus loin avec moi.",
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
      "restart": "Recommencer le quiz",
      "ethicsH": "Une note importante",
      "ethicsP": "Ce quiz n'est pas un outil de diagnostic. Si tu vis de la peur, des humiliations, du contrôle ou de la violence dans ta relation, ce n'est pas un problème de compatibilité : parles-en à un professionnel. En France : 3919 (violences conjugales, gratuit et anonyme, 24h/24), 17 ou 112 en cas de danger immédiat, 114 par SMS. Hors de France, contacte les services d'urgence de ton pays.",
      "nnFlawsLab": "Défauts non négociables pour toi",
      "sentencesH": "Ton profil en 3 phrases",
      "detailsSummary": "Voir mon profil détaillé",
      "copyShortBtn": "Copier mes 3 phrases",
      "boussoleNote": "Ta Boussole sera préréglée avec tes résultats. Ta réponse sur la sécurité n'est jamais transmise.",
      "nourritH": "Ce qui te nourrit, ce qui t'éteint",
      "enneaH": "Ta piste ennéagramme",
      "quotidienH": "Ton quotidien à deux",
      "piegeLab": "Ton piège :",
      "pairPrefix": "Avec un partenaire {name} :",
      "flawsH": "Les défauts que tu peux accepter",
      "flawsIntro": "Le bon critère n'est pas « quelqu'un sans défauts ». C'est quelqu'un dont tu peux accepter les défauts sur le long terme, parce qu'ils ne touchent pas tes besoins essentiels.",
      "flawsTooMany": "Tu as beaucoup de non-négociables. C'est peut-être juste. Mais vérifie qu'ils ne servent pas aussi à te protéger de l'engagement : lesquels sont vraiment vitaux pour toi ?",
      "flawsNone": "Tu n'as classé aucun défaut en non négociable. Belle souplesse, ou habitude de tout accepter ? Repense aux défauts qui t'ont déjà fait partir.",
      "rechargeSame": "Ton profil de recharge est net : {title}.",
      "rechargeMixed": "Tu te recharges de deux façons : {soirTitle} en semaine, {weekendTitle} le week-end.",
      "rechargeRule": "La règle d'or : après un moment ensemble, tu dois avoir plus d'énergie qu'avant. Si une relation te vide durablement, ce n'est pas un détail, c'est une information.",
      "drainsLab": "Ce qui te vide",
      "instinctNet": "Ta réponse est nette.",
      "instinctNuance": "Tu as aussi une part « {name2} » : {desc2}",
      "pairsLab": "Avec un partenaire de chaque sous-type",
      "pairsNote": "Ces tendances ne décident de rien : elles éclairent les frictions possibles, pour en parler tôt."
    }
  },
  "screens": [
    {
      "id": "plusmoins",
      "type": "plusminus",
      "eyebrow": "Ce qui te nourrit",
      "text": "En couple, qu'est-ce qui te nourrit, et qu'est-ce qui t'éteint ?",
      "help": "Comme dans le QCM Magic Humans : mets 3 « + » sur ce qui te fait du bien, et 2 « − » sur ce qui t'éteint. Le reste, tu laisses.",
      "plusCount": 3,
      "minusCount": 2,
      "items": [
        {
          "id": "rituels",
          "label": "Des rituels qui reviennent : le marché du samedi, le film du dimanche soir.",
          "plus": {
            "securite": 2
          },
          "minus": {
            "legerete": 2
          }
        },
        {
          "id": "imprevu",
          "label": "L'imprévu : partir sur un coup de tête, changer de plan au dernier moment.",
          "plus": {
            "legerete": 2,
            "liberte": 1
          },
          "minus": {
            "securite": 2
          }
        },
        {
          "id": "espace",
          "label": "Que chacun garde ses soirées, ses amis, ses projets à soi.",
          "plus": {
            "liberte": 2
          },
          "minus": {
            "profondeur": 2
          }
        },
        {
          "id": "fusion",
          "label": "Se voir tous les jours et se raconter chaque détail.",
          "plus": {
            "profondeur": 2
          },
          "minus": {
            "liberte": 2
          }
        },
        {
          "id": "admiration",
          "label": "Se dire souvent ce qu'on admire chez l'autre, même devant les amis.",
          "plus": {
            "reconnaissance": 2
          },
          "minus": {
            "harmonie": 1
          }
        },
        {
          "id": "attentions",
          "label": "Recevoir souvent des preuves d'amour : messages, petits mots, attentions.",
          "plus": {
            "reconnaissance": 2
          },
          "minus": {
            "liberte": 2
          }
        },
        {
          "id": "franchise",
          "label": "Se dire les choses franchement, quitte à hausser un peu le ton.",
          "plus": {
            "profondeur": 2
          },
          "minus": {
            "harmonie": 2
          }
        },
        {
          "id": "calme",
          "label": "Des soirées calmes à la maison, sans enjeu.",
          "plus": {
            "harmonie": 2
          },
          "minus": {
            "legerete": 2
          }
        },
        {
          "id": "taquiner",
          "label": "Se taquiner, rire de tout, ne rien prendre trop au sérieux.",
          "plus": {
            "legerete": 2
          },
          "minus": {
            "reconnaissance": 2
          }
        },
        {
          "id": "projets",
          "label": "Des projets clairs : savoir où l'on sera dans un an.",
          "plus": {
            "securite": 2
          },
          "minus": {
            "liberte": 2
          }
        },
        {
          "id": "profondes",
          "label": "Des conversations profondes sur nos émotions, jusque tard.",
          "plus": {
            "profondeur": 2
          },
          "minus": {
            "legerete": 2
          }
        },
        {
          "id": "paix",
          "label": "Éviter les disputes, quitte à laisser passer certaines choses.",
          "plus": {
            "harmonie": 2
          },
          "minus": {
            "profondeur": 2
          }
        }
      ]
    },
    {
      "id": "ressource",
      "type": "blocks",
      "eyebrow": "Ton ressourcement",
      "text": "Qu'est-ce qui te recharge, et qu'est-ce qui te vide ?",
      "help": "Une relation qui te correspond te laisse plus d'énergie qu'avant, pas moins. Commençons par ce qui te remplit.",
      "blocks": [
        {
          "id": "soir",
          "kind": "single",
          "text": "En fin de journée, ce qui te recharge vraiment :",
          "options": [
            {
              "id": "solitaire",
              "label": "Un moment seul·e, au calme, sans que personne ne me demande rien."
            },
            {
              "id": "relationnel",
              "label": "Une soirée douce avec mon ou ma partenaire, sans enjeu, juste se raconter."
            },
            {
              "id": "sensoriel",
              "label": "Bouger, cuisiner, bricoler : faire quelque chose avec mon corps ou mes mains."
            },
            {
              "id": "evasion",
              "label": "M'évader : un livre, une série, un podcast, des idées nouvelles."
            },
            {
              "id": "elan",
              "label": "Voir du monde, sortir, de l'animation."
            }
          ]
        },
        {
          "id": "weekend",
          "kind": "single",
          "text": "Le week-end, ce qu'il te faut pour être plein·e d'énergie le lundi :",
          "options": [
            {
              "id": "solitaire",
              "label": "Une vraie plage de temps rien que pour moi."
            },
            {
              "id": "relationnel",
              "label": "Du temps tranquille à deux ou avec quelques proches, sans programme."
            },
            {
              "id": "sensoriel",
              "label": "La nature, le sport, le jardin, des activités concrètes."
            },
            {
              "id": "evasion",
              "label": "Une expo, un film, une découverte, apprendre quelque chose."
            },
            {
              "id": "elan",
              "label": "Des sorties, des amis, une fête, du mouvement."
            }
          ]
        },
        {
          "id": "vide",
          "kind": "multi",
          "text": "Ce qui te vide le plus dans une relation (1 ou 2 choix) :",
          "min": 1,
          "max": 2,
          "options": [
            {
              "id": "pas_seul",
              "label": "Ne jamais avoir un moment à moi."
            },
            {
              "id": "sorties",
              "label": "Devoir sortir ou recevoir alors que je suis épuisé·e."
            },
            {
              "id": "casanier",
              "label": "Rester enfermé·e à la maison tout le week-end."
            },
            {
              "id": "conflits",
              "label": "Les tensions qui traînent, les non-dits."
            },
            {
              "id": "plaintes",
              "label": "Porter les problèmes de l'autre tous les soirs."
            },
            {
              "id": "bruit",
              "label": "Le bruit, les écrans allumés en permanence."
            },
            {
              "id": "charge",
              "label": "Porter seul·e la charge du quotidien."
            },
            {
              "id": "imprevu",
              "label": "L'imprévu permanent, ne jamais savoir ce qu'on fait."
            }
          ]
        }
      ]
    },
    {
      "id": "langages",
      "type": "blocks",
      "eyebrow": "Tes langages de l'amour",
      "text": "Comment tu reçois l'amour, et comment tu le donnes",
      "help": "D'après les 5 langages de l'amour de Gary Chapman.",
      "blocks": [
        {
          "id": "recv",
          "kind": "single",
          "text": "Un soir, après une journée difficile, qu'est-ce qui te ferait le plus de bien venant de ton partenaire ?",
          "options": [
            {
              "id": "paroles",
              "label": "Des mots sincères : « Je suis fier·e de toi, tu as assuré. »"
            },
            {
              "id": "moments",
              "label": "Une soirée vraiment ensemble, téléphones rangés, rien que vous deux."
            },
            {
              "id": "cadeaux",
              "label": "Trouver un petit mot ou ta douceur préférée, pensée pour toi."
            },
            {
              "id": "services",
              "label": "Découvrir que le dîner est prêt et que ce qui te pesait a été réglé."
            },
            {
              "id": "toucher",
              "label": "Un long câlin, une main dans le dos, sans rien dire."
            }
          ]
        },
        {
          "id": "recv2",
          "kind": "second",
          "text": "Et en second, si tu hésites (facultatif) :",
          "of": "recv",
          "options": [
            {
              "id": "paroles",
              "label": "Les mots"
            },
            {
              "id": "moments",
              "label": "Le temps à deux"
            },
            {
              "id": "cadeaux",
              "label": "Les attentions"
            },
            {
              "id": "services",
              "label": "L'aide concrète"
            },
            {
              "id": "toucher",
              "label": "Le contact"
            }
          ]
        },
        {
          "id": "give",
          "kind": "single",
          "text": "Ton partenaire traverse une période difficile. Ton premier réflexe :",
          "options": [
            {
              "id": "paroles",
              "label": "Lui envoyer des messages d'encouragement, lui rappeler ses forces."
            },
            {
              "id": "moments",
              "label": "Libérer du temps pour être là et l'écouter longuement."
            },
            {
              "id": "cadeaux",
              "label": "Lui préparer une surprise pour lui changer les idées."
            },
            {
              "id": "services",
              "label": "Prendre en charge une partie de ses tâches pour l'alléger."
            },
            {
              "id": "toucher",
              "label": "Rester tout près, offrir tes bras."
            }
          ]
        },
        {
          "id": "give2",
          "kind": "second",
          "text": "Et en second, si tu hésites (facultatif) :",
          "of": "give",
          "options": [
            {
              "id": "paroles",
              "label": "Les mots"
            },
            {
              "id": "moments",
              "label": "Le temps à deux"
            },
            {
              "id": "cadeaux",
              "label": "Les attentions"
            },
            {
              "id": "services",
              "label": "L'aide concrète"
            },
            {
              "id": "toucher",
              "label": "Le contact"
            }
          ]
        }
      ]
    },
    {
      "id": "enneaBase",
      "type": "blocks",
      "eyebrow": "Ta piste ennéagramme (1 sur 3)",
      "text": "Lequel de ces portraits te ressemble le plus, au fond ?",
      "help": "Choisis avec ton premier élan. Si tu hésites vraiment, ajoute un deuxième portrait. C'est un point de départ, pas un verdict.",
      "blocks": [
        {
          "id": "first",
          "kind": "single",
          "text": "Lequel de ces portraits te ressemble le plus ?",
          "options": [
            {
              "id": "t1",
              "label": "Je veux bien faire les choses. Je vois vite ce qui pourrait être mieux, et je suis exigeant·e, avec moi d'abord."
            },
            {
              "id": "t2",
              "label": "J'ai besoin de me sentir utile et aimé·e. Je devine ce dont les autres ont besoin, souvent avant eux."
            },
            {
              "id": "t3",
              "label": "J'avance vers des objectifs. Réussir, être efficace et reconnu·e pour ce que je fais me porte."
            },
            {
              "id": "t4",
              "label": "Je ressens tout intensément. J'ai besoin d'authenticité et d'être compris·e dans ce que j'ai d'unique."
            },
            {
              "id": "t5",
              "label": "J'ai besoin de comprendre avant d'agir, et de garder du temps et de l'espace pour moi."
            },
            {
              "id": "t6",
              "label": "J'anticipe les risques pour être prêt·e. La confiance et la loyauté sont essentielles pour moi."
            },
            {
              "id": "t7",
              "label": "J'aime les idées, les projets, les découvertes. Je déteste me sentir enfermé·e ou m'ennuyer."
            },
            {
              "id": "t8",
              "label": "Je vais droit au but, je protège les miens et je n'aime pas qu'on me contrôle."
            },
            {
              "id": "t9",
              "label": "Je cherche la paix. Je m'adapte facilement et j'évite les conflits, parfois au détriment de mes envies."
            }
          ]
        },
        {
          "id": "second",
          "kind": "second",
          "text": "Un deuxième portrait, si tu hésites (facultatif) :",
          "of": "first",
          "options": [
            {
              "id": "t1",
              "label": "Type 1, le Perfectionniste"
            },
            {
              "id": "t2",
              "label": "Type 2, l'Altruiste"
            },
            {
              "id": "t3",
              "label": "Type 3, le Battant"
            },
            {
              "id": "t4",
              "label": "Type 4, le Romantique"
            },
            {
              "id": "t5",
              "label": "Type 5, l'Observateur"
            },
            {
              "id": "t6",
              "label": "Type 6, le Loyal"
            },
            {
              "id": "t7",
              "label": "Type 7, l'Épicurien"
            },
            {
              "id": "t8",
              "label": "Type 8, le Protecteur"
            },
            {
              "id": "t9",
              "label": "Type 9, le Médiateur"
            }
          ]
        }
      ]
    },
    {
      "id": "enneaStress",
      "type": "blocks",
      "eyebrow": "Ta piste ennéagramme (2 sur 3)",
      "text": "Quand ça va mal dans ton couple, tu as tendance à...",
      "help": "Pense à une vraie dispute, pas à ce que tu voudrais faire.",
      "blocks": [
        {
          "id": "stress",
          "kind": "single",
          "text": "Quand ça va mal dans ton couple, tu as tendance à...",
          "options": [
            {
              "id": "t1",
              "label": "Devenir critique, pointer ce qui ne va pas, te raidir."
            },
            {
              "id": "t2",
              "label": "Donner encore plus, puis en vouloir à l'autre de ne pas le voir."
            },
            {
              "id": "t3",
              "label": "Te jeter dans le travail ou l'action, et faire comme si tout allait bien."
            },
            {
              "id": "t4",
              "label": "Te replier sur ton émotion, te sentir incompris·e, prendre tes distances."
            },
            {
              "id": "t5",
              "label": "Te retirer dans ta tête, te couper de tes émotions, t'isoler pour réfléchir."
            },
            {
              "id": "t6",
              "label": "T'inquiéter, imaginer le pire, chercher à être rassuré·e, ou soupçonner."
            },
            {
              "id": "t7",
              "label": "Fuir dans les sorties, les projets ou l'humour, et éviter le sujet lourd."
            },
            {
              "id": "t8",
              "label": "Monter au front, hausser le ton, reprendre le contrôle."
            },
            {
              "id": "t9",
              "label": "Faire le dos rond, dire oui pour avoir la paix, laisser le problème s'endormir."
            }
          ]
        }
      ]
    },
    {
      "id": "instinct",
      "type": "blocks",
      "eyebrow": "Ta piste ennéagramme (3 sur 3)",
      "text": "Un samedi libre en couple, ton idéal c'est…",
      "help": "Pas de bonne réponse : chacun nourrit sa vie de couple à sa façon.",
      "blocks": [
        {
          "id": "samedi",
          "kind": "single",
          "text": "Ton samedi idéal :",
          "options": [
            {
              "id": "sp",
              "label": "Un cocon à la maison, tranquille et confortable.",
              "tag": "conservation"
            },
            {
              "id": "so",
              "label": "Un dîner avec des amis, voir du monde ensemble.",
              "tag": "social"
            },
            {
              "id": "sx",
              "label": "Un tête-à-tête intense, une longue discussion rien que vous deux.",
              "tag": "tête-à-tête"
            }
          ]
        },
        {
          "id": "souci",
          "kind": "single",
          "text": "Et ce qui te ferait le plus souffrir dans un couple :",
          "options": [
            {
              "id": "sp",
              "label": "Manquer de sécurité : un foyer instable, des soucis d'argent, l'imprévu permanent."
            },
            {
              "id": "so",
              "label": "Être tenu·e à l'écart : un partenaire qui ne partage pas sa vie sociale, ou que tes proches n'apprécient pas."
            },
            {
              "id": "sx",
              "label": "Perdre l'étincelle : une relation tiède, sans désir ni vraie connexion."
            }
          ]
        }
      ]
    },
    {
      "id": "quotidien",
      "type": "blocks",
      "eyebrow": "Ton quotidien à deux",
      "text": "Trois petites scènes du quotidien. Que fais-tu, honnêtement ?",
      "help": "Ta réponse dit à la fois ton style et ce que tu peux tolérer chez l'autre.",
      "blocks": [
        {
          "id": "ordre",
          "kind": "single",
          "text": "Ton partenaire laisse traîner la vaisselle et ses vêtements depuis 3 jours.",
          "options": [
            {
              "id": "ouvert",
              "label": "Ça ne me dérange pas."
            },
            {
              "id": "tait",
              "label": "Je range sans rien dire, mais ça m'agace."
            },
            {
              "id": "accord",
              "label": "J'en parle calmement et on se répartit les tâches."
            },
            {
              "id": "conflit",
              "label": "Pour moi, c'est un sujet de dispute qui revient sans cesse."
            }
          ]
        },
        {
          "id": "ordreSelf",
          "kind": "self",
          "text": "Et toi, honnêtement :",
          "options": [
            {
              "id": "gauche",
              "label": "Plutôt bordélique"
            },
            {
              "id": "milieu",
              "label": "Entre les deux"
            },
            {
              "id": "droite",
              "label": "Plutôt ordonné·e"
            }
          ]
        },
        {
          "id": "argent",
          "kind": "single",
          "text": "Ton partenaire rentre avec un objet à 300 €, acheté sur un coup de cœur.",
          "options": [
            {
              "id": "ouvert",
              "label": "Tant mieux, s'il se fait plaisir."
            },
            {
              "id": "tait",
              "label": "Je ne dis rien, mais je refais les comptes dans ma tête."
            },
            {
              "id": "accord",
              "label": "On en parle et on se fixe chacun un budget plaisir."
            },
            {
              "id": "conflit",
              "label": "Ça me met hors de moi, l'argent est un vrai sujet de tension."
            }
          ]
        },
        {
          "id": "argentSelf",
          "kind": "self",
          "text": "Et toi, honnêtement :",
          "options": [
            {
              "id": "gauche",
              "label": "Plutôt dépensier·ère"
            },
            {
              "id": "milieu",
              "label": "Entre les deux"
            },
            {
              "id": "droite",
              "label": "Plutôt économe"
            }
          ]
        },
        {
          "id": "vacances",
          "kind": "single",
          "text": "Vous partez en vacances dans une semaine. Ton partenaire n'a rien réservé et te dit : « On verra sur place ! »",
          "options": [
            {
              "id": "ouvert",
              "label": "Génial, j'adore l'aventure."
            },
            {
              "id": "tait",
              "label": "Je réserve tout seul·e, en ruminant."
            },
            {
              "id": "accord",
              "label": "On se met d'accord : on réserve les nuits, on improvise le reste."
            },
            {
              "id": "conflit",
              "label": "Ça m'angoisse, c'est un sujet de dispute à chaque voyage."
            }
          ]
        },
        {
          "id": "vacancesSelf",
          "kind": "self",
          "text": "Et toi, honnêtement :",
          "options": [
            {
              "id": "gauche",
              "label": "Plutôt spontané·e"
            },
            {
              "id": "milieu",
              "label": "Entre les deux"
            },
            {
              "id": "droite",
              "label": "Plutôt planificateur·rice"
            }
          ]
        }
      ]
    },
    {
      "id": "defauts",
      "type": "sort",
      "eyebrow": "Les défauts",
      "text": "Personne n'est parfait. Quels défauts pourrais-tu vivre au quotidien ?",
      "help": "Range chaque défaut dans une colonne. Rappel : on ne change pas l'autre. Sois honnête sur ce que tu pourrais encore accepter dans dix ans.",
      "items": [
        "desordre",
        "retard",
        "depensier",
        "radin",
        "ecrans",
        "casanier",
        "fetard",
        "jaloux",
        "susceptible",
        "boude",
        "colere",
        "indecis",
        "controle",
        "travail",
        "froid"
      ]
    },
    {
      "id": "valeurs",
      "type": "values",
      "eyebrow": "Tes valeurs et ta direction",
      "text": "Ce qui compte pour ton projet de vie",
      "help": "Pour chaque ligne, choisis ta position, puis dis si c'est négociable.",
      "topics": [
        "enfants",
        "lieu",
        "argent",
        "famille",
        "spiritualite",
        "liberte"
      ]
    },
    {
      "id": "histoires",
      "type": "blocks",
      "eyebrow": "Tes histoires",
      "text": "Ce qui se répète peut-être dans tes histoires",
      "help": "Pense à tes relations passées, pas seulement à la dernière.",
      "blocks": [
        {
          "id": "scene",
          "kind": "single",
          "text": "Laquelle de ces scènes te semble la plus familière ?",
          "options": [
            {
              "id": "attente",
              "label": "Il est 23 h. Ton message est lu depuis trois heures, toujours sans réponse, et tu n'arrives pas à penser à autre chose."
            },
            {
              "id": "etouffement",
              "label": "Ton partenaire te demande, encore, ce que tu fais ce soir et avec qui. Tu sens l'air te manquer."
            },
            {
              "id": "effacement",
              "label": "On te demande où tu veux dîner. Tu réponds « comme tu veux », comme d'habitude, alors que tu avais une idée."
            },
            {
              "id": "jamaisassez",
              "label": "Tu as préparé un bon dîner. Ton partenaire remarque surtout que c'est un peu trop salé, et ça te touche plus que de raison."
            },
            {
              "id": "sauveur",
              "label": "Ton partenaire traverse encore une crise. Tu annules ta soirée pour le ou la soutenir, comme souvent."
            },
            {
              "id": "aucun",
              "label": "Aucune de ces scènes ne me parle vraiment."
            }
          ]
        },
        {
          "id": "attirance",
          "kind": "single",
          "text": "Au début, la personne qui t'attire le plus fort est souvent...",
          "options": [
            {
              "id": "attente",
              "label": "un peu insaisissable, difficile à cerner, pas toujours disponible."
            },
            {
              "id": "etouffement",
              "label": "très présente, très demandeuse, qui veut tout partager tout de suite."
            },
            {
              "id": "effacement",
              "label": "une forte personnalité, sûre d'elle, qui prend beaucoup de place."
            },
            {
              "id": "jamaisassez",
              "label": "exigeante, brillante, difficile à impressionner."
            },
            {
              "id": "sauveur",
              "label": "blessée, en difficulté, qui a besoin de quelqu'un comme toi."
            },
            {
              "id": "aucun",
              "label": "Je ne remarque pas de type particulier."
            }
          ]
        }
      ]
    },
    {
      "id": "securite",
      "type": "single",
      "private": true,
      "eyebrow": "Respect et sécurité",
      "text": "Dernière question, et elle compte. Dans une relation, t'est-il arrivé d'avoir peur de l'autre, ou de te sentir régulièrement rabaissé·e, contrôlé·e ou menacé·e ?",
      "options": [
        {
          "id": "non",
          "label": "Non, jamais."
        },
        {
          "id": "passe",
          "label": "Oui, dans une relation passée."
        },
        {
          "id": "doute",
          "label": "Je ne suis pas sûr·e, parfois je me pose la question."
        },
        {
          "id": "present",
          "label": "Oui, dans ma relation actuelle."
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
    "pattern": [
      "attente",
      "effacement",
      "jamaisassez",
      "sauveur",
      "etouffement"
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
  "drains": {
    "pas_seul": {
      "label": "Ne jamais avoir un moment à moi.",
      "short": "ne jamais avoir un moment à toi"
    },
    "sorties": {
      "label": "Devoir sortir ou recevoir alors que je suis épuisé·e.",
      "short": "devoir sortir quand tu es épuisé·e"
    },
    "casanier": {
      "label": "Rester enfermé·e à la maison tout le week-end.",
      "short": "rester enfermé·e tout le week-end"
    },
    "conflits": {
      "label": "Les tensions qui traînent, les non-dits.",
      "short": "les tensions qui traînent"
    },
    "plaintes": {
      "label": "Porter les problèmes de l'autre tous les soirs.",
      "short": "porter les problèmes de l'autre tous les soirs"
    },
    "bruit": {
      "label": "Le bruit, les écrans allumés en permanence.",
      "short": "le bruit et les écrans permanents"
    },
    "charge": {
      "label": "Porter seul·e la charge du quotidien.",
      "short": "porter seul·e la charge du quotidien"
    },
    "imprevu": {
      "label": "L'imprévu permanent, ne jamais savoir ce qu'on fait.",
      "short": "l'imprévu permanent"
    }
  },
  "languages": {
    "paroles": {
      "name": "Les paroles valorisantes",
      "lower": "les paroles valorisantes",
      "recv": "Les mots comptent énormément pour toi. Un compliment sincère, un « je t'aime » dit au bon moment, un message qui reconnaît ce que tu fais te remplissent pour plusieurs jours. À l'inverse, une critique sèche ou un long silence peuvent te blesser plus que l'autre ne l'imagine.",
      "recvTips": [
        "Dis-le clairement à ton partenaire : « Ce qui me touche le plus, c'est quand tu me dis ce que tu apprécies chez moi. »",
        "Remarque les mots gentils quand ils arrivent, et dis merci : on répète ce qui est accueilli.",
        "Si les reproches sont fréquents, demande qu'ils soient formulés sur un fait précis, jamais sur ce que tu es."
      ],
      "give": "Tu aimes avec des mots. Tu encourages, tu complimentes, tu écris. C'est un vrai cadeau, à condition que l'autre les entende comme tu les donnes.",
      "giveTips": [
        "Si ton partenaire a un autre langage, accompagne tes mots d'un geste dans le sien.",
        "Tes mots ont du poids, dans les deux sens : en période de tension, ils peuvent aussi blesser plus que tu ne le penses."
      ],
      "sentence": "« Ce qui me touche le plus, c'est quand tu me dis ce que tu aimes chez moi. »",
      "partnerHint": "met des mots sur ce qu'il ou elle ressent et apprécie chez toi"
    },
    "moments": {
      "name": "Les moments de qualité",
      "lower": "les moments de qualité",
      "recv": "Pour toi, l'amour, c'est de la présence. Pas seulement être dans la même pièce : être vraiment là, attentif, sans écran, disponible. Une soirée où l'autre t'écoute pleinement vaut plus qu'un beau cadeau. Être remis·e à plus tard, encore et encore, te fait douter d'être important·e.",
      "recvTips": [
        "Propose un rendez-vous fixe, même court : 30 minutes par jour sans téléphone, ou une soirée par semaine rien qu'à deux.",
        "Dis ce qui compte : « Quand tu poses ton téléphone pour m'écouter, je me sens aimé·e. »",
        "Repère les moments partagés qui existent déjà (un café, un trajet) et donne-leur de la valeur."
      ],
      "give": "Tu aimes en donnant ton temps et ton attention. Tu organises des moments, tu écoutes, tu es là. C'est précieux, et rare.",
      "giveTips": [
        "Si l'autre a besoin d'autre chose (des mots, de l'aide concrète), ta présence peut passer inaperçue : demande-lui ce qui le ou la touche.",
        "Garde aussi des moments pour toi seul·e : on ne peut pas être présent·e à l'autre si on s'est vidé·e."
      ],
      "sentence": "« Ce qui me touche le plus, c'est quand on prend du temps rien que pour nous, sans écran. »",
      "partnerHint": "t'offre du temps et une attention pleine, sans distraction"
    },
    "cadeaux": {
      "name": "Les cadeaux",
      "lower": "les cadeaux et les attentions",
      "recv": "Ce n'est pas une question de prix. Ce qui te touche, c'est la preuve que l'autre a pensé à toi : un petit mot, un objet trouvé en route, une attention pour une date qui compte. Un oubli, surtout répété, peut te faire sentir invisible.",
      "recvTips": [
        "Explique que ce n'est pas matériel : « Un petit rien qui prouve que tu as pensé à moi me touche énormément. »",
        "Partage tes dates importantes et quelques idées simples : on ne devine pas toujours.",
        "Garde une trace des attentions reçues (une boîte, une photo) : elles nourrissent dans les jours plus difficiles."
      ],
      "give": "Tu aimes par les attentions. Tu penses à l'autre, tu trouves l'objet qui lui ressemble, tu marques les dates. C'est une façon de dire « je t'ai dans la tête ».",
      "giveTips": [
        "Si l'autre ne réagit pas beaucoup, ce n'est pas forcément de l'ingratitude : son langage est peut-être ailleurs.",
        "Varie avec des « cadeaux de temps » ou des mots écrits : ils parlent à plus de monde."
      ],
      "sentence": "« Ce qui me touche le plus, c'est un petit rien qui me prouve que tu as pensé à moi. »",
      "partnerHint": "pense à toi et te le prouve par de petites attentions"
    },
    "services": {
      "name": "Les services rendus",
      "lower": "les services rendus",
      "recv": "Pour toi, aimer se voit dans les actes. Quand l'autre prend en charge une tâche, anticipe ce qui te pèse, partage vraiment la charge du quotidien, tu te sens aimé·e. Les belles paroles sans actes, en revanche, sonnent creux.",
      "recvTips": [
        "Nomme précisément ce qui te soulagerait : « Si tu t'occupes des courses le samedi, je me sens soutenu·e. »",
        "Remercie les gestes concrets : ils sont ton carburant, dis-le.",
        "Si la charge est déséquilibrée depuis longtemps, mets le sujet sur la table calmement, liste à l'appui."
      ],
      "give": "Tu aimes en agissant. Tu rends service, tu répares, tu facilites la vie de l'autre. On peut compter sur toi.",
      "giveTips": [
        "Attention à ne pas devenir la personne qui fait tout : aimer n'est pas se sacrifier.",
        "Si l'autre attend des mots ou du temps, tes services peuvent passer pour de la routine : ajoutes-y un moment ou une phrase."
      ],
      "sentence": "« Ce qui me touche le plus, c'est quand tu me soulages concrètement, sans que j'aie à demander. »",
      "partnerHint": "agit concrètement et partage vraiment la charge du quotidien"
    },
    "toucher": {
      "name": "Le toucher physique",
      "lower": "le toucher physique",
      "recv": "Le contact physique est ton langage le plus direct : une main tenue, un câlin, une caresse en passant. Il te rassure et te relie, bien au-delà de la sexualité. Un partenaire distant physiquement peut te donner le sentiment d'être rejeté·e, même s'il t'aime.",
      "recvTips": [
        "Dites-le simplement : « Un câlin le matin, ta main dans la mienne, c'est ce qui me rassure le plus. »",
        "Propose des gestes du quotidien, pas seulement des moments intimes.",
        "Si l'autre est peu tactile, cherche ensemble des gestes qui lui conviennent aussi, sans forcer."
      ],
      "give": "Tu aimes par le contact. Tu prends la main, tu enlaces, tu rassures par le corps. C'est chaleureux et apaisant.",
      "giveTips": [
        "Vérifie que l'autre reçoit le toucher comme toi : pour certaines personnes, il faut d'abord des mots ou du temps.",
        "Le consentement et le rythme de l'autre restent la règle, même dans un couple installé."
      ],
      "sentence": "« Ce qui me touche le plus, c'est un câlin, ta main dans la mienne, le contact. »",
      "partnerHint": "est à l'aise avec le contact physique et l'offre spontanément"
    }
  },
  "langGap": {
    "same": "Tu donnes l'amour dans la langue où tu aimes le recevoir. C'est cohérent, et cela te rend lisible. Le risque : croire que tout le monde fonctionne ainsi. Si ton partenaire a un autre langage, tu pourrais te sentir peu aimé·e alors qu'il ou elle t'aime à sa façon.",
    "diff": "Tu ne donnes pas l'amour dans la langue où tu as besoin de le recevoir. C'est très fréquent, et c'est une source classique de malentendus : tu peux beaucoup donner sans jamais recevoir ce qui te nourrit, simplement parce que personne ne le sait. Ton premier pas : le dire.",
    "noSecondary": "Un seul langage ressort nettement chez toi. C'est une information précieuse : tu sais exactement ce qui te nourrit."
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
    "confidence": {
      "forte": "Ton portrait et ta réaction sous pression vont dans le même sens : c'est une piste solide, à confirmer avec le temps.",
      "a_verifier": "Ton portrait et ta réaction sous pression ne disent pas tout à fait la même chose. Garde deux pistes ouvertes : {typeLabel} et {altLabel}."
    },
    "disclaimer": "L'ennéagramme est une hypothèse de départ, pas une étiquette. Trois écrans ne suffisent pas à trouver ton type avec certitude : prends ce résultat comme une piste à explorer, idéalement accompagné·e.",
    "credit": "L'ennéagramme décrit 9 motivations de base et 3 instincts (conservation, social, tête-à-tête)."
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
  "scenarios": {
    "ordre": {
      "name": "l'ordre et le rangement",
      "friction": "Un partenaire très bordélique, dont le désordre envahit ton espace.",
      "completeLeft": "Un partenaire un peu plus organisé que toi peut alléger ta charge mentale, sans t'enfermer.",
      "completeRight": "Un partenaire un peu plus détendu sur l'ordre peut t'aider à lâcher prise et à profiter."
    },
    "argent": {
      "name": "l'argent au quotidien",
      "friction": "Un partenaire dépensier, qui t'inquiète à chaque fin de mois.",
      "completeLeft": "Un partenaire un peu plus prudent que toi peut sécuriser vos projets communs.",
      "completeRight": "Un partenaire un peu plus généreux avec l'argent peut t'aider à te faire plaisir."
    },
    "vacances": {
      "name": "l'imprévu et la planification",
      "friction": "Un partenaire qui improvise tout et te laisse sans visibilité.",
      "completeLeft": "Un partenaire plus organisé peut donner un cadre rassurant à tes envies.",
      "completeRight": "Un partenaire plus spontané peut mettre de l'imprévu et de la fantaisie dans ta vie."
    }
  },
  "scenarioNotes": {
    "ouvert": "Cette différence ne te gêne pas : elle peut même te compléter.",
    "tait": "Attention au silence : faire à la place de l'autre sans rien dire nourrit une rancœur qui finit par exploser. Dis-le tôt, calmement.",
    "accord": "Tu sais transformer une différence en accord : c'est exactement ce qui rend la complémentarité vivable.",
    "conflit": "Ici, la différence t'use. Avec un partenaire très différent sur ce point, la même dispute risque de revenir pendant des années.",
    "noFriction": "Aucune scène du quotidien ne t'use vraiment. Garde quand même un œil sur ce qui touche tes besoins essentiels.",
    "noComplement": "Tu es plutôt au milieu sur ces différences du quotidien. C'est une vraie souplesse : la plupart des écarts de forme seront faciles à vivre."
  },
  "flaws": {
    "desordre": {
      "label": "Bordélique, laisse traîner ses affaires",
      "short": "bordélique"
    },
    "retard": {
      "label": "Souvent en retard",
      "short": "souvent en retard"
    },
    "depensier": {
      "label": "Dépensier·ère",
      "short": "dépensier·ère"
    },
    "radin": {
      "label": "Très près de ses sous",
      "short": "très près de ses sous"
    },
    "ecrans": {
      "label": "Toujours sur son téléphone ou devant un écran",
      "short": "collé·e à ses écrans"
    },
    "casanier": {
      "label": "Casanier·ère, n'aime pas sortir",
      "short": "casanier·ère"
    },
    "fetard": {
      "label": "Fêtard·e, a besoin de sortir souvent",
      "short": "qui a besoin de sortir sans arrêt"
    },
    "jaloux": {
      "label": "Jaloux·se, veut savoir où tu es",
      "short": "jaloux·se"
    },
    "susceptible": {
      "label": "Susceptible, se vexe vite",
      "short": "susceptible"
    },
    "boude": {
      "label": "Boude ou se ferme au lieu de parler",
      "short": "qui boude au lieu de parler"
    },
    "colere": {
      "label": "S'emporte vite, hausse le ton",
      "short": "qui s'emporte vite"
    },
    "indecis": {
      "label": "Indécis·e, a du mal à s'engager",
      "short": "qui a du mal à s'engager"
    },
    "controle": {
      "label": "Veut tout organiser, tout contrôler",
      "short": "qui veut tout contrôler"
    },
    "travail": {
      "label": "Très pris·e par son travail",
      "short": "absorbé·e par son travail"
    },
    "froid": {
      "label": "Peu démonstratif·ve, dit rarement « je t'aime »",
      "short": "peu démonstratif·ve"
    }
  },
  "flawColumns": [
    {
      "id": "ok",
      "label": "Acceptable"
    },
    {
      "id": "discuter",
      "label": "À discuter"
    },
    {
      "id": "nn",
      "label": "Non négociable"
    }
  ],
  "valueTopics": [
    {
      "id": "enfants",
      "topicLabel": "Les enfants",
      "levels": {
        "souple": "Fort",
        "important": "Critique",
        "nn": "Critique"
      },
      "options": [
        {
          "id": "oui",
          "chip": "J'en veux",
          "label": "J'en veux (ou j'en veux d'autres).",
          "mine": "Avoir des enfants (ou d'autres enfants)",
          "opposite": "Un partenaire qui ne veut pas d'enfants"
        },
        {
          "id": "non",
          "chip": "Je n'en veux pas",
          "label": "Je n'en veux pas (ou pas d'autres).",
          "mine": "Une vie sans enfants (ou sans autres enfants)",
          "opposite": "Un partenaire qui veut absolument des enfants"
        },
        {
          "id": "miens",
          "chip": "J'ai des enfants, à accueillir",
          "label": "J'ai déjà des enfants, et ils doivent être pleinement accueillis.",
          "mine": "Que mes enfants soient pleinement accueillis",
          "opposite": "Un partenaire qui ne veut pas partager sa vie avec mes enfants"
        },
        {
          "id": "flou",
          "chip": "Je ne sais pas",
          "label": "Je ne sais pas encore.",
          "neutral": true
        }
      ]
    },
    {
      "id": "lieu",
      "topicLabel": "Le lieu de vie",
      "levels": {
        "souple": "Faible",
        "important": "Fort",
        "nn": "Critique"
      },
      "options": [
        {
          "id": "ville",
          "chip": "En ville",
          "label": "En ville, près de tout.",
          "mine": "Vivre en ville",
          "opposite": "Un partenaire qui ne se voit vivre qu'à la campagne, loin de tout"
        },
        {
          "id": "campagne",
          "chip": "À la campagne",
          "label": "À la campagne, au calme, près de la nature.",
          "mine": "Vivre au calme, près de la nature",
          "opposite": "Un partenaire qui ne peut vivre qu'en pleine ville"
        },
        {
          "id": "ailleurs",
          "chip": "Ailleurs, bouger",
          "label": "Ailleurs, à l'étranger ou en mouvement : j'ai besoin de bouger.",
          "mine": "Garder la possibilité de partir vivre ailleurs",
          "opposite": "Un partenaire qui ne quittera jamais sa région"
        },
        {
          "id": "racines",
          "chip": "Près de mes racines",
          "label": "Là où sont mes racines, près de mes proches.",
          "mine": "Rester près de mes racines et de mes proches",
          "opposite": "Un partenaire qui veut partir vivre loin, ou à l'étranger"
        },
        {
          "id": "egal",
          "chip": "Peu importe",
          "label": "Peu importe, tant qu'on est bien.",
          "neutral": true
        }
      ]
    },
    {
      "id": "argent",
      "topicLabel": "L'argent",
      "levels": {
        "souple": "Faible",
        "important": "Fort",
        "nn": "Critique"
      },
      "options": [
        {
          "id": "securite",
          "chip": "Épargner, prévoir",
          "label": "être en sécurité : épargner, prévoir, ne pas manquer.",
          "mine": "Une gestion prudente de l'argent, une épargne pour l'avenir",
          "opposite": "Un partenaire qui dépense sans compter ou s'endette facilement"
        },
        {
          "id": "vivre",
          "chip": "Profiter",
          "label": "profiter de la vie : voyages, sorties, plaisirs.",
          "mine": "Profiter de la vie, sans tout calculer",
          "opposite": "Un partenaire qui vit chaque dépense comme un danger"
        },
        {
          "id": "commun",
          "chip": "Tout en commun",
          "label": "construire ensemble, en toute transparence, en mettant tout en commun.",
          "mine": "Une transparence totale et un argent mis en commun",
          "opposite": "Un partenaire secret ou très cloisonné sur l'argent"
        },
        {
          "id": "autonomie",
          "chip": "Chacun son indépendance",
          "label": "garder chacun son indépendance financière.",
          "mine": "Garder mon indépendance financière",
          "opposite": "Un partenaire qui veut tout mettre en commun, sans compte à soi"
        },
        {
          "id": "egal",
          "chip": "Je m'adapte",
          "label": "Je m'adapte, ce n'est pas un sujet pour moi.",
          "neutral": true
        }
      ]
    },
    {
      "id": "famille",
      "topicLabel": "La place de la famille",
      "levels": {
        "souple": "Faible",
        "important": "Fort",
        "nn": "Critique"
      },
      "options": [
        {
          "id": "proche",
          "chip": "Très présente",
          "label": "Très présente : repas réguliers, vacances ensemble, entraide.",
          "mine": "Une famille très présente dans notre vie",
          "opposite": "Un partenaire qui veut garder la famille à distance"
        },
        {
          "id": "bulle",
          "chip": "À distance",
          "label": "À distance : je préfère que notre couple reste notre bulle.",
          "mine": "Un couple protégé, avec la famille à distance",
          "opposite": "Un partenaire dont la famille décide ou s'invite en permanence"
        },
        {
          "id": "equilibre",
          "chip": "Présente, avec des limites",
          "label": "Présente, avec des limites claires.",
          "neutral": true
        }
      ]
    },
    {
      "id": "spiritualite",
      "topicLabel": "La spiritualité",
      "levels": {
        "souple": "Faible",
        "important": "Fort",
        "nn": "Critique"
      },
      "options": [
        {
          "id": "centrale",
          "chip": "Au centre de ma vie",
          "label": "Elle est au centre de ma vie (pratique, communauté, rituels).",
          "mine": "Partager ma foi ou ma pratique spirituelle",
          "opposite": "Un partenaire qui rejette ou méprise ce qui est sacré pour moi"
        },
        {
          "id": "intime",
          "chip": "Personnelle",
          "label": "Elle compte, mais je la vis de façon personnelle.",
          "mine": "Que ma vie intérieure soit respectée, même si elle n'est pas partagée",
          "opposite": "Un partenaire qui se moque de ma quête de sens"
        },
        {
          "id": "absente",
          "chip": "Absente",
          "label": "Elle ne fait pas partie de ma vie.",
          "mine": "Une vie sans pratique religieuse imposée",
          "opposite": "Un partenaire qui voudrait m'imposer une pratique religieuse"
        },
        {
          "id": "egal",
          "chip": "Je m'adapte",
          "label": "Je m'adapte facilement à ce que vit l'autre.",
          "neutral": true
        }
      ]
    },
    {
      "id": "liberte",
      "topicLabel": "Liberté et fusion",
      "levels": {
        "souple": "Faible",
        "important": "Critique",
        "nn": "Critique"
      },
      "options": [
        {
          "id": "fusion",
          "chip": "Fusion",
          "label": "Fusion : tout partager, se voir tous les jours, faire presque tout ensemble.",
          "mine": "Une relation très proche, où l'on partage presque tout",
          "opposite": "Un partenaire qui a besoin de beaucoup d'indépendance et de temps seul"
        },
        {
          "id": "liberte",
          "chip": "Liberté",
          "label": "Liberté : chacun sa vie, ses amis, ses temps seuls, et on se retrouve.",
          "mine": "Une relation qui respecte largement mon indépendance",
          "opposite": "Un partenaire qui veut tout partager et vit mal mes temps seuls"
        },
        {
          "id": "entre",
          "chip": "Entre les deux",
          "label": "Entre les deux : proches, avec chacun son jardin secret.",
          "neutral": true
        }
      ]
    }
  ],
  "firmness": [
    {
      "id": "souple",
      "label": "Négociable"
    },
    {
      "id": "important",
      "label": "Important"
    },
    {
      "id": "nn",
      "label": "Non négociable"
    }
  ],
  "patterns": {
    "attente": {
      "name": "Le scénario de l'attente",
      "summary": "Il se peut que tu sois souvent attiré·e par des personnes peu disponibles, et que tu passes beaucoup d'énergie à attendre un signe, une preuve, un engagement. Plus l'autre se dérobe, plus tu t'accroches.",
      "imago": "Selon l'approche Imago, nous sommes attirés par ce qui nous est familier. Si une présence a manqué ou était imprévisible autrefois, l'incertitude peut ressembler, sans qu'on le veuille, à de l'amour. L'intensité de l'attente n'est pas la preuve de l'amour.",
      "trigger": "un message sans réponse, un plan annulé, un silence",
      "reactive": "Une personne insaisissable, ambiguë, qui souffle le chaud et le froid.",
      "healing": "Une personne régulière et fiable, dont la présence te semblera peut-être moins « électrique » au début. Ce calme n'est pas de l'ennui : c'est de la sécurité.",
      "questions": [
        "Dans mes histoires, qui attendait l'autre, et qu'est-ce que j'attendais vraiment ?",
        "Est-ce que je confonds parfois l'intensité de l'attente avec la force de l'amour ?",
        "Quelle personne fiable ai-je trouvée « pas assez excitante », et pourquoi ?"
      ],
      "step": "La prochaine fois qu'un silence t'angoisse, note ce que tu ressens avant d'agir, et attends une heure avant de relancer.",
      "danger": "l'attirance pour les personnes insaisissables"
    },
    "etouffement": {
      "name": "Le scénario de l'étouffement",
      "summary": "Il se peut qu'au bout d'un moment, la proximité te donne l'impression d'étouffer. Tu as besoin d'air, l'autre le vit comme un rejet, il ou elle se rapproche, et tu recules encore.",
      "imago": "Selon l'approche Imago, ce qui a été vécu autrefois laisse des traces. Si l'on a peu respecté ton espace, une relation proche peut réveiller la sensation d'être envahi·e, même quand l'autre ne te veut que du bien.",
      "trigger": "les questions sur ton emploi du temps, les demandes de présence",
      "reactive": "Une personne très fusionnelle, qui vit mal tes temps seuls et te demande des comptes.",
      "healing": "Une personne proche et sécurisante, qui a aussi sa propre vie et te laisse respirer sans se sentir abandonnée.",
      "questions": [
        "Quand je me sens envahi·e, est-ce l'autre qui en fait trop, ou une vieille alarme qui sonne ?",
        "Ai-je déjà dit clairement de quel espace j'ai besoin, avec des mots simples et un rythme précis ?",
        "Qu'est-ce que je risquerais si je me laissais vraiment approcher ?"
      ],
      "step": "Annonce tes temps seuls à l'avance (« jeudi soir, j'ai besoin d'être seul·e, et samedi je suis tout à toi ») au lieu de t'éloigner sans prévenir.",
      "danger": "ta tendance à fuir dès que l'autre se rapproche"
    },
    "effacement": {
      "name": "Le scénario de l'effacement",
      "summary": "Il se peut que tu t'adaptes tellement à l'autre que tu finisses par te perdre de vue. Tu dis oui pour préserver le lien, et un jour, la fatigue ou la colère remonte d'un coup.",
      "imago": "Selon l'approche Imago, nous rejouons parfois ce que nous avons appris pour être aimés. Si être sage et ne pas déranger était la condition pour recevoir de l'affection, s'effacer peut sembler normal, voire vertueux.",
      "trigger": "le sentiment que tes besoins passent toujours après",
      "reactive": "Une forte personnalité qui prend beaucoup de place, décide pour deux et ne te pose pas de questions.",
      "healing": "Une personne curieuse de toi, qui te demande ton avis et te laisse le temps de répondre.",
      "questions": [
        "Quand ai-je dit oui pour la dernière fois alors que je pensais non ?",
        "Qu'est-ce que je crains qu'il arrive si je dis ce que je veux vraiment ?",
        "Dans mes relations, qui choisit les sorties, le rythme, les projets ?"
      ],
      "step": "Cette semaine, exprime une préférence par jour, même minuscule (le film, le restaurant, l'heure). C'est un muscle.",
      "danger": "ta tendance à t'effacer pour garder le lien"
    },
    "jamaisassez": {
      "name": "Le scénario du « jamais assez »",
      "summary": "Il se peut que tu aies souvent l'impression de devoir mériter l'amour. Tu te sens jugé·e, pas tout à fait à la hauteur, et tu es peut-être attiré·e par des personnes exigeantes dont tu attends l'approbation.",
      "imago": "Selon l'approche Imago, nous cherchons parfois chez l'autre la reconnaissance qui nous a manqué. Si l'amour semblait conditionné à la réussite, séduire quelqu'un de difficile à impressionner peut ressembler à une victoire, et ses critiques, à une vérité.",
      "trigger": "une remarque, même gentille, sur ce que tu as mal fait",
      "reactive": "Une personne exigeante, critique, avare de compliments, qui te fait sentir que tu pourrais mieux faire.",
      "healing": "Une personne qui t'apprécie tel·le que tu es, et te le dit, sans que tu aies à le gagner.",
      "questions": [
        "De qui ai-je le plus cherché l'approbation dans ma vie, et est-ce que cela ressemble à mes histoires ?",
        "Suis-je attiré·e par l'amour qu'on me donne, ou par celui que je dois conquérir ?",
        "Qu'est-ce que je me dis quand quelqu'un m'aime sans condition ?"
      ],
      "step": "Note chaque soir une chose que tu as bien faite, sans la minimiser. Puis observe qui, autour de toi, te la dit naturellement.",
      "danger": "l'attirance pour les personnes qui te font sentir « pas assez »"
    },
    "sauveur": {
      "name": "Le scénario du sauveur",
      "summary": "Il se peut que tu tombes souvent amoureux·se de personnes en difficulté, que tu veux aider, soutenir, réparer. Tu donnes beaucoup, et tu attends, parfois longtemps, que l'autre change.",
      "imago": "Selon l'approche Imago, nos rôles d'enfance nous suivent. Si tu as pris soin des autres très tôt, être indispensable peut ressembler à être aimé·e. Mais on ne peut pas changer quelqu'un : lui demander de changer, c'est lui demander d'arrêter d'être lui-même.",
      "trigger": "voir l'autre aller mal sans pouvoir l'aider",
      "reactive": "Une personne blessée, instable ou en crise, qui a besoin d'être sauvée et te fait sentir indispensable.",
      "healing": "Une personne autonome, qui prend soin d'elle-même et peut aussi prendre soin de toi.",
      "questions": [
        "Est-ce que j'aime la personne telle qu'elle est aujourd'hui, ou celle qu'elle pourrait devenir ?",
        "Qui prend soin de moi, dans mes relations ?",
        "Que me reste-t-il si je ne suis plus celui ou celle qui aide ?"
      ],
      "step": "Avant d'aider, demande : « Est-ce que tu veux que je t'aide, ou que je t'écoute ? » Et laisse l'autre répondre.",
      "danger": "l'envie de sauver quelqu'un plutôt que de l'aimer tel qu'il est"
    }
  },
  "patternLevels": {
    "net": "Ce scénario ressort nettement de tes réponses. Il mérite qu'on s'y arrête.",
    "leger": "Ce scénario apparaît un peu dans tes réponses. Prends-le comme une piste légère, à vérifier avec tes souvenirs réels.",
    "aucun": "Aucun scénario répété ne ressort clairement de tes réponses. Tant mieux, ou peut-être pas encore visible. Si tu as déjà vécu plusieurs histoires douloureuses qui se ressemblent, regarde ce qu'elles ont en commun : le début, le type de personne, la façon dont cela s'est terminé."
  },
  "aucunQuestions": [
    "Qu'ont en commun les personnes qui m'ont le plus attiré·e ?",
    "Comment mes histoires importantes se sont-elles terminées, et qui est parti ?",
    "Qu'est-ce que je répète, même dans les histoires heureuses ?"
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
      "text": "Mépris, humiliation, contrôle, menaces, violence physique, psychologique, sexuelle ou économique. Ce ne sont pas des incompatibilités : ce sont des signaux de danger, qui appellent l'aide d'un professionnel."
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
    "need": "{prenom}, ce dont tu as vraiment besoin : {needs}, te sentir aimé·e à travers {recvLower}, et du temps pour te recharger {rechargeShort}.",
    "danger": "Ce qui te met en danger : {anti}, {nnDanger}, et {third}.",
    "ennea": "Ta piste ennéagramme, à vérifier : type {n} ({name}), sous-type {instinctName}. {instinctCouple}",
    "nnFallback": "l'espoir de changer l'autre un jour"
  },
  "shareTemplate": [
    "Mon profil amoureux · Quiz Amour Magic Humans",
    "{s1}",
    "{s2}",
    "{s3}",
    "Fais le quiz toi aussi : {quizUrl}"
  ],
  "exportTemplate": [
    "TON PROFIL AMOUREUX · Quiz Amour Magic Humans",
    "{prenom} · {title}",
    "",
    "{s1}",
    "{s2}",
    "{s3}",
    "",
    "Ce qui te nourrit : {needNames}",
    "Ce qui t'éteint : {antiText}",
    "Ton ressourcement : {rechargeLine}",
    "Ce qui te vide : {drainList}",
    "Tes langages : pour te sentir aimé·e, {recvName} (en second : {recv2Name}) ; pour donner, {giveName} (en second : {give2Name})",
    "Ta piste ennéagramme : {typeLabel}, sous-type {instinctName}. {confidenceText}",
    "Ton scénario à explorer : {patternName}",
    "",
    "Défauts acceptables : {flawsOk}",
    "À discuter : {flawsDiscuter}",
    "Non négociables : {flawsNn}",
    "",
    "Tes non-négociables de vie :",
    "{nnList}",
    "",
    "Le partenaire qui te complète :",
    "{completeList}",
    "",
    "Ce qui risque de frotter :",
    "{frictionList}",
    "",
    "Incompatibilité critique pour toi :",
    "{criticalList}",
    "",
    "Appel Découverte offert avec Pierre Sarazin : {calendly}",
    "Refaire le quiz : {quizUrl}"
  ]
};
if (typeof module !== "undefined" && module.exports) module.exports = AMOUR_DATA;
else root.AMOUR_DATA = AMOUR_DATA;
})(typeof window !== "undefined" ? window : globalThis);
