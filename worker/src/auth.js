/**
 * Sesión y academia en el servidor.
 *
 * Las reglas son las mismas que ya cumplía el simulado, con la diferencia de
 * que ahora se cumplen de verdad, porque el navegador no puede tocarlas:
 *
 *   1. **El código de academia es de matrícula, no un secreto.** Decide a qué
 *      academia perteneces y con qué papel. Que se filtre no da acceso a nada
 *      de nadie: sin correo y clave no se entra.
 *   2. **`esAdmin` y `academiaId` salen de la sesión.** Nunca de la petición.
 *      Todo el aislamiento cuelga de esto.
 *   3. **Google autentica, no registra.** Una identidad de Google que no
 *      corresponde a ninguna cuenta no crea nada: se pide el código como a
 *      todo el mundo. Sin esa regla, cualquiera con un Gmail vería el material
 *      por el que paga una academia.
 */

import { ambito, sinSesion, VIDA_SESION } from './ambito.js';
import {
  ITERACIONES, salNueva, derivar, claveCorrecta, testigoNuevo, huella, idNuevo,
} from './claves.js';

const MAX_INTENTOS = 5;
const BLOQUEO = 15 * 60 * 1000;

/** Papeles que pueden gestionar contenido. */
const GESTIONA = new Set(['coordinacion', 'dueno']);
export const gestionaContenido = (rol) => GESTIONA.has(String(rol ?? ''));

class ErrorDeUso extends Error {
  constructor(mensaje, estado = 400) {
    super(mensaje);
    this.estado = estado;
  }
}
export { ErrorDeUso };

const correoLimpio = (v) => String(v ?? '').trim().toLowerCase();

/**
 * Lo que el cliente puede saber de sí mismo. Ni la derivación de la clave ni la
 * sal salen nunca de aquí, ni siquiera al propio dueño de la cuenta.
 */
const versionPublica = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  correo: usuario.correo,
  rol: usuario.rol,
  academiaId: usuario.academia_id,
  esAdmin: gestionaContenido(usuario.rol),
});

/**
 * Abre sesión y devuelve el testigo. El testigo se devuelve una sola vez; en la
 * base queda su huella.
 *
 * @param {D1Database} db @param {object} usuario @param {number} ahora
 */
async function abrirSesion(db, usuario, ahora) {
  const testigo = testigoNuevo();
  await sinSesion(db).crearSesion({
    token_hash: await huella(testigo),
    usuario_id: usuario.id,
    academia_id: usuario.academia_id,
    creada: ahora,
    expira: ahora + VIDA_SESION,
  });
  return { token: testigo, usuario: versionPublica(usuario) };
}

/**
 * Resuelve el testigo a una sesión utilizable.
 *
 * Es la función de la que cuelga todo lo demás: devuelve la academia con la que
 * se abren los ámbitos. Una sesión vencida se borra en vez de dejarse ahí.
 *
 * @param {D1Database} db @param {string} testigo @param {number} ahora
 * @returns {Promise<{usuarioId:string, academiaId:string, rol:string, esAdmin:boolean}|null>}
 */
export async function quienEs(db, testigo, ahora = Date.now()) {
  if (!testigo) return null;
  const tokenHash = await huella(testigo);
  const fila = await sinSesion(db).sesionPorTestigo(tokenHash);
  if (!fila) return null;

  if (Number(fila.expira) <= ahora) {
    await sinSesion(db).cerrarSesion(tokenHash);
    return null;
  }

  return {
    usuarioId: fila.usuario_id,
    academiaId: fila.academia_id,
    rol: fila.rol,
    nombre: fila.nombre,
    correo: fila.correo,
    esAdmin: gestionaContenido(fila.rol),
  };
}

/**
 * Exige una sesión y devuelve el ámbito ya ligado a su academia. Es la puerta
 * por la que pasa cualquier recurso que toque datos.
 *
 * @param {D1Database} db @param {string} testigo
 */
export async function exigirSesion(db, testigo, ahora = Date.now()) {
  const sesion = await quienEs(db, testigo, ahora);
  if (!sesion) throw new ErrorDeUso('Tu sesión venció. Vuelve a entrar.', 401);
  return { sesion, datos: ambito(db, sesion) };
}

/** @param {D1Database} db @param {string} testigo */
export async function exigirAdmin(db, testigo, ahora = Date.now()) {
  const abierto = await exigirSesion(db, testigo, ahora);
  if (!abierto.sesion.esAdmin) throw new ErrorDeUso('Esta acción es solo del panel.', 403);
  return abierto;
}

/**
 * Registro con código de academia.
 *
 * @param {D1Database} db
 * @param {{correo:string, clave:string, nombre:string, codigoAcademia:string,
 *          anioNacimiento:number, consintioApoderado:boolean, aceptoTerminos:boolean}} datos
 */
export async function registrar(db, datos, ahora = Date.now()) {
  const puerta = sinSesion(db);
  const correo = correoLimpio(datos.correo);
  const nombre = String(datos.nombre ?? '').trim();
  const clave = String(datos.clave ?? '');

  if (!correo.includes('@')) throw new ErrorDeUso('Escribe un correo válido.');
  if (!nombre) throw new ErrorDeUso('Escribe tu nombre.');
  if (clave.length < 8) throw new ErrorDeUso('La clave necesita al menos 8 caracteres.');
  if (!datos.aceptoTerminos) throw new ErrorDeUso('Falta aceptar los términos y la política de privacidad.');

  const invitacion = await puerta.academiaPorCodigo(datos.codigoAcademia);
  if (!invitacion) throw new ErrorDeUso('Ese código de academia no es válido. Pídeselo a tu profesor.');

  const anio = Number(datos.anioNacimiento);
  if (!Number.isInteger(anio) || anio < 1900 || anio > new Date(ahora).getUTCFullYear()) {
    throw new ErrorDeUso('Revisa el año de nacimiento.');
  }
  // Solo el año, y solo para saber si hace falta permiso. La edad exacta no se
  // guarda porque no se necesita para nada.
  const esMenor = new Date(ahora).getUTCFullYear() - anio < 18;
  if (esMenor && !datos.consintioApoderado) {
    throw new ErrorDeUso('Si eres menor de 18 necesitas el permiso de tu padre, madre o apoderado.');
  }

  if (await puerta.cuentaPorCorreo(correo)) {
    throw new ErrorDeUso('Ya hay una cuenta con ese correo. Entra en vez de registrarte.');
  }

  const sal = salNueva();
  const usuario = {
    id: idNuevo('u'),
    academia_id: invitacion.academia.id,
    correo,
    nombre,
    rol: invitacion.rol,
    clave_hash: await derivar(clave, sal, ITERACIONES),
    sal,
    iteraciones: ITERACIONES,
    anio_nacimiento: anio,
    consintio_apoderado: datos.consintioApoderado ? 1 : 0,
    acepto_terminos: 1,
    intentos_fallidos: 0,
    bloqueado_hasta: null,
    creado: ahora,
  };

  await puerta.crearUsuario(usuario);
  return abrirSesion(db, usuario, ahora);
}

/**
 * Entrar con correo y clave.
 *
 * El mensaje de error es el mismo tanto si el correo no existe como si la clave
 * no coincide: distinguirlos convierte el formulario en un buscador de qué
 * correos tienen cuenta.
 *
 * @param {D1Database} db @param {{correo:string, clave:string}} datos
 */
export async function entrar(db, datos, ahora = Date.now()) {
  const puerta = sinSesion(db);
  const correo = correoLimpio(datos.correo);
  const usuario = await puerta.cuentaPorCorreo(correo);
  const generico = 'Correo o clave incorrectos.';

  if (!usuario) {
    // Deriva igualmente para que un correo inexistente no responda antes que
    // uno existente. Sin esto, el tiempo de respuesta delata quién tiene cuenta.
    await derivar(String(datos.clave ?? ''), 'sal-inexistente', ITERACIONES);
    throw new ErrorDeUso(generico, 401);
  }

  if (usuario.bloqueado_hasta && Number(usuario.bloqueado_hasta) > ahora) {
    const minutos = Math.ceil((Number(usuario.bloqueado_hasta) - ahora) / 60000);
    throw new ErrorDeUso(`Demasiados intentos. Vuelve a probar en ${minutos} minutos.`, 429);
  }

  if (!(await claveCorrecta(String(datos.clave ?? ''), usuario))) {
    const intentos = Number(usuario.intentos_fallidos ?? 0) + 1;
    await puerta.marcarIntento(usuario.id, intentos, intentos >= MAX_INTENTOS ? ahora + BLOQUEO : null);
    throw new ErrorDeUso(generico, 401);
  }

  if (Number(usuario.intentos_fallidos ?? 0) > 0) {
    await puerta.marcarIntento(usuario.id, 0, null);
  }
  return abrirSesion(db, usuario, ahora);
}

/** @param {D1Database} db @param {string} testigo */
export async function salir(db, testigo) {
  if (testigo) await sinSesion(db).cerrarSesion(await huella(testigo));
  return { salio: true };
}

/** Lo que la aplicación pregunta al arrancar para saber si sigue dentro. */
export async function sesionActual(db, testigo, ahora = Date.now()) {
  const sesion = await quienEs(db, testigo, ahora);
  if (!sesion) return { sesion: null };
  return {
    sesion: {
      id: sesion.usuarioId,
      nombre: sesion.nombre,
      correo: sesion.correo,
      rol: sesion.rol,
      academiaId: sesion.academiaId,
      esAdmin: sesion.esAdmin,
    },
  };
}
