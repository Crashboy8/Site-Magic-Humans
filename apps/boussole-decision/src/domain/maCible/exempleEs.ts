// Ejemplo de referencia en español: traducción de exemple.ts (misma estructura, mismas notas), sin regeneración por la IA.
// Sirve para las pruebas y para comprobar la pantalla de resultado en español.
import type { EntreeMaCible, Resultat } from "./types";

export const ENTREE_EXEMPLE_ES: EntreeMaCible = {
  "v": 1, "langue": "es", "source": "quiz",
  "talent": {
    "nom": "Mi Talento Único: Mediador Atrevido",
    "mecanisme": "desenredo situaciones humanas bloqueadas haciendo las preguntas que nadie se atreve a hacer",
    "contexte": "un equipo está en tensión y necesita volver a hablarse",
    "benefice": "los equipos recuperan la confianza y el impulso, y sus decisiones se desbloquean",
    "antiContexte": "las organizaciones muy jerárquicas donde todo debe validarse tres veces; las misiones sin contacto humano",
    "reussite": "El día en que reconcilié a dos jefes de equipo que llevaban seis meses sin hablarse.",
    "sousTalents": ["Escucha", "Mediación", "Humor"], "pistes": [], "aDeleguer": ["Informes", "Hojas de cálculo"]
  },
  "terrain": {
    "offre": "Dirijo talleres de cohesión de equipo y me gustaría acompañar a directivos de forma individual.",
    "marche": "les_deux",
    "experience": "15 años en RR. HH. en la industria alimentaria, conozco a muchos directores de planta en Bretaña.",
    "clientsPasses": "Un director de fábrica me agradeció haber desactivado un conflicto entre dos jefes de equipo.",
    "formats": ["groupe", "presentiel", "individuel"],
    "zone": "Rennes y Bretaña, a distancia para el resto de Francia",
    "prixActuel": "600 € la media jornada de taller",
    "adresse": "vous", "style": "chaleureux",
    "ciblesEnTete": []
  },
  "reponses": [],
  "synthese": null
};

export const RESULTAT_EXEMPLE_ES: Resultat = {
  "langue": "es",
  "offre": {
    "phrase": "Hago que los equipos que han dejado de hablarse vuelvan a sentarse a la misma mesa, para que recuperen la confianza y desbloqueen sus decisiones en pocas semanas.",
    "avant": "Las reuniones dan vueltas en círculo, se forman dos bandos, las decisiones se alargan y las mejores personas empiezan a mirar fuera.",
    "apres": "Las tensiones se nombran y se resuelven, cada uno sabe lo que espera de los demás y el equipo vuelve al trabajo que importa."
  },
  "cibles": [
    {
      "id": "c1",
      "nom": "Directores de planta de la industria alimentaria en Bretaña",
      "marche": "b2b",
      "portrait": "Director de una planta de producción alimentaria con entre 80 y 400 empleados, en Bretaña. El detonante llega tras una reestructuración o la llegada de un nuevo jefe de equipo: dos equipos de producción dejan de hablarse, la calidad baja y las bajas por enfermedad suben.",
      "douleur": "\"Tengo a dos jefes de equipo que se pasan la pelota, la producción se resiente y no tengo ni el tiempo ni las palabras para arreglarlo yo solo.\"",
      "ancrage": "Tu Contexto Desencadenante, un equipo en tensión que necesita volver a hablarse, es exactamente su situación, y tus 15 años en RR. HH. de la industria alimentaria hacen que hables su idioma.",
      "promesse": "En 6 semanas, tus equipos de producción vuelven a hablarse y las decisiones de la planta se desbloquean.",
      "offre": {
        "nom": "De nuevo en la misma mesa",
        "format": "Un diagnóstico en la planta y después 3 talleres de 3 horas con los jefes de equipo",
        "duree": "6 semanas",
        "contenu": ["Entrevistas individuales con 5 a 8 personas clave", "Taller 1: decir lo que bloquea, sin poner a nadie en el banquillo", "Taller 2: reglas del juego pactadas entre todos", "Taller 3: primeras decisiones tomadas en común", "Seguimiento con la dirección un mes después"]
      },
      "prix": { "min": 3500, "max": 6000, "unite": "importe cerrado por planta", "base": "HT", "justification": "Tu tarifa actual (600 € la media jornada) está en la parte baja del mercado. Un paquete con diagnóstico y seguimiento vale más que una serie de talleres, porque ataca una pérdida de producción que cuesta mucho más." },
      "pitch": "Cuando dos equipos dejan de hablarse, la producción lo nota antes que la dirección. Pasé 15 años en RR. HH. de la industria alimentaria: sé cómo hacer que los equipos digan lo que callan, sin poner a nadie en el banquillo, y ayudarles a decidir juntos. En 6 semanas, volvemos a sentar a todos a la misma mesa.",
      "pourquoi": "Es el objetivo donde todo encaja: un problema que se vuelve caro rápidamente, un presupuesto de formación o de servicios que ya existe, un sector que conoces por dentro y una red que ya está ahí.",
      "exemple": "Imagina a una directora de planta que acaba de fusionar dos líneas de producción. Los dos jefes de equipo se contradicen delante de los operarios. Te llama después de un mes de tensión, porque un antiguo compañero le habló de ti.",
      "scores": {
        "urgence": { "note": 4, "raison": "El conflicto ya cuesta calidad y ausencias, pero puede alargarse unos meses." },
        "paiement": { "note": 4, "raison": "Las plantas tienen presupuestos de formación y de servicios de RR. HH." },
        "acces": { "note": 5, "raison": "Tu red de directores de planta en Bretaña te permite llegar a ellos directamente." },
        "plaisir": { "note": 5, "raison": "Un equipo en tensión que necesita volver a hablarse es tu Contexto Desencadenante." }
      },
      "lieux": [
        { "type": "Reuniones de las asociaciones regionales de la industria alimentaria", "pourquoi": "Los directores de planta intercambian ahí sus problemas de plantilla.", "recherche": "asociación industria alimentaria Bretaña" },
        { "type": "Clubes de RR. HH. y clubes de directivos industriales de tu región", "pourquoi": "Conocerás a los directores de RR. HH. y a los responsables que compran este tipo de trabajo.", "recherche": "club RR. HH. industria Rennes" },
        { "type": "Ferias de la industria alimentaria en el oeste de Francia", "pourquoi": "Los directores de planta acuden, y tu antiguo oficio te da una entrada natural.", "recherche": "feria industria alimentaria Bretaña" }
      ],
      "canaux": [
        { "canal": "bouche_a_oreille", "priorite": 1, "action": "Llama a 5 antiguos compañeros de RR. HH. para contarles a qué te dedicas ahora y preguntarles quién tiene este tipo de tensiones.", "pourquoi": "Tu red es tu mejor puerta de entrada, y la confianza ya existe." },
        { "canal": "linkedin", "priorite": 2, "action": "Publica cada semana una historia real (anonimizada) de un conflicto de equipo en producción y de lo que lo desbloqueó.", "pourquoi": "Los directores de planta leen LinkedIn y se reconocerán en casos concretos." },
        { "canal": "evenements", "priorite": 3, "action": "Acude a una reunión de asociación profesional regional al mes.", "pourquoi": "Verse cara a cara crea la confianza que hace falta para un tema tan delicado." }
      ],
      "linkedin": {
        "pertinence": "forte",
        "motsCles": "(\"director de planta\" OR \"director de fábrica\" OR \"plant manager\" OR \"directeur de site\") AND (alimentaria OR agroalimentaire)",
        "intitules": ["Director de planta", "Director de fábrica", "Director de producción", "Responsable de RR. HH. de planta"],
        "secteurs": ["Producción alimentaria", "Fabricación de bebidas"],
        "tailles": ["De 51 a 200 empleados", "De 201 a 500 empleados"],
        "zone": "Bretaña",
        "autres": ["Contactos de segundo grado primero (vuestros conocidos en común)", "Palabras que buscar en las publicaciones: reestructuración, contratación de jefes de equipo"],
        "astuce": "Empieza por tus contactos de segundo grado: un conocido en común vale más que cualquier frase de entrada."
      },
      "messages": {
        "linkedin": "Hola, [Nombre]: pasé 15 años en RR. HH. de la industria alimentaria en Bretaña y ahora trabajo con plantas donde los equipos tienen dificultades para hablarse. ¿Cómo va eso en su planta en este momento?",
        "emailObjet": "¿Siguen hablándose sus equipos de producción?",
        "emailCorps": "Hola, [Nombre]:\n\nCuando dos equipos de producción se pasan la pelota, la dirección suele enterarse por las cifras: calidad, ausencias, salidas.\n\nTras 15 años en RR. HH. de la industria alimentaria, ayudo a las plantas a sentar de nuevo a sus equipos a la misma mesa, para decir lo que bloquea y decidir juntos.\n\n¿Tendría 15 minutos para una llamada y contarme si esto ocurre en su planta? Su punto de vista me ayudaría, aunque la respuesta sea no.\n\nAtentamente,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "3 directores de planta de tu red, contactados por teléfono o a través de un antiguo compañero que conozcáis los dos, para un café o una llamada de 20 minutos.",
        "questions": ["¿Cuál fue la última tensión entre equipos que realmente le llevó tiempo?", "¿Cómo la gestionó, en concreto?", "¿Cuánto duró y qué le costó a la planta?", "¿Ha recurrido alguna vez a alguien de fuera para una situación así?", "¿Qué le habría ayudado en aquel momento?"],
        "signauxPositifs": ["Te cuentan una situación reciente sin que tengas que insistir", "Ya han pagado a alguien para ayudarles con algo parecido"],
        "signauxNegatifs": ["Dicen que es trabajo del jefe y que se arregla solo", "Sin presupuesto y sin decisión posible a nivel de planta"]
      },
      "depuisIdees": [],
      "verbatims": []
    },
    {
      "id": "c2",
      "nom": "Directivos de pequeñas empresas en rápido crecimiento con un comité de dirección en tensión",
      "marche": "b2b",
      "portrait": "Fundador de una empresa de 20 a 80 empleados que ha crecido rápido. El comité de dirección se ha ampliado, los veteranos y los recién llegados ya no se entienden y cada reunión termina en un punto muerto.",
      "douleur": "\"Hemos duplicado el tamaño en tres años, pero mi comité de dirección ya no es capaz de decidir nada y yo me paso las noches zanjando disputas.\"",
      "ancrage": "Haces las preguntas que nadie se atreve a hacer: es justo lo que falta en un equipo donde cada uno defiende su terreno.",
      "promesse": "Un comité de dirección que habla con franqueza y vuelve a tomar decisiones, en 1 día más seguimiento.",
      "offre": {
        "nom": "Jornada de desbloqueo del comité de dirección",
        "format": "Una jornada de 1 día fuera de la oficina con el comité de dirección y después 2 sesiones de seguimiento a distancia",
        "duree": "1 día y 2 meses de seguimiento",
        "contenu": ["Entrevista de preparación con el fundador", "Jornada de 1 día: lo que bloquea, lo que decidimos", "Una carta de toma de decisiones redactada en común", "2 sesiones de seguimiento de 1 hora"]
      },
      "prix": { "min": 2500, "max": 4500, "unite": "por comité de dirección", "base": "HT", "justification": "Una jornada de dirección facilitada entra en esta horquilla; el seguimiento justifica la parte alta." },
      "pitch": "Cuando una empresa crece rápido, su comité de dirección suele empezar a dar vueltas en círculo. Reúno a las personas alrededor de la mesa para que digan lo que se han estado callando, y después pactamos juntos nuevas reglas del juego. En 1 día, su comité de dirección vuelve a decidir.",
      "pourquoi": "El problema es frecuente y doloroso para un fundador, y el formato de grupo hace brillar tu talento. El acceso es menos directo que con las plantas industriales.",
      "exemple": "Imagina al fundador de una empresa de servicios que contrató a tres directores el año pasado. Los socios originales se sienten apartados, los recién llegados no encuentran su sitio. Busca a alguien neutral de fuera para volver a poner a todos en la misma página.",
      "scores": {
        "urgence": { "note": 4, "raison": "El fundador toma todas las decisiones solo y se está agotando." },
        "paiement": { "note": 4, "raison": "Las pequeñas empresas en crecimiento pagan con gusto una jornada de dirección." },
        "acces": { "note": 3, "raison": "Se llega a ellos a través de redes de empresarios, pero aún no tienes contactos directos ahí." },
        "plaisir": { "note": 4, "raison": "Un grupo en tensión que necesita volver a hablarse, con decisiones reales en juego." }
      },
      "lieux": [
        { "type": "Redes y clubes de empresarios de tu ciudad", "pourquoi": "Los fundadores hablan ahí abiertamente de sus dificultades de gestión.", "recherche": "club de empresarios Rennes" },
        { "type": "Desayunos de negocios organizados por redes de emprendedores", "pourquoi": "Un formato corto en el que puedes presentar un caso real.", "recherche": "desayuno de emprendedores Rennes" }
      ],
      "canaux": [
        { "canal": "evenements", "priorite": 1, "action": "Únete a una red de empresarios y ofrece un taller de 30 minutos sobre comités de dirección que han dejado de decidir.", "pourquoi": "Mostrar tu talento en directo convence más rápido que cualquier pitch." },
        { "canal": "linkedin", "priorite": 2, "action": "Escribe cada semana a 5 fundadores cuya empresa esté contratando directores.", "pourquoi": "Contratar directivos es la señal visible del crecimiento que crea la tensión." }
      ],
      "linkedin": {
        "pertinence": "forte",
        "motsCles": "(fundador OR cofundador OR CEO OR \"director general\") AND (pyme OR PME)",
        "intitules": ["Fundador", "CEO", "Director general"],
        "secteurs": ["Servicios a empresas", "Industria", "Tecnología"],
        "tailles": ["De 11 a 50 empleados", "De 51 a 200 empleados"],
        "zone": "Bretaña y Países del Loira",
        "autres": ["Empresas que publican ofertas de puestos directivos"],
        "astuce": "Busca empresas que contratan directores: es la mejor señal de una tensión que se avecina."
      },
      "messages": {
        "linkedin": "Hola, [Nombre]: he visto que su empresa contrata a nuevos directores, enhorabuena por el crecimiento. Trabajo con comités de dirección que se amplían rápido. ¿Cómo van ahora mismo las decisiones en grupo?",
        "emailObjet": "¿Sigue decidiendo con rapidez su comité de dirección?",
        "emailCorps": "Hola, [Nombre]:\n\nCuando una empresa crece rápido, el comité de dirección se amplía y las decisiones se ralentizan: cada uno protege su parcela y el fundador acaba decidiendo solo.\n\nAyudo a los comités de dirección a hablar con franqueza y a volver a decidir juntos, en 1 día más un seguimiento breve.\n\n¿Tendría 15 minutos para una llamada? Me gustaría saber si esto le suena.\n\nAtentamente,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "3 fundadores de pequeñas empresas en crecimiento, conocidos a través de una red de emprendedores o de una recomendación.",
        "questions": ["¿Cómo fue la última gran decisión tomada en comité de dirección?", "¿Qué ha cambiado desde que el comité de dirección es más grande?", "¿Quién tiene la última palabra cuando hay desacuerdo?", "¿Ha organizado alguna vez una jornada de dirección y qué sacó de ella?", "¿Qué le ahorraría más tiempo a la hora de tomar estas decisiones?"],
        "signauxPositifs": ["Describen que deciden solos y que eso les desgasta", "Ya han reservado presupuesto para una jornada de dirección"],
        "signauxNegatifs": ["El fundador piensa que todo va bien y que el problema son los demás", "La empresa atraviesa dificultades financieras"]
      },
      "depuisIdees": [],
      "verbatims": []
    },
    {
      "id": "c3",
      "nom": "Mandos recién ascendidos que afrontan un conflicto en su equipo",
      "marche": "b2c",
      "portrait": "Un mando ascendido hace menos de un año que ha heredado un equipo dividido. No se atreve a plantearlo a su propio jefe y busca un apoyo discreto, pagado de su bolsillo.",
      "douleur": "\"Me acaban de ascender, mi equipo se está desgarrando y me da miedo que piensen que no estoy a la altura.\"",
      "ancrage": "Tu manera de hacer las preguntas que desbloquean ayuda a un mando a preparar las conversaciones difíciles que sigue aplazando.",
      "promesse": "En 1 mes, sabrás llevar las conversaciones difíciles con tu equipo, sin perder el sueño por ello.",
      "offre": {
        "nom": "Programa primer conflicto",
        "format": "4 sesiones individuales por videollamada de 1 hora",
        "duree": "1 mes",
        "contenu": ["Lectura de la situación y de lo que necesita cada uno", "Preparación de la conversación que temes", "Práctica mediante juegos de rol", "Balance después de la conversación"]
      },
      "prix": { "min": 90, "max": 150, "unite": "por sesión", "base": "TTC", "justification": "Quien paga de su bolsillo se compara con el coaching individual; un programa de 4 sesiones sigue siendo asequible." },
      "pitch": "¿Acaba de asumir un puesto de mando y su equipo se está dividiendo? Ocurre mucho y se puede trabajar. En 4 sesiones, preparamos las conversaciones que viene aplazando, y se lleva palabras que funcionan.",
      "pourquoi": "Abre el mercado B2C y te da historias reales que contar, pero los presupuestos son más ajustados y el trabajo individual te va menos que los grupos.",
      "exemple": "Imagina a un jefe de sección ascendido a director de tienda, con dos dependientas que no se soportan. Busca ayuda un domingo por la noche, después de una semana dura.",
      "scores": {
        "urgence": { "note": 3, "raison": "La situación les pesa, pero el mando puede dejar que se alargue." },
        "paiement": { "note": 2, "raison": "Pagan de su bolsillo y comparan precios." },
        "acces": { "note": 3, "raison": "Se llega a ellos con contenido en línea, sin red directa." },
        "plaisir": { "note": 3, "raison": "Te encanta desbloquear, pero en individual y a distancia tu talento se enciende menos que en grupo." }
      },
      "lieux": [
        { "type": "Comunidades en línea de mandos recién nombrados", "pourquoi": "Ahí plantean sus dudas del día a día.", "recherche": "comunidad nuevos mandos" },
        { "type": "Talleres y charlas públicas sobre gestión de equipos", "pourquoi": "Los mandos que se apuntan ya están buscando ayuda.", "recherche": "charla gestión de equipos Rennes" }
      ],
      "canaux": [
        { "canal": "contenu", "priorite": 1, "action": "Escribe una guía breve, «5 preguntas para desactivar un conflicto de equipo», para compartirla.", "pourquoi": "Los mandos buscan en internet antes de atreverse a pedir ayuda." },
        { "canal": "linkedin", "priorite": 2, "action": "Comenta cada semana las publicaciones de mandos que anuncian un ascenso.", "pourquoi": "Un ascenso anunciado es el momento detonante visible." }
      ],
      "linkedin": {
        "pertinence": "moyenne",
        "motsCles": "(\"nuevo puesto\" OR ascenso OR \"nuevo cargo\") AND (responsable OR \"jefe de equipo\")",
        "intitules": ["Responsable", "Jefe de equipo", "Jefe de departamento"],
        "secteurs": [],
        "tailles": [],
        "zone": "Francia",
        "autres": ["Publicaciones que anuncian un nuevo puesto"],
        "astuce": "Los mandos recién ascendidos suelen anunciar su nuevo puesto: felicítales primero, sin vender nada."
      },
      "messages": {
        "linkedin": "Hola, [Nombre]: ¡enhorabuena por su nuevo puesto! Trabajo con mandos que acaban de asumir su función. ¿Cuál es el tema de equipo que más tiempo le lleva ahora mismo?",
        "emailObjet": "Su primer conflicto de equipo",
        "emailCorps": "Hola, [Nombre]:\n\nAsumir un puesto de mando suele significar heredar un equipo con sus viejas tensiones. No siempre es fácil plantearlo a su propio jefe.\n\nAyudo a los mandos recién nombrados a preparar conversaciones difíciles, en 4 sesiones cortas, para que salgan con palabras que funcionan.\n\nSi lo desea, podemos hablar 15 minutos, solo para ver si le serviría.\n\nAtentamente,\n\n{{prenom}}"
      },
      "testTerrain": {
        "profils": "3 mandos ascendidos hace menos de un año, encontrados entre tus antiguos compañeros o sus contactos.",
        "questions": ["¿Cuál es la última conversación difícil que aplazó?", "¿Qué le frenó para tenerla?", "¿Con quién habló de ello?", "¿Ha pagado alguna vez de su bolsillo una formación o un coaching?", "¿Qué le habría ayudado ese día?"],
        "signauxPositifs": ["Ya han buscado ayuda en internet", "Ya han pagado ellos mismos una formación"],
        "signauxNegatifs": ["Esperan que su empresa lo pague todo", "No ven ningún problema"]
      },
      "depuisIdees": [],
      "verbatims": []
    }
  ],
  "autresPistes": [],
  "antiCible": {
    "portrait": "Grandes grupos muy jerárquicos que compran un taller de cohesión de equipo a través del departamento de compras, como una casilla que marcar, sin que la dirección se implique.",
    "signaux": ["El primer contacto llega a través de un comprador y una licitación", "La dirección no participará", "Te piden un programa cerrado validado en 3 niveles", "El presupuesto se negocia antes incluso de haber descrito el problema"],
    "lienAntiContexte": "Tu Anti-Contexto son las organizaciones donde todo debe validarse tres veces: ahí, tu talento no tendría nunca espacio para hacer las preguntas de verdad.",
    "commentDire": "Gracias por pensar en mí. Mi trabajo funciona cuando la dirección se implica desde el principio. Si no es posible, prefiero orientarle hacia un proveedor de formación que pueda ofrecerle un formato estándar."
  },
  "plan30": [
    { "semaine": 1, "titre": "Escuchar el terreno", "actions": [
      { "texte": "Haz una lista de 10 directores de planta de tu red y elige 3 a los que llamar.", "cible": "c1", "canal": "bouche_a_oreille", "minutes": 30 },
      { "texte": "Haz 3 llamadas de prueba de campo con las 5 preguntas, sin presentar tu oferta.", "cible": "c1", "canal": "telephone", "minutes": 90 },
      { "texte": "Anota las palabras exactas que usan para describir sus tensiones.", "cible": "c1", "canal": "autre", "minutes": 20 }
    ] },
    { "semaine": 2, "titre": "Primeros mensajes", "actions": [
      { "texte": "Envía el mensaje de LinkedIn a 10 directores de planta, empezando por los contactos de segundo grado.", "cible": "c1", "canal": "linkedin", "minutes": 45 },
      { "texte": "Envía el correo a 5 fundadores de pequeñas empresas que estén contratando directores.", "cible": "c2", "canal": "email", "minutes": 45 },
      { "texte": "Actualiza el titular de tu LinkedIn con tu promesa.", "cible": "toutes", "canal": "linkedin", "minutes": 20 }
    ] },
    { "semaine": 3, "titre": "Hacerte ver", "actions": [
      { "texte": "Publica una historia anonimizada de un mando recién ascendido que afrontó una conversación difícil.", "cible": "c3", "canal": "linkedin", "minutes": 60 },
      { "texte": "Apúntate a una reunión de una red de empresarios o de una asociación profesional.", "cible": "c2", "canal": "evenements", "minutes": 30 },
      { "texte": "Haz un seguimiento en una frase con las personas contactadas en la semana 2.", "cible": "toutes", "canal": "linkedin", "minutes": 30 }
    ] },
    { "semaine": 4, "titre": "Hacer una oferta y hacer balance", "actions": [
      { "texte": "Ofrece el diagnóstico en la planta a la persona más interesada de tu prueba de campo.", "cible": "c1", "canal": "telephone", "minutes": 45 },
      { "texte": "Redacta el programa de 4 sesiones para un mando, con el precio.", "cible": "c3", "canal": "autre", "minutes": 90 },
      { "texte": "Haz balance: ¿qué objetivo ha respondido más y qué hay que cambiar?", "cible": "toutes", "canal": "autre", "minutes": 30 }
    ] }
  ],
  "hypotheses": ["He supuesto que puedes desplazarte a plantas de toda Bretaña."],
  "motPourToi": "Ya tienes lo que a mucha gente le falta: un sector que conoces y personas que te han dado las gracias. Empieza por ellos, esta semana."
};
