/**
 * Exámenes de admisión ya rendidos.
 *
 * A diferencia de los libros de editorial, estos no tienen ningún problema de
 * licencia: la propia universidad publica sus exámenes para el postulante. Por
 * eso van con `licencia: 'oficial'` y se le muestran al alumno desde el primer
 * día.
 *
 * Cada convocatoria ofrece dos cosas distintas, y la diferencia importa:
 *
 *   **Practicar** — el examen resuelto dentro de la aplicación, pregunta a
 *   pregunta, con el cronómetro y la corrección. Cuenta para el diagnóstico,
 *   porque es evidencia de verdad.
 *
 *   **Examen** — el PDF tal cual, para imprimirlo o mirarlo entero. No cuenta
 *   para nada, porque la aplicación no ve lo que haces con él y decir lo
 *   contrario sería inventarse evidencia.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUÉ HAY QUE REEMPLAZAR AQUÍ
 *
 * Las doce universidades traen la misma rejilla de seis convocatorias para que
 * la sección se vea homogénea y se pueda trabajar sobre ella. Eso significa
 * que hay tres campos que son andamio y no dato:
 *
 *   `url`      — ya no se escribe aquí: se pega en `src/data/enlaces.js`,
 *                que es el único archivo de enlaces del proyecto.
 *   `proceso`  — el calendario de San Marcos copiado a las demás. Cada casa
 *                tiene el suyo: unas nombran sus procesos por año y número,
 *                otras por fases.
 *   `area`     — el esquema de áreas de San Marcos copiado a las demás. Esto
 *                es lo que más conviene revisar, porque un alumno que ve
 *                "Área D" en otra universidad puede tomárselo en serio.
 *
 * Lo que sí es correcto y no hay que tocar: la licencia, el origen, el
 * identificador estable de cada convocatoria y la forma del registro.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { UNIVERSIDADES } from './universidades.js';
import { enlaceDe } from '../enlaces.js';

/** Convocatorias por universidad. Ver el aviso de arriba: son andamio. */
const PROCESOS = [
  { proceso: '2026-I', area: 'D' },
  { proceso: '2025-II', area: 'D' },
  { proceso: '2025-I', area: 'D' },
  { proceso: '2024-II', area: 'D' },
  { proceso: '2024-I', area: 'D' },
  { proceso: '2023-II', area: 'D' },
];

/** `2026-I` → `2026-1`, para que sirva como nombre de archivo. */
const enRuta = (proceso) => proceso.toLowerCase().replace('-i', '-1').replace('-1i', '-2');

/**
 * San Marcos: exámenes y simulacros REALES, con su fuente verdadera.
 *
 * A diferencia del andamio de las demás universidades, aquí cada entrada es un
 * examen que existe y un enlace comprobado. Dos reglas que no se negocian:
 *
 *   · **Se enlaza a quien publica el material**, no a copias. El examen es de
 *     la UNMSM; lo publican con sus claves y solucionarios las academias en
 *     sus propias páginas. No se enlaza a blogs que lo republican, ni a Scribd
 *     o carpetas de Drive: `pruebas/enlaces.test.mjs` lo impide.
 *   · **La fuente dice la verdad.** "Publicado por la universidad" solo cuando
 *     lo publica la universidad. No encontré un archivo público de exámenes de
 *     la propia UNMSM; el simulacro, en cambio, sí es suyo.
 *
 * Las direcciones viven en `src/data/enlaces.js`, como todas.
 */
const REALES_UNMSM = [
  {
    clave: 'unmsm-2026-2', proceso: '2026-II', area: 'Todas',
    titulo: 'Examen de admisión 2026-II',
    detalle: 'Las cuatro jornadas: 7 de marzo (áreas D y E), 8 de marzo (B y C), 14 de marzo (A, sin Medicina) y 15 de marzo de 2026 (Medicina Humana). Con claves y solucionario.',
    fuente: 'Examen oficial de la UNMSM · lo publica con claves la Academia Saco Oliveros',
    accion: 'Examen y claves ↗',
  },
  {
    clave: 'unmsm-2026-1', proceso: '2026-I', area: 'Todas',
    titulo: 'Examen de admisión 2026-I',
    detalle: 'Todas las áreas, rendidas en octubre de 2025, Medicina Humana incluida, resueltas paso a paso.',
    fuente: 'Examen oficial de la UNMSM · lo resuelve paso a paso la Academia Savia',
    accion: 'Solucionario ↗',
  },
  {
    clave: 'unmsm-2026-1-examenes', proceso: '2026-I', area: 'Todas',
    titulo: 'Exámenes oficiales 2026-I para descargar',
    detalle: 'Los cuadernillos del examen 2026-I de todas las áreas, en PDF, para practicar en condiciones reales.',
    fuente: 'Examen oficial de la UNMSM · lo publica para descarga gratuita la Academia Savia',
    accion: 'Descargar exámenes ↗',
  },
  {
    clave: 'unmsm-archivo-trilce', proceso: 'Años anteriores', area: 'Todas',
    titulo: 'Solucionarios de exámenes anteriores',
    detalle: 'El archivo de solucionarios de San Marcos de procesos pasados.',
    fuente: 'Academia Trilce',
    accion: 'Solucionarios ↗',
    // Es un archivo de varios procesos: no hay un examen concreto que
    // practicar dentro de la aplicación.
    practicable: false,
  },
  {
    clave: 'uni-archivo', universidadId: 'uni', proceso: 'Años anteriores', area: 'Todas',
    titulo: 'Solucionarios de exámenes de admisión de la UNI',
    detalle: 'Los exámenes de la Universidad Nacional de Ingeniería resueltos, de procesos pasados.',
    fuente: 'Exámenes oficiales de la UNI · los publica resueltos la Academia Trilce',
    accion: 'Solucionarios ↗',
    practicable: false,
  },
  {
    clave: 'unac-archivo', universidadId: 'unac', proceso: 'Años anteriores', area: 'Todas',
    titulo: 'Solucionarios de exámenes de admisión de la UNAC',
    detalle: 'Los exámenes de la Universidad Nacional del Callao, con sus claves y solucionarios.',
    fuente: 'Exámenes oficiales de la UNAC · los publica resueltos la Academia Saco Oliveros',
    accion: 'Solucionarios ↗',
    practicable: false,
  },
  {
    clave: 'unmsm-simulacro-2027-1', proceso: '2027-I', area: 'Todas',
    titulo: 'Simulacro presencial oficial 2027-I',
    detalle: 'El simulacro de la propia universidad: mismo formato, mismo campus y misma franja de ingreso que el examen real.',
    fuente: 'Oficina Central de Admisión de la UNMSM',
    accion: 'Ver simulacro ↗',
    practicable: false,
  },
].map((x) => ({
  id: `ex-${x.clave}`,
  examenId: x.clave,
  tipo: 'examen',
  proceso: x.proceso,
  area: x.area,
  cursoId: null,
  temaId: null,
  origen: 'examen',
  licencia: 'oficial',
  universidadId: x.universidadId ?? 'unmsm',
  titulo: x.titulo,
  detalle: x.detalle,
  fuente: x.fuente,
  accion: x.accion,
  practicable: x.practicable !== false,
  url: enlaceDe(`ex-${x.clave}`),
}));

/*
 * Solo exámenes que existen, con su fuente real. Aquí había un andamio que
 * copiaba las seis convocatorias de San Marcos —todas del "área D"— a las
 * doce universidades; ponerles enlaces reales habría sido mentir con aspecto
 * de dato. Las universidades sin una fuente de editor verificada no tienen
 * convocatorias hasta que se carguen las suyas.
 */
export const EXAMENES = [...REALES_UNMSM];
