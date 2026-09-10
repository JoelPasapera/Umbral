/**
 * Ciclo de vida de la sesión.
 *
 * Guarda el usuario en el estado compartido y avisa por el bus. Nada más:
 * la validación real vive en el repositorio, y la autorización, en el servidor.
 */

import { escribir, leer } from './store.js';
import { publicar, EVENTOS } from './bus.js';
import { usuarioActual, salir } from '../data/repositories/auth.repo.js';

let comprobando = null;

/**
 * Devuelve el usuario de la sesión, consultando al servidor la primera vez.
 * Las llamadas simultáneas comparten la misma consulta: sin esto, cuatro
 * rutas cargando a la vez lanzan cuatro peticiones idénticas.
 *
 * @param {boolean} [forzar]
 * @returns {Promise<object|null>}
 */
export async function sesion(forzar = false) {
  if (!forzar && leer().sesion) return leer().sesion;
  if (comprobando) return comprobando;

  comprobando = usuarioActual()
    .catch(() => null)
    .then((usuario) => {
      escribir({ sesion: usuario });
      comprobando = null;
      return usuario;
    });

  return comprobando;
}

export const haySesion = async () => Boolean(await sesion());

/** @param {object} usuario */
export function establecerSesion(usuario) {
  escribir({ sesion: usuario });
  publicar(EVENTOS.SESION_CAMBIO, usuario);
}

export async function cerrarSesion() {
  await salir();
  escribir({ sesion: null, meta: null, preparacion: null });
  publicar(EVENTOS.SESION_CAMBIO, null);
  window.location.hash = '#/entrar';
}
