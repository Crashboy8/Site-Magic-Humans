// Ejemplos de profundización en español: traducción de exempleApprofondir.ts, sin regeneración por la IA. Ningún nombre real.
import { RESULTAT_EXEMPLE_ES } from "./exempleEs";
import type { AutrePiste, Cible, Portrait } from "./types";

export const PORTRAIT_EXEMPLE_ES: Portrait = {
  prenom: "Claire",
  age: "45 a 55",
  situation:
    "Directora de una planta de producción alimentaria de 180 personas cerca de Rennes. Ha heredado a dos jefes de equipo que no se hablan desde la última reestructuración, y la producción empieza a resentirse.",
  journee:
    "Llega a las 7 para la charla de seguridad, a las 9 reunión de producción en la que nadie se mira, por la tarde llamadas con la central y, por la noche, relee los correos de reclamaciones que no ha tenido tiempo de tratar.",
  declencheur:
    "El día en que uno de sus mejores técnicos le dice que se marcha a la competencia, porque el ambiente se ha vuelto insoportable.",
  pourToi:
    "Un equipo en tensión que necesita volver a hablarse: es exactamente tu territorio. Ojo con la central, muy jerárquica, que querrá validarlo todo tres veces.",
  dejaEssaye: [
    "Una jornada de cohesión fuera de la planta con una actividad al aire libre, olvidada en dos semanas",
    "Reuniones individuales con cada jefe de equipo, sin efecto sobre su relación",
    "Un curso de comunicación propuesto por la central, percibido como demasiado teórico",
  ],
  douleurs: [
    {
      titre: "Dos bandos en el equipo",
      detail: "Cada jefe de equipo tiene a sus fieles. La información ya no circula entre turnos.",
      intensite: 5,
      sesMots: "Tengo la sensación de dirigir dos plantas que se han dado la espalda",
      verbatim: "",
    },
    {
      titre: "Decisiones que se eternizan",
      detail: "Cada cambio de planificación se convierte en una negociación. Decide sola y se lo reprochan.",
      intensite: 4,
      sesMots: "Me paso los días haciendo de árbitro en vez de dirigir la planta",
      verbatim: "",
    },
    {
      titre: "El miedo a perder a los mejores",
      detail: "Dos personas se han ido en 6 meses y otras miran fuera. Contratar es lento en la región.",
      intensite: 4,
      sesMots: "Si pierdo un técnico más, no cumpliré los plazos",
      verbatim: "",
    },
  ],
  objections: [
    {
      objection: "Ya hicimos una jornada de cohesión y no cambió nada",
      reponse: "Una jornada une a la gente durante 1 día. Aquí trabajamos la relación entre los dos responsables, cerca de la línea de producción, durante varias semanas.",
    },
    {
      objection: "La central nunca aprobará otro gasto",
      reponse: "Podemos empezar con una sesión corta de diagnóstico, con un resultado concreto que enseñar a la central antes de ir más lejos.",
    },
  ],
  criteresChoix: [
    "Alguien que conozca el sector y no hable como un consultor",
    "Resultados visibles en pocas semanas",
    "Trabajo en la planta, sin parar la producción",
  ],
  sInforme: [
    "Boletines de la prensa regional de la industria alimentaria",
    "Grupos de LinkedIn de directores de planta",
    "Reuniones de la red de industriales de su región",
  ],
  lieux: [
    {
      categorie: "salon",
      type: "Ferias de la industria alimentaria en el oeste de Francia",
      pourquoi: "Los directores de planta acuden para ver a sus proveedores y tienen tiempo entre citas.",
      recherche: "feria industria alimentaria Rennes",
    },
    {
      categorie: "club",
      type: "Clubes de directivos industriales de la región",
      pourquoi: "Allí se habla con franqueza de los problemas de equipo, entre iguales.",
      recherche: "club directivos industria Bretaña",
    },
    {
      categorie: "evenement",
      type: "Desayunos de la cámara de comercio sobre gestión de equipos",
      pourquoi: "Un formato corto, a primera hora, que encaja en sus días.",
      recherche: "desayuno gestión cámara de comercio Ille-et-Vilaine",
    },
    {
      categorie: "en_ligne",
      type: "Grupos de LinkedIn de directores de planta y responsables de producción",
      pourquoi: "Los lee por la noche y a veces plantea preguntas allí.",
      recherche: "grupo LinkedIn directores de planta",
    },
  ],
};

export const PISTES_EXEMPLE_ES: AutrePiste[] = [
  {
    id: "p1",
    nom: "Socios enfrentados en despachos profesionales",
    marche: "b2b",
    enUneLigne: "Despachos de abogados o de contabilidad donde dos socios ya no se llevan bien",
    raison: "Un gran terreno para tu talento, pero más difícil de alcanzar desde tu red actual.",
    depuisIdees: [],
    notes: { urgence: 5, paiement: 4, acces: 2, plaisir: 4 },
  },
  {
    id: "p2",
    nom: "Familias en pleno relevo de la empresa",
    marche: "b2b",
    enUneLigne: "Empresas familiares en pleno traspaso, donde padres e hijos chocan",
    raison: "La necesidad es fuerte, pero la decisión de compra suele tardar meses.",
    depuisIdees: [],
    notes: { urgence: 4, paiement: 4, acces: 3, plaisir: 4 },
  },
  {
    id: "p3",
    nom: "Equipos directivos de centros escolares en crisis",
    marche: "b2b",
    enUneLigne: "Centros escolares donde el profesorado está dividido tras un cambio de dirección",
    raison: "Tu talento sería valioso ahí, pero los presupuestos son muy ajustados.",
    depuisIdees: [],
    notes: { urgence: 4, paiement: 2, acces: 3, plaisir: 3 },
  },
];

const base = RESULTAT_EXEMPLE_ES.cibles[1];
/** Idea p2 explorada: un objetivo completo, identificador c4. */
export const CIBLE_PISTE_EXEMPLE_ES: Cible = {
  ...structuredClone(base),
  id: "c4",
  nom: "Familias en pleno relevo de la empresa",
  portrait:
    "Directivos de empresas familiares de 20 a 80 empleados, en pleno traspaso. El padre o la madre fundadora sigue presente, el hijo o la hija que toma el relevo quiere modernizar y el equipo ya no sabe quién manda.",
  promesse: "Hago que padres e hijos vuelvan a sentarse a la misma mesa para que el relevo se haga sin romper la empresa.",
  scores: {
    urgence: { note: 5, raison: "El traspaso tiene fecha: cada mes de conflicto cuesta clientes y personal." },
    paiement: { note: 4, raison: "La empresa paga y hay cientos de miles de euros en juego." },
    acces: { note: 3, raison: "Se llega a ellos a través de los gestores y notarios que se ocupan de la venta." },
    plaisir: { note: 5, raison: "Una familia en tensión que necesita volver a hablarse: tu Contexto Desencadenante en estado puro." },
  },
  depuisIdees: [],
  verbatims: [],
};
