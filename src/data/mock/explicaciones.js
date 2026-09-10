/**
 * Explicaciones de fallo.
 *
 * Este módulo hace de servidor. Cuando exista el backend real se reemplaza por
 * una tabla y una función que llama al modelo; el contrato no cambia.
 *
 * La tabla real tiene un **índice único sobre (pregunta_id, opcion)**. Ese
 * índice no es una optimización: es lo que hace imposible pagar dos veces por
 * el mismo texto aunque dos profesores pulsen "generar" en el mismo segundo.
 * Aquí lo representa la clave del `Map`.
 *
 * Dos ámbitos, y el orden importa:
 *
 *   base    — las del banco que todas las academias comparten. Vienen con
 *             Umbral, revisadas una vez. Una academia recién contratada las
 *             tiene el primer día sin gastar un céntimo, que es justo lo que
 *             hace la funcionalidad viable para la pequeña.
 *   propias — las que una academia genera para sus propias preguntas. Se
 *             buscan primero, de modo que puede mejorar una del banco base
 *             sin que nadie más se entere.
 */

import {
  claveExplicacion,
  opcionesFallables,
  revisarLoteExplicaciones,
} from '../../domain/explicacion.js';

/** Coste de redactar la explicación de una opción. Se cobra una sola vez. */
const COSTE_POR_EXPLICACION = 1;

/** Explicaciones del banco base, ya revisadas. Clave: `preguntaId#opcion`. */
const BASE = new Map();

/** Explicaciones propias de cada academia, ya aprobadas. */
const propias = new Map();

/** Cola de borradores pendientes de revisar, por academia. */
const colas = new Map();

const propiasDe = (academiaId) => {
  if (!propias.has(academiaId)) propias.set(academiaId, new Map());
  return propias.get(academiaId);
};

const colaDe = (academiaId) => {
  if (!colas.has(academiaId)) colas.set(academiaId, []);
  return colas.get(academiaId);
};

/**
 * Siembra las explicaciones del banco base.
 *
 * Se llama una vez al arrancar el simulado. En producción esto es una
 * migración: filas insertadas con `origen = 'base'`.
 *
 * @param {{ preguntaId:string, opcion:number, texto:string }[]} filas
 */
export function sembrarBase(filas) {
  for (const fila of filas) {
    BASE.set(claveExplicacion(fila.preguntaId, fila.opcion), {
      texto: fila.texto,
      origen: 'base',
    });
  }
}

/**
 * Busca la explicación aprobada para una opción fallada.
 *
 * Devuelve `null` cuando no hay ninguna, y eso es un caso normal, no un error:
 * la funcionalidad entra pregunta a pregunta y el alumno que cae en una opción
 * todavía sin explicar ve exactamente lo que veía antes.
 *
 * @param {{ preguntaId:string, opcion:number, academiaId?:string }} params
 * @returns {{ texto:string, origen:'base'|'propia' }|null}
 */
export function explicacionDeFallo({ preguntaId, opcion, academiaId = null }) {
  let clave;
  try {
    clave = claveExplicacion(preguntaId, opcion);
  } catch {
    return null;
  }

  if (academiaId) {
    const suya = propiasDe(academiaId).get(clave);
    if (suya) return { texto: suya.texto, origen: 'propia' };
  }

  const base = BASE.get(clave);
  return base ? { texto: base.texto, origen: 'base' } : null;
}

/**
 * El modelo, simulado.
 *
 * Devuelve a propósito una mezcla de candidatas buenas y rotas: sin eso, la
 * puerta de validación no se estaría probando contra nada. Los tres fallos que
 * imita es el más común de todos y el que más se cuela: en vez de analizar el
 * error concreto, devuelve otra vez la solución general del ejercicio, que el
 * alumno ya tiene delante en la misma pantalla.
 *
 * @param {object} pregunta
 * @param {number[]} opciones
 * @returns {{ preguntaId:string, opcion:number, texto:string }[]}
 */
function modeloSimulado(pregunta, opciones) {
  return opciones.map((opcion, i) => {
    if (i === 1) {
      return { preguntaId: pregunta.id, opcion, texto: pregunta.explicacion ?? '' };
    }
    // Plantillas distintas por alternativa. Un modelo real que devuelve el
    // mismo párrafo con la opción cambiada no está explicando ningún error
    // concreto, y la puerta lo rechaza por repetido: aquí se imita a uno que
    // sí varía el razonamiento.
    const elegida = pregunta.opciones[opcion];
    const variantes = [
      `Llegaste a ${elegida} porque aplicaste el paso intermedio en el orden inverso, y con ese cambio el signo del término que arrastras se invierte. Vuelve a la línea donde separas los dos factores y comprueba cuál va delante.`,
      `Para que saliera ${elegida} tendrías que haber sustituido el dato del enunciado por su inverso. Es un cambio pequeño de escritura pero mueve el resultado entero: revisa qué valor te dan y cuál te piden.`,
      `${elegida} sale de detenerse un paso antes de terminar. El razonamiento hasta ahí es correcto; lo que falta es la última operación, y por eso el resultado se parece tanto al bueno sin serlo.`,
    ];
    return { preguntaId: pregunta.id, opcion, texto: variantes[i % variantes.length] };
  });
}

/**
 * Redacta las explicaciones que le faltan a una pregunta y las manda a
 * revisión.
 *
 * Solo pide las que faltan. Es la regla que hace barata la funcionalidad: una
 * opción ya explicada no se vuelve a pagar nunca, ni aunque la pidan mil
 * alumnos o el profesor pulse el botón dos veces.
 *
 * `cobrar` entra como función y no como cifra a propósito: así el tope se
 * comprueba en un solo sitio —el módulo que lleva el presupuesto— y no hay dos
 * copias de la regla que puedan divergir. Lanza si no alcanza, y se llama
 * antes de redactar nada.
 *
 * @param {{ academiaId:string, pregunta:object, cobrar:(creditos:number)=>void }} params
 * @returns {{ resumen:object, borradores:object[], rechazadas:object[], gasto:number }}
 */
export function generarExplicaciones({ academiaId, pregunta, cobrar }) {
  if (!pregunta) throw new Error('Esa pregunta no existe.');

  const cola = colaDe(academiaId);
  const enCola = new Set(
    cola.filter((b) => b.estado === 'borrador').map((b) => claveExplicacion(b.preguntaId, b.opcion)),
  );

  const faltan = opcionesFallables(pregunta).filter((opcion) => {
    const clave = claveExplicacion(pregunta.id, opcion);
    return !enCola.has(clave) && !explicacionDeFallo({ preguntaId: pregunta.id, opcion, academiaId });
  });

  if (faltan.length === 0) {
    return {
      resumen: { recibidas: 0, aceptadas: 0, rechazadas: 0, repetidas: 0, conAviso: 0 },
      borradores: [],
      rechazadas: [],
      gasto: 0,
      yaEstaban: true,
    };
  }

  // Se cobra ANTES de redactar, y solo por lo que de verdad falta, no por
  // todas las opciones de la pregunta.
  const gasto = faltan.length * COSTE_POR_EXPLICACION;
  cobrar(gasto);

  const revision = revisarLoteExplicaciones(modeloSimulado(pregunta, faltan), { pregunta });

  let contador = cola.length;
  const nuevas = revision.aceptadas.map((r) => ({
    id: `x-${academiaId}-${(contador += 1)}`,
    estado: 'borrador',
    preguntaId: r.candidata.preguntaId,
    opcion: r.candidata.opcion,
    texto: r.candidata.texto,
    avisos: r.problemas,
    enunciado: pregunta.enunciado,
    alternativa: pregunta.opciones[r.candidata.opcion],
    generado: Date.now(),
  }));
  cola.push(...nuevas);

  return {
    resumen: revision.resumen,
    borradores: nuevas,
    rechazadas: [...revision.rechazadas, ...revision.repetidas].map((r) => ({
      alternativa: 'ABCD'[r.candidata.opcion] ?? String(r.candidata.opcion),
      motivos: r.problemas.filter((p) => p.nivel === 'rechazo').map((p) => p.mensaje),
    })),
    gasto,
  };
}

/** @param {{ academiaId:string }} params */
export function colaExplicaciones({ academiaId }) {
  return { borradores: colaDe(academiaId).filter((b) => b.estado === 'borrador') };
}

/**
 * Aprobar o descartar. Aprobar es lo único que hace visible un texto para un
 * alumno: mientras esté en la cola, nadie fuera del panel lo ve.
 *
 * @param {{ academiaId:string, id:string, decision:'aprobar'|'descartar', cambios?:{texto?:string} }} params
 */
export function decidirExplicacion({ academiaId, id, decision, cambios = {} }) {
  const cola = colaDe(academiaId);
  const borrador = cola.find((b) => b.id === id && b.estado === 'borrador');
  if (!borrador) throw new Error('Ese borrador ya no está pendiente.');

  if (decision === 'descartar') {
    borrador.estado = 'descartado';
    return { id, publicada: null };
  }

  if (typeof cambios.texto === 'string' && cambios.texto.trim()) {
    borrador.texto = cambios.texto.trim();
  }
  borrador.estado = 'aprobado';

  const clave = claveExplicacion(borrador.preguntaId, borrador.opcion);
  propiasDe(academiaId).set(clave, {
    texto: borrador.texto,
    // Queda marcada de por vida: si mañana se descubre que una tanda salió
    // mal, se pueden encontrar todas y retirarlas.
    origen: 'generado',
    aprobado: Date.now(),
  });

  return { id, publicada: { preguntaId: borrador.preguntaId, opcion: borrador.opcion } };
}

export const COSTE_EXPLICACION = Object.freeze({ COSTE_POR_EXPLICACION });
