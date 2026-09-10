/**
 * Datos de admisión.
 *
 * Devuelve exactamente la misma forma que el recurso `admision/datos` del
 * Worker, para que la pantalla no distinga entre estar conectada y no estarlo.
 * Cuando el raspador esté desplegado, estos datos los sustituye lo que una
 * persona haya confirmado, y la pantalla no cambia ni una línea.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * DE DÓNDE SALE CADA COSA, QUE AQUÍ ES LO QUE MÁS IMPORTA
 *
 * `estado: 'ejemplo'` — cifras de muestra. **No son datos reales de San
 * Marcos.** Están para que la pantalla se pueda ver y ajustar; el raspador las
 * reemplaza, o las escribes tú. Mientras tengan ese estado, la pantalla lo dice
 * en cada tarjeta y no las presenta como si fueran ciertas.
 *
 * `estado: 'verificado'` — sale del temario del proyecto, que se contrastó
 * contra el prospecto. Es el reparto de preguntas por curso, y es el dato más
 * útil de toda la pantalla porque no depende de ninguna convocatoria: dice
 * dónde están los puntos.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { cursosDelArea, PUNTOS_POR_PREGUNTA } from './temario.js';

/** Los pasos del proceso. Cambian poco y no dependen de la convocatoria. */
const PASOS = [
  {
    titulo: 'Reúne tus documentos',
    detalle: 'Certificado de estudios, DNI y la constancia de egresado si ya terminaste el colegio. '
      + 'Es el paso que más gente deja para el final y el que más tarda si falta un papel del colegio.',
  },
  {
    titulo: 'Inscríbete en la fecha',
    detalle: 'La inscripción abre y cierra con semanas de antelación al examen. Fuera de ese plazo no hay excepción.',
  },
  {
    titulo: 'Elige área y carrera',
    detalle: 'El área decide qué cursos te toman y con qué peso. Cambiarla después de inscribirte no suele poder hacerse.',
  },
  {
    titulo: 'Paga el derecho de postulación',
    detalle: 'El monto depende de si vienes de colegio público o privado.',
  },
  {
    titulo: 'Rinde el examen',
    detalle: 'Se entra al campus en una franja horaria estrecha. Quien llega fuera de ella pierde la convocatoria.',
  },
];

/**
 * Cifras de ejemplo por carrera. **No son datos reales.**
 * @type {{carreraId:string, carrera:string, area:string, vacantes:number, postulantes:number, corte:number}[]}
 */
const CIFRAS_DE_EJEMPLO = [
  { carreraId: 'sistemas', carrera: 'Ingeniería de Sistemas', area: 'B', vacantes: 45, postulantes: 1240, corte: 1187 },
  { carreraId: 'industrial', carrera: 'Ingeniería Industrial', area: 'B', vacantes: 40, postulantes: 1502, corte: 1203 },
  { carreraId: 'medicina', carrera: 'Medicina Humana', area: 'A', vacantes: 85, postulantes: 3410, corte: 1456 },
  { carreraId: 'derecho', carrera: 'Derecho', area: 'E', vacantes: 90, postulantes: 1870, corte: 1264 },
  { carreraId: 'economia', carrera: 'Economía', area: 'D', vacantes: 60, postulantes: 980, corte: 1104 },
];

/** Cronograma de ejemplo. **No son fechas reales.** */
const JORNADAS_DE_EJEMPLO = [
  { fecha: Date.UTC(2027, 2, 6), areas: ['D', 'E'] },
  { fecha: Date.UTC(2027, 2, 7), areas: ['B', 'C'] },
  { fecha: Date.UTC(2027, 2, 13), areas: ['A'] },
];

/**
 * Cómo se reparten los puntos del examen en un área.
 *
 * Este sí es dato verificado, y es el que convierte la pantalla en algo útil:
 * un postulante que ve que Habilidad matemática vale 200 puntos y Trigonometría
 * 40 deja de repartir su tiempo a partes iguales.
 *
 * @param {string} area
 */
function repartoDelExamen(area) {
  const cursos = cursosDelArea(area);
  const preguntas = cursos.reduce((s, c) => s + c.preguntas, 0);
  const puntos = preguntas * PUNTOS_POR_PREGUNTA;

  return {
    area,
    preguntas,
    puntos,
    porPregunta: PUNTOS_POR_PREGUNTA,
    cursos: cursos
      .map((c) => ({
        cursoId: c.cursoId,
        nombre: c.nombre,
        preguntas: c.preguntas,
        puntos: c.preguntas * PUNTOS_POR_PREGUNTA,
        peso: c.preguntas / preguntas,
      }))
      .sort((a, b) => b.preguntas - a.preguntas || a.nombre.localeCompare(b.nombre, 'es')),
    estado: 'verificado',
  };
}

/**
 * @param {{ universidadId?:string, area?:string, carreraId?:string }} params
 */
export function datosDeAdmision({ universidadId = 'unmsm', area = 'B', carreraId = null } = {}) {
  const cifras = CIFRAS_DE_EJEMPLO.map((c) => ({
    ...c,
    proceso: '2027-I',
    porVacante: Math.round((c.postulantes / c.vacantes) * 10) / 10,
    // Cuánto por encima del corte conviene apuntar. El corte se mueve entre
    // convocatorias, así que apuntar justo a él es apuntar a fallar por poco.
    objetivo: Math.min(1800, Math.round((c.corte * 1.08) / 10) * 10),
    estado: 'ejemplo',
  }));

  return {
    universidadId,
    proceso: '2027-I',
    // La pantalla necesita saber si puede presentar esto como cierto.
    hayDatosReales: false,
    cronograma: JORNADAS_DE_EJEMPLO.map((j) => ({ ...j, estado: 'ejemplo' })),
    pasos: PASOS,
    reparto: repartoDelExamen(area),
    cifras,
    tuCarrera: cifras.find((c) => c.carreraId === carreraId) ?? null,
  };
}
