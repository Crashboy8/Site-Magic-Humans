/* Quiz Amour, version espagnole : mêmes clés que amour-data.js, textes seulement.
   Fusionnée sur la base française par AmourEngine.withLanguage quand la langue du quiz est "es".
   Les identifiants, scores et ordres restent ceux de amour-data.js. Testé par quiz/amour-es.test.mjs.
   Espagnol neutre, au « tú ». Ce qui dépend du pays (numéros d'aide, lieux de rencontre, heures du rappel) n'est PAS ici :
   c'est dans amour-pays-es.js, un bloc par pays, appliqué après ce fichier. */
(function (root) {
const AMOUR_DATA_ES = {
  "profil": {
    "alliages": {
      "securite+profondeur": "Quieres algo sólido y auténtico. Te comprometes despacio, pero cuando lo haces es a fondo: quieres conocer a la otra persona y poder contar con ella. Tu reto: aceptar que no tendrás todas las respuestas enseguida.",
      "securite+admiration": "Necesitas un vínculo fiable y una mirada que te valore. Das mucho para que la relación dure, y necesitas que se note. Tu reto: pedir reconocimiento en vez de esperar a que llegue solo.",
      "securite+liberte": "Quieres un puerto al que volver y espacio para respirar. Es una mezcla rara y valiosa: una relación estable en la que cada uno conserva su vida. Tu reto: decir con claridad las 2 necesidades, para que la otra persona no piense que das un paso adelante y otro atrás.",
      "securite+harmonie": "Sueñas con un hogar dulce y seguro. Aportas constancia y paz, 2 cosas que hacen bien con el tiempo. Tu reto: no confundir paz con silencio, y atreverte a poner sobre la mesa los temas delicados.",
      "securite+complicite": "Quieres un equipo sólido que se ría junto. Para ti, una relación es proyectos y carcajadas, rituales y bromas. Tu reto: mantener la ligereza, incluso cuando la organización lo ocupa todo.",
      "securite+intensite": "Quieres la llama y el puerto al que volver. Necesitas que salten chispas, pero sin que todo se tambalee. Tu reto: aceptar que una relación estable también puede ser intensa, y que una relación intensa no es necesariamente inestable.",
      "profondeur+admiration": "Quieres que te vean de verdad, incluso en lo que escondes. Los halagos de superficie no te bastan: quieres que te admiren por quien eres. Tu reto: mostrar también tu lado vulnerable, porque ahí es donde la otra persona puede quererte entero/a.",
      "profondeur+liberte": "Tienes una vida interior rica y necesitas tiempo a solas para disfrutarla. Te encantan las conversaciones que llegan lejos y luego encontrar un poco de calma. Tu reto: avisar cuando te retiras, para que la otra persona no lo viva como un rechazo.",
      "profondeur+harmonie": "Quieres con dulzura y sinceridad. Escuchas, comprendes, calmas. Tu reto: decir también lo que te duele, sin esperar a que la otra persona lo adivine.",
      "profondeur+complicite": "Quieres poder decirlo todo y reírte de todo con la misma persona. Pasas de una charla profunda a un ataque de risa, y esa es tu fuerza. Tu reto: no usar el humor para esquivar lo que duele.",
      "profondeur+intensite": "Quieres con fuerza y de verdad. Buscas una conexión rara, conversaciones que dejen huella, una relación como ninguna otra. Tu reto: dejar sitio a la calma, sin creer que el amor se apaga.",
      "admiration+liberte": "Quieres brillar y seguir siendo libre. Necesitas a alguien que se sienta orgulloso/a de ti y no te frene. Tu reto: ofrecer también tu presencia, para que la otra persona no se sienta espectadora de tu vida.",
      "admiration+harmonie": "Necesitas palabras dulces y una mirada que te valore. Das mucha amabilidad y necesitas que te la devuelvan. Tu reto: decir lo que esperas, en vez de quedarte en segundo plano esperando que te vean.",
      "admiration+complicite": "Quieres a alguien que te anime y se ría contigo. Llevas vida y calidez a donde vas. Tu reto: aceptar los momentos más tranquilos sin creer que el amor se apaga.",
      "admiration+intensite": "Quieres con estilo. Quieres sentirte deseado/a, elegido/a, admirado/a, y que se note. Tu reto: recordar que la constancia también es una prueba de amor, aunque haga menos ruido.",
      "liberte+harmonie": "Quieres una relación ligera, en el buen sentido: sin presión, sin gritos, sin control. Dejas libre a la otra persona y esperas lo mismo. Tu reto: no huir de los desacuerdos en nombre de la paz.",
      "liberte+complicite": "Quieres un cómplice, no a alguien que te frene. Reír, irte, volver a encontrarte: esa es tu forma de querer. Tu reto: aceptar algunas reglas, porque protegen tu libertad en vez de recortarla.",
      "liberte+intensite": "Te encantan la aventura, la novedad, el impulso. Para ti, una relación es un viaje. Tu reto: quedarte cuando se apaga la emoción de los primeros tiempos, porque ahí suele empezar lo mejor.",
      "harmonie+complicite": "Quieres un día a día dulce y alegre. Creas un ambiente en el que la gente simplemente se siente bien. Tu reto: mantener tu voz cuando un tema se pone delicado, en vez de allanarlo todo.",
      "harmonie+intensite": "Quieres ternura y llama. Necesitas dulzura cada día y momentos que te hagan sentir vivo/a. Tu reto: aceptar que la intensidad a veces sacude la paz, y que no pasa nada.",
      "complicite+intensite": "Quieres una historia con vida: reír, atreverte, sorprender. Contigo no hay sitio para el aburrimiento. Tu reto: dejar también espacio a los momentos sencillos y a las conversaciones serias."
    },
    "couples": {
      "securite+complicite": {
        "text": "Los 2 forman un auténtico equipo: uno marca los puntos de referencia, el otro aporta el buen humor. Los proyectos avanzan y se ríen por el camino."
      },
      "admiration+complicite": {
        "text": "Sacan lo mejor el uno del otro. Los ánimos, las risas y las salidas juntos les sientan bien a los 2."
      },
      "admiration+intensite": {
        "text": "Se admiran y se desean. Cada uno se siente elegido, y la relación no se duerme."
      },
      "liberte+intensite": {
        "text": "Comparten el gusto por la aventura y el respeto por el espacio del otro. Nadie frena a nadie, y eso es lo que los une."
      },
      "liberte+harmonie": {
        "text": "Uno necesita espacio para respirar, el otro necesita calma: se dejan respirar sin tensión. Los reencuentros son dulces, sin reproches."
      },
      "profondeur+harmonie": {
        "text": "Dulzura y escucha: pueden decírselo todo sin miedo. El terreno ideal para abrirse y crecer juntos."
      },
      "securite+profondeur": {
        "text": "Uno quiere algo auténtico, el otro algo sólido: juntos construyen una confianza profunda. Las promesas se cumplen y se dicen las cosas importantes."
      },
      "securite+liberte": {
        "text": "Uno busca puntos de referencia, el otro espacio para respirar. Al principio se compensa. Luego llegan el «nunca estás» y el «me agobias». Conviene acordar pronto cada cuánto se ven y se escriben."
      },
      "admiration+liberte": {
        "text": "Uno vive su propia vida, el otro necesita que lo vean y lo celebren. El riesgo: uno se siente olvidado y el otro vigilado. Funciona con momentos solo para los 2, anunciados y respetados."
      },
      "profondeur+admiration": {
        "text": "Uno necesita brillar y que lo reconozcan, el otro necesita verdad e intimidad. El riesgo: uno encuentra al otro demasiado serio, y el otro encuentra al primero demasiado superficial. Funciona si cada uno dice lo que admira del otro."
      },
      "profondeur+complicite": {
        "text": "Uno quiere hablar de lo profundo, el otro prefiere quitarle hierro. Al principio resulta encantador. Luego llegan el «lo esquivas todo con humor» y el «lo conviertes todo en un drama». Funciona con tiempo para reír y tiempo para hablar, sin mezclarlos."
      },
      "harmonie+complicite": {
        "text": "Uno quiere movimiento, el otro quiere paz y tranquilidad. Las tardes, los fines de semana y las invitaciones se vuelven temas de discusión. Funciona si cada uno conserva sus salidas o sus noches tranquilas, sin culpa."
      },
      "harmonie+intensite": {
        "text": "Uno busca paz, el otro la chispa. Lo que hace sentir vivo a uno agota al otro. Funciona cuando la intensidad llega por la pasión y la novedad, nunca por las discusiones."
      },
      "securite+intensite": {
        "text": "Uno quiere que salten chispas, el otro quiere que dure. El primero encuentra al segundo demasiado tranquilo, el segundo encuentra al primero demasiado inestable. Funciona si la aventura se planifica un poco y la rutina acepta alguna sorpresa."
      },
      "securite+harmonie": {
        "text": "La misma necesidad de paz y de estabilidad: la vida en común es sencilla. Cuidado con que la rutina duerma el deseo."
      },
      "securite+admiration": {
        "text": "Uno aporta constancia, el otro palabras cálidas. Todo fluye, siempre que se den las gracias a menudo."
      },
      "profondeur+liberte": {
        "text": "Los 2 necesitan tiempo para sí mismos y una vida interior rica. Se entienden sin tener que justificarse. Cuidado con conservar momentos realmente compartidos."
      },
      "liberte+complicite": {
        "text": "Ligereza y libertad: están a gusto, sin presión. Cuidado con fijar también algunos planes en común."
      },
      "admiration+harmonie": {
        "text": "Amabilidad y palabras que levantan el ánimo: saben hacerse bien. Cuidado con atreverse a discrepar."
      },
      "profondeur+intensite": {
        "text": "Un vínculo fuerte, casi magnético. Cuidado con conservar puntos de referencia estables para evitar la montaña rusa."
      },
      "complicite+intensite": {
        "text": "Una relación con vida, llena de ideas y de carcajadas. Cuidado con dejar sitio a la seriedad y al descanso."
      },
      "securite+securite": {
        "text": "2 perfiles de Seguridad: un hogar sólido, enseguida. Conviene planificar cosas nuevas juntos, para que la comodidad no sustituya al deseo."
      },
      "profondeur+profondeur": {
        "text": "2 perfiles de Profundidad: conversaciones interminables, una intimidad poco común. Conviene acordarse de divertirse y de aligerar también."
      },
      "admiration+admiration": {
        "text": "2 perfiles de Admiración: saben levantarse el ánimo. Cuidado con no pelearse por el protagonismo."
      },
      "liberte+liberte": {
        "text": "2 perfiles de Libertad: sin presión, con mucho respeto. Cuidado con no acabar como compañeros de piso."
      },
      "harmonie+harmonie": {
        "text": "2 perfiles de Armonía: dulzura en cada momento. Atención a los no-dichos que se acumulan, porque nadie se atreve a discutir."
      },
      "complicite+complicite": {
        "text": "2 perfiles de Complicidad: un equipo alegre. Cuidado con no huir de los temas serios."
      },
      "intensite+intensite": {
        "text": "2 perfiles de Intensidad: una pasión magnética. Atención a la montaña rusa y a los celos."
      }
    },
    "pieges": {
      "fight": {
        "name": "la escalada",
        "title": "La escalada",
        "short": "te aceleras para no perder",
        "mech": "Cuando temes perder a la otra persona o que no te escuchen, te aceleras: el tono, los argumentos, la última palabra. En el momento parece fuerza. En realidad es miedo, y la otra persona solo oye el ruido.",
        "exits": [
          "Fíjate en la señal de tu cuerpo (calor, la voz que sube): ese es el momento de parar, no de acelerar.",
          "Di «Me tomo una pausa de 20 minutos y vuelvo», y vuelve de verdad.",
          "Al volver, empieza por lo que sientes, no por lo que ha hecho la otra persona: «Tenía miedo de que...»"
        ],
        "exitShort": "avisa de una pausa de 20 minutos y vuelve de verdad"
      },
      "flight": {
        "name": "la puerta de salida",
        "title": "La puerta de salida",
        "short": "te escapas para no estallar",
        "mech": "Cuando sube la tensión, te vas: físicamente, al teléfono, al trabajo. Crees que así proteges la relación. La otra persona vive tu marcha como un abandono, y la tensión vuelve más fuerte la próxima vez.",
        "exits": [
          "Tienes derecho a hacer una pausa. Anúnciala, en vez de desaparecer.",
          "Fija enseguida el momento de retomar el tema: «Hablamos esta noche, a las 21:00.»",
          "Vuelve con 1 sola frase verdadera, aunque sea corta: eso es lo que tranquiliza."
        ],
        "exitShort": "anuncia tu pausa y fija enseguida la hora a la que se retomará el tema"
      },
      "freeze": {
        "name": "la mente en blanco",
        "title": "La mente en blanco",
        "short": "te quedas en blanco y las palabras no salen",
        "mech": "Cuando es demasiado, tu mente se queda en blanco. Ni palabras ni ideas. La otra persona puede ver indiferencia, cuando en realidad estás desbordado/a, y su insistencia te bloquea todavía más.",
        "exits": [
          "Prepara de antemano tu frase de rescate: «Estoy bloqueado/a, dame un momento, vuelvo contigo.»",
          "Respira despacio, apoya los pies en el suelo: tu cuerpo necesita calmarse antes que tu cabeza.",
          "Si hablar cuesta demasiado, escribe lo que sientes y entrégaselo después."
        ],
        "exitShort": "di tu frase de rescate, «Estoy bloqueado/a, vuelvo contigo», y vuelve"
      },
      "fawn": {
        "name": "el sí que cuesta caro",
        "title": "El sí que cuesta caro",
        "short": "cedes para que acabe",
        "mech": "Para que la discusión pare, dices que sí, pides perdón, cedes. La calma vuelve rápido, pero tu necesidad se pierde por el camino. Con el tiempo se acumula, y acabas alejándote sin decir nada.",
        "exits": [
          "Cambia el sí automático por: «No lo tengo claro, lo pienso y te digo.»",
          "Antes de ceder, pregúntate: ¿qué necesito yo, aquí y ahora?",
          "Di 1 cosa verdadera al día, aunque sea pequeña. Se entrena, como un músculo."
        ],
        "exitShort": "cambia el sí automático por «lo pienso y te digo»"
      }
    },
    "besoins": {
      "securite": {
        "name": "Seguridad",
        "key": "Necesito saber con quién puedo contar.",
        "noun": "Ancla",
        "adj": "Fiel",
        "lower": "la seguridad",
        "de": "seguridad",
        "who": "alguien estable, que cumple su palabra y a quien le gustan los puntos de referencia",
        "s1": "amas construyendo algo sólido, con alguien con quien puedes contar",
        "secNeed": "poder contar con la otra persona, con el paso del tiempo",
        "bloomShort": "la otra persona cumple su palabra y los 2 hacen planes juntos",
        "fadeShort": "se instala la vaguedad y las promesas se quedan en el aire",
        "bloom": "Das lo mejor de ti en una relación estable, en la que cada uno hace lo que dice. La regularidad no te aburre: te relaja. Cuando sabes hacia dónde vas, bajas la guardia y muestras toda tu ternura.",
        "bloomList": [
          "Una pareja que te avisa cuando surge algo, sin que tengas que pedirlo.",
          "Planes decididos juntos: un viaje reservado, una casa, una fecha en la agenda.",
          "Rituales que vuelven: el mensaje de la noche, la comida del domingo."
        ],
        "secBloom": "necesitas también puntos de referencia, y que la otra persona cumpla su palabra",
        "fade": "Lo que te desgasta no es un gran drama, es la incertidumbre que se alarga. Un mensaje sin respuesta, un plan aplazado, un humor impredecible, y te pones en guardia. Preguntas, vigilas, y la otra persona puede pensar que la controlas, cuando solo necesitas que te tranquilicen.",
        "fadeList": [
          "Planes que cambian a última hora, sin explicación.",
          "«Ya veremos» como única respuesta a «¿hacia dónde vamos los 2?».",
          "Una pareja cariñosa un día y distante al siguiente."
        ],
        "alarm": "Si te sorprendes comprobando, persiguiendo o adivinando el humor de la otra persona varias veces al día, no es que seas «demasiado»: es tu necesidad de seguridad dando la voz de alarma.",
        "secFade": "la vaguedad que se alarga acaba siempre pesándote",
        "rel": {
          "rythme": "Un ritmo regular, con citas que se repiten. Lo inesperado te va bien mientras siga siendo la excepción.",
          "proximite": "Una cercanía estable: verse a menudo, mantener el contacto, sin necesidad de hacerlo todo juntos.",
          "independance": "Cada uno puede tener su propia vida, siempre que las reglas estén claras: quién hace qué, cuándo se ven, qué se queda solo para los 2.",
          "conflits": "Necesitas que los conflictos terminen con una decisión clara. Una discusión que queda en el aire te ronda la cabeza durante días."
        },
        "secCond": "compromisos cumplidos, incluso los pequeños",
        "partnerFond": "alguien estable, que te tranquiliza con hechos más que con promesas",
        "sayPartner": [
          "«Necesito saber que puedo contar contigo. Cuando haces lo que dices, me relajo.»",
          "«Si surge algo, avísame, aunque sea con una palabra rápida. Para mí lo cambia todo.»",
          "«Me gustaría que habláramos de nuestros planes para el año que viene.»"
        ],
        "sayDate": [
          "«Me gusta saber hacia dónde vamos, sin precipitar nada.»",
          "Una pregunta para hacer: «¿Qué es lo más importante para ti en una relación duradera?»"
        ],
        "trigger": "sientes que el vínculo ya no es seguro: un silencio, una duda, una promesa olvidada",
        "calm": "una frase que te tranquilice sobre los 2, antes de buscar una solución",
        "rencontre": {
          "brilles": {
            "texte": "Te luces en un grupo pequeño y fiel, donde cada uno sabe a qué atenerse."
          },
          "eviter": {
            "texte": "Las fiestas donde nadie se conoce y todo se decide a última hora."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. Tu Talento Único está justo ahí, en ese disfrute: en el amor, es igual."
        }
      },
      "profondeur": {
        "name": "Profundidad",
        "key": "Necesito que me conozcan de verdad, no solo que me quieran.",
        "noun": "Espejo",
        "adj": "Profundo",
        "lower": "la profundidad",
        "de": "profundidad",
        "who": "alguien a quien le encantan las conversaciones de verdad y que se atreve a hablar de lo que siente",
        "s1": "amas con profundidad, con conversaciones de verdad y el corazón abierto",
        "secNeed": "poder decirlo todo, incluso lo que te hace vulnerable",
        "bloomShort": "puedes decirlo todo y la otra persona intenta de verdad entenderte",
        "fadeShort": "la relación se queda en la superficie y nadie habla de lo que siente",
        "bloom": "Floreces cuando puedes contárselo todo a la otra persona. Una noche hablando de tus sueños y de tus miedos te hace más bien que un restaurante elegante. Cuando te sientes comprendido/a, tu lealtad y tu escucha son poco comunes.",
        "bloomList": [
          "Una pareja que hace preguntas y escucha la respuesta entera.",
          "Conversaciones que se alargan hasta tarde, sin el teléfono sobre la mesa.",
          "El derecho a estar triste, preocupado/a o conmovido/a sin que te juzguen."
        ],
        "secBloom": "necesitas también conversaciones de verdad, no solo buenos ratos",
        "fade": "Lo que te apaga es sentirte solo/a incluso en pareja. Una pareja que cambia de tema, se burla de tu sensibilidad o siempre tiene la cabeza en otra parte, y te quedas solo/a con lo que estás viviendo. Poco a poco te callas, y la relación se vacía sin hacer ruido.",
        "fadeList": [
          "«Le das demasiadas vueltas» como respuesta a lo que te conmueve.",
          "Silencios que duran días después de una discusión.",
          "Una pareja que está en cuerpo, pero ausente con la cabeza."
        ],
        "alarm": "Si te sorprendes guardándote lo más importante, porque «de todos modos no lo va a entender», tu necesidad de profundidad ya no se está alimentando.",
        "secFade": "una relación que se queda en la superficie acaba dejándote solo/a incluso en pareja",
        "rel": {
          "rythme": "Un ritmo que deja tiempo para hablar de verdad: menos salidas, más momentos auténticos.",
          "proximite": "Estar muy cerca de corazón: saber qué vive, siente y espera la otra persona.",
          "independance": "Aceptas la distancia física, no la distancia emocional. Tu pareja puede viajar, siempre que te lo cuente.",
          "conflits": "Necesitas hablar hasta entender. Una discusión barrida bajo la alfombra sin explicarla se te queda dentro."
        },
        "secCond": "momentos regulares para hablar de verdad",
        "partnerFond": "alguien que se interesa por lo que pasa dentro de ti y que se atreve a hablar de lo que pasa dentro de él o ella",
        "sayPartner": [
          "«Esta noche me gustaría que habláramos de verdad. No de logística: de nosotros.»",
          "«Cuando te cuento algo que me conmueve, solo necesito que me escuches hasta el final.»",
          "«Cuéntame 1 cosa que nunca te has atrevido a contarme. Te escucho, sin juzgar.»"
        ],
        "sayDate": [
          "«Prefiero 1 conversación de verdad a 10 temas ligeros.»",
          "Una pregunta para hacer: «¿Qué es lo que más te ha hecho crecer en los últimos años?»"
        ],
        "trigger": "te sientes incomprendido/a, o cuando la otra persona se cierra en vez de hablar",
        "calm": "que te escuchen sin corregirte, aunque sean 2 minutos",
        "rencontre": {
          "brilles": {
            "texte": "Te luces de tú a tú, cuando puedes ir a fondo sin prisas y sin cambiar de tema."
          },
          "eviter": {
            "texte": "Los grupos grandes donde todo se queda en la superficie y nadie escucha hasta el final."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. Ahí suele esconderse tu Talento Único: triunfar disfrutando, también en el amor."
        }
      },
      "admiration": {
        "name": "Admiración",
        "key": "Necesito sentir que la otra persona se fija en mí y me elige.",
        "noun": "Estrella",
        "adj": "Brillante",
        "lower": "la admiración",
        "de": "admiración",
        "who": "alguien a quien le gusta que se fijen en él o ella y que sabe devolver los halagos",
        "s1": "amas con calidez, y te iluminas cuando la otra persona está orgullosa de ti",
        "secNeed": "que la otra persona esté orgullosa de ti",
        "bloomShort": "la otra persona está orgullosa de ti y te lo dice",
        "fadeShort": "nadie nota tus esfuerzos y todo lo que haces parece darse por sentado",
        "bloom": "Floreces cuando te sientes elegido/a, cada día y no solo al principio. Una palabra de orgullo, un gracias sincero, un cumplido delante de tus amigos te dan alas. No es vanidad: es la prueba de que la otra persona te ve de verdad.",
        "bloomList": [
          "Una pareja que se fija en tus esfuerzos y lo dice.",
          "Sentirte apoyado/a en tus proyectos, sobre todo cuando dudas.",
          "Gestos que demuestran que importas, no solo costumbres."
        ],
        "secBloom": "necesitas también palabras de orgullo y de reconocimiento",
        "fade": "Lo que te hace daño es la indiferencia. Cuando todo lo que haces pasa a ser normal, cuando te critican más de lo que te dan las gracias, haces cada vez más para que por fin se fijen en ti. O te cierras, herido/a, sin decir nada.",
        "fadeList": [
          "Críticas constantes, sobre todo delante de otras personas.",
          "Tus éxitos recibidos con un «ah, bien» distraído.",
          "Cargar solo/a con el día a día, sin un gracias."
        ],
        "alarm": "Si te sorprendes haciendo cada vez más con la esperanza de una mirada que no llega, tu necesidad de admiración se ha quedado seca.",
        "secFade": "la indiferencia acaba apagándote, incluso en una relación estable",
        "rel": {
          "rythme": "Un ritmo animado, con momentos para lucirte: una cena, una salida, una fiesta.",
          "proximite": "Una cercanía que se nota: gestos, palabras, orgullo a la vista, también delante de otros.",
          "independance": "Te gusta tener tus propios proyectos y que la otra persona se interese por ellos. Necesitas apoyo, no público.",
          "conflits": "Necesitas que la crítica se refiera a un acto, nunca a ti como persona. Un comentario hiriente delante de otros se te queda grabado mucho tiempo."
        },
        "secCond": "palabras de orgullo y de agradecimiento, a menudo",
        "partnerFond": "alguien que sabe decir «bien hecho» y «gracias», y que está orgulloso/a de ti delante de los demás",
        "sayPartner": [
          "«Me haría bien que me dijeras lo que aprecias de mí.»",
          "«Cuando te das cuenta de lo que he hecho, me dan ganas de hacer todavía más por nosotros.»",
          "«Necesito que estés orgulloso/a de mí, y que me lo digas, aunque sea de forma sencilla.»"
        ],
        "sayDate": [
          "«Lo que más me llega es que se noten los esfuerzos, aunque sean pequeños.»",
          "Una pregunta para hacer: «¿De qué estás más orgulloso/a ahora mismo?»"
        ],
        "trigger": "te sientes criticado/a, comparado/a u olvidado/a",
        "calm": "oír lo valioso que eres, antes de oír lo que falla",
        "rencontre": {
          "brilles": {
            "texte": "Te luces cuando te ven haciendo lo que te gusta, delante de unas pocas personas que saben dar las gracias."
          },
          "eviter": {
            "texte": "Los sitios donde tus esfuerzos pasan desapercibidos, sin una palabra de reconocimiento."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. Tu Talento Único se nota en ese disfrute: en el amor, importa igual."
        }
      },
      "liberte": {
        "name": "Libertad",
        "key": "Necesito espacio para respirar para querer del todo.",
        "noun": "Pájaro",
        "adj": "Libre",
        "lower": "la libertad",
        "de": "libertad",
        "who": "alguien con vida propia que te deja espacio para respirar",
        "s1": "amas sin dejar de ser tú, con espacio para respirar",
        "secNeed": "conservar una vida propia",
        "bloomShort": "la otra persona confía en ti y te deja espacio para respirar",
        "fadeShort": "tienes que justificarlo todo y la relación te encierra",
        "bloom": "Floreces en una relación en la que cada uno conserva su propia vida: tus amistades, tus proyectos, tu tiempo a solas. Cuanto más libre te sientes, con más ganas vuelves hacia la otra persona. No es falta de amor, es tu manera de querer sin apagarte.",
        "bloomList": [
          "Una tarde a solas o con amigos, sin culpa y sin interrogatorio al volver.",
          "Una pareja que tiene su propia vida y sus propias pasiones.",
          "Decisiones tomadas juntos, sin control y sin tener que rendir cuentas."
        ],
        "secBloom": "necesitas también momentos solo para ti",
        "fade": "Lo que te apaga es sentirte vigilado/a o frenado/a. El «¿dónde estabas?», los celos, el «lo hacemos todo juntos» te cierran la garganta. Primero te alejas con la cabeza, luego buscas una salida, aunque quieras a la otra persona.",
        "fadeList": [
          "Tener que dar cuenta de tu horario.",
          "Celos cada vez que sales con amigos.",
          "Una agenda compartida que se llena sin pedirte opinión."
        ],
        "alarm": "Si te sorprendes soñando con las tardes a solas como una vía de escape, o mintiendo sobre tonterías para tener paz, tu necesidad de libertad se está ahogando.",
        "secFade": "una relación que te encierra acaba haciéndote huir",
        "rel": {
          "rythme": "Un ritmo flexible, con grandes momentos juntos y tiempo para ti, sin tener que pedir perdón por ello.",
          "proximite": "Estar cerca porque quieres, no por obligación: vuelves hacia la otra persona porque te apetece.",
          "independance": "Fuerte: tus amistades, tus proyectos, tu dinero, tu tiempo. Quieres una pareja, no un horario compartido.",
          "conflits": "Necesitas algo de distancia antes de hablar. Acorralado/a en una discusión, te escapas; con un poco de espacio, vuelves con soluciones."
        },
        "secCond": "tiempo para ti, sin tener que justificarlo",
        "partnerFond": "alguien con vida propia, que confía en ti y no vive tu tiempo a solas como un abandono",
        "sayPartner": [
          "«Cuando me tomo tiempo para mí, no es contra ti. Es como vuelvo hacia ti, con ganas de verte.»",
          "«Necesito que confíes en mí, sin que tenga que explicarlo todo.»",
          "«Podemos vernos un poco menos, pero mejor. ¿Qué te apetecería para nuestras tardes juntos?»"
        ],
        "sayDate": [
          "«Me encantan las relaciones en las que cada uno conserva su propia vida y se encuentran porque quieren.»",
          "Una pregunta para hacer: «¿Qué haces cuando tienes un día entero para ti?»"
        ],
        "trigger": "te sientes acorralado/a, controlado/a o presionado/a para responder",
        "calm": "un poco de espacio, y la certeza de que se retomará el tema más tarde",
        "rencontre": {
          "brilles": {
            "texte": "Te luces en un entorno flexible, donde la gente se encuentra porque quiere, no porque tiene que."
          },
          "eviter": {
            "texte": "Los grupos donde hay que hacerlo todo juntos y justificar cada hora de la agenda."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. Tu Talento Único respira en ese disfrute: en el amor, es el mismo impulso."
        }
      },
      "harmonie": {
        "name": "Armonía",
        "key": "Necesito dulzura y paz entre nosotros.",
        "noun": "Oasis",
        "adj": "Sereno",
        "lower": "la armonía",
        "de": "armonía",
        "who": "alguien dulce, que busca la paz y la ternura",
        "s1": "amas con dulzura, y creas un auténtico nido a tu alrededor",
        "secNeed": "un día a día dulce, sin gritos ni pullas",
        "bloomShort": "el día a día es dulce y los desacuerdos se dicen sin gritar",
        "fadeShort": "las pullas y la tensión se vuelven normales",
        "bloom": "Floreces en una relación tierna y en paz. Los pequeños gestos de cada día, una mano en la espalda, una tarde tranquila, te hacen un bien enorme. En ese ambiente ofreces una dulzura y una amabilidad que hacen bien a todo el mundo.",
        "bloomList": [
          "Tardes tranquilas juntos, sin tensión en el aire.",
          "Ternura cotidiana: un abrazo al pasar, una palabra dulce.",
          "Desacuerdos dichos con calma, y luego una reconciliación de verdad."
        ],
        "secBloom": "necesitas también calma y ternura cada día",
        "fade": "Lo que te agota son las voces altas, la ironía y la tensión que se queda flotando. Para evitar el conflicto, allanas, te callas, te adaptas. Lo no dicho se acumula, hasta el día en que te vas sin que la otra persona lo vea venir.",
        "fadeList": [
          "Gritos, pullas, una ironía que hiere.",
          "Un ambiente tenso que dura días.",
          "Tener que ceder siempre para que vuelva la paz."
        ],
        "alarm": "Si te sorprendes callando para evitar una discusión, una y otra vez, tu necesidad de armonía te está impidiendo decir lo que piensas.",
        "secFade": "la tensión que se queda flotando acaba agotándote",
        "rel": {
          "rythme": "Un ritmo suave y previsible, con tardes tranquilas y momentos tiernos.",
          "proximite": "Una cercanía tierna: gestos, dulzura, una presencia que calma.",
          "independance": "Media: te gusta compartir muchas cosas, sin estar pegado/a a la otra persona, siempre que el ambiente siga en paz.",
          "conflits": "Necesitas desacuerdos sin gritos ni pullas. Hablar con calma, en el momento adecuado, y luego reconciliarse de verdad."
        },
        "secCond": "desacuerdos sin gritos ni pullas",
        "partnerFond": "alguien tranquilo y dulce, que sabe discutir sin herir y luego reconciliarse",
        "sayPartner": [
          "«Necesito que podamos discrepar sin levantar la voz.»",
          "«Un abrazo cuando llego a casa me cambia toda la tarde.»",
          "«No siempre digo cuándo algo me molesta. Si notas que me alejo, pregúntamelo con dulzura.»"
        ],
        "sayDate": [
          "«Lo que más me gusta es cuando simplemente estamos a gusto juntos.»",
          "Una pregunta para hacer: «¿Qué haces cuando no estás de acuerdo con alguien a quien quieres?»"
        ],
        "trigger": "se levantan las voces, o cuando notas una tensión que nadie nombra",
        "calm": "una voz tranquila y un gesto dulce, antes de cualquier discusión",
        "rencontre": {
          "brilles": {
            "texte": "Te luces en un ambiente dulce, en pareja o en un grupo muy pequeño, donde se habla sin levantar la voz."
          },
          "eviter": {
            "texte": "Las fiestas ruidosas y los debates en los que todos hablan a la vez."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. Tu Talento Único se siente en casa ahí: triunfar disfrutando, también en el amor."
        }
      },
      "complicite": {
        "name": "Complicidad",
        "key": "Necesito reírme y ser un equipo contigo.",
        "noun": "Equipo",
        "adj": "Cómplice",
        "lower": "la complicidad",
        "de": "complicidad",
        "who": "alguien a quien le encanta reír, formar equipo y compartir el día a día",
        "s1": "amas como un equipo, con risas y proyectos compartidos",
        "secNeed": "reírte y ser un equipo cada día",
        "bloomShort": "se ríen juntos y avanzan como un equipo",
        "fadeShort": "todo se vuelve pesado y cargas tú solo/a con el día a día",
        "bloom": "Floreces cuando la relación es un equipo alegre. Bromas que nadie más entiende, pequeños proyectos, tareas compartidas sin llevar la cuenta: para ti, eso es amor. En una relación ligera en la que se hace piña, eres una pareja llena de energía y buen humor.",
        "bloomList": [
          "Ataques de risa y bromas que nadie más entiende.",
          "Tareas repartidas sin tener que negociar.",
          "Pequeños proyectos juntos: una receta, un fin de semana, un mueble que montar."
        ],
        "secBloom": "necesitas también reírte y hacer cosas juntos",
        "fade": "Lo que te hunde es que todo se vuelva pesado. Los reproches constantes, la seriedad de la mañana a la noche, el peso del día a día sobre ti te agotan. Pierdes la alegría, te vuelves irritable y acabas buscando ligereza en otra parte.",
        "fadeList": [
          "Ocuparte tú solo/a de la compra, las citas y la organización.",
          "Una pareja que ya no se ríe con tus bromas.",
          "Enfados que se alargan, en vez de arreglar las cosas y pasar página."
        ],
        "alarm": "Si te sorprendes prefiriendo reír con tus amigos antes que con tu pareja, tu necesidad de complicidad se ha roto.",
        "secFade": "un día a día sin risas ni trabajo en equipo acaba agotándote",
        "rel": {
          "rythme": "Un ritmo animado: risas, salidas, ideas, pequeños proyectos juntos.",
          "proximite": "Estar cerca como compañeros de equipo: hacer cosas juntos, repartir las tareas, contarse las pequeñas cosas.",
          "independance": "Te gusta hacer muchas cosas juntos, pero no todo. Cada uno puede tener sus propios amigos, siempre que sigan siendo un equipo.",
          "conflits": "Necesitas arreglarlo rápido y pasar página. Un enfado que se alarga te pesa más que la propia discusión."
        },
        "secCond": "risas y cosas hechas juntos",
        "partnerFond": "alguien a quien le encanta reír, que hace su parte sin llevar la cuenta y se ve como tu compañero/a de equipo",
        "sayPartner": [
          "«Somos un gran equipo cuando nos reímos juntos. ¿Reservamos un momento para eso esta semana?»",
          "«Me gustaría que repartiéramos las tareas de otra manera, para que deje de ser una fuente de tensión.»",
          "«¿Te acuerdas de nuestro último ataque de risa? Quiero más como ese.»"
        ],
        "sayDate": [
          "«Para mí, una pareja es ante todo un equipo que se ríe junto.»",
          "Una pregunta para hacer: «¿Cuál ha sido el mejor ataque de risa de tu vida?»"
        ],
        "trigger": "te sientes solo/a frente a los problemas, o cuando desaparece el buen humor",
        "calm": "un gesto de equipo: «miremos esto juntos»",
        "rencontre": {
          "brilles": {
            "texte": "Te luces en un proyecto compartido, cuando se ríe mientras se hacen cosas juntos."
          },
          "eviter": {
            "texte": "Los ambientes demasiado serios, donde cada uno se queda en su rincón sin echar una mano."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. A tu Talento Único le encanta ese disfrute compartido: en el amor, es igual."
        }
      },
      "intensite": {
        "name": "Intensidad",
        "key": "Necesito que nuestra historia tenga chispa.",
        "noun": "Volcán",
        "adj": "Apasionado",
        "lower": "la intensidad",
        "de": "intensidad",
        "who": "alguien a quien le encantan el impulso, la pasión y las cosas nuevas",
        "s1": "amas con pasión, buscando lo que te hace sentir vivo/a",
        "secNeed": "que siga habiendo chispa, mucho después del principio",
        "bloomShort": "la relación conserva el deseo, el impulso y el aire de novedad",
        "fadeShort": "se instala la rutina y el deseo se duerme",
        "bloom": "Floreces en una relación viva, en la que se desean, se sorprenden, se atreven. La aventura juntos te hace sentir vivo/a: un viaje improvisado, un proyecto un poco loco, una noche como ninguna otra. Cuando salta la chispa, das una energía y una generosidad increíbles.",
        "bloomList": [
          "Sentirte deseado/a, mucho después del principio.",
          "Sorpresas, descubrimientos, fines de semana improvisados.",
          "Una pareja que se atreve, que propone cosas, que te sacude un poco."
        ],
        "secBloom": "necesitas también impulso, sorpresa y deseo",
        "fade": "Tu enemiga es la rutina sin sorpresas. Las mismas tardes, las mismas conversaciones, un deseo que se duerme: te vas apagando poco a poco. El riesgo es buscar la chispa en otra parte, o crear un drama para sentir que algo sigue vivo.",
        "fadeList": [
          "Las mismas tardes, una y otra vez.",
          "Una pareja que nunca propone nada nuevo.",
          "Un deseo que se duerme sin que nadie hable de ello."
        ],
        "alarm": "Si te sorprendes provocando una pelea para sentir algo, o soñando con otra vida, tu necesidad de intensidad ya no se está alimentando.",
        "secFade": "la rutina acaba apagando tu llama",
        "rel": {
          "rythme": "Un ritmo cambiante: cosas nuevas, sorpresas, proyectos que te hacen sentir vivo/a.",
          "proximite": "Una cercanía fuerte, física y emocional. Necesitas sentirte deseado/a, mucho después del principio.",
          "independance": "Necesitas vivir tus propias aventuras, y luego compartirlas con pasión.",
          "conflits": "Te enciendes rápido y perdonas rápido. Necesitas una pareja que no huya de la intensidad, sin escalar."
        },
        "secCond": "cosas nuevas y deseo, con regularidad",
        "partnerFond": "alguien que se atreve, que propone cosas, que mantiene vivo el deseo y no teme la intensidad",
        "sayPartner": [
          "«Quiero que sigamos sorprendiéndonos. ¿Planeamos una noche como ninguna otra?»",
          "«Sentirme deseado/a es lo que me hace sentir querido/a.»",
          "«Cuando nos atrevemos con cosas nuevas juntos, me enamoro de ti otra vez.»"
        ],
        "sayDate": [
          "«Lo que me hace sentir vivo/a es descubrir, atreverme, no aburrirme nunca.»",
          "Una pregunta para hacer: «¿Cuál es la locura más grande que has hecho por impulso?»"
        ],
        "trigger": "sientes que la otra persona se aleja, o cuando la relación se vuelve tibia",
        "calm": "un contacto real, una mirada, una mano cogida, mejor que un discurso largo",
        "rencontre": {
          "brilles": {
            "texte": "Te luces cuando pasa algo con vida, en un proyecto un poco loco compartido con otros."
          },
          "eviter": {
            "texte": "Los grupos que siempre hacen lo mismo, sin sorpresa y sin impulso."
          },
          "talent": "Cuando haces lo que de verdad te gusta, conoces a gente que se parece a ti. Tu Talento Único se enciende con ese disfrute: en el amor, también es cierto."
        }
      }
    },
    "encyclo": {
      "regle": "Las 7 familias son las 7 necesidades del perfil: Seguridad, Profundidad, Admiración, Libertad, Armonía, Complicidad, Intensidad. Una pareja une 2 familias, incluida una familia consigo misma: 21 parejas mixtas y 7 parejas espejo, es decir 28. La agrupación reutiliza el tipo ya fijado en profil.couples, sin cambiar la puntuación. nourrit: las 2 necesidades se alimentan. proche: se parecen, con 1 punto que mantener vivo. miroir: la misma necesidad en ambos lados, una bonita resonancia y un punto ciego. Estos 3 tipos van en «Con quién fluye fácil». frotte: las necesidades tiran en 2 direcciones. Este tipo va en «Qué requiere atención». Cada pareja tiene un consejo: qué vigilar y cómo mantener fuerte el vínculo. Nunca se condena un encuentro.",
      "openAll": "Descubre todos los perfiles",
      "close": "Cerrar",
      "nourritLab": "Qué te alimenta",
      "videLab": "Qué te vacía",
      "nuancesLab": "Los 6 matices de este perfil",
      "couleLab": "Con quién fluye fácil",
      "attentionLab": "Qué requiere atención",
      "tipLab": "El gesto que ayuda",
      "sameLab": "Misma familia",
      "cards": {
        "securite": {
          "portrait": "Necesitas saber con quién puedes contar. Cuando eso está claro, te relajas, y entonces es cuando te vuelves de verdad tierno/a. Los hábitos no te atrapan. Para ti, demuestran que la otra persona está ahí.",
          "nourrit": "Promesas cumplidas, pequeños rituales que vuelven, hablar del futuro juntos.",
          "vide": "No saber a qué atenerte, promesas que se quedan en promesas, alguien cuyo humor cambia sin una palabra.",
          "nuances": {
            "profondeur": "Profunda: quieres algo sólido y auténtico. Te comprometes cuando conoces de verdad a la persona y puedes contar con ella.",
            "admiration": "Brillante: se puede confiar en ti, y necesitas que se note todo lo que haces por la relación.",
            "liberte": "Libre: quieres un hogar al que volver, y tiempo para ti. Una vida estable te va muy bien, si cada uno conserva sus amistades y sus actividades.",
            "harmonie": "Serena: sueñas con un hogar dulce y seguro. La calma te hace bien. Ojo, eso sí: el silencio no siempre significa que sí.",
            "complicite": "Cómplice: quieres poder contar con la otra persona, y reír con ella. Los proyectos avanzan mejor cuando no se toman demasiado en serio.",
            "intensite": "Apasionada: quieres pasión y estabilidad. Sentimientos fuertes entre los 2, sí, pero sin preguntarte cada mañana si la otra persona se quedará."
          }
        },
        "profondeur": {
          "portrait": "Te encanta poder decirse todo. Una conversación de verdad te conmueve más que un restaurante elegante. Cuando te sientes comprendido/a, tu lealtad y tu escucha son poco comunes.",
          "nourrit": "Que te escuchen hasta el final, poder hablar de lo que te da miedo, sentir que la otra persona intenta de verdad entenderte.",
          "vide": "Conversaciones vacías, temas que se esquivan, sentirte solo/a aunque sean 2.",
          "nuances": {
            "securite": "Fiel: quieres algo auténtico y duradero. Te abres más fácilmente a alguien que cumple su palabra.",
            "admiration": "Brillante: quieres que te vean de verdad, no solo que te halaguen. Lo que te conmueve es que te admiren por quien eres en el fondo.",
            "liberte": "Libre: necesitas momentos a solas con tus pensamientos. Cuando puedes retirarte sin tener que justificarte, vuelves con gusto hacia la otra persona.",
            "harmonie": "Sereno: te gusta hablar con sinceridad, pero sin gritos. Cuando la otra persona se mantiene dulce, puedes contárselo todo.",
            "complicite": "Cómplice: con la misma persona, puedes hablar de cosas serias y acabar en ataques de risa. El humor te va bien, siempre que no sirva para esquivar lo que duele.",
            "intensite": "Apasionado: quieres con fuerza y de verdad. Buscas una relación que deje huella, con momentos de calma también."
          }
        },
        "admiration": {
          "portrait": "Floreces cuando la otra persona te elige, y no solo al principio. Un gracias de verdad, un «estoy orgulloso/a de ti», y sientes que te salen alas. No es vanidad, es tu forma de sentir que la otra persona te ve.",
          "nourrit": "Que se noten tus esfuerzos, oír «bien hecho», que alguien esté orgulloso/a de ti, incluso delante de otros.",
          "vide": "La indiferencia, los reproches repetidos, la sensación de que nadie se fija ya en lo que haces.",
          "nuances": {
            "securite": "Fiel: haces mucho para que tu relación dure, y necesitas que se note.",
            "profondeur": "Profunda: los halagos fáciles no te bastan. Quieres que te admiren por quien eres, incluso por lo que rara vez muestras.",
            "liberte": "Libre: quieres brillar sin que te frenen. Te hace bien que alguien esté orgulloso/a de ti, siempre que te deje llevar tu propia vida.",
            "harmonie": "Serena: eres amable con todo el mundo, y necesitas que esa amabilidad te la devuelvan con palabras dulces.",
            "complicite": "Cómplice: quieres a alguien que te anime y se ría contigo. Donde vas, el ambiente se calienta.",
            "intensite": "Apasionada: quieres a lo grande. Sentirte deseado/a y elegido/a, y que se note, es lo que te hace sentir vivo/a."
          }
        },
        "liberte": {
          "portrait": "Quieres sin renunciar a tu vida. Ver a tus amigos, tener tus proyectos, pasar tiempo a solas no significa que quieras menos. Al contrario: cuanto más libre te sientes, más ganas tienes de volver.",
          "nourrit": "Confianza, tiempo para ti, alguien que también tiene una vida propia.",
          "vide": "Tener que justificarte, los celos, una agenda compartida que se llena sin pedirte opinión.",
          "nuances": {
            "securite": "Fiel: quieres tu libertad y un lugar al que volver. Funciona mejor cuando se respetan las fechas importantes.",
            "profondeur": "Profundo: necesitas momentos a solas para pensar, y luego vuelves con cosas de verdad que compartir.",
            "admiration": "Brillante: quieres que estén orgullosos de tu camino, sin intentar guardarte para sí.",
            "harmonie": "Sereno: te encanta una relación sencilla, sin presión y sin gritos. Para ti, estar en paz también es poder irte y volver.",
            "complicite": "Cómplice: quieres un compañero de aventuras. Reír, irte, volver a encontrarte: esa es tu forma de querer.",
            "intensite": "Apasionado: te encantan la aventura y actuar por impulso. Para ti, el amor es un viaje, no una sala de espera."
          }
        },
        "harmonie": {
          "portrait": "Floreces en la dulzura. Un gesto tierno, una tarde tranquila, y recargas las pilas. Cuando el ambiente es dulce, tu amabilidad hace bien a todo el mundo. Tu reto es atreverte a decir cuándo algo te molesta.",
          "nourrit": "La calma, los pequeños gestos tiernos del día a día, poder discrepar sin hacerse daño.",
          "vide": "Gritos, pullas, una tensión que se queda flotando, tener que ceder siempre para tener un poco de paz.",
          "nuances": {
            "securite": "Fiel: sueñas con un hogar dulce y seguro. Una vida regular te tranquiliza, si además puedes hablar de los temas delicados.",
            "profondeur": "Profundo: dices cosas verdaderas con dulzura. Escuchas mucho, y también necesitas que te escuchen cuando algo te duele.",
            "admiration": "Brillante: las palabras dulces te hacen bien. Eres amable, y necesitas que se note.",
            "liberte": "Libre: quieres paz, no una prisión. Cada uno tiene su propia vida, y te alegras de reencontrarte.",
            "complicite": "Cómplice: te encanta una vida alegre y en paz. Risas, sí, pero sin la obligación de estar siempre de buen humor.",
            "intensite": "Apasionado: quieres ternura y un poco de picante. La intensidad te atrae cuando llega por el deseo, no por las discusiones."
          }
        },
        "complicite": {
          "portrait": "Para ti, querer es ser un equipo. Bromas que nadie más entiende, tareas hechas juntos, pequeños proyectos. En una relación ligera en la que se hace piña, estás en tu elemento.",
          "nourrit": "Ataques de risa, ayudarse sin llevar la cuenta, avanzar juntos en cosas concretas.",
          "vide": "Ambientes pesados, cargar con todo solo/a en el día a día, el buen humor que se escapa.",
          "nuances": {
            "securite": "Fiel: quieres un equipo que dure. Para ti, los hábitos compartidos y los ataques de risa van juntos.",
            "profondeur": "Profundo: con la misma persona, puedes reírte de todo y contárselo todo. Bromeas, y también hablas de lo que importa.",
            "admiration": "Brillante: quieres una pareja que te vea y te anime. Das mucha calidez, y necesitas que te devuelvan algo.",
            "liberte": "Libre: quieres un cómplice, no a alguien que te frene. Reír, irse cada uno a lo suyo, volver a encontrarse.",
            "harmonie": "Sereno: te encanta el buen humor sin los gritos. Un equipo tranquilo, donde las tensiones se resuelven rápido.",
            "intensite": "Apasionado: quieres una historia en la que pasen cosas. Reír, atreverse, sorprenderse, sin olvidar los momentos sencillos."
          }
        },
        "intensite": {
          "portrait": "Floreces cuando entre los 2 pasan cosas. El deseo, las sorpresas, un proyecto un poco loco. Cuando hay vida, tienes una energía increíble. La rutina sin deseo, en cambio, te va apagando poco a poco.",
          "nourrit": "Sentirte deseado/a, descubrir cosas nuevas, alguien que se atreve y tiene ideas.",
          "vide": "Tardes todas iguales, un deseo que se duerme, nunca ninguna sorpresa.",
          "nuances": {
            "securite": "Fiel: quieres pasión y estabilidad. Una aventura se puede planificar un poco, y una vida estable todavía puede sorprender.",
            "profondeur": "Profundo: buscas un encuentro poco común. Las conversaciones que dejan huella te hacen sentir vivo, y también necesitas calma.",
            "admiration": "Brillante: quieres sentirte elegido/a y deseado/a, y que se note. Te encantan los grandes gestos, y también las pequeñas atenciones de cada día.",
            "liberte": "Libre: te encanta vivir aventuras juntos, cada uno libre de seguir sus propios deseos. Nadie frena a nadie.",
            "harmonie": "Sereno: quieres vida, no guerra. La pasión llega por el deseo y la novedad, no por los gritos.",
            "complicite": "Cómplice: quieres reír y atreverte. Sin sitio para el aburrimiento, pero las conversaciones serias también tienen su momento."
          }
        }
      },
      "paires": {
        "securite+securite": {
          "text": "2 Anclas construyen enseguida un hogar sólido. Cada una sabe con quién puede contar, y eso descansa.",
          "tip": "De vez en cuando, planificar algo nuevo, para que la costumbre no sustituya al deseo."
        },
        "profondeur+profondeur": {
          "text": "2 Espejos pueden decírselo todo. Una intimidad así es poco común.",
          "tip": "Conservar también momentos ligeros. Una conversación no tiene por qué ser profunda para ser sincera."
        },
        "admiration+admiration": {
          "text": "2 Estrellas saben levantarse el ánimo y hacerse bien con las palabras.",
          "tip": "Dejar que la otra persona brille tantas veces como uno mismo. Turnarse para estar en el foco."
        },
        "liberte+liberte": {
          "text": "2 Pájaros se respetan sin vigilarse. Cada uno tiene su propia vida, y están juntos porque quieren.",
          "tip": "Fijar algunas fechas importantes. Si no, con tanta libertad, acaban alejándose."
        },
        "harmonie+harmonie": {
          "text": "2 Oasis hacen una dulzura poco común. El día a día es tranquilo, tierno, fácil de vivir.",
          "tip": "Decir lo que molesta, aunque sea un detalle. Están mejor juntos cuando no se lo guardan todo."
        },
        "complicite+complicite": {
          "text": "2 Equipos ríen, se ayudan y avanzan. La vida en común tiene ritmo y alegría.",
          "tip": "Reservar un momento para los temas serios. No todo se arregla con una broma."
        },
        "intensite+intensite": {
          "text": "2 Volcanes se atraen y se despiertan. La pasión está ahí, fuerte y viva.",
          "tip": "Cuando salten chispas, fijar algunas reglas sencillas, por ejemplo no acostarse nunca enfadados. Así la pasión dura mejor."
        },
        "securite+profondeur": {
          "text": "El Ancla es fiable, el Espejo habla con sinceridad. Juntos pueden confiar el uno en el otro y decírselo todo.",
          "tip": "Darse tiempo. No hace falta tener todas las respuestas enseguida para ser sinceros."
        },
        "securite+admiration": {
          "text": "El Ancla está ahí cada día, la Estrella tiene las palabras que calientan el corazón. Cada uno se siente apoyado y apreciado.",
          "tip": "Decir gracias a menudo, en voz alta. Lo que el otro hace cada día se nota mejor cuando se dice."
        },
        "securite+liberte": {
          "text": "El Ancla necesita saber con quién puede contar, el Pájaro necesita libertad. Al principio se compensa. Con el tiempo, uno puede sentirse descuidado y el otro agobiado.",
          "tip": "Decidir pronto cada cuánto se escriben y se ven. Cada uno conserva su libertad, y nadie se queda a oscuras."
        },
        "securite+harmonie": {
          "text": "El Ancla y el Oasis aman la calma y las historias que duran. La vida en común es sencilla, dulce, sin malas sorpresas.",
          "tip": "De vez en cuando, sacar un tema delicado. Estar bien juntos no significa callar."
        },
        "securite+complicite": {
          "text": "El Ancla mantiene el rumbo, el Equipo aporta el buen humor. Los proyectos avanzan, y se echan unas risas por el camino.",
          "tip": "Cuando la organización lo ocupe todo, reservar un momento para reír. Importa tanto como la lista de la compra."
        },
        "securite+intensite": {
          "text": "El Volcán quiere que las cosas se muevan, el Ancla quiere que duren. Uno puede encontrar al otro demasiado tranquilo, el otro demasiado impredecible.",
          "tip": "Planificar un poco las aventuras y colar sorpresas en el día a día. Así, cada uno recibe lo que necesita."
        },
        "profondeur+admiration": {
          "text": "A la Estrella le encanta brillar, el Espejo quiere llegar al fondo de las cosas. Uno puede encontrar al otro demasiado serio, el otro demasiado superficial.",
          "tip": "Decirse lo que de verdad se admira del otro, no solo lo que se ve de lejos. Los 2 se reconocerán en ello."
        },
        "profondeur+liberte": {
          "text": "El Espejo y el Pájaro necesitan tiempo para sí mismos. Se entienden sin tener que justificarse.",
          "tip": "Decir cuándo se necesita estar solo, y conservar momentos juntos de verdad. Retirarse no es rechazar al otro."
        },
        "profondeur+harmonie": {
          "text": "El Oasis aporta dulzura, el Espejo aporta escucha. Pueden decirse las cosas sin miedo.",
          "tip": "Atreverse también a decir lo que duele, con la misma dulzura. La otra persona no puede adivinarlo todo."
        },
        "profondeur+complicite": {
          "text": "El Espejo quiere llegar al fondo de las cosas, el Equipo prefiere reírse de ellas. Al principio resulta encantador. Luego uno puede sentir que el otro huye, y el otro sentirse aplastado.",
          "tip": "Separar los momentos. Un tiempo para reír, un tiempo para hablar, sin mezclarlo todo."
        },
        "profondeur+intensite": {
          "text": "El Espejo y el Volcán buscan una relación fuerte. Sus conversaciones dejan huella, y la atracción está ahí.",
          "tip": "Conservar algunos hábitos que tranquilicen. No hace falta una montaña rusa para que sea fuerte."
        },
        "admiration+liberte": {
          "text": "El Pájaro vive su propia vida, la Estrella necesita que la vean. Uno puede sentirse vigilado, la otra olvidada.",
          "tip": "Planificar momentos solo para los 2 y respetarlos. El Pájaro conserva su libertad, y la Estrella sabe que importa."
        },
        "admiration+harmonie": {
          "text": "El Oasis y la Estrella saben hacerse bien. Amabilidad, palabras dulces, un ambiente tierno.",
          "tip": "Atreverse a discrepar de vez en cuando. Hacerse bien no siempre significa decir que sí."
        },
        "admiration+complicite": {
          "text": "La Estrella y el Equipo sacan lo mejor el uno del otro. Se animan, ríen, salen mucho. Chispea.",
          "tip": "Cuando la semana es tranquila, basta un gracias sencillo. No todas las tardes tienen que ser una fiesta."
        },
        "admiration+intensite": {
          "text": "La Estrella y el Volcán se desean y se admiran. Cada uno se siente elegido, y nunca es monótono.",
          "tip": "Recordar que estar ahí cada día también es una prueba de amor, aunque se note menos."
        },
        "liberte+harmonie": {
          "text": "El Pájaro necesita libertad, el Oasis necesita calma. Cada uno deja al otro vivir a su manera, sin tensión.",
          "tip": "Cuando el otro llegue a casa, un gesto tierno vale más que un interrogatorio. Los reencuentros se mantienen ligeros."
        },
        "liberte+complicite": {
          "text": "El Pájaro y el Equipo aman la ligereza. Están bien juntos, sin presión, y ríen mucho.",
          "tip": "Emprender igualmente un proyecto juntos. No le quita nada a la libertad de nadie, todo lo contrario."
        },
        "liberte+intensite": {
          "text": "El Pájaro y el Volcán aman la aventura, y cada uno deja sitio al otro. Nadie frena a nadie.",
          "tip": "Quedarse también cuando se apague la emoción de los primeros tiempos. Ahí suele empezar de verdad la historia."
        },
        "harmonie+complicite": {
          "text": "Al Equipo le encanta el movimiento, el Oasis prefiere la paz y la tranquilidad. Las salidas y las invitaciones pueden convertirse rápido en un problema.",
          "tip": "Cada uno conserva sus salidas o sus noches tranquilas, sin hacer sentir culpable al otro. Hay sitio para los 2 ritmos."
        },
        "harmonie+intensite": {
          "text": "El Oasis busca paz, el Volcán necesita chispa. Lo que despierta a uno puede cansar al otro.",
          "tip": "Poner la pasión en el deseo y en las cosas nuevas, nunca en las discusiones. La pasión también puede ser dulce."
        },
        "complicite+intensite": {
          "text": "El Equipo y el Volcán quieren una historia en la que pasen cosas. Ideas, ataques de risa, ganas de atreverse.",
          "tip": "Reservar también tiempo para recuperar el aliento y hablar en serio. No hace falta hacer ruido para ser felices juntos."
        }
      }
    },
    "ui": {
      "eyebrowNamed": "{prenom}, tu perfil amoroso (hipótesis de trabajo) · 1 combinación entre 42",
      "eyebrowAnon": "Tu perfil amoroso (hipótesis de trabajo) · 1 combinación entre 42",
      "domSec": "Dominante: {domName} ({domKey}) · Secundaria: {secName} ({secKey})",
      "alliageLab": "Tu mezcla",
      "pillDom": "Dominante",
      "pillSec": "Secundaria",
      "sentences": {
        "s1Anon": "Tu perfil amoroso es {profil}: {s1}, y necesitas {secNeed}.",
        "s1": "{prenom}, tu perfil amoroso es {profil}: {s1}, y necesitas {secNeed}.",
        "s2": "Floreces cuando {bloomShort}, y te apagas cuando {fadeShort}.",
        "s3": "Bajo mucho estrés, tu trampa es {trapName}: {trapShort}. Para salir de ella, {exitShort}."
      },
      "barsLab": "Tus 7 necesidades amorosas",
      "netLine": "Tu necesidad dominante destaca con mucha claridad.",
      "mixedLine": "Tus 2 necesidades principales pesan casi lo mismo: también puedes reconocerte en el perfil {inverse}.",
      "whyLab": "¿Por qué este perfil?",
      "whyIntro": "Lo que más ha pesado hacia {domName}:",
      "whyNote": "Cada respuesta da puntos a 1 o 2 necesidades. Tu perfil reúne las 2 necesidades con más puntos. Es una hipótesis: contrástala con lo que has vivido de verdad.",
      "toc": [
        "Dónde floreces",
        "Dónde te apagas",
        "Tu relación",
        "Tu pareja",
        "Frases para decir",
        "Bajo estrés",
        "¿Y ahora qué?"
      ],
      "s1h": "Dónde floreces en el amor",
      "s1top": "Lo que has puesto en primer lugar, «{short}», dice mucho de tu necesidad de {de}.",
      "s1recharge": "En cuanto a energía, {title}: {couple}",
      "s2h": "Dónde te apagas",
      "s2ownH": "Lo que no quieres volver a vivir",
      "s2alarmLab": "Señal de alarma",
      "s2noMore": "Lo que más te cuesta soportar, «{short}», va directo a tu necesidad de {de}.",
      "s2noMoreOwn": "Lo que más te cuesta soportar, «{short}», es lo que no quieres volver a vivir. Tenlo presente: es valioso para elegir bien.",
      "s2test": "La prueba de los 10 años: si una pareja te hiciera pasar por esto, ¿podrías soportarlo durante 10 años, e incluso un poco peor? Si la respuesta es no, escúchala, aunque estés enamorado/a.",
      "s3h": "El tipo de relación que te conviene",
      "s3rows": {
        "rythme": "Ritmo",
        "proximite": "Cercanía",
        "independance": "Independencia",
        "conflits": "Conflicto"
      },
      "s3sec": "Tu necesidad secundaria ({name}) añade una condición: {cond}.",
      "s3instinct": "Tu subtipo ({name}): {couple}",
      "s4h": "La pareja compatible",
      "s4rule": "La regla: parecidos en el fondo, distintos en la forma. Las mismas necesidades y los mismos valores, pero cada uno con su manera de vivirlos.",
      "s4fond": "En el fondo, necesitas a {fond}.",
      "s4fondSec": "Y para tu necesidad secundaria: {fond}.",
      "s4lang": "Para que te sientas querido/a: alguien que {hint}.",
      "s4stress": "Cuando las cosas se calientan: {partner}",
      "s4nourrit": "Lo que lo alimenta",
      "s4proche": "Cercano a ti (fácil, para seguir cuidando)",
      "s4frotte": "Donde puede atascarse (sácalo pronto)",
      "s4critical": "Incompatible (innegociable)",
      "s4profileLine": "Un perfil de {name} ({who})",
      "s4mirrorLab": "Con alguien como tú",
      "s5h": "Frases para decir",
      "s5partner": "A tu pareja",
      "s5date": "En una primera cita",
      "s6h": "Tu trampa clásica bajo estrés, y cómo salir de ella",
      "s6trigger": "En tu caso, se dispara sobre todo cuando {trigger}.",
      "s6early": "Antes de llegar a ese punto, con estrés moderado, sueles {modere}: es la primera señal. Ahí es cuando conviene actuar.",
      "s6calm": "Lo que necesitas de verdad en ese momento: {calm}.",
      "s6exitLab": "Para salir de ella, en 3 pasos",
      "s6also": "También has marcado: {others}.",
      "why": {
        "nourrit": "«{short}», en el puesto {rank} de lo que te alimenta",
        "vide": "«{short}», en lo que te vacía",
        "ressource": "tu forma de recargarte, «{short}»",
        "langages": "{lower}, tu lenguaje del amor número {rank}",
        "ennea": "tu pista del eneagrama (una hipótesis, no un veredicto)",
        "valeurs": "{short}, tu valor número {rank}",
        "instinct": "tu subtipo {name}",
        "stress": "tu forma de reaccionar bajo estrés"
      }
    }
  },
  "ennea": {
    "types": {
      "t1": {
        "name": "el Perfeccionista",
        "couple": "En pareja, aportas fiabilidad y seriedad, y necesitas a alguien que respete tus esfuerzos sin hacerte sentir corregido/a todo el tiempo.",
        "piege": "querer corregir a la otra persona en vez de aceptarla tal como es"
      },
      "t2": {
        "name": "el Altruista",
        "couple": "En pareja, aportas calidez y atención, y necesitas a alguien que también cuide de ti, sin que tengas que pedirlo.",
        "piege": "olvidarte de ti para hacerte indispensable"
      },
      "t3": {
        "name": "el Triunfador",
        "couple": "En pareja, aportas impulso y proyectos, y necesitas a alguien que te quiera por quien eres, no por lo que logras.",
        "piege": "poner tu imagen o tu trabajo por delante de tu relación"
      },
      "t4": {
        "name": "el Romántico",
        "couple": "En pareja, aportas profundidad y verdad, y necesitas a alguien que acoja tus emociones sin asustarse de ellas.",
        "piege": "idealizar lo que falta y dejar de ver lo que hay"
      },
      "t5": {
        "name": "el Observador",
        "couple": "En pareja, aportas calma, lealtad y una mirada justa, y necesitas a alguien que respete tu necesidad de estar a solas a veces.",
        "piege": "retirarte en vez de compartir lo que sientes"
      },
      "t6": {
        "name": "el Leal",
        "couple": "En pareja, aportas compromiso y fidelidad, y necesitas a alguien estable que te tranquilice con sus actos.",
        "piege": "poner a prueba a la otra persona o dudar de ella incluso cuando todo va bien"
      },
      "t7": {
        "name": "el Entusiasta",
        "couple": "En pareja, aportas alegría y aventura, y necesitas a alguien curioso que no viva tu necesidad de libertad como una amenaza.",
        "piege": "huir de la incomodidad en vez de atravesar los momentos difíciles"
      },
      "t8": {
        "name": "el Protector",
        "couple": "En pareja, aportas fuerza y protección, y necesitas a alguien sólido que se atreva a plantarte cara, con dulzura.",
        "piege": "ocupar demasiado espacio, y creer que hablar fuerte es tener razón"
      },
      "t9": {
        "name": "el Mediador",
        "couple": "En pareja, aportas dulzura y calma, y necesitas a alguien que se interese de verdad por lo que tú quieres.",
        "piege": "diluirte en segundo plano para evitar el conflicto"
      }
    },
    "disclaimer": "El eneagrama es una hipótesis de partida, no una etiqueta. 3 pantallas no bastan para encontrar tu tipo con seguridad: toma este resultado como una pista que explorar, idealmente con alguien que conozca bien el eneagrama.",
    "credit": "El eneagrama describe 9 motivaciones profundas y 3 instintos (conservación, social, uno a uno).",
    "stressHint": "Tu reacción bajo mucho estrés apunta en la misma dirección que tu pista principal.",
    "confidenceOne": "Es tu pista principal, que conviene confirmar con el tiempo.",
    "confidenceMany": "Dudas entre {typeLabel} y {altLabel}: mantén abiertas las 2 pistas."
  },
  "instincts": {
    "sp": {
      "name": "conservación",
      "desc": "Piensas primero en la comodidad, la seguridad material y el bienestar de cada día.",
      "couple": "En pareja, construyes un nido, con un hogar, hábitos y una seguridad concreta."
    },
    "so": {
      "name": "social",
      "desc": "Piensas primero en el grupo: formar parte de un círculo, encontrar tu sitio entre los demás.",
      "couple": "En pareja, necesitas que tu historia de pareja forme parte de una vida más amplia, con amigos, familia y gente a tu alrededor."
    },
    "sx": {
      "name": "uno a uno",
      "desc": "Buscas primero un vínculo fuerte con 1 persona: la atracción, la chispa.",
      "couple": "En pareja, buscas atracción, cercanía e intercambios intensos, solo los 2."
    }
  },
  "instinctPairs": {
    "sp-sp": "2 parejas de «conservación»: un hogar estable y tranquilizador. El riesgo: que la rutina y la comodidad sustituyan al deseo. Conviene planificar cosas nuevas juntos.",
    "so-so": "2 parejas «sociales»: una vida rica en amistades y proyectos compartidos. El riesgo: no tener ya tiempo solo para los 2. Conviene proteger los momentos íntimos.",
    "sx-sx": "2 parejas de «uno a uno»: un vínculo intenso, casi magnético. El riesgo: la montaña rusa y los celos. Conviene conservar algunos puntos de referencia estables.",
    "sp-so": "Conservación y social: uno sueña con un nido, el otro con el gran mundo. Bien vivido, es un bonito equilibrio entre el hogar y la apertura. Mal vivido, uno se siente solo en casa y el otro encerrado.",
    "sp-sx": "Conservación y uno a uno: uno busca seguridad, el otro intensidad. Juntos pueden combinar estabilidad y pasión, siempre que ninguno vea al otro como «demasiado tranquilo» o «demasiado intenso».",
    "so-sx": "Social y uno a uno: uno florece en grupo, el otro quiere exclusividad. El tema delicado suelen ser las tardes con amigos. Ayuda un acuerdo sencillo, por ejemplo una noche de salida con otras personas y luego una tarde solo para los 2."
  },
  "values": {
    "honnetete": {
      "short": "la honestidad",
      "opposite": "Una pareja que miente o esconde cosas importantes."
    },
    "fidelite": {
      "short": "la fidelidad",
      "opposite": "Una pareja que no quiere exclusividad."
    },
    "respect": {
      "short": "el respeto",
      "opposite": "Una pareja despectiva, incluso «de broma»."
    },
    "famille": {
      "short": "la familia",
      "opposite": "Una pareja que mantiene a distancia a los seres queridos."
    },
    "enfants": {
      "short": "querer tener hijos",
      "opposite": "Una pareja que no quiere hijos."
    },
    "sans_enfants": {
      "short": "una vida sin hijos",
      "opposite": "Una pareja que quiere hijos sí o sí."
    },
    "liberte": {
      "short": "la libertad",
      "opposite": "Una pareja que quiere compartirlo todo, todo el tiempo."
    },
    "ambition": {
      "short": "la ambición",
      "opposite": "Una pareja que frena tus proyectos."
    },
    "simplicite": {
      "short": "la sencillez",
      "opposite": "Una pareja que siempre persigue más."
    },
    "aventure": {
      "short": "la aventura",
      "opposite": "Una pareja que se niega a moverse."
    },
    "humour": {
      "short": "el humor",
      "opposite": "Una pareja que se toma todo en serio."
    },
    "culture": {
      "short": "la cultura y la curiosidad",
      "opposite": "Una pareja que no tiene ganas de descubrir nada."
    },
    "sante": {
      "short": "la salud y el deporte",
      "opposite": "Una pareja que se descuida por completo."
    },
    "solidarite": {
      "short": "la solidaridad",
      "opposite": "Una pareja a la que no le importan los demás."
    },
    "creativite": {
      "short": "la creatividad",
      "opposite": "Una pareja que encuentra inútil tu creatividad."
    }
  },
  "stress": {
    "modere": {
      "D": {
        "short": "tomar las riendas",
        "text": "Bajo presión, pasas a la acción y decides. Es una fortaleza, siempre que la otra persona tenga tiempo de seguirte.",
        "partner": "Una pareja que se atreve a decirte «espera» sin echarse atrás."
      },
      "I": {
        "short": "aligerar el ambiente",
        "text": "Relajas el ambiente hablando y bromeando. Cuidado con no perder de vista lo que importa.",
        "partner": "Una pareja que se ríe contigo y luego vuelve con dulzura al tema."
      },
      "S": {
        "short": "mantener un perfil bajo",
        "text": "Proteges la paz y esperas a que pase la tormenta. El riesgo: dejar que los problemas se acumulen.",
        "partner": "Una pareja paciente que te invita a hablar sin meterte prisa."
      },
      "C": {
        "short": "analizar",
        "text": "Buscas hechos y lógica. El riesgo: tener razón, pero no ver la emoción de la otra persona.",
        "partner": "Una pareja que escucha tus argumentos, y a quien dejas espacio para sus emociones."
      }
    },
    "fort": {
      "fight": {
        "short": "contraatacar",
        "text": "Bajo mucho estrés, pasas al modo lucha: suben las voces y quieres la última palabra.",
        "tip": "Di «Me tomo una pausa de 20 minutos y vuelvo», y vuelve de verdad."
      },
      "flight": {
        "short": "huir",
        "text": "Bajo mucho estrés, te escapas: sales, te ocupas, evitas el tema.",
        "tip": "Fija una hora concreta para retomar el tema, para que tu pausa no se convierta en una huida."
      },
      "freeze": {
        "short": "quedarte bloqueado/a",
        "text": "Bajo mucho estrés, te bloqueas: ni palabras ni ideas. No es indiferencia.",
        "tip": "Prepara una frase sencilla: «Estoy bloqueado/a, dame un momento, vuelvo contigo.»"
      },
      "fawn": {
        "short": "ceder para mantener la paz",
        "text": "Bajo mucho estrés, cedes para que acabe, incluso cuando no estás de acuerdo.",
        "tip": "Cambia el «sí» automático por: «No lo tengo claro, lo pienso y te digo.»"
      }
    }
  },
  "brakes": {
    "rejet": {
      "short": "el miedo al rechazo",
      "antidote": "Empieza poco a poco: una petición sencilla, una respuesta sencilla. Un no a una petición no es un no a ti."
    },
    "blesser": {
      "short": "el miedo a herir al otro",
      "antidote": "Decir con dulzura lo que sientes no es herir. Callar hace más daño a la larga."
    },
    "moment": {
      "short": "esperar el momento adecuado",
      "antidote": "Elige un día de esta semana y anótalo ahora. El momento adecuado es el que decides tú."
    },
    "espoir": {
      "short": "esperar que el otro cambie",
      "antidote": "Mira lo que hace hoy la otra persona, no lo que podría llegar a ser. Confía en los hechos."
    },
    "habitude": {
      "short": "la comodidad de la costumbre",
      "antidote": "Anota lo que esta situación te cuesta de verdad, en energía y en alegría. La comodidad tiene un precio."
    },
    "seul": {
      "short": "el miedo a estar solo/a",
      "antidote": "Haz una lista de lo que te alimenta fuera de la relación. Cuanto más larga sea, más libremente eliges."
    },
    "flou": {
      "short": "no saber lo que quieres",
      "antidote": "Relee tus 3 innegociables: cuando dudas, te guían."
    },
    "regard": {
      "short": "lo que piensen los demás",
      "antidote": "Eres tú quien vive tu relación, cada día. Pregúntate: «¿Qué elegiría si nadie se enterara?»"
    },
    "contraintes": {
      "short": "las limitaciones prácticas",
      "antidote": "Primero decides, luego te organizas, paso a paso. No hace falta resolverlo todo antes de elegir."
    },
    "energie": {
      "short": "la falta de tiempo o de energía",
      "antidote": "Basta una acción de 5 minutos para avanzar. No hace falta esperar a tener energía."
    },
    "parfait": {
      "short": "esperar a la persona perfecta",
      "antidote": "Busca a la persona adecuada para ti, no a la persona perfecta. Tus innegociables bastan para elegir."
    },
    "passe": {
      "short": "las heridas del pasado",
      "antidote": "Tu pasado explica tu prudencia; no decide tu futuro. Buscar apoyo puede ayudarte."
    }
  },
  "actions": {
    "a5": "Mañana, dedica 5 minutos a tu próximo paso. Hazlo antes del mediodía si puedes.",
    "voix": "Di tu compromiso en voz alta, ahora. Lo que decimos en voz alta lo cumplimos más a menudo.",
    "rappel": "Tu recordatorio: mañana a las {heure}."
  },
  "nextSteps": [
    {
      "label": "Decir con claridad lo que necesito",
      "prefix": "Esta semana digo con claridad lo que necesito."
    },
    {
      "label": "Proponer una tarde solo para los 2",
      "prefix": "Esta semana propongo una tarde solo para los 2."
    },
    {
      "label": "Hacer la pregunta que importa (hijos, proyectos, dónde vivir)",
      "prefix": "Esta semana hago la pregunta que me importa."
    },
    {
      "label": "Poner un límite claro",
      "prefix": "Esta semana pongo un límite claro."
    },
    {
      "label": "Hacer balance de mi relación con la Brújula",
      "prefix": "Esta semana hago balance de mi relación con la Brújula."
    },
    {
      "label": "Atreverme a decir «te quiero»",
      "prefix": "Esta semana me atrevo a decir «te quiero»."
    },
    {
      "label": "Tomarme unos días para coger perspectiva",
      "prefix": "Esta semana me tomo unos días para coger perspectiva."
    },
    {
      "label": "Buscar apoyo",
      "prefix": "Esta semana reservo un momento para buscar apoyo."
    }
  ],
  "moments": [
    {
      "label": "Esta noche"
    },
    {
      "label": "Mañana"
    },
    {
      "label": "Este fin de semana"
    },
    {
      "label": "Esta semana"
    }
  ],
  "safety": {
    "present": {
      "title": "Antes que nada"
    },
    "doute": {
      "title": "Una pregunta que vale la pena hacerse"
    }
  },
  "pastAbuseNote": "Has dicho que viviste miedo o menosprecio en una relación pasada. Lo que viviste no fue culpa tuya. Si todavía te pesa, hablar con un/a profesional puede ayudarte de verdad a no volver a vivirlo.",
  "riskGrid": [
    {
      "level": "Bajo",
      "label": "Diferencias de forma, manejables",
      "text": "El orden, la puntualidad, los hábitos, los gustos. Piden humor y algunos acuerdos, e incluso pueden complementarte."
    },
    {
      "level": "Alto",
      "label": "Roces recurrentes, que hay que negociar",
      "text": "Temas importantes para ti en los que la distancia va a reaparecer. Se pueden negociar, siempre que hables de ellos pronto y encuentres un acuerdo que cada uno pueda cumplir."
    },
    {
      "level": "Crítico",
      "label": "Innegociable",
      "text": "Tener hijos o no, estilos de vida incompatibles, una necesidad de libertad frente a una necesidad de cercanía extrema, valores de fondo opuestos. Aquí, uno de los 2 acabaría renunciando a una parte esencial de sí mismo. El amor no basta para salvar esa distancia."
    },
    {
      "level": "Fuera de escala",
      "label": "Señales de alarma",
      "text": "Desprecio, humillación, control, amenazas, violencia física, psicológica o económica, y cualquier daño al cuerpo. No son incompatibilidades: son señales de peligro, que piden la ayuda de un/a profesional."
    }
  ],
  "universal": [
    "Ser respetado/a, en las palabras y en los actos",
    "Poder decir que no sin tener miedo",
    "Honestidad en los temas que comprometen a la pareja",
    "Ninguna forma de violencia, amenaza o control"
  ],
  "universalCritical": "Una pareja que muestra desprecio, controla, amenaza o es violenta. No es una incompatibilidad: es una señal de alarma, que pide la ayuda de un/a profesional.",
  "keyMessages": [
    "Enamorarse y sentir atracción no bastan. Dicen «me gustas», no «podemos ser felices juntos».",
    "Se puede estar enamorado/a y ser infeliz. No es una paradoja: es la señal de que te falta algo esencial.",
    "No se puede cambiar a nadie. Pedirle que cambie es pedirle que deje de ser quien es.",
    "La pregunta adecuada: ¿puedes vivir con sus defectos a largo plazo? Si es así, no tocan lo esencial para ti.",
    "Parecidos en el fondo, distintos en la forma: los mismos valores pero talentos diferentes suelen ser la receta de una relación duradera."
  ],
  "sentences": {
    "need": "{prenom}, lo que de verdad te alimenta: {n1}, {n2} y {n3}. Te sientes querido/a sobre todo a través de {lang1} y {lang2}, y te recargas {rechargeShort}.",
    "danger": "Lo que te pone en riesgo: {v1} y {v2}, una relación que no respeta {val1}, y tu freno: {brake1}.",
    "ennea": "Tu pista del eneagrama: tipo {n} ({name}), subtipo {instinct}. Con mucho estrés, tiendes a {stress}."
  },
  "shareTemplate": [
    null,
    null,
    null,
    "Haz el test: {quizUrl}"
  ],
  "exportTemplate": [
    null,
    null,
    null,
    null,
    null,
    null,
    "Llamada de descubrimiento gratuita con Pierre Sarazin: {calendly}"
  ],
  "needs": {
    "securite": {
      "name": "Seguridad y fiabilidad",
      "title": "Corazón Ancla",
      "desc": "Necesitas saber a qué atenerte. Una pareja que cumple su palabra, que aparece cuando dice que va a aparecer, alguien con quien construir un futuro, sin montaña rusa. No es falta de audacia: es donde por fin puedes relajarte.",
      "partner": "Constancia, promesas cumplidas, planes claros. Alguien que te tranquiliza con hechos, no solo con palabras.",
      "anti": "Nunca sabes a qué atenerte. Las promesas rotas, los cambios de humor impredecibles y un futuro vago te desgastan poco a poco. En ese contexto te vuelves vigilante y ansioso/a, y pierdes la ligereza.",
      "lower": "la seguridad y la fiabilidad",
      "danger": "una relación en la que nunca sabes a qué atenerte"
    },
    "liberte": {
      "name": "Libertad y espacio",
      "title": "Corazón Libre",
      "desc": "Necesitas seguir siendo tú en la relación: tus amistades, tus proyectos, tu tiempo a solas. No es falta de amor. Al contrario: respirando es como vuelves hacia la otra persona, con ganas de verla.",
      "partner": "Alguien que confía en ti, que tiene su propia vida y que te deja irte unas horas sin sentirse abandonado/a.",
      "anti": "Tienes que justificarlo todo. Las preguntas sobre tu horario, los celos y los reproches cuando ves a tus amigos te apagan. En ese contexto te sientes encorsetado/a y acabas huyendo, con la cabeza o de verdad.",
      "lower": "la libertad y el espacio",
      "danger": "una relación en la que tienes que justificarlo todo"
    },
    "reconnaissance": {
      "name": "Reconocimiento y admiración",
      "title": "Corazón Radiante",
      "desc": "Necesitas sentirte elegido/a, admirado/a, valorado/a. No es vanidad: es la señal de que la otra persona te ve de verdad, y ve lo que aportas.",
      "partner": "Alguien que está orgulloso/a de ti, que sabe decir «gracias» y «bien hecho», incluso delante de otros.",
      "anti": "Tus esfuerzos pasan desapercibidos y se dan por sentados. La burla, la comparación y la falta de gratitud atenúan tu luz. En ese contexto dudas de ti y te excedes para que por fin te vean.",
      "lower": "el reconocimiento y la admiración",
      "danger": "una relación en la que tus esfuerzos pasan desapercibidos"
    },
    "profondeur": {
      "name": "Profundidad e intimidad emocional",
      "title": "Corazón Profundo",
      "desc": "Necesitas poder decirlo todo y que te entiendan, sentimientos incluidos. Las conversaciones de verdad, la vulnerabilidad compartida y la sensación de que te conocen a fondo te unen a la otra persona más que cualquier otra cosa.",
      "partner": "Alguien que escucha, a quien le importa lo que sientes y que se atreve también a hablar de sí.",
      "anti": "Las conversaciones se quedan en la superficie y los sentimientos no se dicen. Una pareja que cambia de tema, esquiva las charlas importantes o se burla de tu sensibilidad te aísla. En ese contexto te sientes solo/a incluso en pareja.",
      "lower": "la profundidad y la intimidad emocional",
      "danger": "una relación que se queda en la superficie"
    },
    "legerete": {
      "name": "Juego y ligereza",
      "title": "Corazón Juguetón",
      "desc": "Necesitas reír, jugar, descubrir. Para ti, una relación es una aventura, un vínculo de diversión, un patio de recreo. Sin ligereza, hasta una historia bonita acaba pareciendo gris.",
      "partner": "Alguien con sentido del humor, a quien le encanta probar cosas nuevas y que no se toma todo en serio.",
      "anti": "Todo se vuelve pesado, serio, rutinario. Los reproches constantes, la falta de planes, las mismas tardes una y otra vez te apagan. En ese contexto te aburres y buscas la chispa en otra parte, a veces sin querer.",
      "lower": "el juego y la ligereza",
      "danger": "una relación pesada y rutinaria"
    },
    "harmonie": {
      "name": "Dulzura y armonía",
      "title": "Corazón Sereno",
      "desc": "Necesitas un día a día dulce y en paz. No se trata de evitar los desacuerdos: se trata de vivirlos sin gritos, sin pullas y sin tensión que se queda flotando. La paz es el terreno en el que creces.",
      "partner": "Alguien tranquilo, amable con las palabras, que sabe discutir sin herir y luego reconciliarse.",
      "anti": "Las pullas y las voces altas se vuelven normales. Los conflictos que se enquistan, la ironía y la tensión que dura días te desgastan. En ese contexto te cierras y evitas todos los temas delicados, lo que acaba ensanchando la distancia.",
      "lower": "la dulzura y la armonía",
      "danger": "una relación llena de pullas y de tensión"
    }
  },
  "recharge": {
    "solitaire": {
      "title": "Recargar a solas",
      "short": "en calma, a solas",
      "couple": "Necesitas tiempo a solas para volver hacia la otra persona con ganas de verdad. No es rechazo, es tu combustible.",
      "fit": "Una pareja que tiene su propia vida y no vive tu tiempo a solas como un abandono.",
      "risk": "Una pareja que te necesita cada tarde, o que llena la agenda sin preguntarte."
    },
    "relationnel": {
      "title": "Recargar juntos, con dulzura",
      "short": "con momentos dulces en compañía",
      "couple": "Recuperas fuerzas solo con estar con la otra persona, relajado/a, sin nada previsto.",
      "fit": "Una pareja disponible para tardes sencillas, con el teléfono guardado.",
      "risk": "Una pareja que siempre está en otra parte, absorbida por el trabajo o las salidas nocturnas."
    },
    "sensoriel": {
      "title": "Recargar con el cuerpo y lo concreto",
      "short": "con el cuerpo, la naturaleza y las cosas concretas",
      "couple": "Te recargas haciendo cosas, moviéndote, cocinando, caminando o creando con las manos.",
      "fit": "Una pareja con ganas de hacer cosas contigo, o que te deja hacerlas por tu cuenta.",
      "risk": "Una pareja pegada a las pantallas, que encuentra inútiles tus actividades."
    },
    "evasion": {
      "title": "Recargar evadiéndose",
      "short": "evadiéndote entre ideas e historias",
      "couple": "Te recargas explorando, ya sea leyendo, descubriendo, soñando o hablando de ideas.",
      "fit": "Una pareja curiosa con quien compartir un descubrimiento, o que respeta tu burbuja.",
      "risk": "Una pareja que se burla de tus intereses o que no deja de pinchar tu burbuja."
    },
    "elan": {
      "title": "Recargar con gente",
      "short": "con gente y movimiento",
      "couple": "Te recargas viendo gente, con salidas, amigos y tardes animadas.",
      "fit": "Una pareja a la que le encanta salir, o que te deja salir sin celos.",
      "risk": "Una pareja muy casera que vive tus salidas nocturnas como una traición."
    }
  },
  "languages": {
    "paroles": {
      "name": "Palabras de afirmación",
      "lower": "las palabras de afirmación",
      "recv": "Las palabras importan enormemente para ti. Un cumplido sincero, un «te quiero» en el momento justo, un mensaje que reconoce lo que haces pueden llenarte durante días. En cambio, una crítica seca o un silencio largo pueden herirte más de lo que la otra persona imagina.",
      "tips": [
        "Dile claramente a tu pareja: «Lo que más me llega es que me digas lo que aprecias de mí.»",
        "Fíjate en las palabras amables cuando llegan y da las gracias: a la gente le dan ganas de repetirlo cuando se recibe bien.",
        "Si las críticas son frecuentes, pide que se refieran a un hecho concreto, nunca a ti como persona."
      ],
      "partnerHint": "te dice lo que siente y lo que le gusta de ti"
    },
    "moments": {
      "name": "Tiempo de calidad",
      "lower": "el tiempo de calidad",
      "recv": "Para ti, querer es estar. No solo en la misma habitación: estar de verdad, sin pantallas, escuchando. Una tarde en la que la otra persona te escucha de verdad vale más que un regalo bonito. Cuando te dejan siempre en último lugar, acabas dudando de que importes.",
      "tips": [
        "Propón una cita regular, aunque sea corta: 30 minutos al día sin teléfonos, o 1 tarde por semana solo para los 2.",
        "Di lo que importa: «Cuando dejas el teléfono para escucharme, me siento querido/a.»",
        "Detecta los momentos compartidos que ya existen (un café, un trayecto) y disfrútalos de verdad."
      ],
      "partnerHint": "te dedica tiempo y te escucha de verdad, sin el teléfono"
    },
    "cadeaux": {
      "name": "Regalos",
      "lower": "los regalos y los detalles",
      "recv": "No es cuestión de precio. Lo que te llega es la prueba de que la otra persona ha pensado en ti: una nota pequeña, algo comprado de camino, un gesto en una fecha que importa. Que se olviden, sobre todo una y otra vez, puede hacerte sentir invisible.",
      "tips": [
        "Explica que no se trata de cosas: «Un detalle que demuestra que has pensado en mí me llega muchísimo.»",
        "Comparte tus fechas importantes y algunas ideas sencillas: la gente no siempre puede adivinar.",
        "Guarda un registro de los gestos que recibes (una caja, una foto): sienta bien volver a verlos los días difíciles."
      ],
      "partnerHint": "piensa en ti y lo demuestra con pequeños detalles"
    },
    "services": {
      "name": "Actos de servicio",
      "lower": "los actos de servicio",
      "recv": "Para ti, el amor se ve en los actos. Cuando la otra persona se ocupa de una tarea sin que se lo pidan, piensa en lo que te pesa y comparte de verdad el día a día, te sientes querido/a. En cambio, las palabras bonitas sin actos suenan huecas.",
      "tips": [
        "Di exactamente lo que te ayudaría: «Si te ocupas de la compra los sábados, me siento apoyado/a.»",
        "Da las gracias por la ayuda y explica que así es como te sientes querido/a.",
        "Si el reparto lleva mucho tiempo desequilibrado, saca el tema con calma, con una lista que lo respalde."
      ],
      "partnerHint": "arrima el hombro y comparte de verdad el día a día"
    },
    "toucher": {
      "name": "Contacto físico",
      "lower": "el contacto físico",
      "recv": "Para ti, el contacto físico es lo primero: una mano cogida, un abrazo, una caricia al pasar. Te tranquiliza y te acerca a la otra persona, y no solo en la cama. Una pareja poco táctil puede hacerte sentir rechazado/a, aunque te quiera.",
      "tips": [
        "Dilo sin más: «Un abrazo por la mañana, tu mano en la mía, eso es lo que más me tranquiliza.»",
        "Propón gestos de cada día, no solo momentos íntimos.",
        "Si la otra persona es poco táctil, busca con ella gestos que también le convengan, sin forzar."
      ],
      "partnerHint": "disfruta de los abrazos y los da sin que haga falta pedirlos"
    }
  },
  "screens": [
    {
      "eyebrow": "Lo que te alimenta, lo que te vacía",
      "title": "Marca al menos 3 cosas que te alimentan y al menos 2 que te vacían.",
      "groups": [
        {
          "title": "Lo que me alimenta en una relación",
          "stepTitle": "Marca al menos 3 cosas que te alimentan.",
          "counter": "Lo que me alimenta",
          "items": [
            {
              "label": "Que me escuchen de verdad",
              "hint": "Deja el teléfono cuando le hablo.",
              "short": "que te escuchen de verdad"
            },
            {
              "label": "Reírnos juntos",
              "hint": "Ataques de risa, bromas que nadie más entiende.",
              "short": "reírse juntos"
            },
            {
              "label": "Poder contar el uno con el otro",
              "hint": "Lo prometido se hace, sin que tenga que insistir.",
              "short": "poder contar el uno con el otro"
            },
            {
              "label": "Conservar mi propio espacio",
              "hint": "Mis tardes, mis amigos, mis proyectos.",
              "short": "conservar tu propio espacio"
            },
            {
              "label": "La ternura de cada día",
              "hint": "Un abrazo al pasar, una mano en la espalda.",
              "short": "la ternura de cada día"
            },
            {
              "label": "Sentirme admirado/a",
              "hint": "Está orgulloso/a de mí y lo dice.",
              "short": "sentirse admirado/a"
            },
            {
              "label": "Construir proyectos juntos",
              "hint": "Un viaje, una casa, un sueño compartido.",
              "short": "construir proyectos juntos"
            },
            {
              "label": "La aventura y las cosas nuevas",
              "hint": "Irse por impulso, probar un sitio nuevo.",
              "short": "la aventura y las cosas nuevas"
            },
            {
              "label": "Un día a día tranquilo y dulce",
              "hint": "Tardes calmadas, sin tensión.",
              "short": "un día a día tranquilo y dulce"
            },
            {
              "label": "Conversaciones profundas",
              "hint": "Hablar de nuestros sentimientos y miedos, hasta bien entrada la noche.",
              "short": "las conversaciones profundas"
            },
            {
              "label": "Nuestros pequeños rituales",
              "hint": "El café de la mañana, la peli del domingo por la noche.",
              "short": "tus pequeños rituales"
            },
            {
              "label": "Que me apoyen en mis proyectos",
              "hint": "Me animan cuando dudo.",
              "short": "que te apoyen"
            },
            {
              "label": "El deseo y la cercanía física",
              "hint": "Sentirme deseado/a, mucho después del principio.",
              "short": "el deseo y la cercanía"
            },
            {
              "label": "Repartir las tareas sin llevar la cuenta",
              "hint": "Cada uno hace su parte, sin tener que negociar.",
              "short": "repartir las tareas"
            }
          ],
          "other": {
            "label": "Otra cosa",
            "placeholder": "Escribe lo que te alimenta"
          }
        },
        {
          "title": "Lo que me vacía en una relación",
          "stepTitle": "Marca al menos 2 cosas que te vacían.",
          "counter": "Lo que me vacía",
          "items": [
            {
              "label": "Tener que justificarlo todo",
              "hint": "¿Dónde estabas? ¿Con quién? ¿Por qué tan tarde?",
              "short": "tener que justificarlo todo"
            },
            {
              "label": "Las críticas constantes",
              "hint": "Nada es nunca lo bastante bueno.",
              "short": "las críticas constantes"
            },
            {
              "label": "Los silencios y los enfados",
              "hint": "Se enfada durante días.",
              "short": "los silencios que se alargan"
            },
            {
              "label": "Los gritos y las pullas",
              "hint": "Las voces suben rápido, comentarios que hieren.",
              "short": "los gritos y las pullas"
            },
            {
              "label": "No saber nunca hacia dónde vamos",
              "hint": "Ni planes, ni compromiso claro.",
              "short": "no saber nunca hacia dónde va la relación"
            },
            {
              "label": "Cargar solo/a con el día a día",
              "hint": "La compra, las citas, la casa: todo recae sobre mí.",
              "short": "cargar solo/a con el día a día"
            },
            {
              "label": "Una pareja ausente, siempre pegada a la pantalla",
              "hint": "Está en cuerpo, pero con la cabeza en otra parte.",
              "short": "una pareja ausente"
            },
            {
              "label": "Los celos",
              "hint": "Cada salida con amigos se convierte en un drama.",
              "short": "los celos"
            },
            {
              "label": "La rutina sin sorpresas",
              "hint": "Las mismas tardes, una y otra vez.",
              "short": "la rutina sin sorpresas"
            },
            {
              "label": "Las promesas rotas",
              "hint": "«Mañana hablamos», y mañana nunca llega.",
              "short": "las promesas rotas"
            },
            {
              "label": "Sentirme agobiado/a",
              "hint": "Hacerlo todo juntos, todo el tiempo.",
              "short": "sentirse agobiado/a"
            },
            {
              "label": "La indiferencia",
              "hint": "Mis esfuerzos pasan desapercibidos.",
              "short": "la indiferencia"
            }
          ],
          "other": {
            "placeholder": "Escribe lo que te vacía",
            "addLabel": "+ Añadir otra línea"
          }
        }
      ],
      "rank": {
        "title": "Pon primero lo que más te importa.",
        "cta": "Ordenar mis elecciones →",
        "divider": {
          "text": "Primero: lo que no quieres volver a vivir."
        }
      }
    },
    {
      "eyebrow": "Lo que te recarga",
      "title": "¿Qué te recarga de verdad? Marca al menos 2 cosas para la tarde y al menos 2 para el fin de semana.",
      "help": "Una relación que te conviene te da energía. No te la quita.",
      "groups": [
        {
          "title": "Por la tarde, para recargar las pilas",
          "counter": "Tarde",
          "items": [
            {
              "label": "Un rato tranquilo a solas",
              "hint": "Nadie me pide nada durante media hora.",
              "short": "un rato tranquilo a solas"
            },
            {
              "label": "Contarle mi día a la otra persona",
              "hint": "En el sofá, sin pantallas.",
              "short": "contarle tu día a la otra persona"
            },
            {
              "label": "Moverme",
              "hint": "Salir a correr, un poco de yoga, un paseo.",
              "short": "moverse"
            },
            {
              "label": "Hacer algo con las manos",
              "hint": "Cocinar, hacer bricolaje, cuidar el jardín.",
              "short": "hacer algo con las manos"
            },
            {
              "label": "Evadirme",
              "hint": "Un libro, una serie, un pódcast.",
              "short": "evadirse"
            },
            {
              "label": "Ver a gente",
              "hint": "Tomar algo con amigos, una llamada que sienta bien.",
              "short": "ver a gente"
            },
            {
              "label": "Un momento tierno",
              "hint": "Un abrazo largo, un masaje.",
              "short": "un momento tierno"
            },
            {
              "label": "No hacer nada, en paz",
              "hint": "Un baño, una vela, mi lista de música.",
              "short": "no hacer nada, en paz"
            }
          ],
          "other": {
            "label": "Otra cosa",
            "placeholder": "Escribe lo que te recarga"
          }
        },
        {
          "title": "El fin de semana, para empezar la semana con energía",
          "counter": "Fin de semana",
          "items": [
            {
              "label": "Nada previsto",
              "hint": "Sin despertador, sin horarios.",
              "short": "nada previsto"
            },
            {
              "label": "Tiempo solo para mí",
              "hint": "Unas horas a solas, sin culpa.",
              "short": "tiempo solo para ti"
            },
            {
              "label": "La naturaleza",
              "hint": "Bosque, mar, montaña, una bocanada de aire fresco.",
              "short": "la naturaleza"
            },
            {
              "label": "El deporte",
              "hint": "Senderismo, bici, un partido.",
              "short": "el deporte"
            },
            {
              "label": "Tiempo de verdad juntos",
              "hint": "Un día solo para los 2, con los teléfonos apagados.",
              "short": "tiempo de verdad juntos"
            },
            {
              "label": "Mis seres queridos",
              "hint": "Una comida en familia, los amigos de toda la vida.",
              "short": "tus seres queridos"
            },
            {
              "label": "Salir, de fiesta",
              "hint": "Un concierto, una cena, bailar.",
              "short": "salir, de fiesta"
            },
            {
              "label": "Descubrir, aprender",
              "hint": "Una exposición, una ciudad, un taller.",
              "short": "descubrir, aprender"
            },
            {
              "label": "Avanzar en un proyecto personal",
              "hint": "Escribir, crear, construir.",
              "short": "avanzar en un proyecto personal"
            }
          ],
          "other": {
            "label": "Otra cosa",
            "placeholder": "Escribe lo que te recarga"
          }
        }
      ]
    },
    {
      "eyebrow": "Tus lenguajes del amor",
      "title": "Para sentirte querido/a, ¿qué es lo más importante?",
      "help": "Pon primero lo que más te dice. Con 2 basta. Puedes tocar las tarjetas en orden, o arrastrarlas.",
      "footnote": "Basado en los 5 lenguajes del amor de Gary Chapman.",
      "items": [
        {
          "label": "Palabras de afirmación",
          "hint": "«Estoy orgulloso/a de ti.»"
        },
        {
          "label": "Tiempo de calidad",
          "hint": "Una tarde solo para los 2, con los teléfonos guardados."
        },
        {
          "label": "Detalles y regalos",
          "hint": "Una nota pequeña, tu dulce favorito."
        },
        {
          "label": "Actos de servicio",
          "hint": "La cena está lista, la tarea hecha."
        },
        {
          "label": "Contacto físico",
          "hint": "Un abrazo, una mano cogida."
        }
      ]
    },
    {
      "eyebrow": "Tu pista del eneagrama",
      "title": "¿Qué frases te suenan a ti? Marca las que te hablen, o sáltate la pregunta.",
      "help": "Es un punto de partida, no un veredicto.",
      "groups": [
        {
          "items": [
            {
              "label": "«Veo enseguida lo que se podría mejorar.»",
              "hint": "Dicen que soy exigente. Lo soy, empezando por mí."
            },
            {
              "label": "«Noto lo que necesitan los demás antes que ellos.»",
              "hint": "Doy mucho, y a veces me olvido de pedir."
            },
            {
              "label": "«Avanzo, lo consigo, y me gusta que se note.»",
              "hint": "Objetivos, eficacia: odio perder el tiempo."
            },
            {
              "label": "«Siento todo con más fuerza que los demás.»",
              "hint": "Necesito que las cosas sean de verdad; lo superficial me aburre."
            },
            {
              "label": "«Necesito comprender, y para eso necesito mi espacio.»",
              "hint": "Pienso antes de hablar, y me recargo a solas."
            },
            {
              "label": "«Pienso en lo que podría salir mal, para proteger a los míos.»",
              "hint": "La confianza se gana, y soy leal una vez que está."
            },
            {
              "label": "«La vida es demasiado corta para aburrirse.»",
              "hint": "Proyectos, viajes, ideas: odio sentirme encerrado/a."
            },
            {
              "label": "«Voy a por todas, digo las cosas a la cara y nadie me controla.»",
              "hint": "Directo/a y protector/a, me cuesta mostrar mis debilidades."
            },
            {
              "label": "«Mientras todos estén bien, yo estoy bien.»",
              "hint": "Me adapto con facilidad, a veces hasta olvidarme de mí."
            }
          ]
        }
      ],
      "rank": {
        "title": "Pon primero la frase que más se parece a ti."
      }
    },
    {
      "eyebrow": "Tus valores",
      "title": "Elige de 3 a 5 valores que te importen más.",
      "groups": [
        {
          "counter": "Valores",
          "items": [
            {
              "label": "Honestidad",
              "hint": "Decirse la verdad, sin esconder lo que importa."
            },
            {
              "label": "Fidelidad",
              "hint": "Exclusividad, lealtad y compromiso."
            },
            {
              "label": "Respeto",
              "hint": "Sin desprecio, sin golpes bajos."
            },
            {
              "label": "Familia",
              "hint": "Tus seres queridos y tus raíces importan mucho."
            },
            {
              "label": "Tener hijos",
              "hint": "Formar una familia, o ampliarla."
            },
            {
              "label": "Una vida sin hijos",
              "hint": "La pareja primero, sin planes de tener hijos."
            },
            {
              "label": "Libertad",
              "hint": "Cada uno conserva su propia vida, sus decisiones y su independencia."
            },
            {
              "label": "Ambición",
              "hint": "Triunfar, exigirse, crecer."
            },
            {
              "label": "Sencillez",
              "hint": "Una vida sencilla, sin perseguir siempre más."
            },
            {
              "label": "Aventura",
              "hint": "Viajar, moverse, cambiar de aires."
            },
            {
              "label": "Humor",
              "hint": "No tomarse demasiado en serio."
            },
            {
              "label": "Cultura y curiosidad",
              "hint": "Libros, exposiciones, debates, aprender siempre."
            },
            {
              "label": "Salud y deporte",
              "hint": "Cuidar el cuerpo."
            },
            {
              "label": "Solidaridad",
              "hint": "Implicarse por los demás."
            },
            {
              "label": "Creatividad",
              "hint": "Crear, inventar, expresarse."
            }
          ],
          "other": {
            "label": "Mi propio valor",
            "placeholder": "Añade tu valor"
          }
        }
      ],
      "rank": {
        "title": "¿Cuáles son tus 3 valores más importantes?",
        "help": "Tócalos en orden, del más importante al menos importante.",
        "cta": "Elegir mi top 3 →"
      }
    },
    {
      "eyebrow": "Tu subtipo en pareja",
      "title": "¿Qué forma de vivir en pareja se parece más a ti?",
      "help": "Toca las tarjetas en orden. La primera pasa a ser tu número 1. Tócala otra vez para quitarla.",
      "items": [
        {
          "label": "Hogar · cuido de nuestro nido",
          "hint": "Un refugio tranquilo, en casa."
        },
        {
          "label": "Social · me encanta ver gente",
          "hint": "Una cena con amigos."
        },
        {
          "label": "Solo los 2 · quiero un vínculo fuerte",
          "hint": "Un rato largo, solo los 2."
        }
      ]
    },
    {
      "eyebrow": "Tú, bajo estrés",
      "title": "¿Cómo reaccionas cuando las cosas se calientan? Marca al menos 1 reacción para cada nivel de estrés.",
      "groups": [
        {
          "title": "Estrés moderado",
          "help": "Un malentendido, un retraso, un comentario que escuece.",
          "counter": "Estrés moderado",
          "items": [
            {
              "label": "Tomo las riendas",
              "hint": "Decido rápido, quiero que las cosas se muevan."
            },
            {
              "label": "Aligero el ambiente",
              "hint": "Hablo, bromeo, intento rebajar la tensión."
            },
            {
              "label": "Mantengo un perfil bajo",
              "hint": "Espero a que pase, evito armar jaleo."
            },
            {
              "label": "Analizo",
              "hint": "Quiero hechos, busco lo que pasó de verdad."
            }
          ]
        },
        {
          "title": "Estrés fuerte",
          "help": "Una gran discusión, el miedo a perder a la otra persona.",
          "counter": "Estrés fuerte",
          "items": [
            {
              "label": "Contraataco",
              "hint": "Subo la voz, quiero la última palabra."
            },
            {
              "label": "Huyo",
              "hint": "Doy un portazo, salgo, me ocupo en otra cosa."
            },
            {
              "label": "Me bloqueo",
              "hint": "Ya no puedo hablar ni pensar."
            },
            {
              "label": "Cedo para mantener la paz",
              "hint": "Digo que sí, pido perdón, aunque no esté de acuerdo."
            }
          ]
        }
      ]
    },
    {
      "eyebrow": "Lo que te frena",
      "title": "¿Qué te frena o te incomoda en el amor?",
      "help": "Lo que te bloquea, lo que te molesta o lo que te quita ganas de avanzar con alguien. Marca lo que te hable.",
      "groups": [
        {
          "items": [
            {
              "label": "El miedo al rechazo",
              "hint": "¿Y si dijera que no?"
            },
            {
              "label": "El miedo a herir al otro",
              "hint": "Prefiero callarme antes que causar dolor."
            },
            {
              "label": "Esperar el momento adecuado",
              "hint": "Después de las vacaciones, después de su cumpleaños..."
            },
            {
              "label": "Esperar que el otro cambie",
              "hint": "Ya se arreglará."
            },
            {
              "label": "La comodidad de la costumbre",
              "hint": "No es perfecto, pero es conocido."
            },
            {
              "label": "El miedo a estar solo/a",
              "hint": "¿Mejor mal acompañado/a que solo/a?"
            },
            {
              "label": "No saber lo que quiero",
              "hint": "Un día sí, otro día no."
            },
            {
              "label": "Lo que piensen los demás",
              "hint": "La familia, los amigos, lo que dirán."
            },
            {
              "label": "Las limitaciones prácticas",
              "hint": "Vivienda, dinero, hijos, logística."
            },
            {
              "label": "La falta de tiempo o de energía",
              "hint": "Por la tarde, ya no me quedan fuerzas."
            },
            {
              "label": "Esperar a la persona perfecta",
              "hint": "Nadie es nunca lo bastante bueno."
            },
            {
              "label": "Las heridas del pasado",
              "hint": "Me han hecho daño antes, así que me protejo."
            }
          ],
          "other": {
            "label": "Otra cosa",
            "placeholder": "Escribe lo que te frena"
          }
        }
      ]
    }
  ],
  "engine": {
    "needWords": {
      "reconnaissance": "reconocimiento",
      "profondeur": "profundidad",
      "harmonie": "dulzura",
      "securite": "seguridad",
      "liberte": "libertad",
      "legerete": "ligereza"
    },
    "and": " y ",
    "or": " o ",
    "you": "Tú",
    "partnerWho": "Una pareja que {hint}",
    "noteNourrit": "Lo que te alimenta: {list}.",
    "noteVide": "Lo que te vacía: {list}.",
    "noteValeurs": "Tus valores, en orden: {list}.",
    "noteDirection": "Tus puntos de referencia del proyecto de vida: {list}.",
    "noteDefauts": "Lo que te cuesta vivir en la otra persona: {list}.",
    "noteFrictions": "Con estrés fuerte, sueles {fort}. Con estrés moderado, sueles {modere}. Fíjate en si las discusiones acaban en un acuerdo de verdad.",
    "noteEnergie": "Te recargas {recharge}.",
    "noteLangage": "Te sientes querido/a sobre todo con {l1}, y luego con {l2}.",
    "noteSousType": "Tu subtipo dominante: {name}.",
    "noteNonNeg": "Tus innegociables según el test: {list}.",
    "noteNoMore": "Lo que no quieres volver a vivir: {short}.",
    "critBesoin": "Mi necesidad de {word} está cubierta ({title})",
    "critNourrit": "Lo que me alimenta: {short}",
    "critProjet": "Proyecto de vida en común: {short}",
    "critPartage": "Compartimos {short}",
    "critEviter": "A evitar: {short}",
    "exportHead": "Mi perfil amoroso (hipótesis de trabajo): {name}.",
    "secBloom": "Tu necesidad secundaria ({name}) cuenta mucho: {bloom}.",
    "secFade": "Y como {lower} también te importa, {fade}.",
    "stressGlance": "moderado → {modere} · fuerte → {fort}",
    "moveAria": "Mover «{label}»",
    "removeAria": "Quitar «{label}» del orden",
    "toc": "Índice",
    "ctxGood": "Tus contextos fértiles",
    "ctxBad": "Tus contextos tóxicos",
    "nameOrder": "noun-adj",
    "semi": "; ",
    "dp": ": ",
    "colon": ":",
    "quote": "«{t}»"
  },
  "ui": {
    "pageTitle": "Descubre tu perfil amoroso",
    "brand": "Magic Humans · Test del Amor",
    "footer": "Magic Humans · Este test ofrece pistas para pensar, no un diagnóstico. Tus respuestas se quedan en este dispositivo para que puedas retomar donde lo dejaste. No se envía nada.",
    "footerSalle": "Magic Humans · Este test ofrece pistas para pensar, no un diagnóstico. Tus respuestas se quedan en este dispositivo para que puedas retomar donde lo dejaste. Solo se cuenta tu perfil anónimo para la foto de la sala.",
    "intro": {
      "eyebrow": "Cumbre del Amor · Gratis · 8 preguntas · unos 8 minutos",
      "h1": "Descubre tu <em>perfil amoroso</em>",
      "lead": "El flechazo no basta para construir una pareja feliz. En 8 minutos, haz balance de lo que te alimenta, de lo que te vacía y del tipo de pareja que de verdad te conviene.",
      "bullets": [
        "Lo que te alimenta en pareja, y lo que te vacía",
        "Lo que te recarga, para dejar de agotarte en una relación",
        "Tus lenguajes del amor, tus valores y tu pista del eneagrama",
        "Cómo reaccionas cuando las cosas se calientan, y lo que te frena"
      ],
      "howto": "Responde sin darle demasiadas vueltas: la primera idea suele ser la buena. No hay respuestas buenas ni malas.",
      "nameLabel": "Tu nombre",
      "nameHelp": "Solo sirve para personalizar tus resultados.",
      "start": "Empezar →"
    },
    "quiz": {
      "progress": "Pregunta {i} de {n}",
      "rankSuffix": " · Orden",
      "counter": "{label}: {x}/{min} como mínimo",
      "counterBare": "{x}/{min} como mínimo",
      "counterMax": "{label}: {x}/{max}, mínimo {min}",
      "maxValues": "5 valores como máximo. Quita uno para cambiarlo.",
      "topCounter": "Tu top 3: {x}/{n}",
      "topSuffix": " · Tu top 3",
      "untap": "Quitado de tu top 3: «{label}».",
      "rankHelp": "Arrastra las tarjetas, o usa las flechas ↑ ↓.",
      "rankTapHelp": "Pon primero la que más te dice. Toca las tarjetas en orden, o arrástralas.",
      "rankCounter": "Ordenadas: {x}/{min} como mínimo",
      "rankEmpty": "Toca una tarjeta de abajo para colocarla.",
      "rankZone": "Tu orden",
      "rankOrder": "Tu orden: {x}/{n}",
      "rankReset": "Empezar de nuevo",
      "rankUndo": "Quitado de tu orden: «{label}».",
      "rankCleared": "Orden borrado.",
      "up": "Subir",
      "down": "Bajar",
      "remove": "Quitar del orden",
      "live": "{label}, posición {pos} de {total}.",
      "grabbed": "Elemento cogido: {label}. Flechas para mover, Espacio para soltar, Escape para cancelar.",
      "placed": "Colocado en la posición {pos} de {total}: «{label}».",
      "unchecked": "Desmarcado: «{label}».",
      "addOther": "+ Añadir otro valor",
      "removeLine": "Quitar",
      "next": "Siguiente →",
      "prev": "← Atrás",
      "skip": "Saltar",
      "finish": "Ver mis resultados →",
      "more": "Elige {k} más para continuar.",
      "moreDown": "Marca {k} más para «{label}», más abajo ↓",
      "idea": "Idea: {antidote}",
      "timeAsk": "¿A qué hora mañana?",
      "engagementCounter": "Escribe tu compromiso y elige un momento",
      "resumeNotice": "Retomamos donde lo dejaste",
      "resumeRestart": "Empezar de nuevo",
      "engagementLabel": "Mi compromiso",
      "shareBlock": "Compártelo con alguien y elige un momento.",
      "whoLabel": "¿Con quién?",
      "whenLabel": "¿Cuándo?"
    },
    "results": {
      "headerNamed": "{prenom}, este es tu perfil amoroso",
      "headerAnon": "Este es tu perfil amoroso",
      "sentencesH": "Tu perfil en 3 frases",
      "glanceH": "Tus clasificaciones de un vistazo",
      "detailsSummary": "Ver mi perfil detallado",
      "copyShortBtn": "Copiar mis 3 frases",
      "shareBtn": "Compartir",
      "stickyCta": "Habla con Pierre",
      "stickyClose": "Cerrar",
      "salleH": "La foto de la sala de esta noche",
      "salleWait": "La foto aparece a partir de 5 participantes.",
      "salleRefresh": "Actualizar",
      "salleTotal": "{n} participantes",
      "salleYou": "Tú",
      "salleCompat": "El perfil más compatible contigo, {name}, representa el {pct} % de la sala.",
      "boussoleNote": "Tu Brújula se preajustará con tus resultados.",
      "nourritLab": "Lo que te alimenta",
      "videLab": "Lo que te vacía",
      "langLab": "Tus lenguajes del amor",
      "valuesLab": "Tus valores",
      "instinctLab": "Tu subtipo",
      "rechargeLab": "Cómo te recargas",
      "stressLab": "Bajo estrés",
      "brakeLab": "Tu freno número 1",
      "demainLab": "Mañana",
      "stepLab": "Tu compromiso",
      "noMoreMark": "lo que no quieres volver a vivir",
      "nnMark": "innegociable",
      "shareWith": "para compartir con {who}",
      "icsBtn": "Añadir el recordatorio a mi calendario",
      "discussPrefix": "Para hablar de:",
      "relive": "Una pareja que te hace volver a vivir esto: {short}.",
      "ownOpposite": "Una pareja que no comparte «{texte}».",
      "needsH": "Lo que te alimenta, lo que te vacía",
      "ressH": "Lo que te recarga",
      "langH": "Tus lenguajes del amor",
      "enneaH": "Tu pista del eneagrama",
      "instinctH": "Tu subtipo",
      "stressH": "Tú bajo estrés",
      "brakesH": "Lo que te frena",
      "partnerH": "La pareja que te conviene",
      "partnerIntro": "La pareja que te conviene, según tus respuestas.",
      "completeLab": "Quién te complementa",
      "frictionLab": "Donde puede atascarse (para negociar)",
      "criticalLab": "Incompatible para ti (innegociable)",
      "gridH": "Cómo leer los niveles de riesgo",
      "keyH": "Qué recordar",
      "piegeLab": "Tu trampa:",
      "pairPrefix": "Con una pareja de {name}:",
      "pairsNote": "Son solo tendencias. Indican dónde pueden atascarse las cosas, para que hables de ello pronto.",
      "tipsLab": "En la práctica",
      "rechargeRule": "La regla de oro: después de pasar tiempo juntos, deberías tener más energía que antes. Si una relación te vacía durante mucho tiempo, no es un detalle: significa algo.",
      "rechargeSame": "Tu forma de recargarte está clara. {title}.",
      "rechargeMixed": "Te recargas de 2 maneras. Entre semana: {soirTitle}. El fin de semana: {weekendTitle}.",
      "boussoleLab": "La Brújula de relación",
      "boussoleP": "¿Estás en pareja, o dudas de una relación? La Brújula de relación te ayuda a valorarla con calma, criterio a criterio. Se preajustará con tus resultados: tus necesidades, lo que te vacía, los defectos con los que puedes vivir y tus innegociables. Aparece una alerta si se ve afectado algo esencial, sea cual sea la puntuación.",
      "boussoleBtn": "Valorar mi relación con la Brújula →",
      "ctaEyebrow": "Llamada de descubrimiento · gratuita",
      "ctaH": "¿Lo hablamos juntos?",
      "ctaP": "Tu perfil amoroso dice mucho de tu Talento Único. Hablemos durante 1 hora, gratis, para que elijas mejor, en el amor como en tu vida profesional.",
      "ctaSign": "Pierre Sarazin, coach Talent Profiler, Magic Humans",
      "ctaBtn": "Reservar mi llamada de descubrimiento gratuita →",
      "siteBtn": "Descubrir Magic Humans",
      "exportH": "Guardar mis resultados",
      "exportP": "Copia este texto para guardarlo en tus notas, o para releerlo antes de tu llamada de descubrimiento.",
      "copyBtn": "Copiar mis resultados",
      "copied": "¡Copiado!",
      "copyFallback": "Selecciona el texto y luego cópialo.",
      "matchingH": "Próximamente: encuentros entre participantes",
      "matchingP": "Hay un proyecto en marcha para poner en contacto a participantes de la Cumbre. El principio es sencillo: nunca se intercambian datos de contacto sin un doble consentimiento, el tuyo y el de la otra persona. Este test no envía nada. Si el proyecto te interesa, escribe a {email} con tu nombre.",
      "restart": "Repetir el test",
      "ethicsH": "Una nota importante",
      "pastH": "Una relación pasada",
      "nowH": "¿Y ahora qué?",
      "petitPasLabel": "Y tú, ¿qué pequeño paso das esta semana?",
      "petitPasPh": "Ejemplo: decir esta noche lo que necesito.",
      "petitPasHint": "Opcional. Se queda en este dispositivo.",
      "petitPasExport": "Mi pequeño paso de esta semana: «{texte}»",
      "nowStep": "Tu próximo paso",
      "nowStepEmpty": "Elige un pequeño paso para tu relación esta semana.",
      "nowTest": "Pon a prueba tu relación",
      "nowTestP": "Comprueba si tu pareja (actual o futura) te conviene de verdad, criterio a criterio.",
      "nowBoussole": "Abrir mi Brújula de relación",
      "nowTalent": "¿Y en el trabajo? Descubre tu Talento Único en 6 minutos con el test gratuito.",
      "saveH": "Guardar mis resultados",
      "saveP": "Escribe tu correo electrónico: tus resultados quedan vinculados a tu cuenta y los encontrarás en tu Brújula de relación, en todos tus dispositivos.",
      "saveLabel": "Tu correo electrónico",
      "savePlaceholder": "nombre@ejemplo.com",
      "saveBtn": "Guardar mis resultados",
      "saveNote": "Gratis y sin contraseña: recibirás un enlace para confirmar tu dirección.",
      "saveError": "Revisa tu correo electrónico, parece incompleto.",
      "nowPierre": "Hacer balance con Pierre",
      "nowCall": "Reservar mi llamada de descubrimiento gratuita",
      "nowPdf": "Descargar mi perfil (PDF)",
      "nowGeneric": "En 1 hora, gratis, vinculamos tu perfil amoroso con tu Talento Único.",
      "nowStress": {
        "fight": "Cuando las cosas se ponen muy tensas, tiendes a contraatacar.",
        "flight": "Cuando las cosas se ponen muy tensas, tiendes a huir.",
        "freeze": "Cuando las cosas se ponen muy tensas, tiendes a quedarte bloqueado/a.",
        "fawn": "Cuando las cosas se ponen muy tensas, tiendes a ceder para calmarlas."
      },
      "talentH": "Lo que tu perfil dice de tu Talento Único",
      "talent": {
        "securite": "En el amor, necesitas saber con quién puedes contar. Y seguramente pase lo mismo en otros ámbitos: en el trabajo y en tus proyectos, das lo mejor de ti cuando las reglas están claras y la gente cumple su palabra. Ese es tu Contexto Desencadenante. En cambio, la vaguedad que se alarga te apaga: ese es tu Anti-Contexto.",
        "profondeur": "Necesitas que las cosas sean de verdad, con conversaciones que lleguen al fondo. Esta necesidad no se queda en tu relación: tu talento suele esconderse justo ahí, en tu forma de entender a la gente mejor que la mayoría. Tu Contexto Desencadenante son los intercambios sinceros, sin máscaras. Tu Anti-Contexto, las relaciones que se quedan en la superficie.",
        "admiration": "Necesitas que se vea lo que das. No es ego, es un motor, y también funciona en tu vida profesional: cuando se reconoce tu trabajo, te superas con gusto. Tu Contexto Desencadenante es un lugar donde lo que aportas cuenta de verdad. Tu Anti-Contexto, quedarte demasiado tiempo en la sombra.",
        "liberte": "Quieres mejor cuando sigues siendo libre de tomar tus propias decisiones. En el resto de tu vida también das lo mejor de ti cuando confían en ti y te dejan hacer las cosas a tu manera. Ese es tu Contexto Desencadenante. Tu Anti-Contexto es que te controlen o tener que rendir cuentas de todo todo el tiempo.",
        "harmonie": "Necesitas un ambiente dulce para querer del todo. Eso dice algo de tu talento: sabes calmar, conectar y ayudar a la gente a estar bien junta. Tu Contexto Desencadenante es un entorno tranquilo donde se habla antes de que las cosas se atasquen. Tu Anti-Contexto es la tensión que se queda flotando y nunca se resuelve.",
        "complicite": "Para ti, querer es ser un equipo. Y seguramente trabajes igual: solo/a, te aburres; con otros, despegas. Tu Contexto Desencadenante es un proyecto concreto que se lleva entre varios, de buen humor. Tu Anti-Contexto es cargar con todo solo/a durante demasiado tiempo.",
        "intensite": "Necesitas que salten chispas. En el amor como en otros ámbitos, la rutina plana te apaga, mientras que un reto te despierta. Es una pista real para tu Talento Único: das lo mejor de ti cuando hay algo en juego y algo nuevo. Ese es tu Contexto Desencadenante. Tu Anti-Contexto es la misma rutina de siempre, sin sorpresas."
      },
      "meetH": "Dónde conocer a alguien que te convenga",
      "meetLieux": "Lugares donde te sientes tú mismo/a",
      "meetAct": "Actividades que sacan lo mejor de ti",
      "meetShine": "El entorno donde te luces",
      "meetAvoid": "A evitar"
    }
  },
  "lang": "es"
};
if (typeof module !== "undefined" && module.exports) module.exports = AMOUR_DATA_ES;
else root.AMOUR_DATA_ES = AMOUR_DATA_ES;
})(typeof window !== "undefined" ? window : globalThis);
