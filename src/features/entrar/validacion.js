/**
 * Validación del formulario de registro.
 *
 * Vive aparte de la vista para poder probarse sin navegador. Lo que comprueba
 * aquí es lo que el usuario puede corregir sin esperar al servidor: formato,
 * campos vacíos, contraseñas que no coinciden.
 *
 * No sustituye a la validación del servidor. La duplica a propósito: esta
 * evita un viaje de ida y vuelta, la otra es la que manda.
 */

export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * @param {object} datos
 * @returns {{ campo: string, mensaje: string } | null} el primer problema, o null
 */
export function validarRegistro(datos) {
  const correo = String(datos.correo ?? '').trim();
  const clave = String(datos.clave ?? '');
  const repetida = String(datos.claveRepetida ?? '');
  const anio = Number(datos.anioNacimiento);
  const actual = new Date().getFullYear();

  if (!String(datos.codigoAcademia ?? '').trim()) {
    return { campo: 'codigoAcademia', mensaje: 'Escribe el código que te dio tu academia.' };
  }

  if (!correo) return { campo: 'correo', mensaje: 'Escribe tu correo.' };
  if (!CORREO_VALIDO.test(correo)) {
    return { campo: 'correo', mensaje: 'Ese correo no tiene un formato válido.' };
  }

  if (!clave) return { campo: 'clave', mensaje: 'Escribe una contraseña.' };
  if (clave.length < 8) {
    return { campo: 'clave', mensaje: 'La contraseña necesita al menos 8 caracteres.' };
  }

  if (!repetida) {
    return { campo: 'claveRepetida', mensaje: 'Repite la contraseña para confirmarla.' };
  }
  if (clave !== repetida) {
    return { campo: 'claveRepetida', mensaje: 'Las dos contraseñas no coinciden.' };
  }

  if (!datos.anioNacimiento) {
    return { campo: 'anioNacimiento', mensaje: 'Escribe tu año de nacimiento.' };
  }
  if (!Number.isInteger(anio) || anio < 1930 || anio > actual) {
    return { campo: 'anioNacimiento', mensaje: `Escribe un año entre 1930 y ${actual}.` };
  }

  // El nombre tiene que coincidir con el atributo `name` de la casilla en el
  // formulario. Si divergen, nadie puede registrarse y no se nota hasta que
  // alguien lo intenta.
  if (datos.terminos !== true) {
    return {
      campo: 'terminos',
      mensaje: 'Tienes que aceptar los términos y la política de privacidad.',
    };
  }

  return null;
}

/**
 * @param {object} datos
 * @returns {{ campo: string, mensaje: string } | null}
 */
export function validarEntrada(datos) {
  if (!String(datos.correo ?? '').trim()) {
    return { campo: 'correo', mensaje: 'Escribe tu correo.' };
  }
  if (!String(datos.clave ?? '')) {
    return { campo: 'clave', mensaje: 'Escribe tu contraseña.' };
  }
  return null;
}
