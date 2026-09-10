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
 *   `url`      — todas apuntan a `ejemplo.pe`. No invento direcciones reales
 *                que no puedo comprobar; un enlace roto es peor que ninguno.
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

export const EXAMENES = UNIVERSIDADES.flatMap((u) =>
  PROCESOS.map((c) => {
    const archivo = `${u.id}-${enRuta(c.proceso)}-area-${c.area.toLowerCase()}`;
    return {
      id: `ex-${archivo}`,
      // Identificador estable de la convocatoria, distinto del `id` de fila.
      // El `id` lo reasigna el panel al sembrar y cambiaría en cada arranque;
      // este no. Es el que viaja en la dirección de practicar y el que llevará
      // cada pregunta cuando se carguen, así que un enlace guardado sigue
      // valiendo mañana.
      examenId: archivo,
      tipo: 'examen',
      proceso: c.proceso,
      area: c.area,
      // Un examen completo no es de un curso: los toca todos. Por eso no tiene
      // `cursoId`, y el filtro por curso no lo esconde en la biblioteca.
      cursoId: null,
      temaId: null,
      origen: 'examen',
      licencia: 'oficial',
      universidadId: u.id,
      titulo: `Examen de admisión ${c.proceso}`,
      detalle: `Área ${c.area}. La prueba completa tal como se rindió.`,
      fuente: `Publicado por la ${u.nombre}`,
      url: `https://ejemplo.pe/examenes/${archivo}`,
    };
  }));
