/**
 * Banco de preguntas y corrección.
 *
 * Este módulo hace de servidor. Las respuestas correctas viven aquí y NUNCA
 * salen en la carga de una pregunta: solo se revelan cuando el cliente envía
 * su elección. Cuando exista el backend real, este archivo se reemplaza por
 * una función en el servidor con exactamente el mismo contrato.
 *
 * `dificultad` es la proporción de postulantes que acierta la pregunta. Hoy
 * está estimada a mano; con tráfico real se calcula sola.
 */

import { TRIGONOMETRIA } from './preguntas-trigonometria.js';
import { ARITMETICA } from './preguntas-aritmetica.js';
import { ALGEBRA } from './preguntas-algebra.js';
import { HABILIDAD_MATEMATICA } from './preguntas-habilidad-matematica.js';
import { GEOMETRIA } from './preguntas-geometria.js';
import { FISICA } from './preguntas-fisica.js';

/*
 * Sobre el `temaId` de las diez preguntas originales.
 *
 * Apuntaban a bloques del temario —`tri-identidades`— en vez de a temas —
 * `tri-identidades-2`—, así que el diagnóstico sabía que fallabas identidades
 * pero no cuál de las tres, ni a qué material mandarte. Seis ya apuntan a su
 * tema. Cuatro siguen en su bloque, y no es un olvido:
 *
 *   · trig-003, trig-007 y trig-008 son identidades fundamentales —la de
 *     `sec² x - tan² x = 1` y sus parientes—. El examen las pregunta, pero el
 *     temario no les dedica ningún tema: su bloque solo tiene los de ángulos
 *     compuestos. Asignarlas a uno de esos sería mentir sobre qué se evalúa.
 *   · fis-001 apunta ya a su tema, `fis-cinematica-3`: el temario de Física
 *     se cargó del reglamento de admisión.
 *
 * Las dos cosas se arreglan en el temario, contra el prospecto. No aquí.
 */

/**
 * El banco de práctica.
 *
 * Las de trigonometría viven aparte, en `preguntas-trigonometria.js`, y entran
 * abajo. Son cincuenta y separarlas deja este archivo legible; además su
 * solucionario lo verifica `pruebas/trigonometria.test.mjs` recalculando cada
 * respuesta, que es una batería propia y no cabría aquí.
 */
const BANCO = [
  {
    id: 'trig-001',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades-2',
    dificultad: 0.38,
    enunciado: 'Simplifica la expresión $\\sin^4 x - \\cos^4 x + 1$.',
    opciones: ['$1$', '$2\\cos^2 x$', '$2\\sin^2 x$', '$\\sin 2x$'],
    correcta: 2,
    explicacion:
      'Es una diferencia de cuadrados: $(\\sin^2 x - \\cos^2 x)(\\sin^2 x + \\cos^2 x)$. El segundo paréntesis vale 1, así que queda $\\sin^2 x - \\cos^2 x + 1$. Reemplazando $1 - \\cos^2 x$ por $\\sin^2 x$ obtienes $2\\sin^2 x$.',
  },
  {
    id: 'trig-002',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades-2',
    dificultad: 0.44,
    enunciado: 'Si $\\sin x + \\cos x = \\sqrt{2}$, ¿cuánto vale $\\sin x \\cdot \\cos x$?',
    opciones: ['$\\tfrac{1}{2}$', '$1$', '$0$', '$\\tfrac{\\sqrt{2}}{2}$'],
    correcta: 0,
    explicacion:
      'Eleva al cuadrado los dos lados: $(\\sin x + \\cos x)^2 = 2$. El lado izquierdo es $1 + 2\\sin x\\cos x$, así que $2\\sin x\\cos x = 1$ y el producto vale $\\tfrac{1}{2}$.',
  },
  {
    id: 'trig-003',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades',
    dificultad: 0.61,
    enunciado: 'Reduce: $(1 + \\tan^2 x)\\cos^2 x$.',
    opciones: ['$\\cos^2 x$', '$\\tan^2 x$', '$\\sec^2 x$', '$1$'],
    correcta: 3,
    explicacion:
      '$1 + \\tan^2 x = \\sec^2 x$, y $\\sec^2 x = \\dfrac{1}{\\cos^2 x}$. Al multiplicar por $\\cos^2 x$ se cancelan y queda 1.',
  },
  {
    id: 'trig-004',
    cursoId: 'trigonometria',
    temaId: 'tri-angulos-3',
    dificultad: 0.72,
    enunciado: 'Si $\\tan x = \\tfrac{3}{4}$ y $x$ está en el primer cuadrante, ¿cuánto vale $\\sin x$?',
    opciones: ['$\\tfrac{4}{5}$', '$\\tfrac{3}{5}$', '$\\tfrac{5}{3}$', '$\\tfrac{3}{4}$'],
    correcta: 1,
    explicacion:
      'Cateto opuesto 3, adyacente 4, así que la hipotenusa es 5 (el triángulo 3-4-5). El seno es opuesto sobre hipotenusa: $\\tfrac{3}{5}$.',
  },
  {
    id: 'trig-005',
    cursoId: 'trigonometria',
    temaId: 'tri-normal-1',
    dificultad: 0.49,
    enunciado: 'Simplifica: $\\sin(90^\\circ - x) + \\cos(180^\\circ - x)$.',
    opciones: ['$-1$', '$2\\cos x$', '$1$', '$0$'],
    correcta: 3,
    explicacion:
      '$\\sin(90^\\circ - x) = \\cos x$ y $\\cos(180^\\circ - x) = -\\cos x$. Se cancelan y el resultado es 0.',
  },
  {
    id: 'trig-006',
    cursoId: 'trigonometria',
    temaId: 'tri-angulos-3',
    dificultad: 0.55,
    enunciado: 'Calcula $\\sin^2 20^\\circ + \\sin^2 70^\\circ$.',
    opciones: ['$1$', '$2$', '$0$', '$\\tfrac{1}{2}$'],
    correcta: 0,
    explicacion:
      '$20^\\circ$ y $70^\\circ$ son complementarios, así que $\\sin 70^\\circ = \\cos 20^\\circ$. La suma se vuelve $\\sin^2 20^\\circ + \\cos^2 20^\\circ$, que vale 1.',
  },
  {
    id: 'trig-007',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades',
    dificultad: 0.31,
    enunciado: 'Si $\\sec x - \\tan x = 3$, halla $\\sec x + \\tan x$.',
    opciones: ['$9$', '$3$', '$\\tfrac{1}{3}$', '$\\tfrac{1}{9}$'],
    correcta: 2,
    explicacion:
      'La identidad $\\sec^2 x - \\tan^2 x = 1$ se factoriza como $(\\sec x - \\tan x)(\\sec x + \\tan x) = 1$. Si el primer factor es 3, el segundo es $\\tfrac{1}{3}$.',
  },
  {
    id: 'trig-008',
    cursoId: 'trigonometria',
    temaId: 'tri-identidades',
    dificultad: 0.27,
    enunciado: 'Reduce: $\\dfrac{\\sin x}{1 + \\cos x} + \\dfrac{1 + \\cos x}{\\sin x}$.',
    opciones: ['$2\\sec x$', '$2\\csc x$', '$\\csc x$', '$2$'],
    correcta: 1,
    explicacion:
      'Suma con denominador común $\\sin x(1 + \\cos x)$. El numerador queda $\\sin^2 x + 1 + 2\\cos x + \\cos^2 x = 2 + 2\\cos x = 2(1 + \\cos x)$. Se cancela $(1 + \\cos x)$ y sobra $\\dfrac{2}{\\sin x} = 2\\csc x$.',
  },
  {
    id: 'fis-001',
    cursoId: 'fisica',
    temaId: 'fis-cinematica-3',
    dificultad: 0.52,
    enunciado:
      'Un móvil parte del reposo con aceleración constante de $4\\ \\text{m/s}^2$. ¿Qué distancia recorre en los primeros 5 segundos?',
    opciones: ['$50\\ \\text{m}$', '$20\\ \\text{m}$', '$100\\ \\text{m}$', '$40\\ \\text{m}$'],
    correcta: 0,
    explicacion:
      'Con velocidad inicial cero, $d = \\tfrac{1}{2}at^2 = \\tfrac{1}{2}(4)(25) = 50$ metros.',
  },
  {
    id: 'geo-001',
    cursoId: 'geometria',
    temaId: 'geo-basica-2',
    dificultad: 0.58,
    enunciado:
      'En un triángulo, dos ángulos miden $48^\\circ$ y $67^\\circ$. ¿Cuánto mide el ángulo exterior adyacente al tercero?',
    opciones: ['$115^\\circ$', '$65^\\circ$', '$155^\\circ$', '$113^\\circ$'],
    correcta: 0,
    explicacion:
      'El ángulo exterior equivale a la suma de los dos interiores no adyacentes: $48^\\circ + 67^\\circ = 115^\\circ$.',
  },
  // Las cincuenta de trigonometría, con su curso puesto aquí para no repetirlo
  // cincuenta veces en el archivo de contenido.
  ...TRIGONOMETRIA.map((p) => ({ ...p, cursoId: 'trigonometria' })),
  // Las cincuenta de Aritmética. Su solucionario lo verifica
  // `pruebas/aritmetica.test.mjs`, que además exige que la clave sea única.
  ...ARITMETICA.map((p) => ({ ...p, cursoId: 'aritmetica' })),
  // Las setenta de Álgebra, verificadas por `pruebas/algebra.test.mjs`.
  ...ALGEBRA.map((p) => ({ ...p, cursoId: 'algebra' })),
  // Las cincuenta y ocho de Habilidad matemática, resueltas por búsqueda y
  // simulación en `pruebas/habilidad-matematica.test.mjs`.
  ...HABILIDAD_MATEMATICA.map((p) => ({ ...p, cursoId: 'habilidad-matematica' })),
  // Las setenta y dos de Geometría, verificadas construyendo cada figura con
  // coordenadas en `pruebas/geometria.test.mjs`.
  ...GEOMETRIA.map((p) => ({ ...p, cursoId: 'geometria' })),
  // Las cincuenta y seis de Física, sobre el temario oficial que se cargó del
  // reglamento de admisión. Verificadas en `pruebas/fisica.test.mjs`.
  ...FISICA.map((p) => ({ ...p, cursoId: 'fisica' })),

];

/** Solo para sembrar el panel de administración en la maqueta. */
export const bancoCompleto = () => BANCO.map((p) => ({ ...p, publicado: true }));

import { elegirPreguntasDelDia, registrarReto } from './daily.js';

/** Sesiones abiertas. En producción esto vive en la base de datos. */
const sesiones = new Map();

const barajar = (lista, semilla) => {
  const copia = [...lista];
  let s = semilla;
  for (let i = copia.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((s / 4294967296) * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

/**
 * Devuelve la pregunta tal como puede verla el cliente: sin `correcta` y sin
 * `explicacion`. Esta función es la frontera de seguridad del módulo.
 */
const versionPublica = ({ id, cursoId, temaId, enunciado, opciones }, orden = null) => ({
  id,
  cursoId,
  temaId,
  enunciado,
  opciones: orden ? orden.map((original) => opciones[original]) : opciones,
});

/**
 * @param {{ cursoId?: string, modo?: string }} params
 */
export function iniciarSesion({ cursoId, modo, examenId = null, debiles = [], usuarioId = 'anon' }) {
  let elegidas;

  if (modo === 'examen') {
    // Sin respaldo a propósito. En los demás modos, quedarse sin preguntas de
    // un curso y servir otras es un mal menor. Aquí no: presentar preguntas
    // cualesquiera como si fueran el examen de una convocatoria concreta es
    // inventarse el examen, y el alumno saldría creyendo que ya sabe cómo fue.
    // Si no están cargadas, la sesión viene vacía y la pantalla lo dice.
    elegidas = BANCO.filter((p) => p.examenId === examenId);
  } else if (modo === 'diario') {
    // El reto ataca los cursos donde más puntos se pierden, y es el mismo
    // durante todo el día: la semilla incluye la fecha y el usuario.
    const semilla = `${usuarioId}|${new Date().toISOString().slice(0, 10)}`;
    elegidas = elegirPreguntasDelDia(BANCO, debiles, 5, semilla);
  } else {
    const semilla = Date.now() % 100000;

    if (modo === 'diagnostico') {
      // Se reparte por cursos, y no se saca al azar del banco entero.
      //
      // Al azar, el diagnóstico refleja de qué curso hay más preguntas
      // cargadas, no qué necesita medirse. Con 58 de 60 en trigonometría, las
      // diez preguntas salían casi todas de ahí y el índice pretendía estimar
      // el nivel general de alguien a partir de un solo curso. Rotando entre
      // cursos, cargar más de uno mejora ese curso sin desequilibrar el resto.
      const porCurso = new Map();
      for (const p of barajar(BANCO, semilla)) {
        if (!porCurso.has(p.cursoId)) porCurso.set(p.cursoId, []);
        porCurso.get(p.cursoId).push(p);
      }

      const turnos = [...porCurso.values()];
      elegidas = [];
      for (let vuelta = 0; elegidas.length < Math.min(BANCO.length, 10); vuelta += 1) {
        let hubo = false;
        for (const cola of turnos) {
          if (elegidas.length >= 10) break;
          if (cola[vuelta]) { elegidas.push(cola[vuelta]); hubo = true; }
        }
        if (!hubo) break;
      }
    } else {
      const candidatas = BANCO.filter((p) => p.cursoId === cursoId);
      const fuente = candidatas.length ? candidatas : BANCO;
      elegidas = barajar(fuente, semilla).slice(0, Math.min(fuente.length, 8));
    }
  }

  const sesionId = `s-${Math.random().toString(36).slice(2, 10)}`;

  /*
   * Las alternativas se barajan en cada sesión, en el servidor.
   *
   * El banco original tenía las diez preguntas con la respuesta en A. Un
   * alumno que marcara siempre A sacaba 100% y el índice de preparación, que
   * es el número del que vive el producto, calculaba un resultado perfecto
   * sobre datos basura. Repartir la clave al escribir las preguntas ayuda,
   * pero no basta: depende de que cada persona que cargue contenido se
   * acuerde. Barajar aquí lo garantiza para todo el banco, el de hoy y el que
   * se cargue mañana.
   *
   * `orden[i]` es la alternativa original que se enseña en la posición `i`.
   * Se guarda en la sesión para corregir contra lo que el alumno vio, no
   * contra el orden del archivo.
   */
  const ordenes = new Map(elegidas.map((p) => [
    p.id,
    barajar([...p.opciones.keys()], Math.floor(Math.random() * 2 ** 31)),
  ]));

  sesiones.set(sesionId, {
    preguntas: elegidas,
    ordenes,
    respuestas: new Map(),
    inicio: Date.now(),
    modo: modo ?? 'curso',
    usuarioId,
  });

  return {
    sesionId,
    cursoId: cursoId ?? null,
    examenId,
    modo: modo ?? 'curso',
    total: elegidas.length,
    preguntas: elegidas.map((p) => versionPublica(p, ordenes.get(p.id))),
  };
}

/**
 * Corrige una respuesta. Es idempotente: reenviar la misma pregunta no cambia
 * el veredicto ni cuenta dos veces.
 *
 * @param {{ sesionId: string, preguntaId: string, opcion: number, segundos: number }} params
 */
export function responderPregunta({ sesionId, preguntaId, opcion, segundos }) {
  const sesion = sesiones.get(sesionId);
  if (!sesion) throw new Error('Esta sesión de práctica ya no está activa.');

  if (sesion.respuestas.has(preguntaId)) return sesion.respuestas.get(preguntaId);

  const pregunta = sesion.preguntas.find((p) => p.id === preguntaId);
  if (!pregunta) throw new Error('Pregunta fuera de esta sesión.');

  // `opcion` es la posición en pantalla. Se traduce a la alternativa original
  // antes de corregir; comparar la posición con la clave del archivo daría por
  // buena la respuesta equivocada en cuanto el orden cambia.
  const orden = sesion.ordenes?.get(preguntaId) ?? [...pregunta.opciones.keys()];
  const elegida = orden[Number(opcion)];

  const veredicto = {
    preguntaId,
    // La correcta se devuelve en la posición en que el alumno la vio, para
    // que la pantalla ilumine el botón bueno y no el que ocupaba ese sitio en
    // el archivo.
    correcta: orden.indexOf(pregunta.correcta),
    // Y la original, que es la que usan las explicaciones de fallo: están
    // escritas para "la alternativa B del archivo", no para "el segundo botón".
    opcionOriginal: elegida,
    acerto: elegida === pregunta.correcta,
    explicacion: pregunta.explicacion,
    dificultad: pregunta.dificultad,
    cursoId: pregunta.cursoId,
    temaId: pregunta.temaId,
    segundos,
  };
  sesion.respuestas.set(preguntaId, veredicto);
  return veredicto;
}

/** @param {{ sesionId: string }} params */
export function cerrarSesion({ sesionId }) {
  const sesion = sesiones.get(sesionId);
  if (!sesion) throw new Error('Esta sesión de práctica ya no está activa.');

  const veredictos = [...sesion.respuestas.values()];
  const aciertos = veredictos.filter((v) => v.acerto).length;
  sesiones.delete(sesionId);

  // El reto diario lo corrige el servidor y se registra una sola vez al día:
  // por eso sus intentos valen el doble y medio que los de práctica libre.
  const esDiario = sesion.modo === 'diario';
  const registro = esDiario
    ? registrarReto({ usuarioId: sesion.usuarioId, aciertos, total: sesion.preguntas.length })
    : null;

  return {
    aciertos,
    total: sesion.preguntas.length,
    segundos: Math.round((Date.now() - sesion.inicio) / 1000),
    modo: sesion.modo,
    racha: registro?.racha ?? null,
    intentos: veredictos.map((v) => ({
      temaId: v.temaId,
      cursoId: v.cursoId,
      acerto: v.acerto,
      dificultad: v.dificultad,
      fecha: Date.now(),
      // Criterio de honestidad: solo el reto queda marcado como verificado.
      verificado: esDiario,
    })),
  };
}
