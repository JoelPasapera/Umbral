/**
 * Datos de admisión de San Marcos.
 *
 * Devuelve la misma forma que el recurso `admision/datos` del Worker, para que
 * la pantalla no distinga entre estar conectada y no estarlo. Cuando el
 * raspador funcione, lo confirmado sustituye a esto sin tocar la vista.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * TRES ESTADOS, Y LA DIFERENCIA IMPORTA
 *
 *   'oficial'  — publicado por la universidad o por la agencia estatal, con la
 *                dirección guardada al lado. Se puede contrastar en un clic.
 *   'estimado' — de fuente no oficial o de otra convocatoria. Sirve de
 *                referencia y la pantalla lo dice.
 *   'falta'    — no lo tenemos. Se declara el hueco en vez de rellenarlo.
 *
 * El último estado es el que más cuesta y el que más protege. El corte alimenta
 * `readiness.js`, y un corte inventado que parezca real convierte "te faltan 14
 * puntos" en una mentira que el alumno no puede detectar. Es mejor decir que no
 * se sabe y enlazar al acta.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { PUNTOS_POR_PREGUNTA } from './temario.js';

const OCA = 'https://admision.unmsm.edu.pe/portal/';
const ANDINA = 'https://andina.pe/agencia/noticia-san-marcos-definio-cuando-sera-examen-admision-2027i-aqui-cronograma-1087990.aspx';

/**
 * Las cinco áreas de San Marcos.
 *
 * Ojo con esto: la B y la C son **exámenes distintos**. Ciencias Básicas es la
 * B; Ingenierías es la C. `temario.js` todavía las trae fundidas en una sola
 * ("B — Ciencias Básicas e Ingenierías") y no declara la C, así que el reparto
 * de preguntas que ve un postulante a ingeniería está sin contrastar. Hay una
 * prueba que lo señala en cada corrida.
 */
export const AREAS = Object.freeze({
  A: 'Ciencias de la Salud',
  B: 'Ciencias Básicas',
  C: 'Ingenierías',
  D: 'Ciencias Económicas y de la Gestión',
  E: 'Humanidades y Ciencias Jurídicas y Sociales',
});

/**
 * Cronograma del examen 2027-I.
 *
 * Aprobado por el Consejo Universitario y publicado por la propia UNMSM y por
 * la agencia Andina. Cuatro jornadas en octubre de 2026.
 */
const JORNADAS = [
  { fecha: Date.UTC(2026, 9, 17), areas: ['D', 'E'], detalle: null },
  { fecha: Date.UTC(2026, 9, 18), areas: ['B', 'C'], detalle: 'También el examen especial de todas las áreas.' },
  { fecha: Date.UTC(2026, 9, 24), areas: ['A'], detalle: 'Toda el área A salvo Medicina Humana.' },
  { fecha: Date.UTC(2026, 9, 25), areas: ['A'], detalle: 'Solo Medicina Humana.' },
];

/**
 * Plazos de inscripción, por la letra inicial del primer apellido.
 *
 * Es el dato más urgente de la pantalla y el que no está en ninguna otra: quien
 * se pasa del plazo pierde la convocatoria entera y no hay excepción.
 */
const INSCRIPCION = [
  { letras: 'A, B, C, CH, D, E y F', desde: Date.UTC(2026, 7, 17), hasta: Date.UTC(2026, 7, 30) },
  { letras: 'G, H, I, J, K, L, LL, M, N, Ñ y O', desde: Date.UTC(2026, 7, 31), hasta: Date.UTC(2026, 8, 13) },
  { letras: 'P, Q, R, S, T, U, V, W, X, Y y Z', desde: Date.UTC(2026, 8, 28), hasta: Date.UTC(2026, 9, 9) },
];

/**
 * La fecha del examen para una universidad, un área y una carrera.
 *
 * Es la única fuente de la fecha en todo el proyecto. Antes la pantalla de meta
 * la calculaba como "hoy más 94 días", así que **la cuenta atrás no se movía
 * nunca**: abrieras la aplicación el día que la abrieras, faltaban 94 días. Y
 * contradecía a esta pantalla, que con el cronograma oficial decía 38.
 *
 * Devuelve `null` cuando no se conoce, y eso es lo correcto: una fecha inventada
 * hace que alguien planifique mal sus últimas semanas.
 *
 * @param {{ universidadId:string, area:string, carreraId?:string }} params
 * @returns {number|null} marca UTC del día del examen
 */
export function fechaDeExamen({ universidadId, area, carreraId = null }) {
  if (universidadId !== 'unmsm') return null;
  // Medicina Humana rinde aparte, un día después que el resto del área A.
  const candidatas = JORNADAS.filter((j) => j.areas.includes(area));
  if (!candidatas.length) return null;
  if (area === 'A') {
    const soloMedicina = candidatas.find((j) => /Medicina/.test(j.detalle ?? '') && /Solo/.test(j.detalle ?? ''));
    const resto = candidatas.find((j) => j !== soloMedicina);
    return (carreraId === 'medicina' ? soloMedicina : resto)?.fecha ?? candidatas[0].fecha;
  }
  return candidatas[0].fecha;
}

/** Cifras del conjunto del proceso. De prensa, no del acta. */
const DEL_PROCESO = [
  {
    etiqueta: 'Vacantes en juego',
    valor: '5.804',
    detalle: 'En 81 programas profesionales, en el proceso 2026-II.',
    estado: 'estimado',
    fuente: 'https://larepublica.pe/amp/sociedad/2026/03/16/lista-de-ingresantes-a-la-universidad-nacional-mayor-de-san-marcos-2026-revisa-el-link-oficial-con-los-resultados-de-las-cuatro-fechas-del-examen-de-admision-evat-1353840',
  },
  {
    etiqueta: 'Medicina Humana',
    valor: '108 vacantes',
    detalle: 'Más de 4.000 postulantes compitieron por ellas en 2026-II: unos 37 por vacante.',
    estado: 'estimado',
    fuente: 'https://www.exitosanoticias.pe/actualidad/examen-admision-unmsm-2026-ii-alcanzaste-vacante-aqui-link-oficial-resultados-n171231',
  },
  {
    etiqueta: 'Entrega de constancias',
    valor: 'Del 2 al 6 de noviembre de 2026',
    detalle: 'Para quienes alcancen vacante en el proceso 2027-I.',
    estado: 'oficial',
    fuente: ANDINA,
  },
];

/** Los pasos del proceso. */
const PASOS = [
  {
    titulo: 'Comprueba que puedes postular',
    detalle: 'Pueden los que cursan quinto de secundaria en 2026 y los egresados de EBR o EBA. '
      + 'De primero a cuarto se puede rendir, pero solo de forma referencial: no da vacante ni constancia.',
  },
  {
    titulo: 'Inscríbete en TU plazo',
    detalle: 'El plazo depende de la letra inicial de tu primer apellido y no es el mismo para todos. '
      + 'Fuera de él no hay excepción: se pierde la convocatoria entera.',
  },
  {
    titulo: 'Elige área y carrera',
    detalle: 'El área decide qué cursos te toman, con qué peso y en qué día rindes. '
      + 'Ciencias Básicas (B) e Ingenierías (C) son exámenes distintos aunque caigan el mismo día.',
  },
  {
    titulo: 'Descarga tu carné de postulante',
    detalle: 'Se imprime en A4 y se lleva junto al DNI original. Sin uno de los dos no se entra.',
  },
  {
    titulo: 'Llega dentro de la franja horaria',
    detalle: 'En procesos recientes el ingreso al campus fue de 6:00 a 8:30 de la mañana, y quien llegó '
      + 'después no rindió. No se entra con lápiz, regla, borrador, gorra ni mochila.',
  },
];

/**
 * Lo que aporta el simulado, con la misma forma con la que responde el Worker.
 *
 * Solo lo que en producción vendría de la base: jornadas, cifras y cortes. Lo
 * estático —áreas, plazos, pasos— lo aporta el cliente, y `componerAdmision`
 * junta las dos mitades. Así los dos adaptadores no pueden separarse.
 */
export function datosDeAdmision({ universidadId = 'unmsm' } = {}) {
  return {
    universidadId,
    proceso: '2027-I',
    jornadas: JORNADAS.map((j) => ({ ...j, estado: 'oficial' })),
    cifras: DEL_PROCESO,
    // Sin acta cargada. La pantalla declara el hueco en vez de rellenarlo.
    cortes: [],
  };
}

/** Lo estático, que viaja con el cliente y no depende del adaptador. */
export const ESTATICO = Object.freeze({
  areas: AREAS,
  inscripcion: INSCRIPCION,
  pasos: PASOS,
  porPregunta: PUNTOS_POR_PREGUNTA,
  fuenteCronograma: ANDINA,
  fuentePortal: OCA,
  // El temario funde Ciencias Básicas con Ingenierías y no declara la C, así
  // que el reparto de preguntas está sin contrastar contra el prospecto.
  repartoContrastado: false,
  motivoSinCortes: 'El puntaje del último ingresante sale del acta oficial de cada convocatoria, que San '
    + 'Marcos publica en PDF junto con los resultados. Todavía no está cargada.',
});
