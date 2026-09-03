/**
 * Adaptador de datos.
 *
 * Esta es la única frontera con el mundo exterior. Los repositorios piden
 * datos aquí; ningún componente ni vista importa nunca este archivo, y
 * mucho menos un SDK de proveedor.
 *
 * Hoy devuelve datos de ejemplo. Cuando exista el backend real, se cambia
 * `ADAPTADOR` y no se toca ni una línea del resto del proyecto.
 */

const ADAPTADOR = 'mock';

/**
 * @param {string} recurso
 * @param {object} [params]
 * @returns {Promise<any>}
 */
export async function pedir(recurso, params = {}) {
  if (ADAPTADOR === 'mock') {
    const { responder } = await import('./mock/fixtures.js');
    return responder(recurso, params);
  }
  throw new Error(`Adaptador no configurado: ${ADAPTADOR}`);
}

export const esSimulado = () => ADAPTADOR === 'mock';
