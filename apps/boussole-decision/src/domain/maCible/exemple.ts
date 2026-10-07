// Exemples de référence (§5.2, §8.6) : fixtures des tests et niveau de qualité attendu.
import type { EntreeMaCible, Resultat } from "./types";

export const ENTREE_EXEMPLE: EntreeMaCible = {
  "v": 1, "langue": "fr", "source": "quiz",
  "talent": {
    "nom": "Mon Talent Unique : Médiatrice Audacieuse",
    "mecanisme": "démêle les situations humaines bloquées en posant les questions que personne n'ose poser",
    "contexte": "une équipe est sous tension et a besoin de se reparler",
    "benefice": "aider les équipes à retrouver confiance et élan, et à débloquer leurs décisions",
    "antiContexte": "les organisations très hiérarchiques où tout doit être validé trois fois ; les missions sans contact humain",
    "reussite": "Le jour où j'ai réconcilié deux chefs d'équipe qui ne se parlaient plus depuis six mois.",
    "sousTalents": ["Écoute", "Médiation", "Humour"], "pistes": [], "aDeleguer": ["Reporting", "Tableur"]
  },
  "terrain": {
    "offre": "J'anime des ateliers de cohésion d'équipe, et j'aimerais accompagner des dirigeants en individuel.",
    "marche": "les_deux",
    "experience": "15 ans de RH dans l'industrie agroalimentaire, je connais beaucoup de directeurs de site en Bretagne.",
    "clientsPasses": "Un directeur d'usine m'a remerciée d'avoir désamorcé un conflit entre deux chefs d'équipe.",
    "formats": ["groupe", "presentiel", "individuel"],
    "zone": "Rennes et la Bretagne, à distance pour le reste de la France",
    "prixActuel": "600 € la demi-journée d'atelier",
    "adresse": "vous", "style": "chaleureux"
  },
  "reponses": []
};

export const RESULTAT_EXEMPLE: Resultat = {
  "langue": "fr",
  "offre": {
    "phrase": "Je remets les équipes qui ne se parlent plus autour de la table, pour qu'elles retrouvent confiance et débloquent leurs décisions en quelques semaines.",
    "avant": "Les réunions tournent en rond, deux clans se forment, les décisions traînent et les meilleurs commencent à regarder ailleurs.",
    "apres": "Les tensions sont dites et traitées, chacun sait ce qu'il attend des autres, et l'équipe avance de nouveau sur ses vrais sujets."
  },
  "cibles": [
    {
      "id": "c1",
      "nom": "Directeurs de sites agroalimentaires en Bretagne",
      "marche": "b2b",
      "portrait": "Directeur ou directrice d'usine agroalimentaire de 80 à 400 salariés, en Bretagne. Le déclic arrive après une réorganisation ou l'arrivée d'un nouveau chef d'équipe : deux équipes de production ne se parlent plus, la qualité baisse et les arrêts de travail montent.",
      "douleur": "« J'ai deux chefs d'équipe qui se renvoient la balle, la production en pâtit et je n'ai ni le temps ni les mots pour régler ça moi-même. »",
      "ancrage": "Ton Contexte Déclencheur, une équipe sous tension qui doit se reparler, est exactement leur situation, et tes 15 ans de RH dans l'agroalimentaire te donnent leur langage.",
      "promesse": "En six semaines, vos équipes de production se reparlent et les décisions de site se débloquent.",
      "offre": {
        "nom": "Remettre l'équipe autour de la table",
        "format": "Un diagnostic sur site, puis 3 ateliers de 3 heures avec les chefs d'équipe",
        "duree": "6 semaines",
        "contenu": ["Entretiens individuels avec 5 à 8 personnes clés", "Atelier 1 : dire ce qui bloque, sans procès", "Atelier 2 : règles de fonctionnement décidées ensemble", "Atelier 3 : premières décisions prises en commun", "Point de suivi avec la direction un mois après"]
      },
      "prix": { "min": 3500, "max": 6000, "unite": "forfait par site", "base": "HT", "justification": "Ton tarif actuel (600 € la demi-journée) correspond au bas du marché. Un forfait avec diagnostic et suivi vaut plus qu'une addition d'ateliers, car il traite une perte de production qui coûte bien davantage." },
      "pitch": "Quand deux équipes ne se parlent plus, la production le sent avant la direction. J'ai passé 15 ans dans les RH de l'agroalimentaire : je sais faire dire aux équipes ce qu'elles taisent, sans procès, et les aider à décider ensemble. En six semaines, on remet tout le monde autour de la table.",
      "pourquoi": "C'est la cible où tout s'aligne : un problème qui coûte vite cher, un budget de formation ou de prestation qui existe, un secteur que tu connais de l'intérieur et un réseau déjà là.",
      "exemple": "Imagine une directrice de site qui vient de fusionner deux lignes de production. Les deux chefs d'équipe se contredisent devant les opérateurs. Elle t'appelle après un mois de tensions, parce qu'un ancien collègue lui a parlé de toi.",
      "scores": {
        "urgence": { "note": 4, "raison": "Le conflit coûte déjà en qualité et en absentéisme, mais il peut traîner quelques mois." },
        "paiement": { "note": 4, "raison": "Les sites ont des budgets de formation et de prestations RH." },
        "acces": { "note": 5, "raison": "Ton réseau de directeurs de site en Bretagne te les rend joignables en direct." },
        "plaisir": { "note": 5, "raison": "Une équipe sous tension qui doit se reparler, c'est ton Contexte Déclencheur." }
      },
      "lieux": [
        { "type": "Réunions des associations régionales des industries alimentaires", "pourquoi": "Les directeurs de site y échangent sur leurs problèmes de main-d'œuvre.", "recherche": "association industries agroalimentaires Bretagne" },
        { "type": "Clubs RH et clubs de dirigeants industriels de ta région", "pourquoi": "Tu y croises les DRH et directeurs qui achètent ce type d'intervention.", "recherche": "club RH industrie Rennes" },
        { "type": "Salons professionnels de l'agroalimentaire dans le Grand Ouest", "pourquoi": "Les directeurs de site y sont présents, et ton ancien métier te donne une entrée naturelle.", "recherche": "salon agroalimentaire Bretagne" }
      ],
      "canaux": [
        { "canal": "bouche_a_oreille", "priorite": 1, "action": "Appeler 5 anciens collègues RH pour leur dire ce que tu fais maintenant et demander qui vit ce type de tension.", "pourquoi": "Ton réseau est ton meilleur accès, et la confiance est déjà là." },
        { "canal": "linkedin", "priorite": 2, "action": "Publier chaque semaine une situation vécue (anonymisée) de conflit d'équipe en production et ce qui l'a débloquée.", "pourquoi": "Les directeurs de site lisent LinkedIn et se reconnaîtront dans des cas concrets." },
        { "canal": "evenements", "priorite": 3, "action": "Assister à une réunion d'association professionnelle régionale par mois.", "pourquoi": "Un échange en face à face crée la confiance nécessaire pour un sujet aussi sensible." }
      ],
      "linkedin": {
        "pertinence": "forte",
        "motsCles": "(\"directeur de site\" OR \"directrice de site\" OR \"directeur d'usine\" OR \"directrice d'usine\") AND (agroalimentaire OR alimentaire)",
        "intitules": ["Directeur de site", "Directeur d'usine", "Responsable de production", "DRH site"],
        "secteurs": ["Fabrication de produits alimentaires", "Industrie des boissons"],
        "tailles": ["51 à 200 salariés", "201 à 500 salariés"],
        "zone": "Bretagne",
        "autres": ["Relations de 2e niveau d'abord (vos contacts communs)", "Mots à chercher dans les publications : réorganisation, recrutement chefs d'équipe"],
        "astuce": "Commence par les relations de 2e niveau : un contact commun vaut toutes les accroches."
      },
      "messages": {
        "linkedin": "Bonjour [Prénom], j'ai passé 15 ans dans les RH de l'agroalimentaire en Bretagne et je travaille aujourd'hui avec des sites où les équipes ont du mal à se parler. Comment vivez-vous ce sujet chez vous en ce moment ?",
        "emailObjet": "Vos équipes de production se parlent-elles encore ?",
        "emailCorps": "Bonjour [Prénom],\n\nQuand deux équipes de production se renvoient la balle, la direction le découvre souvent par les chiffres : qualité, arrêts, départs.\n\nAprès 15 ans dans les RH de l'agroalimentaire, j'aide les sites à remettre leurs équipes autour de la table, pour dire ce qui bloque et décider ensemble.\n\nAccepteriez-vous un échange de 15 minutes pour me dire si ce sujet se pose chez vous ? Votre avis m'aiderait, même si la réponse est non.\n\nBien à vous,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "Trois directeurs ou directrices de site de ton réseau, joints par téléphone ou par un ancien collègue commun, pour un café ou un appel de 20 minutes.",
        "questions": ["Quelle est la dernière tension entre équipes qui vous a vraiment occupé ?", "Comment l'avez-vous gérée, concrètement ?", "Combien de temps cela a duré, et qu'est-ce que cela a coûté au site ?", "Avez-vous déjà fait appel à quelqu'un d'extérieur pour ce type de situation ?", "Qu'est-ce qui vous aurait aidé à ce moment-là ?"],
        "signauxPositifs": ["Ils racontent une situation récente sans que tu insistes", "Ils ont déjà payé un intervenant pour un sujet proche"],
        "signauxNegatifs": ["Ils disent que c'est le rôle du manager et que ça se règle tout seul", "Aucun budget ni aucune décision possible au niveau du site"]
      }
    },
    {
      "id": "c2",
      "nom": "Dirigeants de PME en croissance avec un comité de direction tendu",
      "marche": "b2b",
      "portrait": "Fondateur ou fondatrice d'une PME de 20 à 80 salariés qui a grandi vite. Le comité de direction s'est élargi, les anciens et les nouveaux ne se comprennent plus, et chaque réunion finit par un statu quo.",
      "douleur": "« On a doublé en trois ans, mais mon comité de direction ne décide plus rien, et je passe mes soirées à arbitrer. »",
      "ancrage": "Tu poses les questions que personne n'ose poser : c'est ce qui manque à un comité où chacun protège son territoire.",
      "promesse": "Un comité de direction qui se dit les choses et décide de nouveau, en une journée et un suivi.",
      "offre": {
        "nom": "Journée de déblocage du comité de direction",
        "format": "Une journée de séminaire avec le comité de direction, puis 2 points de suivi à distance",
        "duree": "1 jour et 2 mois de suivi",
        "contenu": ["Entretien de préparation avec le dirigeant", "Séminaire d'une journée : ce qui bloque, ce qu'on décide", "Charte de décision rédigée ensemble", "2 points de suivi d'une heure"]
      },
      "prix": { "min": 2500, "max": 4500, "unite": "par comité de direction", "base": "HT", "justification": "Un séminaire de direction facilité se situe dans cette fourchette ; le suivi justifie le haut de la fourchette." },
      "pitch": "Quand une entreprise grandit vite, son comité de direction se met souvent à tourner en rond. Je fais dire autour de la table ce que chacun garde pour lui, puis on décide ensemble de nouvelles règles du jeu. En une journée, votre comité se remet à décider.",
      "pourquoi": "Le problème est fréquent et douloureux pour un fondateur, et le format en groupe active ton talent. L'accès est moins direct que pour les sites industriels.",
      "exemple": "Imagine un fondateur d'entreprise de services qui a recruté trois directeurs l'an dernier. Les anciens associés se sentent dépossédés, les nouveaux ne trouvent pas leur place. Il cherche quelqu'un d'extérieur, neutre, pour remettre tout le monde d'accord.",
      "scores": {
        "urgence": { "note": 4, "raison": "Le dirigeant porte seul les arbitrages et s'épuise." },
        "paiement": { "note": 4, "raison": "Les PME en croissance financent volontiers un séminaire de direction." },
        "acces": { "note": 3, "raison": "Joignables par les réseaux de dirigeants, mais tu n'y as pas encore de contacts directs." },
        "plaisir": { "note": 4, "raison": "Un groupe sous tension qui doit se reparler, avec des enjeux de décision." }
      },
      "lieux": [
        { "type": "Réseaux et clubs de dirigeants de PME de ta ville", "pourquoi": "Les fondateurs y parlent ouvertement de leurs difficultés de management.", "recherche": "club dirigeants PME Rennes" },
        { "type": "Petits-déjeuners d'affaires des réseaux d'entrepreneurs", "pourquoi": "Format court où tu peux présenter un cas concret.", "recherche": "petit déjeuner entrepreneurs Rennes" }
      ],
      "canaux": [
        { "canal": "evenements", "priorite": 1, "action": "Rejoindre un réseau de dirigeants et y proposer un atelier de 30 minutes sur les comités qui ne décident plus.", "pourquoi": "Montrer ton talent en direct convainc plus vite qu'un discours." },
        { "canal": "linkedin", "priorite": 2, "action": "Écrire à 5 fondateurs par semaine dont l'entreprise recrute des directeurs.", "pourquoi": "Le recrutement de cadres est le signe visible de la croissance qui crée la tension." }
      ],
      "linkedin": {
        "pertinence": "forte",
        "motsCles": "(fondateur OR fondatrice OR \"président\" OR \"directeur général\" OR \"directrice générale\") AND PME",
        "intitules": ["Fondateur", "Président", "Directeur général"],
        "secteurs": ["Services aux entreprises", "Industrie", "Numérique"],
        "tailles": ["11 à 50 salariés", "51 à 200 salariés"],
        "zone": "Bretagne et Pays de la Loire",
        "autres": ["Entreprises qui publient des offres de postes de direction"],
        "astuce": "Repère les entreprises qui recrutent des directeurs : c'est le meilleur signal de tension à venir."
      },
      "messages": {
        "linkedin": "Bonjour [Prénom], j'ai vu que votre entreprise recrute de nouveaux directeurs, bravo pour la croissance. J'accompagne des comités de direction qui s'agrandissent vite. Comment se passent vos décisions à plusieurs en ce moment ?",
        "emailObjet": "Votre comité de direction décide-t-il encore vite ?",
        "emailCorps": "Bonjour [Prénom],\n\nQuand une entreprise grandit vite, le comité de direction s'élargit et les décisions ralentissent : chacun protège son périmètre et le dirigeant finit par trancher seul.\n\nJ'aide les comités à se dire les choses et à se remettre à décider ensemble, en une journée et un suivi court.\n\nSeriez-vous d'accord pour un échange de 15 minutes ? J'aimerais savoir si ce sujet vous parle.\n\nBien à vous,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "Trois dirigeants de PME en croissance, rencontrés dans un réseau d'entrepreneurs ou par une recommandation.",
        "questions": ["Comment se passe la dernière décision importante prise en comité ?", "Qu'est-ce qui a changé depuis que l'équipe de direction s'est agrandie ?", "Qui tranche quand vous n'êtes pas d'accord ?", "Avez-vous déjà organisé un séminaire de direction, et qu'en avez-vous retiré ?", "Qu'est-ce qui vous ferait gagner le plus de temps dans vos arbitrages ?"],
        "signauxPositifs": ["Ils décrivent des arbitrages solitaires qui les épuisent", "Ils ont déjà budgété un séminaire"],
        "signauxNegatifs": ["Le dirigeant pense que tout va bien et que le problème vient des autres", "L'entreprise est en difficulté financière"]
      }
    },
    {
      "id": "c3",
      "nom": "Managers fraîchement promus qui gèrent un conflit dans leur équipe",
      "marche": "b2c",
      "portrait": "Manager promu depuis moins d'un an, qui hérite d'une équipe divisée. Il ou elle n'ose pas en parler à sa hiérarchie et cherche un appui discret, financé de sa poche.",
      "douleur": "« Je viens d'être promu, mon équipe se déchire et j'ai peur qu'on pense que je ne suis pas à la hauteur. »",
      "ancrage": "Ta façon de poser les questions qui débloquent aide un manager à préparer les conversations difficiles qu'il repousse.",
      "promesse": "En un mois, vous savez mener les conversations difficiles avec votre équipe, sans y laisser votre sommeil.",
      "offre": {
        "nom": "Parcours premier conflit",
        "format": "4 séances individuelles d'une heure en visio",
        "duree": "1 mois",
        "contenu": ["Lire la situation et les besoins de chacun", "Préparer la conversation qui fait peur", "S'entraîner en jeu de rôle", "Faire le point après la conversation"]
      },
      "prix": { "min": 90, "max": 150, "unite": "par séance", "base": "TTC", "justification": "Un particulier qui paie seul compare avec un coaching individuel ; un parcours de 4 séances reste accessible." },
      "pitch": "Vous venez de prendre votre poste de manager et votre équipe se divise ? C'est fréquent, et ça se travaille. En quatre séances, on prépare ensemble les conversations que vous repoussez, et vous repartez avec des mots qui marchent.",
      "pourquoi": "Elle élargit ton marché au B2C et te donne des cas concrets à raconter, mais le budget est plus serré et l'individuel te met moins dans ton élément que le groupe.",
      "exemple": "Imagine un chef de rayon promu responsable de magasin, avec deux vendeurs qui ne se supportent plus. Il cherche de l'aide un dimanche soir, après une semaine difficile.",
      "scores": {
        "urgence": { "note": 3, "raison": "La situation pèse, mais le manager peut la laisser traîner." },
        "paiement": { "note": 2, "raison": "Il paie de sa poche et compare les prix." },
        "acces": { "note": 3, "raison": "Joignable par du contenu en ligne, sans réseau direct." },
        "plaisir": { "note": 3, "raison": "Tu aimes débloquer, mais en individuel et à distance, ton talent s'allume moins qu'en groupe." }
      },
      "lieux": [
        { "type": "Communautés en ligne de managers débutants", "pourquoi": "Ils y posent leurs questions de terrain.", "recherche": "communauté nouveaux managers" },
        { "type": "Ateliers et conférences grand public sur le management", "pourquoi": "Les managers qui s'y inscrivent sont déjà en recherche d'aide.", "recherche": "conférence management Rennes" }
      ],
      "canaux": [
        { "canal": "contenu", "priorite": 1, "action": "Écrire un guide court « 5 questions pour désamorcer un conflit d'équipe » à partager.", "pourquoi": "Le manager cherche en ligne avant d'oser demander de l'aide." },
        { "canal": "linkedin", "priorite": 2, "action": "Commenter chaque semaine les publications de managers qui annoncent une promotion.", "pourquoi": "Une promotion annoncée est le moment déclencheur visible." }
      ],
      "linkedin": {
        "pertinence": "moyenne",
        "motsCles": "(\"nouveau poste\" OR \"promu\" OR \"promue\") AND (manager OR responsable)",
        "intitules": ["Manager", "Responsable d'équipe", "Chef de service"],
        "secteurs": [],
        "tailles": [],
        "zone": "France",
        "autres": ["Publications qui annoncent une prise de poste"],
        "astuce": "Les managers promus annoncent souvent leur nouveau poste : félicite-les d'abord, sans rien vendre."
      },
      "messages": {
        "linkedin": "Bonjour [Prénom], félicitations pour ce nouveau poste ! J'accompagne des managers qui prennent leurs fonctions. Quel est le sujet d'équipe qui vous occupe le plus en ce moment ?",
        "emailObjet": "Votre premier conflit d'équipe",
        "emailCorps": "Bonjour [Prénom],\n\nPrendre un poste de manager, c'est souvent hériter d'une équipe qui a ses vieilles tensions. On n'ose pas toujours en parler à sa hiérarchie.\n\nJ'aide les nouveaux managers à préparer les conversations difficiles, en quatre séances courtes, pour qu'ils repartent avec des mots qui marchent.\n\nSi vous le souhaitez, nous pouvons en parler 15 minutes, juste pour voir si cela vous aiderait.\n\nBelle journée,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "Trois managers promus depuis moins d'un an, trouvés parmi tes anciens collègues ou leurs contacts.",
        "questions": ["Quelle est la dernière conversation difficile que vous avez repoussée ?", "Qu'est-ce qui vous a retenu de l'avoir ?", "À qui en avez-vous parlé ?", "Avez-vous déjà payé une formation ou un coaching de votre poche ?", "Qu'est-ce qui vous aurait aidé ce jour-là ?"],
        "signauxPositifs": ["Ils ont déjà cherché de l'aide en ligne", "Ils ont déjà payé une formation eux-mêmes"],
        "signauxNegatifs": ["Ils attendent que leur entreprise paie tout", "Ils ne voient pas de problème"]
      }
    }
  ],
  "antiCible": {
    "portrait": "Les grands groupes très hiérarchiques qui achètent un atelier de cohésion par les achats, comme une case à cocher, sans que la direction s'implique.",
    "signaux": ["Le premier contact passe par un acheteur et un appel d'offres", "La direction ne participera pas", "On te demande un programme figé validé à trois niveaux", "Le budget est négocié avant que le problème soit décrit"],
    "lienAntiContexte": "Ton Anti-Contexte, ce sont les organisations où tout doit être validé trois fois : ici, ton talent n'aurait jamais l'espace de poser les vraies questions.",
    "commentDire": "Merci pour votre confiance. Mon intervention marche quand la direction s'implique dès le départ. Si ce n'est pas possible, je préfère vous orienter vers un organisme de formation qui proposera un format standard."
  },
  "plan30": [
    { "semaine": 1, "titre": "Écouter le terrain", "actions": [
      { "texte": "Lister 10 directeurs de site de ton réseau et en choisir 3 à appeler.", "cible": "c1", "canal": "bouche_a_oreille", "minutes": 30 },
      { "texte": "Mener 3 appels de test terrain avec les 5 questions, sans présenter ton offre.", "cible": "c1", "canal": "telephone", "minutes": 90 },
      { "texte": "Noter les mots exacts qu'ils emploient pour décrire leurs tensions.", "cible": "c1", "canal": "autre", "minutes": 20 }
    ] },
    { "semaine": 2, "titre": "Premiers messages", "actions": [
      { "texte": "Envoyer le message LinkedIn à 10 directeurs de site, relations de 2e niveau d'abord.", "cible": "c1", "canal": "linkedin", "minutes": 45 },
      { "texte": "Envoyer l'email à 5 dirigeants de PME qui recrutent des directeurs.", "cible": "c2", "canal": "email", "minutes": 45 },
      { "texte": "Mettre à jour ton titre LinkedIn avec ta promesse.", "cible": "toutes", "canal": "linkedin", "minutes": 20 }
    ] },
    { "semaine": 3, "titre": "Se montrer", "actions": [
      { "texte": "Publier un cas anonymisé de conflit d'équipe débloqué, avec ce qui a marché.", "cible": "c1", "canal": "linkedin", "minutes": 60 },
      { "texte": "T'inscrire à une réunion de réseau de dirigeants ou d'association professionnelle.", "cible": "c2", "canal": "evenements", "minutes": 30 },
      { "texte": "Relancer avec une phrase les personnes contactées en semaine 2.", "cible": "toutes", "canal": "linkedin", "minutes": 30 }
    ] },
    { "semaine": 4, "titre": "Proposer et faire le bilan", "actions": [
      { "texte": "Proposer le diagnostic sur site à la personne la plus intéressée du test terrain.", "cible": "c1", "canal": "telephone", "minutes": 45 },
      { "texte": "Écrire ta fiche d'offre d'une page avec le prix et le format.", "cible": "c1", "canal": "autre", "minutes": 90 },
      { "texte": "Faire le bilan : quelle cible a répondu le plus, et que faut-il changer ?", "cible": "toutes", "canal": "autre", "minutes": 30 }
    ] }
  ],
  "hypotheses": ["J'ai supposé que tu peux te déplacer sur les sites dans toute la Bretagne."],
  "motPourToi": "Tu as déjà ce qui manque à beaucoup : un secteur que tu connais et des gens qui t'ont dit merci. Commence par eux, cette semaine."
};

/** Libellés français des valeurs d'énumération, pour le message envoyé au modèle (§7.5). */
export const LIBELLES_FR = {
  marche: { b2b: "B2B (entreprises, organisations)", b2c: "B2C (particuliers)", les_deux: "les deux", je_ne_sais_pas: "je ne sais pas encore" },
  formats: {
    individuel: "en individuel",
    groupe: "en groupe",
    presentiel: "en présentiel",
    distance: "à distance",
    conference: "conférences",
    formation: "formations",
    mission: "missions longues",
    produit: "produit ou contenu (livre, programme en ligne)",
  },
  styles: { chaleureux: "chaleureux", direct: "direct", expert: "expert", enjoue: "enjoué" },
  adresse: { tu: "tutoiement", vous: "vouvoiement" },
} as const;
