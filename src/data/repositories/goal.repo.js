/**
 * Repositorio de la meta: qué examen prepara la persona y cómo pesa cada curso.
 */

import { pedir } from '../client.js';
import { leer } from '../../core/store.js';

let cache = null;

const usuario = () => leer().sesion?.id ?? 'u-1';

/** @returns {Promise<import('../../domain/readiness.js').Examen>} */
export async function metaActiva() {
  if (cache) return cache;
  cache = await pedir('meta/activa', { usuarioId: usuario() });
  return cache;
}

/** Universidades y carreras disponibles. */
export async function catalogo() {
  return pedir('meta/catalogo');
}

/**
 * Cambia la meta. Invalida la caché porque todo el diagnóstico depende de los
 * pesos por curso, y esos cambian con la carrera.
 * @param {{ universidadId: string, carreraId: string }} eleccion
 */
export async function elegir(eleccion) {
  cache = await pedir('meta/elegir', { ...eleccion, usuarioId: usuario() });
  return cache;
}

export function invalidar() {
  cache = null;
}

/**
 * Datos de admisión de la universidad de tu meta.
 *
 * Mismo contrato en el simulado y en el Worker, así que la pantalla no cambia
 * cuando el raspador entre en funcionamiento.
 *
 * @param {string} [universidadId]
 */
export async function admision(universidadId) {
  const [servidor, meta] = await Promise.all([
    pedir('admision/datos', { universidadId, token: localStorage.getItem('umbral:sesion') }),
    metaActiva().catch(() => null),
  ]);

  const { ESTATICO } = await import('../mock/admision.js');
  const { componerAdmision } = await import('../../domain/admision.js');
  const { cursosDelArea } = await import('../mock/temario.js');

  const area = meta?.area ?? 'B';
  // La composición ocurre aquí, en el cliente, y no en cada adaptador. Si la
  // repitiera cada uno, volverían a separarse y la pantalla se rompería al
  // mover el recurso al servidor: eso ya pasó una vez.
  return componerAdmision({
    area,
    cursos: cursosDelArea(area),
    estatico: ESTATICO,
    servidor,
  });
}
