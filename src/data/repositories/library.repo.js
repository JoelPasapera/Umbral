/**
 * Repositorio de estudio.
 *
 * La caché se invalida por evento, no por reloj. En la versión anterior la
 * biblioteca guardaba cinco minutos y nadie la limpiaba al publicar: un
 * administrador subía material, entraba a verlo y no aparecía.
 */

import { pedir } from '../client.js';
import { suscribir, EVENTOS } from '../../core/bus.js';

const cache = new Map();
const clave = (params) => JSON.stringify(params ?? {});

/**
 * @param {{ cursoId?: string, busqueda?: string }} [params]
 */
export async function materiales(params = {}) {
  const k = clave(params);
  if (cache.has(k)) return cache.get(k);
  const datos = await pedir('estudio/materiales', { ...params, token: localStorage.getItem('umbral:sesion') });
  cache.set(k, datos);
  return datos;
}

/** @param {string} id */
export async function resumen(id) {
  return pedir('estudio/resumen', { id });
}

export function invalidar() {
  cache.clear();
}

suscribir(EVENTOS.META_CAMBIADA, invalidar);
