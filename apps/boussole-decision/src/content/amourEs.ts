// Brújula de relación (modo amor) en español. Misma forma que content/amour.ts, el francés sigue siendo la referencia.
// Solo cambian los textos mostrados: las claves, los pesos, las direcciones y el marcador técnico siguen idénticos.
import { LOVE_PROFILE_MARKER, LOVE_TEMPLATE, type LoveResults, type LoveTable, type LoveTemplate, type LoveTexts } from "./amour";
import { typographier } from "@/i18n/typo";

const CATEGORIES_ES: Record<string, string> = {
  fond: "El fondo: necesidades, respeto, valores",
  direction: "La dirección común",
  quotidien: "El día a día: defectos y roces",
  energie: "La energía y el amor",
};

const CRITERIA_ES: Record<string, { label: string; guide: string; alert: string }> = {
  besoins: {
    label: "Mis necesidades esenciales están respetadas",
    guide: "Piensa en tus dos necesidades esenciales (resultado del Test del Amor). ¿Están cubiertas la mayor parte del tiempo, y no solo los días buenos?",
    alert:
      "Tus necesidades esenciales no están lo bastante respetadas en esta relación. Es lo que más cuenta: se puede querer a alguien y apagarse a su lado. Antes de buscar compromisos en otro lado, pregúntate si la otra persona puede cubrir esta necesidad sin dejar de ser ella misma.",
  },
  respect: {
    label: "Me siento respetado/a y a salvo emocionalmente",
    guide: "¿Puedes decir lo que piensas, o decir que no, sin miedo, sin que te menosprecien, se burlen de ti o te castiguen?",
    alert:
      "El respeto y la seguridad emocional no están del todo. No es cuestión de compatibilidad: sin seguridad, ningún otro criterio puede contar de verdad. Toma esta señal en serio y habla con alguien de confianza.",
  },
  valeurs: {
    label: "Compartimos los mismos valores de fondo",
    guide: "En lo que es importante para ti (honestidad, familia, dinero, espiritualidad, compromiso), ¿estáis de acuerdo en lo esencial, aunque lo expreséis de forma distinta?",
    alert:
      "Tus valores de fondo parecen alejarse. Las diferencias de forma se negocian, las de fondo desgastan. Identifica con precisión el valor en juego y comprueba, con calma, si es un malentendido o un desacuerdo real.",
  },
  direction: {
    label: "Vamos en la misma dirección (proyecto de vida)",
    guide: "Hijos, lugar de vida, ritmo, proyectos: imagínate dentro de cinco años. ¿Ves la misma vida?",
    alert:
      "Tus proyectos de vida no van en la misma dirección. El amor no sustituye a una dirección común: uno de los dos corre el riesgo de renunciar a una parte de su vida. Pon los temas concretos sobre la mesa (hijos, lugar, ritmo) antes de comprometerte más.",
  },
  defauts: {
    label: "Puedo vivir con sus defectos dentro de 10 años",
    guide: "Piensa en lo que más te agota de la otra persona (tu Test del Amor lo ha clasificado). ¿Es algo raro o algo instalado? Si nunca cambia, ¿podrías vivir con ello dentro de diez años, con serenidad?",
    alert:
      "Algunos de sus defectos te parecen difíciles de llevar a largo plazo. Recuerda: no se cambia a nadie. Pedirle que cambie es pedirle que deje de ser él o ella misma. La verdadera pregunta es: ¿puedes aceptarlo/a tal como es?",
  },
  frictions: {
    label: "Nuestros roces siguen siendo aceptables y se resuelven",
    guide: "¿Tus desacuerdos terminan en una solución o una reconciliación, y no en la misma discusión que vuelve una y otra vez?",
    alert: "",
  },
  energie: {
    label: "Después de un rato juntos, tengo más energía",
    guide: "Después de una tarde o un fin de semana juntos, ¿te sientes más vivo/a o más agotado/a? Piensa en lo que te recarga y en lo que te vacía.",
    alert: "",
  },
  langage: {
    label: "Nuestros lenguajes del amor se encuentran",
    guide: "¿Recibes el amor en tu lenguaje (palabras, momentos, regalos, servicios, contacto físico) y sabes darlo en el suyo?",
    alert: "",
  },
  attirance: {
    label: "Atracción física y deseo por la otra persona",
    guide: "La atracción y el deseo están ahí casi siempre, no solo al principio. Puedes poner un porcentaje, de 0 a 100.",
    alert: "",
  },
  sexualite: {
    label: "Compatibilidad sexual (nuestros deseos y nuestra forma de vivir la sexualidad)",
    guide: "Vuestros deseos y vuestra forma de vivir la sexualidad os convienen a los dos. Puedes poner un porcentaje, de 0 a 100.",
    alert: "",
  },
  complementarite: {
    label: "Nuestras diferencias me complementan más de lo que me desgastan",
    guide: "Vuestras diferencias (de ritmo, de sociabilidad, de forma de vivir la pareja), ¿te enriquecen o te cansan?",
    alert: "",
  },
  incompatibilite: {
    label: "Existe entre nosotros una incompatibilidad crítica",
    guide:
      "¿Hay un punto innegociable para ti en el que la otra persona está en el extremo opuesto (hijos sí o no, ritmo de vida, libertad frente a fusión, un valor fundamental)? Si no lo hay, responde «Ausente».",
    alert:
      "Señalas una incompatibilidad crítica. Un innegociable sigue siendo innegociable, incluso con mucho amor: si uno de los dos cede, corre el riesgo de lamentarlo y de reprochárselo al otro. Nómbrala con precisión y comprueba con la otra persona que es real y duradera.",
  },
};

export const LOVE_TEMPLATE_ES: LoveTemplate = {
  profileName: "Brújula de relación",
  profileDescription: LOVE_PROFILE_MARKER,
  versionName: "Mi relación, primera lectura",
  opportunityName: "Mi relación",
  decision: "¿Esta relación me conviene?",
  categories: LOVE_TEMPLATE.categories.map((c) => ({ ...c, label: CATEGORIES_ES[c.key] })),
  criteria: LOVE_TEMPLATE.criteria.map((c) => ({ ...c, ...CRITERIA_ES[c.key] })),
};

export const LOVE_TEXTS_ES: LoveTexts = typographier({
  readingTitle: "Lectura de tu Brújula de relación",
  readingIntro: "La puntuación resume tus respuestas, no decide por ti. Lee primero las alertas: un punto esencial afectado cuenta más que cualquier total.",
  provisional: "Lectura provisional: {n} criterio(s) siguen vacíos o «por comprobar». Complétalos para una lectura fiable.",
  noScore: "Evalúa al menos un criterio para obtener una lectura.",
  alignement: (score: number) => `: ${score} % de alineación`,
  jaugeAria: (score: number) => `Alineación: ${score} %`,
  scoreLine: "{name}: {score} % de alineación",
  alertsTitle: "Alertas, sea cual sea la puntuación",
  alertIntro: "Tu puntuación es de {score} %, pero uno o varios puntos esenciales están afectados. Un buen total puede ocultar lo esencial: lee esto primero.",
  genericAlert: "El criterio «{label}» tiene una nota baja aunque lo has clasificado como crítico. Tómate el tiempo de preguntarte si puede mejorar de verdad y en qué condiciones.",
  ligneRougeLow: "Ves el comienzo de una incompatibilidad crítica. Quizá sea solo un malentendido: habla de ello pronto y con franqueza, antes de que cada uno se instale en la esperanza de que el otro cambie de opinión.",
  ligneRougeHigh: "La incompatibilidad crítica parece muy presente. Un innegociable no se negocia: si seguís juntos sin aclararlo, uno de los dos corre el riesgo de renunciar a una parte esencial de sí mismo. Esta constatación puede ser dolorosa y merece aclararse, entre los dos o con alguien de confianza.",
  safety:
    "Has puntuado muy bajo el respeto y la seguridad emocional. Si vives con miedo, humillaciones, control o violencia, no es una cuestión de compatibilidad y no es culpa tuya. En España: 016 (violencia de género, gratuito y confidencial, 24 horas), 112 en caso de peligro inmediato. Fuera de España, contacta con los servicios de emergencia de tu país.",
  energyAlert:
    "Has anotado que esta relación te vacía de energía. No es un detalle: una relación que te conviene te deja más vivo/a, no más agotado/a. Mira qué te vacía (tu Test del Amor te lo dice) y pregúntate si es pasajero o está instalado.",
  quizNoteLabel: "Según tu Test del Amor: ",
  bands: {
    solide: {
      title: "Una alineación sólida",
      text: "Esta relación alimenta lo esencial: tus necesidades, tus valores, tu dirección. Seguramente haya roces, pero son de forma. No es una garantía, es una base. Cuídala: sigue hablando de tus necesidades, recargando pilas en pareja y volviendo a esta Brújula si algo cambia.",
      questions: [
        "¿Qué es lo que más bien me hace en esta relación, y se lo he dicho a la otra persona?",
        "¿Qué pequeño ritual podría proteger lo que tenemos?",
      ],
    },
    base: {
      title: "Una base real, puntos por trabajar",
      text: "Lo esencial está en buena parte, pero algunos criterios tiran de la puntuación hacia abajo. Mira cuáles: si afectan a la forma (hábitos, roces), se trabajan con acuerdos claros. Si afectan al fondo (necesidades, valores, dirección), merecen una conversación de verdad, sin esperar.",
      questions: [
        "¿Cuáles son los dos criterios más bajos y son de fondo o de forma?",
        "¿Qué podría pedir en concreto, sin pedirle a la otra persona que deje de ser quien es?",
      ],
    },
    tension: {
      title: "Una relación en tensión",
      text: "Varios puntos importantes no están a la altura. Puedes querer a esta persona y, al mismo tiempo, no ser feliz con ella: las dos cosas son ciertas. Antes de decidir nada, distingue lo que puede evolucionar con acuerdos de lo que exigiría que uno de los dos dejara de ser quien es.",
      questions: [
        "Si en dos años no cambia nada, ¿cómo me siento?",
        "¿Me quedo por lo que vivimos, o por lo que espero que llegue a ser?",
      ],
    },
    desalignement: {
      title: "Un desalineamiento profundo",
      text: "Tus respuestas muestran una distancia importante entre lo que necesitas y lo que vives. No es un veredicto sobre el valor de la otra persona ni sobre el tuyo: es la señal de que esta relación, tal como es, no te conviene. No tienes que decidir sola/o ni de inmediato. Una mirada externa puede ayudarte a verlo claro, con calma.",
      questions: [
        "¿Qué es lo que de verdad me retiene en esta relación?",
        "¿Qué necesitaría para sentirme a salvo, decida lo que decida?",
      ],
    },
  },
  questionsTitle: "Dos preguntas que hacerte",
  cta: {
    title: "Hablarlo con Pierre",
    text: "Una mirada externa suele ayudar a separar la emoción de lo que de verdad importa. Durante una Llamada de descubrimiento gratuita, releemos juntos tu Brújula y la conectamos con tu Talento Único: lo que te hace triunfar disfrutando en el trabajo también cuenta en tu vida en pareja. Sin compromiso.",
    button: "Reservar mi Llamada de descubrimiento gratuita",
    url: "https://calendly.com/pierre-j-sarazin?utm_source=sommet-love-connexion&utm_medium=boussole-relation&utm_campaign=sommet-amour",
  },
  start: {
    eyebrow: "Cumbre Love & Connexion",
    heading: "Brújula de relación: ¿esta relación me conviene?",
    intro:
      "Evalúa una relación (actual o que empieza) con doce criterios que importan de verdad. Puedes ajustar los pesos, añadir una columna para comparar, y todo sigue siendo privado. Se muestra una alerta si un punto esencial está afectado, sea cual sea la puntuación total.",
    button: "Empezar mi Brújula de relación",
    creating: "Estoy preparando tu Brújula… (unos diez segundos)",
    prefilled:
      "Tu Brújula se preajustará con los resultados de tu Test del Amor: lo que te alimenta, lo que te vacía, tus valores y tus innegociables. Tu respuesta sobre seguridad y tus textos libres no se transmiten nunca.",
    note: "Sin cuenta: tu trabajo se guarda 30 días. Podrás guardarlo con tu correo electrónico.",
    backToQuiz: "Volver al Test del Amor",
    failed: "No se ha podido crear la Brújula de relación. Vuelve a intentarlo en un momento.",
    resume: "Retomar mi Brújula de relación",
    resumeIntro: "Ya tienes una Brújula de relación: la retomamos, no se sobrescribe nada.",
    loading: "Estoy comprobando si ya tienes una Brújula de relación…",
  },
  quizPick: {
    title: "Elige lo que conservas de tu Test del Amor",
    intro: "Cada resultado se convierte en un criterio de tu Brújula. Desmarca lo que no te diga nada: podrás modificarlo todo después.",
    profil: (name: string) => `Tu perfil amoroso: ${name}`,
    groups: {
      profil: "Tu perfil",
      besoins: "Lo que te alimenta",
      valeurs: "Tus valores",
      eviter: "Lo que quieres evitar",
    },
    nonNegotiable: "Innegociable",
    avoid: "Riesgo que evitar",
    already: "Ya está en tu Brújula",
    importance: {
      critique: "Crítico",
      tres_important: "Muy importante",
      important: "Importante",
      moyen: "Medio",
      bof: "Secundario",
      bonus: "Extra",
    },
    families: {
      fond: "El fondo",
      direction: "La dirección",
      quotidien: "El día a día",
      energie: "La energía",
    } as Record<string, string>,
    addButton: (n: number) => (n > 1 ? `Añadir estos ${n} criterios a mi Brújula` : n === 1 ? "Añadir este criterio a mi Brújula" : "Retomar mi Brújula de relación"),
    nothingNew: "Todos los resultados de tu test ya están en tu Brújula.",
    saveButton: "Guardar mis resultados",
    saveIntro: "Última etapa: marca lo que conservas y confirma tu dirección de correo en la página siguiente.",
  },
  repris: {
    title: "Tomado de tu Test del Amor",
    profil: (name: string) => `Perfil «${name}»`,
    added: (n: number) => (n > 1 ? `Se acaban de añadir ${n} criterios de tu test.` : "Se acaba de añadir 1 criterio de tu test."),
    backToQuiz: "Revisar mi Test del Amor",
    redoHint: "¿Repites el test? Se te propondrán los criterios nuevos, sin sobrescribir nada.",
  },
  saveFromQuiz: "Los resultados de tu Test del Amor están en tu Brújula de relación. Confirma tu nombre y tu correo electrónico: recibirás un enlace para encontrarlos en todos tus dispositivos.",
  tableNotice:
    "Modo amor: cada columna es una relación (renómbrala con un nombre de pila), cada fila un criterio. Los criterios marcados «Crítico» activan una alerta si se puntúan «A medias» o menos. Los resultados se muestran en la pestaña Resultados.",
  guideTitle: "Cómo evaluar cada criterio",
});

export const LOVE_TABLE_ES: LoveTable = typographier({
  introCols: "tus relaciones en columnas",
  newOpportunityName: (n: number) => `Relación ${n}`,
  deleteOpportunityConfirm: (name: string) => `¿Eliminar la relación «${name}» y todas sus casillas?`,
  opportunitiesCount: (n: number) => (n > 1 ? "relaciones" : "relación"),
  shownOpportunity: "Relación mostrada",
  addOpportunity: "+ Relación",
  firstOpportunityStart: "Añade una primera relación con el botón",
  firstOpportunityButton: "«+ Relación»",
  firstOpportunityEnd: "arriba a la derecha de la tabla (por ejemplo: «Camila», «La relación que empieza»).",
  opportunityName: "Nombre de la relación",
  deleteOpportunity: (name: string) => `Eliminar la relación «${name}»`,
  failsNonNegotiables: "A revisar: un innegociable no se respeta del todo",
  redLine: "Señal de incompatibilidad por aclarar",
  legendNonNegotiableText: ": si no se respeta del todo, la relación se señala y se clasifica después de las demás",
  nonNegotiableHint: "Innegociable: si no se cumple del todo, la relación se señala y se clasifica después de las demás.",
  chooseIcon: "Elegir un icono",
  chooseColor: "Elegir un color",
  iconLegend: "Icono",
  colorLegend: "Color",
  changeLook: (name: string) => `Icono y color de ${name}`,
  closeLook: "Cerrar",
  icons: {
    coeur: "Corazón",
    etoile: "Estrella",
    soleil: "Sol",
    lune: "Luna",
    montagne: "Montaña",
    vague: "Ola",
    fleur: "Flor",
    feuille: "Hoja",
    flamme: "Llama",
    maison: "Casa",
  },
  colors: {
    corail: "Coral",
    framboise: "Frambuesa",
    miel: "Miel",
    abricot: "Albaricoque",
    eau: "Verde agua",
    sauge: "Salvia",
    lilas: "Lila",
    ciel: "Azul cielo",
  },
  percentOption: "Poner un porcentaje",
  percentLegend: "Porcentaje",
  percentValidate: "Confirmar",
});

export const LOVE_RESULTS_ES: LoveResults = typographier({
  intro: "Tu lectura, tus alertas y tu puntuación de alineación para cada relación. Todo se actualiza cuando modificas tu tabla.",
  badgeNonNegotiable: "🔒 Una necesidad esencial por revisar",
  radarTitle: "Tus relaciones de un vistazo",
  radarIntro: "Tu puntuación para cada relación, familia por familia.",
  radarCaption: "Puntuación de cada relación, familia por familia",
  viewRadars: "Radares",
  viewFiches: "Fichas",
  globalWord: "Global",
  projectionStart: "Imagina: mañana eliges de verdad",
  disappointmentHint: "Quizá tu intuición te dice algo que tus criterios aún no dicen. ¿Hacia qué otra relación se ha ido tu corazón?",
  forWhich: "¿Para qué relación?",
  onlyOne: (score: string) => ` es la única relación evaluada por ahora: ${score} de alineación.`,
  allFail:
    "Ninguna relación respeta por ahora todas tus necesidades esenciales. Tómate el tiempo de mirar cuáles importan de verdad para ti y si alguna puede flexibilizarse.",
  needsTitle: "Tus necesidades esenciales",
  needNourri: (nom: string, critere: string) => `Con ${nom}, tu necesidad «${critere}» está bien cubierta.`,
  needPartiel: (nom: string, critere: string) => `Con ${nom}, tu necesidad «${critere}» está cubierta en parte, merece una conversación de verdad.`,
  needAbsent: (nom: string, critere: string) => `Con ${nom}, tu necesidad «${critere}» no está cubierta por ahora. Mira lo que te cuesta.`,
  riskAbsent: (nom: string, critere: string) => `Con ${nom}, el riesgo «${critere}» no aparece.`,
  riskPartiel: (nom: string, critere: string) => `Con ${nom}, el riesgo «${critere}» aparece un poco, merece que se hable de ello.`,
  riskPresent: (nom: string, critere: string) => `Con ${nom}, el riesgo «${critere}» está bien presente. Tómate el tiempo de mirar lo que te cuesta.`,
  downloadPdf: "Descargar mi Brújula en PDF",
  printFooter: "Magic Humans · www.magichumans.com",
  discoveryCta: "¿Quieres ver con más claridad lo que buscas de verdad en el amor? Lo hablamos durante una hora, es gratis.",
  discoveryUrl: "https://calendly.com/pierre-j-sarazin?utm_source=boussole-relation",
});
