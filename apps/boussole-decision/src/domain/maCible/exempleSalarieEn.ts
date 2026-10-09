// Jeu d'essai de la voie salarié en anglais : traduction de exempleSalarie.ts, sans régénération par l'IA.
// Sert aux tests et à vérifier l'écran de résultat en anglais. Aucun vrai nom d'entreprise ni de personne.
import type { EntreeMaCible, ResultatSalarie, TerrainSalarie } from "./types";

export const TERRAIN_SALARIE_EXEMPLE_EN: TerrainSalarie = {
  situation: "reconversion",
  posteActuel: "Logistics manager in the food industry",
  experience: "10a20",
  secteursConnus: "food industry, retail, transport",
  posteVise: "",
  contrats: ["cdi"],
  zone: "Lyon and 40 km around, 1 day working from home",
  salaireMin: 48_000,
  salaireMax: 58_000,
  tailles: ["pme", "asso_public"],
  manager: {
    mission: "a clear direction and a free hand on the how",
    erreur: "talks to me about it openly, without looking for someone to blame",
    decider: "how my team and the schedules are organised",
  },
  valeurs: ["autonomie", "transparence", "impact"],
  valeurAutre: "",
  plusJamais:
    "Meetings where everything is decided without the people who do the work, and bosses who check every detail.",
  reconversion: {
    metierVise: "operations manager in the circular economy",
    transferables:
      "I've set up two warehouses, I know how to train low-skilled teams, I talk to drivers and buyers just as easily",
    manque: "I don't know much about recycling streams or the non-profit world",
  },
  patronsEnTete: [
    "A reuse centre that's growing",
    "Retail warehouses",
  ],
  adresse: "vous",
  style: "direct",
};

export const ENTREE_SALARIE_EXEMPLE_EN: EntreeMaCible = {
  v: 1,
  langue: "en",
  source: null,
  talent: {
    nom: "",
    mecanisme:
      "I bring order back to an overflowing flow, starting with the people who keep it running",
    contexte:
      "an activity is growing faster than its organisation and the team is starting to burn out",
    benefice:
      "the flow becomes reliable again, the team can breathe and management can finally decide on accurate figures",
    antiContexte:
      "head offices that decide far from the shop floor, and dashboards filled in for nothing",
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
  terrainSalarie: TERRAIN_SALARIE_EXEMPLE_EN,
};

const linkedin = (
  intitules: string[],
  secteurs: string[],
  tailles: string[],
) => ({
  pertinence: "forte" as const,
  motsCles: `(${intitules.map((i) => `"${i}"`).join(" OR ")}) AND (logistics OR "supply chain")`,
  intitules,
  secteurs,
  tailles,
  zone: "Lyon and the surrounding area",
  autres: [
    "Look for posts about a new site or a warehouse move",
  ],
  astuce:
    "Start with decision-makers who've posted about their growth in recent months: their problem is already out in the open.",
});

const email = (accroche: string, preuve: string) =>
  `Hello [First name],\n\n${accroche}\n\n${preuve}\n\nWould you be open to a 15-minute call to tell me whether this comes up for you? Your view would help me, even if the answer is no.\n\nIf now isn't a good time, just let me know.\n\nKind regards,\n\n{{prenom}}`;

/** Réponse brute du modèle pour ENTREE_SALARIE_EXEMPLE_EN, avant validation et contrôles. */
export const RESULTAT_SALARIE_EXEMPLE_EN: ResultatSalarie = {
  voie: "salarie",
  langue: "en",
  promesse:
    "I bring order back to overflowing flows, without breaking the team that keeps them running.",
  regle: [
    "Orders that leave on time, even when activity doubles.",
    "A frontline team that understands the plan and stays.",
    "Accurate figures to decide on, without pointless dashboards.",
  ],
  patrons: [
    {
      id: "c1",
      nom: "Operations director at a food business opening a second site",
      portrait: {
        secteur: "Food industry",
        taille: "50 to 250 employees",
        structure: "Family-owned SME",
        moment: "Fast growth, opening a second site",
      },
      douleur:
        "Orders from the big retailers are doubling, delays are piling up and every delay comes with a penalty.",
      pourquoiToi:
        "His company is growing faster than its organisation and his team leaders are burning out: that's exactly when you bring order back, starting with the people who keep the flow running.",
      ancrage:
        "Fifteen years in food industry logistics and two warehouses set up without a single missed delivery.",
      management: {
        style:
          "A hands-on, busy leader who's happy to delegate to anyone who delivers results.",
        colle:
          "He sets a direction and lets you get on with it, like the manager you describe.",
        frotte:
          "Under pressure, he may want to follow everything himself for a few weeks.",
      },
      valeurs: {
        probables: ["Reliability", "Closeness to the field", "Team spirit"],
        colle: "Being close to the shop floor matches your wish for impact.",
        frotte: "",
      },
      questionsEntretien: [
        "Tell me about the last time someone in the team made a mistake. What happened next?",
        "Who decided how the second site would be organised, and how was the team involved?",
        "The last time a team leader changed a schedule without you, how did you find out?",
      ],
      besoin: { urgence: 5, rarete: 4, paiement: 4, acces: 4 },
      envie: { management: 4, valeurs: 4, declencheur: 5, cadre: 4 },
      lieux: [
        {
          genre: "entreprises",
          type: "Food businesses with 50 to 250 staff that have just opened a second site",
          pourquoi: "Their flow problem is new and visible.",
          recherche: "food industry new site Rhône",
        },
        {
          genre: "evenement",
          type: "Food and packaging industry trade shows",
          pourquoi: "Leaders are available there and not swamped.",
          recherche: "food industry trade show Lyon",
        },
        {
          genre: "reseau",
          type: "Regional food industry associations",
          pourquoi:
            "Leaders talk there about their growing pains.",
          recherche:
            "food industry association Auvergne-Rhône-Alpes",
        },
      ],
      approches: [
        {
          genre: "recommandation",
          action:
            "Ask a former retail buyer who knows these businesses to introduce you.",
        },
        {
          genre: "conseil",
          action:
            "Offer 15 minutes of input on organising a second site, without mentioning a job.",
        },
        {
          genre: "spontanee",
          action:
            "Send an application focused on the risk of delays at the second site, with a three-step plan.",
        },
      ],
      linkedin: linkedin(
        [
          "Operations Director",
          "Industrial Director",
          "Site Director",
        ],
        ["Food Production"],
        ["51 to 200 employees"],
      ),
      pitchs: {
        noteInvitation:
          "Hello [First name], I saw you're opening a second site. Fifteen years in food industry logistics here, I'd love to follow the project.",
        messageLinkedin:
          "Thanks for connecting, [First name]. A second site often doubles the orders to prepare with the same team leaders. I've set up two warehouses without a missed delivery. Would you have 15 minutes to tell me how you're approaching this step?",
        emailObjet: "Your second site and your lead times",
        emailCorps: email(
          "Opening a second site often means doubling orders with the same team leaders, and seeing delays arrive before the extra hands do.",
          "For fifteen years, I ran the flows of a food plant: two warehouses set up, no stock-outs at the retailers, and a team that stayed.",
        ),
        oral30s:
          "I bring order back to logistics chains that are overflowing, without breaking the team. For fifteen years, I ran the flows of a food plant: two warehouse moves, zero stock-outs at the supermarkets, and a team that stayed. Your second site is going to double the orders to prepare, with the same team leaders. In fifteen minutes I can show you where it's likely to break, and how to avoid it. Would you be up for a coffee next week?",
      },
      exemple:
        "Imagine an operations director who finds a new late-delivery penalty every Monday and spends his evenings redoing the schedules by hand.",
      depuisIdees: [],
    },
    {
      id: "c2",
      nom: "Managing director of a reuse business that's scaling up",
      portrait: {
        secteur: "Circular economy, reuse and repair",
        taille: "20 to 80 employees",
        structure: "Social and solidarity economy business",
        moment: "Scaling up after new funding",
      },
      douleur:
        "Collections pile up faster than the workshop can sort them, the warehouse is overflowing and the work-integration team is burning out.",
      pourquoiToi:
        "An activity growing faster than its organisation, with a team to upskill: your talent lights up there, and your wish for impact finds meaning.",
      ancrage:
        "You know how to train low-skilled teams and set up a simple flow in a few weeks.",
      management: {
        style:
          "A committed leader, often out representing the business, who's looking for a right hand on operations.",
        colle: "She gives a free hand on the how to whoever keeps the course.",
        frotte:
          "Decisions sometimes go through a board, which is slower than you'd like.",
      },
      valeurs: {
        probables: ["Purpose", "Transparency", "Solidarity"],
        colle: "Purpose and transparency match two of your values.",
        frotte: "Your target salary may be at the top of her range.",
      },
      questionsEntretien: [
        "The last time the warehouse overflowed, who decided what, and how quickly?",
        "Tell me about a recent mistake in the team. What happened next?",
        "What was the person in this role able to decide alone last year?",
      ],
      besoin: { urgence: 4, rarete: 5, paiement: 3, acces: 3 },
      envie: { management: 5, valeurs: 5, declencheur: 5, cadre: 3 },
      lieux: [
        {
          genre: "entreprises",
          type: "Reuse centres and reuse businesses with more than 20 staff",
          pourquoi: "The ones that are growing all have a flow problem.",
          recherche: "ressourcerie réemploi Lyon",
        },
        {
          genre: "reseau",
          type: "Regional social and solidarity economy networks",
          pourquoi: "Leaders share their growth plans there.",
          recherche: "réseau ESS Auvergne-Rhône-Alpes",
        },
        {
          genre: "evenement",
          type: "Circular economy professional meetups",
          pourquoi: "You'll meet the leaders who are scaling up.",
          recherche: "circular economy meetup Lyon",
        },
      ],
      approches: [
        {
          genre: "conseil",
          action:
            "Ask for 15 minutes of input on logistics jobs in reuse, saying you're changing careers.",
        },
        {
          genre: "evenement",
          action:
            "Go to a circular economy meetup and ask about their collection flows.",
        },
        {
          genre: "contenu",
          action:
            "Leave useful comments on her posts about the workshop's growth, then write to her.",
        },
      ],
      linkedin: linkedin(
        [
          "Managing Director",
          "Operations Director",
          "Operations Manager",
        ],
        ["Circular Economy", "Social Economy"],
        ["11 to 50 employees", "51 to 200 employees"],
      ),
      pitchs: {
        noteInvitation:
          "Hello [First name], your reuse workshop is growing fast. I come from logistics and I'm moving into this sector, I'd love to follow your work.",
        messageLinkedin:
          "Thanks, [First name]. I'm leaving food industry logistics for the circular economy. I've brought order back to overflowing warehouses while training low-skilled teams. Would you have 15 minutes to tell me what's getting stuck in your collection flows?",
        emailObjet: "Your collections and your workshop",
        emailCorps: email(
          "When collections arrive faster than the workshop can sort them, the warehouse overflows and the team burns out, even though everyone is doing their best.",
          "For fifteen years, I brought order back to food industry warehouses while training low-skilled teams. I'm now moving into reuse.",
        ),
        oral30s:
          "I bring order back to overflowing flows, without breaking the team. In the food industry, I organised the preparation of thousands of orders a week, with products that don't forgive any delay. Your reuse business is growing faster than your warehouse: collections are piling up and the team is burning out. I know how to set up a simple circuit in a few weeks. Would you be open to a fifteen-minute chat to tell me whether this comes up for you?",
      },
      exemple:
        "Imagine the head of a reuse centre who has just secured funding to double her activity and still sorts the donations herself on Saturdays.",
      depuisIdees: ["i1"],
    },
    {
      id: "c3",
      nom: "Site director at a recently acquired regional logistics firm",
      portrait: {
        secteur: "Logistics and transport",
        taille: "100 to 300 employees",
        structure: "Subsidiary of a national group",
        moment: "Recent acquisition and restructuring",
      },
      douleur:
        "Since the takeover, procedures change every month, team leaders are waiting for answers and the best people are leaving.",
      pourquoiToi:
        "A flow to put back on its feet with a worried team: your talent answers his pain, even if the distant head office looks like what you want to avoid.",
      ancrage:
        "Two restructurings lived from the inside, where the team built the new schedules with you.",
      management: {
        style:
          "A director caught between head office and the shop floor, looking for someone solid to rely on.",
        colle: "He needs someone who makes decisions on the ground.",
        frotte:
          "Head office imposes KPIs, which is a reminder of the dashboards you no longer want to fill in.",
      },
      valeurs: {
        probables: ["Performance", "Rigour"],
        colle: "Rigour matches your insistence on accurate figures.",
        frotte:
          "You didn't say anything about performance: worth checking in the interview.",
      },
      questionsEntretien: [
        "Since the takeover, what decision has the site been able to make without head office?",
        "Tell me about the last time a KPI was in the red. What happened next?",
        "Who has left the team in the last six months, and why do you think they left?",
      ],
      besoin: { urgence: 4, rarete: 3, paiement: 5, acces: 4 },
      envie: { management: 3, valeurs: 3, declencheur: 3, cadre: 4 },
      lieux: [
        {
          genre: "entreprises",
          type: "Regional logistics firms with 100 to 300 staff bought by a group",
          pourquoi: "They're going through a restructuring.",
          recherche: "logistics warehouse Saint-Priest",
        },
        {
          genre: "evenement",
          type: "Logistics and supply chain trade shows",
          pourquoi: "Site directors go there looking for solutions.",
          recherche: "logistics trade show Lyon",
        },
        {
          genre: "reseau",
          type: "Supply chain professional associations",
          pourquoi: "You'll meet site directors who are in post.",
          recherche: "supply chain association Lyon",
        },
      ],
      approches: [
        {
          genre: "recommandation",
          action:
            "Ask a former haulier colleague who works with this site to put you in touch.",
        },
        {
          genre: "spontanee",
          action:
            "Write to the site director about keeping team leaders after a takeover, with a concrete idea.",
        },
        {
          genre: "evenement",
          action:
            "Go to a logistics trade show and ask site directors how they're coping with the change of owner.",
        },
      ],
      linkedin: linkedin(
        [
          "Site Director",
          "Operations Manager",
          "Distribution Centre Manager",
        ],
        ["Logistics", "Transport"],
        ["201 to 500 employees"],
      ),
      pitchs: {
        noteInvitation:
          "Hello [First name], I saw your site was acquired. I've been through two restructurings on the ground, I'd like to connect.",
        messageLinkedin:
          "Thanks, [First name]. After a takeover, team leaders are often waiting for answers the group can't give yet. I've been through two restructurings where the team stayed. Would you have 15 minutes to tell me how it's going on your side?",
        emailObjet: "Your team leaders after the takeover",
        emailCorps: email(
          "After a takeover, procedures change fast, team leaders are waiting for answers and the best people start looking elsewhere.",
          "I've been through two warehouse restructurings from the inside. Each time, the team stayed, because they built the new schedules with me.",
        ),
        oral30s:
          "I bring order back to overflowing warehouses, without breaking the team. I've been through two restructurings from the inside, and each time the team stayed, because they built the new schedules with me. After a takeover, your team leaders are waiting for answers the group can't give yet. I can hold that course day to day, on the ground, while you deal with head office. Would you have fifteen minutes to talk about it?",
      },
      exemple:
        "Imagine a site director who gets a new procedure from the group every month and watches his two best team leaders leave.",
      depuisIdees: ["i2"],
    },
  ],
  managerIdeal: {
    portrait:
      "They set a clear direction and leave the route to you. They come to the shop floor without checking everything. When someone makes a mistake, they talk about it openly, without looking for someone to blame. They let you decide how the team and the schedules are organised.",
    flow: "An urgent flow problem, a team to bring on board and a free hand to act.",
    eteint:
      "Meetings where everything is decided without the people who do the work, and a boss who checks every detail.",
  },
  antiPatron: {
    portrait:
      "A boss who decides far from the shop floor and asks for dashboards nobody reads.",
    signaux: [
      "In the interview, nobody from the shop floor is there or even mentioned.",
      "They mostly talk about KPIs to fill in, and very little about problems to solve.",
      "The last person in the role left after a few months.",
    ],
  },
  reconversion: {
    transferables: [
      {
        competence: "Organising a flow",
        preuve: "You set up two warehouses without a single missed delivery.",
      },
      {
        competence: "Training low-skilled teams",
        preuve: "You've been training order pickers for years.",
      },
      {
        competence: "Talking to people at every level",
        preuve: "You say you talk to drivers and buyers just as easily.",
      },
    ],
    premiereMarche:
      "Logistics manager at a mid-sized reuse business, to learn the recycling streams while keeping your core skills.",
    essais: [
      "A short two-week assignment to reorganise a reuse centre's warehouse.",
      "A few days' work placement in a reuse business, through a job-shadowing scheme.",
      "A short course on recycling streams and reuse.",
    ],
  },
  plan30: [
    {
      semaine: 1,
      titre: "Listen to the trade",
      actions: [
        {
          texte:
            "Find three people who work in reuse and ask them for 15 minutes of input.",
          cible: "c2",
          canal: "linkedin",
          minutes: 45,
        },
        {
          texte:
            "Prepare five questions about their flows and their growing pains.",
          cible: "toutes",
          canal: "autre",
          minutes: 30,
        },
        {
          texte:
            "Hold a first advice call with an operations director in the food industry.",
          cible: "c1",
          canal: "telephone",
          minutes: 30,
        },
      ],
    },
    {
      semaine: 2,
      titre: "First messages",
      actions: [
        {
          texte:
            "Find five food businesses opening a new site in the French company directory.",
          cible: "c1",
          canal: "autre",
          minutes: 60,
        },
        {
          texte:
            "Send three connection notes to leaders in the reuse sector.",
          cible: "c2",
          canal: "linkedin",
          minutes: 30,
        },
        {
          texte:
            "Write to a former haulier colleague to ask for an introduction.",
          cible: "c3",
          canal: "email",
          minutes: 20,
        },
      ],
    },
    {
      semaine: 3,
      titre: "Get out there and follow up",
      actions: [
        {
          texte:
            "Go to a logistics industry meetup and talk to two site directors.",
          cible: "c3",
          canal: "evenements",
          minutes: 180,
        },
        {
          texte:
            "Follow up on unanswered messages with a useful question.",
          cible: "toutes",
          canal: "linkedin",
          minutes: 30,
        },
        {
          texte: "Comment on two posts by leaders in the reuse sector.",
          cible: "c2",
          canal: "linkedin",
          minutes: 20,
        },
      ],
    },
    {
      semaine: 4,
      titre: "Apply and take stock",
      actions: [
        {
          texte:
            "Send an application focused on the second-site problem to the most promising boss.",
          cible: "c1",
          canal: "email",
          minutes: 90,
        },
        {
          texte:
            "Write to the site director about keeping team leaders after a takeover.",
          cible: "c3",
          canal: "email",
          minutes: 45,
        },
        {
          texte:
            "Write down what the conversations taught you and choose which boss to approach first.",
          cible: "toutes",
          canal: "autre",
          minutes: 30,
        },
      ],
    },
  ],
  testTerrain: {
    profils:
      "Three people working in reuse or logistics: an operations manager, the head of a reuse centre, a site director. Look for them on LinkedIn or through social and solidarity economy networks.",
    questions: [
      "The last time your warehouse overflowed, what did you do?",
      "Who was the last person you hired in operations, and how did you find them?",
      "What got stuck the last time your activity grew?",
      "How long did your last team reorganisation take?",
      "Who did you ask for advice the last time lead times slipped?",
    ],
    signauxPositifs: [
      "They tell you about a recent overflow in detail.",
      "They offer to introduce you to someone.",
    ],
    signauxNegatifs: [
      "They have no flow problems at the moment.",
      "They only hire through recruitment agencies, without meeting people first.",
    ],
  },
  hypotheses: [
    "Your target salary is easier to reach in the food industry than in reuse: worth checking during your advice calls.",
  ],
  motPourToi:
    "Your talent is rare wherever an activity grows too fast. Start by listening to people in the reuse trade before applying: that's where your enjoyment seems strongest.",
};
