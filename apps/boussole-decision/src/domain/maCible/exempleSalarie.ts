// Jeu d'essai de la voie salarié (docs/cibleur-salarie-spec.md) : une entrée et la réponse brute du modèle.
// Sert aux tests et d'exemple dans la PR. Aucun vrai nom d'entreprise ni de personne.
import type { EntreeMaCible, ResultatSalarie, TerrainSalarie } from "./types";

export const TERRAIN_SALARIE_EXEMPLE: TerrainSalarie = {
  situation: "reconversion",
  posteActuel: "Responsable logistique dans l'agroalimentaire",
  experience: "10a20",
  secteursConnus: "agroalimentaire, grande distribution, transport",
  posteVise: "",
  contrats: ["cdi"],
  zone: "Lyon et 40 km autour, télétravail 1 jour",
  salaireMin: 48_000,
  salaireMax: 58_000,
  tailles: ["pme", "asso_public"],
  manager: {
    mission: "un cap clair et carte blanche sur le comment",
    erreur: "en parle franchement avec moi, sans chercher de coupable",
    decider: "l'organisation de mon équipe et des plannings",
  },
  valeurs: ["autonomie", "transparence", "impact"],
  valeurAutre: "",
  plusJamais:
    "Les réunions où tout se décide sans ceux qui font, et les chefs qui vérifient chaque détail.",
  reconversion: {
    metierVise: "responsable des opérations dans l'économie circulaire",
    transferables:
      "j'ai monté deux entrepôts, je sais former des équipes peu qualifiées, je parle aussi bien aux chauffeurs qu'aux acheteurs",
    manque: "je connais mal les filières de recyclage et le monde associatif",
  },
  patronsEnTete: [
    "Une ressourcerie qui grandit",
    "Les entrepôts de la grande distribution",
  ],
  adresse: "vous",
  style: "direct",
};

export const ENTREE_SALARIE_EXEMPLE: EntreeMaCible = {
  v: 1,
  langue: "fr",
  source: null,
  talent: {
    nom: "",
    mecanisme:
      "je remets de l'ordre dans un flux qui déborde en partant de ceux qui le font tourner",
    contexte:
      "une activité grandit plus vite que son organisation et l'équipe commence à s'épuiser",
    benefice:
      "le flux redevient fiable, l'équipe respire et la direction peut enfin décider sur des chiffres justes",
    antiContexte:
      "les sièges qui décident loin du terrain et les tableaux de bord remplis pour rien",
    reussite: "",
    sousTalents: [],
    pistes: [],
    aDeleguer: [],
  },
  terrain: {
    offre: "",
    marche: "",
    experience: "",
    clientsPasses: "",
    formats: [],
    zone: "",
    prixActuel: "",
    adresse: "vous",
    style: "chaleureux",
    ciblesEnTete: [],
  },
  reponses: [],
  synthese: null,
  voie: "salarie",
  terrainSalarie: TERRAIN_SALARIE_EXEMPLE,
};

const linkedin = (
  intitules: string[],
  secteurs: string[],
  tailles: string[],
) => ({
  pertinence: "forte" as const,
  motsCles: `(${intitules.map((i) => `"${i}"`).join(" OR ")}) AND (logistique OR "supply chain")`,
  intitules,
  secteurs,
  tailles,
  zone: "Lyon et alentours",
  autres: [
    "Chercher les publications sur un nouveau site ou un déménagement d'entrepôt",
  ],
  astuce:
    "Commence par les décideurs qui ont publié sur leur croissance ces derniers mois : leur problème est déjà sur la table.",
});

const email = (accroche: string, preuve: string) =>
  `Bonjour [Prénom],\n\n${accroche}\n\n${preuve}\n\nAccepteriez-vous un échange de 15 minutes pour me dire si ce sujet se pose chez vous ? Votre avis m'aiderait, même si la réponse est non.\n\nSi ce n'est pas le bon moment, dites-le-moi simplement.\n\nBien à vous,\n\n{{prenom}}`;

/** Réponse brute du modèle pour ENTREE_SALARIE_EXEMPLE, avant validation et contrôles. */
export const RESULTAT_SALARIE_EXEMPLE: ResultatSalarie = {
  voie: "salarie",
  langue: "fr",
  promesse:
    "Je remets de l'ordre dans les flux qui débordent, sans casser l'équipe qui les fait tourner.",
  regle: [
    "Des commandes qui partent à l'heure, même quand l'activité double.",
    "Une équipe terrain qui comprend le plan et qui reste.",
    "Des chiffres justes pour décider, sans tableaux de bord inutiles.",
  ],
  patrons: [
    {
      id: "c1",
      nom: "Directeur des opérations d'une PME agroalimentaire qui ouvre un deuxième site",
      portrait: {
        secteur: "Agroalimentaire",
        taille: "50 à 250 salariés",
        structure: "PME familiale",
        moment: "Croissance rapide, ouverture d'un deuxième site",
      },
      douleur:
        "Les commandes de la grande distribution doublent, les retards se multiplient et chaque retard coûte une pénalité.",
      pourquoiToi:
        "Son entreprise grandit plus vite que son organisation et ses chefs d'équipe s'épuisent : c'est exactement le moment où tu remets de l'ordre en partant de ceux qui font tourner le flux.",
      ancrage:
        "Quinze ans de logistique agroalimentaire et deux entrepôts montés sans rupture de livraison.",
      management: {
        style:
          "Un dirigeant de terrain, pressé, qui délègue volontiers à qui lui apporte des résultats.",
        colle:
          "Il donne un cap et laisse faire, comme le manager que tu décris.",
        frotte:
          "Sous pression, il peut vouloir tout suivre lui-même pendant quelques semaines.",
      },
      valeurs: {
        probables: ["Fiabilité", "Proximité", "Esprit d'équipe"],
        colle: "La proximité avec le terrain rejoint ton envie d'impact.",
        frotte: "",
      },
      questionsEntretien: [
        "Racontez-moi la dernière fois qu'un membre de l'équipe s'est trompé. Qu'est-ce qui s'est passé ensuite ?",
        "Qui a décidé de l'organisation du deuxième site, et comment l'équipe a-t-elle été associée ?",
        "La dernière fois qu'un chef d'équipe a changé un planning sans vous, comment l'avez-vous appris ?",
      ],
      besoin: { urgence: 5, rarete: 4, paiement: 4, acces: 4 },
      envie: { management: 4, valeurs: 4, declencheur: 5, cadre: 4 },
      lieux: [
        {
          genre: "entreprises",
          type: "PME agroalimentaires de 50 à 250 salariés qui viennent d'ouvrir un deuxième site",
          pourquoi: "Leur problème de flux est neuf et visible.",
          recherche: "agroalimentaire nouveau site Rhône",
        },
        {
          genre: "evenement",
          type: "Salons professionnels de l'agroalimentaire et de l'emballage",
          pourquoi: "Les dirigeants y sont disponibles et pas assaillis.",
          recherche: "salon agroalimentaire Lyon",
        },
        {
          genre: "reseau",
          type: "Associations régionales des industries agroalimentaires",
          pourquoi:
            "Les dirigeants y parlent de leurs problèmes de croissance.",
          recherche:
            "association industries agroalimentaires Auvergne-Rhône-Alpes",
        },
      ],
      approches: [
        {
          genre: "recommandation",
          action:
            "Demander à un ancien acheteur de la grande distribution qui connaît ces PME de te présenter.",
        },
        {
          genre: "conseil",
          action:
            "Proposer 15 minutes d'avis sur l'organisation d'un deuxième site, sans parler de poste.",
        },
        {
          genre: "spontanee",
          action:
            "Envoyer une candidature centrée sur le risque de retard du deuxième site, avec un plan en trois étapes.",
        },
      ],
      linkedin: linkedin(
        [
          "Directeur des opérations",
          "Directeur industriel",
          "Directeur de site",
        ],
        ["Agroalimentaire"],
        ["51 à 200 salariés"],
      ),
      pitchs: {
        noteInvitation:
          "Bonjour [Prénom], j'ai vu que vous ouvrez un deuxième site. Quinze ans de logistique agroalimentaire, j'aimerais suivre ce projet.",
        messageLinkedin:
          "Merci pour la connexion, [Prénom]. Un deuxième site double souvent les commandes à préparer avec les mêmes chefs d'équipe. J'ai monté deux entrepôts sans rupture de livraison. Accepteriez-vous 15 minutes pour me dire comment vous abordez ce passage ?",
        emailObjet: "Votre deuxième site et vos délais",
        emailCorps: email(
          "Ouvrir un deuxième site, c'est souvent doubler les commandes avec les mêmes chefs d'équipe, et voir les retards arriver avant les renforts.",
          "Pendant quinze ans, j'ai tenu les flux d'une usine agroalimentaire : deux entrepôts montés, aucune rupture chez les enseignes, et une équipe qui est restée.",
        ),
        oral30s:
          "Je remets de l'ordre dans les chaînes logistiques qui débordent, sans casser l'équipe. Pendant quinze ans, j'ai tenu les flux d'une usine agroalimentaire : deux déménagements d'entrepôt, zéro rupture chez les grandes surfaces, et une équipe qui est restée. Votre deuxième site va doubler les commandes à préparer, avec les mêmes chefs d'équipe. Je peux vous montrer en quinze minutes où ça risque de casser, et comment on l'évite. Seriez-vous d'accord pour un café la semaine prochaine ?",
      },
      exemple:
        "Imagine un directeur des opérations qui découvre chaque lundi une nouvelle pénalité de retard et passe ses soirées à refaire les plannings à la main.",
      depuisIdees: [],
    },
    {
      id: "c2",
      nom: "Directrice générale d'une entreprise de réemploi qui change d'échelle",
      portrait: {
        secteur: "Économie circulaire, réemploi et réparation",
        taille: "20 à 80 salariés",
        structure: "Entreprise de l'économie sociale et solidaire",
        moment: "Changement d'échelle après un nouveau financement",
      },
      douleur:
        "Les collectes s'accumulent plus vite que l'atelier ne trie, l'entrepôt déborde et l'équipe en insertion s'épuise.",
      pourquoiToi:
        "Une activité qui grandit plus vite que son organisation, avec une équipe à faire monter en compétence : ton talent s'y allume, et ton envie d'impact y trouve du sens.",
      ancrage:
        "Tu sais former des équipes peu qualifiées et remettre un flux simple en place en quelques semaines.",
      management: {
        style:
          "Une dirigeante engagée, très présente à l'extérieur, qui cherche un bras droit sur l'opérationnel.",
        colle: "Elle laisse carte blanche sur le comment à qui tient le cap.",
        frotte:
          "Les décisions passent parfois par un conseil d'administration, plus lent que tu ne le souhaites.",
      },
      valeurs: {
        probables: ["Sens", "Transparence", "Solidarité"],
        colle: "Le sens et la transparence rejoignent deux de tes valeurs.",
        frotte: "Le salaire visé peut être en haut de sa fourchette.",
      },
      questionsEntretien: [
        "La dernière fois que l'entrepôt a débordé, qui a décidé quoi, et en combien de temps ?",
        "Racontez-moi une erreur récente dans l'équipe. Qu'est-ce qui s'est passé ensuite ?",
        "Qu'est-ce que la personne à ce poste a pu décider seule l'an dernier ?",
      ],
      besoin: { urgence: 4, rarete: 5, paiement: 3, acces: 3 },
      envie: { management: 5, valeurs: 5, declencheur: 5, cadre: 3 },
      lieux: [
        {
          genre: "entreprises",
          type: "Ressourceries et entreprises de réemploi de plus de 20 salariés",
          pourquoi: "Celles qui grandissent ont toutes un problème de flux.",
          recherche: "ressourcerie réemploi Lyon",
        },
        {
          genre: "reseau",
          type: "Réseaux régionaux de l'économie sociale et solidaire",
          pourquoi: "Les dirigeantes y partagent leurs projets de croissance.",
          recherche: "réseau ESS Auvergne-Rhône-Alpes",
        },
        {
          genre: "evenement",
          type: "Rencontres professionnelles de l'économie circulaire",
          pourquoi: "On y croise les dirigeants qui changent d'échelle.",
          recherche: "rencontres économie circulaire Lyon",
        },
      ],
      approches: [
        {
          genre: "conseil",
          action:
            "Demander 15 minutes d'avis sur les métiers de la logistique du réemploi, en disant que tu changes de métier.",
        },
        {
          genre: "evenement",
          action:
            "Aller à une rencontre de l'économie circulaire et poser des questions sur leurs flux de collecte.",
        },
        {
          genre: "contenu",
          action:
            "Commenter utilement ses publications sur la croissance de l'atelier, puis lui écrire.",
        },
      ],
      linkedin: linkedin(
        [
          "Directrice générale",
          "Directeur des opérations",
          "Responsable d'exploitation",
        ],
        ["Économie circulaire", "Économie sociale et solidaire"],
        ["11 à 50 salariés", "51 à 200 salariés"],
      ),
      pitchs: {
        noteInvitation:
          "Bonjour [Prénom], votre atelier de réemploi grandit vite. Je viens de la logistique et je m'oriente vers ce secteur, j'aimerais vous suivre.",
        messageLinkedin:
          "Merci, [Prénom]. Je quitte la logistique agroalimentaire pour l'économie circulaire. J'ai remis en ordre des entrepôts qui débordaient, en formant des équipes peu qualifiées. Auriez-vous 15 minutes pour me dire ce qui coince dans vos flux de collecte ?",
        emailObjet: "Vos collectes et votre atelier",
        emailCorps: email(
          "Quand les collectes arrivent plus vite que l'atelier ne trie, l'entrepôt déborde et l'équipe s'épuise, alors que tout le monde fait de son mieux.",
          "Pendant quinze ans, j'ai remis de l'ordre dans des entrepôts agroalimentaires en formant des équipes peu qualifiées. Je m'oriente aujourd'hui vers le réemploi.",
        ),
        oral30s:
          "Je remets de l'ordre dans les flux qui débordent, sans casser l'équipe. Dans l'agroalimentaire, j'ai organisé la préparation de milliers de commandes par semaine, avec des produits qui ne pardonnent aucun retard. Votre activité de réemploi grandit plus vite que votre entrepôt : les collectes s'accumulent et l'équipe s'épuise. Je sais remettre un circuit simple en place en quelques semaines. Accepteriez-vous un échange de quinze minutes pour me dire si ce sujet se pose chez vous ?",
      },
      exemple:
        "Imagine une dirigeante de ressourcerie qui vient d'obtenir un financement pour doubler son activité et qui trie encore les dons elle-même le samedi.",
      depuisIdees: ["i1"],
    },
    {
      id: "c3",
      nom: "Directeur de site d'un logisticien régional récemment racheté",
      portrait: {
        secteur: "Logistique et transport",
        taille: "100 à 300 salariés",
        structure: "Filiale d'un groupe national",
        moment: "Rachat récent et réorganisation",
      },
      douleur:
        "Depuis le rachat, les procédures changent chaque mois, les chefs d'équipe attendent des réponses et les meilleurs partent.",
      pourquoiToi:
        "Un flux à remettre d'aplomb avec une équipe inquiète : ton talent répond à sa douleur, même si le siège lointain ressemble à ce que tu veux éviter.",
      ancrage:
        "Deux réorganisations vécues de l'intérieur, où l'équipe a construit les nouveaux plannings avec toi.",
      management: {
        style:
          "Un directeur coincé entre le siège et le terrain, qui cherche un relais solide.",
        colle: "Il a besoin de quelqu'un qui décide sur le terrain.",
        frotte:
          "Le siège impose des indicateurs, ce qui rappelle les tableaux de bord que tu ne veux plus remplir.",
      },
      valeurs: {
        probables: ["Performance", "Rigueur"],
        colle: "La rigueur rejoint ton exigence de chiffres justes.",
        frotte:
          "Tu n'as rien dit sur la performance : à vérifier en entretien.",
      },
      questionsEntretien: [
        "Depuis le rachat, quelle décision le site a-t-il pu prendre sans le siège ?",
        "Racontez-moi la dernière fois qu'un indicateur était rouge. Qu'est-ce qui s'est passé ensuite ?",
        "Qui a quitté l'équipe ces six derniers mois, et pourquoi selon vous ?",
      ],
      besoin: { urgence: 4, rarete: 3, paiement: 5, acces: 4 },
      envie: { management: 3, valeurs: 3, declencheur: 3, cadre: 4 },
      lieux: [
        {
          genre: "entreprises",
          type: "Logisticiens régionaux de 100 à 300 salariés rachetés par un groupe",
          pourquoi: "Ils traversent une réorganisation.",
          recherche: "logisticien entrepôt Saint-Priest",
        },
        {
          genre: "evenement",
          type: "Salons professionnels de la logistique et de la supply chain",
          pourquoi: "Les directeurs de site y viennent chercher des solutions.",
          recherche: "salon logistique Lyon",
        },
        {
          genre: "reseau",
          type: "Associations de professionnels de la supply chain",
          pourquoi: "On y croise des directeurs de site en poste.",
          recherche: "association supply chain Lyon",
        },
      ],
      approches: [
        {
          genre: "recommandation",
          action:
            "Demander à un ancien collègue transporteur qui travaille avec ce site de te mettre en relation.",
        },
        {
          genre: "spontanee",
          action:
            "Écrire au directeur de site sur la fidélisation des chefs d'équipe après un rachat, avec une idée concrète.",
        },
        {
          genre: "evenement",
          action:
            "Aller à un salon de la logistique et demander aux directeurs de site comment ils vivent le changement de propriétaire.",
        },
      ],
      linkedin: linkedin(
        [
          "Directeur de site",
          "Directeur d'exploitation",
          "Responsable de plateforme",
        ],
        ["Logistique", "Transport"],
        ["201 à 500 salariés"],
      ),
      pitchs: {
        noteInvitation:
          "Bonjour [Prénom], j'ai vu le rachat de votre site. J'ai vécu deux réorganisations côté terrain, j'aimerais échanger avec vous.",
        messageLinkedin:
          "Merci, [Prénom]. Après un rachat, les chefs d'équipe attendent souvent des réponses que le groupe ne donne pas encore. J'ai vécu deux réorganisations où l'équipe est restée. Auriez-vous 15 minutes pour me dire comment cela se passe chez vous ?",
        emailObjet: "Vos chefs d'équipe après le rachat",
        emailCorps: email(
          "Après un rachat, les procédures changent vite, les chefs d'équipe attendent des réponses et les meilleurs regardent ailleurs.",
          "J'ai vécu deux réorganisations d'entrepôt de l'intérieur. Chaque fois, l'équipe est restée, parce qu'elle a construit les nouveaux plannings avec moi.",
        ),
        oral30s:
          "Je remets de l'ordre dans les entrepôts qui débordent, sans casser l'équipe. J'ai vécu deux réorganisations de l'intérieur, et chaque fois l'équipe est restée, parce qu'elle a construit les nouveaux plannings avec moi. Après un rachat, vos chefs d'équipe attendent des réponses que le groupe ne donne pas encore. Je peux tenir ce cap au quotidien, sur le terrain, pendant que vous discutez avec le siège. Auriez-vous quinze minutes pour en parler ?",
      },
      exemple:
        "Imagine un directeur de site qui reçoit chaque mois une nouvelle procédure du groupe et voit partir ses deux meilleurs chefs d'équipe.",
      depuisIdees: ["i2"],
    },
  ],
  managerIdeal: {
    portrait:
      "Il donne un cap clair et te laisse le chemin. Il passe sur le terrain sans tout vérifier. Quand quelqu'un se trompe, il en parle franchement, sans chercher de coupable. Il te laisse décider de l'organisation de l'équipe et des plannings.",
    flow: "Un problème de flux urgent, une équipe à embarquer et carte blanche pour agir.",
    eteint:
      "Les réunions où tout se décide sans ceux qui font, et un chef qui vérifie chaque détail.",
  },
  antiPatron: {
    portrait:
      "Un patron qui décide loin du terrain et demande des tableaux de bord que personne ne lit.",
    signaux: [
      "En entretien, personne du terrain n'est présent ni cité.",
      "On te parle surtout d'indicateurs à remplir, peu de problèmes à régler.",
      "Le dernier titulaire du poste est parti au bout de quelques mois.",
    ],
  },
  reconversion: {
    transferables: [
      {
        competence: "Organiser un flux",
        preuve: "Tu as monté deux entrepôts sans rupture de livraison.",
      },
      {
        competence: "Former des équipes peu qualifiées",
        preuve: "Tu formes des préparateurs de commandes depuis des années.",
      },
      {
        competence: "Parler à tous les niveaux",
        preuve: "Tu dis parler aussi bien aux chauffeurs qu'aux acheteurs.",
      },
    ],
    premiereMarche:
      "Responsable logistique dans une entreprise de réemploi de taille moyenne, pour apprendre les filières tout en gardant ton cœur de métier.",
    essais: [
      "Une mission courte de deux semaines pour réorganiser l'entrepôt d'une ressourcerie.",
      "Une immersion professionnelle de quelques jours dans une entreprise de réemploi, via l'immersion facilitée.",
      "Une formation courte sur les filières de recyclage et le réemploi.",
    ],
  },
  plan30: [
    {
      semaine: 1,
      titre: "Écouter le métier",
      actions: [
        {
          texte:
            "Trouver trois personnes qui travaillent dans le réemploi et leur demander 15 minutes d'avis.",
          cible: "c2",
          canal: "linkedin",
          minutes: 45,
        },
        {
          texte:
            "Préparer cinq questions sur leurs flux et leurs difficultés de croissance.",
          cible: "toutes",
          canal: "autre",
          minutes: 30,
        },
        {
          texte:
            "Mener un premier entretien conseil avec un directeur des opérations de l'agroalimentaire.",
          cible: "c1",
          canal: "telephone",
          minutes: 30,
        },
      ],
    },
    {
      semaine: 2,
      titre: "Premiers messages",
      actions: [
        {
          texte:
            "Repérer cinq PME agroalimentaires qui ouvrent un nouveau site dans l'Annuaire des Entreprises.",
          cible: "c1",
          canal: "autre",
          minutes: 60,
        },
        {
          texte:
            "Envoyer trois notes d'invitation à des dirigeants du réemploi.",
          cible: "c2",
          canal: "linkedin",
          minutes: 30,
        },
        {
          texte:
            "Écrire à un ancien collègue transporteur pour une recommandation.",
          cible: "c3",
          canal: "email",
          minutes: 20,
        },
      ],
    },
    {
      semaine: 3,
      titre: "Sortir et relancer",
      actions: [
        {
          texte:
            "Aller à une rencontre professionnelle de la logistique et parler à deux directeurs de site.",
          cible: "c3",
          canal: "evenements",
          minutes: 180,
        },
        {
          texte:
            "Relancer les messages restés sans réponse avec une question utile.",
          cible: "toutes",
          canal: "linkedin",
          minutes: 30,
        },
        {
          texte: "Commenter deux publications de dirigeants du réemploi.",
          cible: "c2",
          canal: "linkedin",
          minutes: 20,
        },
      ],
    },
    {
      semaine: 4,
      titre: "Candidater et faire le bilan",
      actions: [
        {
          texte:
            "Envoyer une candidature ciblée sur le problème du deuxième site au patron le plus prometteur.",
          cible: "c1",
          canal: "email",
          minutes: 90,
        },
        {
          texte:
            "Écrire au directeur de site sur la fidélisation des chefs d'équipe après un rachat.",
          cible: "c3",
          canal: "email",
          minutes: 45,
        },
        {
          texte:
            "Noter ce que les entretiens ont appris et choisir le patron à viser en premier.",
          cible: "toutes",
          canal: "autre",
          minutes: 30,
        },
      ],
    },
  ],
  testTerrain: {
    profils:
      "Trois personnes en poste dans le réemploi ou la logistique : un responsable d'exploitation, une dirigeante de ressourcerie, un directeur de site. Cherche-les sur LinkedIn ou via les réseaux de l'économie sociale et solidaire.",
    questions: [
      "La dernière fois que votre entrepôt a débordé, qu'avez-vous fait ?",
      "Qui avez-vous recruté en dernier sur l'opérationnel, et comment l'avez-vous trouvé ?",
      "Qu'est-ce qui a coincé lors de votre dernière croissance d'activité ?",
      "Combien de temps vous a pris la dernière réorganisation de l'équipe ?",
      "À qui avez-vous demandé conseil la dernière fois que les délais ont dérapé ?",
    ],
    signauxPositifs: [
      "Ils racontent un débordement récent avec des détails.",
      "Ils proposent de te présenter à quelqu'un.",
    ],
    signauxNegatifs: [
      "Ils n'ont aucun problème de flux en ce moment.",
      "Ils recrutent seulement par cabinet, sans rencontrer avant.",
    ],
  },
  hypotheses: [
    "Le salaire visé est plus facile à atteindre dans l'agroalimentaire que dans le réemploi : à vérifier pendant les entretiens conseil.",
  ],
  motPourToi:
    "Ton talent est rare là où une activité grandit trop vite. Commence par écouter le métier du réemploi avant de candidater : c'est là que ton plaisir semble le plus fort.",
};
