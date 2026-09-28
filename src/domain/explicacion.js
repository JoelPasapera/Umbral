/**
 * Explicaciones de fallo: clave de caché y puerta de validación.
 *
 * Una explicación de fallo responde a una sola pregunta: por qué *tu* opción
 * era tentadora y dónde se rompe. No es la solución del ejercicio —esa ya
 * existe y es la misma para todos—, sino el análisis de una equivocación
 * concreta.
 *
 * Dos ideas gobiernan el archivo:
 *
 * 1. **La explicación de (pregunta, opción) es idéntica para todo el que
 *    elija esa opción.** Por eso tiene clave, se redacta una vez y se
 *    reutiliza para siempre. Eso convierte un coste por alumno en un coste
 *    por pregunta, que es la diferencia entre viable e inviable para una
 *    academia pequeña.
 *
 * 2. **Como es contenido y no una respuesta en vivo, pasa por revisión.**
 *    Una matemática inventada en una plataforma de admisión hace daño real,
 *    y el alumno no tiene forma de saber que ese párrafo no lo escribió su
 *    profesor. La puerta de abajo no sustituye esa revisión: le ahorra al
 *    profesor las candidatas rotas para que mire solo las dudosas.
 *
 * Los dos niveles de severidad son los mismos que en `generation.js`:
 *
 *   rechazo — está rota o es peligrosa. No llega a la cola de revisión.
 *   aviso   — es sospechosa pero puede ser válida. Llega marcada.
 *
 * Puro: sin DOM, sin red, sin reloj.
 */

import { normalizar, similitud, formulasEquilibradas, entre } from './texto.js';

/** Separador de la clave. No aparece en ningún identificador de pregunta. */
const SEPARADOR = '#';

const LIMITES = {
  /* Por debajo de 80 no cabe un razonamiento; por encima de 900 el alumno que
     acaba de fallar no lo lee. */
  texto: [80, 900],
};

/** Por debajo de esta longitud se avisa: probablemente no enseña nada. */
const LARGO_COMODO = 140;

/** Similitud a partir de la cual dos textos se consideran el mismo. */
const UMBRAL_REPETIDA = 0.72;

/**
 * Afirmaciones de acierto. El alumno acaba de fallar: un texto que le dice que
 * acertó no es un matiz, es una contradicción con el veredicto que tiene
 * delante en la misma pantalla.
 */
const AFIRMA_ACIERTO = /\b(acertaste|elegiste bien|muy bien|tu respuesta es correcta|esta es la correcta)\b/;

/**
 * Nada puede delatar cómo se redactó el material. El alumno no tiene por qué
 * saberlo y la mención abre una conversación que no es la de esta pantalla.
 */
const DELATA_ORIGEN = /\b(ia|i a|inteligencia artificial|modelo de lenguaje|asistente|chatbot|generad[oa] automaticamente)\b/;

/** Palabras demasiado comunes para probar que el texto habla de esta opción. */
const VACIAS = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'que', 'es', 'un', 'una', 'por', 'con', 'x']);

/**
 * Clave de caché de una explicación de fallo.
 *
 * Es el corazón del ahorro: dos alumnos que eligen la misma opción de la misma
 * pregunta caen en la misma clave. En el servidor real esto es un índice único
 * sobre (pregunta, opción), y ese índice es lo que hace imposible pagar dos
 * veces por el mismo texto aunque dos profesores lo pidan a la vez.
 *
 * @param {string} preguntaId
 * @param {number} opcion
 * @returns {string}
 */
export function claveExplicacion(preguntaId, opcion) {
  const id = String(preguntaId ?? '').trim();
  const indice = Number(opcion);
  if (!id) throw new Error('Falta el identificador de la pregunta.');
  if (!Number.isInteger(indice) || indice < 0) throw new Error('La opción tiene que ser un índice.');
  return `${id}${SEPARADOR}${indice}`;
}

/**
 * Las opciones que un alumno puede llegar a elegir equivocándose. La correcta
 * no necesita explicación de fallo: para eso está la explicación general.
 *
 * @param {{ opciones: string[], correcta: number }} pregunta
 * @returns {number[]}
 */
export function opcionesFallables(pregunta) {
  const total = Array.isArray(pregunta?.opciones) ? pregunta.opciones.length : 0;
  return Array.from({ length: total }, (_, i) => i).filter((i) => i !== Number(pregunta.correcta));
}

/**
 * @typedef {object} Problema
 * @property {'rechazo'|'aviso'} nivel
 * @property {string} campo
 * @property {string} mensaje
 */

/**
 * @typedef {object} Candidata
 * @property {string} preguntaId
 * @property {number} opcion
 * @property {string} texto
 */

/**
 * Revisa una explicación de fallo contra la pregunta a la que pertenece.
 *
 * @param {Candidata} candidata
 * @param {{ pregunta: { id:string, opciones:string[], correcta:number, explicacion?:string } }} contexto
 * @returns {{ aceptada: boolean, problemas: Problema[], candidata: Candidata }}
 */
export function revisarExplicacion(candidata, { pregunta }) {
  const problemas = [];
  const rechazo = (campo, mensaje) => problemas.push({ nivel: 'rechazo', campo, mensaje });
  const aviso = (campo, mensaje) => problemas.push({ nivel: 'aviso', campo, mensaje });

  const texto = String(candidata?.texto ?? '').trim();
  const opcion = Number(candidata?.opcion);
  const opciones = Array.isArray(pregunta?.opciones) ? pregunta.opciones : [];

  /* --- Encaje con la pregunta --- */

  if (String(candidata?.preguntaId ?? '') !== String(pregunta?.id ?? '')) {
    rechazo('preguntaId', 'La explicación no corresponde a esta pregunta.');
  }
  if (!Number.isInteger(opcion) || opcion < 0 || opcion >= opciones.length) {
    rechazo('opcion', 'Señala una alternativa que no existe en la pregunta.');
  } else if (opcion === Number(pregunta.correcta)) {
    rechazo('opcion', 'Es la alternativa correcta: no hay ningún fallo que explicar.');
  }

  /* --- Estructura --- */

  if (!entre(texto.length, LIMITES.texto)) {
    rechazo('texto', 'El texto está vacío o es desproporcionado para leerlo tras fallar.');
  }
  if (!formulasEquilibradas(texto)) {
    rechazo('texto', 'Hay una fórmula sin cerrar: se pintaría como texto roto.');
  }

  /* --- Peligros. Estos son los que justifican que exista la puerta --- */

  const plano = normalizar(texto);

  if (AFIRMA_ACIERTO.test(plano)) {
    rechazo('texto', 'Le dice al alumno que acertó, y en esa pantalla acaba de fallar.');
  }
  if (DELATA_ORIGEN.test(plano)) {
    rechazo('texto', 'Menciona cómo se redactó el material. Eso nunca se le enseña al alumno.');
  }
  if (pregunta?.explicacion && similitud(texto, pregunta.explicacion) >= UMBRAL_REPETIDA) {
    rechazo('texto', 'Repite la explicación general, que el alumno ya tiene delante. No añade nada.');
  }

  /* --- Sospechas: llegan marcadas, decide el profesor --- */

  if (texto.length < LARGO_COMODO && !problemas.some((p) => p.campo === 'texto' && p.nivel === 'rechazo')) {
    aviso('texto', 'Es muy breve. Comprueba que llegue a decir dónde se rompe el razonamiento.');
  }

  const elegida = opciones[opcion];
  if (elegida) {
    const suyas = normalizar(elegida).split(' ').filter((t) => t && !VACIAS.has(t));
    const mencionada = suyas.length === 0 || suyas.some((t) => plano.includes(t));
    if (!mencionada) {
      aviso('texto', 'No parece hablar de la alternativa elegida: puede ser una explicación genérica.');
    }
  }

  return {
    aceptada: !problemas.some((p) => p.nivel === 'rechazo'),
    problemas,
    candidata: { preguntaId: String(candidata?.preguntaId ?? ''), opcion, texto },
  };
}

/**
 * Revisa de una vez las explicaciones de todas las opciones falladas de una
 * pregunta.
 *
 * Además de revisar cada una por separado, compara las aceptadas entre sí. Ese
 * es el fallo más típico y el más difícil de ver leyendo de una en una: el
 * mismo párrafo genérico servido para las tres alternativas, que no explica
 * ningún error concreto y hace que la funcionalidad no valga nada.
 *
 * @param {Candidata[]} candidatas
 * @param {{ pregunta: object }} contexto
 * @returns {{ aceptadas: object[], rechazadas: object[], repetidas: object[], resumen: object }}
 */
export function revisarLoteExplicaciones(candidatas, contexto) {
  const revisadas = candidatas.map((c) => revisarExplicacion(c, contexto));

  const aceptadas = [];
  const repetidas = [];
  for (const r of revisadas.filter((x) => x.aceptada)) {
    const choca = aceptadas.find((a) => similitud(a.candidata.texto, r.candidata.texto) >= UMBRAL_REPETIDA);
    if (choca) {
      r.problemas.push({
        nivel: 'rechazo',
        campo: 'texto',
        mensaje: `Es la misma explicación que la de la alternativa ${'ABCD'[choca.candidata.opcion] ?? choca.candidata.opcion}.`,
      });
      r.aceptada = false;
      repetidas.push(r);
    } else {
      aceptadas.push(r);
    }
  }

  const rechazadas = revisadas.filter((x) => !x.aceptada && !repetidas.includes(x));

  return {
    aceptadas,
    rechazadas,
    repetidas,
    resumen: {
      recibidas: candidatas.length,
      aceptadas: aceptadas.length,
      rechazadas: rechazadas.length,
      repetidas: repetidas.length,
      conAviso: aceptadas.filter((a) => a.problemas.length > 0).length,
    },
  };
}

export const CONSTANTES_EXPLICACION = Object.freeze({
  LIMITES,
  LARGO_COMODO,
  UMBRAL_REPETIDA,
  SEPARADOR,
});
