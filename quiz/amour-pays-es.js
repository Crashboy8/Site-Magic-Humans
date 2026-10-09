/* Quiz Amour en espagnol : tout ce qui dépend du pays, et rien d'autre. Un bloc par pays, appliqué APRÈS amour-data-es.js
   (voir dataFor dans amour.js). Pour l'Amérique latine : copier le bloc "es-ES", le renommer (ex. "es-MX"), remplacer les
   textes, et choisir le pays dans PAYS_ES.defaut (ou plus tard d'après le visiteur). Rien d'autre à toucher.
   Ce qui se trouve ici :
   - aide et urgences : numéros d'écoute et d'urgence (safety, ethicsP) ;
   - lieux et activités de rencontre (besoins.*.rencontre.lieux et .activites) ;
   - format de l'heure du rappel (times).
   Le quiz n'affiche ni date, ni monnaie : si un jour il en affiche, leur format vient ici aussi.
   Mêmes clés que amour-data.js, textes seulement. Testé par quiz/amour-es.test.mjs. */
(function (root) {
const PAYS_ES = {
  "defaut": "es-ES",
  "pays": {
    "es-ES": {
      "times": [
        { "label": "8:00" },
        { "label": "12:30" },
        { "label": "18:00" },
        { "label": "21:00" }
      ],
      "safety": {
        "present": {
          "text": "Has indicado que vives con miedo, menosprecio, control o amenazas en tu relación actual. No es una cuestión de compatibilidad ni de lenguajes del amor, y no es culpa tuya. Mereces estar a salvo. Habla con un/a profesional o con una persona de confianza. En España: 016 (violencia de género, gratuito y confidencial, 24 horas), 112 en caso de peligro inmediato. Fuera de España, contacta con los servicios de emergencia de tu país."
        },
        "doute": {
          "text": "A veces te preguntas si lo que vives es normal. Esa duda es importante. Sentirte menospreciado/a o vigilado/a con regularidad, o tener miedo de la reacción de la otra persona, nunca es una simple diferencia de carácter. Puedes hablar de ello, sin compromiso, con un/a profesional. En España, el 016 también atiende a las personas que dudan (gratuito y confidencial, 24 horas)."
        }
      },
      "ui": {
        "results": {
          "ethicsP": "Este test no es una herramienta de diagnóstico. Si vives con miedo, humillaciones, control o violencia en tu relación, no es un problema de compatibilidad: habla con un/a profesional. En España: 016 (violencia de género, gratuito y confidencial, 24 horas), 112 en caso de peligro inmediato. Fuera de España, contacta con los servicios de emergencia de tu país."
        }
      },
      "profil": {
        "besoins": {
          "securite": {
            "rencontre": {
              "lieux": [
                { "texte": "Una cafetería de barrio donde ya te conocen" },
                { "texte": "Un grupo de senderismo que sale todas las semanas" },
                { "texte": "Una asociación de vecinos o un centro cívico, con encuentros regulares" }
              ],
              "activites": [
                { "texte": "Cocinar para un grupo pequeño, el mismo día de cada semana" },
                { "texte": "Un taller de manualidades en el que el proyecto avanza paso a paso" },
                { "texte": "Un voluntariado en una ONG, con un equipo estable" }
              ]
            }
          },
          "profondeur": {
            "rencontre": {
              "lieux": [
                { "texte": "Una cafetería tranquila, donde la conversación puede alargarse" },
                { "texte": "Un club de lectura donde se habla de verdad de los libros" },
                { "texte": "Un camino tranquilo, paseando uno al lado del otro" }
              ],
              "activites": [
                { "texte": "Un taller de escritura, donde se atreven a leer lo que han escrito" },
                { "texte": "Un paseo largo sin teléfonos" },
                { "texte": "Un círculo de escucha, donde cada uno puede terminar sus frases" }
              ]
            }
          },
          "admiration": {
            "rencontre": {
              "lieux": [
                { "texte": "Un escenario pequeño, como una noche de micro abierto, donde la gente enseña lo que ha preparado" },
                { "texte": "Un estreno o un taller en el que cada uno muestra su trabajo" },
                { "texte": "Una clase en la que se aplauden los progresos, en voz alta" }
              ],
              "activites": [
                { "texte": "Preparar una exposición, un texto o un proyecto que otros puedan ver" },
                { "texte": "Cantar, actuar o crear con un grupo de teatro o un coro que apoya" },
                { "texte": "Animar a los demás y recibir la misma calidez a cambio" }
              ]
            }
          },
          "liberte": {
            "rencontre": {
              "lieux": [
                { "texte": "Un sendero o un lugar al aire libre, donde cada uno llega a su ritmo" },
                { "texte": "Un taller abierto, sin horarios fijos" },
                { "texte": "Un viaje en grupo pequeño, con tiempo libre para ti" }
              ],
              "activites": [
                { "texte": "Una salida decidida sobre la marcha, sin un horario apretado" },
                { "texte": "Un deporte que practicas a solas y del que luego hablas si te apetece" },
                { "texte": "Un proyecto propio, que enseñas cuando estás listo/a" }
              ]
            }
          },
          "harmonie": {
            "rencontre": {
              "lieux": [
                { "texte": "Un huerto comunitario, con paz y tranquilidad" },
                { "texte": "Una clase de yoga o de meditación suave" },
                { "texte": "Una tetería tranquila, en un grupo pequeño" }
              ],
              "activites": [
                { "texte": "Cocinar sin prisa, con gestos pausados" },
                { "texte": "Un paseo lento, sin necesidad de ir deprisa" },
                { "texte": "Cerámica, dibujo o costura, en un silencio amable" }
              ]
            }
          },
          "complicite": {
            "rencontre": {
              "lieux": [
                { "texte": "Una cocina compartida, para preparar una comida con otros" },
                { "texte": "Un club de juegos de mesa, donde se ríe alrededor de la mesa" },
                { "texte": "Un proyecto vecinal o solidario, de los que se hacen arrimando el hombro" }
              ],
              "activites": [
                { "texte": "Construir algo con otros: una receta, un mueble, un fin de semana" },
                { "texte": "Un deporte de equipo relajado, entre amigos, sin presión por ganar" },
                { "texte": "Un juego que acaba a menudo en ataques de risa" }
              ]
            }
          },
          "intensite": {
            "rencontre": {
              "lieux": [
                { "texte": "Una clase de baile, como salsa o bachata, donde la gente se atreve a moverse" },
                { "texte": "Una ruta o un viaje un poco improvisados" },
                { "texte": "Un concierto en una sala pequeña, donde fluye la energía" }
              ],
              "activites": [
                { "texte": "Probar una actividad nueva, por el placer de descubrir" },
                { "texte": "La escalada, el escenario o un deporte que despierte de verdad" },
                { "texte": "Preparar una sorpresa en grupo, un poco loca y generosa" }
              ]
            }
          }
        }
      }
    }
  }
};
if (typeof module !== "undefined" && module.exports) module.exports = PAYS_ES;
else root.AMOUR_PAYS_ES = PAYS_ES;
})(typeof window !== "undefined" ? window : globalThis);
