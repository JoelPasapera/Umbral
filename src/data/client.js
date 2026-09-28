/**
 * Adaptador de datos.
 *
 * Esta es la única frontera con el mundo exterior. Los repositorios piden datos
 * aquí; ninguna vista importa nunca este archivo, y mucho menos un SDK de
 * proveedor.
 *
 * La migración al backend real va **recurso a recurso**, no de golpe.
 * `EN_EL_SERVIDOR` es la frontera: lo que está en esa lista lo atiende el
 * Worker y ya no se puede falsear desde el navegador; lo demás lo sigue
 * atendiendo el simulado. Poder mover uno cada vez es lo que permite hacer esto
 * sin parar el resto del trabajo.
 */

import { API, RECURSOS_EN_SERVIDOR } from './config.js';

/** Dónde se guarda el testigo de sesión. */
const CLAVE_SESION = 'umbral:sesion';

/**
 * Recursos que ya atiende el Worker. Vacío si no hay API configurada: sin
 * dirección a la que llamar, apuntar un recurso al servidor solo produciría una
 * pantalla rota.
 */
const EN_EL_SERVIDOR = new Set(API ? RECURSOS_EN_SERVIDOR : []);

/** @param {string} recurso */
export const loSirveElServidor = (recurso) => EN_EL_SERVIDOR.has(recurso);

/**
 * Llama al Worker.
 *
 * El testigo va en la cabecera `Authorization` y no en el cuerpo, para que no
 * acabe en los registros de acceso del proveedor ni en el historial. Por eso
 * se saca de los parámetros antes de enviarlos.
 *
 * @param {string} recurso @param {object} params
 */
async function pedirAlServidor(recurso, params) {
  const { token, ...resto } = params ?? {};
  const testigo = token ?? localStorage.getItem(CLAVE_SESION);

  const cabeceras = { 'Content-Type': 'application/json' };
  if (testigo) cabeceras.Authorization = `Bearer ${testigo}`;

  let respuesta;
  try {
    respuesta = await fetch(API, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify({ recurso, params: resto }),
    });
  } catch {
    // Distinguir "no hay red" de "el servidor dijo que no" importa: al alumno
    // en un colectivo hay que decirle que reintente, no que algo se rompió.
    throw new Error('No se pudo conectar. Revisa tu conexión e inténtalo otra vez.');
  }

  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401) localStorage.removeItem(CLAVE_SESION);
    throw new Error(cuerpo?.error ?? 'No se pudo completar la operación.');
  }
  return cuerpo;
}

/**
 * @param {string} recurso
 * @param {object} [params]
 * @returns {Promise<any>}
 */
export async function pedir(recurso, params = {}) {
  if (EN_EL_SERVIDOR.has(recurso)) return pedirAlServidor(recurso, params);

  const { responder } = await import('./mock/fixtures.js');
  return responder(recurso, params);
}

/** Mientras quede algo por mudar, el aviso de datos de ejemplo sigue en pie. */
export const esSimulado = () => EN_EL_SERVIDOR.size === 0;

/** Cuánto se ha mudado ya, para poder decirlo con una cifra y no con una impresión. */
export const estadoMigracion = () => ({ enServidor: [...EN_EL_SERVIDOR], hayApi: Boolean(API) });
