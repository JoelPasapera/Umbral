/**
 * Repositorio de autenticación.
 *
 * El token vive aquí y solo aquí. Ninguna vista lo toca ni lo guarda: piden
 * `usuarioActual()` y reciben datos, no credenciales.
 */

import { pedir } from '../client.js';

const CLAVE_TOKEN = 'umbral:sesion';

const leerToken = () => localStorage.getItem(CLAVE_TOKEN);
const guardarToken = (token) => localStorage.setItem(CLAVE_TOKEN, token);
const borrarToken = () => localStorage.removeItem(CLAVE_TOKEN);

/** @returns {Promise<object|null>} */
export async function usuarioActual() {
  const token = leerToken();
  if (!token) return null;
  const usuario = await pedir('auth/sesion', { token });
  if (!usuario) borrarToken();
  return usuario;
}

/** @param {{ correo:string, clave:string }} datos */
export async function entrar(datos) {
  const { token, usuario } = await pedir('auth/entrar', datos);
  guardarToken(token);
  return usuario;
}

/** @param {object} datos */
export async function registrar(datos) {
  return pedir('auth/registrar', datos);
}

export async function salir() {
  const token = leerToken();
  borrarToken();
  if (token) await pedir('auth/salir', { token }).catch(() => {});
}

/** @param {string} correo */
export async function recuperar(correo) {
  return pedir('auth/recuperar', { correo });
}

/**
 * Pregunta al servidor si esta sesión es de administrador.
 *
 * Se llama antes de cada acción privilegiada, nunca una sola vez al entrar.
 * El resultado sirve para mostrar u ocultar, jamás para autorizar por sí solo:
 * la autorización de verdad la hace el servidor otra vez, al recibir la orden.
 */
export async function esAdmin() {
  const token = leerToken();
  if (!token) return false;
  const { esAdmin } = await pedir('auth/admin', { token });
  return esAdmin === true;
}
