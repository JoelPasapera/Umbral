/**
 * Iconos.
 *
 * Trazo, no emojis. Un emoji lo dibuja cada sistema operativo a su manera,
 * cambia de tamaño según la fuente y no puede tomar el color del texto. Estos
 * heredan `currentColor`, así que funcionan igual en modo papel y en noche.
 */

const NS = 'http://www.w3.org/2000/svg';

const TRAZOS = {
  resumen: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M9 12h7', 'M9 16h5'],
  enlace: ['M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1', 'M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1'],
  video: ['M4 5h16v14H4z', 'M10 9l5 3-5 3z'],
  reloj: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
};

/**
 * @param {keyof typeof TRAZOS} nombre
 * @returns {SVGElement}
 */
export function icono(nombre) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  for (const d of TRAZOS[nombre] ?? TRAZOS.enlace) {
    const trazo = document.createElementNS(NS, 'path');
    trazo.setAttribute('d', d);
    svg.append(trazo);
  }
  return svg;
}

export const NOMBRES_ICONO = Object.keys(TRAZOS);
