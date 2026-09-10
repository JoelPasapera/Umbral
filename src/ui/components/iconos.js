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
  libro: ['M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z', 'M8 3v18', 'M12 8h4'],
  examen: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M9 13l2 2 4-4'],
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

/**
 * La "G" de Google.
 *
 * Va aparte del resto porque no es un icono de trazo: son cuatro rutas con los
 * colores de la marca, y usarla con otro color o redibujada incumple las
 * condiciones de uso de "Entrar con Google". Se copia tal cual.
 */
export function iconoGoogle() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 48 48');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'marca-google');

  const rutas = [
    ['#4285F4', 'M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z'],
    ['#34A853', 'M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z'],
    ['#FBBC05', 'M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z'],
    ['#EA4335', 'M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z'],
  ];
  for (const [color, d] of rutas) {
    const ruta = document.createElementNS(NS, 'path');
    ruta.setAttribute('fill', color);
    ruta.setAttribute('d', d);
    svg.append(ruta);
  }
  return svg;
}
