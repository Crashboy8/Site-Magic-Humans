// Juego de prueba de la vía asalariado en español: traducción de exempleSalarie.ts, sin regeneración por la IA.
// Sirve para las pruebas y para comprobar la pantalla de resultado en español. Ningún nombre real de empresa ni de persona.
import type { EntreeMaCible, ResultatSalarie, TerrainSalarie } from "./types";

export const TERRAIN_SALARIE_EXEMPLE_ES: TerrainSalarie = {
  situation: "reconversion",
  posteActuel: "Responsable de logística en la industria alimentaria",
  experience: "10a20",
  secteursConnus: "industria alimentaria, comercio minorista, transporte",
  posteVise: "",
  contrats: ["cdi"],
  zone: "Lyon y 40 km a la redonda, 1 día de teletrabajo",
  salaireMin: 48_000,
  salaireMax: 58_000,
  tailles: ["pme", "asso_public"],
  manager: {
    mission: "una dirección clara y manos libres en el cómo",
    erreur: "me habla de ello con franqueza, sin buscar un culpable",
    decider: "cómo se organizan mi equipo y los horarios",
  },
  valeurs: ["autonomie", "transparence", "impact"],
  valeurAutre: "",
  plusJamais:
    "Las reuniones donde todo se decide sin quienes hacen el trabajo, y los jefes que revisan cada detalle.",
  reconversion: {
    metierVise: "responsable de operaciones en la economía circular",
    transferables:
      "He puesto en marcha 2 almacenes, sé formar a equipos poco cualificados, hablo igual de bien con conductores que con compradores",
    manque: "No conozco bien los circuitos de reciclaje ni el mundo asociativo",
  },
  patronsEnTete: [
    "Un centro de reutilización en crecimiento",
    "Almacenes del comercio minorista",
  ],
  adresse: "vous",
  style: "direct",
};

export const ENTREE_SALARIE_EXEMPLE_ES: EntreeMaCible = {
  v: 1,
  langue: "es",
  source: null,
  talent: {
    nom: "",
    mecanisme:
      "Devuelvo el orden a un flujo desbordado, empezando por las personas que lo hacen funcionar",
    contexte:
      "una actividad crece más deprisa que su organización y el equipo empieza a quemarse",
    benefice:
      "el flujo vuelve a ser fiable, el equipo respira y la dirección puede por fin decidir con cifras exactas",
    antiContexte:
      "las sedes centrales que deciden lejos de la línea de trabajo, y los cuadros de mando rellenados para nada",
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
  terrainSalarie: TERRAIN_SALARIE_EXEMPLE_ES,
};

const linkedin = (
  intitules: string[],
  secteurs: string[],
  tailles: string[],
) => ({
  pertinence: "forte" as const,
  motsCles: `(${intitules.map((i) => `"${i}"`).join(" OR ")}) AND (logística OR "cadena de suministro")`,
  intitules,
  secteurs,
  tailles,
  zone: "Lyon y alrededores",
  autres: [
    "Busca publicaciones sobre una nueva sede o un traslado de almacén",
  ],
  astuce:
    "Empieza por quienes deciden y han publicado sobre su crecimiento en los últimos meses: su problema ya está a la vista.",
});

const email = (accroche: string, preuve: string) =>
  `Hola, [Nombre]:\n\n${accroche}\n\n${preuve}\n\n¿Tendría 15 minutos para una llamada y contarme si esto le ocurre? Su punto de vista me ayudaría, aunque la respuesta sea no.\n\nSi no es buen momento, dígamelo sin problema.\n\nAtentamente,\n\n{{prenom}}`;

/** Respuesta en bruto del modelo para ENTREE_SALARIE_EXEMPLE_ES, antes de la validación y los controles. */
export const RESULTAT_SALARIE_EXEMPLE_ES: ResultatSalarie = {
  voie: "salarie",
  langue: "es",
  promesse:
    "Devuelvo el orden a flujos desbordados, sin romper al equipo que los hace funcionar.",
  regle: [
    "Pedidos que salen a tiempo, incluso cuando la actividad se duplica.",
    "Un equipo de primera línea que entiende el plan y se queda.",
    "Cifras exactas para decidir, sin cuadros de mando inútiles.",
  ],
  patrons: [
    {
      id: "c1",
      nom: "Director de operaciones de una empresa alimentaria que abre una segunda sede",
      portrait: {
        secteur: "Industria alimentaria",
        taille: "50 a 250 empleados",
        structure: "Pyme familiar",
        moment: "Fuerte crecimiento, apertura de una segunda sede",
      },
      douleur:
        "Los pedidos de las grandes superficies se duplican, los retrasos se acumulan y cada retraso viene con una penalización.",
      pourquoiToi:
        "Su empresa crece más deprisa que su organización y sus jefes de equipo se queman: justo ahí devuelves el orden, empezando por las personas que hacen funcionar el flujo.",
      ancrage:
        "15 años en la logística de la industria alimentaria y 2 almacenes puestos en marcha sin una sola entrega fallida.",
      management: {
        style:
          "Un directivo muy presente en el día a día y ocupado, que delega con gusto en quien da resultados.",
        colle:
          "Marca una dirección y te deja trabajar, como el jefe que describes.",
        frotte:
          "Bajo presión, puede querer seguirlo todo él mismo durante unas semanas.",
      },
      valeurs: {
        probables: ["Fiabilidad", "Cercanía con el terreno", "Espíritu de equipo"],
        colle: "Estar cerca de la línea de trabajo encaja con tu deseo de tener impacto.",
        frotte: "",
      },
      questionsEntretien: [
        "Cuénteme la última vez que alguien del equipo cometió un error. ¿Qué pasó después?",
        "¿Quién decidió cómo se organizaría la segunda sede y cómo participó el equipo?",
        "La última vez que un jefe de equipo cambió un horario sin usted, ¿cómo se enteró?",
      ],
      besoin: { urgence: 5, rarete: 4, paiement: 4, acces: 4 },
      envie: { management: 4, valeurs: 4, declencheur: 5, cadre: 4 },
      lieux: [
        {
          genre: "entreprises",
          type: "Empresas alimentarias de 50 a 250 empleados que acaban de abrir una segunda sede",
          pourquoi: "Su problema de flujo es nuevo y visible.",
          recherche: "industria alimentaria nueva sede Rhône",
        },
        {
          genre: "evenement",
          type: "Ferias de la industria alimentaria y del embalaje",
          pourquoi: "Los directivos están disponibles ahí y no andan desbordados.",
          recherche: "feria industria alimentaria Lyon",
        },
        {
          genre: "reseau",
          type: "Asociaciones regionales de la industria alimentaria",
          pourquoi:
            "Los directivos hablan ahí de sus dolores de crecimiento.",
          recherche:
            "asociación industria alimentaria Auvergne-Rhône-Alpes",
        },
      ],
      approches: [
        {
          genre: "recommandation",
          action:
            "Pide a un antiguo comprador del comercio minorista que conozca estas empresas que te presente.",
        },
        {
          genre: "conseil",
          action:
            "Ofrece 15 minutos de aportaciones sobre la organización de una segunda sede, sin mencionar un empleo.",
        },
        {
          genre: "spontanee",
          action:
            "Envía una candidatura centrada en el riesgo de retrasos en la segunda sede, con un plan en 3 pasos.",
        },
      ],
      linkedin: linkedin(
        [
          "Director de operaciones",
          "Director industrial",
          "Director de planta",
        ],
        ["Producción alimentaria"],
        ["De 51 a 200 empleados"],
      ),
      pitchs: {
        noteInvitation:
          "Hola, [Nombre]: he visto que abre una segunda sede. Con 15 años en la logística de la industria alimentaria, me encantaría seguir el proyecto.",
        messageLinkedin:
          "Gracias por aceptar, [Nombre]. Una segunda sede suele duplicar los pedidos que preparar con los mismos jefes de equipo. He puesto en marcha 2 almacenes sin una sola entrega fallida. ¿Tendría 15 minutos para contarme cómo está abordando esta etapa?",
        emailObjet: "Su segunda sede y sus plazos de entrega",
        emailCorps: email(
          "Abrir una segunda sede suele significar duplicar los pedidos con los mismos jefes de equipo y ver llegar los retrasos antes que los refuerzos.",
          "Durante 15 años dirigí los flujos de una planta alimentaria: 2 almacenes puestos en marcha, ninguna rotura de stock en las grandes superficies y un equipo que se quedó.",
        ),
        oral30s:
          "Devuelvo el orden a las cadenas logísticas desbordadas, sin romper al equipo. Durante 15 años dirigí los flujos de una planta alimentaria: 2 traslados de almacén, cero roturas de stock en los supermercados y un equipo que se quedó. Su segunda sede va a duplicar los pedidos que preparar, con los mismos jefes de equipo. En 15 minutos puedo mostrarle dónde es probable que se rompa y cómo evitarlo. ¿Le apetece un café la semana que viene?",
      },
      exemple:
        "Imagina a un director de operaciones que encuentra una nueva penalización por retraso cada lunes y se pasa las noches rehaciendo los horarios a mano.",
      depuisIdees: [],
    },
    {
      id: "c2",
      nom: "Directora general de una empresa de reutilización en plena expansión",
      portrait: {
        secteur: "Economía circular, reutilización y reparación",
        taille: "20 a 80 empleados",
        structure: "Empresa de la economía social y solidaria",
        moment: "Expansión tras una nueva financiación",
      },
      douleur:
        "Las recogidas se acumulan más deprisa de lo que el taller puede clasificar, el almacén está desbordado y el equipo de inserción laboral se quema.",
      pourquoiToi:
        "Una actividad que crece más deprisa que su organización, con un equipo al que hacer crecer: ahí se enciende tu talento y tu deseo de impacto encuentra sentido.",
      ancrage:
        "Sabes formar a equipos poco cualificados y poner en marcha un flujo sencillo en pocas semanas.",
      management: {
        style:
          "Una dirigente comprometida, a menudo fuera representando a la empresa, que busca una mano derecha en operaciones.",
        colle: "Da manos libres en el cómo a quien mantiene el rumbo.",
        frotte:
          "Las decisiones a veces pasan por un consejo, que es más lento de lo que te gustaría.",
      },
      valeurs: {
        probables: ["Sentido", "Transparencia", "Solidaridad"],
        colle: "El sentido y la transparencia coinciden con 2 de tus valores.",
        frotte: "Tu salario objetivo puede estar en la parte alta de su horquilla.",
      },
      questionsEntretien: [
        "La última vez que el almacén se desbordó, ¿quién decidió qué y con qué rapidez?",
        "Cuénteme un error reciente del equipo. ¿Qué pasó después?",
        "¿Qué pudo decidir sola la persona en este puesto el año pasado?",
      ],
      besoin: { urgence: 4, rarete: 5, paiement: 3, acces: 3 },
      envie: { management: 5, valeurs: 5, declencheur: 5, cadre: 3 },
      lieux: [
        {
          genre: "entreprises",
          type: "Centros de reutilización y empresas de reutilización de más de 20 empleados",
          pourquoi: "Las que crecen tienen todas un problema de flujo.",
          recherche: "ressourcerie réemploi Lyon",
        },
        {
          genre: "reseau",
          type: "Redes regionales de la economía social y solidaria",
          pourquoi: "Los dirigentes comparten ahí sus planes de crecimiento.",
          recherche: "réseau ESS Auvergne-Rhône-Alpes",
        },
        {
          genre: "evenement",
          type: "Encuentros profesionales de la economía circular",
          pourquoi: "Conocerás a los dirigentes que están en plena expansión.",
          recherche: "encuentro economía circular Lyon",
        },
      ],
      approches: [
        {
          genre: "conseil",
          action:
            "Pide 15 minutos de aportaciones sobre los puestos de logística en la reutilización, diciendo que cambias de profesión.",
        },
        {
          genre: "evenement",
          action:
            "Acude a un encuentro de economía circular y pregunta por sus flujos de recogida.",
        },
        {
          genre: "contenu",
          action:
            "Deja comentarios útiles en sus publicaciones sobre el crecimiento del taller y después escríbele.",
        },
      ],
      linkedin: linkedin(
        [
          "Directora general",
          "Director de operaciones",
          "Responsable de operaciones",
        ],
        ["Economía circular", "Economía social"],
        ["De 11 a 50 empleados", "De 51 a 200 empleados"],
      ),
      pitchs: {
        noteInvitation:
          "Hola, [Nombre]: su taller de reutilización crece rápido. Vengo de la logística y me incorporo a este sector, me encantaría seguir su trabajo.",
        messageLinkedin:
          "Gracias, [Nombre]. Dejo la logística de la industria alimentaria por la economía circular. He devuelto el orden a almacenes desbordados formando a equipos poco cualificados. ¿Tendría 15 minutos para contarme qué se atasca en sus flujos de recogida?",
        emailObjet: "Sus recogidas y su taller",
        emailCorps: email(
          "Cuando las recogidas llegan más deprisa de lo que el taller puede clasificar, el almacén se desborda y el equipo se quema, aunque todo el mundo hace lo posible.",
          "Durante 15 años devolví el orden a almacenes de la industria alimentaria formando a equipos poco cualificados. Ahora me incorporo a la reutilización.",
        ),
        oral30s:
          "Devuelvo el orden a los flujos desbordados, sin romper al equipo. En la industria alimentaria organicé la preparación de miles de pedidos por semana, con productos que no perdonan ningún retraso. Su empresa de reutilización crece más deprisa que su almacén: las recogidas se acumulan y el equipo se quema. Sé poner en marcha un circuito sencillo en pocas semanas. ¿Estaría abierta a una charla de 15 minutos para decirme si esto le ocurre?",
      },
      exemple:
        "Imagina a la responsable de un centro de reutilización que acaba de conseguir financiación para duplicar su actividad y que sigue clasificando ella misma las donaciones los sábados.",
      depuisIdees: ["i1"],
    },
    {
      id: "c3",
      nom: "Director de planta de una empresa logística regional recién adquirida",
      portrait: {
        secteur: "Logística y transporte",
        taille: "100 a 300 empleados",
        structure: "Filial de un grupo nacional",
        moment: "Adquisición reciente y reestructuración",
      },
      douleur:
        "Desde la compra, los procedimientos cambian cada mes, los jefes de equipo esperan respuestas y los mejores se marchan.",
      pourquoiToi:
        "Un flujo que hay que volver a poner en pie con un equipo preocupado: tu talento responde a su dolor, aunque la central lejana se parezca a lo que quieres evitar.",
      ancrage:
        "2 reestructuraciones vividas desde dentro, en las que el equipo construyó contigo los nuevos horarios.",
      management: {
        style:
          "Un director atrapado entre la central y la línea de trabajo, que busca a alguien sólido en quien apoyarse.",
        colle: "Necesita a alguien que decida sobre el terreno.",
        frotte:
          "La central impone indicadores, lo que recuerda los cuadros de mando que ya no quieres rellenar.",
      },
      valeurs: {
        probables: ["Rendimiento", "Rigor"],
        colle: "El rigor encaja con tu insistencia en las cifras exactas.",
        frotte:
          "No has dicho nada sobre el rendimiento: conviene comprobarlo en la entrevista.",
      },
      questionsEntretien: [
        "Desde la compra, ¿qué decisión ha podido tomar la planta sin la central?",
        "Cuénteme la última vez que un indicador estuvo en rojo. ¿Qué pasó después?",
        "¿Quién se ha ido del equipo en los últimos 6 meses y por qué cree que se fue?",
      ],
      besoin: { urgence: 4, rarete: 3, paiement: 5, acces: 4 },
      envie: { management: 3, valeurs: 3, declencheur: 3, cadre: 4 },
      lieux: [
        {
          genre: "entreprises",
          type: "Empresas logísticas regionales de 100 a 300 empleados compradas por un grupo",
          pourquoi: "Están pasando por una reestructuración.",
          recherche: "logística almacén Saint-Priest",
        },
        {
          genre: "evenement",
          type: "Ferias de logística y de cadena de suministro",
          pourquoi: "Los directores de planta acuden en busca de soluciones.",
          recherche: "feria logística Lyon",
        },
        {
          genre: "reseau",
          type: "Asociaciones profesionales de cadena de suministro",
          pourquoi: "Conocerás a directores de planta en activo.",
          recherche: "asociación cadena de suministro Lyon",
        },
      ],
      approches: [
        {
          genre: "recommandation",
          action:
            "Pide a un antiguo compañero transportista que trabaje con esta planta que te ponga en contacto.",
        },
        {
          genre: "spontanee",
          action:
            "Escribe al director de la planta sobre cómo conservar a los jefes de equipo tras una compra, con una idea concreta.",
        },
        {
          genre: "evenement",
          action:
            "Acude a una feria de logística y pregunta a directores de planta cómo llevan el cambio de propietario.",
        },
      ],
      linkedin: linkedin(
        [
          "Director de planta",
          "Responsable de operaciones",
          "Responsable de centro de distribución",
        ],
        ["Logística", "Transporte"],
        ["De 201 a 500 empleados"],
      ),
      pitchs: {
        noteInvitation:
          "Hola, [Nombre]: he visto que su planta ha sido adquirida. He vivido 2 reestructuraciones sobre el terreno, me gustaría conectar.",
        messageLinkedin:
          "Gracias, [Nombre]. Tras una compra, los jefes de equipo suelen esperar respuestas que el grupo aún no puede dar. He vivido 2 reestructuraciones en las que el equipo se quedó. ¿Tendría 15 minutos para contarme cómo va por su lado?",
        emailObjet: "Sus jefes de equipo tras la compra",
        emailCorps: email(
          "Tras una compra, los procedimientos cambian rápido, los jefes de equipo esperan respuestas y los mejores empiezan a mirar fuera.",
          "He vivido 2 reestructuraciones de almacén desde dentro. Cada vez, el equipo se quedó, porque construyó conmigo los nuevos horarios.",
        ),
        oral30s:
          "Devuelvo el orden a los almacenes desbordados, sin romper al equipo. He vivido 2 reestructuraciones desde dentro y cada vez el equipo se quedó, porque construyó conmigo los nuevos horarios. Tras una compra, sus jefes de equipo esperan respuestas que el grupo aún no puede dar. Puedo mantener ese rumbo en el día a día, sobre el terreno, mientras usted trata con la central. ¿Tendría 15 minutos para hablar de ello?",
      },
      exemple:
        "Imagina a un director de planta que recibe cada mes un nuevo procedimiento del grupo y ve marcharse a sus 2 mejores jefes de equipo.",
      depuisIdees: ["i2"],
    },
  ],
  managerIdeal: {
    portrait:
      "Marca una dirección clara y te deja elegir el camino. Baja a la línea de trabajo sin revisarlo todo. Cuando alguien comete un error, habla de ello con franqueza, sin buscar un culpable. Te deja decidir cómo se organizan el equipo y los horarios.",
    flow: "Un problema de flujo urgente, un equipo al que ganar para la causa y manos libres para actuar.",
    eteint:
      "Las reuniones donde todo se decide sin quienes hacen el trabajo, y un jefe que revisa cada detalle.",
  },
  antiPatron: {
    portrait:
      "Un jefe que decide lejos de la línea de trabajo y pide cuadros de mando que nadie lee.",
    signaux: [
      "En la entrevista, nadie de la línea de trabajo está presente ni se menciona.",
      "Hablan sobre todo de indicadores que rellenar y muy poco de problemas que resolver.",
      "La última persona en el puesto se fue a los pocos meses.",
    ],
  },
  reconversion: {
    transferables: [
      {
        competence: "Organizar un flujo",
        preuve: "Pusiste en marcha 2 almacenes sin una sola entrega fallida.",
      },
      {
        competence: "Formar a equipos poco cualificados",
        preuve: "Llevas años formando a preparadores de pedidos.",
      },
      {
        competence: "Hablar con personas de todos los niveles",
        preuve: "Dices que hablas igual de bien con conductores que con compradores.",
      },
    ],
    premiereMarche:
      "Responsable de logística en una empresa de reutilización de tamaño medio, para aprender los circuitos de reciclaje conservando tus competencias principales.",
    essais: [
      "Una misión corta de 2 semanas para reorganizar el almacén de un centro de reutilización.",
      "Unos días de prácticas en una empresa de reutilización, a través de un programa de observación en el puesto.",
      "Un curso corto sobre circuitos de reciclaje y reutilización.",
    ],
  },
  plan30: [
    {
      semaine: 1,
      titre: "Escuchar el oficio",
      actions: [
        {
          texte:
            "Encuentra a 3 personas que trabajen en la reutilización y pídeles 15 minutos de aportaciones.",
          cible: "c2",
          canal: "linkedin",
          minutes: 45,
        },
        {
          texte:
            "Prepara 5 preguntas sobre sus flujos y sus dolores de crecimiento.",
          cible: "toutes",
          canal: "autre",
          minutes: 30,
        },
        {
          texte:
            "Haz una primera llamada de consejo con un director de operaciones de la industria alimentaria.",
          cible: "c1",
          canal: "telephone",
          minutes: 30,
        },
      ],
    },
    {
      semaine: 2,
      titre: "Primeros mensajes",
      actions: [
        {
          texte:
            "Encuentra 5 empresas alimentarias que abran una nueva sede en el directorio francés de empresas.",
          cible: "c1",
          canal: "autre",
          minutes: 60,
        },
        {
          texte:
            "Envía 3 notas de invitación a dirigentes del sector de la reutilización.",
          cible: "c2",
          canal: "linkedin",
          minutes: 30,
        },
        {
          texte:
            "Escribe a un antiguo compañero transportista para pedirle que te presente.",
          cible: "c3",
          canal: "email",
          minutes: 20,
        },
      ],
    },
    {
      semaine: 3,
      titre: "Salir al terreno y hacer seguimiento",
      actions: [
        {
          texte:
            "Acude a un encuentro del sector logístico y habla con 2 directores de planta.",
          cible: "c3",
          canal: "evenements",
          minutes: 180,
        },
        {
          texte:
            "Haz un seguimiento de los mensajes sin respuesta con una pregunta útil.",
          cible: "toutes",
          canal: "linkedin",
          minutes: 30,
        },
        {
          texte: "Comenta 2 publicaciones de dirigentes del sector de la reutilización.",
          cible: "c2",
          canal: "linkedin",
          minutes: 20,
        },
      ],
    },
    {
      semaine: 4,
      titre: "Candidatarse y hacer balance",
      actions: [
        {
          texte:
            "Envía una candidatura centrada en el problema de la segunda sede al jefe más prometedor.",
          cible: "c1",
          canal: "email",
          minutes: 90,
        },
        {
          texte:
            "Escribe al director de la planta sobre cómo conservar a los jefes de equipo tras una compra.",
          cible: "c3",
          canal: "email",
          minutes: 45,
        },
        {
          texte:
            "Anota lo que te han enseñado las conversaciones y elige a qué jefe acercarte primero.",
          cible: "toutes",
          canal: "autre",
          minutes: 30,
        },
      ],
    },
  ],
  testTerrain: {
    profils:
      "3 personas que trabajan en la reutilización o la logística: un responsable de operaciones, la responsable de un centro de reutilización, un director de planta. Búscalas en LinkedIn o a través de redes de la economía social y solidaria.",
    questions: [
      "La última vez que su almacén se desbordó, ¿qué hizo?",
      "¿Quién fue la última persona que contrató en operaciones y cómo la encontró?",
      "¿Qué se atascó la última vez que creció su actividad?",
      "¿Cuánto duró su última reorganización de equipo?",
      "¿A quién pidió consejo la última vez que se retrasaron los plazos?",
    ],
    signauxPositifs: [
      "Te cuentan con detalle un desbordamiento reciente.",
      "Se ofrecen a presentarte a alguien.",
    ],
    signauxNegatifs: [
      "No tienen problemas de flujo en este momento.",
      "Solo contratan a través de agencias de selección, sin conocer antes a las personas.",
    ],
  },
  hypotheses: [
    "Tu salario objetivo es más fácil de alcanzar en la industria alimentaria que en la reutilización: conviene comprobarlo durante tus llamadas de consejo.",
  ],
  motPourToi:
    "Tu talento es poco común allí donde una actividad crece demasiado deprisa. Empieza escuchando a gente del oficio de la reutilización antes de candidatarte: ahí parece estar tu mayor disfrute.",
};
