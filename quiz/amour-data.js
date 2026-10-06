/* Quiz Amour (mode ?theme=amour) · Magic Humans · données et textes, FR uniquement.
   Fichier de données pur : aucune logique d'affichage. Lu par quiz/amour.js et par les tests. */
(function (root) {
const AMOUR_DATA = {
  version: 1,

  config: {
    calendly: "https://calendly.com/pierre-j-sarazin?utm_source=sommet-love-connexion&utm_medium=quiz-amour&utm_campaign=amoureux-mais-malheureux",
    site: "https://www.magichumans.com/",
    quizUrl: "https://www.magichumans.com/quiz/?theme=amour",
    boussoleUrl: "/boussole-decision/importer-quiz/?theme=amour",
    matchingEmail: "sommetamourconnexion@gmail.com"
  },

  ui: {
    pageTitle: "Quiz Amour : choisir un partenaire qui te correspond vraiment",
    brand: "Magic Humans · Quiz Amour",
    footer: "Magic Humans · Ce quiz propose des pistes de réflexion, pas un diagnostic. Tes réponses restent sur ton appareil : rien n'est enregistré ni envoyé.",
    intro: {
      eyebrow: "Sommet Love & Connexion · Gratuit · 28 questions · 10 à 12 minutes",
      h1: "Amoureux, mais <em>malheureux</em> ?",
      lead: "L'émotion et la chimie ne suffisent pas à faire un couple heureux. Ce quiz t'aide à voir clair sur ce dont tu as vraiment besoin, sur ce qui t'éteint, et sur le type de partenaire qui te correspond, ou qui risque de te faire souffrir.",
      bullets: [
        "Ton langage de l'amour, celui que tu donnes et celui dont tu as besoin",
        "Le scénario qui se répète peut-être dans tes histoires",
        "Tes besoins essentiels, ton masque, la qualité qui déborde",
        "Tes non-négociables et le partenaire qui te complète"
      ],
      howto: "Réponds avec ton premier élan, en pensant à ce que tu vis vraiment, pas à ce qui serait idéal. Il n'y a ni bonne ni mauvaise réponse.",
      nameLabel: "Ton prénom",
      nameHelp: "Il sert seulement à personnaliser tes résultats, il ne quitte pas ton appareil.",
      nameErr: "Indique ton prénom pour personnaliser tes résultats.",
      start: "Commencer le quiz →"
    },
    quiz: {
      count: "Question {i} sur {n}",
      part: "Partie {p} sur {n} · {label}",
      prev: "← Retour",
      next: "Suivant →",
      last: "Voir mes résultats →",
      hintSingle: "Choisis la réponse qui te ressemble le plus.",
      hintValue: "Choisis ta position, puis dis à quel point c'est négociable.",
      hintGrid: "Place un curseur sur chaque ligne.",
      firmnessLabel: "Et pour toi, c'est...",
      gridHelp: "Choisis une case par ligne. Le milieu veut dire « ni l'un ni l'autre ».",
      privacy: "Cette réponse n'est ni enregistrée ni transmise."
    },
    parts: {
      ouverture: "Pour commencer",
      langages: "Tes langages de l'amour",
      imago: "Tes scénarios répétés",
      besoins: "Tes besoins essentiels",
      masque: "Ton masque relationnel",
      valeurs: "Tes valeurs et ta direction",
      forme: "Tes différences du quotidien",
      securite: "Respect et sécurité"
    },
    results: {
      eyebrow: "Résultats de {prenom}",
      titlePrefix: "Ton profil amoureux :",
      summaryLab: "En résumé",
      langH: "Tes langages de l'amour",
      langCredit: "D'après le concept des 5 langages de l'amour de Gary Chapman.",
      recvLab: "Ce dont tu as besoin pour te sentir aimé·e",
      giveLab: "La façon dont tu donnes de l'amour",
      secondaryLab: "En second :",
      tipsLab: "Concrètement",
      imagoH: "Le scénario qui se répète peut-être",
      imagoCredit: "Inspiré de la thérapie Imago de Harville Hendrix : nous sommes souvent attirés par ce qui nous est familier, y compris par ce qui nous a blessés.",
      imagoDisclaimer: "Ceci est une hypothèse de réflexion, pas un diagnostic. Toi seul·e sais si elle te parle.",
      imagoQuestionsLab: "Trois questions à te poser",
      reactiveLab: "Le type de partenaire qui réactive ce scénario",
      healingLab: "Le type de partenaire avec qui tu peux en sortir",
      needsH: "Tes besoins essentiels",
      needsPartnerLab: "Ce que cela demande à un partenaire",
      ctxLab: "Ton Contexte Déclencheur en couple : là où ton cœur s'ouvre",
      antiH: "Ton Anti-Contexte relationnel",
      antiIntro: "Ton Anti-Contexte, c'est l'environnement qui éteint ce qu'il y a de meilleur en toi. En couple, le voici :",
      ressH: "Ton Ressourcement à deux",
      maskH: "Ton masque et la qualité qui déborde",
      maskLab: "Ton masque :",
      qualityLab: "La qualité derrière le masque",
      overflowLab: "Quand elle déborde",
      maskPartnerLab: "Ce que cela demande à un partenaire",
      exerciseLab: "Petit exercice",
      nnH: "Mes non-négociables",
      nnIntro: "Ce sont les points sur lesquels tu ne peux pas plier sans te trahir. Les connaître tôt évite des années de souffrance.",
      nnCriticalLab: "Non-négociables (incompatibilité critique si l'autre est à l'opposé)",
      nnStrongLab: "Très importants (frictions fortes, à aborder tôt)",
      nnSoftLab: "Zones de souplesse",
      nnUniversalLab: "Pour tout le monde, sans exception",
      nnNoneCritical: "Tu n'as indiqué aucun point non négociable. C'est peut-être une vraie souplesse. Mais si tu as tendance à tout accepter, demande-toi : sur quoi ai-je déjà plié, et l'ai-je regretté ?",
      partnerH: "Le partenaire qui te correspond",
      partnerIntro: "Le bon critère n'est pas « quelqu'un sans défauts ». C'est quelqu'un dont tu peux accepter les défauts sur le long terme, parce qu'ils ne touchent pas tes besoins essentiels. Le même fond, des talents différents en surface.",
      completeLab: "Qui te complète",
      frictionLab: "Qui risque de frotter (à négocier)",
      criticalLab: "Incompatibilité critique (à ne pas négocier)",
      gridH: "Comment lire les niveaux de risque",
      keyH: "Ce qu'il faut retenir",
      planH: "Ton plan d'action",
      boussoleLab: "La Boussole Relation",
      boussoleP: "Tu es en couple, ou tu hésites sur une relation ? La Boussole Relation t'aide à l'évaluer calmement, critère par critère, avec tes propres poids. Une alerte s'affiche si un point essentiel est touché, quel que soit le score total.",
      boussoleBtn: "Évaluer ma relation avec la Boussole →",
      ctaEyebrow: "Appel Découverte · offert",
      ctaH: "Et si on en parlait ensemble ?",
      ctaP: "Ce quiz pose des hypothèses. Pendant un Appel Découverte offert, nous regardons ta situation réelle : ce qui se répète, ce dont tu as besoin, et ce que tu veux construire. Tu repars avec des idées claires, que tu décides ou non d'aller plus loin avec moi.",
      ctaSign: "Pierre Sarazin, coach Profileur de talent, Magic Humans",
      ctaBtn: "Réserver mon Appel Découverte offert →",
      siteBtn: "Découvrir Magic Humans",
      exportH: "Garder mes résultats",
      exportP: "Copie ce texte pour le garder dans tes notes, ou pour le relire avant ton Appel Découverte.",
      copyBtn: "Copier mes résultats",
      copied: "Copié !",
      copyFallback: "Sélectionne le texte puis copie-le.",
      matchingH: "Bientôt : des rencontres entre participants",
      matchingP: "Un projet de mise en relation entre participants du Sommet est en préparation. Le principe est simple : aucune coordonnée n'est jamais échangée sans un double consentement, le tien et celui de l'autre personne. Ce quiz n'envoie rien. Si le projet t'intéresse, écris simplement à {email} avec ton prénom.",
      restart: "Recommencer le quiz",
      ethicsH: "Une note importante",
      ethicsP: "Ce quiz n'est pas un outil de diagnostic. Si tu vis de la peur, des humiliations, du contrôle ou de la violence dans ta relation, ce n'est pas un problème de compatibilité : parles-en à un professionnel. En France : 3919 (violences conjugales, gratuit et anonyme, 24h/24), 17 ou 112 en cas de danger immédiat, 114 par SMS. Hors de France, contacte les services d'urgence de ton pays."
    }
  },

  /* Niveaux d'importance d'une valeur (question de type "value"). */
  firmness: [
    { id: "souple", label: "Négociable" },
    { id: "important", label: "Important, j'aurais du mal à faire autrement" },
    { id: "nn", label: "Non négociable pour moi" }
  ],

  /* 28 questions. type : single (une réponse), value (position + importance), grid (5 curseurs).
     add : points ajoutés aux compteurs (clé "groupe.id"). */
  questions: [
    { id: "q01", part: "ouverture", dim: "message", type: "single",
      text: "T'est-il déjà arrivé d'être très amoureux·se de quelqu'un, et pourtant malheureux·se dans cette relation ?",
      options: [
        { id: "souvent", label: "Oui, plusieurs fois.", add: {} },
        { id: "unefois", label: "Oui, au moins une fois.", add: {} },
        { id: "maintenant", label: "C'est peut-être ce que je vis en ce moment.", add: {} },
        { id: "non", label: "Non, pas vraiment.", add: {} }
      ] },

    { id: "q02", part: "langages", dim: "langage_recevoir", type: "single",
      text: "Un soir, après une journée difficile, qu'est-ce qui te ferait le plus de bien venant de ton partenaire ?",
      options: [
        { id: "paroles", label: "Des mots sincères : « Je suis fier·e de toi, tu as assuré. »", add: { "recv.paroles": 2 } },
        { id: "moments", label: "Une soirée vraiment ensemble, téléphones rangés, rien que vous deux.", add: { "recv.moments": 2 } },
        { id: "cadeaux", label: "Trouver un petit mot ou ta douceur préférée, pensée pour toi.", add: { "recv.cadeaux": 2 } },
        { id: "services", label: "Découvrir que le dîner est prêt et que ce qui te pesait a été réglé.", add: { "recv.services": 2 } },
        { id: "toucher", label: "Un long câlin, une main dans le dos, sans rien dire.", add: { "recv.toucher": 2 } }
      ] },
    { id: "q03", part: "langages", dim: "langage_recevoir", type: "single",
      text: "Tu te sens le plus aimé·e quand ton partenaire...",
      options: [
        { id: "paroles", label: "te dit, avec ses mots, ce qui lui plaît chez toi.", add: { "recv.paroles": 2 } },
        { id: "moments", label: "t'accorde du temps sans distraction, rien que pour vous deux.", add: { "recv.moments": 2 } },
        { id: "cadeaux", label: "pense à toi quand tu n'es pas là, et te rapporte un petit quelque chose qui le prouve.", add: { "recv.cadeaux": 2 } },
        { id: "services", label: "te facilite la vie sans que tu aies à demander.", add: { "recv.services": 2 } },
        { id: "toucher", label: "te prend la main, t'enlace, cherche le contact.", add: { "recv.toucher": 2 } }
      ] },
    { id: "q04", part: "langages", dim: "langage_recevoir", type: "single",
      text: "Ce qui te blesserait le plus, ce serait...",
      options: [
        { id: "paroles", label: "des critiques répétées, ou ne jamais entendre un mot gentil.", add: { "recv.paroles": 2 } },
        { id: "moments", label: "être souvent remis·e à plus tard, ou écouté·e à moitié.", add: { "recv.moments": 2 } },
        { id: "cadeaux", label: "un anniversaire oublié, une attention jamais rendue.", add: { "recv.cadeaux": 2 } },
        { id: "services", label: "devoir tout porter seul·e pendant que l'autre ne lève pas le petit doigt.", add: { "recv.services": 2 } },
        { id: "toucher", label: "un partenaire distant physiquement, qui évite le contact.", add: { "recv.toucher": 2 } }
      ] },
    { id: "q05", part: "langages", dim: "langage_donner", type: "single",
      text: "Quand tu veux montrer à quelqu'un que tu l'aimes, tu as tendance à...",
      options: [
        { id: "paroles", label: "le lui dire, le lui écrire, faire des compliments.", add: { "give.paroles": 2 } },
        { id: "moments", label: "organiser un moment rien que pour vous deux.", add: { "give.moments": 2 } },
        { id: "cadeaux", label: "offrir quelque chose qui lui ressemble.", add: { "give.cadeaux": 2 } },
        { id: "services", label: "rendre service, régler ce qui l'encombre.", add: { "give.services": 2 } },
        { id: "toucher", label: "chercher le contact : un câlin, une caresse, une main tenue.", add: { "give.toucher": 2 } }
      ] },
    { id: "q06", part: "langages", dim: "langage_donner", type: "single",
      text: "Ton partenaire traverse une période difficile. Ton premier réflexe :",
      options: [
        { id: "paroles", label: "Lui envoyer des messages d'encouragement, lui rappeler ses forces.", add: { "give.paroles": 2 } },
        { id: "moments", label: "Libérer du temps pour être là et l'écouter longuement.", add: { "give.moments": 2 } },
        { id: "cadeaux", label: "Lui préparer une surprise pour lui changer les idées.", add: { "give.cadeaux": 2 } },
        { id: "services", label: "Prendre en charge une partie de ses tâches pour l'alléger.", add: { "give.services": 2 } },
        { id: "toucher", label: "Rester tout près, offrir tes bras.", add: { "give.toucher": 2 } }
      ] },
    { id: "q07", part: "langages", dim: "langage_donner", type: "single",
      text: "Ce que tes proches disent de toi en amour :",
      options: [
        { id: "paroles", label: "« Tu sais trouver les mots. »", add: { "give.paroles": 2 } },
        { id: "moments", label: "« Avec toi, on se sent vraiment écouté. »", add: { "give.moments": 2 } },
        { id: "cadeaux", label: "« Tu as toujours l'attention qui tombe juste. »", add: { "give.cadeaux": 2 } },
        { id: "services", label: "« On peut compter sur toi pour tout. »", add: { "give.services": 2 } },
        { id: "toucher", label: "« Tu es quelqu'un de tactile, de chaleureux. »", add: { "give.toucher": 2 } }
      ] },

    { id: "q08", part: "imago", dim: "imago", type: "single",
      text: "Dans tes histoires passées, quel scénario revient le plus souvent ?",
      options: [
        { id: "attente", label: "J'attends des messages, des preuves, et l'autre est souvent moins investi·e que moi.", add: { "pat.attente": 2 } },
        { id: "etouffement", label: "Au bout d'un moment, je me sens envahi·e et j'ai besoin de reprendre de l'air.", add: { "pat.etouffement": 2 } },
        { id: "effacement", label: "Je m'adapte tellement que je finis par ne plus savoir ce que je veux.", add: { "pat.effacement": 2 } },
        { id: "jamaisassez", label: "J'ai l'impression de ne jamais être à la hauteur, il y a toujours un reproche.", add: { "pat.jamaisassez": 2 } },
        { id: "sauveur", label: "Je tombe pour des personnes en difficulté, que j'essaie d'aider ou de réparer.", add: { "pat.sauveur": 2 } },
        { id: "aucun", label: "Je ne vois pas vraiment de scénario qui se répète.", add: {} }
      ] },
    { id: "q09", part: "imago", dim: "imago", type: "single",
      text: "Ce qui te fait réagir au quart de tour, plus fort que la situation ne le mérite :",
      options: [
        { id: "attente", label: "Un message sans réponse, un rendez-vous annulé au dernier moment.", add: { "pat.attente": 2 } },
        { id: "etouffement", label: "Qu'on me demande des comptes sur mon emploi du temps.", add: { "pat.etouffement": 2 } },
        { id: "effacement", label: "Le sentiment que mes besoins passent toujours après ceux de l'autre.", add: { "pat.effacement": 2 } },
        { id: "jamaisassez", label: "Une remarque sur ce que j'ai mal fait, même dite gentiment.", add: { "pat.jamaisassez": 2 } },
        { id: "sauveur", label: "Voir l'autre aller mal sans pouvoir l'aider.", add: { "pat.sauveur": 2 } },
        { id: "aucun", label: "Rien de particulier, je reste plutôt calme.", add: {} }
      ] },
    { id: "q10", part: "imago", dim: "imago", type: "single",
      text: "Au début, la personne qui t'attire le plus fort est souvent...",
      options: [
        { id: "attente", label: "un peu insaisissable, difficile à cerner, pas toujours disponible.", add: { "pat.attente": 2 } },
        { id: "etouffement", label: "très présente, très demandeuse, qui veut tout partager tout de suite.", add: { "pat.etouffement": 2 } },
        { id: "effacement", label: "une forte personnalité, sûre d'elle, qui prend beaucoup de place.", add: { "pat.effacement": 2 } },
        { id: "jamaisassez", label: "exigeante, brillante, difficile à impressionner.", add: { "pat.jamaisassez": 2 } },
        { id: "sauveur", label: "blessée, en difficulté, qui a besoin de quelqu'un comme toi.", add: { "pat.sauveur": 2 } },
        { id: "aucun", label: "Je ne remarque pas de type particulier.", add: {} }
      ] },
    { id: "q11", part: "imago", dim: "imago", type: "single",
      text: "Enfant ou adolescent·e, ce qui t'a peut-être manqué, ou ce que tu as appris à faire pour être aimé·e :",
      options: [
        { id: "attente", label: "Une présence fiable : j'attendais souvent que quelqu'un soit là.", add: { "pat.attente": 2 } },
        { id: "etouffement", label: "De l'espace : on décidait beaucoup pour moi, on s'inquiétait trop.", add: { "pat.etouffement": 2 } },
        { id: "effacement", label: "Qu'on me demande ce que je voulais : j'ai appris à être sage, à ne pas déranger.", add: { "pat.effacement": 2 } },
        { id: "jamaisassez", label: "Être félicité·e sans condition : il fallait réussir pour être reconnu·e.", add: { "pat.jamaisassez": 2 } },
        { id: "sauveur", label: "Avoir le droit d'être un enfant : je m'occupais beaucoup des autres.", add: { "pat.sauveur": 2 } },
        { id: "aucun", label: "Rien ne me parle ici, ou je préfère ne pas répondre.", add: {} }
      ] },

    { id: "q12", part: "besoins", dim: "besoins", type: "single",
      text: "Pour te sentir bien dans un couple, ce dont tu as le plus besoin :",
      options: [
        { id: "securite", label: "Savoir que je peux compter sur l'autre, quoi qu'il arrive.", add: { "need.securite": 3 } },
        { id: "liberte", label: "Garder mon espace, mes amis, mes projets à moi.", add: { "need.liberte": 3 } },
        { id: "reconnaissance", label: "Me sentir admiré·e, choisi·e, mis·e en valeur.", add: { "need.reconnaissance": 3 } },
        { id: "profondeur", label: "Pouvoir tout dire, être compris·e jusque dans mes émotions.", add: { "need.profondeur": 3 } },
        { id: "legerete", label: "Rire, jouer, vivre des aventures ensemble.", add: { "need.legerete": 3 } },
        { id: "harmonie", label: "Un quotidien doux, apaisé, sans tensions permanentes.", add: { "need.harmonie": 3 } }
      ] },
    { id: "q13", part: "besoins", dim: "anti_contexte", type: "single",
      text: "Une relation t'éteint à petit feu quand...",
      options: [
        { id: "securite", label: "tu ne sais jamais sur quel pied danser.", add: { "need.securite": 2 } },
        { id: "liberte", label: "tu dois te justifier de tout, tout le temps.", add: { "need.liberte": 2 } },
        { id: "reconnaissance", label: "tes efforts passent inaperçus, on te prend pour acquis·e.", add: { "need.reconnaissance": 2 } },
        { id: "profondeur", label: "les conversations restent en surface et les émotions sont tues.", add: { "need.profondeur": 2 } },
        { id: "legerete", label: "tout devient lourd, sérieux, routinier.", add: { "need.legerete": 2 } },
        { id: "harmonie", label: "les piques et les éclats de voix deviennent ordinaires.", add: { "need.harmonie": 2 } }
      ] },
    { id: "q14", part: "besoins", dim: "ressourcement", type: "single",
      text: "Pour te ressourcer à deux, l'idéal serait :",
      options: [
        { id: "securite", label: "Un rituel qui revient chaque semaine, simple et rassurant.", add: { "need.securite": 1 } },
        { id: "liberte", label: "Chacun son activité, puis se retrouver pour se raconter.", add: { "need.liberte": 1 } },
        { id: "reconnaissance", label: "Une soirée où l'on prend le temps de se dire ce qu'on apprécie chez l'autre.", add: { "need.reconnaissance": 1 } },
        { id: "profondeur", label: "Une longue conversation sans écran, jusque tard.", add: { "need.profondeur": 1 } },
        { id: "legerete", label: "Une sortie improvisée, un jeu, quelque chose de nouveau.", add: { "need.legerete": 1 } },
        { id: "harmonie", label: "Une soirée calme à la maison, musique douce, rien à prouver.", add: { "need.harmonie": 1 } }
      ] },

    { id: "q15", part: "masque", dim: "masque", type: "single",
      text: "Au début d'une relation, on te voit surtout comme quelqu'un de...",
      options: [
        { id: "cameleon", label: "attentionné·e, à l'écoute, toujours partant·e.", add: { "mask.cameleon": 2 } },
        { id: "roc", label: "solide, indépendant·e, qui n'a besoin de personne.", add: { "mask.roc": 2 } },
        { id: "chef", label: "organisé·e, fiable, qui prend les choses en main.", add: { "mask.chef": 2 } },
        { id: "soleil", label: "pétillant·e, drôle, charmant·e.", add: { "mask.soleil": 2 } },
        { id: "diplomate", label: "calme, conciliant·e, facile à vivre.", add: { "mask.diplomate": 2 } }
      ] },
    { id: "q16", part: "masque", dim: "masque", type: "single",
      text: "Quand tu sens que l'autre s'éloigne, tu...",
      options: [
        { id: "cameleon", label: "en fais encore plus pour lui faire plaisir.", add: { "mask.cameleon": 2 } },
        { id: "roc", label: "prends tes distances avant d'être blessé·e.", add: { "mask.roc": 2 } },
        { id: "chef", label: "cherches à comprendre et à régler le problème, vite.", add: { "mask.chef": 2 } },
        { id: "soleil", label: "redoubles de charme, d'humour, de légèreté.", add: { "mask.soleil": 2 } },
        { id: "diplomate", label: "fais comme si de rien n'était, pour ne pas envenimer.", add: { "mask.diplomate": 2 } }
      ] },
    { id: "q17", part: "masque", dim: "qualite_deborde", type: "single",
      text: "Le reproche qu'on t'a fait le plus souvent en couple :",
      options: [
        { id: "cameleon", label: "« Tu ne dis jamais ce que tu veux vraiment. »", add: { "mask.cameleon": 2 } },
        { id: "roc", label: "« Tu es distant·e, je ne sais pas ce que tu ressens. »", add: { "mask.roc": 2 } },
        { id: "chef", label: "« Tu veux tout contrôler. »", add: { "mask.chef": 2 } },
        { id: "soleil", label: "« On ne sait jamais quand tu es sérieux·se. »", add: { "mask.soleil": 2 } },
        { id: "diplomate", label: "« Tu fuis dès que ça chauffe. »", add: { "mask.diplomate": 2 } }
      ] },

    { id: "q18", part: "valeurs", dim: "valeurs", type: "value", topic: "enfants", topicLabel: "Les enfants", levels: { souple: "Fort", important: "Critique", nn: "Critique" },
      text: "Les enfants, dans ton projet de vie :",
      options: [
        { id: "oui", label: "J'en veux (ou j'en veux d'autres).", mine: "Avoir des enfants (ou d'autres enfants)", opposite: "Un partenaire qui ne veut pas d'enfants" },
        { id: "non", label: "Je n'en veux pas (ou pas d'autres).", mine: "Une vie sans enfants (ou sans autres enfants)", opposite: "Un partenaire qui veut absolument des enfants" },
        { id: "miens", label: "J'ai déjà des enfants, et ils doivent être pleinement accueillis.", mine: "Que mes enfants soient pleinement accueillis", opposite: "Un partenaire qui ne veut pas partager sa vie avec mes enfants" },
        { id: "flou", label: "Je ne sais pas encore.", neutral: true }
      ] },
    { id: "q19", part: "valeurs", dim: "valeurs", type: "value", topic: "lieu", topicLabel: "Le lieu de vie", levels: { souple: "Faible", important: "Fort", nn: "Critique" },
      text: "Ton lieu de vie idéal :",
      options: [
        { id: "ville", label: "En ville, près de tout.", mine: "Vivre en ville", opposite: "Un partenaire qui ne se voit vivre qu'à la campagne, loin de tout" },
        { id: "campagne", label: "À la campagne, au calme, près de la nature.", mine: "Vivre au calme, près de la nature", opposite: "Un partenaire qui ne peut vivre qu'en pleine ville" },
        { id: "ailleurs", label: "Ailleurs, à l'étranger ou en mouvement : j'ai besoin de bouger.", mine: "Garder la possibilité de partir vivre ailleurs", opposite: "Un partenaire qui ne quittera jamais sa région" },
        { id: "racines", label: "Là où sont mes racines, près de mes proches.", mine: "Rester près de mes racines et de mes proches", opposite: "Un partenaire qui veut partir vivre loin, ou à l'étranger" },
        { id: "egal", label: "Peu importe, tant qu'on est bien.", neutral: true }
      ] },
    { id: "q20", part: "valeurs", dim: "valeurs", type: "value", topic: "argent", topicLabel: "L'argent", levels: { souple: "Faible", important: "Fort", nn: "Critique" },
      text: "L'argent, pour toi, sert d'abord à...",
      options: [
        { id: "securite", label: "être en sécurité : épargner, prévoir, ne pas manquer.", mine: "Une gestion prudente de l'argent, une épargne pour l'avenir", opposite: "Un partenaire qui dépense sans compter ou s'endette facilement" },
        { id: "vivre", label: "profiter de la vie : voyages, sorties, plaisirs.", mine: "Profiter de la vie, sans tout calculer", opposite: "Un partenaire qui vit chaque dépense comme un danger" },
        { id: "commun", label: "construire ensemble, en toute transparence, en mettant tout en commun.", mine: "Une transparence totale et un argent mis en commun", opposite: "Un partenaire secret ou très cloisonné sur l'argent" },
        { id: "autonomie", label: "garder chacun son indépendance financière.", mine: "Garder mon indépendance financière", opposite: "Un partenaire qui veut tout mettre en commun, sans compte à soi" },
        { id: "egal", label: "Je m'adapte, ce n'est pas un sujet pour moi.", neutral: true }
      ] },
    { id: "q21", part: "valeurs", dim: "valeurs", type: "value", topic: "famille", topicLabel: "La place de la famille", levels: { souple: "Faible", important: "Fort", nn: "Critique" },
      text: "La place de la famille (parents, frères et sœurs, belle-famille) dans ton couple :",
      options: [
        { id: "proche", label: "Très présente : repas réguliers, vacances ensemble, entraide.", mine: "Une famille très présente dans notre vie", opposite: "Un partenaire qui veut garder la famille à distance" },
        { id: "bulle", label: "À distance : je préfère que notre couple reste notre bulle.", mine: "Un couple protégé, avec la famille à distance", opposite: "Un partenaire dont la famille décide ou s'invite en permanence" },
        { id: "equilibre", label: "Présente, avec des limites claires.", neutral: true }
      ] },
    { id: "q22", part: "valeurs", dim: "valeurs", type: "value", topic: "spiritualite", topicLabel: "La spiritualité", levels: { souple: "Faible", important: "Fort", nn: "Critique" },
      text: "La spiritualité, la religion ou la quête de sens :",
      options: [
        { id: "centrale", label: "Elle est au centre de ma vie (pratique, communauté, rituels).", mine: "Partager ma foi ou ma pratique spirituelle", opposite: "Un partenaire qui rejette ou méprise ce qui est sacré pour moi" },
        { id: "intime", label: "Elle compte, mais je la vis de façon personnelle.", mine: "Que ma vie intérieure soit respectée, même si elle n'est pas partagée", opposite: "Un partenaire qui se moque de ma quête de sens" },
        { id: "absente", label: "Elle ne fait pas partie de ma vie.", mine: "Une vie sans pratique religieuse imposée", opposite: "Un partenaire qui voudrait m'imposer une pratique religieuse" },
        { id: "egal", label: "Je m'adapte facilement à ce que vit l'autre.", neutral: true }
      ] },
    { id: "q23", part: "valeurs", dim: "valeurs", type: "value", topic: "ambition", topicLabel: "Le travail et l'ambition", levels: { souple: "Faible", important: "Fort", nn: "Critique" },
      text: "Le travail et l'ambition dans ta vie :",
      options: [
        { id: "forte", label: "J'ai de grandes ambitions et je suis prêt·e à y consacrer beaucoup.", mine: "Vivre pleinement mes ambitions, avec le soutien de l'autre", opposite: "Un partenaire qui vit mon ambition comme une menace pour le couple" },
        { id: "equilibre", label: "Je veux réussir, mais pas au prix de ma vie personnelle.", mine: "Un vrai équilibre entre travail et vie de couple", opposite: "Un partenaire qui vit pour son travail et n'a jamais de temps" },
        { id: "simple", label: "Ma priorité, c'est une vie simple, le travail passe après.", mine: "Une vie simple où le travail ne passe pas avant nous", opposite: "Un partenaire dont la carrière passe avant tout" },
        { id: "egal", label: "Je m'adapte à ce que vit l'autre.", neutral: true }
      ] },
    { id: "q24", part: "valeurs", dim: "valeurs", type: "value", topic: "rythme", topicLabel: "Le rythme de vie", levels: { souple: "Faible", important: "Critique", nn: "Critique" },
      text: "Ton rythme de vie :",
      options: [
        { id: "social", label: "Très social : sorties, amis, agenda rempli.", mine: "Une vie sociale riche, avec du monde et des sorties", opposite: "Un partenaire casanier qui vit mal les sorties" },
        { id: "cocon", label: "Plutôt cocon : calme, maison, peu de monde.", mine: "Un rythme calme, centré sur notre cocon", opposite: "Un partenaire qui a besoin de sortir presque tous les soirs" },
        { id: "intense", label: "À fond : sport, projets, voyages, je ne m'arrête jamais.", mine: "Une vie intense, pleine de projets et de mouvement", opposite: "Un partenaire qui aspire surtout au repos et à la routine" },
        { id: "mixte", label: "Un mélange, selon les périodes.", neutral: true }
      ] },
    { id: "q25", part: "valeurs", dim: "valeurs", type: "value", topic: "liberte", topicLabel: "Liberté et fusion", levels: { souple: "Faible", important: "Critique", nn: "Critique" },
      text: "Dans un couple, tu es plutôt...",
      options: [
        { id: "fusion", label: "Fusion : tout partager, se voir tous les jours, faire presque tout ensemble.", mine: "Une relation très proche, où l'on partage presque tout", opposite: "Un partenaire qui a besoin de beaucoup d'indépendance et de temps seul" },
        { id: "liberte", label: "Liberté : chacun sa vie, ses amis, ses temps seuls, et on se retrouve.", mine: "Une relation qui respecte largement mon indépendance", opposite: "Un partenaire qui veut tout partager et vit mal mes temps seuls" },
        { id: "entre", label: "Entre les deux : proches, avec chacun son jardin secret.", neutral: true }
      ] },

    { id: "q26", part: "forme", dim: "forme", type: "grid",
      text: "Au quotidien, tu es plutôt... Place-toi honnêtement, sans te juger.",
      axes: [
        { id: "ordre", left: "Bordélique, créatif·ve dans le désordre", right: "Ordonné·e, chaque chose à sa place" },
        { id: "argent", left: "Dépensier·ère, je me fais plaisir", right: "Économe, je fais attention" },
        { id: "tete", left: "Rêveur·se, tête pleine d'idées", right: "Concret·e, les pieds sur terre" },
        { id: "temps", left: "Souvent en retard, l'heure est indicative", right: "Ponctuel·le, voire en avance" },
        { id: "plan", left: "Spontané·e, au feeling", right: "Planificateur·rice, tout est prévu" }
      ] },
    { id: "q27", part: "forme", dim: "forme", type: "single",
      text: "Chez un partenaire très différent de toi, laquelle de ces différences t'agacerait le plus au quotidien ?",
      options: [
        { id: "ordre", label: "Sa façon de gérer l'ordre et le rangement.", add: {} },
        { id: "argent", label: "Sa façon de dépenser (ou de ne pas dépenser).", add: {} },
        { id: "tete", label: "Son rapport aux rêves et au concret.", add: {} },
        { id: "temps", label: "Son rapport à l'heure et à la ponctualité.", add: {} },
        { id: "plan", label: "Sa façon d'improviser, ou au contraire de tout planifier.", add: {} },
        { id: "aucune", label: "Aucune vraiment, ces différences m'amusent plutôt.", add: {} }
      ] },

    { id: "q28", part: "securite", dim: "securite", type: "single", private: true,
      text: "Dernière question, et elle compte. Dans une relation, t'est-il arrivé d'avoir peur de l'autre, ou de te sentir régulièrement rabaissé·e, contrôlé·e ou menacé·e ?",
      options: [
        { id: "non", label: "Non, jamais.", add: {} },
        { id: "passe", label: "Oui, dans une relation passée.", add: {} },
        { id: "doute", label: "Je ne suis pas sûr·e, parfois je me pose la question.", add: {} },
        { id: "present", label: "Oui, dans ma relation actuelle.", add: {} }
      ] }
  ],

  /* Ordre de départage fixe quand deux scores sont égaux (après les questions de départage). */
  order: {
    lang: ["moments", "paroles", "toucher", "services", "cadeaux"],
    pat: ["attente", "effacement", "jamaisassez", "sauveur", "etouffement"],
    need: ["securite", "profondeur", "reconnaissance", "liberte", "harmonie", "legerete"],
    mask: ["cameleon", "diplomate", "chef", "roc", "soleil"]
  },

  /* Les 5 langages de l'amour (Gary Chapman). */
  languages: {
    paroles: {
      name: "Les paroles valorisantes", lower: "les paroles valorisantes",
      recv: "Les mots comptent énormément pour toi. Un compliment sincère, un « je t'aime » dit au bon moment, un message qui reconnaît ce que tu fais te remplissent pour plusieurs jours. À l'inverse, une critique sèche ou un long silence peuvent te blesser plus que l'autre ne l'imagine.",
      recvTips: [
        "Dis-le clairement à ton partenaire : « Ce qui me touche le plus, c'est quand tu me dis ce que tu apprécies chez moi. »",
        "Remarque les mots gentils quand ils arrivent, et dis merci : on répète ce qui est accueilli.",
        "Si les reproches sont fréquents, demande qu'ils soient formulés sur un fait précis, jamais sur ce que tu es."
      ],
      give: "Tu aimes avec des mots. Tu encourages, tu complimentes, tu écris. C'est un vrai cadeau, à condition que l'autre les entende comme tu les donnes.",
      giveTips: [
        "Si ton partenaire a un autre langage, accompagne tes mots d'un geste dans le sien.",
        "Tes mots ont du poids, dans les deux sens : en période de tension, ils peuvent aussi blesser plus que tu ne le penses."
      ],
      sentence: "« Ce qui me touche le plus, c'est quand tu me dis ce que tu aimes chez moi. »",
      partnerHint: "met des mots sur ce qu'il ou elle ressent et apprécie chez toi"
    },
    moments: {
      name: "Les moments de qualité", lower: "les moments de qualité",
      recv: "Pour toi, l'amour, c'est de la présence. Pas seulement être dans la même pièce : être vraiment là, attentif, sans écran, disponible. Une soirée où l'autre t'écoute pleinement vaut plus qu'un beau cadeau. Être remis·e à plus tard, encore et encore, te fait douter d'être important·e.",
      recvTips: [
        "Propose un rendez-vous fixe, même court : 30 minutes par jour sans téléphone, ou une soirée par semaine rien qu'à deux.",
        "Dis ce qui compte : « Quand tu poses ton téléphone pour m'écouter, je me sens aimé·e. »",
        "Repère les moments partagés qui existent déjà (un café, un trajet) et donne-leur de la valeur."
      ],
      give: "Tu aimes en donnant ton temps et ton attention. Tu organises des moments, tu écoutes, tu es là. C'est précieux, et rare.",
      giveTips: [
        "Si l'autre a besoin d'autre chose (des mots, de l'aide concrète), ta présence peut passer inaperçue : demande-lui ce qui le ou la touche.",
        "Garde aussi des moments pour toi seul·e : on ne peut pas être présent·e à l'autre si on s'est vidé·e."
      ],
      sentence: "« Ce qui me touche le plus, c'est quand on prend du temps rien que pour nous, sans écran. »",
      partnerHint: "t'offre du temps et une attention pleine, sans distraction"
    },
    cadeaux: {
      name: "Les cadeaux", lower: "les cadeaux et les attentions",
      recv: "Ce n'est pas une question de prix. Ce qui te touche, c'est la preuve que l'autre a pensé à toi : un petit mot, un objet trouvé en route, une attention pour une date qui compte. Un oubli, surtout répété, peut te faire sentir invisible.",
      recvTips: [
        "Explique que ce n'est pas matériel : « Un petit rien qui prouve que tu as pensé à moi me touche énormément. »",
        "Partage tes dates importantes et quelques idées simples : on ne devine pas toujours.",
        "Garde une trace des attentions reçues (une boîte, une photo) : elles nourrissent dans les jours plus difficiles."
      ],
      give: "Tu aimes par les attentions. Tu penses à l'autre, tu trouves l'objet qui lui ressemble, tu marques les dates. C'est une façon de dire « je t'ai dans la tête ».",
      giveTips: [
        "Si l'autre ne réagit pas beaucoup, ce n'est pas forcément de l'ingratitude : son langage est peut-être ailleurs.",
        "Varie avec des « cadeaux de temps » ou des mots écrits : ils parlent à plus de monde."
      ],
      sentence: "« Ce qui me touche le plus, c'est un petit rien qui me prouve que tu as pensé à moi. »",
      partnerHint: "pense à toi et te le prouve par de petites attentions"
    },
    services: {
      name: "Les services rendus", lower: "les services rendus",
      recv: "Pour toi, aimer se voit dans les actes. Quand l'autre prend en charge une tâche, anticipe ce qui te pèse, partage vraiment la charge du quotidien, tu te sens aimé·e. Les belles paroles sans actes, en revanche, sonnent creux.",
      recvTips: [
        "Nomme précisément ce qui te soulagerait : « Si tu t'occupes des courses le samedi, je me sens soutenu·e. »",
        "Remercie les gestes concrets : ils sont ton carburant, dis-le.",
        "Si la charge est déséquilibrée depuis longtemps, mets le sujet sur la table calmement, liste à l'appui."
      ],
      give: "Tu aimes en agissant. Tu rends service, tu répares, tu facilites la vie de l'autre. On peut compter sur toi.",
      giveTips: [
        "Attention à ne pas devenir la personne qui fait tout : aimer n'est pas se sacrifier.",
        "Si l'autre attend des mots ou du temps, tes services peuvent passer pour de la routine : ajoutes-y un moment ou une phrase."
      ],
      sentence: "« Ce qui me touche le plus, c'est quand tu me soulages concrètement, sans que j'aie à demander. »",
      partnerHint: "agit concrètement et partage vraiment la charge du quotidien"
    },
    toucher: {
      name: "Le toucher physique", lower: "le toucher physique",
      recv: "Le contact physique est ton langage le plus direct : une main tenue, un câlin, une caresse en passant. Il te rassure et te relie, bien au-delà de la sexualité. Un partenaire distant physiquement peut te donner le sentiment d'être rejeté·e, même s'il t'aime.",
      recvTips: [
        "Dites-le simplement : « Un câlin le matin, ta main dans la mienne, c'est ce qui me rassure le plus. »",
        "Propose des gestes du quotidien, pas seulement des moments intimes.",
        "Si l'autre est peu tactile, cherche ensemble des gestes qui lui conviennent aussi, sans forcer."
      ],
      give: "Tu aimes par le contact. Tu prends la main, tu enlaces, tu rassures par le corps. C'est chaleureux et apaisant.",
      giveTips: [
        "Vérifie que l'autre reçoit le toucher comme toi : pour certaines personnes, il faut d'abord des mots ou du temps.",
        "Le consentement et le rythme de l'autre restent la règle, même dans un couple installé."
      ],
      sentence: "« Ce qui me touche le plus, c'est un câlin, ta main dans la mienne, le contact. »",
      partnerHint: "est à l'aise avec le contact physique et l'offre spontanément"
    }
  },
  langGap: {
    same: "Tu donnes l'amour dans la langue où tu aimes le recevoir. C'est cohérent, et cela te rend lisible. Le risque : croire que tout le monde fonctionne ainsi. Si ton partenaire a un autre langage, tu pourrais te sentir peu aimé·e alors qu'il ou elle t'aime à sa façon.",
    diff: "Tu ne donnes pas l'amour dans la langue où tu as besoin de le recevoir. C'est très fréquent, et c'est une source classique de malentendus : tu peux beaucoup donner sans jamais recevoir ce qui te nourrit, simplement parce que personne ne le sait. Ton premier pas : le dire.",
    noSecondary: "Un seul langage ressort nettement chez toi. C'est une information précieuse : tu sais exactement ce qui te nourrit."
  },

  /* Scénarios répétés, inspirés d'Imago (Harville Hendrix). Formulés comme des hypothèses. */
  patterns: {
    attente: {
      name: "Le scénario de l'attente",
      summary: "Il se peut que tu sois souvent attiré·e par des personnes peu disponibles, et que tu passes beaucoup d'énergie à attendre un signe, une preuve, un engagement. Plus l'autre se dérobe, plus tu t'accroches.",
      imago: "Selon l'approche Imago, nous sommes attirés par ce qui nous est familier. Si une présence a manqué ou était imprévisible autrefois, l'incertitude peut ressembler, sans qu'on le veuille, à de l'amour. L'intensité de l'attente n'est pas la preuve de l'amour.",
      trigger: "un message sans réponse, un plan annulé, un silence",
      reactive: "Une personne insaisissable, ambiguë, qui souffle le chaud et le froid.",
      healing: "Une personne régulière et fiable, dont la présence te semblera peut-être moins « électrique » au début. Ce calme n'est pas de l'ennui : c'est de la sécurité.",
      questions: [
        "Dans mes histoires, qui attendait l'autre, et qu'est-ce que j'attendais vraiment ?",
        "Est-ce que je confonds parfois l'intensité de l'attente avec la force de l'amour ?",
        "Quelle personne fiable ai-je trouvée « pas assez excitante », et pourquoi ?"
      ],
      step: "La prochaine fois qu'un silence t'angoisse, note ce que tu ressens avant d'agir, et attends une heure avant de relancer."
    },
    etouffement: {
      name: "Le scénario de l'étouffement",
      summary: "Il se peut qu'au bout d'un moment, la proximité te donne l'impression d'étouffer. Tu as besoin d'air, l'autre le vit comme un rejet, il ou elle se rapproche, et tu recules encore.",
      imago: "Selon l'approche Imago, ce qui a été vécu autrefois laisse des traces. Si l'on a peu respecté ton espace, une relation proche peut réveiller la sensation d'être envahi·e, même quand l'autre ne te veut que du bien.",
      trigger: "les questions sur ton emploi du temps, les demandes de présence",
      reactive: "Une personne très fusionnelle, qui vit mal tes temps seuls et te demande des comptes.",
      healing: "Une personne proche et sécurisante, qui a aussi sa propre vie et te laisse respirer sans se sentir abandonnée.",
      questions: [
        "Quand je me sens envahi·e, est-ce l'autre qui en fait trop, ou une vieille alarme qui sonne ?",
        "Ai-je déjà dit clairement de quel espace j'ai besoin, avec des mots simples et un rythme précis ?",
        "Qu'est-ce que je risquerais si je me laissais vraiment approcher ?"
      ],
      step: "Annonce tes temps seuls à l'avance (« jeudi soir, j'ai besoin d'être seul·e, et samedi je suis tout à toi ») au lieu de t'éloigner sans prévenir."
    },
    effacement: {
      name: "Le scénario de l'effacement",
      summary: "Il se peut que tu t'adaptes tellement à l'autre que tu finisses par te perdre de vue. Tu dis oui pour préserver le lien, et un jour, la fatigue ou la colère remonte d'un coup.",
      imago: "Selon l'approche Imago, nous rejouons parfois ce que nous avons appris pour être aimés. Si être sage et ne pas déranger était la condition pour recevoir de l'affection, s'effacer peut sembler normal, voire vertueux.",
      trigger: "le sentiment que tes besoins passent toujours après",
      reactive: "Une forte personnalité qui prend beaucoup de place, décide pour deux et ne te pose pas de questions.",
      healing: "Une personne curieuse de toi, qui te demande ton avis et te laisse le temps de répondre.",
      questions: [
        "Quand ai-je dit oui pour la dernière fois alors que je pensais non ?",
        "Qu'est-ce que je crains qu'il arrive si je dis ce que je veux vraiment ?",
        "Dans mes relations, qui choisit les sorties, le rythme, les projets ?"
      ],
      step: "Cette semaine, exprime une préférence par jour, même minuscule (le film, le restaurant, l'heure). C'est un muscle."
    },
    jamaisassez: {
      name: "Le scénario du « jamais assez »",
      summary: "Il se peut que tu aies souvent l'impression de devoir mériter l'amour. Tu te sens jugé·e, pas tout à fait à la hauteur, et tu es peut-être attiré·e par des personnes exigeantes dont tu attends l'approbation.",
      imago: "Selon l'approche Imago, nous cherchons parfois chez l'autre la reconnaissance qui nous a manqué. Si l'amour semblait conditionné à la réussite, séduire quelqu'un de difficile à impressionner peut ressembler à une victoire, et ses critiques, à une vérité.",
      trigger: "une remarque, même gentille, sur ce que tu as mal fait",
      reactive: "Une personne exigeante, critique, avare de compliments, qui te fait sentir que tu pourrais mieux faire.",
      healing: "Une personne qui t'apprécie tel·le que tu es, et te le dit, sans que tu aies à le gagner.",
      questions: [
        "De qui ai-je le plus cherché l'approbation dans ma vie, et est-ce que cela ressemble à mes histoires ?",
        "Suis-je attiré·e par l'amour qu'on me donne, ou par celui que je dois conquérir ?",
        "Qu'est-ce que je me dis quand quelqu'un m'aime sans condition ?"
      ],
      step: "Note chaque soir une chose que tu as bien faite, sans la minimiser. Puis observe qui, autour de toi, te la dit naturellement."
    },
    sauveur: {
      name: "Le scénario du sauveur",
      summary: "Il se peut que tu tombes souvent amoureux·se de personnes en difficulté, que tu veux aider, soutenir, réparer. Tu donnes beaucoup, et tu attends, parfois longtemps, que l'autre change.",
      imago: "Selon l'approche Imago, nos rôles d'enfance nous suivent. Si tu as pris soin des autres très tôt, être indispensable peut ressembler à être aimé·e. Mais on ne peut pas changer quelqu'un : lui demander de changer, c'est lui demander d'arrêter d'être lui-même.",
      trigger: "voir l'autre aller mal sans pouvoir l'aider",
      reactive: "Une personne blessée, instable ou en crise, qui a besoin d'être sauvée et te fait sentir indispensable.",
      healing: "Une personne autonome, qui prend soin d'elle-même et peut aussi prendre soin de toi.",
      questions: [
        "Est-ce que j'aime la personne telle qu'elle est aujourd'hui, ou celle qu'elle pourrait devenir ?",
        "Qui prend soin de moi, dans mes relations ?",
        "Que me reste-t-il si je ne suis plus celui ou celle qui aide ?"
      ],
      step: "Avant d'aider, demande : « Est-ce que tu veux que je t'aide, ou que je t'écoute ? » Et laisse l'autre répondre."
    }
  },
  patternLevels: {
    net: "Ce scénario ressort nettement de tes réponses. Il mérite qu'on s'y arrête.",
    probable: "Ce scénario ressort plusieurs fois dans tes réponses. C'est une piste sérieuse à explorer.",
    leger: "Ce scénario apparaît un peu dans tes réponses. Prends-le comme une piste légère, à vérifier avec tes souvenirs réels.",
    aucun: "Aucun scénario répété ne ressort clairement de tes réponses. Tant mieux, ou peut-être pas encore visible. Si tu as déjà vécu plusieurs histoires douloureuses qui se ressemblent, regarde ce qu'elles ont en commun : le début, le type de personne, la façon dont cela s'est terminé."
  },
  aucunQuestions: [
    "Qu'ont en commun les personnes qui m'ont le plus attiré·e ?",
    "Comment mes histoires importantes se sont-elles terminées, et qui est parti ?",
    "Qu'est-ce que je répète, même dans les histoires heureuses ?"
  ],
  pastAbuseNote: "Tu as indiqué avoir vécu de la peur ou du rabaissement dans une relation passée. Ce que tu as traversé n'était pas de ta faute. Si cela pèse encore, en parler à un ou une professionnel·le peut vraiment aider à ne pas le revivre.",

  /* Besoins fondamentaux dans le couple. */
  needs: {
    securite: {
      name: "Sécurité et fiabilité", title: "Cœur Ancre", short: "sécurité et de fiabilité",
      desc: "Tu as besoin de savoir où tu en es. Un partenaire qui tient parole, qui est là quand il le dit, avec qui l'avenir se construit sans montagnes russes. Ce n'est pas un manque d'audace : c'est le sol sur lequel tu peux enfin te détendre.",
      partner: "De la constance, de la parole tenue, des projets clairs. Quelqu'un qui rassure par les actes, pas seulement par les mots.",
      anti: "Tu ne sais jamais sur quel pied danser. Les promesses non tenues, les changements d'humeur imprévisibles et le flou sur l'avenir t'épuisent lentement. Dans ce contexte, tu deviens vigilant·e, inquiet·e, et tu perds ta légèreté.",
      ress: "Un rituel simple qui revient chaque semaine : le même petit-déjeuner du dimanche, une balade, un appel du soir. La répétition t'apaise et te recharge."
    },
    liberte: {
      name: "Liberté et espace", title: "Cœur Libre", short: "liberté et d'espace",
      desc: "Tu as besoin de rester toi-même dans le couple : tes amis, tes projets, tes temps seuls. Ce n'est pas un manque d'amour. Au contraire, c'est en respirant que tu reviens vers l'autre avec envie.",
      partner: "De la confiance, une vie à lui ou à elle, et la capacité de te laisser partir quelques heures sans le vivre comme un abandon.",
      anti: "Tu dois te justifier de tout. Les questions sur ton emploi du temps, la jalousie, les reproches quand tu vois tes amis t'éteignent. Dans ce contexte, tu te sens à l'étroit et tu finis par fuir, en pensée ou pour de vrai.",
      ress: "Chacun son activité, puis vous vous retrouvez pour vous raconter. La distance choisie nourrit le lien au lieu de le menacer."
    },
    reconnaissance: {
      name: "Reconnaissance et admiration", title: "Cœur Lumière", short: "reconnaissance",
      desc: "Tu as besoin de te sentir choisi·e, admiré·e, mis·e en valeur. Ce n'est pas de la vanité : c'est le signe que l'autre te voit vraiment, avec ce que tu apportes.",
      partner: "Un regard qui te valorise, des mots de fierté, la capacité de dire « merci » et « bravo », y compris devant les autres.",
      anti: "Tes efforts passent inaperçus et l'on te prend pour acquis·e. Les moqueries, la comparaison, le manque de gratitude te ternissent. Dans ce contexte, tu doutes de toi et tu en fais trop pour être enfin vu·e.",
      ress: "Une soirée où vous prenez le temps de vous dire ce que vous appréciez l'un chez l'autre. Trois choses chacun, sans « mais »."
    },
    profondeur: {
      name: "Profondeur et intimité émotionnelle", title: "Cœur Profond", short: "profondeur et d'intimité émotionnelle",
      desc: "Tu as besoin de pouvoir tout dire et d'être compris·e jusque dans tes émotions. Les conversations vraies, la vulnérabilité partagée, le sentiment d'être connu·e en profondeur te relient plus que tout.",
      partner: "De l'écoute, de la curiosité pour ton monde intérieur, et le courage de parler de lui ou d'elle aussi.",
      anti: "Les conversations restent en surface et les émotions sont tues. Un partenaire qui change de sujet, qui fuit les discussions importantes ou se moque de ta sensibilité t'isole. Dans ce contexte, tu te sens seul·e à deux.",
      ress: "Une longue conversation sans écran, jusque tard, sur ce que tu vis vraiment. Une question ouverte suffit pour commencer : « Qu'est-ce qui t'a touché cette semaine ? »"
    },
    legerete: {
      name: "Complicité et légèreté", title: "Cœur Joueur", short: "complicité et de légèreté",
      desc: "Tu as besoin de rire, de jouer, de découvrir. Le couple est pour toi une aventure, une complicité, un terrain de jeu. Sans légèreté, même une belle histoire finit par te sembler grise.",
      partner: "De l'humour, de la curiosité, l'envie d'essayer de nouvelles choses, et la capacité de ne pas tout prendre au sérieux.",
      anti: "Tout devient lourd, sérieux, routinier. Les reproches permanents, l'absence de projets, les soirées toujours identiques t'éteignent. Dans ce contexte, tu t'ennuies et tu cherches l'étincelle ailleurs, parfois sans le vouloir.",
      ress: "Une sortie improvisée, un jeu, un endroit nouveau. Même une heure de « première fois » ensemble recharge ta complicité."
    },
    harmonie: {
      name: "Douceur et harmonie", title: "Cœur Paisible", short: "douceur et d'harmonie",
      desc: "Tu as besoin d'un quotidien doux et apaisé. Ce n'est pas fuir les désaccords : c'est pouvoir les vivre sans cris, sans piques, sans tension qui dure. La paix est ton terreau.",
      partner: "Du calme, de la gentillesse dans les mots, et la capacité de se disputer sans blesser, puis de se réconcilier.",
      anti: "Les piques et les éclats de voix deviennent ordinaires. Les conflits qui s'enveniment, l'ironie, les tensions qui durent des jours t'épuisent. Dans ce contexte, tu te refermes et tu évites tout sujet sensible, ce qui finit par creuser la distance.",
      ress: "Une soirée calme à la maison, musique douce, rien à prouver. La douceur partagée est ta façon de te retrouver."
    }
  },

  /* Masques relationnels et qualité qui déborde. */
  masks: {
    cameleon: {
      name: "le Caméléon", quality: "l'empathie, la capacité à sentir l'autre et à t'accorder à lui",
      overflow: "Tu t'adaptes au point de t'oublier. Tu dis oui pour ne pas perdre l'autre, et ton partenaire finit par ne plus savoir qui tu es vraiment.",
      partner: "Quelqu'un qui te pose des questions, qui s'intéresse à tes envies et qui ne profite pas de ta souplesse.",
      exercise: "Avant de répondre « comme tu veux », prends trois secondes et demande-toi : « Et moi, qu'est-ce que je préférerais ? »"
    },
    roc: {
      name: "le Roc", quality: "la force, l'autonomie, la capacité à tenir debout dans la tempête",
      overflow: "Tu ne demandes jamais rien, tu gardes tout pour toi, et l'autre te trouve distant·e. À force de ne pas avoir besoin, tu ne laisses personne prendre soin de toi.",
      partner: "Quelqu'un de patient, qui ne force pas la porte mais te montre qu'elle peut s'ouvrir sans danger.",
      exercise: "Cette semaine, demande une aide, même petite, à ton partenaire ou à un proche. Observe ce que cela te fait."
    },
    chef: {
      name: "le Chef d'orchestre", quality: "la fiabilité, le sens des responsabilités, la capacité à faire avancer les choses",
      overflow: "Tu veux que tout se passe bien, donc à ta façon. L'autre se sent contrôlé·e ou inutile, et toi, tu t'épuises à tout porter.",
      partner: "Quelqu'un de fiable sur qui tu peux vraiment te reposer, et qui ose te dire quand tu en fais trop.",
      exercise: "Choisis un domaine du quotidien et laisse-le entièrement à l'autre pendant un mois, sans corriger."
    },
    soleil: {
      name: "le Soleil", quality: "l'enthousiasme, la chaleur, le charme qui met tout le monde à l'aise",
      overflow: "Tu brilles pour plaire, tu détends l'atmosphère avec humour, mais tu montres rarement tes failles. L'autre aime la lumière, sans connaître la personne derrière.",
      partner: "Quelqu'un qui aime aussi tes jours gris, et à qui tu peux dire « je ne vais pas bien » sans perdre son regard.",
      exercise: "Partage une fois cette semaine une inquiétude réelle, sans la tourner en blague."
    },
    diplomate: {
      name: "le Diplomate", quality: "le calme, le sens de l'apaisement, l'art de faire baisser la tension",
      overflow: "Tu évites les sujets qui fâchent pour préserver la paix. Les non-dits s'accumulent, jusqu'à l'explosion ou jusqu'au départ, souvent à la surprise de l'autre.",
      partner: "Quelqu'un qui sait aborder les désaccords avec douceur, et qui te fait sentir qu'un conflit ne menace pas le lien.",
      exercise: "Choisis un petit désaccord que tu tais et exprime-le calmement, avec « je » : « Je me sens... quand... »"
    }
  },
  maskIntro: "Ton masque, c'est la façon dont tu te protèges en amour, surtout quand tu as peur de perdre l'autre. Il n'est pas faux : il vient d'une vraie qualité. Simplement, sous la pression, cette qualité déborde. Un défaut est souvent l'excès d'une qualité.",

  /* Différences de forme (quotidien). user < 0 : pôle gauche ; user > 0 : pôle droit. */
  axes: {
    ordre: {
      name: "l'ordre",
      frictionLeft: "Un partenaire très ordonné, qui vit ton désordre comme un manque de respect.",
      frictionRight: "Un partenaire très bordélique, dont le désordre envahit ton espace.",
      frictionMid: "Un partenaire extrême sur l'ordre, dans un sens ou dans l'autre.",
      completeLeft: "Un partenaire un peu plus organisé que toi peut alléger ta charge mentale, sans t'enfermer.",
      completeRight: "Un partenaire un peu plus détendu sur l'ordre peut t'aider à lâcher prise et à profiter."
    },
    argent: {
      name: "l'argent au quotidien",
      frictionLeft: "Un partenaire très économe, qui commente chacune de tes dépenses.",
      frictionRight: "Un partenaire dépensier, qui t'inquiète à chaque fin de mois.",
      frictionMid: "Un partenaire extrême sur les dépenses, dans un sens ou dans l'autre.",
      completeLeft: "Un partenaire un peu plus prudent que toi peut sécuriser tes projets communs.",
      completeRight: "Un partenaire un peu plus généreux avec l'argent peut t'aider à te faire plaisir."
    },
    tete: {
      name: "le rêve et le concret",
      frictionLeft: "Un partenaire très terre à terre, qui douche tes idées avant qu'elles aient pris forme.",
      frictionRight: "Un partenaire très rêveur, qui promet beaucoup et concrétise peu.",
      frictionMid: "Un partenaire extrême, perdu dans ses rêves ou fermé à toute idée nouvelle.",
      completeLeft: "Un partenaire plus concret peut transformer tes rêves en projets.",
      completeRight: "Un partenaire plus rêveur peut ouvrir ton horizon et te faire oser."
    },
    temps: {
      name: "la ponctualité",
      frictionLeft: "Un partenaire très ponctuel, qui vit tes retards comme un manque de considération.",
      frictionRight: "Un partenaire souvent en retard, qui te fait attendre et stresser.",
      frictionMid: "Un partenaire extrême sur l'heure, dans un sens ou dans l'autre.",
      completeLeft: "Un partenaire plus ponctuel peut t'éviter bien des courses contre la montre.",
      completeRight: "Un partenaire plus détendu avec l'heure peut t'apprendre à souffler."
    },
    plan: {
      name: "la spontanéité et la planification",
      frictionLeft: "Un partenaire qui planifie tout, et vit tes changements de dernière minute comme un chaos.",
      frictionRight: "Un partenaire qui improvise tout, et te laisse sans visibilité.",
      frictionMid: "Un partenaire extrême, tout improvisé ou tout planifié.",
      completeLeft: "Un partenaire plus organisé peut donner un cadre rassurant à tes envies.",
      completeRight: "Un partenaire plus spontané peut mettre de l'imprévu et de la fantaisie dans ta vie."
    }
  },
  formeNoComplement: "Tu es plutôt au milieu sur les différences du quotidien. C'est une vraie souplesse : la plupart des écarts de forme seront faciles à vivre pour toi.",
  formeNoFriction: "Aucune différence de forme ne t'agace vraiment. Garde quand même un œil sur celles qui touchent tes besoins essentiels.",

  /* Ouverture personnalisée (question q01). */
  opener: {
    souvent: "Tu as déjà vécu plusieurs fois cette situation : être amoureux·se et malheureux·se en même temps. Tu n'es ni naïf·ve ni maudit·e. Cela montre surtout que l'émotion seule ne t'a pas protégé·e, et qu'il est temps d'ajouter d'autres critères.",
    unefois: "Tu sais déjà, pour l'avoir vécu, qu'on peut être très amoureux·se et malheureux·se en même temps. Ce souvenir est une information précieuse : il dit quelque chose de ce dont tu as besoin.",
    maintenant: "Tu vis peut-être en ce moment cette situation douloureuse : aimer quelqu'un et ne pas être heureux·se. Ce n'est pas un échec. Ce quiz ne va pas décider à ta place, mais il peut t'aider à y voir plus clair, calmement.",
    non: "Tu n'as pas vraiment connu l'amour malheureux, et c'est une chance. Ce quiz t'aide à garder cette clarté : savoir ce dont tu as besoin avant que la chimie ne décide pour toi."
  },

  /* Sécurité (question q28). Affiché en tête des résultats si "doute" ou "present". */
  safety: {
    present: {
      title: "Avant tout le reste",
      text: "Tu as indiqué vivre de la peur, du rabaissement, du contrôle ou des menaces dans ta relation actuelle. Ce n'est pas une question de compatibilité ni de langage de l'amour, et ce n'est pas de ta faute. Tu mérites d'être en sécurité. Parles-en à un ou une professionnel·le ou à une personne de confiance. En France : 3919 (violences conjugales, gratuit et anonyme, 24h/24), 17 ou 112 en cas de danger immédiat, 114 par SMS si tu ne peux pas parler. Hors de France, contacte les services d'urgence de ton pays."
    },
    doute: {
      title: "Une question qui mérite d'être posée",
      text: "Tu te demandes parfois si ce que tu vis est normal. Ce doute est important. Se sentir régulièrement rabaissé·e, surveillé·e ou avoir peur de la réaction de l'autre n'est jamais une simple différence de caractère. Tu peux en parler, sans engagement, à un ou une professionnel·le. En France, le 3919 écoute aussi les personnes qui doutent (gratuit et anonyme, 24h/24)."
    }
  },

  /* Grille des niveaux de risque d'incompatibilité. */
  riskGrid: [
    { level: "Faible", label: "Différences de forme, gérables", text: "Ordre, ponctualité, habitudes, goûts. Elles demandent de l'humour et quelques accords, et peuvent même te compléter." },
    { level: "Fort", label: "Frictions récurrentes, à négocier", text: "Des sujets importants pour toi où l'écart reviendra souvent. Ils se négocient, à condition d'en parler tôt et de trouver un accord que chacun peut tenir." },
    { level: "Critique", label: "Non négociables", text: "Enfants oui ou non, rythme de vie incompatible, besoin de liberté face à un besoin de fusion extrême, valeurs fondamentales opposées. Ici, l'un des deux finirait par renoncer à une part essentielle de lui-même. L'amour ne suffit pas à combler cet écart." },
    { level: "Hors grille", label: "Signaux d'alerte", text: "Mépris, humiliation, contrôle, menaces, violence physique, psychologique, sexuelle ou économique. Ce ne sont pas des incompatibilités : ce sont des signaux de danger, qui appellent l'aide d'un professionnel." }
  ],
  universal: [
    "Être respecté·e, dans les mots comme dans les actes",
    "Pouvoir dire non sans avoir peur",
    "L'honnêteté sur les sujets qui engagent le couple",
    "Aucune forme de violence, de menace ou de contrôle"
  ],
  universalCritical: "Un partenaire qui méprise, contrôle, menace ou violente. Ce n'est pas une incompatibilité : c'est un signal d'alerte, qui appelle l'aide d'un professionnel.",

  /* Messages clés, affichés dans « Ce qu'il faut retenir ». */
  keyMessages: [
    "L'émotion et la chimie ne suffisent pas. Elles disent « je suis attiré·e », pas « nous pouvons être heureux ensemble ».",
    "On peut être amoureux·se et malheureux·se. Ce n'est pas un paradoxe : c'est le signe que des besoins essentiels ne sont pas nourris.",
    "On ne change pas quelqu'un. Lui demander de changer, c'est lui demander d'arrêter d'être lui-même.",
    "Le bon critère : un partenaire dont tu peux accepter les défauts sur le long terme, parce qu'ils ne touchent pas tes besoins essentiels.",
    "Le même fond, des formes différentes : partager les valeurs profondes, et avoir des talents différents en surface, c'est souvent la recette d'un couple qui dure."
  ],

  /* Plan d'action. {…} : valeurs du profil. */
  plan: [
    "Cette semaine, dis à ton partenaire (ou note pour plus tard) ton langage de l'amour avec cette phrase : {sentence}",
    "Relis ta liste de non-négociables. Si tu es en couple, choisis-en un et parles-en calmement, sans procès, juste pour vérifier que tu vas dans la même direction.",
    "{patternStep}",
    "Offre-toi un moment de Ressourcement à deux dans les quinze jours : {ress}",
    "Évalue ta relation (ou une relation qui commence) avec la Boussole Relation, puis, si tu veux aller plus loin, réserve ton Appel Découverte offert."
  ],
  planNoPattern: "Prends dix minutes pour écrire tes trois histoires les plus marquantes en une phrase chacune. Cherche le point commun.",

  /* Résumé du profil. Variables : {prenom} {title} {recvLower} {giveLower} {needShort} {need2Short} {maskName} {quality} {patternLine} {nnLine} */
  summary: "{prenom}, ton cœur a besoin avant tout de {needShort}, et ensuite de {need2Short}. Tu reçois l'amour surtout à travers {recvLower}, et tu le donnes surtout à travers {giveLower}. Quand tu as peur de perdre l'autre, ton masque ({maskName}) prend le relais, et derrière lui il y a une vraie qualité : {quality}. {patternLine}{nnLine}",
  summaryPattern: "Une piste à explorer : {patternName}. ",
  summaryNn: { one: "Tu as un non-négociable clair : c'est une boussole précieuse pour choisir.", many: "Tu as {n} non-négociables clairs : c'est une boussole précieuse pour choisir." },
  summaryNoNn: "Tu n'as indiqué aucun non-négociable : c'est le moment de vérifier si c'est de la souplesse ou une habitude de tout accepter.",

  /* Bloc texte copiable. Variables comme au-dessus, plus des listes déjà mises en forme. */
  exportTemplate: [
    "TON PROFIL AMOUREUX · Quiz Amour Magic Humans",
    "{prenom} · {title}",
    "",
    "{summary}",
    "",
    "Tes langages de l'amour",
    "Pour te sentir aimé·e : {recvName} (en second : {recv2Name})",
    "Ta façon de donner : {giveName} (en second : {give2Name})",
    "",
    "Ton scénario à explorer : {patternName}",
    "",
    "Tes besoins essentiels : {need1Name}, {need2Name}",
    "Ton Anti-Contexte relationnel : {anti}",
    "Ton Ressourcement à deux : {ress}",
    "",
    "Ton masque : {maskName}. Ta qualité qui déborde : {quality}",
    "",
    "Tes non-négociables :",
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
