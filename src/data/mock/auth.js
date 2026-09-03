/**
 * Autenticación.
 *
 * Este módulo hace de servidor. Cuando exista el backend real se reemplaza
 * por él con el mismo contrato, y nada más del proyecto cambia.
 *
 * Cuatro reglas que se cumplen aquí y que la versión anterior no tenía:
 *
 * 1. La contraseña nunca se guarda en claro. Ni en una maqueta: si el hábito
 *    no está en el código de ejemplo, no llega al de verdad.
 *
 * 2. Los mensajes de error no revelan si un correo existe. "Correo o
 *    contraseña incorrectos" siempre, nunca "ese usuario no existe". Lo
 *    segundo convierte el formulario en una lista de clientes.
 *
 * 3. `esAdmin` lo decide el servidor y se comprueba en cada acción. El
 *    cliente puede saberlo para esconder un botón, jamás para autorizar.
 *
 * 4. Hay recuperación de contraseña. Sin ella, quien olvida la suya pierde
 *    la cuenta y todo su progreso.
 */

import { resolverCodigo, academia, ROLES, gestionaContenido, CODIGOS_DEMO } from './tenants.js';

const usuarios = new Map();
const sesiones = new Map();
const intentosFallidos = new Map();

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000;
const EDAD_MINIMA = 14;
const EDAD_CONSENTIMIENTO = 18;

const codificador = new TextEncoder();

async function resumir(clave, sal) {
  const datos = codificador.encode(`${sal}:${clave}`);
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const salAleatoria = () =>
  [...globalThis.crypto.getRandomValues(new Uint8Array(16))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const normalizarCorreo = (valor) => String(valor ?? '').trim().toLowerCase();
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Lo que el cliente puede ver de un usuario. Nunca sale de aquí nada más.
 *
 * `academiaId` va incluido porque la interfaz necesita mostrar de qué academia
 * es. Pero el servidor NUNCA lo lee de vuelta desde el cliente: lo resuelve
 * otra vez desde la sesión en cada petición.
 */
const versionPublica = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  correo: usuario.correo,
  rol: usuario.rol,
  academiaId: usuario.academiaId,
  academia: academia(usuario.academiaId).nombre,
  esAdmin: gestionaContenido(usuario.rol),
  creado: usuario.creado,
});

function comprobarBloqueo(correo) {
  const registro = intentosFallidos.get(correo);
  if (!registro) return;
  if (registro.fallos < MAX_INTENTOS) return;
  const restante = registro.hasta - Date.now();
  if (restante > 0) {
    const minutos = Math.ceil(restante / 60000);
    throw new Error(`Demasiados intentos. Vuelve a probar en ${minutos} minutos.`);
  }
  intentosFallidos.delete(correo);
}

function anotarFallo(correo) {
  const registro = intentosFallidos.get(correo) ?? { fallos: 0, hasta: 0 };
  registro.fallos += 1;
  if (registro.fallos >= MAX_INTENTOS) registro.hasta = Date.now() + BLOQUEO_MS;
  intentosFallidos.set(correo, registro);
}

/**
 * Valida la edad declarada.
 *
 * Se pide solo el año, no la fecha completa: para decidir si alguien puede
 * abrir una cuenta basta el año, y pedir menos datos de un menor es la
 * postura correcta.
 */
function validarEdad(anioNacimiento, permisoApoderado) {
  const anio = Number(anioNacimiento);
  const actual = new Date().getFullYear();
  if (!Number.isInteger(anio) || anio < 1930 || anio > actual) {
    throw new Error('Escribe tu año de nacimiento.');
  }
  const edad = actual - anio;
  if (edad < EDAD_MINIMA) {
    throw new Error(
      `Umbral es para postulantes de ${EDAD_MINIMA} años en adelante. Si eres menor, pide a un adulto que te acompañe.`,
    );
  }
  if (edad < EDAD_CONSENTIMIENTO && permisoApoderado !== true) {
    throw new Error('Necesitas el permiso de tu padre, madre o apoderado para crear la cuenta.');
  }
  return edad;
}

/**
 * @param {{ correo:string, clave:string, nombre:string, anioNacimiento:number,
 *           aceptaTerminos:boolean, permisoApoderado?:boolean }} datos
 */
export async function registrarCuenta(datos) {
  const correo = normalizarCorreo(datos.correo);
  if (!CORREO_VALIDO.test(correo)) throw new Error('Ese correo no tiene un formato válido.');
  if (String(datos.clave ?? '').length < 8) {
    throw new Error('La contraseña necesita al menos 8 caracteres.');
  }
  if (datos.aceptaTerminos !== true) {
    throw new Error('Tienes que aceptar los términos y la política de privacidad.');
  }
  validarEdad(datos.anioNacimiento, datos.permisoApoderado);

  if (usuarios.has(correo)) throw new Error('Ya existe una cuenta con ese correo.');

  // El código decide a qué academia entras y con qué rol. Nadie se une por su
  // cuenta, y el rol no se puede pedir: se deriva del código que dio la
  // academia. Un alumno con el código de alumno jamás sale profesor.
  const invitacion = resolverCodigo(datos.codigoAcademia);

  const sal = salAleatoria();
  const usuario = {
    id: `u-${usuarios.size + 1}`,
    correo,
    nombre: String(datos.nombre ?? '').trim().slice(0, 80) || correo.split('@')[0],
    sal,
    resumen: await resumir(datos.clave, sal),
    anioNacimiento: Number(datos.anioNacimiento),
    academiaId: invitacion.academiaId,
    rol: invitacion.rol,
    creado: Date.now(),
  };
  usuarios.set(correo, usuario);
  return versionPublica(usuario);
}

/** @param {{ correo:string, clave:string }} datos */
export async function iniciarSesion({ correo, clave }) {
  const dir = normalizarCorreo(correo);
  comprobarBloqueo(dir);

  const usuario = usuarios.get(dir);
  const coincide = usuario && (await resumir(clave, usuario.sal)) === usuario.resumen;

  if (!coincide) {
    anotarFallo(dir);
    // Mismo mensaje exista o no la cuenta.
    throw new Error('Correo o contraseña incorrectos.');
  }

  intentosFallidos.delete(dir);
  const token = `t-${salAleatoria()}`;
  sesiones.set(token, { usuarioId: usuario.id, correo: dir, creado: Date.now() });
  return { token, usuario: versionPublica(usuario) };
}

/** @param {{ token:string }} datos */
export async function usuarioDeSesion({ token }) {
  const sesion = sesiones.get(token);
  if (!sesion) return null;
  const usuario = usuarios.get(sesion.correo);
  return usuario ? versionPublica(usuario) : null;
}

/** @param {{ token:string }} datos */
export async function cerrarSesionServidor({ token }) {
  sesiones.delete(token);
  return { ok: true };
}

/**
 * Recuperación de contraseña.
 *
 * Responde siempre lo mismo, exista o no la cuenta. Si contestara distinto,
 * cualquiera podría averiguar qué correos están registrados.
 */
export async function recuperarClave({ correo }) {
  const dir = normalizarCorreo(correo);
  if (usuarios.has(dir)) console.info(`[simulado] enlace de recuperación para ${dir}`);
  return {
    mensaje: 'Si hay una cuenta con ese correo, te llegará un enlace para cambiar la contraseña.',
  };
}

/**
 * Comprobación de rol contra el servidor.
 *
 * Existe para que ninguna pantalla se apoye en un booleano guardado. En la
 * versión anterior bastaba con editar `is_admin` en memoria para abrir el
 * panel completo.
 */
export async function confirmarAdmin({ token }) {
  const usuario = await usuarioDeSesion({ token });
  return { esAdmin: usuario ? gestionaContenido(usuario.rol) : false, rol: usuario?.rol ?? null };
}

/* --- Cuentas de ejemplo. Dos academias, para poder probar el aislamiento. --- */

await registrarCuenta({
  correo: 'estudiante@umbral.pe',
  clave: 'admision2027',
  nombre: 'Joel',
  anioNacimiento: new Date().getFullYear() - 18,
  aceptaTerminos: true,
  codigoAcademia: 'RUMBO-2027',
});

await registrarCuenta({
  correo: 'admin@umbral.pe',
  clave: 'catalogo2027',
  nombre: 'Coordinación Rumbo',
  anioNacimiento: new Date().getFullYear() - 30,
  aceptaTerminos: true,
  codigoAcademia: 'RUMBO-PROF',
});
// El dueño se marca en la base de datos, nunca desde una petición.
usuarios.get('admin@umbral.pe').rol = ROLES.DUENO;

// Segunda academia, para que las pruebas de aislamiento tengan contra qué medir.
await registrarCuenta({
  correo: 'coordinacion@sigma.pe',
  clave: 'sigma2027xx',
  nombre: 'Coordinación Sigma',
  anioNacimiento: new Date().getFullYear() - 35,
  aceptaTerminos: true,
  codigoAcademia: 'SIGMA-PROF',
});
usuarios.get('coordinacion@sigma.pe').rol = ROLES.DUENO;

await registrarCuenta({
  correo: 'alumna@sigma.pe',
  clave: 'sigma2027xx',
  nombre: 'Ruth',
  anioNacimiento: new Date().getFullYear() - 17,
  permisoApoderado: true,
  aceptaTerminos: true,
  codigoAcademia: 'SIGMA-2027',
});

export const CUENTA_DEMO = Object.freeze({
  correo: 'estudiante@umbral.pe',
  clave: 'admision2027',
});

export const CUENTA_ADMIN = Object.freeze({
  correo: 'admin@umbral.pe',
  clave: 'catalogo2027',
});

export const CUENTAS_SIGMA = Object.freeze({
  dueno: { correo: 'coordinacion@sigma.pe', clave: 'sigma2027xx' },
  alumna: { correo: 'alumna@sigma.pe', clave: 'sigma2027xx' },
});

export { CODIGOS_DEMO };
