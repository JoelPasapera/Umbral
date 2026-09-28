/**
 * Estados vacíos y de error.
 *
 * Existe como componente compartido porque el patrón aparecía en cuatro
 * pantallas y en tres de ellas el título era un párrafo. Criterio 8.3: cada
 * pantalla necesita un encabezado principal, incluida la que solo dice que
 * algo salió mal.
 *
 * Criterio 5.5 y 5.7: el cuerpo dice qué hacer, no solo qué pasó.
 */

import { el } from '../../core/dom.js';

/**
 * @param {{ titulo: string, cuerpo: string, accion?: { texto: string, href?: string, al?: Function },
 *           principal?: boolean }} opciones
 */
export function estadoVacio({ titulo, cuerpo, accion, principal = true }) {
  const encabezado = el(principal ? 'h1' : 'h2', { clase: 'estado-vacio__titulo', texto: titulo });

  const nodos = [encabezado, el('p', { clase: 'estado-vacio__cuerpo', texto: cuerpo })];

  if (accion) {
    nodos.push(
      accion.href
        ? el('a', { clase: 'boton', texto: accion.texto, attrs: { href: accion.href } })
        : el('button', { clase: 'boton', type: 'button', texto: accion.texto, on: { click: accion.al } }),
    );
  }

  return el('section', { clase: 'estado-vacio' }, nodos);
}

/** @param {string} [mensaje] */
export const vistaDeError = (mensaje = 'No se pudo cargar esta pantalla.') =>
  estadoVacio({
    titulo: mensaje,
    cuerpo: 'Revisa tu conexión y vuelve a intentarlo.',
    accion: { texto: 'Reintentar', al: () => window.location.reload() },
  });
