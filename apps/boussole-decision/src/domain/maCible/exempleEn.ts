// Exemple de référence en anglais : traduction de exemple.ts (même structure, mêmes notes), sans régénération par l'IA.
// Sert aux tests et à vérifier l'écran de résultat en anglais.
import type { EntreeMaCible, Resultat } from "./types";

export const ENTREE_EXEMPLE_EN: EntreeMaCible = {
  "v": 1, "langue": "en", "source": "quiz",
  "talent": {
    "nom": "My Unique Talent: Bold Mediator",
    "mecanisme": "untangles stuck human situations by asking the questions nobody else dares to ask",
    "contexte": "a team is under strain and needs to start talking again",
    "benefice": "helping teams get their trust and drive back, and unblock their decisions",
    "antiContexte": "very hierarchical organisations where everything has to be signed off 3 times; assignments with no human contact",
    "reussite": "The day I brought 2 team leaders back together after they hadn't spoken for 6 months.",
    "sousTalents": ["Listening", "Mediation", "Humour"], "pistes": [], "aDeleguer": ["Reporting", "Spreadsheets"]
  },
  "terrain": {
    "offre": "I run team-building workshops, and I'd like to coach business leaders one to one.",
    "marche": "les_deux",
    "experience": "15 years in HR in the food industry, I know a lot of site managers in Brittany.",
    "clientsPasses": "A plant manager thanked me for defusing a conflict between 2 team leaders.",
    "formats": ["groupe", "presentiel", "individuel"],
    "zone": "Rennes and Brittany, remotely for the rest of France",
    "prixActuel": "€600 per half-day workshop",
    "adresse": "vous", "style": "chaleureux",
    "ciblesEnTete": []
  },
  "reponses": [],
  "synthese": null
};

export const RESULTAT_EXEMPLE_EN: Resultat = {
  "langue": "en",
  "offre": {
    "phrase": "I get teams who've stopped talking back around the table, so they rebuild trust and unblock their decisions within a few weeks.",
    "avant": "Meetings go round in circles, 2 camps form, decisions drag on and the best people start looking elsewhere.",
    "apres": "Tensions are named and dealt with, everyone knows what they expect from the others, and the team gets back to the work that matters."
  },
  "cibles": [
    {
      "id": "c1",
      "nom": "Food industry site managers in Brittany",
      "marche": "b2b",
      "portrait": "Plant manager at a food production site with 80 to 400 staff, in Brittany. The trigger comes after a restructuring or a new team leader arriving: 2 production teams stop talking, quality drops and sick leave goes up.",
      "douleur": "\"I've got 2 team leaders passing the buck, production is suffering and I have neither the time nor the words to sort it out myself.\"",
      "ancrage": "Your Trigger Context, a team under strain that needs to start talking again, is exactly their situation, and your 15 years in food industry HR mean you speak their language.",
      "promesse": "In 6 weeks, your production teams are talking again and site decisions get unblocked.",
      "offre": {
        "nom": "Back around the table",
        "format": "An on-site diagnosis, then 3 workshops of 3 hours with the team leaders",
        "duree": "6 weeks",
        "contenu": ["One-to-one interviews with 5 to 8 key people", "Workshop 1: saying what's blocking, without putting anyone on trial", "Workshop 2: ground rules agreed together", "Workshop 3: first decisions made together", "Follow-up with management 1 month later"]
      },
      "prix": { "min": 3500, "max": 6000, "unite": "flat fee per site", "base": "HT", "justification": "Your current rate (€600 per half-day) sits at the low end of the market. A package with a diagnosis and follow-up is worth more than a string of workshops, because it tackles lost production that costs far more." },
      "pitch": "When 2 teams stop talking, production feels it before management does. I spent 15 years in food industry HR: I know how to get teams to say what they keep quiet, without putting anyone on trial, and help them decide together. In 6 weeks, we get everyone back around the table.",
      "pourquoi": "This is the target where everything lines up: a problem that quickly gets expensive, a training or services budget that already exists, a sector you know from the inside and a network that's already there.",
      "exemple": "Imagine a site manager who has just merged 2 production lines. The 2 team leaders contradict each other in front of the operators. She calls you after a month of tension, because a former colleague mentioned you.",
      "scores": {
        "urgence": { "note": 4, "raison": "The conflict is already costing quality and absences, but it can drag on for a few months." },
        "paiement": { "note": 4, "raison": "Sites have budgets for training and HR services." },
        "acces": { "note": 5, "raison": "Your network of site managers in Brittany means you can reach them directly." },
        "plaisir": { "note": 5, "raison": "A team under strain that needs to start talking again is your Trigger Context." }
      },
      "lieux": [
        { "type": "Meetings of the regional food industry associations", "pourquoi": "Site managers swap notes there on their workforce problems.", "recherche": "food industry association Brittany" },
        { "type": "HR clubs and industry leaders' clubs in your region", "pourquoi": "You'll meet the HR directors and managers who buy this kind of work.", "recherche": "HR club industry Rennes" },
        { "type": "Food industry trade shows in western France", "pourquoi": "Site managers attend, and your former job gives you a natural way in.", "recherche": "food industry trade show Brittany" }
      ],
      "canaux": [
        { "canal": "bouche_a_oreille", "priorite": 1, "action": "Call 5 former HR colleagues to tell them what you do now and ask who's dealing with this kind of tension.", "pourquoi": "Your network is your best way in, and the trust is already there." },
        { "canal": "linkedin", "priorite": 2, "action": "Post a real (anonymised) story of a team conflict in production every week, and what unblocked it.", "pourquoi": "Site managers read LinkedIn and will recognise themselves in concrete cases." },
        { "canal": "evenements", "priorite": 3, "action": "Go to one regional trade association meeting a month.", "pourquoi": "Meeting face to face builds the trust you need for such a sensitive subject." }
      ],
      "linkedin": {
        "pertinence": "forte",
        "motsCles": "(\"site manager\" OR \"plant manager\" OR \"site director\" OR \"directeur de site\") AND (food OR agroalimentaire)",
        "intitules": ["Site Manager", "Plant Manager", "Production Manager", "Site HR Manager"],
        "secteurs": ["Food Production", "Beverage Manufacturing"],
        "tailles": ["51 to 200 employees", "201 to 500 employees"],
        "zone": "Brittany",
        "autres": ["2nd-degree connections first (your mutual contacts)", "Words to look for in posts: restructuring, hiring team leaders"],
        "astuce": "Start with your 2nd-degree connections: a mutual contact beats any opening line."
      },
      "messages": {
        "linkedin": "Hello [First name], I spent 15 years in food industry HR in Brittany and I now work with sites where teams struggle to talk to each other. How is that going on your site at the moment?",
        "emailObjet": "Are your production teams still talking to each other?",
        "emailCorps": "Hello [First name],\n\nWhen 2 production teams keep passing the buck, management often finds out through the numbers: quality, absences, people leaving.\n\nAfter 15 years in food industry HR, I help sites get their teams back around the table, to say what's blocking and decide together.\n\nWould you be open to a 15-minute call to tell me whether this comes up on your site? Your view would help me, even if the answer is no.\n\nKind regards,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "3 site managers from your network, reached by phone or through a former colleague you both know, for a coffee or a 20-minute call.",
        "questions": ["What was the last tension between teams that really took up your time?", "How did you actually handle it?", "How long did it last, and what did it cost the site?", "Have you ever brought in someone from outside for this kind of situation?", "What would have helped you at the time?"],
        "signauxPositifs": ["They tell you about a recent situation without you having to push", "They've already paid someone to help with something similar"],
        "signauxNegatifs": ["They say it's the manager's job and it sorts itself out", "No budget and no decision possible at site level"]
      },
      "depuisIdees": [],
      "verbatims": []
    },
    {
      "id": "c2",
      "nom": "Leaders of fast-growing small firms with a tense leadership team",
      "marche": "b2b",
      "portrait": "Founder of a business with 20 to 80 staff that has grown fast. The leadership team has expanded, old hands and newcomers no longer understand each other, and every meeting ends in a stalemate.",
      "douleur": "\"We've doubled in 3 years, but my leadership team can't decide anything any more, and I spend my evenings settling disputes.\"",
      "ancrage": "You ask the questions nobody else dares to ask: that's exactly what's missing in a team where everyone guards their own turf.",
      "promesse": "A leadership team that speaks openly and makes decisions again, in 1 day plus follow-up.",
      "offre": {
        "nom": "Leadership team unblocking day",
        "format": "A 1-day away day with the leadership team, then 2 remote follow-up sessions",
        "duree": "1 day and 2 months of follow-up",
        "contenu": ["Preparation interview with the founder", "1-day away day: what's blocking, what we decide", "A decision-making charter written together", "2 follow-up sessions of 1 hour"]
      },
      "prix": { "min": 2500, "max": 4500, "unite": "per leadership team", "base": "HT", "justification": "A facilitated leadership away day falls within this range; the follow-up justifies the top end." },
      "pitch": "When a company grows fast, its leadership team often starts going round in circles. I get people around the table to say what they've been keeping to themselves, then we agree new ground rules together. In 1 day, your leadership team starts deciding again.",
      "pourquoi": "The problem is common and painful for a founder, and the group format brings your talent to life. Access is less direct than with industrial sites.",
      "exemple": "Imagine the founder of a services firm who hired 3 directors last year. The original partners feel sidelined, the newcomers can't find their place. He's looking for a neutral outsider to get everyone back on the same page.",
      "scores": {
        "urgence": { "note": 4, "raison": "The founder makes every call alone and is wearing himself out." },
        "paiement": { "note": 4, "raison": "Growing small firms are happy to pay for a leadership away day." },
        "acces": { "note": 3, "raison": "Reachable through business leader networks, but you don't have direct contacts there yet." },
        "plaisir": { "note": 4, "raison": "A group under strain that needs to start talking again, with real decisions at stake." }
      },
      "lieux": [
        { "type": "Business leader networks and clubs in your city", "pourquoi": "Founders talk openly there about their management struggles.", "recherche": "business leaders club Rennes" },
        { "type": "Business breakfasts run by entrepreneur networks", "pourquoi": "A short format where you can present a real case.", "recherche": "entrepreneurs breakfast Rennes" }
      ],
      "canaux": [
        { "canal": "evenements", "priorite": 1, "action": "Join a business leaders' network and offer a 30-minute workshop on leadership teams that have stopped deciding.", "pourquoi": "Showing your talent live convinces faster than any pitch." },
        { "canal": "linkedin", "priorite": 2, "action": "Write to 5 founders a week whose company is hiring directors.", "pourquoi": "Hiring senior managers is the visible sign of the growth that creates the tension." }
      ],
      "linkedin": {
        "pertinence": "forte",
        "motsCles": "(founder OR \"co-founder\" OR CEO OR \"managing director\") AND (SME OR PME)",
        "intitules": ["Founder", "CEO", "Managing Director"],
        "secteurs": ["Business Services", "Manufacturing", "Technology"],
        "tailles": ["11 to 50 employees", "51 to 200 employees"],
        "zone": "Brittany and Pays de la Loire",
        "autres": ["Companies advertising senior leadership roles"],
        "astuce": "Look for companies hiring directors: it's the best sign of tension to come."
      },
      "messages": {
        "linkedin": "Hello [First name], I saw your company is hiring new directors, congratulations on the growth. I work with leadership teams that are expanding fast. How are group decisions going for you at the moment?",
        "emailObjet": "Is your leadership team still deciding quickly?",
        "emailCorps": "Hello [First name],\n\nWhen a company grows fast, the leadership team gets bigger and decisions slow down: everyone protects their patch and the founder ends up making the call alone.\n\nI help leadership teams speak openly and start deciding together again, in 1 day plus a short follow-up.\n\nWould you be up for a 15-minute call? I'd like to know whether this rings a bell for you.\n\nKind regards,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "3 founders of growing small firms, met through an entrepreneur network or a recommendation.",
        "questions": ["How did the last big decision made as a leadership team go?", "What has changed since the leadership team got bigger?", "Who has the final say when you disagree?", "Have you ever organised a leadership away day, and what did you get out of it?", "What would save you the most time when making these calls?"],
        "signauxPositifs": ["They describe making calls alone and being worn out by it", "They've already set aside budget for an away day"],
        "signauxNegatifs": ["The founder thinks everything's fine and the problem lies with the others", "The company is in financial difficulty"]
      },
      "depuisIdees": [],
      "verbatims": []
    },
    {
      "id": "c3",
      "nom": "Newly promoted managers dealing with a conflict in their team",
      "marche": "b2c",
      "portrait": "A manager promoted less than a year ago who has inherited a divided team. They don't dare raise it with their own boss and are looking for discreet support, paid for out of their own pocket.",
      "douleur": "\"I've just been promoted, my team is tearing itself apart and I'm scared people will think I'm not up to the job.\"",
      "ancrage": "The way you ask the questions that unblock things helps a manager prepare the difficult conversations they keep putting off.",
      "promesse": "In 1 month, you'll know how to handle difficult conversations with your team, without losing sleep over them.",
      "offre": {
        "nom": "First conflict programme",
        "format": "4 one-to-one video sessions of 1 hour",
        "duree": "1 month",
        "contenu": ["Reading the situation and what everyone needs", "Preparing the conversation you're dreading", "Practising through role play", "Taking stock after the conversation"]
      },
      "prix": { "min": 90, "max": 150, "unite": "per session", "base": "TTC", "justification": "Someone paying on their own compares with one-to-one coaching; a 4-session programme stays affordable." },
      "pitch": "Just stepped into a manager role and your team is splitting apart? It happens a lot, and it can be worked on. In 4 sessions, we prepare the conversations you've been putting off, and you leave with words that work.",
      "pourquoi": "It opens up the B2C market and gives you real stories to tell, but budgets are tighter and one-to-one work suits you less than groups.",
      "exemple": "Imagine a department supervisor promoted to store manager, with 2 sales assistants who can't stand each other. He looks for help on a Sunday evening, after a tough week.",
      "scores": {
        "urgence": { "note": 3, "raison": "The situation weighs on them, but the manager can let it drag on." },
        "paiement": { "note": 2, "raison": "They pay out of their own pocket and compare prices." },
        "acces": { "note": 3, "raison": "Reachable through online content, with no direct network." },
        "plaisir": { "note": 3, "raison": "You love unblocking things, but one to one and remotely, your talent lights up less than in a group." }
      },
      "lieux": [
        { "type": "Online communities for new managers", "pourquoi": "They ask their day-to-day questions there.", "recherche": "new managers community" },
        { "type": "Public workshops and talks on management", "pourquoi": "Managers who sign up are already looking for help.", "recherche": "management talk Rennes" }
      ],
      "canaux": [
        { "canal": "contenu", "priorite": 1, "action": "Write a short guide, \"5 questions to defuse a team conflict\", to share.", "pourquoi": "Managers search online before they dare to ask for help." },
        { "canal": "linkedin", "priorite": 2, "action": "Comment every week on posts from managers announcing a promotion.", "pourquoi": "An announced promotion is the visible trigger moment." }
      ],
      "linkedin": {
        "pertinence": "moyenne",
        "motsCles": "(\"new role\" OR \"promoted\" OR \"new position\") AND (manager OR \"team lead\")",
        "intitules": ["Manager", "Team Leader", "Head of Department"],
        "secteurs": [],
        "tailles": [],
        "zone": "France",
        "autres": ["Posts announcing a new role"],
        "astuce": "Newly promoted managers often announce their new role: congratulate them first, without selling anything."
      },
      "messages": {
        "linkedin": "Hello [First name], congratulations on your new role! I work with managers as they step into their roles. What's the team issue taking up most of your time right now?",
        "emailObjet": "Your first team conflict",
        "emailCorps": "Hello [First name],\n\nTaking on a manager role often means inheriting a team with its old tensions. It isn't always easy to raise with your own boss.\n\nI help new managers prepare difficult conversations, in 4 short sessions, so they leave with words that work.\n\nIf you'd like, we could talk for 15 minutes, just to see whether it would help you.\n\nKind regards,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "3 managers promoted less than a year ago, found among your former colleagues or their contacts.",
        "questions": ["What's the last difficult conversation you put off?", "What held you back from having it?", "Who did you talk to about it?", "Have you ever paid for training or coaching out of your own pocket?", "What would have helped you that day?"],
        "signauxPositifs": ["They've already looked for help online", "They've already paid for training themselves"],
        "signauxNegatifs": ["They expect their company to pay for everything", "They don't see a problem"]
      },
      "depuisIdees": [],
      "verbatims": []
    }
  ],
  "autresPistes": [],
  "antiCible": {
    "portrait": "Large, very hierarchical groups that buy a team-building workshop through procurement, as a box to tick, without management getting involved.",
    "signaux": ["First contact comes through a buyer and a tender", "Management won't take part", "You're asked for a fixed programme signed off at 3 levels", "The budget is negotiated before the problem has even been described"],
    "lienAntiContexte": "Your Anti-Context is organisations where everything has to be signed off 3 times: here, your talent would never have room to ask the real questions.",
    "commentDire": "Thank you for thinking of me. My work succeeds when management is involved from the start. If that isn't possible, I'd rather point you towards a training provider who can offer a standard format."
  },
  "plan30": [
    { "semaine": 1, "titre": "Listen to the field", "actions": [
      { "texte": "List 10 site managers in your network and pick 3 to call.", "cible": "c1", "canal": "bouche_a_oreille", "minutes": 30 },
      { "texte": "Hold 3 field test calls using the 5 questions, without presenting your offer.", "cible": "c1", "canal": "telephone", "minutes": 90 },
      { "texte": "Write down the exact words they use to describe their tensions.", "cible": "c1", "canal": "autre", "minutes": 20 }
    ] },
    { "semaine": 2, "titre": "First messages", "actions": [
      { "texte": "Send the LinkedIn message to 10 site managers, 2nd-degree connections first.", "cible": "c1", "canal": "linkedin", "minutes": 45 },
      { "texte": "Send the email to 5 small business founders who are hiring directors.", "cible": "c2", "canal": "email", "minutes": 45 },
      { "texte": "Update your LinkedIn headline with your promise.", "cible": "toutes", "canal": "linkedin", "minutes": 20 }
    ] },
    { "semaine": 3, "titre": "Get yourself seen", "actions": [
      { "texte": "Post an anonymised story of a newly promoted manager who tackled a difficult conversation.", "cible": "c3", "canal": "linkedin", "minutes": 60 },
      { "texte": "Sign up for a business leaders' network or trade association meeting.", "cible": "c2", "canal": "evenements", "minutes": 30 },
      { "texte": "Follow up in one sentence with the people you contacted in week 2.", "cible": "toutes", "canal": "linkedin", "minutes": 30 }
    ] },
    { "semaine": 4, "titre": "Make an offer and take stock", "actions": [
      { "texte": "Offer the on-site diagnosis to the most interested person from your field test.", "cible": "c1", "canal": "telephone", "minutes": 45 },
      { "texte": "Write up the 4-session programme for a manager, with the price.", "cible": "c3", "canal": "autre", "minutes": 90 },
      { "texte": "Take stock: which target responded most, and what needs to change?", "cible": "toutes", "canal": "autre", "minutes": 30 }
    ] }
  ],
  "hypotheses": ["I assumed you can travel to sites all over Brittany."],
  "motPourToi": "You already have what a lot of people lack: a sector you know and people who've thanked you. Start with them, this week."
};
