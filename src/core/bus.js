/**
 * Bus de eventos. Es el único canal por el que dos funcionalidades pueden
 * hablarse sin conocerse. Si `practicar/` necesita avisar que hubo un intento
 * nuevo, publica un evento; `meta/` lo escucha. Ninguna importa a la otra,
 * y borrar cualquiera de las dos no rompe la que queda.
 */

const oyentes = new Map();

/**
 * @param {string} evento
 * @param {(datos: any) => void} manejador
 * @returns {() => void} función para darse de baja
 */
export function suscribir(evento, manejador) {
  if (!oyentes.has(evento)) oyentes.set(evento, new Set());
  oyentes.get(evento).add(manejador);
  return () => oyentes.get(evento)?.delete(manejador);
}

/**
 * @param {string} evento
 * @param {any} [datos]
 */
export function publicar(evento, datos) {
  for (const manejador of oyentes.get(evento) ?? []) {
    try {
      manejador(datos);
    } catch (error) {
      console.error(`Fallo al manejar "${evento}"`, error);
    }
  }
}

/** Nombres de evento en un solo sitio: así no se escriben mal en silencio. */
export const EVENTOS = Object.freeze({
  SESION_CAMBIO: 'sesion:cambio',
  INTENTO_REGISTRADO: 'practica:intento',
  META_CAMBIADA: 'meta:cambiada',
  RUTA_CAMBIADA: 'router:cambio',
  RED_CAMBIO: 'red:cambio',
});
