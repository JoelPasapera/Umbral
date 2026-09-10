/**
 * Academias y roles.
 *
 * La regla que gobierna todo el módulo, y que es la diferencia entre un
 * producto vendible y uno que no: **la academia se saca siempre de la sesión,
 * nunca de lo que manda el cliente.** Si viajara en la petición, cualquiera
 * podría leer los alumnos, el contenido y el presupuesto de otra academia
 * cambiando un valor en la consola. Es el fallo que hunde productos B2B.
 *
 * Tres roles, no dos:
 *
 *   alumno   — usa la aplicación
 *   profesor — ve el progreso del grupo, aprueba contenido, gestiona material
 *   dueño    — todo lo del profesor, más usuarios, presupuesto y facturación
 *
 * Un booleano "es administrador" no basta cuando el que paga y el que enseña
 * son personas distintas, que es el caso normal en una academia.
 */

export const ROLES = Object.freeze({
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
  DUENO: 'dueno',
});

const JERARQUIA = { [ROLES.ALUMNO]: 0, [ROLES.PROFESOR]: 1, [ROLES.DUENO]: 2 };

/**
 * ¿Este rol alcanza el nivel exigido?
 * @param {string} rol
 * @param {string} minimo
 */
export const alcanza = (rol, minimo) => (JERARQUIA[rol] ?? -1) >= (JERARQUIA[minimo] ?? 99);

/** Puede entrar al panel de contenido. */
export const gestionaContenido = (rol) => alcanza(rol, ROLES.PROFESOR);

const academias = new Map();
const codigos = new Map();

/**
 * @param {{ id:string, nombre:string, ciudad:string, codigoAlumno:string,
 *           codigoProfesor:string, plan?:string }} datos
 */
export function registrarAcademia(datos) {
  const academia = {
    id: datos.id,
    nombre: datos.nombre,
    ciudad: datos.ciudad,
    plan: datos.plan ?? 'base',
    creada: Date.now(),
  };
  academias.set(academia.id, academia);
  codigos.set(datos.codigoAlumno.toUpperCase(), { academiaId: academia.id, rol: ROLES.ALUMNO });
  codigos.set(datos.codigoProfesor.toUpperCase(), { academiaId: academia.id, rol: ROLES.PROFESOR });
  return academia;
}

/**
 * Resuelve un código de invitación.
 *
 * Los códigos son la puerta: nadie entra a una academia por su cuenta. Es lo
 * que impide que un tercero se registre y vea el material por el que otros
 * pagan, y lo que le da al dueño control sobre quién está dentro.
 *
 * @param {string} codigo
 */
export function resolverCodigo(codigo) {
  const entrada = codigos.get(String(codigo ?? '').trim().toUpperCase());
  if (!entrada) throw new Error('Ese código de academia no es válido. Pídeselo a tu profesor.');
  return { ...entrada, academia: academias.get(entrada.academiaId) };
}

/** @param {string} id */
export function academia(id) {
  const encontrada = academias.get(id);
  if (!encontrada) throw new Error('Esa academia no existe.');
  return { ...encontrada };
}

export const listarAcademias = () => [...academias.values()];

/* --- Academias de ejemplo. Dos, para que el aislamiento se pueda probar. --- */

registrarAcademia({
  id: 'rumbo',
  nombre: 'Academia Rumbo',
  ciudad: 'Lima',
  codigoAlumno: 'RUMBO-2027',
  codigoProfesor: 'RUMBO-PROF',
  plan: 'base',
});

registrarAcademia({
  id: 'sigma',
  nombre: 'Academia Sigma',
  ciudad: 'Arequipa',
  codigoAlumno: 'SIGMA-2027',
  codigoProfesor: 'SIGMA-PROF',
  plan: 'base',
});

export const CODIGOS_DEMO = Object.freeze({
  alumno: 'RUMBO-2027',
  profesor: 'RUMBO-PROF',
});
